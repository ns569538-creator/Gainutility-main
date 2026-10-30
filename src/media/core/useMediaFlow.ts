/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useMediaFlow — the single state machine every media tool reuses.
 *
 * Owns the EMPTY → FILE_SELECTED → ANALYZING → MEDIA_FOUND →
 * GOAL_SELECTION → CONFIGURING → PROCESSING → VERIFYING → SUCCESS/ERROR flow.
 *
 * Tool screens are thin: they call startProcessing(engine, goal, options)
 * passing a real engine function. All shared behaviour (analysis, goal picker,
 * processing, verification, result) lives here once.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MediaFile,
  MediaFlowState,
  MediaGoalId,
  MediaMetadata,
  MediaCapabilities,
  MediaResult,
  MediaErrorInfo,
} from "./types";

export type EngineProgress = { onProgress?: (fraction: number | null, note?: string) => void };

/** Signature every real media operation must satisfy. */
export type MediaEngine = (
  file: MediaFile,
  options: Record<string, any>,
  progress: EngineProgress,
  signal: AbortSignal
) => Promise<MediaResult>;

export interface UseMediaFlowOptions {
  onProgress?: (fraction: number | null, note?: string) => void;
  onSuccess?: (result: MediaResult, inputSize: number) => void;
  onError?: (error: MediaErrorInfo) => void;
  onAnalyze?: (
    file: MediaFile,
    resolve: (metadata: MediaMetadata, capabilities: MediaCapabilities) => void,
    reject: (message: string) => void
  ) => void;
}

export interface UseMediaFlowResult {
  state: MediaFlowState;
  setFile: (file: MediaFile | null) => void;
  setMediaFound: (file: MediaFile, metadata: MediaMetadata, capabilities: MediaCapabilities) => void;
  startAnalysis: () => void;
  pickGoal: (goal: MediaGoalId) => void;
  startProcessing: (engine: MediaEngine, goal: MediaGoalId, options: Record<string, any>) => Promise<void>;
  reset: () => void;
  cancel: () => void;
  progress: number | null;
  note?: string;
}

export const useMediaFlow = (opts: UseMediaFlowOptions = {}): UseMediaFlowResult => {
  const [state, setState] = useState<MediaFlowState>({ kind: "empty" });
  const [progress, setProgress] = useState<number | null>(null);
  const [note, setNote] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<MediaFlowState>({ kind: "empty" });
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setFile = useCallback((file: MediaFile | null) => {
    abortRef.current?.abort();
    abortRef.current = null;
    setProgress(null);
    setNote(undefined);
    setState(file ? { kind: "file-selected", file } : { kind: "empty" });
  }, []);

  /**
   * Link-first entry point: a link fetch produced a real MediaFile that has
   * already been inspected. Jump straight to the goal workspace.
   */
  const setMediaFound = useCallback(
    (file: MediaFile, metadata: MediaMetadata, capabilities: MediaCapabilities) => {
      abortRef.current?.abort();
      abortRef.current = null;
      setProgress(null);
      setNote(undefined);
      setState({ kind: "media-found", file, metadata, capabilities });
    },
    []
  );

  const startAnalysis = useCallback(() => {
    // Only analyse once we actually have a file selected.
    if (stateRef.current.kind !== "file-selected") return;
    const file = stateRef.current.file;
    setProgress(null);
    setNote("Analyzing this file…");
    setState({ kind: "analyzing", file });
    if (opts.onAnalyze) {
      opts.onAnalyze(
        file,
        (metadata, capabilities) => {
          setState({ kind: "media-found", file, metadata, capabilities });
          setProgress(null);
          setNote(undefined);
        },
        (message) => {
          setState({
            kind: "error",
            error: { message, retryable: true },
          });
        }
      );
    }
  }, [opts]);

  const pickGoal = useCallback((goal: MediaGoalId) => {
    const cur = stateRef.current;
    if (cur.kind !== "media-found" && cur.kind !== "goal-selection") return;
    setState({ kind: "configuring", goal, file: cur.file, metadata: cur.metadata, capabilities: cur.capabilities });
  }, []);

  const emitProgress = useCallback((fraction: number | null, noteText?: string) => {
    setProgress(fraction);
    if (noteText !== undefined) setNote(noteText);
    opts.onProgress?.(fraction, noteText);
  }, [opts]);

  const startProcessing = useCallback(
    async (engine: MediaEngine, goal: MediaGoalId, options: Record<string, any>) => {
      const cur = stateRef.current;
      if (cur.kind !== "configuring" && cur.kind !== "media-found" && cur.kind !== "goal-selection") {
        return;
      }
      const file = cur.file;
      const metadata = cur.kind === "configuring" ? cur.metadata : undefined;
      const capabilities = cur.kind === "configuring" ? cur.capabilities : undefined;
      const inputSize = file.size;

      const controller = new AbortController();
      abortRef.current = controller;

      setState({ kind: "processing", goal, progress: 0, note: undefined });
      setProgress(0);
      emitProgress(0, "Preparing…");

      try {
        const result = await engine(file, options, { onProgress: emitProgress }, controller.signal);
        setState({ kind: "success", goal, result, inputSize, inputMetadata: metadata });
        setProgress(1);
        emitProgress(1);
        opts.onSuccess?.(result, inputSize);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          setState({ kind: "media-found", file, metadata: metadata ?? cur.metadata, capabilities: capabilities ?? cur.capabilities });
          setProgress(null);
          opts.onError?.({ message: "Processing was cancelled.", retryable: true });
          return;
        }
        setState({
          kind: "error",
          error: { message: err?.message || "Something went wrong while processing.", retryable: true },
        });
        setProgress(null);
        opts.onError?.({ message: err?.message || "Something went wrong while processing.", retryable: true });
      } finally {
        abortRef.current = null;
      }
    },
    [emitProgress, opts]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setProgress(null);
    setNote(undefined);
    setState({ kind: "empty" });
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { state, setFile, setMediaFound, startAnalysis, pickGoal, startProcessing, reset, cancel, progress, note };
};
