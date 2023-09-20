## 0.7.1 (September 18, 2023)

### Fixes:

- Fix an issue which was causing IndexSizeError when switching blocks with Block tools Action actions.

## 0.7.0 (September 17. 2023)

### New:

- Add HTML doctype declaration to the output when `Blob` is serialized to `HTML`.

### Breaking Changes:

- Move `text`, `list` and `attachment` config to `block` object in `PolarisConfig`.

### Fixes:

- Fix an issue in which Inline toolbar was getting out of viewport for mobile devices.
- Fix an issue in which Slash command was not working as expected and keeps the slash if some block or tool is selected.
- Fix debounce interval from 360 to 260 in onChange and onActionSelected callbacks for better typing experience.

## 0.6.0 (September 16, 2023)

### New:

- Add support for Subscript and Superscript in Inline Toolbar.
- Single list now breaks into two separate list when active block of list is empty and enter key is pressed.
- Editor now throws an error if no block with the provided role is found.
- Editor performance has been improved for larger `Blobs`.

### Breaking Changes:

- Disable nested list as it was causing extra computing overhead.
- Removed onChange. The onChanged is replaced by Editor Event onChanged-blobID.
- Removed onSave callback from Editor. The onSave has been replaced by the editor event saveEditor-blobID and
  onSaved-blobID.
- Removed auto save feature as it was causing unnecessary load for the editor.

### Fixes:

- Fix an issue in which focus on block was not working as expected when a table block is initialized which was causing
  rendering error.
- Fix an issue in which Action Action was not working in mobile devices.
- Fix an issue in which Block Tools popup was getting dismissed due to arrow navigation code of table block.
- Fix an issue in which Copy, Paste and other options not working in Dialog Box input fields for Mobile Devices.
- Fix an issue in which height field of Size Dialog losing focus while typing.

## 0.5.0 (September 10, 2023)

### New:

- Add support for Tables.
- Performance of the editor has been improved.

## 0.4.0 (September 8, 2023)

### Breaking Changes:

- `youtubeVideoEmbed` and `githubGistEmbed` are now separate blocks instead of `embed` block.
- `allowedOn` has been renamed to `allowedRoles` in `Action`.
- Removed `lineHeight` field from `PolarisConfig`. The line height is now automatically managed bt the `Editor`

### Fixes:

- Fix an issue in which `lineHeight` was causing unexpected spacings between texts when text blocks are rendered.

## 0.3.0 (September 8, 2023)

### New:

- Add support for YouTube Video and GitHub Gist Embeds.
- Add an option to configure Blocks and Editor with `PolarisConfig`.
- Serialization from `Blob` to `HTML` now gives complete `HTML Document` as output instead of only containing `Block`.
- Add `name` field to `Blob` for unique `Blob` name.

### Breaking Changes:

- `contents` field in `Blob` has now renamed to `blocks` for unified naming scheme and to avoid confusion.
- `onImageSelected` callback has been renamed to `onAttachmentSelected`.

### Fixes:

- Fix an issue in which Blocks such as `image` and `youtubeVideoEmbed` where getting delete when a new instance
  of `image`
  or `youtubeVideoEmbed` where added in the `list`.
- Fix text overflow in the Editor.
- Fix an issue in which Dialogs where not getting dismissed automatically when clicked outside the dialog.
- Fix an issue in which options on the top right of the `image` was obstructing the Image. This is now replaced by
  a `ContextMenu`.

## 0.2.4 (September 3, 2023)

### Breaking Changes:

- `content` field of `Block` is now renamed to `data`.
- `selectionMenu` prop of `Editor` is now renamed to `inlineActions`.

### Fixes:

- Fix an issue in which the selection color of editor was getting applied to whole document.
- Fix an issue in which the background color of `quote` was too dark.

## 0.2.3 (September 2, 2023)

### Fixes:

- Fix an issue in which a new block was getting created on Enter key pressed when Action Action is opened.

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

- Fix bug of selection actions recreating dialog root even though it is already created by the Editor.

## 0.1.1 (June 29, 2023)

Initial Public Release.
