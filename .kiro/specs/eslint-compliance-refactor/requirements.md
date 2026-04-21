# Requirements Document

## Introduction

This specification covers the comprehensive refactoring of the `hospital.client` React frontend to achieve full compliance with the ESLint rules defined in `eslint.config.js`. The project currently has **4,390 ESLint problems** (4,088 errors, 302 warnings) across ~200 source files. The refactoring addresses formatting (prettier), JSX handler patterns (jsx-no-bind), component organization (no-multi-comp), prop sorting, leaked renders, and all other active ESLint rules. The goal is zero ESLint errors and zero warnings upon completion.

## Glossary

- **Frontend**: The `hospital.client` React + TypeScript application located at `hospital.client/src/`
- **ESLint_Config**: The ESLint configuration file at `hospital.client/eslint.config.js` that defines all active linting rules
- **Prettier**: The code formatter integrated via `eslint-plugin-prettier` that enforces consistent formatting
- **JSX_Handler**: A callback function passed as a prop to a JSX element (e.g., `onClick`, `onChange`, `onSubmit`)
- **Inline_Arrow_Function**: An arrow function defined directly inside a JSX prop expression, such as `onClick={() => doSomething()}`
- **Memoized_Handler**: A callback function wrapped in `useCallback` from React, stored as a stable reference to avoid unnecessary re-renders
- **Component_File**: A `.tsx` file that exports one or more React component functions
- **Multi_Component_File**: A `.tsx` file that defines more than one React component, violating the `react/no-multi-comp` rule
- **Leaked_Render**: A JSX pattern where a falsy value (e.g., `0`, `""`) can accidentally render in the DOM due to short-circuit evaluation like `{count && <Component />}`
- **Prop_Sorting**: The ordering of JSX props according to `react/jsx-sort-props` rules: reserved props first, shorthand props first, alphabetical order, callbacks last
- **Read_Only_Props**: Component props typed with the `readonly` modifier on each property, enforced by `react/prefer-read-only-props`

## Requirements

### Requirement 1: Prettier Formatting Compliance

**User Story:** As a developer, I want all source files to comply with Prettier formatting rules, so that the codebase has consistent formatting and passes the `prettier/prettier` ESLint rule.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `prettier/prettier` errors across all `.ts` and `.tsx` files
2. THE Frontend SHALL use the Prettier configuration defined in `hospital.client/.prettierrc` as the single source of truth for formatting
3. WHEN a file is auto-fixed via `npx eslint . --fix`, THE Frontend SHALL resolve all auto-fixable `prettier/prettier` violations without introducing new errors

### Requirement 2: Eliminate Inline Arrow Functions in JSX Props

**User Story:** As a developer, I want all JSX event handlers to use memoized callback references instead of inline arrow functions, so that the code complies with `react/jsx-no-bind` and avoids unnecessary re-renders.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/jsx-no-bind` errors
2. WHEN a component needs to pass a parameterized callback to a JSX element, THE Component_File SHALL define the handler using `useCallback` and pass the resulting reference as the JSX prop
3. WHEN a component needs to pass a simple state toggle (e.g., `() => setOpen(prev => !prev)`), THE Component_File SHALL extract the toggle into a `useCallback`-wrapped handler variable
4. WHEN a component renders a list of items where each item needs a unique handler (e.g., `onClick={() => onSelect(item)}`), THE Component_File SHALL extract the item into a separate child component that receives the item and callback as props and calls the callback inside its own `useCallback` handler
5. WHEN a component uses `handleChange("fieldName")` curried patterns that return arrow functions, THE Component_File SHALL refactor the pattern to use `useCallback` with explicit handler functions for each field, or extract a reusable input component that handles the field name internally

### Requirement 3: Single Component Per File

**User Story:** As a developer, I want each React component to reside in its own dedicated file, so that the codebase complies with `react/no-multi-comp` and is easier to navigate and maintain.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/no-multi-comp` errors
2. WHEN a file currently contains multiple component definitions (e.g., helper components like `StatusBadge`, `AppointmentCard`, `StepIndicator`), THE Frontend SHALL extract each additional component into its own `.tsx` file in the same directory or an appropriate subdirectory under `components/`
3. WHEN a component is extracted to a new file, THE Frontend SHALL update all import statements in files that reference the extracted component
4. WHEN a page file (under `src/pages/`) contains helper components, THE Frontend SHALL move the helper components to `src/components/` in the appropriate subfolder based on the component's purpose
5. WHEN a file exports both a named component and a `Component` function for React Router lazy loading, THE Frontend SHALL keep both exports in the same file since the `Component` export is a re-export pattern required by the router, not a separate component definition

### Requirement 4: JSX Prop Sorting Compliance

**User Story:** As a developer, I want all JSX props to follow a consistent ordering convention, so that the code complies with `react/jsx-sort-props` and is easier to read.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/jsx-sort-props` warnings
2. THE Frontend SHALL order JSX props with reserved props (e.g., `key`, `ref`) first, shorthand boolean props (e.g., `isRequired`, `disabled`) second, remaining props in alphabetical order, and callback props (e.g., `onClick`, `onChange`) last
3. WHEN a JSX element has both shorthand and non-shorthand props, THE Frontend SHALL place shorthand props before non-shorthand props within their respective groups

### Requirement 5: Prevent Leaked Renders in JSX

**User Story:** As a developer, I want all conditional rendering in JSX to use safe patterns, so that falsy values like `0` or `""` do not accidentally render in the DOM and the code complies with `react/jsx-no-leaked-render`.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/jsx-no-leaked-render` errors
2. WHEN a component conditionally renders JSX using a short-circuit pattern, THE Component_File SHALL use a ternary expression (`condition ? <Component /> : null`) or explicit boolean coercion (`{!!condition && <Component />}`) instead of relying on implicit falsy short-circuiting
3. WHEN a component conditionally renders based on an array length or numeric value, THE Component_File SHALL explicitly convert the condition to a boolean before the `&&` operator

### Requirement 6: Read-Only Props Typing

**User Story:** As a developer, I want all component prop interfaces to use the `readonly` modifier, so that the code complies with `react/prefer-read-only-props` and props are treated as immutable.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/prefer-read-only-props` errors
2. WHEN a component defines a props interface or type, THE Component_File SHALL mark each property with the `readonly` modifier
3. WHEN a component uses inline prop types (e.g., `{ data }: { data: SomeType }`), THE Component_File SHALL add the `readonly` modifier to each property in the inline type

### Requirement 7: JSX Max Depth Compliance

**User Story:** As a developer, I want all JSX trees to stay within the configured maximum nesting depth, so that the code complies with `react/jsx-max-depth` and remains readable.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/jsx-max-depth` warnings
2. WHEN a JSX tree exceeds 6 levels of nesting, THE Component_File SHALL extract deeply nested sections into separate child components to reduce depth
3. WHEN the `eslint-disable react/jsx-max-depth` comment is present in a file, THE Frontend SHALL remove the disable comment and refactor the component to comply with the depth limit

### Requirement 8: Miscellaneous ESLint Rule Compliance

**User Story:** As a developer, I want all remaining ESLint rule violations to be resolved, so that the entire codebase passes `npm run lint` with zero errors and zero warnings.

#### Acceptance Criteria

1. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/no-unescaped-entities` errors by escaping special characters (`'`, `"`, `>`, `}`) in JSX text content
2. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/jsx-boolean-value` errors by using shorthand syntax for boolean props that are `true` (e.g., `isRequired` instead of `isRequired={true}`)
3. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react-hooks/exhaustive-deps` warnings by including all referenced variables in dependency arrays or restructuring the hook logic
4. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react-refresh/only-export-components` warnings by ensuring files that export components do not also export non-component values, or by using the `allowConstantExport` exception
5. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/button-has-type` errors by adding an explicit `type` attribute (`"button"`, `"submit"`, or `"reset"`) to every `<button>` element
6. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react/jsx-no-useless-fragment` errors by removing unnecessary `<></>` wrappers
7. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `@typescript-eslint/no-unused-vars` errors by removing or prefixing unused variables with an underscore
8. WHEN the `npm run lint` command is executed, THE Frontend SHALL report zero `react-hooks/rules-of-hooks` errors by ensuring hooks are only called at the top level of function components or custom hooks

### Requirement 9: Remove All ESLint Disable Comments

**User Story:** As a developer, I want all `eslint-disable` comments to be removed from the codebase, so that no rules are silently suppressed and the code genuinely complies with all configured rules.

#### Acceptance Criteria

1. WHEN the refactoring is complete, THE Frontend SHALL contain zero `eslint-disable`, `eslint-disable-next-line`, or `eslint-disable-line` comments in any `.ts` or `.tsx` file
2. WHEN an `eslint-disable` comment was previously used to suppress a rule, THE Frontend SHALL refactor the underlying code to comply with the rule instead of suppressing it

### Requirement 10: Build Integrity After Refactoring

**User Story:** As a developer, I want the application to build and function correctly after all ESLint compliance changes, so that the refactoring does not introduce regressions.

#### Acceptance Criteria

1. WHEN `npm run build` is executed after all refactoring changes, THE Frontend SHALL compile with zero TypeScript errors
2. WHEN `npm run lint` is executed after all refactoring changes, THE Frontend SHALL report zero errors and zero warnings
3. WHEN a component is extracted to a new file, THE Frontend SHALL preserve all existing functionality and prop contracts without behavioral changes
4. WHEN an inline arrow function is replaced with a `useCallback` handler, THE Frontend SHALL preserve the original behavior including all parameters and side effects
