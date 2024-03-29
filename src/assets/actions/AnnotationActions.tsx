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

const AnnotationActions: readonly Action[] = [
  {
    id: generateUUID(),
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
    id: generateUUID(),
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
    id: generateUUID(),
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
    id: generateUUID(),
    name: "Link",
    separator: true,
    icon: <LinkIcon />,
    execute: {
      type: "linkInput",
      args: {
        hint: "Add Link..",
        payload: "",
        regex:
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/,
      },
    },
  },
  {
    id: generateUUID(),
    name: "Text Size",
    separator: true,
    icon: <TextSizeIcon />,
    execute: {
      type: "styleInput",
      args: {
        hint: "Text Size..",
        inputType: "number",
        unit: "px",
        payload: {
          name: "font-size",
          value: "",
        },
        regex: /^[0-9]*$/,
      },
    },
  },
  {
    id: generateUUID(),
    name: "Text Color",
    icon: <TextColorIcon />,
    execute: {
      type: "styleInput",
      args: {
        hint: "HEX Code",
        inputType: "color",
        payload: {
          name: "color",
          value: "",
        },
        regex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    },
  },
  {
    id: generateUUID(),
    name: "Text Background Color",
    icon: <TextBackgroundColorIcon />,
    execute: {
      type: "styleInput",
      args: {
        hint: "HEX Code",
        inputType: "color",
        payload: {
          name: "background-color",
          value: "",
        },
        regex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    },
  },
  {
    id: generateUUID(),
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
    id: generateUUID(),
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
    id: generateUUID(),
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

export default AnnotationActions;
