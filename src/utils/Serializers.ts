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

import { type Blob, type Block, type ImageContent } from "../interfaces";
import { blockRenderType, createNodeFromRole } from "./BlockUtils";
import { LINK_ATTRIBUTE } from "../constants";
import { isInlineSpecifierNode } from "./DOMUtils";
import RenderType from "../enums/RenderType";

export function serializeBlobToHTML(blob: Blob): string {
  const contents: Block[] = blob.contents;
  let htmlString: string = "";
  for (const block of contents) {
    if (
      block.role === "paragraph" &&
      typeof block.content === "string" &&
      block.content.length === 0
    ) {
      const lineBreakNode = document.createElement("br");
      htmlString = htmlString.concat(lineBreakNode.outerHTML);
    } else {
      const node = document.createElement(createNodeFromRole(block.role));
      for (const style of block.style) {
        node.style.setProperty(
          style.name.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()),
          style.value
        );
      }
      if (
        blockRenderType(block.role) === RenderType.TEXT &&
        typeof block.content === "string"
      ) {
        node.innerHTML = block.content;
        for (const childNode of node.childNodes) {
          if (isInlineSpecifierNode(childNode)) {
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
      } else if (
        blockRenderType(block.role) === RenderType.LIST &&
        Array.isArray(block.content)
      ) {
        node.style.setProperty("list-style-position", "inside");
        if (block.role === "numberedList") {
          node.style.setProperty("list-style-type", "decimal");
        } else {
          node.style.setProperty("list-style-type", "disc");
        }
        for (const list of block.content) {
          const listNode = document.createElement("li");
          listNode.innerHTML = list.content as string;
          for (const childNode of listNode.childNodes) {
            if (isInlineSpecifierNode(childNode)) {
              const element = childNode as HTMLElement;
              if (element.getAttribute(LINK_ATTRIBUTE) !== null) {
                const anchorNode = document.createElement("a");
                anchorNode.href = element.getAttribute(
                  LINK_ATTRIBUTE
                ) as string;
                anchorNode.target = "_blank";
                anchorNode.innerText = element.innerText;
                anchorNode.style.cssText = element.style.cssText;
                listNode.replaceChild(anchorNode, element);
              }
            }
          }
          node.appendChild(listNode);
        }
      } else if (
        blockRenderType(block.role) === RenderType.IMAGE &&
        block.role === "image"
      ) {
        const imageContent = block.content as ImageContent;
        if (imageContent.url === "") continue;
        node.setAttribute("src", imageContent.url);
        node.style.setProperty("height", `${imageContent.height}px`);
        node.style.setProperty("width", `${imageContent.width}px`);
        node.style.setProperty("display", "block");
        node.style.setProperty("margin-left", "auto");
        node.style.setProperty("margin-right", "auto");
        node.style.setProperty("border-radius", "6px");
      }
      htmlString = htmlString.concat(node.outerHTML);
    }
  }

  return htmlString.replaceAll('data-type="inline-specifier"', "");
}

export async function serializeFileToBase64(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result?.toString() ?? "");
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}
