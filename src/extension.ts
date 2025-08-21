// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import fs from "fs";
import { getComponentNameFromPath, getContextNames } from "./workspace";
import { pascalToCamelCase } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  let lastDirective: string | null = null; // Track the last inserted directive
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

  const organizeAndFormat = vscode.commands.registerCommand(
    "react-next-js-smart-snippets.organizeAndFormatImports",
    async () => {
      await vscode.commands.executeCommand("editor.action.organizeImports");
      // Add a short delay for parsing
      await new Promise((resolve) => setTimeout(resolve, 300));
      await vscode.commands.executeCommand("editor.action.formatDocument");
    }
  );

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

          // // Set lastDirective based on the snippet prefix
          // if ((snippet as { prefix: string }).prefix === "uclient") {
          //   lastDirective = '"use client";';
          // } else if ((snippet as { prefix: string }).prefix === "userver") {
          //   lastDirective = '"use server";';
          // }

          // Trigger 'Organize Imports' after snippet insertion to clean up duplicates
          // This runs automatically post-insert, merging duplicate imports (e.g., via ESLint rules)
          completionItem.command = {
            command: "react-next-js-smart-snippets.organizeAndFormatImports",
            title: "Organize Imports",
          };
          // vscode.commands.executeCommand("editor.action.organizeImports");
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
        await vscode.commands.executeCommand(
          "react-next-js-smart-snippets.organizeAndFormatImports"
        );
      }
    }
  );

  // Listener to manage "use client" and "use server" directives on save
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument(async (event) => {
      const document = event.document;
      if (
        document.languageId !== "typescriptreact" &&
        document.languageId !== "javascriptreact"
      ) {
        return;
      }

      const text = document.getText();
      const lines = text.split("\n");
      let edits = new vscode.WorkspaceEdit();

      // Check if line 1 contains a directive and replace it if necessary
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        console.log("First line:", firstLine);
        if (firstLine === '"use client";' || firstLine === '"use server";') {
          console.log("Directive found at the top:", firstLine);
          // Replace with the newly inserted directive based on snippet prefix
          const newDirective = lines.some((line) =>
            line.includes('"use server";')
          )
            ? '"use server";'
            : '"use client";';

            console.log("New directive to insert:", newDirective);

          if (firstLine !== newDirective) {
            const rangeToRemove = new vscode.Range(0, 0, 1, 0);
            edits.delete(document.uri, rangeToRemove);
            edits.insert(
              document.uri,
              new vscode.Position(0, 0),
              newDirective + "\n"
            );
          }
        } else {
          // Insert the directive at the top if it exists anywhere else
          const hasClient = lines.some((line) =>
            line.includes('"use client";')
          );
          const hasServer = lines.some((line) =>
            line.includes('"use server";')
          );
          if (hasClient || hasServer) {
            const directiveToInsert = hasServer
              ? '"use server";'
              : '"use client";';
            edits.insert(
              document.uri,
              new vscode.Position(0, 0),
              directiveToInsert + "\n"
            );

            // Remove any existing directive from other lines
            for (let i = 1; i < lines.length; i++) {
              if (
                lines[i].trim() === '"use client";' ||
                lines[i].trim() === '"use server";'
              ) {
                const rangeToRemove = new vscode.Range(i, 0, i + 1, 0);
                edits.delete(document.uri, rangeToRemove);
              }
            }
          }
        }
      }

      // Apply edits if any
      if (edits.entries().length) {
        await vscode.workspace.applyEdit(edits);
      }
    })
  );

  context.subscriptions.push(organizeAndFormat, provider, quickPicks);
}

// This method is called when your extension is deactivated
export function deactivate() {}
