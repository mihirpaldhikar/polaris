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

import { createRef, type JSX, useState } from "react";
import { Canvas } from "../Canvas";
import { type Block } from "../../interfaces";
import {
  areInlineSpecifierEqual,
  generateBlockId,
  generateRefreshKey,
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
  onDelete: (
    block: Block,
    previousBlock: Block,
    childNodeIndex: number,
    caretOffset: number
  ) => void;
  onPaste: (
    block: Block,
    content: Content | Content[],
    caretOffset: number
  ) => void;
}

/**
 * @function Composer
 *
 * @param editable
 * @param previousBlock
 * @param block
 * @param nextBlock
 * @param onChange
 * @param onCreate
 * @param onDelete
 * @param onPaste
 *
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
  onDelete,
  onPaste,
}: ComposerProps): JSX.Element {
  const [refreshKey, setRefreshKey] = useState(generateRefreshKey());

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
        previousBlock.content = previousBlock.content.concat(block.content);
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

  return (
    <Canvas
      key={refreshKey}
      editable={editable}
      block={block}
      onChange={onChange}
      onEnter={enterHandler}
      onDelete={deleteHandler}
      onNavigate={navigationHandler}
      onPaste={onPaste}
    />
  );
}
