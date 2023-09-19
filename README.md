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
8. [x] Embeds (YouTube Video, GitHub Gist)
9. [x] Tables

## Installation

```
npm install @mihirpaldhikar/polaris
```

## Usage

#### Creating an Editor

```tsx
import { DEFAULT_POLARIS_CONFIG, Editor, generateUUID } from "@mihirpaldhikar/polaris";

export default function MyApp(): JSX.Element {
  const blob: Blob = {
    id: "MB1624",
    name: "Polaris Doc",
    description: "A basic Polaris Document",
    author: "Mihir Paldhikar",
    blocks: [
      {
        id: generateUUID(),
        role: "title",
        data: "Introducing Polaris",
        style: []
      },
      {
        id: generateUUID(),
        role: "paragraph",
        data: "Polaris is a rich semantic content editor.",
        style: []
      }
    ]
  };

  function attachmentHandler(data: File | string): string {
    /**
     * Logic to handle image.
     * must return a url.
     */
    return fileURL;
  }

  return (
    <Fragment>
      <Editor
        blob={blob}
        config={DEFAULT_POLARIS_CONFIG}
        onAttachmentSelected={(data) => {
          return attachmentHandler(data);
        }}
      />
    </Fragment>
  );
}
```

#### Exporting Generated Blob to HTML

```ts
import { generateUUID, serializeBlobToHTML } from "@mihirpaldhikar/polaris";

const blob: Blob = {
  id: "MB1624",
  name: "Polaris Doc",
  description: "A basic Polaris Document",
  author: "Mihir Paldhikar",
  blocks: [
    {
      id: generateUUID(),
      role: "title",
      data: "Introducing Polaris",
      style: [],
    },
    {
      id: generateUUID(),
      role: "paragraph",
      data: "Polaris is a rich semantic content editor.",
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
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
  />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <meta name="description" content="A basic Polaris Document">
  <meta name="author" content="Mihir Paldhikar">
  <title>Polaris Doc</title>
</head>
<body>
<h1 id="4da4d82a-4efc-45ac-bfdf-d78a06a392f6">Introducing Polaris</h1>
<p id="9b74c5a2-0807-4eaf-a1bd-33ea5ea74557">
  Polaris is a rich semantic content editor.
</p>
<script type="text/javascript">
  window.onmessage = function(messageEvent) {
    const height = messageEvent.data.height;
    const gistFrame = document.getElementById(messageEvent.data.id);
    if (gistFrame != null) {
      gistFrame.style.height = height + "px";
    }
  };
</script>
</body>
</html>
```

#### Configuring The Editor

The Text Size, Line Height, Spacing in Lists and Attachments can be configured using `PolarisConfig` which is passed
as `config` property to the Editor. For all the values, the default unit is in `rem`.

Default Config:

```typescript
const DEFAULT_POLARIS_CONFIG: PolarisConfig = {
  block: {
    text: {
      title: {
        fontSize: 2.25,
        fontWight: 800,
        lineHeight: 2.3,
      },
      subTitle: {
        fontSize: 1.875,
        fontWight: 700,
        lineHeight: 2,
      },
      heading: {
        fontSize: 1.5,
        fontWight: 600,
        lineHeight: 1.9,
      },
      subHeading: {
        fontSize: 1.25,
        fontWight: 500,
        lineHeight: 1.8,
      },
      paragraph: {
        fontSize: 1,
        fontWight: 400,
        lineHeight: 1.75,
      },
      quote: {
        fontSize: 1,
        fontWight: 500,
        lineHeight: 1.75,
      },
    },
    attachment: {
      spacing: 1,
    },
    list: {
      spacing: 1,
    },
  },
};
```

### Important Notes:

- If you are using React 18 & above or frameworks like Next.js, you need to explicitly specify the page or component
  consuming the Polaris Editor as a client component.
- Serialization from `Blob` to `HTML` only works on the Client Side as it uses `DOM` behind the scene to convert `Blob`
  to
  corresponding `HTML`.

## Upcoming Features

1. [ ] Code

#### Terminologies

1. `block` - A Block is the smallest unit holding all the necessary information required to render blocks.
2. `blob` - A Blob is a collection of blocks holding all the information and position of the blocks.
3. `composer` - A Composer uses block to determine how to render blocks.
4. `editor` - An Editor is an orchestrator for all the blocks. It uses blob to handle the creation, update, deletion of
   the blocks.

#### Block Roles

1. `title` - To render text as a Title
2. `subTitle` - To render text as a SubTitle
3. `heading` - To render text as a Heading
4. `subHeading` - To render text as a SubHeading
5. `paragraph` - To render text as a Paragraph
6. `quote` - To render content as quote
7. `bulletList` - To render bullet list
8. `numberedList` - To render numbered list
9. `image` - To render blocks an image
10. `youtubeVideoEmbed` - To Embed YouTube Video.
11. `githubGistEmbed` - To Embed GitHub Gist.
12. `table` - To Add tabular content.
