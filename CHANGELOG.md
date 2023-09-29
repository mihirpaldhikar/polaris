## 0.8.1 (September 29, 2023)

## Fixes:

- Fix an issue in which initializing table block causing error when text content of current block is not empty.
- Fix default Text Styles to improve spacings for texts in PolarisConfig.
- Fix shadow for Annotation Toolbar, Block Tools and Dialog Box.

## 0.8.0 (September 25, 2023)

### Breaking Changes:

- Polaris from now on will only support ES Modules and no more support for CommonJS. This is done to remove extra burden
  to maintain CJS and to use modern tools and features.
- Rename `INLINE_SPECIFIER_NODE` constant to `INLINE_ANNOTATIONS_NODE` and changed the value from `inline-specifier`
  to `inline-annotations`
- Rename `serializeBlockToHTML` to `serializeBlob`
- Rename `serializeFileToBase64` to `serializeFile`
- Rename `inlineTools` property of Editor to `annotationActions`.

### New:

- Add `fontWeight` config in `PolarisConfig` for text blocks.
- Add `lineHeight` config in `PolarisConfig` for text blocks.
- Fix an issue in which Action key was not rendering Block Tools popup when triggered after list or table.
- `name` filed of `Blob` is now optional.
- Add `description` field in `Blob` for adding description about the document.
- Add `author` field in `Blob` for adding author to the document.
- Add `className` property to `Editor` for applying css classes to the Editor.
- `config` property of Editor is now optional. If no explicit config is passed, the editor
  uses `DEFAULT_POLARIS_CONFIG`.
- Introduced `GenericBlock` for defining custom blocks.
- Simplified initialization of block when chosen with Block Actions.
- Add `Plugins` (internal preview) for blocks which will enable to create custom blocks.
- Migrated all blocks to New Block Plugin System.
- The Annotation Toolbar, Block Tools and Dialog Box can now retain their position when window is scrolled. While
  scrolling the window, all of these are hidden and shown only after scrolling has ended.

### Fixes:

- Fix an issue which was causing block role and style getting passed over to newly created block even though the content
  after slicing is empty.
- Fix an issue in which YouTube Video block was accepting non-youtube URLs and GitHub Gist block was accepting non
  github-gist URLs.
- Fix an issue in which Table toolbar was not rendering when a table cell is in focus.
- Fix and Unified z-axis values for Annotation Toolbar, Dialog Box and Block Tools.

## 0.7.1 (September 18, 2023)

### Fixes:

- Fix an issue which was causing IndexSizeError when switching blocks with BlockSchema tools Action actions.

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
- Fix an issue in which BlockSchema Tools popup was getting dismissed due to arrow navigation code of table block.
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
- Serialization from `Blob` to `HTML` now gives complete `HTML Document` as output instead of only
  containing `BlockSchema`.
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

- `content` field of `BlockSchema` is now renamed to `data`.
- `selectionMenu` prop of `Editor` is now renamed to `annotationActions`.

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
- BlockSchema type is not required while creating a new block. The BlockSchema type is automatically handled internally
  by the
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
