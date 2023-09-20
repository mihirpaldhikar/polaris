/*
 * Copyright (c) Mihir Paldhikar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { type Action } from "../../interfaces";
import { generateUUID } from "../../utils";
import {
  AlignCenterIcon,
  AlignEndIcon,
  AlignStartIcon,
  BulletListIcon,
  GitHubIcon,
  HeadingIcon,
  ImageIcon,
  NumberedListIcon,
  ParagraphIcon,
  QuoteIcon,
  SubHeadingIcon,
  SubTitleIcon,
  TableIcon,
  TitleIcon,
  YouTubeIcon,
} from "../icons";

const BlockActions: readonly Action[] = [
  {
    id: generateUUID(),
    name: "Title",
    description: `Big section Heading`,
    icon: <TitleIcon size={32} />,
    allowedRoles: ["subTitle", "heading", "subHeading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: {
        role: "title",
        defaultTemplate: {
          id: generateUUID(),
          data: "",
          style: [],
          role: "title",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Sub Title",
    description: `Big section Subheading`,
    icon: <SubTitleIcon size={32} />,
    allowedRoles: ["title", "heading", "subHeading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: {
        role: "subTitle",
        defaultTemplate: {
          id: generateUUID(),
          data: "",
          style: [],
          role: "subTitle",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Heading",
    description: `Small Section heading`,
    icon: <HeadingIcon size={32} />,
    allowedRoles: ["title", "subTitle", "subHeading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: {
        role: "heading",
        defaultTemplate: {
          id: generateUUID(),
          data: "",
          style: [],
          role: "subHeading",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Subheading",
    description: `Small Section Subheading`,
    icon: <SubHeadingIcon size={32} />,
    allowedRoles: ["title", "subTitle", "heading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: {
        role: "subHeading",
        defaultTemplate: {
          id: generateUUID(),
          data: "",
          style: [],
          role: "subHeading",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Paragraph",
    description: `Just start typing`,
    icon: <ParagraphIcon size={32} />,
    allowedRoles: ["title", "subTitle", "heading", "subHeading", "quote"],
    execute: {
      type: "role",
      args: {
        role: "paragraph",
        defaultTemplate: {
          id: generateUUID(),
          data: "",
          style: [],
          role: "paragraph",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Quote",
    description: `Capture a quote`,
    icon: <QuoteIcon size={32} />,
    allowedRoles: ["paragraph"],
    execute: {
      type: "role",
      args: {
        role: "quote",
        defaultTemplate: {
          id: generateUUID(),
          data: "",
          style: [],
          role: "quote",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Table",
    description: `Add tabular content`,
    icon: <TableIcon size={32} />,
    allowedRoles: ["paragraph"],
    execute: {
      type: "role",
      args: {
        role: "table",
        defaultTemplate: {
          id: generateUUID(),
          style: [],
          role: "table",
          data: {
            rows: [
              {
                id: generateUUID(),
                columns: [
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                ],
              },
              {
                id: generateUUID(),
                columns: [
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                ],
              },
              {
                id: generateUUID(),
                columns: [
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                ],
              },
              {
                id: generateUUID(),
                columns: [
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                  {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Image",
    description: `Add an image`,
    icon: <ImageIcon size={32} />,
    allowedRoles: ["paragraph"],
    execute: {
      type: "role",
      args: {
        role: "image",
        defaultTemplate: {
          id: generateUUID(),
          data: {
            url: "",
            description: "",
            width: 500,
            height: 300,
          },
          style: [],
          role: "image",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Youtube Video",
    description: `Add YouTube video.`,
    icon: <YouTubeIcon size={30} />,
    allowedRoles: ["paragraph"],
    execute: {
      type: "role",
      args: {
        role: "youtubeVideoEmbed",
        defaultTemplate: {
          id: generateUUID(),
          data: {
            url: "",
            description: "",
            width: 500,
            height: 300,
          },
          style: [],
          role: "youtubeVideoEmbed",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "GitHub",
    description: `Add GitHub Gist`,
    icon: <GitHubIcon size={30} />,
    allowedRoles: ["paragraph"],
    execute: {
      type: "role",
      args: {
        role: "githubGistEmbed",
        defaultTemplate: {
          id: generateUUID(),
          data: {
            url: "",
            description: "",
            width: 500,
            height: 300,
          },
          style: [],
          role: "githubGistEmbed",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Bullets List",
    description: `Create simple list`,
    icon: <BulletListIcon size={35} />,
    allowedRoles: ["paragraph"],
    execute: {
      type: "role",
      args: {
        role: "bulletList",
        defaultTemplate: {
          id: generateUUID(),
          data: [
            {
              id: generateUUID(),
              role: "paragraph",
              data: "",
              style: [],
            },
          ],
          style: [],
          role: "bulletList",
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Numbered List",
    description: `Create list with numbering`,
    icon: <NumberedListIcon size={35} />,
    allowedRoles: ["paragraph"],
    execute: {
      type: "role",
      args: {
        role: "bulletList",
        defaultTemplate: {
          id: generateUUID(),
          style: [],
          role: "bulletList",
          data: [
            {
              id: generateUUID(),
              role: "paragraph",
              data: "",
              style: [],
            },
          ],
        },
      },
    },
  },
  {
    id: generateUUID(),
    name: "Align Start",
    description: `Align text to start`,
    icon: <AlignStartIcon size={32} />,
    allowedRoles: [
      "title",
      "subTitle",
      "heading",
      "subHeading",
      "paragraph",
      "numberedList",
      "bulletList",
    ],
    execute: {
      type: "style",
      args: [
        {
          name: "textAlign",
          value: "start",
        },
      ],
    },
  },
  {
    id: generateUUID(),
    name: "Align Center",
    description: `Align text at the center`,
    icon: <AlignCenterIcon size={32} />,
    allowedRoles: [
      "title",
      "subTitle",
      "heading",
      "subHeading",
      "paragraph",
      "numberedList",
      "bulletList",
    ],
    execute: {
      type: "style",
      args: [
        {
          name: "textAlign",
          value: "center",
        },
      ],
    },
  },
  {
    id: generateUUID(),
    name: "Align End",
    description: `Align text at the end`,
    icon: <AlignEndIcon size={32} />,
    allowedRoles: [
      "title",
      "subTitle",
      "heading",
      "subHeading",
      "paragraph",
      "numberedList",
      "bulletList",
    ],
    execute: {
      type: "style",
      args: [
        {
          name: "textAlign",
          value: "end",
        },
      ],
    },
  },
];

export default BlockActions;
