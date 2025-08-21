// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import fs from "fs";
import { getComponentNameFromPath, getContextNames } from "./workspace";
import { pascalToCamelCase } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  // Load snippets from react-snippets.json
  const snippetsPath = path.join(
    context.extensionPath,
    "src",
    "snippets",
    "snippets.json"
  );

  const snippets = JSON.parse(fs.readFileSync(snippetsPath, "utf-8"));

  function replaceLineSnippets(
    line: string,
    componentName: string,
    names: { contextName: string; providerName: string; useHookName: string }
  ) {
    line = line.replace(/\${1:[^}]+}/g, componentName);
    line = line.replace(/\${20:[^}]+}/g, pascalToCamelCase(componentName)); // Make placeholder pascal case to camel case
    // Context-specific replacements like ccp/fcp
    line = line.replace(/\${13:[^}]+}/g, names.contextName); // For context name
    line = line.replace(/\${14:[^}]+}/g, names.providerName); // For provider name
    line = line.replace(/\${15:[^}]+}/g, names.useHookName);
    return line;
  }

  const provider = vscode.languages.registerCompletionItemProvider(
    ["javascript", "javascriptreact", "typescript", "typescriptreact"],
    {
      provideCompletionItems(
        document: vscode.TextDocument
        // position: vscode.Position
      ) {
        const names = getContextNames(document);
        const completionItems: vscode.CompletionItem[] = [];
        const componentName = getComponentNameFromPath(document);

        console.log("Context Names:", names);
        console.log("Component Name:", componentName);

        // Iterate through snippets and create completion items
        for (const [_snippetName, snippet] of Object.entries(snippets)) {
          const completionItem = new vscode.CompletionItem(
            (snippet as { prefix: string }).prefix,
            vscode.CompletionItemKind.Snippet
          );
          completionItem.detail = (
            snippet as { description: string }
          ).description;

          // Replace placeholder names in the snippet body with the context-aware name
          let snippetBody = (snippet as { body: string[] }).body.map((line) => {
            // General component name replacement (for non-context snippets like rfc, nlayout)
            // For use hook name
            return replaceLineSnippets(line, componentName, names);
          });

          completionItem.insertText = new vscode.SnippetString(
            snippetBody.join("\n")
          );
          completionItem.documentation = new vscode.MarkdownString(
            (snippet as { description: string }).description
          );

          // Trigger 'Organize Imports' after snippet insertion to clean up duplicates
          // This runs automatically post-insert, merging duplicate imports (e.g., via ESLint rules)
          completionItem.command = {
            command: "editor.action.organizeImports",
            title: "Organize Imports",
          };
          completionItems.push(completionItem);
        }
        return completionItems;
      },
    },
    ..."abcdefghijklmnopqrstuvwxyz".split("") // Trigger on any character to allow prefix matching
  );

  const quickPicks = vscode.commands.registerCommand(
    "react-next-js-smart-snippets.snippets",
    async function () {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const document = activeEditor.document;

      // Get naming context from current document
      const names = getContextNames(document);
      const componentName = getComponentNameFromPath(document);

      // Create quick pick items from snippets.json
      const quickPickItems = Object.entries(snippets).map(
        ([snippetName, snippet]: [string, any]) => {
          return {
            label: snippet.prefix,
            description: snippet.description,
            detail: snippet.description,
            snippetData: snippet, // Store the snippet object for later use
          };
        }
      );

      const selected = await vscode.window.showQuickPick(quickPickItems, {
        matchOnDetail: true,
        placeHolder: "Select a React/Next.js snippet to insert",
      });

      if (selected) {
        const snippet = selected.snippetData;

        // Process the snippet body with replacements (same as completion provider)
        let snippetBody = snippet.body.map((line: string) => {
          // Replace placeholders with context-aware names
          return replaceLineSnippets(line, componentName, names);
        });

        const insertText = new vscode.SnippetString(snippetBody.join("\n"));

        // Insert the processed snippet
        await activeEditor.insertSnippet(
          insertText,
          activeEditor.selection.active
        );

        // Trigger organize imports after insertion
        await vscode.commands.executeCommand("editor.action.organizeImports");
      }
    }
  );

  context.subscriptions.push(provider, quickPicks);
}

// This method is called when your extension is deactivated
export function deactivate() {}
