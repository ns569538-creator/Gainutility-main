-- Anonymous 1–5 ratings for the flagship "Popular" tools.
-- Mirrors the local schema already present in developer D1 state.
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_slug TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ratings_tool_slug ON ratings (tool_slug);