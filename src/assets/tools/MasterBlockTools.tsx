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

import { type Menu } from "../../interfaces";
import { generateMenuId } from "../../utils";
import {
  AlignCenterIcon,
  AlignEndIcon,
  AlignStartIcon,
  BulletListIcon,
  HeadingIcon,
  ImageIcon,
  NumberedListIcon,
  ParagraphIcon,
  QuoteIcon,
  SubHeadingIcon,
  SubTitleIcon,
  TitleIcon,
} from "../icons";

const MasterBlockTools: readonly Menu[] = [
  {
    id: generateMenuId(),
    name: "Title",
    description: `Big section Heading`,
    icon: <TitleIcon size={32} />,
    allowedOn: ["subTitle", "heading", "subHeading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: "title",
    },
  },
  {
    id: generateMenuId(),
    name: "Sub Title",
    description: `Big section Subheading`,
    icon: <SubTitleIcon size={32} />,
    allowedOn: ["title", "heading", "subHeading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: "subTitle",
    },
  },
  {
    id: generateMenuId(),
    name: "Heading",
    description: `Small Section heading`,
    icon: <HeadingIcon size={32} />,
    allowedOn: ["title", "subTitle", "subHeading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: "heading",
    },
  },
  {
    id: generateMenuId(),
    name: "Subheading",
    description: `Small Section Subheading`,
    icon: <SubHeadingIcon size={32} />,
    allowedOn: ["title", "subTitle", "heading", "paragraph", "quote"],
    execute: {
      type: "role",
      args: "subHeading",
    },
  },
  {
    id: generateMenuId(),
    name: "Paragraph",
    description: `Just start typing`,
    icon: <ParagraphIcon size={32} />,
    allowedOn: ["title", "subTitle", "heading", "subHeading", "quote"],
    execute: {
      type: "role",
      args: "paragraph",
    },
  },
  {
    id: generateMenuId(),
    name: "Quote",
    description: `Capture a quote`,
    icon: <QuoteIcon size={32} />,
    allowedOn: ["paragraph"],
    execute: {
      type: "role",
      args: "quote",
    },
  },
  {
    id: generateMenuId(),
    name: "Bullets List",
    description: `Create simple list`,
    icon: <BulletListIcon size={35} />,
    allowedOn: ["paragraph"],
    execute: {
      type: "role",
      args: "bulletList",
    },
  },
  {
    id: generateMenuId(),
    name: "Numbered List",
    description: `Create list with numbering`,
    icon: <NumberedListIcon size={35} />,
    allowedOn: ["paragraph"],
    execute: {
      type: "role",
      args: "numberedList",
    },
  },
  {
    id: generateMenuId(),
    name: "Image",
    description: `Add an image`,
    icon: <ImageIcon size={32} />,
    allowedOn: ["paragraph"],
    execute: {
      type: "role",
      args: "image",
    },
  },
  {
    id: generateMenuId(),
    name: "Align Start",
    description: `Align text to start`,
    icon: <AlignStartIcon size={32} />,
    allowedOn: [
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
    id: generateMenuId(),
    name: "Align Center",
    description: `Align text at the center`,
    icon: <AlignCenterIcon size={32} />,
    allowedOn: [
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
    id: generateMenuId(),
    name: "Align End",
    description: `Align text at the end`,
    icon: <AlignEndIcon size={32} />,
    allowedOn: [
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

export default MasterBlockTools;
