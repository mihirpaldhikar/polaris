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
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  LinkIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TextBackgroundColorIcon,
  TextColorIcon,
  TextSizeIcon,
  UnderlineIcon,
} from "../icons";
import { REMOVE_COLOR, REMOVE_LINK, REMOVE_STYLE } from "../../constants";

const MasterInlineTools: readonly Menu[] = [
  {
    id: generateMenuId(),
    name: "Bold",
    icon: <BoldIcon />,
    execute: {
      type: "style",
      args: [
        {
          name: "font-weight",
          value: "bold",
        },
      ],
    },
  },
  {
    id: generateMenuId(),
    name: "Italic",
    icon: <ItalicIcon />,
    execute: {
      type: "style",
      args: [
        {
          name: "font-style",
          value: "italic",
        },
      ],
    },
  },
  {
    id: generateMenuId(),
    name: "Underline",
    icon: <UnderlineIcon />,
    execute: {
      type: "style",
      args: [
        {
          name: "text-decoration",
          value: "underline",
        },
      ],
    },
  },
  {
    id: generateMenuId(),
    name: "Link",
    separator: true,
    icon: <LinkIcon />,
    execute: {
      type: "input",
      args: {
        hint: "Add Link..",
        type: "text",
        executionTypeAfterInput: "link",
        initialPayload: "",
        payloadIfRemovedClicked: REMOVE_LINK,
        validStringRegExp:
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/,
      },
    },
  },
  {
    id: generateMenuId(),
    name: "Text Size",
    separator: true,
    icon: <TextSizeIcon />,
    execute: {
      type: "input",
      args: {
        hint: "Text Size..",
        type: "number",
        unit: "px",
        executionTypeAfterInput: "style",
        initialPayload: {
          name: "font-size",
          value: "",
        },
        payloadIfRemovedClicked: REMOVE_STYLE,
        validStringRegExp: /^[0-9]*$/,
      },
    },
  },
  {
    id: generateMenuId(),
    name: "Text Color",
    icon: <TextColorIcon />,
    execute: {
      type: "input",
      args: {
        hint: "HEX Code",
        type: "color",
        executionTypeAfterInput: "style",
        initialPayload: {
          name: "color",
          value: "",
        },
        payloadIfRemovedClicked: REMOVE_COLOR,
        validStringRegExp: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    },
  },
  {
    id: generateMenuId(),
    name: "Text Background Color",
    icon: <TextBackgroundColorIcon />,
    execute: {
      type: "input",
      args: {
        hint: "HEX Code",
        type: "color",
        executionTypeAfterInput: "style",
        initialPayload: {
          name: "background-color",
          value: "",
        },
        payloadIfRemovedClicked: REMOVE_COLOR,
        validStringRegExp: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    },
  },
  {
    id: generateMenuId(),
    name: "Code",
    icon: <CodeIcon />,
    execute: {
      type: "style",
      args: [
        {
          name: "font-family",
          value: "monospace",
        },
        {
          name: "background-color",
          value: "#e8e6e6",
        },
        {
          name: "border-radius",
          value: "3px",
        },
        {
          name: "padding",
          value: "2px",
        },
      ],
    },
  },
  {
    id: generateMenuId(),
    name: "Superscript",
    icon: <SuperscriptIcon />,
    execute: {
      type: "style",
      args: [
        {
          name: "vertical-align",
          value: "super",
        },
        {
          name: "line-height",
          value: "1",
        },
      ],
    },
  },
  {
    id: generateMenuId(),
    name: "Subscript",
    icon: <SubscriptIcon />,
    execute: {
      type: "style",
      args: [
        {
          name: "vertical-align",
          value: "sub",
        },
        {
          name: "line-height",
          value: "1",
        },
      ],
    },
  },
];

export default MasterInlineTools;
