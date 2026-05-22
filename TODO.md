# TODO — Frontend UI Refactor (backend-safe)

## Step 1: Create a UI design system layer
- [x] Add `frontend/src/ui/` primitives: `Button`, `Input`, `Select`, `Card`, `Badge`, `Spinner`, `ModalShell`, `Layout`.

- [ ] Ensure primitives are purely presentational (no API logic changes).

## Step 2: Refactor app layout & shell
- [ ] Refactor `frontend/src/App.jsx` to use layout primitives and consistent spacing/typography.
- [ ] Keep existing routing/view logic intact.
- [ ] Refactor header/footer into small layout components (optional, but prefer consistency).

## Step 3: Refactor major UI components (presentation-only)
- [ ] `SearchDashboard.jsx` UI polish + consistent form controls.
- [ ] `BusResultCard.jsx` UI polish.
- [ ] `SeatSelector.jsx` UI polish (seat grid styling only).
- [ ] `PassengerForm.jsx` UI polish.
- [ ] `ScheduleManifest.jsx` UI polish.
- [ ] `UserProfile.jsx` UI polish.
- [ ] `AuthModal.jsx`, `Toast.jsx`, `ErrorBoundary.jsx` consistency.
- [ ] `OperatorDashboard.jsx` unify styles with the new design system.

## Step 4: Global styles cleanup
- [ ] Update `frontend/src/index.css` to avoid overly broad selectors that can break new UI.
- [ ] Ensure theme colors/radius/shadows are consistent.

## Step 5: Build & smoke test
- [ ] Run `npm run dev` and manually verify key flows.
- [ ] Run `npm run build` to ensure compilation succeeds.

