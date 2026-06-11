# Mobile UX Improvement Plan

Based on code audit + the screenshot provided. All changes are frontend only.

---

## What's already working well
- Layout.module.css correctly hides sidebar and shows BottomNav below 768px
- Safe-area inset (`env(safe-area-inset-bottom)`) already in BottomNav for iPhone notch
- Dark theme, font sizes, and basic spacing are reasonable

---

## Issues Found + Fixes

---

### 1. Bottom Nav is missing Notifications and Requests (HIGH — visible in screenshot)

**Current items:** Home · Assistant · Schedule · Calendar · Slots  
**Problem:** Notifications (has a badge!) and Requests are completely unreachable on mobile without the sidebar. Home just redirects to Dashboard; Slots is low-frequency.

**Fix — swap two low-frequency items for high-frequency ones:**

| Position | Before | After |
|----------|--------|-------|
| 1 | Home | Assistant (chat) |
| 2 | Assistant | Schedule |
| 3 | Schedule | Requests |
| 4 | Calendar | Notifications + badge |
| 5 | Slots | More (→ Calendar, Slots, Dashboard) |

"More" taps open a small slide-up sheet with the remaining links (Calendar, Free Slots, Dashboard, Memory). This is the standard mobile pattern (like Instagram's "+" or Google Maps).

**Files:** `BottomNav.jsx`, `BottomNav.module.css` — add a new `MoreSheet` component.

---

### 2. Numbered list options in chat are not tappable (HIGH — major UX gap)

**Current behavior:** When the agent responds with a numbered list like:
```
You already have a meeting scheduled with Sivateja at 5:23 PM today. Would you like to:

1. Keep both (create the new one too)
2. Reschedule the existing meeting
3. Cancel this request
```
These render as a plain `<ol>` list. The user has to **manually type "1", "2", or "3"** to respond. On mobile this means opening the keyboard and typing a number — terrible UX.

**Fix — detect and render numbered choices as quick-reply buttons:**

In `ChatMessage.jsx`, in the `ProseBlock` renderer, detect when the **last block** in an assistant message is a numbered list with ≤ 6 items. Render those items as tappable pill buttons below the message. Tapping a button auto-fills the input with that number and sends it.

Visual design:
```
[1. Keep both]   [2. Reschedule]   [3. Cancel request]
```
Gold outlined pills, horizontal scroll if they overflow. Each pill shows the full option text (truncated at ~30 chars with ellipsis on very long text).

**Files:** `ChatMessage.jsx`, `ChatMessage.module.css` — add `QuickReplyButtons` component + a callback prop `onQuickReply`.  
**Also:** `Assistant.jsx` — pass `handleSend` down as `onQuickReply` to `ChatMessage`.

---

### 3. Notification badge missing on BottomNav (HIGH)

**Current:** The sidebar shows `Notifications (1)` badge. BottomNav has no badge system.

**Fix:** Import `useNotifications` context in `BottomNav.jsx`. Show a small red dot/count on the Notifications icon when `unreadCount > 0`.

**Files:** `BottomNav.jsx`, `BottomNav.module.css` — add `.badge` dot overlay on the Notifications icon.

---

### 4. Chat input hint text is desktop-only (MEDIUM)

**Current:** `"Enter to send · Shift+Enter for new line · 🎤 mic for voice"`  
**Problem:** On mobile, "Enter to send" and "Shift+Enter" are meaningless — mobile keyboards don't work that way.

**Fix:** Detect mobile viewport and show different hint:
- Desktop: current text unchanged
- Mobile (≤768px): `"Tap send · Use 🎤 for voice input"`

**Files:** `ChatInput.jsx` — add a `useMediaQuery` check or CSS approach via `ChatInput.module.css` with responsive hint visibility.

---

### 5. Chat header takes too much vertical space on mobile (MEDIUM)

**Current:** The "PEA Assistant" header + status row + avatar takes ~64px at the top of the chat page. On a 667px phone, that's ~10% of the screen.

**Fix:** On mobile (≤768px), compact the header:
- Reduce padding to `10px 16px`
- Shrink avatar from current size to 32px
- Reduce title font size from current to `1rem`
- Keep status dot + label in one line

**Files:** `Assistant.module.css` — add mobile media query for `.header`, `.avatar`, `.title`.

---

### 6. Touch targets too small in several places (MEDIUM)

Minimum recommended touch target: **44×44px**. Found violations:

| Element | Current | Fix |
|---------|---------|-----|
| BottomNav items | ~52px height total but inner tap area is `flex: 1` with margin — actual ~40px | Increase `.nav` height to 68px on mobile or remove margin |
| Mic button in ChatInput | Small (no explicit size) | Ensure `min-width: 44px; min-height: 44px` |
| Chat send button | Likely fine but unverified | Audit |
| Notification "mark read" links | Small text links | Change to full-width buttons on mobile |

**Files:** `BottomNav.module.css`, `ChatInput.module.css`

---

### 7. Schedule page — meeting cards need larger tap targets (MEDIUM)

Looking at the screenshot and the existing schedule page, meeting/task cards should have:
- Minimum `padding: 14px 16px` on mobile
- Complete/cancel actions visible (not hidden in overflow menus)
- Clear visual separation between cards

**Files:** `Schedule.module.css` — audit and add mobile padding.

---

### 8. The Schedule icon in BottomNav is wrong (LOW — cosmetic)

**Current:** `PlusIcon` (a calendar-with-plus icon) is used for "Schedule" — the icon function is named `PlusIcon` but the SVG is a calendar-with-plus. The actual Schedule page is a list view, not a creation page. Users may expect tapping "Schedule" to create something.

**Fix:** Rename the icon to `ScheduleIcon` and optionally replace with a plain calendar/list icon for clarity.

**Files:** `BottomNav.jsx`

---

### 9. "More" sheet — slide-up overlay (needed for Fix #1) (MEDIUM)

A new component `MoreSheet.jsx` for the overflow nav items. Pattern:
- Semi-transparent dark overlay covers screen
- Sheet slides up from bottom with `animation: slideUp`
- Contains: Dashboard, Calendar, Free Slots, Memory
- Tapping overlay or any link closes it
- Uses existing `--bg-secondary`, `--accent` theme vars

**Files:** New `src/components/Layout/MoreSheet.jsx` + `MoreSheet.module.css`

---

## Implementation Order

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Quick-reply buttons in chat | Medium | Very High |
| 2 | Bottom nav restructure + badge | Medium | High |
| 3 | MoreSheet component | Small | High (needed for #2) |
| 4 | Notification badge on nav | Small | High |
| 5 | Chat header compact on mobile | Small | Medium |
| 6 | Touch target fixes | Small | Medium |
| 7 | Chat hint text (mobile-aware) | Tiny | Low |
| 8 | Schedule card padding | Tiny | Low |
| 9 | Fix Schedule icon name | Tiny | Cosmetic |

**Suggested order to implement:** #3 → #2 → #4 → #1 → #5 → #6 → #7 → #8 → #9

---

## What is NOT changing

- Global color theme / dark olive design — looks great as-is
- Desktop layout (sidebar + main) — untouched
- Any backend API
- Chat message rendering for non-numbered-list content
- Animation keyframes and transitions
- UserSetup / login / register pages (separate concern)
