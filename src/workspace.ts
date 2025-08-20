import * as vscode from "vscode";
import * as path from "path";
import { toPascalCase } from "./utils";


// Extracts context-related names based on file and folder conventions
export function getContextNames(document: vscode.TextDocument): { contextName: string, providerName: string, useHookName: string } {
  const filePath = document.uri.fsPath;
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return { contextName: 'ExampleContext', providerName: 'ExampleProvider', useHookName: 'useExample' };
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  const pathParts = relativePath.split(path.sep);
  const fileName = path.basename(filePath, path.extname(filePath)).toLowerCase();
  const parentFolder = pathParts[pathParts.length - 2] || '';

  let baseName = fileName;

  // Remove 'context' and 'provider' from file name to derive base name
  baseName = baseName.replace(/context/gi, '').replace(/provider/gi, '').trim();

  // If no meaningful base name remains, use parent folder
  if (!baseName || baseName.length === 0) {
    baseName = parentFolder;

    // If folder name contains 'context' or 'provider', use fallback
    if (parentFolder.toLowerCase().includes('context') || parentFolder.toLowerCase().includes('provider')) {
      return { contextName: 'ProviderContext', providerName: 'ProviderName', useHookName: 'useExample' };
    }
  }

  // Convert to Pascal case and append suffixes
  const pascalBase = toPascalCase(baseName);
  const contextName = `${pascalBase}Context`;
  const providerName = `${pascalBase}Provider`;
  const useHookName = `use${pascalBase}`;

  return { contextName, providerName, useHookName };
}

export function getWorkspaceRoot() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

// Extracts a component name based on the file's parent folder or Next.js conventions
export function getComponentNameFromPath(document: vscode.TextDocument) {
  const { contextName } = getContextNames(document);

  const filePath = document.uri.fsPath;
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return "Component"; // Fallback name if no workspace is open
  }

  // Get the relative path from workspace root
  const relativePath = path.relative(workspaceRoot, filePath);
  const pathParts = relativePath.split(path.sep);
    // const fileName = path.basename(filePath, path.extname(filePath));

  // For context provider snippets, return the context name as the primary placeholder
  const fileName = path
    .basename(document.uri.fsPath, path.extname(document.uri.fsPath))
    .toLowerCase();
  if (fileName.includes("context") || fileName.includes("provider")) {
    return contextName; // This will be used for ${1:ContextName} in snippets
  }

  // Handle Next.js conventions
  // Check if the file is a special Next.js file like page.tsx or layout.tsx
  // Handle Next.js conventions for special files like page, layout, or route
  if (fileName === "page" || fileName === "layout" || fileName === "route") {
    // Look at the parent folder for naming
    let parentFolder = pathParts[pathParts.length - 2];
    if (parentFolder) {
      // Convert to Pascal case, handling kebab-case, snake_case, etc.
      parentFolder = toPascalCase(parentFolder);
      // Capitalize and append suffix based on file type
      if (fileName === "page") return `${parentFolder}Page`;
      if (fileName === "layout") return `${parentFolder}Layout`;
      if (fileName === "route") return `${parentFolder}Route`; // Special handling for API routes
    }
  }

  if (fileName === "index") {
    // If the file is index.tsx, use the parent folder name
    const parentFolder = pathParts[pathParts.length - 2];
    if (parentFolder) {
      return toPascalCase(parentFolder);
    }
  }

  if (fileName.startsWith("api-")) {
    // For API routes, use the parent folder name or the file name without "api-"
    const parentFolder = pathParts[pathParts.length - 2];
    if (parentFolder) {
      return toPascalCase(parentFolder);
    }
  } else if (fileName.startsWith("api/")) {
    // For API routes, use the parent folder name or the file name without "api/"
    const parentFolder = pathParts[pathParts.length - 2];
    if (parentFolder) {
      return toPascalCase(parentFolder);
    }
  }

  if (fileName.startsWith("api")) {
    // For API routes, use the file name without "api"
    return toPascalCase(fileName.replace(/^api-/, ""));
  }

  if (fileName.includes("context") || fileName.includes("provider")) {
    let baseName = fileName;

    // Remove 'context' and 'provider' from the file name
    baseName = baseName
      .replace(/context/gi, "")
      .replace(/provider/gi, "")
      .trim();

    // If no meaningful name remains after removal
    if (!baseName || baseName.length === 0) {
      const parentFolder = pathParts[pathParts.length - 2] || "";
      baseName = toPascalCase(parentFolder);

      // If folder name contains 'context' or 'provider', use fallback
      if (
        parentFolder.toLowerCase().includes("context") ||
        parentFolder.toLowerCase().includes("provider")
      ) {
        return "ProviderContext"; // Fallback name
      }
      return baseName || "ProviderName"; // Use folder name or fallback
    }

    return toPascalCase(baseName);
  }

  // For non-Next.js files, use the file name or parent folder as fallback
  const parentFolder = pathParts[pathParts.length - 2] || fileName;
  return toPascalCase(parentFolder);
}
