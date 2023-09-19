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

import {
  type Attachment,
  type Block,
  type Coordinates,
  type Style,
  type Table,
} from "../interfaces";
import {
  INLINE_SPECIFIER_NODE,
  LINK_ATTRIBUTE,
  NODE_TYPE,
  REMOVE_LINK,
} from "../constants";
import {
  blockRenderTypeFromRole,
  getBlockNode,
  nodeTypeFromRole,
} from "./BlockUtils";
import {
  generateGitHubGistURL,
  generateUUID,
  getYouTubeVideoID,
} from "./SharedUtils";
import RenderType from "../enums/RenderType";
import { kebabCase } from "lodash";

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

export function getCaretOffset(element: HTMLElement | null): number {
  let position = 0;
  if (element === null) return position;
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
  options?: { includeInnerHTML?: boolean },
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
  offset: number,
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
  targetNode: Node,
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
        (targetNode.childNodes[i] as HTMLElement).outerHTML,
      );
    } else {
      fragment = fragment.concat(
        targetNode.childNodes[i].textContent as string,
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
          (startNode as HTMLElement).outerHTML.length + endOffset,
        ),
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
  link?: string,
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
        : tempNode.outerHTML,
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
  link?: string,
): void {
  if (
    selection?.focusNode == null ||
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
          targetElement,
        ),
        style,
        link,
      );
    }
    if (
      range.startContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE &&
      range.endContainer.parentElement.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE
    ) {
      const tempNode = generateNodesFromHTMLFragment(
        splitElement(range.startContainer.parentElement, range.startOffset)[1],
      )[0] as HTMLElement;

      tempNode.innerText = selection.toString();

      inlineSpecifiers = splitElement(
        range.startContainer.parentElement,
        range.startOffset,
      )[0]
        .concat(generateInlineSpecifierString(tempNode.outerHTML, style, link))
        .concat(
          splitElement(range.endContainer.parentElement, range.endOffset)[1],
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
        targetElement,
      );

      const generatedInlineStyling = generateInlineSpecifierString(
        inlineSpecifiers,
        style,
        link,
      );

      inlineSpecifiers = splitElement(
        range.startContainer.parentElement,
        range.startOffset,
      )[0]
        .concat(generatedInlineStyling)
        .concat(
          splitElement(range.endContainer.parentElement, range.endOffset)[1],
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
        targetElement,
      );

      const generatedInlineStyling = generateInlineSpecifierString(
        inlineSpecifiers,
        style,
        link,
      );

      inlineSpecifiers = splitElement(
        range.startContainer.parentElement,
        range.startOffset,
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
        targetElement,
      );

      const generatedInlineStyling = generateInlineSpecifierString(
        inlineSpecifiers,
        style,
        link,
      );

      inlineSpecifiers = generatedInlineStyling.concat(
        splitElement(range.endContainer.parentElement, range.endOffset)[1],
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
          }) + range.endOffset,
        ),
        style,
        link,
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
  style: Style[] | Style,
): boolean {
  if (!isInlineSpecifierNode(element)) {
    return false;
  }

  let cssString: string = "";

  if (!Array.isArray(style)) {
    return element.style.getPropertyValue(style.name) !== "";
  }

  for (const s of style) {
    cssString = cssString.concat(
      `${s.name}:${s.name.includes("color") ? hexToRgb(s.value) : s.value};`,
    );
  }

  return element.style.cssText.replaceAll(" ", "").trim().includes(cssString);
}

/**
 * @function inlineSpecifierLink
 *
 * @description Returns link of the inline specifier has a link embedded.
 *
 * @author Mihir Paldhikar
 */

export function inlineSpecifierLink(
  specifier?: HTMLElement,
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
    `[${NODE_TYPE}="${INLINE_SPECIFIER_NODE}"]`,
  );
  for (let i = 0; i < inlineSpecifierNodes.length; i++) {
    if (inlineSpecifierNodes[i].textContent?.length === 0) {
      inlineSpecifierNodes[i].remove();
    }
  }
}

export function inlineSpecifierManager(
  targetElement: HTMLElement,
  style: Style[],
  link?: string,
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

  if (link !== undefined) {
    style.push(
      ...[
        {
          name: "text-decoration",
          value: "underline",
          enabled: true,
        },
      ],
    );
  }

  generateInlineSpecifiers(targetElement, selection, style, link);
}

export function RGBToHex(r: number, g: number, b: number): string {
  let red = r.toString(16);
  let green = g.toString(16);
  let blue = b.toString(16);

  if (red.length === 1) red = "0" + red;
  if (green.length === 1) green = "0" + green;
  if (blue.length === 1) blue = "0" + blue;

  return "#" + red + green + blue;
}

export function rgbStringToHex(rgb: string): string {
  const rgbArr = rgb
    .replaceAll("rgb", "")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .split(",");
  return RGBToHex(
    parseInt(rgbArr[0]),
    parseInt(rgbArr[1]),
    parseInt(rgbArr[2]),
  );
}

export function hexToRgb(hex: string): string {
  const hexCharacters = "a-f\\d";
  const match3or4Hex = `#?[${hexCharacters}]{3}[${hexCharacters}]?`;
  const match6or8Hex = `#?[${hexCharacters}]{6}([${hexCharacters}]{2})?`;
  const nonHexChars = new RegExp(`[^#${hexCharacters}]`, "gi");
  const validHexSize = new RegExp(`^${match3or4Hex}$|^${match6or8Hex}$`, "i");
  if (nonHexChars.test(hex) || !validHexSize.test(hex)) {
    return "";
  }

  hex = hex.replace(/^#/, "");

  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  if (hex.length === 4) {
    hex = hex.slice(0, 3);
  }

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const number = Number.parseInt(hex, 16);
  const red = number >> 16;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  return `rgb(${red},${green},${blue})`;
}

export function getNodeIndex(
  parentElement: HTMLElement,
  targetNode: Node,
): number {
  const childNodes: Node[] = Array.from(parentElement.childNodes);
  const index = childNodes.indexOf(targetNode);
  return parentElement.lastChild?.textContent === "" ? index - 1 : index;
}

export function openLinkInNewTab(event: MouseEvent): void {
  if (event.ctrlKey) {
    const nodeAtMouseCoordinates = document.elementFromPoint(
      event.clientX,
      event.clientY,
    );

    if (nodeAtMouseCoordinates == null) return;

    if (
      nodeAtMouseCoordinates.getAttribute(NODE_TYPE) ===
        INLINE_SPECIFIER_NODE &&
      nodeAtMouseCoordinates.getAttribute(LINK_ATTRIBUTE) != null
    ) {
      setTimeout(() => {
        window.open(
          nodeAtMouseCoordinates.getAttribute(LINK_ATTRIBUTE) as string,
          "_blank",
        );
      }, 10);
    }
  }
}

export function splitBlocksAtCaretOffset(
  block: Block,
  caretOffset: number,
): Block[] {
  const blockNode = getBlockNode(block.id) as HTMLElement;
  const nodeAtCaretOffset = getNodeAt(blockNode, caretOffset);
  const caretNodeOffset = nodeOffset(blockNode, nodeAtCaretOffset);
  const caretNodeOffsetWithInnerHTML = nodeOffset(
    blockNode,
    nodeAtCaretOffset,
    {
      includeInnerHTML: true,
    },
  );

  const newBlock: Block = {
    id: generateUUID(),
    role: "paragraph",
    data: "",
    style: [],
  };

  let currentBlockContent: string;
  let newBlockContent: string;

  if (
    blockNode.innerHTML.substring(0, caretOffset) ===
    blockNode.innerText.substring(0, caretOffset)
  ) {
    currentBlockContent = blockNode.innerHTML.substring(0, caretOffset);
    newBlockContent = blockNode.innerHTML.substring(caretOffset);
  } else {
    const htmlFragment = blockNode.innerHTML.substring(
      0,
      caretNodeOffsetWithInnerHTML,
    );

    if (isInlineSpecifierNode(nodeAtCaretOffset)) {
      const caretNodeFragments = splitElement(
        nodeAtCaretOffset as HTMLElement,
        caretOffset - caretNodeOffset,
      );
      currentBlockContent = htmlFragment.concat(caretNodeFragments[0]);
      newBlockContent = caretNodeFragments[1].concat(
        blockNode.innerHTML.substring(
          htmlFragment.length +
            (nodeAtCaretOffset as HTMLElement).outerHTML.length,
        ),
      );
    } else {
      currentBlockContent = htmlFragment.concat(
        (nodeAtCaretOffset.textContent as string).substring(
          0,
          caretOffset - caretNodeOffset,
        ),
      );

      newBlockContent = (nodeAtCaretOffset.textContent as string)
        .substring(caretOffset - caretNodeOffset)
        .concat(
          blockNode.innerHTML.substring(
            htmlFragment.length +
              (nodeAtCaretOffset.textContent as string).length,
          ),
        );
    }
  }
  block.id = generateUUID();
  block.data = currentBlockContent;
  newBlock.data = newBlockContent;
  newBlock.role = newBlockContent.length === 0 ? "paragraph" : block.role;
  newBlock.style = newBlockContent.length === 0 ? [] : block.style;

  return [block, newBlock];
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
