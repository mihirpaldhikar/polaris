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

import type React from "react";
import { type BlockLifecycle, type GenericBlockPlugin } from "../../interfaces";
import { generateUUID, isInlineAnnotationsNode } from "../../utils";
import TitleBlock from "./TitleBlock";
import { TitleIcon } from "../../assets";
import { type TextBlockSchema } from "../../schema";
import { kebabCase } from "lodash";
import { LINK_ATTRIBUTE } from "../../constants";

export default class TitleBlockPlugin
  implements GenericBlockPlugin<TextBlockSchema>
{
  description: string;
  icon: React.JSX.Element;
  name: string;
  role: string;

  constructor() {
    this.name = "Title";
    this.description = "Big section heading.";
    this.role = "title";
    this.icon = <TitleIcon />;
  }

  onInitialized(content: string): {
    focusBlockId: string;
    setCaretToStart?: boolean;
    inPlace?: boolean;
    template: TextBlockSchema;
  } {
    const focusId = generateUUID();
    return {
      focusBlockId: focusId,
      inPlace: true,
      template: {
        id: focusId,
        role: "title",
        data: content,
        style: [],
      },
    };
  }

  serializeToHTMLElement(block: TextBlockSchema): HTMLElement {
    const node = document.createElement("h1");
    node.id = block.id;
    for (const style of block.style) {
      node.style.setProperty(kebabCase(style.name), kebabCase(style.value));
    }
    node.innerHTML = block.data;
    for (const childNode of node.childNodes) {
      if (isInlineAnnotationsNode(childNode)) {
        const element = childNode as HTMLElement;
        if (element.getAttribute(LINK_ATTRIBUTE) !== null) {
          const anchorNode = document.createElement("a");
          anchorNode.href = element.getAttribute(LINK_ATTRIBUTE) as string;
          anchorNode.target = "_blank";
          anchorNode.innerText = element.innerText;
          anchorNode.style.cssText = element.style.cssText;
          node.replaceChild(anchorNode, element);
        }
      }
    }
    return node;
  }

  render(block: TextBlockSchema, lifecycle: BlockLifecycle): React.JSX.Element {
    return <TitleBlock block={block} blockLifecycle={lifecycle} />;
  }
}
