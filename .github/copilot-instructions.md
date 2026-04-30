# Copilot Instructions

## General Guidelines
- JSX props should not use arrow functions (ESLint rule: react/jsx-no-bind). Use `useCallback` or named handler functions instead of inline arrow functions in JSX props. Avoid: `onClick={() => fn()}`. Correct: `const handler = useCallback(() => fn(), []);` then `onClick={handler}`.
- Un único componente exportado por archivo .tsx obligatoriamente. Los componentes van en `src/components/` dentro de la subcarpeta correspondiente a su dominio.