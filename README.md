# Polaris

Polaris is a rich semantic content editor built on top of [React](https://react.dev) and Web APIs to create a rich
content editing experience.

### Terminologies

1. `block` - A Block is the smallest unit holding all the necessary information required to render contents.
2. `blob` - A Blob is a collection of blocks holding all the information and position of the blocks.
3. `canvas` - Canvas uses block to determine how to render contents.
4. `editor` - An Editor is an orchestrator for all the blocks. It uses blob to handle the creation, update, deletion of the blocks.

### Block Types

1. `text` - A Text Block renders contents as text.
2. `list` - A List Block rendered contents in list.
3. `image` - An Image Block renders the image.

### Block Role

1. `title` - To render text as a Title (Block Type: `text`)
2. `subTitle` - To render text as a SubTitle (Block Type: `text`)
3. `heading` - To render text as a Heading (Block Type: `text`)
4. `subHeading` - To render text as a SubHeading (Block Type: `text`)
5. `paragraph` - To render text as a Paragraph (Block Type: `text`)
6. `quote` - To render content as quote (Block Type: `text`)
7. `bulletList` - To render bullet list (Block Type: `list`)
8. `numberedList` - To render numbered list (Block Type: `list`)
9. `listChild` - To render contents in a list (Block Type: `text`)
10. `image` - To render contents an image (Block Type: `image`)
