# Golfinity Connect - AI Execution Plan

## Goal
Close all implementation gaps between `/design` screens and the current app, with focus on:
- visual parity,
- real interaction flows,
- removing placeholder-only actions,
- keeping TypeScript/build green after each milestone.

## Rules of Execution
- After each step: run `npm -w apps/mobile exec tsc --noEmit`.
- Do not break existing implemented flows (round creation/scoring/order checkout).
- Prefer real navigation/data behavior over `Alert` placeholders where API support exists.
- If backend support is missing, add minimal API endpoint + hook first, then wire UI.

## Phase 1 - Core High-Impact UX Gaps

### 1. Scorecard parity (screen 5)
**Files likely touched**
- `apps/mobile/src/screens/ScorecardScreen.tsx`

**Tasks**
- Add `Front 9 / Back 9` segmented toggle.
- Add `Gross / Net` segmented toggle (Net can be derived/mock until handicap logic is ready).
- Add `Turn House Ordering` card with `Order Now` CTA -> navigate to `Order` tab.
- Add floating drink/cart action button per design style.

**Acceptance**
- User can switch Front/Back and Gross/Net in UI.
- `Order Now` and floating action are clickable and navigate correctly.

### 2. Leaderboard parity (screen 6)
**Files likely touched**
- `apps/mobile/src/screens/SocialScreen.tsx`

**Tasks**
- Add back button in header.
- Add Gross/Net toggle state and row value switching.
- Add row trend text/icons and `YOU` badge on current user row.
- Add bottom `Order Refreshments / View Menu` CTA card -> navigate to `Order`.

**Acceptance**
- Toggle updates displayed scoring mode.
- Bottom CTA and header controls are fully clickable.

### 3. Player Selection missing interactions (screen 3)
**Files likely touched**
- `apps/mobile/src/screens/PlayerSelectionScreen.tsx`

**Tasks**
- Add `Scan Player QR` action button (initial behavior: open helper modal/alert; next can use camera route).
- Add empty flight slot cards matching design.
- Keep max 4 players enforcement and selected count sync.

**Acceptance**
- Screen visually includes scan button + empty slots.
- All controls respond to tap.

### 4. Home missing promo + navigation parity (screen 1)
**Files likely touched**
- `apps/mobile/src/screens/HomeScreen.tsx`

**Tasks**
- Add `Feeling Hungry? / Order F&B` promo card and CTA to `Order`.
- Add recent-round thumbnail image in card.
- Keep `See All`, `Register`, notification actions as real flows.

**Acceptance**
- Promo section exists and CTA navigates to order menu.
- Recent round card is data-driven and interactive.

## Phase 2 - Data/Backend support for real actions

### 5. Event registration real flow
**Files likely touched**
- `apps/api/src/events/*`
- `apps/mobile/src/api/hooks.ts`
- `apps/mobile/src/screens/HomeScreen.tsx`

**Tasks**
- Add minimal event registration endpoint (user-event join).
- Add mobile mutation hook.
- Replace local `registeredEventId` only-state with API-backed state.

**Acceptance**
- Registration survives app refresh.
- Button reflects registered state from server.

### 6. Notifications minimal real flow
**Files likely touched**
- `apps/api/src` (new `notifications` module if needed)
- `apps/mobile/src/screens` (new screen or Social reuse)

**Tasks**
- Add simple notifications list endpoint seeded with dev data.
- Route bell button to notifications view (or dedicated section).

**Acceptance**
- Bell opens a real list, not placeholder behavior.

## Phase 3 - Visual/Feature completion

### 7. Order Status detailed timeline parity (screen 8)
**Files likely touched**
- `apps/mobile/src/screens/OrderStatusScreen.tsx`

**Tasks**
- Add `Track Updates` timeline block.
- Add order id/status strip and location card section.
- Keep existing auto-status progression.

### 8. Round Summary chart + deltas (screen 9)
**Files likely touched**
- `apps/mobile/src/screens/RoundSummaryScreen.tsx`

**Tasks**
- Add scoring distribution chart block.
- Add metric deltas vs average.
- Improve reorder CTA context text from real previous order if available.

### 9. Hole Map advanced controls (screen 10)
**Files likely touched**
- `apps/mobile/src/screens/HoleMapScreen.tsx`

**Tasks**
- Add zoom +/-, compass controls.
- Improve map visuals/path overlay.
- Keep `2D/3D` toggle behavior and return-to-score flow.

## Verification Checklist (run after each phase)
- `npm -w apps/mobile exec tsc --noEmit`
- Manual tap test for all visible buttons on touched screens.
- Confirm no navigation dead-ends.
- Confirm no placeholder-only critical CTA in completed phase scope.

## Suggested Commit Strategy
- Commit 1: Phase 1 (UI interaction parity)
- Commit 2: Phase 2 (API-backed actions)
- Commit 3: Phase 3 (advanced visual/detail parity)
