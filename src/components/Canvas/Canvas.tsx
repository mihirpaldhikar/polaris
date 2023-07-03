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
  type ChangeEvent,
  createElement,
  Fragment,
  type JSX,
  useEffect,
  useRef,
} from "react";
import {
  type Block,
  type Coordinates,
  type ImageContent,
  type Style,
} from "../../interfaces";
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
import { type Content, type Role, type Type } from "../../types";
import {
  BLOCK_NODE,
  INLINE_SPECIFIER_NODE,
  LINK_ATTRIBUTE,
  NODE_TYPE,
} from "../../constants";
import { ListChild } from "../ListChild";
import { FilePicker } from "../FilePicker";

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
   * @param blockType
   * @param childBlock
   * @description Whenever the Node is mutated, this function updates the content of the block and notifies the changes to the listeners.
   */
  function notifyChange(
    event: ChangeEvent<HTMLElement>,
    blockType: Type,
    childBlock?: Block
  ): void {
    switch (blockType) {
      case "text": {
        block.content = event.target.innerHTML;
        break;
      }
      case "list": {
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
   * @param blockType
   * @param index
   * @description Handles the events specified when keys are pressed.
   *
   * @author Mihir Paldhikar
   */

  function keyHandler(
    event: KeyboardEvent,
    blockType: Type,
    index: number
  ): void {
    const blockNode = getBlockNode(
      block.type === "list" && Array.isArray(block.content)
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

        if (block.type === "list" && Array.isArray(block.content)) {
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

        if (block.type === "list" && Array.isArray(block.content)) {
          if (index !== 0 && caretOffset === 0) {
            event.preventDefault();
            onListChildDelete(index, block.content[index].content !== "");
          }
          break;
        }

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
          if (block.type === "list" && Array.isArray(block.content)) {
            onListChildDelete(index, false);
            break;
          }

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
        if (block.type === "list" && Array.isArray(block.content)) {
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
          nodeSiblings.previous !== null &&
          nodeSiblings.previous.getAttribute("data-block-type") === block.type
        ) {
          event.preventDefault();
          onNavigate("up", -1);
        }

        break;
      }
      case "arrowright": {
        if (block.type === "list" && Array.isArray(block.content)) {
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
          nodeSiblings.next !== null &&
          nodeSiblings.next.getAttribute("data-block-type") === block.type
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

        if (block.type === "list" && Array.isArray(block.content)) {
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
        if (isActionMenuOpen.current) {
          event.preventDefault();
          break;
        }

        if (block.type === "list" && Array.isArray(block.content)) {
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

          if (block.type === "list" && Array.isArray(block.content)) {
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
        if (block.type === "list" && Array.isArray(block.content)) {
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
          block.type === "text" &&
          block.role !== "listChild" &&
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
          : block.role === "quote"
          ? "rounded-md border-l-[6px] border-gray-400 bg-gray-200 p-4"
          : "font-normal text-[17px]"
      ),
      onInput: (event: ChangeEvent<HTMLElement>) => {
        notifyChange(event, block.type);
      },
      onKeyDown: (event: KeyboardEvent) => {
        keyHandler(event, block.type, -1);
      },
      onClick: clickHandler,
      onMouseUp: () => {
        onSelect(block);
      },
      onContextMenu: (event: MouseEvent) => {
        event.preventDefault();
        onContextMenu(
          block,
          { x: event.clientX, y: event.clientY },
          getCaretOffset(getBlockNode(block.id))
        );
      },
    });
  }

  if (block.type === "list" && Array.isArray(block.content)) {
    return createElement(
      createNodeFromRole(block.role),
      {
        "data-type": BLOCK_NODE,
        "data-block-type": block.type,
        id: block.id,
        role: block.role,
        disabled: !editable,
        style: setNodeStyle(block.style),
        spellCheck: true,
        className: conditionalClassName(
          "px-4 space-y-2 text-[17px] my-1",
          block.role === "numberedList" ? "list-decimal" : "list-disc"
        ),
        onContextMenu: (event: MouseEvent) => {
          event.preventDefault();
          onContextMenu(
            block,
            { x: event.clientX, y: event.clientY },
            getCaretOffset(getBlockNode(block.id))
          );
        },
      },
      block.content.map((content, index) => {
        if (
          content.type === "text" &&
          content.role === "listChild" &&
          typeof content.content === "string"
        ) {
          return (
            <ListChild
              key={content.id}
              editable={editable}
              content={content}
              onClick={clickHandler}
              onInput={(event) => {
                notifyChange(event, block.type, content);
              }}
              onSelect={() => {
                onSelect(content);
              }}
              onKeyDown={(event) => {
                keyHandler(event, block.type, index);
              }}
            />
          );
        }
        return <Fragment key={content.id} />;
      })
    );
  }

  if (
    block.type === "image" &&
    block.role === "image" &&
    typeof block.content === "object"
  ) {
    const imageData = block.content as ImageContent;
    if (imageData.url === "") {
      return (
        <FilePicker
          message={"Drag or click here to add an image."}
          accept={"image/png, image/jpg, image/jpeg, image/svg+xml, image/gif"}
          onFilePicked={(file) => {
            onImageRequest(block, file);
          }}
          onDelete={() => {
            onDelete(block, false);
          }}
        />
      );
    }
    return createElement(createNodeFromRole(block.role), {
      "data-type": BLOCK_NODE,
      "data-block-type": block.type,
      id: block.id,
      role: block.role,
      disabled: !editable,
      draggable: false,
      src: imageData.url,
      alt: imageData.description,
      style: {
        height: imageData.height,
        width: imageData.width,
      },
      className: "mx-auto display-block object-center w-full rounded-md",
      onContextMenu: (event: MouseEvent) => {
        event.preventDefault();
        onContextMenu(
          block,
          { x: event.clientX, y: event.clientY },
          getCaretOffset(getBlockNode(block.id))
        );
      },
    });
  }

  /// If no valid block type is found, render an empty Fragment.
  return <Fragment />;
}
