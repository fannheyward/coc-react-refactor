import { window } from 'coc.nvim';

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

const normalizeComponentName = (name: string) =>
  name
    .split(/[\s-_]+/)
    .map(capitalizeFirstLetter)
    .join('');

export const askForName = async () => {
  const name = await window.requestInput('Component name');
  if (!name) return false;

  return normalizeComponentName(name);
};

export const generateClassComponent = (name: string, renderCode: string): string => `
export class ${name} extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            ${renderCode}
        );
    }
}
`;

export const generatePureComponent = (name: string, renderCode: string): string => `
const ${name} = (${renderCode.match(/props/) ? 'props' : ''}) => (
    ${renderCode}
);
`;
