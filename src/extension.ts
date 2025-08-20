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
            line = line.replace(/\${1:[^}]+}/g, componentName);

            line = line.replace(/\${20:[^}]+}/g, pascalToCamelCase(componentName)); // Make placeholder pascal case to camel case

            // Context-specific replacements like ccp/fcp
            line = line.replace(/\${13:[^}]+}/g, names.contextName); // For context name
            line = line.replace(/\${14:[^}]+}/g, names.providerName); // For provider name
            line = line.replace(/\${15:[^}]+}/g, names.useHookName); // For use hook name
            return line;
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

    // new ReactSnippetProvider(),
    // "r", // Trigger character - when user types 'r'
    // "n"
  );

  const quickPicks = vscode.commands.registerCommand(
    "react-next-js-snippets.snippets",
    async function () {
      vscode.window.showInformationMessage(`You just selected`);
      const selected = await vscode.window.showQuickPick(
        [
          {
            label: "React Functional Component",
            description: "Insert a React functional component snippet",
            detail: "Creates a React functional component",
            insertText:
              new vscode.SnippetString(`function \${1:ComponentName}() {
      			return (
      				<div>
      					\${2:// Component content}
      				</div>
      			);
      		}`),
          },
        ],
        {
          matchOnDetail: true,
        }
      );

      if (selected) {
        vscode.window.showInformationMessage(
          `You just selected ${selected.label}`
        );

        const { activeTextEditor } = vscode.window;
        if (activeTextEditor) {
          activeTextEditor.insertSnippet(
            selected.insertText,
            activeTextEditor.selection.active
          );
        }
        console.log(selected);
      }
    }
  );

  const helloWorld = vscode.commands.registerCommand(
    "react-next-js-snippets.helloWorld",
    async function () {
      vscode.window.showInformationMessage(`Hello World`);
      console.log(snippets);
    }
  );

  context.subscriptions.push(provider, quickPicks, helloWorld);
}

// This method is called when your extension is deactivated
export function deactivate() {}
