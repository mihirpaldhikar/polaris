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

import { generateRandomString } from "./SharedUtils";
import { Coordinates } from "../interfaces";

/**
 * @function generateRefreshKey
 *
 * @returns string
 *
 * @description Generates a unique key which is used to refresh the DOM.
 *
 * @author Mihir Paldhikar
 */

export function generateRefreshKey(): string {
  return generateRandomString(20);
}

/**
 *
 * @param element
 *
 * @returns number
 *
 * @description Get the caret offset from the focused Node.
 *
 *
 * @author Mihir Paldhikar
 */

export function getCaretOffset(element: HTMLElement): number {
  let position = 0;
  const selection = window.getSelection();
  if (selection !== null && selection.rangeCount !== 0) {
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    position = preCaretRange.toString().length;
  }
  return position;
}

/**
 * @function getCaretCoordinates
 *
 * @param fromStart
 *
 * @returns Coordinates
 *
 * @description Returns the caret coordinates of the focused Node in the current viewport.
 *
 * @author Mihir Paldhikar
 *
 */

export function getCaretCoordinates(fromStart: boolean = true): Coordinates {
  let x: number = 0;
  let y: number = 0;
  const isSupported = typeof window.getSelection !== "undefined";
  const selection = window.getSelection();
  if (isSupported && selection !== null) {
    if (selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(fromStart);
      const rect = range.getClientRects()[0];
      if (rect !== undefined) {
        x = rect.left;
        y = rect.top;
      }
    }
  }
  return { x, y } satisfies Coordinates;
}
