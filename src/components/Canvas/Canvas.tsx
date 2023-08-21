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
import { type Block, type Coordinates } from "../../interfaces";
import {
  blockRenderTypeFromNode,
  blockRenderTypeFromRole,
  conditionalClassName,
  createNodeFromRole,
  generateBlockId,
  getBlockNode,
  getCaretOffset,
  getNodeSiblings,
  openLinkInNewTab,
  serializeNodeToBlock,
  setNodeStyle,
  splitBlocksAtCaretOffset,
} from "../../utils";
import { type Content, type Role } from "../../types";
import RenderType from "../../enums/RenderType";
import { ImageRenderer, TextRenderer } from "../../renderers";
import { BLOCK_NODE } from "../../constants";

interface CanvasProps {
  editable: boolean;
  parentBlock?: Block;
  block: Block;
  onChange: (block: Block) => void;
  onCreate: (parentBlock: Block, targetBlock: Block) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    nodeIndex: number,
    caretOffset: number
  ) => void;
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
 * @param onDelete
 * @param onNavigate
 * @param onPaste
 * @param onSelect
 * @param onActionKeyPressed
 * @returns JSX.Element
 *
 * @description Canvas is responsible for rendering the Node from the Block. It also manages and updates the content of the block when the Node is mutated.
 *
 * @author Mihir Paldhikar
 */

export default function Canvas({
  editable,
  parentBlock,
  block,
  onChange,
  onCreate,
  onDelete,
  onNavigate,
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
   * @description Handles the events specified when keys are pressed.
   *
   * @author Mihir Paldhikar
   */

  function keyHandler(event: KeyboardEvent): void {
    const currentBlockNode = getBlockNode(block.id);
    if (currentBlockNode === null) return;

    const caretOffset = getCaretOffset(currentBlockNode);

    switch (event.key.toLowerCase()) {
      case "enter": {
        event.preventDefault();
        let newBlock: Block = {
          id: generateBlockId(),
          content: "",
          role: "paragraph",
          style: [],
        };
        if (
          parentBlock !== undefined &&
          blockRenderTypeFromRole(parentBlock.role) === RenderType.LIST &&
          Array.isArray(parentBlock.content)
        ) {
          const currentChildBlockIndex = parentBlock.content
            .map((blk) => blk.id)
            .indexOf(block.id);

          if (caretOffset !== currentBlockNode.innerText.length) {
            const spiltBlockPair = splitBlocksAtCaretOffset(block, caretOffset);
            newBlock = spiltBlockPair[1];
            parentBlock.content.splice(
              currentChildBlockIndex,
              1,
              ...spiltBlockPair
            );
          } else {
            parentBlock.content.splice(currentChildBlockIndex + 1, 0, newBlock);
          }
          onCreate(parentBlock, newBlock);
        } else {
          if (caretOffset !== currentBlockNode.innerText.length) {
            const spiltBlockPair = splitBlocksAtCaretOffset(block, caretOffset);
            block = spiltBlockPair[0];
            newBlock = spiltBlockPair[1];
          }
          onCreate(block, newBlock);
        }
        break;
      }
      case "backspace": {
        if (
          parentBlock !== undefined &&
          blockRenderTypeFromRole(parentBlock.role) === RenderType.LIST &&
          Array.isArray(parentBlock.content) &&
          caretOffset === 0
        ) {
          event.preventDefault();

          const currentChildBlockIndex = parentBlock.content
            .map((blk) => blk.id)
            .indexOf(block.id);

          if (
            blockRenderTypeFromRole(block.role) === RenderType.TEXT &&
            currentChildBlockIndex !== 0
          ) {
            const previousBlock =
              parentBlock.content[currentChildBlockIndex - 1];

            if (
              blockRenderTypeFromRole(previousBlock.role) === RenderType.TEXT
            ) {
              const previousNode = getBlockNode(
                previousBlock.id
              ) as HTMLElement;
              const computedCaretOffset =
                previousNode.lastChild != null
                  ? previousNode.lastChild.nodeType === Node.ELEMENT_NODE
                    ? (previousNode.lastChild.textContent as string).length
                    : previousNode.lastChild.textContent?.length ??
                      previousNode.innerText.length
                  : previousNode.innerText.length;

              const previousBlockLastChildNodeIndex =
                previousNode.childNodes.length - 1;

              previousBlock.id = generateBlockId();
              previousBlock.content = (previousBlock.content as string).concat(
                block.content as string
              );

              parentBlock.content.splice(
                currentChildBlockIndex - 1,
                2,
                previousBlock
              );

              onDelete(
                parentBlock,
                previousBlock,
                previousBlockLastChildNodeIndex,
                computedCaretOffset
              );
            }
          }
        } else if (caretOffset === 0) {
          event.preventDefault();
          const currentNodeSiblings = getNodeSiblings(block.id);
          if (
            currentNodeSiblings.previous !== null &&
            blockRenderTypeFromNode(currentNodeSiblings.previous) ===
              RenderType.TEXT
          ) {
            const previousBlock = serializeNodeToBlock(
              currentNodeSiblings.previous
            );

            const previousNode = getBlockNode(previousBlock.id) as HTMLElement;

            const computedCaretOffset =
              previousNode.lastChild != null
                ? previousNode.lastChild.nodeType === Node.ELEMENT_NODE
                  ? (previousNode.lastChild.textContent as string).length
                  : previousNode.lastChild.textContent?.length ??
                    previousNode.innerText.length
                : previousNode.innerText.length;

            const previousBlockLastChildNodeIndex =
              previousNode.childNodes.length - 1;

            previousBlock.id = generateBlockId();
            previousBlock.content = (previousBlock.content as string).concat(
              block.content as string
            );

            onDelete(
              block,
              previousBlock,
              previousBlockLastChildNodeIndex,
              computedCaretOffset
            );
          }
        }
        break;
      }
    }
  }

  if (blockRenderTypeFromRole(block.role) === RenderType.TEXT) {
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

  if (blockRenderTypeFromRole(block.role) === RenderType.IMAGE) {
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

  if (
    blockRenderTypeFromRole(block.role) === RenderType.LIST &&
    Array.isArray(block.content)
  ) {
    return createElement(
      createNodeFromRole(block.role),
      {
        "data-type": BLOCK_NODE,
        "data-block-render-type": blockRenderTypeFromRole(block.role),
        id: block.id,
        role: block.role,
        disabled: !editable,
        style: setNodeStyle(block.style),
        spellCheck: true,
        className: conditionalClassName(
          "px-4 space-y-2 text-[17px] my-2 mx-2",
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
      block.content.map((childBlock) => {
        return (
          <li key={childBlock.id}>
            <Canvas
              parentBlock={block}
              editable={editable}
              block={childBlock}
              onChange={onChange}
              onCreate={onCreate}
              onDelete={onDelete}
              onNavigate={onNavigate}
              onPaste={onPaste}
              onSelect={onSelect}
              onActionKeyPressed={onActionKeyPressed}
              onImageRequest={onImageRequest}
              onContextMenu={onContextMenu}
              onMarkdown={onMarkdown}
            />
          </li>
        );
      })
    );
  }

  /// If no valid block type is found, render an empty Fragment.
  return <Fragment />;
}
