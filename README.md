# Polaris

Polaris is a rich semantic content editor built on top of [React](https://react.dev) and Web APIs to create a rich
content editing experience.

## Features

1. [x] Title, SubTitle, Heading, Subheading, Paragraphs and Blockquotes.
2. [x] Changing one block to another on the fly with slash (/) command.
3. [x] Markdown Support
4. [x] Inline Styling
5. [x] Inline Links
6. [x] Image
7. [x] Lists

## Installation

```
npm install @mihirpaldhikar/polaris
```

## Usage

Creating an Editor

```tsx
import { Editor, Blob, generateBlockId } from "@mihirpaldhikar/polaris";

export default function MyApp(): JSX.Element {
  const blob: Blob = {
    id: "MB1624",
    contents: [
      {
        id: generateBlockId(),
        role: "title",
        content: "Introducing Polaris",
        style: [],
      },
      {
        id: generateBlockId(),
        role: "paragraph",
        content: "Polaris is a rich semantic content editor.",
        style: [],
      },
    ],
  };

  function imageUploader(file: File): string {
    /**
     * Logic to handle image.
     * must return a url.
     */
    return fileURL;
  }

  function saveBlob(blob: Blob): void {
    /**
     * Logic to save blob.
     */
  }

  return (
    <Fragment>
      <Editor
        blob={blob}
        onImageSelected={(file) => {
          return imageUploader(file);
        }}
        onSave={(blob) => {
          saveBlob(blob);
        }}
      />
    </Fragment>
  );
}
```

> Note: If you are using React 18 & above or frameworks like NextJS, you need to explicitly specify the page or
> component consuming the Polaris Editor as a client component.

Exporting Generated Blob to HTML

```ts
import {
  Blob,
  generateBlockId,
  serializeBlobToHTML,
} from "@mihirpaldhikar/polaris";

const blob: Blob = {
  id: "MB1624",
  contents: [
    {
      id: generateBlockId(),
      role: "title",
      content: "Introducing Polaris",
      style: [],
    },
    {
      id: generateBlockId(),
      role: "paragraph",
      content: "Polaris is a rich semantic content editor.",
      style: [],
    },
  ],
};

function exportBlobToHTML(blob) {
  console.log(serializeBlobToHTML(blob));
}
```

Output

```html
<h1>Introducing Polaris</h1>
<p>Polaris is a rich semantic content editor.</p>
```

## Upcoming Features

1. [ ] Embeds
2. [ ] Tables
3. [ ] Code

#### Terminologies

1. `block` - A Block is the smallest unit holding all the necessary information required to render contents.
2. `blob` - A Blob is a collection of blocks holding all the information and position of the blocks.
3. `canvas` - Canvas uses block to determine how to render contents.
4. `editor` - An Editor is an orchestrator for all the blocks. It uses blob to handle the creation, update, deletion of
   the blocks.

#### Block Role

1. `title` - To render text as a Title
2. `subTitle` - To render text as a SubTitle
3. `heading` - To render text as a Heading
4. `subHeading` - To render text as a SubHeading
5. `paragraph` - To render text as a Paragraph
6. `quote` - To render content as quote
7. `bulletList` - To render bullet list
8. `numberedList` - To render numbered list
9. `image` - To render contents an image
