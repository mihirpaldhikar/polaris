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

import { createRef, type JSX } from "react";
import { Canvas } from "../Canvas";
import { type Block, type Coordinates } from "../../interfaces";
import {
  areInlineSpecifierEqual,
  generateBlockId,
  getBlockNode,
  getNodeAt,
  isInlineSpecifierNode,
  joinElements,
  nodeOffset,
  setCaretOffset,
  splitElement,
} from "../../utils";
import { type Content } from "../../types";

interface ComposerProps {
  editable: boolean;
  previousBlock: Block | null;
  block: Block;
  nextBlock: Block | null;
  onChange: (block: Block) => void;
  onCreate: (
    currentBlock: Block,
    newBlock: Block,
    position: "above" | "below"
  ) => void;
  onCreateList: (parentBlock: Block, newChildBlock: Block) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    childNodeIndex: number,
    caretOffset: number
  ) => void;
  onListChildDelete: (
    parentBlock: Block,
    childBlockIndex: number,
    caretOffset: number,
    childNodeIndex: number
  ) => void;
  onPaste: (
    block: Block,
    content: Content | Content[],
    caretOffset: number
  ) => void;
  onSelect: (block: Block) => void;
  onCommandKeyPressed: (
    nodeIndex: number,
    block: Block,
    previousContent: Content,
    caretOffset: number
  ) => void;
  onImageRequest: (block: Block, file: File) => void;
  onContextMenu: (
    block: Block,
    coordinates: Coordinates,
    caretOffset: number
  ) => void;
}

/**
 * @function Composer
 *
 * @param editable
 * @param actionMenuOpen
 * @param previousBlock
 * @param block
 * @param nextBlock
 * @param onChange
 * @param onCreate
 * @param onCreateList
 * @param onDelete
 * @param onListChildDelete
 * @param onPaste
 *
 * @param onSelect
 * @param onCommandKeyPressed
 * @description Composer is responsible for communicating with sibling blocks and handling events from the Canvas.
 *
 * @author Mihir Paldhikar
 */

export default function Composer({
  editable,
  previousBlock,
  block,
  nextBlock,
  onChange,
  onCreate,
  onCreateList,
  onDelete,
  onListChildDelete,
  onPaste,
  onSelect,
  onCommandKeyPressed,
  onImageRequest,
  onContextMenu,
}: ComposerProps): JSX.Element {
  function enterHandler(splitContent: boolean, caretOffset: number): void {
    const blockNode = getBlockNode(block.id) as HTMLElement;
    const nodeAtCaretOffset = getNodeAt(blockNode, caretOffset);
    const caretNodeOffset = nodeOffset(blockNode, nodeAtCaretOffset);
    const caretNodeOffsetWithInnerHTML = nodeOffset(
      blockNode,
      nodeAtCaretOffset,
      {
        includeInnerHTML: true,
      }
    );

    const newBlock: Block = {
      id: generateBlockId(),
      reference: createRef<HTMLElement>(),
      type: "text",
      role: "paragraph",
      content: "",
      style: [],
    };

    let currentBlockContent: string = "";
    let newBlockContent: string = "";

    if (splitContent) {
      if (
        blockNode.innerHTML.substring(0, caretOffset) ===
        blockNode.innerText.substring(0, caretOffset)
      ) {
        currentBlockContent = blockNode.innerHTML.substring(0, caretOffset);
        newBlockContent = blockNode.innerHTML.substring(caretOffset);
      } else {
        const htmlFragment = blockNode.innerHTML.substring(
          0,
          caretNodeOffsetWithInnerHTML
        );

        if (isInlineSpecifierNode(nodeAtCaretOffset)) {
          const caretNodeFragments = splitElement(
            nodeAtCaretOffset as HTMLElement,
            caretOffset - caretNodeOffset
          );
          currentBlockContent = htmlFragment.concat(caretNodeFragments[0]);
          newBlockContent = caretNodeFragments[1].concat(
            blockNode.innerHTML.substring(
              htmlFragment.length +
                (nodeAtCaretOffset as HTMLElement).outerHTML.length
            )
          );
        } else {
          currentBlockContent = htmlFragment.concat(
            (nodeAtCaretOffset.textContent as string).substring(
              0,
              caretOffset - caretNodeOffset
            )
          );

          newBlockContent = (nodeAtCaretOffset.textContent as string)
            .substring(caretOffset - caretNodeOffset)
            .concat(
              blockNode.innerHTML.substring(
                htmlFragment.length +
                  (nodeAtCaretOffset.textContent as string).length
              )
            );
        }
      }

      block.content = currentBlockContent;
      newBlock.content = newBlockContent;
      newBlock.role = block.role;
      newBlock.type = block.type;
      newBlock.style = block.style;
    }

    onCreate(block, newBlock, "below");
  }

  function deleteHandler(block: Block, joinContent: boolean): void {
    if (previousBlock === null) return;
    const currentNode = getBlockNode(block.id) as HTMLElement;
    const previousNode = previousBlock.reference?.current as HTMLElement;

    if (joinContent) {
      previousBlock.id = generateBlockId();

      if (
        previousNode.lastChild != null &&
        currentNode.firstChild != null &&
        isInlineSpecifierNode(previousNode.lastChild) &&
        isInlineSpecifierNode(currentNode.firstChild) &&
        areInlineSpecifierEqual(
          previousNode.lastChild as HTMLElement,
          currentNode.firstChild as HTMLElement
        )
      ) {
        previousBlock.content = previousNode.innerHTML
          .substring(
            0,
            nodeOffset(previousNode, previousNode.lastChild as Node, {
              includeInnerHTML: true,
            })
          )
          .concat(
            joinElements(
              previousNode.lastChild as HTMLElement,
              currentNode.firstChild as HTMLElement
            )
          )
          .concat(
            currentNode.innerHTML.substring(
              (currentNode.firstChild as HTMLElement).outerHTML.length
            )
          );
      } else {
        previousBlock.content = (previousBlock.content as string).concat(
          block.content as string
        );
      }
    }

    const computedCaretOffset =
      previousNode.lastChild != null
        ? previousNode.lastChild.nodeType === Node.ELEMENT_NODE
          ? (previousNode.lastChild.textContent as string).length
          : previousNode.lastChild.textContent?.length ??
            previousNode.innerText.length
        : previousNode.innerText.length;

    const childNodes: ChildNode[] = Array.from(previousNode.childNodes);

    onDelete(
      block,
      previousBlock,
      previousNode.lastChild == null
        ? -1
        : childNodes.indexOf(previousNode.lastChild),
      computedCaretOffset
    );
  }

  function navigationHandler(
    navigate: "up" | "down",
    caretOffset: number
  ): void {
    switch (navigate) {
      case "up": {
        if (previousBlock?.reference?.current != null) {
          const previousNode = previousBlock.reference.current;

          const jumpNode: Node =
            previousNode.lastChild?.textContent != null
              ? previousNode.lastChild.nodeType === Node.TEXT_NODE
                ? (previousNode.lastChild as Node)
                : (previousNode.lastChild.firstChild as Node)
              : previousNode;

          const computedCaretOffset: number =
            caretOffset === -1 ||
            caretOffset >= (jumpNode.textContent?.length as number)
              ? (jumpNode.textContent?.length as number)
              : caretOffset;

          setCaretOffset(jumpNode, computedCaretOffset);
        }
        break;
      }
      case "down": {
        if (nextBlock?.reference?.current != null) {
          const nextNode: HTMLElement = nextBlock.reference.current;

          const jumpNode: Node =
            nextNode.firstChild?.textContent != null
              ? nextNode.firstChild.nodeType === Node.TEXT_NODE
                ? (nextNode.firstChild as Node)
                : (nextNode.firstChild.firstChild as Node)
              : nextNode;

          const computedCaretOffset: number =
            caretOffset === -1
              ? 0
              : caretOffset >= (jumpNode.textContent?.length as number)
              ? (jumpNode.textContent?.length as number)
              : caretOffset;

          setCaretOffset(jumpNode, computedCaretOffset);
        }
        break;
      }
    }
  }

  function listEnterHandler(
    childBlockIndex: number,
    splitContent: boolean,
    caretOffset: number
  ): void {
    if (
      !Array.isArray(block.content) ||
      typeof block.content[childBlockIndex].content !== "string"
    )
      return;

    if (
      block.content.length - 1 === childBlockIndex &&
      (block.content[childBlockIndex].content as string).length === 0 &&
      caretOffset === 0
    ) {
      const textBlock: Block = {
        id: generateBlockId(),
        type: "text",
        role: "paragraph",
        reference: createRef<HTMLElement>(),
        content: "",
        style: [],
      };
      block.content.splice(childBlockIndex, 1);
      onCreate(block, textBlock, "below");
      return;
    }

    const newListChildBlock: Block = {
      id: generateBlockId(),
      type: "text",
      role: "listChild",
      content: "",
      style: [],
    };

    if (splitContent) {
      const tempNode = document.createElement("div");
      const listChildNode = getBlockNode(block.content[childBlockIndex].id);
      tempNode.innerHTML = block.content[childBlockIndex].content as string;
      if (listChildNode == null) {
        return;
      }
      const nodeAtCaretOffset = getNodeAt(listChildNode, caretOffset);
      const caretNodeOffset = nodeOffset(listChildNode, nodeAtCaretOffset);
      const caretNodeOffsetWithHTML = nodeOffset(
        listChildNode,
        nodeAtCaretOffset,
        {
          includeInnerHTML: true,
        }
      );
      if (isInlineSpecifierNode(nodeAtCaretOffset)) {
        const nodeSplitAtCaretOffset = splitElement(
          nodeAtCaretOffset as HTMLElement,
          caretOffset - caretNodeOffset
        );

        block.content[childBlockIndex].content = tempNode.innerHTML
          .substring(0, caretNodeOffsetWithHTML)
          .concat(nodeSplitAtCaretOffset[0]);

        newListChildBlock.content = nodeSplitAtCaretOffset[1].concat(
          tempNode.innerHTML.substring(
            caretNodeOffsetWithHTML +
              (nodeAtCaretOffset as HTMLElement).outerHTML.length
          )
        );
      } else if (
        listChildNode.innerHTML.substring(0, caretOffset) ===
        listChildNode.innerText.substring(0, caretOffset)
      ) {
        block.content[childBlockIndex].content = tempNode.innerHTML.substring(
          0,
          caretOffset
        );
        newListChildBlock.content = tempNode.innerHTML.substring(caretOffset);
      } else {
        block.content[childBlockIndex].content = tempNode.innerHTML
          .substring(0, caretNodeOffsetWithHTML)
          .concat(
            (nodeAtCaretOffset.textContent as string).substring(
              0,
              caretOffset - caretNodeOffset
            )
          );

        newListChildBlock.content = (nodeAtCaretOffset.textContent as string)
          .substring(caretOffset - caretNodeOffset)
          .concat(
            tempNode.innerHTML.substring(
              caretNodeOffsetWithHTML +
                (nodeAtCaretOffset.textContent as string).length
            )
          );
      }
      newListChildBlock.style = block.content[childBlockIndex].style;
    }

    block.content.splice(childBlockIndex + 1, 0, newListChildBlock);

    onCreateList(block, newListChildBlock);
  }

  function deleteListChildHandler(
    childBlockIndex: number,
    joinContent: boolean
  ): void {
    if (!Array.isArray(block.content)) {
      return;
    }

    const tempNode = document.createElement("div");

    tempNode.innerHTML = block.content[childBlockIndex - 1].content as string;

    const childNodeArray: Node[] = Array.from(tempNode.childNodes);

    if (
      joinContent &&
      typeof block.content[childBlockIndex].content === "string" &&
      typeof block.content[childBlockIndex - 1].content === "string"
    ) {
      block.content[childBlockIndex - 1].content = (
        block.content[childBlockIndex - 1].content as string
      ).concat(block.content[childBlockIndex].content as string);
    }

    block.content.splice(childBlockIndex, 1);

    const computedCaretOffset =
      childNodeArray[childNodeArray.length - 1] === undefined
        ? 0
        : (childNodeArray[childNodeArray.length - 1].textContent ?? "").length;

    const computedChildNodeIndex =
      childNodeArray[childNodeArray.length - 1] === undefined
        ? -1
        : childNodeArray.length - 1;

    onListChildDelete(
      block,
      childBlockIndex - 1,
      computedCaretOffset,
      computedChildNodeIndex
    );
  }

  function listNavigationHandler(
    childBlockIndex: number,
    navigate: "up" | "down",
    caretOffset: number
  ): void {
    if (!Array.isArray(block.content)) {
      return;
    }

    const listChildNode = getBlockNode(
      block.content[childBlockIndex].id
    ) as HTMLElement;

    switch (navigate) {
      case "up": {
        const jumpNode: Node =
          listChildNode.lastChild?.textContent != null
            ? listChildNode.lastChild.nodeType === Node.TEXT_NODE
              ? (listChildNode.lastChild as Node)
              : (listChildNode.lastChild.firstChild as Node)
            : listChildNode;

        const computedCaretOffset: number =
          caretOffset === -1 ||
          caretOffset >= (jumpNode.textContent?.length as number)
            ? (jumpNode.textContent?.length as number)
            : caretOffset;

        setCaretOffset(jumpNode, computedCaretOffset);
        break;
      }
      case "down": {
        const jumpNode: Node =
          listChildNode.firstChild?.textContent != null
            ? listChildNode.firstChild.nodeType === Node.TEXT_NODE
              ? (listChildNode.firstChild as Node)
              : (listChildNode.firstChild.firstChild as Node)
            : listChildNode;

        const computedCaretOffset: number =
          caretOffset === -1
            ? 0
            : caretOffset >= (jumpNode.textContent?.length as number)
            ? (jumpNode.textContent?.length as number)
            : caretOffset;

        setCaretOffset(jumpNode, computedCaretOffset);
        break;
      }
    }
  }

  return (
    <Canvas
      editable={editable}
      block={block}
      onChange={onChange}
      onEnter={enterHandler}
      onDelete={deleteHandler}
      onNavigate={navigationHandler}
      onPaste={onPaste}
      onSelect={onSelect}
      onActionKeyPressed={onCommandKeyPressed}
      onListEnter={listEnterHandler}
      onListChildDelete={deleteListChildHandler}
      onListNavigate={listNavigationHandler}
      onImageRequest={onImageRequest}
      onContextMenu={onContextMenu}
    />
  );
}
