export const reservedFiles = [
  // Next.js App Router Files
  'page',     // TypeScript version of page.js.
  'layout',   // TypeScript version of layout.js.
  // 'loading',   // Provides an instant loading state.
  // 'error',     // Defines an error boundary for a route segment.
  // 'not-found', // Renders UI for non-existent routes.
  'default',   // A fallback for parallel routes.
  'template',  // Renders a new component instance for each child route.
  'route',     // Defines a route handler for API endpoints.

  // Common React/JavaScript Conventions
  'index',     // Often used as the entry point for a directory or component.
  // 'main',     // Common entry point for Vite-based React apps.
  'App',       // The root component of many React applications.
];

// This array contains reserved folder names used by Next.js for routing and organization.
export const reservedFolders = [
  'app',         // The primary root folder for the Next.js App Router.
  'pages',       // The root folder for the legacy Pages Router.
  'api',         // A special folder for creating API endpoints.
  'public',      // A folder for serving static assets.   
  //     // Route groups used to organize files without affecting the URL path.
];

export function pascalToCamelCase(pascalCaseString: string) {
  // Check if the string is not empty and is a string
  if (typeof pascalCaseString !== "string" || pascalCaseString.length === 0) {
    return "";
  }
  // Convert the first character to lowercase and append the rest of the string
  return pascalCaseString.charAt(0).toLowerCase() + pascalCaseString.slice(1);
}

// Converts a string to Pascal case (e.g., folder-name -> FolderName, folder_name -> FolderName)
export function toPascalCase(str: string): string {
  // Handle dynamic routes, private folders, and route groups first
  let cleanedStr = str;
  if (cleanedStr.startsWith("[") && cleanedStr.endsWith("]")) {
    cleanedStr = cleanedStr.replace(/^\[(\.\.\.)?/, "").replace(/\]$/, "");
  }
  if (cleanedStr.startsWith("_")) {
    cleanedStr = cleanedStr.slice(1);
  }
  if (cleanedStr.startsWith("(") && cleanedStr.endsWith(")")) {
    cleanedStr = cleanedStr.slice(1, -1);
  }

  // Split on hyphens and underscores, capitalize each part, and join
  return cleanedStr
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}
