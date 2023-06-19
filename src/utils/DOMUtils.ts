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
import { type Coordinates, type Style } from "../interfaces";
import {
  INLINE_SPECIFIER_NODE,
  LINK_ATTRIBUTE,
  NODE_TYPE,
  REMOVE_LINK,
} from "../constants";

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

/**
 * @function setCaretOffset
 *
 * @param node
 * @param offset
 *
 * @description Set caret at provided offset in the provided Node.
 *
 * @author Mihir Paldhikar
 *
 */

export function setCaretOffset(node: Node, offset: number): void {
  const selection = window.getSelection();
  if (selection === null) return;

  const selectedRange = document.createRange();
  selectedRange.setStart(node, offset);
  selectedRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(selectedRange);

  if (node.parentElement !== null) {
    node.parentElement.focus();

    if (!nodeInViewPort(node.parentElement)) {
      node.parentElement.scrollIntoView();
    }
  }
}

/**
 * @function nodeInViewPort
 * @param node
 *
 * @description Checks if the provided node is in the viewport or not.
 *
 * @author Mihir Paldhikar
 */

export function nodeInViewPort(node: HTMLElement): boolean {
  const rect = node.getBoundingClientRect();

  if (rect !== undefined) {
    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < (window.innerWidth ?? document.documentElement.clientWidth) &&
      rect.top < (window.innerHeight ?? document.documentElement.clientHeight)
    );
  }
  return false;
}

/**
 *
 * @function nodeOffset
 *
 * @param parentNode
 * @param targetNode
 * @param options
 *
 * @description Returns the offset of the Target Node from the Parent Node.
 *
 * @author Mihir Paldhikar
 */

export function nodeOffset(
  parentNode: HTMLElement,
  targetNode: Node,
  options?: { includeInnerHTML?: boolean }
): number {
  let offset: number = 0;
  for (let i = 0; i < parentNode.childNodes.length; i++) {
    if (parentNode.childNodes[i].isEqualNode(targetNode)) {
      break;
    }
    offset =
      options?.includeInnerHTML !== undefined && options.includeInnerHTML
        ? parentNode.childNodes[i].nodeType === Node.ELEMENT_NODE
          ? offset + (parentNode.childNodes[i] as HTMLElement).outerHTML.length
          : offset + (parentNode.childNodes[i].textContent?.length as number)
        : offset + (parentNode.childNodes[i].textContent?.length as number);
  }

  return offset;
}

/**
 *
 * @function splitElement
 *
 * @param targetElement
 * @param offset
 *
 * @description Splits the element from the offset.
 *
 * @author Mihir Paldhikar
 */

export function splitElement(
  targetElement: HTMLElement,
  offset: number
): string[] {
  const fragments: string[] = [];
  const tempElement = targetElement.cloneNode(true) as HTMLElement;
  const firstHalf = targetElement.innerText.substring(0, offset);
  const secondHalf = targetElement.innerText.substring(offset);
  tempElement.innerText = firstHalf;
  fragments.push(tempElement.outerHTML);
  tempElement.innerText = secondHalf;
  fragments.push(tempElement.outerHTML);
  return fragments;
}

/**
 *
 * @function splitElement
 *
 * @param parentElement
 * @param targetElement
 *
 * @description Splits the element from the offset.
 *
 * @author Mihir Paldhikar
 */

export function joinElements(
  parentElement: HTMLElement,
  targetElement: HTMLElement
): string {
  const tempElement = parentElement.cloneNode(true) as HTMLElement;
  tempElement.innerHTML = tempElement.innerHTML.concat(targetElement.innerHTML);
  return tempElement.outerHTML;
}

/**
 *
 * @function generateHTMLFragment
 *
 * @param startNode
 * @param startOffset
 * @param endNode
 * @param endOffset
 * @param targetNode
 *
 * @description Generates a HTML String from the Target Node.
 *
 * @author Mihir Paldhikar
 */

export function generateHTMLFragment(
  startNode: Node,
  startOffset: number,
  endNode: Node,
  endOffset: number,
  targetNode: Node
): string {
  let fragment: string = "";
  let foundStartNode: boolean = false;
  for (let i = 0; i < targetNode.childNodes.length; i++) {
    if (!targetNode.childNodes[i].isEqualNode(startNode) && !foundStartNode) {
      continue;
    } else {
      foundStartNode = true;
    }
    if (
      targetNode.childNodes[i].isEqualNode(endNode) &&
      endNode.nodeType === Node.ELEMENT_NODE
    ) {
      break;
    }
    if (targetNode.childNodes[i].nodeType === Node.ELEMENT_NODE) {
      fragment = fragment.concat(
        (targetNode.childNodes[i] as HTMLElement).outerHTML
      );
    } else {
      fragment = fragment.concat(
        targetNode.childNodes[i].textContent as string
      );
    }
    if (
      targetNode.childNodes[i].isEqualNode(endNode) &&
      endNode.nodeType === Node.TEXT_NODE
    ) {
      break;
    }
  }

  return startNode.nodeType === Node.ELEMENT_NODE &&
    endNode.nodeType === Node.ELEMENT_NODE
    ? splitElement(startNode as HTMLElement, startOffset)[1]
        .concat(fragment.substring((startNode as HTMLElement).outerHTML.length))
        .concat(splitElement(endNode as HTMLElement, endOffset)[0])
    : startNode.nodeType === Node.ELEMENT_NODE &&
      endNode.nodeType === Node.TEXT_NODE
    ? splitElement(startNode as HTMLElement, startOffset)[1].concat(
        fragment.substring(
          (startNode as HTMLElement).outerHTML.length,
          (startNode as HTMLElement).outerHTML.length + endOffset
        )
      )
    : startNode.nodeType === Node.TEXT_NODE &&
      endNode.nodeType === Node.ELEMENT_NODE
    ? fragment
        .substring(startOffset)
        .concat(splitElement(endNode as HTMLElement, endOffset)[0])
    : fragment.substring(startOffset, endOffset);
}

/**
 *
 * @function generateNodesFromHTMLFragment
 *
 * @param htmlFragment
 *
 * @description generates node from the provided HTML fragment. HTML Fragment is essentially a string of HTML.
 *
 * @author Mihir Paldhikar
 */

export function generateNodesFromHTMLFragment(htmlFragment: string): Node[] {
  const tempNode = document.createElement("div");
  const nodes: Node[] = [];
  tempNode.innerHTML = htmlFragment;
  for (let i = 0; i < tempNode.childNodes.length; i++) {
    nodes.push(tempNode.childNodes[i]);
  }
  return nodes;
}

/**
 *
 * @function generateInlineSpecifierString
 *
 * @param htmlFragment
 * @param style
 * @param link
 *
 * @description Creates string of HTML with provided styles and metadata.
 *
 * @author Mihir Paldhikar
 */

export function generateInlineSpecifierString(
  htmlFragment: string,
  style: Style[],
  link?: string
): string {
  const nodeFragments = generateNodesFromHTMLFragment(htmlFragment);
  let inlineSpecifierString = "";
  for (let i = 0; i < nodeFragments.length; i++) {
    const tempNode =
      nodeFragments[i].nodeType === Node.ELEMENT_NODE
        ? (nodeFragments[i] as HTMLElement)
        : document.createElement("span");

    tempNode.setAttribute(NODE_TYPE, INLINE_SPECIFIER_NODE);
    tempNode.innerText = nodeFragments[i].textContent as string;

    for (let i = 0; i < style.length; i++) {
      if (style[i].enabled ?? false) {
        tempNode.style.setProperty(style[i].name, style[i].value);
      } else {
        tempNode.style.removeProperty(style[i].name);
      }
    }

    if (link !== undefined && link !== REMOVE_LINK) {
      tempNode.setAttribute(LINK_ATTRIBUTE, link);
    } else if (link === undefined || link === REMOVE_LINK) {
      tempNode.removeAttribute(LINK_ATTRIBUTE);
    }

    inlineSpecifierString = inlineSpecifierString.concat(
      (tempNode.getAttribute("style") == null ||
        tempNode.getAttribute("style") === "") &&
        (link === undefined || link === REMOVE_LINK)
        ? tempNode.innerText
        : tempNode.outerHTML
    );
  }
  return inlineSpecifierString;
}

/**
 * @function generateInlineSpecifiers
 *
 * @param targetElement
 * @param selection
 * @param style
 * @param link
 *
 * @description Appends the inline specifiers with styles and metadata.
 *
 * @author Mihir Paldhikar
 */

export function generateInlineSpecifiers(
  targetElement: HTMLElement,
  selection: Selection | null,
  style: Style[],
  link?: string
): void {
  if (
    selection === null ||
    selection.focusNode == null ||
    selection.anchorNode == null ||
    selection.toString() === ""
  ) {
    return;
  }

  const range = selection.getRangeAt(0);

  let inlineSpecifiers: string = "";

  let deleteRangeContents: boolean = true;

  if (
    range.startContainer.isEqualNode(range.endContainer) &&
    range.startContainer.parentElement != null &&
    range.endContainer.parentElement != null
  ) {
    if (
      range.startContainer.parentElement.isEqualNode(targetElement) &&
      range.endContainer.parentElement.isEqualNode(targetElement) &&
      range.startContainer.parentElement.getAttribute(NODE_TYPE) !==
        INLINE_SPECIFIER_NODE &&
      range.endContainer.parentElement.getAttribute(NODE_TYPE) !==
        INLINE_SPECIFIER_NODE
    ) {
      inlineSpecifiers = generateInlineSpecifierString(
        generateHTMLFragment(
          range.startContainer,
          range.startOffset,
          range.endContainer,
          range.endOffset,
          targetElement
        ),
        style,
        link
      );
    }
    if (
      range.startContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE &&
      range.endContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE
    ) {
      const tempNode = generateNodesFromHTMLFragment(
        splitElement(range.startContainer.parentElement, range.startOffset)[1]
      )[0] as HTMLElement;

      tempNode.innerText = selection.toString();

      inlineSpecifiers = splitElement(
        range.startContainer.parentElement,
        range.startOffset
      )[0]
        .concat(generateInlineSpecifierString(tempNode.outerHTML, style, link))
        .concat(
          splitElement(range.endContainer.parentElement, range.endOffset)[1]
        );

      targetElement.removeChild(range.startContainer.parentElement);
      deleteRangeContents = false;
    }
  }
  if (
    !range.startContainer.isEqualNode(range.endContainer) &&
    range.startContainer.parentElement != null &&
    range.endContainer.parentElement != null
  ) {
    /// Start and End Container both are spanned.
    if (
      !range.startContainer.parentElement.isEqualNode(targetElement) &&
      !range.endContainer.parentElement.isEqualNode(targetElement) &&
      range.startContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE &&
      range.endContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE
    ) {
      inlineSpecifiers = generateHTMLFragment(
        range.startContainer.parentElement,
        range.startOffset,
        range.endContainer.parentElement,
        range.endOffset,
        targetElement
      );

      const generatedInlineStyling = generateInlineSpecifierString(
        inlineSpecifiers,
        style,
        link
      );

      inlineSpecifiers = splitElement(
        range.startContainer.parentElement,
        range.startOffset
      )[0]
        .concat(generatedInlineStyling)
        .concat(
          splitElement(range.endContainer.parentElement, range.endOffset)[1]
        );

      range.setStart(range.startContainer.parentElement, 0);
      range.setEnd(range.endContainer.parentElement, 1);
    }

    /// Start Container is spanned and End Container is not spanned.
    if (
      !range.startContainer.parentElement.isEqualNode(targetElement) &&
      range.endContainer.parentElement.isEqualNode(targetElement) &&
      range.startContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE &&
      range.endContainer.parentElement.getAttribute(NODE_TYPE) !==
        INLINE_SPECIFIER_NODE
    ) {
      inlineSpecifiers = generateHTMLFragment(
        range.startContainer.parentElement,
        range.startOffset,
        range.endContainer,
        range.endOffset,
        targetElement
      );

      const generatedInlineStyling = generateInlineSpecifierString(
        inlineSpecifiers,
        style,
        link
      );

      inlineSpecifiers = splitElement(
        range.startContainer.parentElement,
        range.startOffset
      )[0].concat(generatedInlineStyling);

      range.setStart(range.startContainer.parentElement, 0);
      range.setEnd(range.endContainer, range.endOffset);
    }

    /// Start Container is not spanned and End Container is spanned.
    if (
      range.startContainer.parentElement.isEqualNode(targetElement) &&
      !range.endContainer.parentElement.isEqualNode(targetElement) &&
      range.startContainer.parentElement.getAttribute(NODE_TYPE) !==
        INLINE_SPECIFIER_NODE &&
      range.endContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE
    ) {
      inlineSpecifiers = generateHTMLFragment(
        range.startContainer,
        range.startOffset,
        range.endContainer.parentElement,
        range.endOffset,
        targetElement
      );

      const generatedInlineStyling = generateInlineSpecifierString(
        inlineSpecifiers,
        style,
        link
      );

      inlineSpecifiers = generatedInlineStyling.concat(
        splitElement(range.endContainer.parentElement, range.endOffset)[1]
      );

      range.setStart(range.startContainer, range.startOffset);
      range.setEnd(range.endContainer.parentElement, 1);
    }

    if (
      range.startContainer.parentElement.isEqualNode(targetElement) &&
      range.endContainer.parentElement.isEqualNode(targetElement) &&
      range.startContainer.nodeType === Node.TEXT_NODE &&
      range.endContainer.nodeType === Node.TEXT_NODE
    ) {
      inlineSpecifiers = generateInlineSpecifierString(
        targetElement.innerHTML.substring(
          nodeOffset(targetElement, range.startContainer, {
            includeInnerHTML: true,
          }) + range.startOffset,
          nodeOffset(targetElement, range.endContainer, {
            includeInnerHTML: true,
          }) + range.endOffset
        ),
        style,
        link
      );
    }
  }
  const placeholderNode = document.createElement("span");
  selection.removeAllRanges();
  selection.addRange(range);
  if (deleteRangeContents) {
    range.deleteContents();
  }
  range.insertNode(placeholderNode);
  placeholderNode.insertAdjacentHTML("afterend", inlineSpecifiers);
  targetElement.removeChild(placeholderNode);
  selection.removeAllRanges();
  removeEmptyInlineSpecifiers(targetElement);
}

/**
 * @function elementContainsStyle
 * @param element
 * @param style
 *
 * @description Checks of the element has inline specifier styles.
 *
 * @author Mihir Paldhikar
 */

export function elementContainsStyle(
  element: HTMLElement,
  style: Style[]
): boolean {
  if (!isInlineSpecifierNode(element)) {
    return false;
  }
  const startNodeStyleArray = cssTextToStyle(element.style.cssText).map((s) => {
    return `${s.name}:${s.value}`;
  });

  const sty = style.map((s) => {
    return `${s.name}:${s.value}`;
  });

  return sty.every((k) => startNodeStyleArray.includes(k));
}

/**
 * @function inlineSpecifierLink
 *
 * @description Returns link of the inline specifier has a link embedded.
 *
 * @author Mihir Paldhikar
 */

export function inlineSpecifierLink(
  specifier?: HTMLElement
): string | undefined {
  if (specifier !== undefined && isInlineSpecifierNode(specifier)) {
    return specifier.getAttribute(LINK_ATTRIBUTE) ?? undefined;
  }
  const selection = window.getSelection();
  if (selection == null || selection.toString() === "") return undefined;

  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer.parentElement as HTMLElement;
  const endContainer = range.endContainer.parentElement as HTMLElement;

  if (
    !isInlineSpecifierNode(startContainer) ||
    !isInlineSpecifierNode(endContainer) ||
    startContainer.getAttribute(LINK_ATTRIBUTE) == null ||
    endContainer.getAttribute(LINK_ATTRIBUTE) == null ||
    startContainer.getAttribute(LINK_ATTRIBUTE) !==
      endContainer.getAttribute(LINK_ATTRIBUTE)
  ) {
    return undefined;
  }

  return startContainer.getAttribute(LINK_ATTRIBUTE) as string;
}

export function getNodeAt(parentNode: Node, offset: number): Node {
  let length: number = 0;
  let node: Node = parentNode;
  for (let i = 0; i < parentNode.childNodes.length; i++) {
    length = length + (parentNode.childNodes[i].textContent?.length as number);
    if (offset - length <= 0) {
      node = parentNode.childNodes[i];
      break;
    }
  }
  return node;
}

export function isInlineSpecifierNode(node: Node): boolean {
  return (
    node.nodeType === Node.ELEMENT_NODE &&
    (node as HTMLElement).getAttribute(NODE_TYPE) === INLINE_SPECIFIER_NODE
  );
}

export function removeEmptyInlineSpecifiers(parentElement: HTMLElement): void {
  const inlineSpecifierNodes = parentElement.querySelectorAll(
    `[${NODE_TYPE}="${INLINE_SPECIFIER_NODE}"]`
  );
  for (let i = 0; i < inlineSpecifierNodes.length; i++) {
    if (inlineSpecifierNodes[i].textContent?.length === 0) {
      inlineSpecifierNodes[i].remove();
    }
  }
}

export function areInlineSpecifierEqual(
  first: HTMLElement,
  second: HTMLElement
): boolean {
  return (
    first.style.cssText === second.style.cssText &&
    inlineSpecifierLink(first) === inlineSpecifierLink(second)
  );
}

export function cssTextToStyle(cssText: string): Style[] {
  const cssArray = cssText.split(";");
  cssArray.pop();
  return cssArray.map((cssStyle) => {
    return {
      name: cssStyle.split(":")[0].trim(),
      value: cssStyle.split(":")[1].trim(),
      enabled: true,
    } satisfies Style;
  });
}

export function inlineSpecifierManager(
  targetElement: HTMLElement,
  style: Style[],
  link?: string
): void {
  const selection = window.getSelection();

  if (selection == null || selection.toString() === "") return;

  const range = selection.getRangeAt(0);

  const startContainerParent = range.startContainer.parentElement;
  const endContainerParent = range.endContainer.parentElement;

  if (startContainerParent == null || endContainerParent == null) return;

  if (
    elementContainsStyle(startContainerParent, style) &&
    elementContainsStyle(endContainerParent, style)
  ) {
    style = style.map((sty) => {
      return {
        ...sty,
        enabled: sty.enabled ?? false,
      };
    });
  } else {
    style = style.map((sty) => {
      return {
        ...sty,
        enabled: sty.enabled ?? true,
      };
    });
  }

  if (
    inlineSpecifierLink(startContainerParent) ===
    inlineSpecifierLink(endContainerParent)
  ) {
    if (
      link === undefined &&
      inlineSpecifierLink(startContainerParent) !== undefined
    ) {
      link = inlineSpecifierLink(startContainerParent);
    } else if (
      link === undefined &&
      inlineSpecifierLink(startContainerParent) === undefined
    ) {
      link = undefined;
    } else if (
      link !== undefined &&
      link === REMOVE_LINK &&
      (inlineSpecifierLink(startContainerParent) === undefined ||
        inlineSpecifierLink(startContainerParent) !== undefined)
    ) {
      link = undefined;
    }
  }

  style.push(
    ...[
      {
        name: "text-decoration",
        value: "underline",
        enabled: link !== undefined,
      },
    ]
  );

  generateInlineSpecifiers(targetElement, selection, style, link);
}
