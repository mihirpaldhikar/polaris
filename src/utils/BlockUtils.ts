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

import { type Role } from "../types";
import {
  type Attachment,
  type Block,
  type PolarisConfig,
  type Siblings,
  type Style,
  type Table,
} from "../interfaces";
import { generateGitHubGistURL, getYouTubeVideoID } from "./SharedUtils";
import { BLOCK_NODE, LINK_ATTRIBUTE, NODE_TYPE } from "../constants";
import RenderType from "../enums/RenderType";
import { camelCase, kebabCase } from "lodash";
import { isInlineSpecifierNode } from "./DOMUtils";
import {
  type AttachmentBlockConfig,
  type ListBlockConfig,
  type TextBlockConfig,
} from "../interfaces/PolarisConfig";

/**
 * @function nodeTypeFromRole
 * @param role
 *
 * @description Returns string name of HTMLElement based on the block role.
 *
 * @returns string
 *
 * @author Mihir Paldhikar
 */

export function nodeTypeFromRole(role: Role): string {
  switch (role) {
    case "title":
      return "h1";
    case "subTitle":
      return "h2";
    case "heading":
      return "h3";
    case "subHeading":
      return "h4";
    case "paragraph":
      return "p";
    case "quote":
      return "blockquote";
    case "bulletList":
      return "ul";
    case "numberedList":
      return "ol";
    case "image":
      return "img";
    case "table":
      return "table";
    default:
      return "p";
  }
}

export function getConfigFromRole(
  role: Role,
  config: PolarisConfig,
): TextBlockConfig | AttachmentBlockConfig | ListBlockConfig | null {
  switch (role) {
    case "title":
      return config.text.title;
    case "subTitle":
      return config.text.subTitle;
    case "heading":
      return config.text.heading;
    case "subHeading":
      return config.text.subHeading;
    case "paragraph":
      return config.text.paragraph;
    case "quote":
      return config.text.quote;
    case "bulletList":
    case "numberedList":
      return config.list;
    case "youtubeVideoEmbed":
    case "githubGistEmbed":
    case "image":
      return config.attachment;
    default:
      return null;
  }
}

/**
 * @function setNodeStyle
 * @param style
 *
 * @description Converts array of style provided by the block to the browser compatible string of style.
 *
 * @returns Record<string, string>
 *
 *   @author Mihir Paldhikar
 */

export function setNodeStyle(style: Style[]): Record<string, string> {
  return style.reduce(
    (previousStyle, { name, value }) => ({
      ...previousStyle,
      [camelCase(name)]: camelCase(value),
    }),
    {},
  );
}

/**
 *
 * @param blockId
 * @returns HTMLElement | null
 *
 *@description Returns DOM Node of the provided blockId if block exists else returns null.
 *
 * @author Mihir Paldhikar
 */

export function getBlockNode(blockId: string): HTMLElement | null {
  const blockDOM = document.getElementById(blockId);
  if (blockDOM === null) return null;
  return blockDOM;
}

/**
 * @function getNodeSiblings
 *
 * @param blockId
 *
 * @description Finds the Siblings of the current Node from the provided BlockId. If no siblings exist either above or below then returns null for that sibling.
 *
 * @author Mihir Paldhikar
 */

export function getNodeSiblings(blockId: string): Siblings {
  const blockDOM = Array.from(
    document.querySelectorAll(`[${NODE_TYPE}="${BLOCK_NODE}"]`).values(),
  );
  const blockDOMIndex = blockDOM.map((blk) => blk.id).indexOf(blockId);
  return {
    previous:
      blockDOMIndex !== 0 ? getBlockNode(blockDOM[blockDOMIndex - 1].id) : null,
    next:
      blockDOMIndex !== blockDOM.length - 1
        ? getBlockNode(blockDOM[blockDOMIndex + 1].id)
        : null,
  };
}

/**
 * @function normalizeContent
 *
 * @param string
 *
 * @description Normalizes the text content by removing HTML specific HEX Codes.
 *
 * @author Mihir Paldhikar
 */

export function normalizeContent(string: string): string {
  return string.replaceAll(/&nbsp;|\u202F|\u00A0/g, " ");
}

export function blockRenderTypeFromRole(role: Role): RenderType {
  switch (role) {
    case "title":
    case "subTitle":
    case "heading":
    case "subHeading":
    case "paragraph":
    case "quote":
      return RenderType.TEXT;
    case "bulletList":
    case "numberedList":
      return RenderType.LIST;
    case "image":
    case "youtubeVideoEmbed":
    case "githubGistEmbed":
      return RenderType.ATTACHMENT;
    case "table":
      return RenderType.TABLE;
    default:
      return RenderType.UNKNOWN;
  }
}

export function blockRenderTypeFromNode(node: HTMLElement): RenderType {
  if (
    node.tagName.toLowerCase() === "div" &&
    node.firstElementChild?.tagName.toLowerCase() === "input"
  ) {
    return RenderType.ATTACHMENT;
  }
  if (
    node.parentElement?.tagName.toLowerCase() === "li" &&
    node.tagName.toLowerCase() !== "table"
  )
    return RenderType.LIST;
  switch (node.tagName.toLowerCase()) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "p":
    case "blockquote":
      return RenderType.TEXT;
    case "img":
    case "iframe":
      return RenderType.ATTACHMENT;
    case "table":
      return RenderType.TABLE;
    default:
      return RenderType.UNKNOWN;
  }
}

export function nodeHierarchy(node: HTMLElement | null): HTMLElement[] {
  if (node === null) return [];
  const hierarchy: HTMLElement[] = [];
  hierarchy.push(getBlockNode(node.id) as HTMLElement);
  while (
    hierarchy[hierarchy.length - 1].tagName.toLowerCase() !== "div" &&
    !hierarchy[hierarchy.length - 1].id.includes("editor")
  ) {
    const p = getBlockNode(hierarchy[hierarchy.length - 1].id);
    if (p?.parentElement != null) {
      if (p.parentElement?.tagName.toLowerCase() === "li") {
        hierarchy.push(p.parentElement.parentElement as HTMLElement);
      } else {
        hierarchy.push(p.parentElement);
      }
    } else {
      break;
    }
  }
  return hierarchy.reverse();
}

export function traverseAndUpdate(
  masterBlocks: Block[],
  targetBlock: Block,
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      masterBlocks[i] = targetBlock;
      return;
    } else if (
      blockRenderTypeFromRole(masterBlocks[i].role) === RenderType.LIST
    ) {
      traverseAndUpdate(masterBlocks[i].data as Block[], targetBlock);
    }
  }
}

export function traverseAndFind(
  masterBlocks: Block[],
  blockId: string,
): Block | null {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === blockId) {
      return masterBlocks[i];
    } else if (Array.isArray(masterBlocks[i].data)) {
      return traverseAndFind(masterBlocks[i].data as Block[], blockId);
    }
  }
  return null;
}

export function traverseAndDelete(
  masterBlocks: Block[],
  targetBlock: Block,
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      masterBlocks.splice(i, 1);
      return;
    } else if (
      blockRenderTypeFromRole(masterBlocks[i].role) === RenderType.LIST
    ) {
      traverseAndDelete(masterBlocks[i].data as Block[], targetBlock);
    }
  }
}

export function traverseAndUpdateBelow(
  masterBlocks: Block[],
  parentBlock: Block,
  targetBlock: Block,
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === parentBlock.id) {
      masterBlocks.splice(i + 1, 0, targetBlock);
      return;
    } else if (
      blockRenderTypeFromRole(masterBlocks[i].role) === RenderType.LIST
    ) {
      traverseAndUpdate(masterBlocks[i].data as Block[], targetBlock);
    }
  }
}

export function traverseAndFindBlockPosition(
  masterBlocks: Block[],
  targetBlock: Block,
): number {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      return i;
    }
    if (blockRenderTypeFromRole(masterBlocks[i].role) === RenderType.LIST) {
      traverseAndUpdate(masterBlocks[i].data as Block[], targetBlock);
    }
  }
  return -1;
}

export function getParentBlock(
  masterBlocks: Block[],
  blockId: string,
): Block[] {
  const find = (block: Block): any =>
    block.id.includes(blockId) ||
    (Array.isArray(block.data) && block.data.find(find));
  return masterBlocks.filter(find);
}

export function getBlockRoleFromNode(node: HTMLElement): Role {
  switch (node.tagName.toLowerCase()) {
    case "h1":
      return "title";
    case "h2":
      return "subTitle";
    case "h3":
      return "heading";
    case "h4":
      return "subHeading";
    case "p":
      return "paragraph";
    case "img":
      return "image";
    case "blockquote":
      return "quote";
    case "ol":
      return "numberedList";
    case "ul":
      return "bulletList";
    case "iframe": {
      if (node.getAttribute("data-block-render-type") === "youtubeVideo")
        return "youtubeVideoEmbed";
      return "githubGistEmbed";
    }
    default:
      if (node.parentElement?.parentElement?.tagName.toLowerCase() === "ul")
        return "bulletList";
      if (node.parentElement?.parentElement?.tagName.toLowerCase() === "ol")
        return "numberedList";
      return "paragraph";
  }
}

export function serializeNodeToBlock(node: HTMLElement): Block {
  const tempNode = findBlockNodeFromNode(node);
  if (tempNode != null) {
    node = tempNode;
  }
  const style: Style[] = [];
  const cssTextArray: string[] = node.style.cssText.split(";");

  for (let i = 0; i < cssTextArray.length; i++) {
    if (cssTextArray[i].length !== 0) {
      style.push({
        name: camelCase(cssTextArray[i].split(":")[0].trim()),
        value: camelCase(cssTextArray[i].split(":")[1].trim()),
      });
    }
  }

  if (
    node.tagName.toLowerCase() === "ul" ||
    node.tagName.toLowerCase() === "ol"
  ) {
    const blocks: Block[] = [];
    const childNodes = node.children;
    for (let i = 0; i < childNodes.length; i++) {
      const tempNode = childNodes[i].firstElementChild;
      if (tempNode !== null) {
        blocks.push(serializeNodeToBlock(tempNode as HTMLElement));
      }
    }
    return {
      id: node.id,
      data: blocks,
      role: getBlockRoleFromNode(node),
      style,
    };
  }

  if (node.tagName.toLowerCase() === "img") {
    const imageNode = node as HTMLImageElement;
    return {
      id: node.id,
      data: {
        url: imageNode.src,
        description: imageNode.alt,
        width: imageNode.width,
        height: imageNode.height,
      },
      role: getBlockRoleFromNode(node),
      style,
    };
  }

  if (node.tagName.toLowerCase() === "iframe") {
    const embedNode = node as HTMLIFrameElement;
    return {
      id: node.id,
      data: {
        url: node.getAttribute("data-block-url") as string,
        description: "",
        width: parseInt(embedNode.width),
        height: parseInt(embedNode.height),
      },
      role: getBlockRoleFromNode(node),
      style,
    };
  }

  if (node.tagName.toLowerCase() === "table") {
    const table: Table = {
      rows: [],
    };
    const tableBody = node.firstElementChild as HTMLElement;
    for (let i = 0; i < tableBody.childElementCount; i++) {
      const row = tableBody.children[i] as HTMLElement;
      const columns: Block[] = [];
      for (let j = 0; j < row.childElementCount; j++) {
        const column = row.children[j] as HTMLElement;
        const columnStyle: Style[] = [];
        const cssTextArray: string[] = column.style.cssText.split(";");

        for (let i = 0; i < cssTextArray.length; i++) {
          if (cssTextArray[i].length !== 0) {
            columnStyle.push({
              name: camelCase(cssTextArray[i].split(":")[0].trim()),
              value: camelCase(cssTextArray[i].split(":")[1].trim()),
            });
          }
        }
        columns.push({
          id: column.id,
          role: "paragraph",
          data: column.innerHTML,
          style: columnStyle,
        });
      }
      table.rows.push({
        id: row.id,
        columns,
      });
    }
    return {
      id: node.id,
      role: "table",
      data: table,
      style,
    };
  }

  if (
    node.tagName.toLowerCase() === "div" &&
    node.getAttribute("data-block-render-type") === "attachment-placeholder"
  ) {
    return {
      id: node.id,
      data: {
        url: "",
        description: "",
        width: 0,
        height: 0,
      },
      role: "image",
      style,
    };
  }

  return {
    id: node.id,
    data: node.innerHTML,
    role: getBlockRoleFromNode(node),
    style,
  };
}

export function getEditorRoot(): HTMLElement {
  const blockDOM = Array.from(
    document.querySelectorAll(`[${NODE_TYPE}="editor-root"]`).values(),
  );
  return blockDOM[0] as HTMLElement;
}

export function serializeBlockToNode(block: Block): HTMLElement | null {
  if (
    window === undefined ||
    document === undefined ||
    window == null ||
    document == null ||
    (blockRenderTypeFromRole(block.role) === RenderType.ATTACHMENT &&
      typeof block.data === "object" &&
      (block.data as Attachment).url === "")
  ) {
    return null;
  }

  let node = document.createElement(nodeTypeFromRole(block.role));
  for (const style of block.style) {
    node.style.setProperty(kebabCase(style.name), kebabCase(style.value));
  }

  if (
    blockRenderTypeFromRole(block.role) === RenderType.TEXT &&
    typeof block.data === "string"
  ) {
    node.id = block.id;
    node.innerHTML = block.data;
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
    blockRenderTypeFromRole(block.role) === RenderType.ATTACHMENT &&
    typeof block.data === "object" &&
    (block.data as Attachment).url !== ""
  ) {
    node = document.createElement("div");
    for (const style of block.style) {
      node.style.setProperty(kebabCase(style.name), kebabCase(style.value));
    }
    node.style.setProperty("width", "100%");
    node.style.setProperty("padding-top", "15px");
    node.style.setProperty("padding-bottom", "15px");
    const childNode = document.createElement("div");
    childNode.style.setProperty("display", "inline-block");
    childNode.style.setProperty("width", "100%");
    const attachment = block.data as Attachment;

    if (block.role === "image") {
      const attachmentNode = document.createElement("img");
      attachmentNode.id = block.id;
      attachmentNode.style.setProperty("display", "inline-block");
      attachmentNode.style.setProperty("border", "none");
      attachmentNode.src = attachment.url;
      attachmentNode.alt = attachment.description;
      attachmentNode.width = attachment.width;
      attachmentNode.height = attachment.height;
      childNode.innerHTML = attachmentNode.outerHTML;
    } else if (block.role === "youtubeVideoEmbed") {
      const attachmentNode = document.createElement("iframe");
      attachmentNode.id = block.id;
      attachmentNode.style.setProperty("display", "inline-block");
      attachmentNode.style.setProperty("border", "none");
      attachmentNode.src = `https://www.youtube.com/embed/${getYouTubeVideoID(
        attachment.url,
      )}`;
      attachmentNode.width = `${attachment.width}px`;
      attachmentNode.height = `${attachment.height}px`;
      childNode.innerHTML = attachmentNode.outerHTML;
    } else if (block.role === "githubGistEmbed") {
      const gistDocument = `
   data:text/html;charset=utf-8,
   <head>
     <base target="_blank" />
     <title></title>
   </head>
   <body id="gist-${block.id}" onload="adjustFrame()">
     <style>
       * {
         margin: 0;
         padding: 0;
       }
     </style>
     <script src="${generateGitHubGistURL(attachment.url)}"></script>
     <script>
       function adjustFrame() {
         window.top.postMessage({
           height: document.body.scrollHeight,
           id: document.body.id.replace("gist-", "") 
         }, "*");
       }
     </script>
   </body>
      `;
      const attachmentNode = document.createElement("iframe");
      attachmentNode.id = block.id;
      attachmentNode.style.setProperty("display", "inline-block");
      attachmentNode.style.setProperty("border", "none");
      attachmentNode.width = "100%";
      attachmentNode.style.border = "none";
      attachmentNode.src = gistDocument;
      childNode.innerHTML = attachmentNode.outerHTML;
    }
    node.appendChild(childNode);
  } else if (
    blockRenderTypeFromRole(block.role) === RenderType.LIST &&
    Array.isArray(block.data)
  ) {
    for (let i = 0; i < block.data.length; i++) {
      node.style.setProperty("list-style-position", "outside");
      node.style.setProperty(
        "list-style-type",
        block.role === "numberedList" ? "decimal" : "disc",
      );
      const listNode = document.createElement("li");
      listNode.style.setProperty("margin-left", "3px");
      listNode.style.setProperty("margin-right", "3px");
      const listChild = serializeBlockToNode(block.data[i]);
      if (listChild !== null) {
        listNode.innerHTML = listChild.outerHTML;
      }
      node.appendChild(listNode);
    }
  } else if (block.role === "table") {
    node.id = block.id;
    node.style.setProperty("display", "block");
    node.style.setProperty("table-layout", "auto");
    node.style.setProperty("border-collapse", "collapse");
    node.style.setProperty("overflow-x", "auto");
    const tableData = block.data as Table;
    const tableBody = document.createElement("tbody");
    for (let i = 0; i < tableData.rows.length; i++) {
      const row = document.createElement("tr");
      row.id = tableData.rows[i].id;
      for (let j = 0; j < tableData.rows[i].columns.length; j++) {
        const cell = document.createElement(i === 0 ? "th" : "td");
        cell.id = tableData.rows[i].columns[j].id;
        cell.innerHTML = tableData.rows[i].columns[j].data as string;
        for (const style of tableData.rows[i].columns[j].style) {
          cell.style.setProperty(kebabCase(style.name), kebabCase(style.value));
        }
        cell.style.setProperty("padding-left", "0.75rem");
        cell.style.setProperty("padding-right", "0.75rem");
        cell.style.setProperty("padding-top", "0.5rem");
        cell.style.setProperty("padding-bottom", "0.5rem");
        cell.style.setProperty("border", "1px solid #d1d5db");
        for (const childNode of cell.childNodes) {
          if (isInlineSpecifierNode(childNode)) {
            const element = childNode as HTMLElement;
            if (element.getAttribute(LINK_ATTRIBUTE) !== null) {
              const anchorNode = document.createElement("a");
              anchorNode.href = element.getAttribute(LINK_ATTRIBUTE) as string;
              anchorNode.target = "_blank";
              anchorNode.innerText = element.innerText;
              anchorNode.style.cssText = element.style.cssText;
              cell.replaceChild(anchorNode, element);
            }
          }
        }
        row.appendChild(cell);
      }
      tableBody.appendChild(row);
    }
    node.appendChild(tableBody);
  }

  return node;
}

export function getPlaceholderFromRole(role: Role): string {
  switch (role) {
    case "title":
      return "Title...";
    case "subTitle":
      return "Subtitle...";
    case "heading":
      return "Heading...";
    case "subHeading":
      return "Subheading...";
    default:
      return "Press '/' for commands...";
  }
}

export function findBlockNodeFromNode(node: HTMLElement): HTMLElement | null {
  if (node.getAttribute("data-type") === BLOCK_NODE) return node;
  if (
    (node.firstElementChild as HTMLElement).getAttribute("data-type") ===
    BLOCK_NODE
  )
    return node.firstElementChild as HTMLElement;
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].getAttribute("data-type") === BLOCK_NODE)
      return children[i] as HTMLElement;
    else if (children[i].childElementCount > 1) {
      return findBlockNodeFromNode(children[i] as HTMLElement);
    }
  }
  return null;
}

export function upsertStyle(arr: Style[], newObj: Style): Style[] {
  return [...arr.filter((obj) => obj.name !== newObj.name), { ...newObj }];
}

export function findPreviousTextNode(
  node: HTMLElement | Element,
  navigate: "top" | "left",
): HTMLElement | null {
  const previousNodeId = node.getAttribute(`data-${navigate}-node-id`);
  if (previousNodeId != null && previousNodeId !== "null") {
    const targetNode = getBlockNode(previousNodeId);
    if (targetNode != null) {
      return targetNode;
    }
  } else if (previousNodeId === "null") {
    const parentNodeId = node.getAttribute("data-parent-block-id");
    if (parentNodeId != null) {
      const parentNode = getBlockNode(parentNodeId);
      if (parentNode?.previousElementSibling != null)
        return parentNode.previousElementSibling as HTMLElement;
      return null;
    } else {
      return null;
    }
  }
  const textElements = Array.from(
    document.querySelectorAll(`[contenteditable="true"]`).values(),
  );
  const blockDOMIndex = textElements.map((blk) => blk).indexOf(node);
  if (blockDOMIndex === -1 || blockDOMIndex === 0) return null;
  else {
    return textElements[blockDOMIndex - 1] as HTMLElement;
  }
}

export function findNextTextNode(
  node: HTMLElement | Element,
  navigate: "bottom" | "right",
): HTMLElement | null {
  const nextNodeId = node.getAttribute(`data-${navigate}-node-id`);
  if (nextNodeId != null && nextNodeId !== "null") {
    const targetNode = getBlockNode(nextNodeId);
    if (targetNode != null) {
      return targetNode;
    }
  } else if (nextNodeId === "null") {
    const parentNodeId = node.getAttribute("data-parent-block-id");
    if (parentNodeId != null) {
      const parentNode = getBlockNode(parentNodeId);
      if (parentNode?.nextElementSibling != null)
        return parentNode.nextElementSibling as HTMLElement;
      return null;
    } else {
      return null;
    }
  }
  const textElements = Array.from(
    document.querySelectorAll(`[contenteditable="true"]`).values(),
  );
  const blockDOMIndex = textElements.map((blk) => blk).indexOf(node);
  if (blockDOMIndex === -1 || blockDOMIndex === textElements.length - 1)
    return null;
  else {
    return textElements[blockDOMIndex + 1] as HTMLElement;
  }
}
