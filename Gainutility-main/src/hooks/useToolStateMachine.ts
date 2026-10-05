/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Universal Tool State Machine
 * 
 * Provides a consistent state management pattern for all tools:
 * EMPTY → INPUT → CONFIG → PROCESSING → RESULT → ACTION
 * 
 * This ensures every tool follows the same user journey and
 * enables consistent analytics, error handling, and UI patterns.
 */

import { useState, useCallback, useEffect, useMemo } from "react";

export type ToolState = 
  | "empty"           // No input yet
  | "input"           // User has provided input (files, text, etc.)
  | "config"          // User is adjusting settings
  | "processing"      // Tool is actively processing
  | "result"          // Processing complete, results available
  | "error";          // Processing failed

export interface ToolStateMachineConfig<TInput, TConfig, TResult> {
  /** Validate input before transitioning to config state */
  validateInput?: (input: TInput) => { valid: boolean; error?: string };
  /** Validate config before processing */
  validateConfig?: (config: TConfig) => { valid: boolean; error?: string };
  /** Async processing function */
  process: (input: TInput, config: TConfig) => Promise<TResult>;
  /** Called when state changes */
  onStateChange?: (state: ToolState, prevState: ToolState) => void;
  /** Called on processing error */
  onError?: (error: Error, state: ToolState) => void;
  /** Called on successful result */
  onResult?: (result: TResult) => void;
}

export interface ToolStateMachineReturn<TInput, TConfig, TResult> {
  /** Current state */
  state: ToolState;
  /** User input (files, text, etc.) */
  input: TInput | null;
  /** Current configuration */
  config: TConfig | null;
  /** Processing result */
  result: TResult | null;
  /** Error if any */
  error: Error | null;
  /** Processing progress (0-100) */
  progress: number;
  /** Set user input */
  setInput: (input: TInput) => void;
  /** Update configuration */
  setConfig: (config: Partial<TConfig> | TConfig) => void;
  /** Start processing */
  process: () => Promise<void>;
  /** Reset to empty state */
  reset: () => void;
  /** Clear error and return to config state */
  retry: () => void;
  /** Whether processing is active */
  isProcessing: boolean;
  /** Whether results are available */
  hasResult: boolean;
  /** Whether in a terminal state (result or error) */
  isTerminal: boolean;
}

/**
 * Universal tool state machine hook.
 * Manages the complete tool lifecycle: empty → input → config → processing → result/error
 */
export function useToolStateMachine<TInput, TConfig extends Record<string, any>, TResult>(
  defaultConfig: TConfig,
  config: ToolStateMachineConfig<TInput, TConfig, TResult>
): ToolStateMachineReturn<TInput, TConfig, TResult> {
  const [state, setState] = useState<ToolState>("empty");
  const [input, setInputState] = useState<TInput | null>(null);
  const [toolConfig, setConfigState] = useState<TConfig>(defaultConfig);
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const prevStateRef = useState<ToolState>("empty");
  const prevState = prevStateRef[0];
  const setPrevState = prevStateRef[1];

  const transitionTo = useCallback((newState: ToolState) => {
    setPrevState(state);
    setState(newState);
    config.onStateChange?.(newState, state);
  }, [state, config]);

  const setInput = useCallback((newInput: TInput) => {
    setInputState(newInput);
    
    // Validate input if validator provided
    if (config.validateInput) {
      const validation = config.validateInput(newInput);
      if (!validation.valid) {
        const err = new Error(validation.error || "Invalid input");
        setError(err);
        transitionTo("error");
        return;
      }
    }
    
    setError(null);
    // Move to config state when input is provided
    if (state === "empty" || state === "error") {
      transitionTo("input");
    }
  }, [state, config, transitionTo]);

  const setConfig = useCallback((configUpdate: Partial<TConfig> | TConfig | ((prev: TConfig) => TConfig)) => {
    setConfigState(prev => {
      const newConfig = typeof configUpdate === "function" 
        ? configUpdate(prev) 
        : { ...prev, ...configUpdate };
      
      // Validate config if validator provided
      if (config.validateConfig) {
        const validation = config.validateConfig(newConfig);
        if (!validation.valid) {
          // Don't update config if invalid
          return prev;
        }
      }
      
      return newConfig;
    });
    
    // If we have input and are in input state, move to config
    if (input && state === "input") {
      transitionTo("config");
    }
  }, [input, state, config, transitionTo]);

  const process = useCallback(async () => {
    if (!input) {
      const err = new Error("No input provided");
      setError(err);
      transitionTo("error");
      return;
    }

    // Validate config before processing
    if (config.validateConfig) {
      const validation = config.validateConfig(toolConfig);
      if (!validation.valid) {
        const err = new Error(validation.error || "Invalid configuration");
        setError(err);
        transitionTo("error");
        return;
      }
    }

    setError(null);
    transitionTo("processing");
    setProgress(0);

    try {
      const processResult = await config.process(input, toolConfig);
      setResult(processResult);
      setProgress(100);
      transitionTo("result");
      config.onResult?.(processResult);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setProgress(0);
      transitionTo("error");
      config.onError?.(error, "processing");
    }
  }, [input, toolConfig, config, transitionTo]);

  const reset = useCallback(() => {
    setInputState(null);
    setConfigState(defaultConfig);
    setResult(null);
    setError(null);
    setProgress(0);
    transitionTo("empty");
  }, [defaultConfig, transitionTo]);

  const retry = useCallback(() => {
    setError(null);
    if (input) {
      transitionTo("config");
    } else {
      transitionTo("empty");
    }
  }, [input, transitionTo]);

  const isProcessing = state === "processing";
  const hasResult = state === "result";
  const isTerminal = state === "result" || state === "error";

  return {
    state,
    input,
    config: toolConfig,
    result,
    error,
    progress,
    setInput,
    setConfig,
    process,
    reset,
    retry,
    isProcessing,
    hasResult,
    isTerminal
  };
}

/**
 * Hook for managing multiple file inputs with the state machine
 */
export function useFileInputStateMachine<TConfig extends Record<string, any>, TResult>(
  defaultConfig: TConfig,
  config: ToolStateMachineConfig<File[], TConfig, TResult>
) {
  const machine = useToolStateMachine<File[], TConfig, TResult>(defaultConfig, config);

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    machine.setInput(fileArray);
  }, [machine]);

  const removeFile = useCallback((index: number) => {
    if (machine.input) {
      const newFiles = machine.input.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        machine.reset();
      } else {
        machine.setInput(newFiles);
      }
    }
  }, [machine]);

  const clearFiles = useCallback(() => {
    machine.reset();
  }, [machine]);

  return {
    ...machine,
    addFiles,
    removeFile,
    clearFiles,
    files: machine.input || [],
    fileCount: machine.input?.length || 0
  };
}

/**
 * Hook for managing text input with the state machine
 */
export function useTextInputStateMachine<TConfig extends Record<string, any>, TResult>(
  defaultConfig: TConfig,
  config: ToolStateMachineConfig<string, TConfig, TResult>
) {
  const machine = useToolStateMachine<string, TConfig, TResult>(defaultConfig, config);

  const setText = useCallback((text: string) => {
    machine.setInput(text);
  }, [machine]);

  const clearText = useCallback(() => {
    machine.reset();
  }, [machine]);

  return {
    ...machine,
    setText,
    clearText,
    text: machine.input || ""
  };
}

export default useToolStateMachine;