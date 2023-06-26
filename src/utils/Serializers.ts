/*
 * Copyright (c) 2023 Mihir Paldhikar
 *
 * Polaris is a proprietary software owned, developed and
 * maintained by Mihir Paldhikar.
 *
 * No part of the software should be distributed or reverse
 * engineered in any form without the permission of the owner.
 *
 * Doing so will result into a legal action without any prior notice.
 *
 * All Rights Reserved.
 */

import { type Blob, type Block } from "../interfaces";
import { createNodeFromRole } from "./BlockUtils";
import { LINK_ATTRIBUTE } from "../constants";
import { isInlineSpecifierNode } from "./DOMUtils";

export function serializeBlobToHTML(blob: Blob): string {
  const contents: Block[] = blob.contents;
  let htmlString: string = "";
  for (const block of contents) {
    if (block.role === "paragraph" && block.content.length === 0) {
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
      if (block.type === "text" && typeof block.content === "string") {
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
      } else if (block.type === "list" && Array.isArray(block.content)) {
        node.style.setProperty("list-style-position", "inside");
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
      }
      htmlString = htmlString.concat(node.outerHTML);
    }
  }

  return htmlString.replaceAll('data-type="inline-specifier"', "");
}
