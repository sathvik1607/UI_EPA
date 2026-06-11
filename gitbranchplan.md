# Git Branch Plan

## Branches

| Branch | Remote | Purpose |
|--------|--------|---------|
| `main` | `origin/main` | Primary development branch |
| `working-version-v1` | `origin/working-version-v1` | Stable snapshot — working code with viewable today event in sidebar |
| `woking-verison_v1` | — | **← current** · Local only (typo branch, no remote) |

## Branch: `working-version-v1`

**Created:** from `main`  
**Pushed to:** `https://github.com/sathvik1607/UI_EPA`  
**Commit:** `"working code with viewable today event"`

### What's included in this snapshot

- API fallback: `VITE_API_URL` splits on comma — primary → fallback on network error, sticks for session
- Axios timeout bumped to **90 s** (Render free-tier cold-start tolerance)
- Login UX: "Waking up server…" pulsing hint appears after 4 s of loading
- **4 mobile UI fixes:**
  - `EventCard` title: 2-line clamp instead of single-line truncation
  - `EventCard` attendees: wrap below body on screens < 480 px
  - `FreeSlots` grid: 1-col (default) → 2-col (≥ 440 px) → 3-col (≥ 600 px)
  - `Schedule` badge: added `scheduled` status label + CSS class
- Sidebar Today panel: event title horizontally scrollable (time stays pinned)

## Workflow going forward

```
main                  ← ongoing development
  └── working-version-v1   ← stable checkpoint, do not force-push
```

Cut a new `working-version-v2` (or similar) from `main` when the next stable milestone is reached.
