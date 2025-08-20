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
