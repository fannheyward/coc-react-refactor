import { CodeActionProvider, commands, ExtensionContext, languages } from 'coc.nvim';
import { Command, Range, TextDocument } from 'vscode-languageserver-protocol';
import { extractToFunction, isCodeActionAvailable } from './extract-jsx';

class ReactRefactorCodeActionProvider implements CodeActionProvider {
  async provideCodeActions(document: TextDocument, range: Range): Promise<Command[]> {
    const codeActions: Command[] = [];
    const selectedText = document.getText(range);
    if (isCodeActionAvailable(selectedText)) {
      codeActions.push({ command: 'react-refactor.extractToFunction', title: 'Extract JSX to function' });
    }
    return codeActions;
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    languages.registerCodeActionProvider(
      [{ scheme: 'file', pattern: '**/*.{js,jsx,ts,tsx}' }],
      new ReactRefactorCodeActionProvider(),
      'coc-react-refactor'
    ),

    commands.registerCommand('react-refactor.extractToFunction', extractToFunction)

    // commands.registerCommand('react-refactor.extractToFile', extractToFile)
  );
}
