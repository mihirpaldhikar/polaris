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

## Installation

```
npm install @mihirpaldhikar/polaris
```

## Usage

#### Creating an Editor

```tsx
import { DEFAULT_POLARIS_CONFIG, Editor, generateBlockId } from "@mihirpaldhikar/polaris";

export default function MyApp(): JSX.Element {
  const blob: Blob = {
    id: "MB1624",
    name: "Polaris Doc",
    blocks: [
      {
        id: generateBlockId(),
        role: "title",
        data: "Introducing Polaris",
        style: []
      },
      {
        id: generateBlockId(),
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

  function saveBlob(blob: Blob): void {
    /**
     * Logic to save blob.
     */
  }

  return (
    <Fragment>
      <Editor
        blob={blob}
        config={DEFAULT_POLARIS_CONFIG}
        onAttachmentSelected={(data) => {
          return attachmentHandler(data);
        }}
        onSave={(blob) => {
          saveBlob(blob);
        }}
      />
    </Fragment>
  );
}
```

#### Exporting Generated Blob to HTML

```ts
import { generateBlockId, serializeBlobToHTML } from "@mihirpaldhikar/polaris";

const blob: Blob = {
  id: "MB1624",
  name: "Polaris Doc",
  blocks: [
    {
      id: generateBlockId(),
      role: "title",
      data: "Introducing Polaris",
      style: []
    },
    {
      id: generateBlockId(),
      role: "paragraph",
      data: "Polaris is a rich semantic content editor.",
      style: []
    }
  ]
};

function exportBlobToHTML(blob) {
  console.log(serializeBlobToHTML(blob));
}
```

Output

```html

<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Polaris Doc</title>
</head>
<body>
<h1>Introducing Polaris</h1>
<p>Polaris is a rich semantic content editor.</p>
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
  text: {
    title: {
      fontSize: 2.25
    },
    subTitle: {
      fontSize: 1.875
    },
    heading: {
      fontSize: 1.5
    },
    subHeading: {
      fontSize: 1.25
    },
    paragraph: {
      fontSize: 1
    },
    quote: {
      fontSize: 1
    }
  },
  attachment: {
    spacing: 1
  },
  list: {
    spacing: 1
  }
};
```

### Important Notes:

- If you are using React 18 & above or frameworks like Next.js, you need to explicitly specify the page or component
  consuming the Polaris Editor as a client component.
- Serialization from `Blob` to `HTML` only works on the Client Side as it uses `DOM` behind the scene to convert `Blob`
  to
  corresponding `HTML`.

## Upcoming Features

1. [ ] Tables
2. [ ] Code

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
