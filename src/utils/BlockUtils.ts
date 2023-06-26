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

import { type Role } from "../types";
import { type Siblings, type Style } from "../interfaces";
import { generateRandomString } from "./SharedUtils";
import { BLOCK_NODE, NODE_TYPE } from "../constants";

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
