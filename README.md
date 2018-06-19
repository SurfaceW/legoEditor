# legoeditor README

You can use this editor tool to edit legao project's page.js and project.js.

## Features

- use `CMD + Shift + P` to enable **LeGao: connect page.js**
- open legao's designer page
- once the page is ready, you can see page.js in your editor now


## Requirements

- node.js > 8

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

## Known Issues

### Bugs

- [ ] close editors should be disposed while reopen the page won't make text show again.
- [x] double trigger save / sync status.
- [x] optimze the pop-up messages of `vscode.window`.

Reserved Problems:

- [x] Support global.js editing.
- [x] Support multi-page and multi-tab connections with accurate matching.


### Enhancements

- support send `save` action to the ws-client.
- [x] support edit `page.js` and `global.js` or a universal editing services.
- support typescript declartion file injection for syntax hint.

## Release Notes

### 1.0.0

Initial release

### For more information

**Enjoy!**
