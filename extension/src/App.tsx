import { useEffect, useState } from "react";
import {
  ALL_TOOLS,
  CATEGORY_LIST,
  QUICK_TOOLS,
  searchTools,
  toolUrl,
} from "./data";
import { getRecent, openTool, type RecentEntry } from "./storage";

function Glyph({ id, active }: { id: string; active: boolean }) {
  const letter = (id[0] || "G").toUpperCase();
  return (
    <span
      className={`glyph ${active ? "glyph--active" : ""}`}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}

function ToolRow({
  id,
  name,
  desc,
  active,
}: {
  id: string;
  name: string;
  desc: string;
  active: boolean;
}) {
  return (
    <button
      type="button"
      className="tool-row"
      onClick={() => void openTool(id, name)}
    >
      <Glyph id={id} active={active} />
      <span className="tool-row__text">
        <span className="tool-row__name">{name}</span>
        <span className="tool-row__desc">{desc}</span>
      </span>
      <span className="tool-row__arrow" aria-hidden="true">
        ↗
      </span>
    </button>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    void getRecent().then(setRecent);
  }, []);

  const searching = query.trim().length > 0;
  const results = searching ? searchTools(query) : [];

  const visibleCategory = category ?? (CATEGORY_LIST[0] ?? null);
  const categoryTools = ALL_TOOLS.filter(
    (t) => t.category === visibleCategory
  ).slice(0, 12);

  return (
    <div className="popup">
      <header className="header">
        <div className="brand">
          <img src="icons/icon32.png" alt="" className="brand__logo" />
          <div className="brand__text">
            <span className="brand__title">GainUtility</span>
            <span className="brand__tag">Free online tools</span>
          </div>
        </div>
      </header>

      <div className="search">
        <span className="search__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          className="search__input"
          type="search"
          placeholder="Search tools…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {searching && results.length === 0 && (
          <span className="search__empty">No match</span>
        )}
      </div>

      {searching ? (
        <div className="section">
          <h2 className="section__title">
            {results.length ? "Results" : "No results"}
          </h2>
          {results.length === 0 ? (
            <p className="muted">
              No tools match “{query.trim()}”. Try “PDF”, “resize” or “SEO”.
            </p>
          ) : (
            <div className="list">
              {results.map((t) => (
                <ToolRow
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  desc={t.desc}
                  active={t.id === recent[0]?.id}
                />
              ))}
            </div>
          )}
          {recent.length > 0 && (
            <p className="hint">
              <a href={toolUrl(recent[0].id)} target="_blank" rel="noreferrer">
                Open in tab
              </a>
            </p>
          )}
        </div>
      ) : (
        <>
          {recent.length > 0 && (
            <div className="section">
              <h2 className="section__title">Recently used</h2>
              <div className="chips">
                {recent.map((r) => (
                  <button
                    key={r.id}
                    className="chip"
                    type="button"
                    onClick={() => void openTool(r.id, r.name)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="section">
            <h2 className="section__title">Quick tools</h2>
            <div className="list list--grid">
              {QUICK_TOOLS.slice(0, 6).map((t) => (
                <ToolRow
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  desc=""
                  active={t.id === recent[0]?.id}
                />
              ))}
            </div>
          </div>

          <div className="section">
            <div className="tabs" role="tablist" aria-label="Categories">
              {CATEGORY_LIST.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={c === visibleCategory}
                  className={`tab ${c === visibleCategory ? "tab--on" : ""}`}
                  type="button"
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="list">
              {categoryTools.map((t) => (
                <ToolRow
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  desc=""
                  active={t.id === recent[0]?.id}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <footer className="footer">
        <a
          href="https://gainutility.com"
          target="_blank"
          rel="noreferrer"
          className="footer__link"
        >
          Open GainUtility →
        </a>
      </footer>
    </div>
  );
}
