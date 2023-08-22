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
import { type Block, type Siblings, type Style } from "../interfaces";
import { generateRandomString } from "./SharedUtils";
import { BLOCK_NODE, NODE_TYPE } from "../constants";
import RenderType from "../enums/RenderType";
import { camelCase } from "lodash";

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
      [camelCase(name)]: camelCase(value),
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
      return RenderType.IMAGE;
    default:
      return RenderType.UNKNOWN;
  }
}

export function blockRenderTypeFromNode(node: HTMLElement): RenderType {
  if (node.parentElement?.tagName.toLowerCase() === "li")
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

export function traverseAndUpdate(
  masterBlocks: Block[],
  targetBlock: Block
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      masterBlocks[i] = targetBlock;
    }
    if (blockRenderTypeFromRole(masterBlocks[i].role) === RenderType.LIST) {
      traverseAndUpdate(masterBlocks[i].content as Block[], targetBlock);
    }
  }
}

export function traverseAndUpdateBelow(
  masterBlocks: Block[],
  parentBlock: Block,
  targetBlock: Block
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === parentBlock.id) {
      masterBlocks.splice(i + 1, 0, targetBlock);
    }
    if (blockRenderTypeFromRole(masterBlocks[i].role) === RenderType.LIST) {
      traverseAndUpdate(masterBlocks[i].content as Block[], targetBlock);
    }
  }
}

export function traverseAndFindBlockPosition(
  masterBlocks: Block[],
  targetBlock: Block
): number {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      return i;
    }
    if (blockRenderTypeFromRole(masterBlocks[i].role) === RenderType.LIST) {
      traverseAndUpdate(masterBlocks[i].content as Block[], targetBlock);
    }
  }
  return -1;
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
    default:
      if (node.parentElement?.parentElement?.tagName.toLowerCase() === "ul")
        return "bulletList";
      if (node.parentElement?.parentElement?.tagName.toLowerCase() === "ol")
        return "numberedList";
      return "paragraph";
  }
}

export function serializeNodeToBlock(node: HTMLElement): Block {
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
      content: blocks,
      role: getBlockRoleFromNode(node),
      style,
    };
  }

  if (node.tagName.toLowerCase() === "img") {
    const imageNode = node as HTMLImageElement;
    return {
      id: node.id,
      content: {
        url: imageNode.src,
        description: imageNode.alt,
        width: imageNode.width,
        height: imageNode.height,
      },
      role: getBlockRoleFromNode(node),
      style,
    };
  }

  if (
    node.tagName.toLowerCase() === "div" &&
    node.firstElementChild?.tagName.toLowerCase() === "input"
  ) {
    return {
      id: node.id,
      content: {
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
    content: node.innerHTML,
    role: getBlockRoleFromNode(node),
    style,
  };
}

export function getEditorRoot(): HTMLElement {
  const blockDOM = Array.from(
    document.querySelectorAll(`[${NODE_TYPE}="editor-root"]`).values()
  );
  return blockDOM[0] as HTMLElement;
}
