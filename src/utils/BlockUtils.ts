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

import { type BlockSchema, type Style } from "../interfaces";
import { camelCase } from "lodash";
import { NODE_TYPE } from "../constants";

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

export function traverseAndUpdate(
  masterBlocks: BlockSchema[],
  targetBlock: BlockSchema,
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      masterBlocks[i] = targetBlock;
      return;
    } else if (
      Array.isArray(masterBlocks[i].data) &&
      typeof masterBlocks[i].role === "string" &&
      (masterBlocks[i].role as string).toLowerCase().includes("list")
    ) {
      traverseAndUpdate(masterBlocks[i].data as BlockSchema[], targetBlock);
    }
  }
}

export function traverseAndFind(
  masterBlocks: BlockSchema[],
  blockId: string,
): BlockSchema | null {
  const listBlocks: BlockSchema[] = [];

  for (const block of masterBlocks) {
    if (block.id === blockId) return block;
    else if (Array.isArray(block.data)) {
      listBlocks.push(block);
    }
  }

  for (const listBlock of listBlocks) {
    if (Array.isArray(listBlock.data)) {
      return traverseAndFind(listBlock.data, blockId);
    }
  }
  return null;
}

export function traverseAndDelete(
  masterBlocks: BlockSchema[],
  targetBlock: BlockSchema,
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      masterBlocks.splice(i, 1);
      return;
    } else if (
      Array.isArray(masterBlocks[i].data) &&
      typeof masterBlocks[i].role === "string" &&
      (masterBlocks[i].role as string).toLowerCase().includes("list")
    ) {
      traverseAndDelete(masterBlocks[i].data as BlockSchema[], targetBlock);
    }
  }
}

export function traverseAndUpdateBelow(
  masterBlocks: BlockSchema[],
  parentBlock: BlockSchema,
  targetBlock: BlockSchema,
): void {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === parentBlock.id) {
      masterBlocks.splice(i + 1, 0, targetBlock);
      return;
    } else if (
      Array.isArray(masterBlocks[i].data) &&
      typeof masterBlocks[i].role === "string" &&
      (masterBlocks[i].role as string).toLowerCase().includes("list")
    ) {
      traverseAndUpdate(masterBlocks[i].data as BlockSchema[], targetBlock);
    }
  }
}

export function traverseAndFindBlockPosition(
  masterBlocks: BlockSchema[],
  targetBlock: BlockSchema,
): number {
  for (let i = 0; i < masterBlocks.length; i++) {
    if (masterBlocks[i].id === targetBlock.id) {
      return i;
    }
    if (
      Array.isArray(masterBlocks[i].data) &&
      typeof masterBlocks[i].role === "string" &&
      (masterBlocks[i].role as string).toLowerCase().includes("list")
    ) {
      traverseAndFindBlockPosition(
        masterBlocks[i].data as BlockSchema[],
        targetBlock,
      );
    }
  }
  return -1;
}

export function getEditorRoot(): HTMLElement {
  const blockDOM = Array.from(
    document.querySelectorAll(`[${NODE_TYPE}="editor-root"]`).values(),
  );
  return blockDOM[0] as HTMLElement;
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
    if (parentNodeId != null && parentNodeId !== "null") {
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
    if (parentNodeId != null && parentNodeId !== "null") {
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

export function getListMetadata(node: HTMLElement): {
  parentId: string;
  childIndex: number;
} | null {
  const nodeParentId = node.getAttribute("data-parent-block-id");
  const nodeChildIndex = node.getAttribute("data-child-block-index");

  if (nodeParentId != null && nodeChildIndex != null) {
    return {
      parentId: nodeParentId,
      childIndex: parseInt(nodeChildIndex),
    };
  }

  return null;
}
