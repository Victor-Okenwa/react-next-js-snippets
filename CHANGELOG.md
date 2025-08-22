# Changelog

All notable changes to the "React Next.js Smart Snippets" VS Code extension will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to semantic versioning.

## Unreleased

**Added**
Initial preparation for future updates.

## Changed
No changes yet.

## Fixed
No fixes yet.

## 1.0.0 - 2025-08-21

__Added__

- Initial release of the React/Next.js Snippets extension.
- Support for dynamic naming of components, contexts, and hooks based on file paths (e.g., app/user-context.tsx becomes UserContext).
- Comprehensive snippet library including:
  - Immediately Invoked Functions (`iif`, `iif-async`, `iif-ar`, `iif-ar-async`).
  - React Functional Components (`rfc`, `rfc-ts`, `rfc-de`, `rfc-ts-de`).
  - Hooks (us, uef, ucb, ulef, ume, ure, uref).
  - Context Providers (`ccp-js`, `ccp-ts`, `fcp-js`, `fcp-ts`).
  - Next.js Directives (`uclient`, `userver`).
- Workspace IntelliSense for automatic naming and modern syntax consistency.
- Quick Pick feature (`Ctrl+Shift+L` on Windows, `Cmd+Shift+L` on Mac) to access all snippets.
- Automatic import organization on snippet insertion using editor.action.organizeImports.
- Logic to move `"use client"` and "use server" directives to the top of the file on save.

## Changed
- Initial implementation of snippet replacement logic to handle dynamic naming in `extension.ts`.

## 1.0.1 - 2025-08-21

## Fixed
- Snippets source directory
- More Categories for better look up