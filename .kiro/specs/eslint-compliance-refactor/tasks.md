# Implementation Plan: ESLint Compliance Refactor

## Overview

Systematic elimination of all 4,390 ESLint problems across ~200 source files in `hospital.client/src/`. The work is organized into 10 sequential phases ordered by automation potential and dependency — auto-fixable formatting first, then mechanical rule fixes, then structural refactors. Each phase produces a buildable, functional codebase. All commands run from the `hospital.client/` directory.

## Tasks

- [x] 1. Phase 1 — Auto-fix Prettier formatting (~3,430 errors)
  - [x] 1.1 Run `npx eslint . --fix` from `hospital.client/` to auto-fix all `prettier/prettier` violations across all `.ts` and `.tsx` files
    - This resolves ~78% of all problems in a single automated pass
    - Verify no new errors are introduced by the auto-fix
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Run `npm run lint` and verify `prettier/prettier` error count is zero; manually fix any remaining formatting issues that `--fix` could not resolve
    - _Requirements: 1.1_

- [x] 2. Phase 2 — Prop sorting and boolean shorthand (~263 violations)
  - [x] 2.1 Run `npx eslint . --fix --rule '{"react/jsx-sort-props": "warn"}'` to auto-fix `react/jsx-sort-props` violations
    - Props must be ordered: reserved first (`key`, `ref`), shorthand booleans second, alphabetical, callbacks last
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 2.2 Fix all `react/jsx-boolean-value` errors by replacing `prop={true}` with shorthand `prop` across all affected files
    - _Requirements: 8.2_
  - [x] 2.3 Run `npm run lint` and confirm zero `react/jsx-sort-props` and `react/jsx-boolean-value` violations remain
    - _Requirements: 4.1, 8.2_

- [x] 3. Phase 3 — Leaked render fixes (~142 errors)
  - [x] 3.1 Fix `react/jsx-no-leaked-render` violations in components under `src/components/`
    - Replace `{value && <Component />}` with `{!!value && <Component />}` or ternary `{value ? <Component /> : null}`
    - For array length checks, use `{items.length > 0 && <Component />}`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 3.2 Fix `react/jsx-no-leaked-render` violations in pages under `src/pages/`
    - Apply the same boolean coercion or ternary patterns
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 3.3 Fix `react/jsx-no-leaked-render` violations in containers and any remaining files under `src/`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 3.4 Run `npm run lint` and confirm zero `react/jsx-no-leaked-render` errors remain
    - _Requirements: 5.1_

- [x] 4. Phase 4 — Read-only props (~72 errors)
  - [x] 4.1 Add `readonly` modifier to all prop interface and type properties in `src/components/`
    - For named interfaces: `interface Props { readonly title: string; readonly onClick: () => void; }`
    - For inline types: add `readonly` to each property in the inline type
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 4.2 Add `readonly` modifier to all prop interface and type properties in `src/pages/` and `src/containers/`
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 4.3 Run `npm run lint` and confirm zero `react/prefer-read-only-props` errors remain; run `tsc -b` to verify no TypeScript compilation errors
    - _Requirements: 6.1, 10.1_

- [x] 5. Checkpoint — Verify phases 1–4
  - Ensure `npm run lint` shows significant reduction in errors (Prettier, prop sorting, leaked renders, read-only props all at zero). Run `tsc -b` to confirm no TypeScript errors. Ask the user if questions arise.

- [ ] 6. Phase 5 — jsx-no-bind / useCallback refactoring (~235 errors)
  - [x] 6.1 Refactor simple inline arrow functions in `src/components/` to `useCallback`-wrapped handlers
    - Pattern A: `<Button onClick={() => setOpen(true)}>` → extract `const handleOpen = useCallback(() => setOpen(true), []);`
    - Include all referenced variables in `useCallback` dependency arrays
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 6.2 Refactor inline arrow functions in `src/pages/` — simple handlers and state toggles
    - Extract each inline handler to a named `useCallback` variable above the JSX return
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 6.3 Refactor curried handler patterns (Pattern B) in form components
    - Replace `handleTextChange("fieldName")` curried patterns with explicit per-field `useCallback` handlers or extract a reusable input component
    - _Requirements: 2.5_
  - [ ] 6.4 Refactor list item handlers (Pattern C) by extracting child components
    - Where `items.map(item => <Card onClick={() => onSelect(item)} />)`, extract a `SelectableCard` child component that receives `item` and `onSelect` as props and uses `useCallback` internally
    - _Requirements: 2.4_
  - [ ] 6.5 Refactor remaining inline arrow functions in `src/containers/`, `src/hooks/`, and any other files
    - _Requirements: 2.1_
  - [ ] 6.6 Run `npm run lint` and confirm zero `react/jsx-no-bind` errors remain
    - _Requirements: 2.1_

- [ ] 7. Phase 6 — Multi-component file extraction (~55 errors)
  - [ ] 7.1 Extract components from `CreateAppointmentPage.tsx` (8 components)
    - Move `StepIndicator` to `src/components/shared/StepIndicator.tsx`
    - Move step components (`Step1Patient`, `Step2Branch`, etc.) to `src/pages/appointment/steps/`
    - Update all import statements in consuming files
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 7.2 Extract components from `BookAppointmentPage.tsx` (6 components)
    - Reuse `StepIndicator` from 7.1; move portal step components to `src/pages/portal/steps/`
    - Update all import statements
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 7.3 Extract components from `PortalPage.tsx` (4 components: `HeroSection`, `SpecialtyCard`, `BranchCard`, `DpiVerificationModal`)
    - Move to `src/pages/portal/components/`
    - _Requirements: 3.1, 3.2, 3.4_
  - [ ] 7.4 Extract components from `PrescriptionDetailPage.tsx` (4 components: `AddItemForm`, `CreatePrescriptionGuard`, `CreatePrescriptionForm`, `ExistingPrescriptionView`)
    - Move to `src/pages/prescription/components/`
    - _Requirements: 3.1, 3.2, 3.4_
  - [ ] 7.5 Extract components from dashboard pages (`DoctorDashboardPage.tsx`, `NurseDashboardPage.tsx`, `AdminDashboardPage.tsx`)
    - Move `AppointmentCard` variants to `src/pages/dashboard/components/` with disambiguated names (`DoctorAppointmentCard`, `NurseAppointmentCard`)
    - Move `StatCard`, `QuickActionButton` to `src/pages/dashboard/components/`
    - _Requirements: 3.1, 3.2, 3.4_
  - [ ] 7.6 Extract components from portal sub-pages (`MyAppointmentsPage.tsx`, `PatientDashboardPage.tsx`, `PortalPaymentPage.tsx`, `PortalRegisterPage.tsx`, `ProfilePage.tsx`)
    - Move `StatusBadge`, `AppointmentRow`, `AppointmentCard` to `src/pages/portal/components/`
    - Move `PortalPaymentContent` to `src/pages/portal/components/`
    - Extract `Field` component to `src/components/pure/FormField.tsx` and reuse across `PortalRegisterPage` and `ProfilePage`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 7.7 Extract remaining multi-component files
    - `AppointmentViewPage.tsx`: move `DetailRow` to `src/components/pure/DetailRow.tsx`
    - `CreateMedicalConsultationPage.tsx`: move `CreateMedicalConsultationGuard` to `src/pages/medical-consultation/components/`
    - `CreateVitalSignPage.tsx`: move `CreateVitalSignGuard` to `src/pages/vital-sign/components/`
    - `DoctorCalendarPage.tsx`: move utility functions to `src/utils/calendarUtils.ts`
    - `useAuthorizationRoutes.tsx`: move `RootIndex` to `src/routes/RootIndex.tsx`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 7.8 Run `npm run lint` and confirm zero `react/no-multi-comp` errors; run `tsc -b` to verify all imports resolve correctly
    - _Requirements: 3.1, 10.1_

- [ ] 8. Phase 7 — JSX max depth compliance (~39 warnings)
  - [ ] 8.1 Refactor `Sidebar.tsx` to reduce JSX nesting below 6 levels
    - Extract deeply nested menu sections, navigation groups, or list items into separate child components
    - Remove the existing `eslint-disable react/jsx-max-depth` comment
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ] 8.2 Refactor remaining files with `react/jsx-max-depth` warnings (complex form and page components)
    - Extract nested JSX subtrees into named child components to stay within the 6-level depth limit
    - _Requirements: 7.1, 7.2_
  - [ ] 8.3 Run `npm run lint` and confirm zero `react/jsx-max-depth` warnings remain
    - _Requirements: 7.1_

- [ ] 9. Checkpoint — Verify phases 5–7
  - Ensure `npm run lint` shows all handler, multi-component, and max-depth violations resolved. Run `tsc -b` to confirm no TypeScript errors. Ask the user if questions arise.

- [ ] 10. Phase 8 — Miscellaneous rule fixes
  - [ ] 10.1 Fix `react/no-unescaped-entities` errors by escaping special characters (`'`, `"`, `>`, `}`) in JSX text content using HTML entities or wrapping in expression containers
    - _Requirements: 8.1_
  - [ ] 10.2 Fix `react-hooks/exhaustive-deps` warnings by adding missing dependencies to hook dependency arrays or restructuring hook logic to avoid infinite loops
    - If adding a dependency would cause an infinite loop, use `useRef` for values that shouldn't trigger re-runs
    - _Requirements: 8.3_
  - [ ] 10.3 Fix `react-refresh/only-export-components` warnings by ensuring files that export components do not also export non-component values, or by leveraging the `allowConstantExport` exception
    - _Requirements: 8.4_
  - [ ] 10.4 Fix `react/button-has-type` errors by adding explicit `type` attribute (`"button"`, `"submit"`, or `"reset"`) to every `<button>` element
    - _Requirements: 8.5_
  - [ ] 10.5 Fix `react/jsx-no-useless-fragment` errors by removing unnecessary `<></>` wrappers where a single child element or expression suffices
    - _Requirements: 8.6_
  - [ ] 10.6 Fix `@typescript-eslint/no-unused-vars` errors by removing unused variables or prefixing them with an underscore (`_`)
    - _Requirements: 8.7_
  - [ ] 10.7 Fix `react-hooks/rules-of-hooks` errors by ensuring hooks are only called at the top level of function components or custom hooks (not inside conditions, loops, or nested functions)
    - _Requirements: 8.8_
  - [ ] 10.8 Run `npm run lint` and confirm all miscellaneous rule violations are resolved
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 11. Phase 9 — Remove all eslint-disable comments
  - [ ] 11.1 Remove `eslint-disable` comment from `src/components/layout/Sidebar.tsx` (was `react/jsx-max-depth`, fixed in Phase 7)
    - Verify the underlying code complies with the rule after Phase 7 refactoring
    - _Requirements: 9.1, 9.2_
  - [ ] 11.2 Remove `eslint-disable` comments from `src/components/portal/ReservationTimer.tsx`, `src/pages/rol/RolOperationPage.tsx`, and `src/hooks/useAppointmentHub.ts` (were `react-hooks/exhaustive-deps`, fixed in Phase 8)
    - Verify each file's dependency arrays are correct after Phase 8 fixes
    - _Requirements: 9.1, 9.2_
  - [ ] 11.3 Search the entire `src/` directory for any remaining `eslint-disable`, `eslint-disable-next-line`, or `eslint-disable-line` comments and remove them, fixing the underlying code if needed
    - _Requirements: 9.1, 9.2_

- [ ] 12. Phase 10 — Final validation
  - [ ] 12.1 Run `npm run lint` from `hospital.client/` and verify the output reports exactly zero errors and zero warnings
    - _Requirements: 10.2_
  - [ ] 12.2 Run `npm run build` from `hospital.client/` and verify it completes with zero TypeScript compilation errors
    - _Requirements: 10.1, 10.3, 10.4_
  - [ ] 12.3 If any errors or warnings remain, fix them and re-run both `npm run lint` and `npm run build` until both pass cleanly
    - _Requirements: 10.1, 10.2_

- [ ] 13. Final checkpoint — Full compliance confirmed
  - Ensure `npm run lint` reports 0 errors and 0 warnings. Ensure `npm run build` succeeds with 0 TypeScript errors. Ask the user if questions arise.

## Notes

- Each phase produces a buildable codebase — run `tsc -b` after structural changes to catch issues early
- Phase 1 eliminates ~78% of all problems via automation; subsequent phases are increasingly manual
- Component extraction in Phase 6 follows the naming convention table in the design document
- `useCallback` handlers in Phase 5 must include all referenced variables in dependency arrays — the `exhaustive-deps` rule validates this
- Keep `Component` re-exports in page files for React Router lazy loading (Requirement 3.5)
- No new abstractions, libraries, or architectural changes — minimum transformation per rule
- All commands (`npm run lint`, `npm run build`, `tsc -b`) run from the `hospital.client/` directory

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["5"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 7, "tasks": ["9"] },
    { "id": 8, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8"] },
    { "id": 9, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 10, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 11, "tasks": ["13"] }
  ]
}
```
