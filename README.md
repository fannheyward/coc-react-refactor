# coc-react-refactor

React refactor extension for coc.nvim, forked from [vscode-react-refactor](https://github.com/planbcoding/vscode-react-refactor).

_This extension is sponsored by [@James Zhang](https://github.com/vfbiby) for developing, thank you._

![coc-react-refactor](https://user-images.githubusercontent.com/345274/86444407-48cbdd80-bd43-11ea-84df-32a195c9d5e8.gif)

## Install

`:CocInstall coc-react-refactor`

## Usage

```viml
xmap <leader>a  <Plug>(coc-codeaction-selected)
nmap <leader>a  <Plug>(coc-codeaction-selected)
```

## Configuration

- `react-refactor.produceClass`: Create a class-based component, will create a function component when disabled, only works for `Extract to file`, default `true`

## License

MIT

---

> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
