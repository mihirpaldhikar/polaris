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

import { type ChangeEvent, Fragment, type JSX, useEffect, useRef } from "react";
import { type Block, type Coordinates, type Style } from "../../interfaces";
import {
  blockRenderType,
  getBlockNode,
  getCaretCoordinates,
  getCaretOffset,
  getNodeAt,
  getNodeIndex,
  getNodeSiblings,
  inlineSpecifierManager,
  nodeOffset,
  openLinkInNewTab,
} from "../../utils";
import { type Content, type Role } from "../../types";
import RenderType from "../../enums/RenderType";
import { ImageRenderer, ListRenderer, TextRenderer } from "../../renderers";

interface CanvasProps {
  editable: boolean;
  block: Block;
  onChange: (block: Block) => void;
  onEnter: (splitContent: boolean, caretOffset: number) => void;
  onListEnter: (
    childBlockIndex: number,
    splitContent: boolean,
    caretOffset: number
  ) => void;
  onDelete: (block: Block, joinContent: boolean) => void;
  onListChildDelete: (childBlockIndex: number, joinContent: boolean) => void;
  onNavigate: (navigate: "up" | "down", caretOffset: number) => void;
  onListNavigate: (
    childBlockIndex: number,
    navigate: "up" | "down",
    caretOffset: number
  ) => void;
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
  onImageRequest: (block: Block, file: File) => void;
  onContextMenu: (
    block: Block,
    coordinates: Coordinates,
    caretOffset: number
  ) => void;
  onMarkdown: (block: Block, newRole: Role) => void;
}

/**
 * @function Canvas
 *
 * @param editable
 * @param block
 * @param onChange
 * @param onEnter
 * @param onListEnter
 * @param onDelete
 * @param onListChildDelete
 * @param onNavigate
 * @param onListNavigate
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
  onListEnter,
  onDelete,
  onListChildDelete,
  onNavigate,
  onListNavigate,
  onPaste,
  onSelect,
  onImageRequest,
  onActionKeyPressed,
  onContextMenu,
  onMarkdown,
}: CanvasProps): JSX.Element {
  const isActionMenuOpen = useRef(false);

  const initialRole = useRef(block.role);
  const roleChangeByMarkdown = useRef(false);

  useEffect(() => {
    window.addEventListener("actionMenuOpened", () => {
      isActionMenuOpen.current = true;
    });

    window.addEventListener("actionMenuClosed", () => {
      isActionMenuOpen.current = false;
    });
    return () => {
      window.removeEventListener("actionMenuOpened", () => {
        isActionMenuOpen.current = false;
      });

      window.removeEventListener("actionMenuClosed", () => {
        isActionMenuOpen.current = false;
      });
    };
  }, []);

  /**
   * @function notifyChange
   * @param event
   *
   * @param blockRenderType
   * @param childBlock
   * @description Whenever the Node is mutated, this function updates the content of the block and notifies the changes to the listeners.
   */
  function notifyChange(
    event: ChangeEvent<HTMLElement>,
    blockRenderType: RenderType,
    childBlock?: Block
  ): void {
    switch (blockRenderType) {
      case RenderType.TEXT: {
        block.content = event.target.innerHTML;
        break;
      }
      case RenderType.LIST: {
        if (childBlock !== undefined && Array.isArray(block.content)) {
          const blockIndex = block.content.indexOf(childBlock);
          block.content[blockIndex].content = event.target.innerHTML;
          break;
        }
      }
    }

    onChange(block);
  }

  /**
   * @function keyHandler
   * @param event
   *
   * @param index
   * @description Handles the events specified when keys are pressed.
   *
   * @author Mihir Paldhikar
   */

  function keyHandler(event: KeyboardEvent, index: number): void {
    const blockNode = getBlockNode(
      blockRenderType(block.role) === RenderType.LIST &&
        Array.isArray(block.content)
        ? block.content[index].id
        : block.id
    );

    if (blockNode == null) return;

    const caretOffset = getCaretOffset(blockNode);
    const nodeSiblings = getNodeSiblings(block.id);
    const caretCoordinates = getCaretCoordinates();

    switch (event.key.toLowerCase()) {
      case "enter": {
        event.preventDefault();
        if (isActionMenuOpen.current) {
          break;
        }

        if (
          blockRenderType(block.role) === RenderType.LIST &&
          Array.isArray(block.content)
        ) {
          onListEnter(
            index,
            caretOffset !== (block.content[index].content as string).length,
            caretOffset
          );
          break;
        }

        onEnter(caretOffset !== blockNode.innerText.length, caretOffset);
        break;
      }
      case "backspace": {
        if (roleChangeByMarkdown.current) {
          event.preventDefault();
          onMarkdown(block, initialRole.current);
          roleChangeByMarkdown.current = false;
          return;
        }

        if (
          blockRenderType(block.role) === RenderType.LIST &&
          Array.isArray(block.content)
        ) {
          if (index !== 0 && caretOffset === 0) {
            event.preventDefault();
            onListChildDelete(index, block.content[index].content !== "");
          }
          break;
        }

        if (caretOffset === 0 && nodeSiblings.previous != null) {
          event.preventDefault();
          onDelete(block, true);
        }
        break;
      }
      case "delete": {
        if (event.ctrlKey) {
          if (
            blockRenderType(block.role) === RenderType.LIST &&
            Array.isArray(block.content)
          ) {
            onListChildDelete(index, false);
            break;
          }

          if (nodeSiblings.previous != null) {
            event.preventDefault();
            onDelete(block, false);
          }
        }
        break;
      }
      case "arrowleft": {
        if (
          blockRenderType(block.role) === RenderType.LIST &&
          Array.isArray(block.content)
        ) {
          if (
            (!event.ctrlKey || !event.shiftKey) &&
            caretOffset === 0 &&
            index - 1 !== -1
          ) {
            event.preventDefault();
            onListNavigate(index - 1, "up", -1);
          }
          break;
        }

        if (
          (!event.ctrlKey || !event.shiftKey) &&
          caretOffset === 0 &&
          nodeSiblings.previous !== null
        ) {
          event.preventDefault();
          onNavigate("up", -1);
        }

        break;
      }
      case "arrowright": {
        if (
          blockRenderType(block.role) === RenderType.LIST &&
          Array.isArray(block.content)
        ) {
          if (
            (!event.ctrlKey || !event.shiftKey) &&
            caretOffset === blockNode.innerText.length &&
            index + 1 !== -block.content.length
          ) {
            event.preventDefault();
            onListNavigate(index + 1, "down", -1);
          }
          break;
        }

        if (
          (!event.ctrlKey || !event.shiftKey) &&
          caretOffset === blockNode.innerText.length &&
          nodeSiblings.next !== null
        ) {
          event.preventDefault();
          onNavigate("down", -1);
        }
        break;
      }

      case "arrowup": {
        if (isActionMenuOpen.current) {
          event.preventDefault();
          break;
        }

        if (
          blockRenderType(block.role) === RenderType.LIST &&
          Array.isArray(block.content)
        ) {
          if (index - 1 !== -1) {
            event.preventDefault();
            onListNavigate(index - 1, "up", caretOffset);
          }
          break;
        }

        const computedDistance: number =
          block.role === "paragraph" || block.role === "subTitle" ? 3 : 2;

        if (
          nodeSiblings.previous !== null &&
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
        if (isActionMenuOpen.current) {
          event.preventDefault();
          break;
        }

        if (
          blockRenderType(block.role) === RenderType.LIST &&
          Array.isArray(block.content)
        ) {
          if (index + 1 !== block.content.length) {
            event.preventDefault();
            onListNavigate(index + 1, "up", caretOffset);
          }
          break;
        }

        const computedDistance: number =
          block.role === "title" ? 44 : block.role === "subTitle" ? 32 : 28;

        if (
          nodeSiblings.next !== null &&
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

          if (
            blockRenderType(block.role) === RenderType.LIST &&
            Array.isArray(block.content)
          ) {
            break;
          }
          void navigator.clipboard.readText().then((copiedText) => {
            if (copiedText.includes("\n")) {
              onPaste(block, copiedText.trim().split(/\r?\n/), caretOffset);
            } else {
              onPaste(block, copiedText, caretOffset);
            }
          });
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
        if (
          blockRenderType(block.role) === RenderType.LIST &&
          Array.isArray(block.content)
        ) {
          onActionKeyPressed(
            getNodeIndex(blockNode, getNodeAt(blockNode, caretOffset)),
            block.content[index],
            block.content[index].content as string,
            caretOffset -
              nodeOffset(blockNode, getNodeAt(blockNode, caretOffset))
          );
          break;
        }

        if (typeof block.content === "string") {
          onActionKeyPressed(
            getNodeIndex(blockNode, getNodeAt(blockNode, caretOffset)),
            block,
            block.content,
            caretOffset -
              nodeOffset(blockNode, getNodeAt(blockNode, caretOffset))
          );
        }
        break;
      }
      case " ": {
        if (
          blockRenderType(block.role) === RenderType.TEXT &&
          typeof block.content === "string"
        ) {
          switch (block.content) {
            case "-":
            case "+":
            case "*": {
              event.preventDefault();
              onMarkdown(block, "bulletList");
              roleChangeByMarkdown.current = true;
              break;
            }
            case "#": {
              event.preventDefault();
              onMarkdown(block, "title");
              roleChangeByMarkdown.current = true;
              break;
            }
            case "##": {
              event.preventDefault();
              onMarkdown(block, "subTitle");
              roleChangeByMarkdown.current = true;
              break;
            }
            case "###": {
              event.preventDefault();
              onMarkdown(block, "heading");
              roleChangeByMarkdown.current = true;
              break;
            }
            case "####": {
              event.preventDefault();
              onMarkdown(block, "subHeading");
              roleChangeByMarkdown.current = true;
              break;
            }
            default: {
              if (/^\d+\.$/.test(block.content)) {
                event.preventDefault();
                roleChangeByMarkdown.current = true;
                onMarkdown(block, "numberedList");
              }
              break;
            }
          }
        }
        break;
      }
      default: {
        roleChangeByMarkdown.current = false;
        break;
      }
    }
  }

  if (blockRenderType(block.role) === RenderType.TEXT) {
    return (
      <TextRenderer
        block={block}
        editable={editable}
        onUpdate={notifyChange}
        onContextMenu={onContextMenu}
        onClick={openLinkInNewTab}
        onSelect={onSelect}
        onKeyPressed={keyHandler}
      />
    );
  }

  if (
    blockRenderType(block.role) === RenderType.IMAGE &&
    typeof block.content === "object"
  ) {
    return (
      <ImageRenderer
        block={block}
        editable={editable}
        onContextMenu={onContextMenu}
        onImageRequest={onImageRequest}
        onDelete={onDelete}
      />
    );
  }

  if (blockRenderType(block.role) === RenderType.LIST) {
    return (
      <ListRenderer
        block={block}
        editable={editable}
        onContextMenu={onContextMenu}
        onClick={openLinkInNewTab}
        onUpdate={notifyChange}
        onSelect={onSelect}
        onKeyPressed={keyHandler}
      />
    );
  }

  /// If no valid block type is found, render an empty Fragment.
  return <Fragment />;
}
