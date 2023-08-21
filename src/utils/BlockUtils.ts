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
import { Block, type Siblings, type Style } from "../interfaces";
import { generateRandomString } from "./SharedUtils";
import { BLOCK_NODE, NODE_TYPE } from "../constants";
import RenderType from "../enums/RenderType";

/**
 * @function createNodeFromRole
 * @param role
 *
 * @description Returns string name of HTMLElement based on the block role.
 *
 * @returns string
 *
 * @author Mihir Paldhikar
 */

export function createNodeFromRole(role: Role): string {
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
    default:
      return "p";
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
      [name]: value,
    }),
    {}
  );
}

/**
 * @function generateBlockId
 *
 * @description Generates a unique id for the block.
 *
 * @author Mihir Paldhikar
 */

export function generateBlockId(): string {
  return generateRandomString(30);
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
    document.querySelectorAll(`[${NODE_TYPE}="${BLOCK_NODE}"]`).values()
  );
  const blockDOMIndex = blockDOM.findIndex((block) => block.id === blockId);
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

export function blockRenderType(role: Role): RenderType {
  switch (role) {
    case "title":
    case "subTitle":
    case "heading":
    case "subHeading":
    case "paragraph":
    case "quote":
    case "listChild":
      return RenderType.TEXT;
    case "bulletList":
    case "numberedList":
      return RenderType.LIST;
    case "image":
      return RenderType.IMAGE;
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

export function traverseAndUpdate(contents: Block[], targetId: string): void {
  for (let i = 0; i < contents.length; i++) {
    if (contents[i].id === targetId) {
      const node: HTMLElement = getBlockNode(contents[i].id) as HTMLElement;
      contents[i].content = node.innerHTML;
    }
    if (blockRenderType(contents[i].role) === RenderType.LIST) {
      traverseAndUpdate(contents[i].content as Block[], targetId);
    }
  }
}

export function getParentBlock(
  masterBlocks: Block[],
  blockId: string
): Block[] {
  const find = (block: Block): any =>
    block.id.includes(blockId) ||
    (Array.isArray(block.content) && block.content.find(find));
  return masterBlocks.filter(find);
}
