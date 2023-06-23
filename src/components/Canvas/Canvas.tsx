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

import {
  type ChangeEvent,
  createElement,
  Fragment,
  type JSX,
  useEffect,
  useRef,
} from "react";
import { type Block, type Style } from "../../interfaces";
import {
  conditionalClassName,
  createNodeFromRole,
  getBlockNode,
  getCaretCoordinates,
  getCaretOffset,
  getNodeAt,
  getNodeIndex,
  getNodeSiblings,
  inlineSpecifierManager,
  nodeOffset,
  setNodeStyle,
} from "../../utils";
import { type Content } from "../../types";
import {
  BLOCK_NODE,
  INLINE_SPECIFIER_NODE,
  LINK_ATTRIBUTE,
  NODE_TYPE,
} from "../../constants";

interface CanvasProps {
  editable: boolean;
  block: Block;
  onChange: (block: Block) => void;
  onEnter: (splitContent: boolean, caretOffset: number) => void;
  onDelete: (block: Block, joinContent: boolean) => void;
  onNavigate: (navigate: "up" | "down", caretOffset: number) => void;
  onPaste: (
    block: Block,
    content: Content | Content[],
    caretOffset: number
  ) => void;
  onSelect: (block: Block) => void;
  onActionKeyPressed: (
    nodeIndex: number,
    block: Block,
    previousContent: Content,
    caretOffset: number
  ) => void;
}

/**
 * @function Canvas
 *
 * @param editable
 * @param block
 * @param onChange
 * @param onEnter
 * @param onDelete
 * @param onNavigate
 * @param onPaste
 *
 * @param onSelect
 * @param onCommandKeyPressed
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
  onNavigate,
  onPaste,
  onSelect,
  onActionKeyPressed,
}: CanvasProps): JSX.Element {
  const action = useRef(false);

  useEffect(() => {
    window.addEventListener("actionMenuOpened", () => {
      action.current = true;
    });

    window.addEventListener("actionMenuClosed", () => {
      action.current = false;
    });
    return () => {
      window.removeEventListener("actionMenuOpened", () => {
        action.current = false;
      });

      window.removeEventListener("actionMenuClosed", () => {
        action.current = false;
      });
    };
  }, []);

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

  async function keyHandler(event: KeyboardEvent): Promise<void> {
    const blockNode = getBlockNode(block.id);

    if (blockNode == null) return;

    const caretOffset = getCaretOffset(blockNode);
    const nodeSiblings = getNodeSiblings(block.id);
    const caretCoordinates = getCaretCoordinates();

    switch (event.key.toLowerCase()) {
      case "enter": {
        event.preventDefault();
        if (action.current) {
          break;
        }
        onEnter(caretOffset !== blockNode.innerText.length, caretOffset);
        break;
      }
      case "backspace": {
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
      case "arrowleft": {
        if (
          (!event.ctrlKey || !event.shiftKey) &&
          caretOffset === 0 &&
          nodeSiblings.previous !== null &&
          nodeSiblings.previous.getAttribute("data-block-type") === block.type
        ) {
          event.preventDefault();
          onNavigate("up", -1);
        }

        break;
      }
      case "arrowright": {
        if (
          (!event.ctrlKey || !event.shiftKey) &&
          caretOffset === blockNode.innerText.length &&
          nodeSiblings.next !== null &&
          nodeSiblings.next.getAttribute("data-block-type") === block.type
        ) {
          event.preventDefault();
          onNavigate("down", -1);
        }
        break;
      }

      case "arrowup": {
        if (action.current) {
          event.preventDefault();
          break;
        }
        const computedDistance: number =
          block.role === "paragraph" || block.role === "subTitle" ? 3 : 2;

        if (
          nodeSiblings.previous !== null &&
          nodeSiblings.previous.getAttribute("data-block-type") ===
            block.type &&
          Math.floor(
            caretCoordinates.y -
              nodeSiblings.previous.getBoundingClientRect().bottom
          ) <= computedDistance
        ) {
          event.preventDefault();
          onNavigate("up", caretOffset);
        }
        break;
      }
      case "arrowdown": {
        if (action.current) {
          event.preventDefault();
          break;
        }
        const computedDistance: number =
          block.role === "title" ? 44 : block.role === "subTitle" ? 32 : 28;

        if (
          nodeSiblings.next !== null &&
          nodeSiblings.next.getAttribute("data-block-type") === block.type &&
          caretCoordinates.y - nodeSiblings.next.getBoundingClientRect().top <=
            computedDistance
        ) {
          event.preventDefault();
          onNavigate("down", caretOffset);
        }
        break;
      }
      case "v": {
        if (event.ctrlKey) {
          event.preventDefault();
          const copiedText = await navigator.clipboard.readText();
          if (copiedText.includes("\n")) {
            onPaste(block, copiedText.trim().split(/\r?\n/), caretOffset);
          } else {
            onPaste(block, copiedText, caretOffset);
          }
        }
        break;
      }
      case "b": {
        if (event.ctrlKey) {
          event.preventDefault();

          const style: Style[] = [
            {
              name: "font-weight",
              value: "bold",
            },
          ];

          inlineSpecifierManager(blockNode, style);

          block.content = blockNode.innerHTML;
          onChange(block);
        }
        break;
      }
      case "i": {
        if (event.ctrlKey) {
          event.preventDefault();
          const style: Style[] = [
            {
              name: "font-style",
              value: "italic",
            },
          ];

          inlineSpecifierManager(blockNode, style);
          block.content = blockNode.innerHTML;
          onChange(block);
        }
        break;
      }
      case "u": {
        if (event.ctrlKey) {
          event.preventDefault();

          const style: Style[] = [
            {
              name: "text-decoration",
              value: "underline",
            },
          ];

          inlineSpecifierManager(blockNode, style);
          block.content = blockNode.innerHTML;
          onChange(block);
        }
        break;
      }
      case "/": {
        onActionKeyPressed(
          getNodeIndex(blockNode, getNodeAt(blockNode, caretOffset)),
          block,
          block.content,
          caretOffset - nodeOffset(blockNode, getNodeAt(blockNode, caretOffset))
        );
        break;
      }
    }
  }

  function clickHandler(event: MouseEvent): void {
    if (event.ctrlKey) {
      const nodeAtMouseCoordinates = document.elementFromPoint(
        event.clientX,
        event.clientY
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
            "_blank"
          );
        }, 10);
      }
    }
  }

  if (block.type === "text") {
    return createElement(createNodeFromRole(block.role), {
      "data-type": BLOCK_NODE,
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
      onClick: clickHandler,
      onMouseUp: () => {
        onSelect(block);
      },
      onContextMenu: (event: MouseEvent) => {
        event.preventDefault();
      },
    });
  }

  /// If no valid block type is found, render an empty Fragment.
  return <Fragment />;
}
