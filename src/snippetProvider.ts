import * as vscode from "vscode";

export class ReactSnippetProvider implements vscode.CompletionItemProvider {
  /**
   * This method is called when VS Code needs completion suggestions
   * It returns the list of snippets that appear in the dropdown
   */
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.CompletionItem[] {
    // Create array of completion items (these show up in dropdown)
    const completionItems: vscode.CompletionItem[] = [];

    // Example: React Functional Component snippet
    const reactComponent = new vscode.CompletionItem(
      "rfc", // What user types to trigger
      vscode.CompletionItemKind.Snippet
    );
    reactComponent.detail = "React Functional Component";
    reactComponent.documentation = "Creates a React functional component";
    reactComponent.insertText = new vscode.SnippetString(`
        function \${1:ComponentName}() {
            return (
                <div>
                    \${2:// Component content}
                </div>
            );
        }

        export default \${1:ComponentName};
        `);

    // Example: useState Hook snippet
    const useStateSnippet = new vscode.CompletionItem(
      "rus",
      vscode.CompletionItemKind.Snippet
    );
    useStateSnippet.detail = "React useState Hook";
    useStateSnippet.documentation = "Creates a useState hook";
    useStateSnippet.insertText = new vscode.SnippetString(
      "const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue});"
    );

    // Add snippets to the completion list
    completionItems.push(reactComponent, useStateSnippet);

    return completionItems;
  }
}
