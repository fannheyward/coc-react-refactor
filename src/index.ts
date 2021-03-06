import { CodeActionProvider, Command, commands, ExtensionContext, languages, Range, TextDocument } from 'coc.nvim';
import { isJSX } from './ast';
import { extractToFile, extractToFunction } from './extract-jsx';

class ReactRefactorCodeActionProvider implements CodeActionProvider {
  async provideCodeActions(document: TextDocument, range: Range): Promise<Command[]> {
    const codeActions: Command[] = [];
    const selectedText = document.getText(range);
    if (isJSX(selectedText)) {
      codeActions.push({ command: 'react-refactor.extractToFunction', title: 'Extract JSX to function' });
      codeActions.push({ command: 'react-refactor.extractToFile', title: 'Extract JSX to file' });
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

    commands.registerCommand('react-refactor.extractToFunction', extractToFunction),
    commands.registerCommand('react-refactor.extractToFile', extractToFile)
  );
}
