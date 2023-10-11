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

import { type BlockLifecycle, type GenericBlockPlugin } from "../../interfaces";
import type React from "react";
import { NumberedListIcon } from "../../assets";
import { generateUUID } from "../../utils";
import NumberedListBlock from "./NumberedListBlock";
import { type ListBlockSchema } from "../../schema";

export default class NumberedListBlockPlugin
  implements GenericBlockPlugin<ListBlockSchema>
{
  description: string;
  icon: React.JSX.Element;
  name: string;
  role: string;

  constructor() {
    this.name = "Numbered List";
    this.description = "Create list with numbers.";
    this.role = "numberedList";
    this.icon = <NumberedListIcon size={32} />;
  }

  onInitialized(content: string): {
    focusBlockId: string;
    setCaretToStart?: boolean;
    inPlace?: boolean;
    template: ListBlockSchema;
  } {
    const focusId = generateUUID();
    return {
      focusBlockId: focusId,
      inPlace: true,
      setCaretToStart: true,
      template: {
        id: generateUUID(),
        role: "numberedList",
        data: [
          {
            id: focusId,
            data: content,
            role: "paragraph",
            style: [],
          },
        ],
        style: [],
      },
    };
  }

  serializeToHTMLElement(block: ListBlockSchema): HTMLElement {
    const node = document.createElement("ol");
    for (let i = 0; i < block.data.length; i++) {
      node.style.setProperty("list-style-position", "outside");
      node.style.setProperty("list-style-type", "decimal");
      const listNode = document.createElement("li");
      listNode.style.setProperty("margin-left", "3px");
      listNode.style.setProperty("margin-right", "3px");
      if (window?.registeredBlocks.has(block.data[i].role)) {
        const listChild = (
          window.registeredBlocks.get(block.data[i].role) as GenericBlockPlugin
        ).serializeToHTMLElement(block.data[i]);
        if (listChild !== null) {
          listNode.innerHTML = listChild.outerHTML;
        }
        node.appendChild(listNode);
      }
    }
    return node;
  }

  render(block: ListBlockSchema, lifecycle: BlockLifecycle): React.JSX.Element {
    return <NumberedListBlock block={block} blockLifecycle={lifecycle} />;
  }
}
