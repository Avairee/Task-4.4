# UI/UX rescue notes

## User goal

Someone who lost an item needs to scan likely matches quickly. A second student needs to report a found item without accidentally creating a duplicate. At every point, the interface should make the next action and the confidence of the information clear.

The lab notes reinforce the same decision sequence: understand the user's goal, make the primary action obvious, show useful empty and error states, keep controls discoverable on touch and keyboard, and ask AI for options before choosing and verifying a solution.

## Three meaningful problems found

### 1. Filters were not discoverable after use

The original sidebar had an Apply button even though filtering was already live. After a header shortcut or a select change, the user had no visible summary of the active view, no result count beside the controls, and no way to remove one filter without manually resetting every field. This makes a successful search feel uncertain and makes recovery from an over-filtered view slow.

**Change:** filters now say `Live filters`, report the number of matching reports, expose removable active-filter chips above the board, and provide a disabled-aware `Clear all filters` action. Empty columns also offer a clear-filters next step.

### 2. Validation hid the cause of an unsuccessful report

The original form returned one generic `Please review your entries.` message even when the actual problem was a missing category, missing status, too-short title, or a duplicate title/location pair. Users had to guess which field to revisit.

**Change:** validation now marks the exact fields with `aria-invalid`, connects each message with `aria-describedby`, explains duplicate conflicts in title and location, focuses the first invalid field, and keeps the form open so the user can recover without losing input.

### 3. Report state and handover confidence were easy to misread

The original cards showed category and an unlabeled metadata sentence. A found item held by staff and a found item that had only been reported looked too similar, and the meaning of `claimed` was only visible in prose.

**Change:** each card now has a visible Lost, Found, or Claimed badge. Found reports use a distinct handover panel with explicit states: `Ready to recover`, `Reported only`, or `Reunited`, plus the collection point or the reason the item is not yet confirmed.

## AI design suggestion considered

AI suggested moving all filters into a modal or mobile drawer. That would reduce desktop density, but it would hide the most common search controls and add an extra step to the core "find a match" task. I kept the existing sidebar for desktop, added a live result summary and removable chips, and retained the same controls at mobile widths. This preserves capability while improving discoverability and recovery.

## Preserved behavior

- Search, category filtering, status filtering, header shortcuts, reset demo data, create, edit-own-report, localStorage persistence, duplicate prevention, and found-item handover metadata remain supported.
- Reports are still not automatically treated as held by staff; only received reports show a recovery point.
- The current signed-in user remains `You` and reports by other students remain read-only.

## Verification

- `npm.cmd run build` passes with Vite 5.4.21.
- The production preview renders the board with 13 seed reports, live filter count, explicit status badges, and handover panels.
- Before and after board captures are included in `screenshots/before.png` and `screenshots/after.png`.
- Manual scenario coverage: browse a match, switch to Recently found, search for `blue`, clear one active filter, open the report form and submit it empty, then correct the highlighted fields; duplicate title/location remains blocked.
