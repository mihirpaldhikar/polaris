## 0.2.2 (September 1, 2023)

### Fixes:

- Fix an issue in which the production build of the consumer was failing due to CustomEvents.

## 0.2.1 (August 31, 2023)

### Fixes

- Fix Text Sizes.
- Fix Editor taking up the whole width and height of the screen and not obeying the allocated size.

## 0.2.0 (August 28, 2023)

### New

- Add support for nested lists.
- Lists is not limited to paragraph but can also contain all the blocks.
- Block type is not required while creating a new block. The Block type is automatically handled internally by the
  editor.
- Performance of the Editor has been improved.

### Fixes

- Fix an issue in which navigation was not working properly when navigating between list block and text block.
- Fix an issue in which list block was not getting deleted when list is empty.
- Fix an issue in which '/' (slash) command was not working in mobile devices.
- Fix an issue in which onChange callback was getting called multiple times while user is still typing.

## 0.1.4 (July 3, 2023)

- Add Markdown support while typing.

## 0.1.3 (June 29, 2023)

- Fix dialog root is unmounted when closed in SelectionMenu.tsx

## 0.1.2 (June 29, 2023)

- Fix bug of selection menu recreating dialog root even though it is already created by the Editor.

## 0.1.1 (June 29, 2023)

Initial Public Release.
