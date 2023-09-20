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

import {
  type Action,
  type Attachment,
  type Coordinates,
  type Style,
} from "../../interfaces";
import { generateUUID, getBlockNode } from "../../utils";
import {
  AlignCenterIcon,
  AlignEndIcon,
  AlignStartIcon,
  ChangeIcon,
  DeleteIcon,
  ResizeIcon,
} from "../icons";
import { Fragment } from "react";
import { SizeDialog } from "../../components/SizeDialog";

export const AttachmentActions: Action[] = [
  {
    id: generateUUID(),
    name: "Align Left",
    icon: <AlignStartIcon size={30} />,
    allowedRoles: ["image", "youtubeVideoEmbed"],
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        const style: Style = {
          name: "text-align",
          value: "left",
        };
        const index = block.style.map((sty) => sty.name).indexOf(style.name);
        if (index === -1) {
          block.style.push(style);
        } else {
          block.style[index] = style;
        }
        onChange(block);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Align Center",
    icon: <AlignCenterIcon size={30} />,
    allowedRoles: ["image", "youtubeVideoEmbed"],
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        const style: Style = {
          name: "text-align",
          value: "center",
        };
        const index = block.style.map((sty) => sty.name).indexOf(style.name);
        if (index === -1) {
          block.style.push(style);
        } else {
          block.style[index] = style;
        }
        onChange(block);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Align Right",
    icon: <AlignEndIcon size={30} />,
    allowedRoles: ["image", "youtubeVideoEmbed"],
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        const style: Style = {
          name: "text-align",
          value: "right",
        };
        const index = block.style.map((sty) => sty.name).indexOf(style.name);
        if (index === -1) {
          block.style.push(style);
        } else {
          block.style[index] = style;
        }
        onChange(block);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Resize",
    icon: <ResizeIcon size={30} />,
    allowedRoles: ["image", "youtubeVideoEmbed"],
    execute: {
      type: "blockFunction",
      args: (block, onChange, _onDelete, _popupRoot, dialogRoot) => {
        if (dialogRoot !== undefined) {
          const currentNode = getBlockNode(block.id) as HTMLElement;
          const coordinates: Coordinates = {
            y: currentNode.getBoundingClientRect().y,
            x: currentNode.getBoundingClientRect().right,
          };

          dialogRoot.render(
            <SizeDialog
              initialSize={{
                width: (block.data as Attachment).width,
                height: (block.data as Attachment).height,
              }}
              coordinates={coordinates}
              onConfirm={(width, height) => {
                (block.data as Attachment).width = width;
                (block.data as Attachment).height = height;
                onChange(block);
              }}
              onClose={() => {
                dialogRoot.render(<Fragment />);
              }}
            />,
          );
        }
      },
    },
  },
  {
    id: generateUUID(),
    name: "Change",
    icon: <ChangeIcon size={30} />,
    allowedRoles: ["image", "youtubeVideoEmbed", "githubGistEmbed"],
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        (block.data as Attachment).url = "";
        onChange(block);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Remove",
    icon: <DeleteIcon size={30} />,
    allowedRoles: ["image", "youtubeVideoEmbed", "githubGistEmbed"],
    execute: {
      type: "blockFunction",
      args: (block, _onChange, onDelete) => {
        onDelete(block);
      },
    },
  },
];
