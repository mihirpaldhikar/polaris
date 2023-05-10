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

import { type ChangeEvent, createElement, Fragment, type JSX } from "react";
import { type Block } from "../../interfaces";
import {
  conditionalClassName,
  createNodeFromRole,
  getBlockNode,
  getCaretOffset,
  getNodeSiblings,
  setNodeStyle,
} from "../../utils";

interface CanvasProps {
  editable: boolean;
  block: Block;
  onChange: (block: Block) => void;
  onEnter: (splitContent: boolean, caretOffset: number) => void;
  onDelete: (block: Block, joinContent: boolean) => void;
}

/**
 * @function Canvas
 *
 * @param editable
 * @param block
 * @param onChange
 * @param onEnter
 * @param onDelete
 *
 * @returns JSX.Element
 *
 * @description Canvas is responsible for rendering the Node from the Block. It also manages and updates the content of the block when the Node is mutated.
 *
 * @author Mihir Paldhikar
 */

export default function Canvas({
  editable,
  block,
  onChange,
  onEnter,
  onDelete,
}: CanvasProps): JSX.Element {
  /**
   * @function notifyChange
   * @param event
   *
   * @description Whenever the Node is mutated, this function updates the content of the block and notifies the changes to the listeners.
   */
  function notifyChange(event: ChangeEvent<HTMLElement>): void {
    block.content = event.target.innerHTML;
    onChange(block);
  }

  /**
   * @function keyHandler
   * @param event
   *
   * @description Handles the events specified when keys are pressed.
   *
   * @author Mihir Paldhikar
   */

  function keyHandler(event: KeyboardEvent): void {
    const blockNode = getBlockNode(block.id);

    if (blockNode == null) return;

    switch (event.key.toLowerCase()) {
      case "enter": {
        event.preventDefault();

        const caretOffset = getCaretOffset(blockNode);

        onEnter(caretOffset !== blockNode.innerText.length, caretOffset);
        break;
      }
      case "backspace": {
        const caretOffset = getCaretOffset(blockNode);
        const nodeSiblings = getNodeSiblings(block.id);
        if (
          caretOffset === 0 &&
          nodeSiblings.previous != null &&
          nodeSiblings.previous.getAttribute("data-block-type") === block.type
        ) {
          event.preventDefault();
          onDelete(block, true);
        }
        break;
      }
      case "delete": {
        if (event.ctrlKey) {
          const nodeSiblings = getNodeSiblings(block.id);
          if (
            nodeSiblings.previous != null &&
            nodeSiblings.previous.getAttribute("data-block-type") === block.type
          ) {
            event.preventDefault();
            onDelete(block, false);
          }
        }
        break;
      }
    }
  }

  if (block.type === "text") {
    return createElement(createNodeFromRole(block.role), {
      "data-type": "block",
      "data-block-type": block.type,
      id: block.id,
      ref: block.reference,
      role: block.role,
      disabled: !editable,
      contentEditable: editable,
      dangerouslySetInnerHTML: { __html: block.content },
      style: setNodeStyle(block.style),
      spellCheck: true,
      className: conditionalClassName(
        "focus:outline-none focus:ring-0 outline-none ring-0 w-full cursor-text break-words",
        block.role === "title"
          ? "font-bold text-4xl"
          : block.role === "subTitle"
          ? "font-medium text-[24px]"
          : block.role === "heading"
          ? "font-bold text-[22px]"
          : block.role === "subHeading"
          ? "font-medium text-[19px]"
          : "font-normal text-[17px]"
      ),
      onInput: notifyChange,
      onKeyDown: keyHandler,
    });
  }

  /// If no valid block type is found, render an empty Fragment.
  return <Fragment />;
}
