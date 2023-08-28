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
import { type Block, type Style } from "../../interfaces";
import {
  blockRenderTypeFromNode,
  blockRenderTypeFromRole,
  conditionalClassName,
  generateBlockId,
  getBlockNode,
  getCaretOffset,
  getNodeAt,
  getNodeIndex,
  getNodeSiblings,
  inlineSpecifierManager,
  nodeOffset,
  nodeTypeFromRole,
  openLinkInNewTab,
  serializeNodeToBlock,
  setCaretOffset,
  setNodeStyle,
  splitBlocksAtCaretOffset,
  traverseAndUpdate,
} from "../../utils";
import { type Content } from "../../types";
import RenderType from "../../enums/RenderType";
import { ImageRenderer, TextRenderer } from "../../renderers";
import { BLOCK_NODE } from "../../constants";

interface CanvasProps {
  editable: boolean;
  parentBlock?: Block;
  block: Block;
  onChange: (block: Block) => void;
  onCreate: (
    parentBlock: Block,
    targetBlock: Block,
    creationType: "list" | "nonList"
  ) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    nodeId: string,
    setCursorToStart?: boolean
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
  onMarkdown: (block: Block) => void;
}

/**
 * @function Canvas
 *
 * @param editable
 * @param block
 * @param onChange
 * @param onEnter
 * @param onDelete
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
  onPaste,
  onSelect,
  onImageRequest,
  onActionKeyPressed,
  onMarkdown,
}: CanvasProps): JSX.Element {
  const isActionMenuOpen = useRef(false);

  const originalBlock = useRef<Block>({ ...block });
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

        if (isActionMenuOpen.current) {
          break;
        }

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

          if (
            currentBlockNode.innerText.length === 0 &&
            currentChildBlockIndex === parentBlock.content.length - 1
          ) {
            const parentSiblings = getNodeSiblings(parentBlock.id);

            if (
              parentSiblings.previous?.parentElement?.parentElement != null &&
              blockRenderTypeFromNode(parentSiblings.previous) ===
                RenderType.LIST
            ) {
              const previousParentBlock = serializeNodeToBlock(
                parentSiblings.previous.parentElement.parentElement
              );
              parentBlock.content.splice(currentChildBlockIndex, 1);
              traverseAndUpdate(
                previousParentBlock.content as Block[],
                parentBlock
              );
              (previousParentBlock.content as Block[]).push(newBlock);
              onCreate(previousParentBlock, newBlock, "list");
            } else {
              parentBlock.content.pop();
              onCreate(parentBlock, newBlock, "nonList");
            }
          } else if (caretOffset !== currentBlockNode.innerText.length) {
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
          onCreate(parentBlock, newBlock, "list");
        } else {
          if (caretOffset !== currentBlockNode.innerText.length) {
            const spiltBlockPair = splitBlocksAtCaretOffset(block, caretOffset);
            block = spiltBlockPair[0];
            newBlock = spiltBlockPair[1];
          }
          onCreate(block, newBlock, "nonList");
        }
        break;
      }
      case "backspace": {
        if (roleChangeByMarkdown.current) {
          event.preventDefault();
          onMarkdown(originalBlock.current);
          roleChangeByMarkdown.current = false;
          break;
        }

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
              previousBlock.content = (previousBlock.content as string).concat(
                block.content as string
              );

              parentBlock.content.splice(
                currentChildBlockIndex - 1,
                2,
                previousBlock
              );

              onDelete(parentBlock, previousBlock, previousBlock.id);
            }
          } else {
            const parentSiblings = getNodeSiblings(parentBlock.id);

            if (
              parentSiblings.previous?.parentElement?.parentElement != null &&
              blockRenderTypeFromNode(parentSiblings.previous) ===
                RenderType.LIST
            ) {
              const previousParentBlock = serializeNodeToBlock(
                parentSiblings.previous.parentElement.parentElement
              );
              if (Array.isArray(previousParentBlock.content)) {
                const parentBlockIndex = previousParentBlock.content
                  .map((blk) => blk.id)
                  .indexOf(parentBlock.id);

                previousParentBlock.content.splice(
                  parentBlockIndex,
                  1,
                  ...parentBlock.content
                );
                onDelete(
                  previousParentBlock,
                  previousParentBlock.content[parentBlockIndex],
                  previousParentBlock.content[parentBlockIndex].id,
                  true
                );
              }
            } else {
              if (parentSiblings.previous !== null) {
                const previousParentBlock = serializeNodeToBlock(
                  parentSiblings.previous
                );
                const parentFirstChild = parentBlock.content[0];
                onCreate(previousParentBlock, parentFirstChild, "nonList");
                if (parentBlock.content.length === 1) {
                  parentBlock.role = "paragraph";
                  parentBlock.content = "";
                  onDelete(
                    parentBlock,
                    parentFirstChild,
                    parentFirstChild.id,
                    true
                  );
                } else {
                  parentBlock.content.splice(0, 1);
                  onDelete(
                    parentBlock,
                    parentFirstChild,
                    parentFirstChild.id,
                    true
                  );
                }
              }
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

            previousBlock.content = (previousBlock.content as string).concat(
              block.content as string
            );

            onDelete(block, previousBlock, previousBlock.id);
          } else if (
            currentNodeSiblings.previous !== null &&
            blockRenderTypeFromNode(currentNodeSiblings.previous) ===
              RenderType.LIST
          ) {
            const previousBlock = serializeNodeToBlock(
              currentNodeSiblings.previous.parentElement
                ?.parentElement as HTMLElement
            );

            const previousBlockLastChild = (previousBlock.content as Block[])[
              (previousBlock.content as Block[]).length - 1
            ];

            if (
              blockRenderTypeFromRole(previousBlockLastChild.role) ===
              RenderType.TEXT
            ) {
              previousBlockLastChild.content = (
                previousBlockLastChild.content as string
              ).concat(block.content as string);

              (previousBlock.content as Block[])[
                (previousBlock.content as Block[]).length - 1
              ] = previousBlockLastChild;

              onDelete(block, previousBlock, previousBlockLastChild.id);
            }
          }
        }
        break;
      }
      case "/": {
        if (typeof block.content === "string") {
          onActionKeyPressed(
            getNodeIndex(
              currentBlockNode,
              getNodeAt(currentBlockNode, caretOffset)
            ),
            block,
            block.content,
            caretOffset -
              nodeOffset(
                currentBlockNode,
                getNodeAt(currentBlockNode, caretOffset)
              )
          );
        }
        break;
      }
      case " ": {
        if (typeof block.content === "string") {
          switch (block.content) {
            case "#": {
              event.preventDefault();
              block.role = "title";
              block.content = "";
              break;
            }
            case "##": {
              event.preventDefault();
              block.role = "subTitle";
              block.content = "";
              break;
            }
            case "###": {
              event.preventDefault();
              block.role = "heading";
              block.content = "";
              break;
            }
            case "####": {
              event.preventDefault();
              block.role = "subHeading";
              block.content = "";
              break;
            }
            case "&gt;":
            case ">": {
              event.preventDefault();
              block.role = "quote";
              block.content = "";
              break;
            }
            case "+":
            case "-": {
              event.preventDefault();
              block.role = "bulletList";
              block.content = [
                {
                  id: generateBlockId(),
                  content: "",
                  role: "paragraph",
                  style: [],
                },
              ];
              break;
            }
            default: {
              if (/^\d+\.$/.test(block.content)) {
                event.preventDefault();
                block.role = "numberedList";
                block.content = [
                  {
                    id: generateBlockId(),
                    content: "",
                    role: "paragraph",
                    style: [],
                  },
                ];
                break;
              } else {
                return;
              }
            }
          }
          roleChangeByMarkdown.current = true;
          onMarkdown(block);
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

          inlineSpecifierManager(currentBlockNode, style);

          block.content = currentBlockNode.innerHTML;
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

          inlineSpecifierManager(currentBlockNode, style);
          block.content = currentBlockNode.innerHTML;
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

          inlineSpecifierManager(currentBlockNode, style);
          block.content = currentBlockNode.innerHTML;
          onChange(block);
        }
        break;
      }
      case "arrowleft": {
        if (caretOffset === 0) {
          event.preventDefault();
          const { previous } = getNodeSiblings(currentBlockNode.id);
          if (previous != null) {
            if (
              previous.tagName.toLowerCase() === "ol" ||
              previous.tagName.toLowerCase() === "ul"
            ) {
              const { previous: previousPrevious } = getNodeSiblings(
                previous.id
              );

              if (previousPrevious != null) {
                const previousBlockChildNodeIndex =
                  previousPrevious?.lastChild?.textContent === ""
                    ? previousPrevious.childNodes.length - 2
                    : previousPrevious.childNodes.length - 1;

                const computedCaretOffset =
                  previousPrevious.childNodes[previousBlockChildNodeIndex] !=
                  null
                    ? previousPrevious.childNodes[previousBlockChildNodeIndex]
                        .nodeType === Node.ELEMENT_NODE
                      ? (
                          previousPrevious.childNodes[
                            previousBlockChildNodeIndex
                          ].textContent as string
                        ).length
                      : previousPrevious.childNodes[previousBlockChildNodeIndex]
                          .textContent?.length ??
                        previousPrevious.innerText.length
                    : previousPrevious.innerText.length;
                setCaretOffset(
                  previousPrevious.childNodes[previousBlockChildNodeIndex]
                    .nodeType === Node.ELEMENT_NODE
                    ? previousPrevious.childNodes[previousBlockChildNodeIndex]
                        .firstChild ?? previousPrevious
                    : previousPrevious.childNodes[previousBlockChildNodeIndex],
                  computedCaretOffset
                );
              }
            } else {
              const previousBlockChildNodeIndex =
                previous?.lastChild?.textContent === ""
                  ? previous.childNodes.length - 2
                  : previous.childNodes.length - 1;

              const computedCaretOffset =
                previous.childNodes[previousBlockChildNodeIndex] != null
                  ? previous.childNodes[previousBlockChildNodeIndex]
                      .nodeType === Node.ELEMENT_NODE
                    ? (
                        previous.childNodes[previousBlockChildNodeIndex]
                          .textContent as string
                      ).length
                    : previous.childNodes[previousBlockChildNodeIndex]
                        .textContent?.length ?? previous.innerText.length
                  : previous.innerText.length;
              setCaretOffset(
                previous.childNodes[previousBlockChildNodeIndex].nodeType ===
                  Node.ELEMENT_NODE
                  ? previous.childNodes[previousBlockChildNodeIndex]
                      .firstChild ?? previous
                  : previous.childNodes[previousBlockChildNodeIndex],
                computedCaretOffset
              );
            }
          }
        }
        break;
      }
      case "arrowright": {
        if (caretOffset === currentBlockNode.innerText.length) {
          event.preventDefault();

          const { next } = getNodeSiblings(currentBlockNode.id);
          if (next != null) {
            if (
              next.tagName.toLowerCase() === "ol" ||
              next.tagName.toLowerCase() === "ul"
            ) {
              const { next: nextNext } = getNodeSiblings(next.id);

              if (nextNext != null) {
                setCaretOffset(nextNext, 0);
              }
            } else {
              setCaretOffset(next, 0);
            }
          }
        }
        break;
      }
      case "arrowup": {
        event.preventDefault();
        const { previous } = getNodeSiblings(currentBlockNode.id);
        if (previous != null) {
          if (
            previous.tagName.toLowerCase() === "ol" ||
            previous.tagName.toLowerCase() === "ul"
          ) {
            const { previous: previousPrevious } = getNodeSiblings(previous.id);
            if (previousPrevious != null) {
              const nodeAtCaretOffset = getNodeAt(
                previousPrevious,
                caretOffset
              );
              const jumpNode =
                caretOffset > previousPrevious.innerText.length
                  ? previousPrevious.lastChild ?? previous
                  : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
                  ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
                  : nodeAtCaretOffset;

              const computedCaretOffset =
                caretOffset > previousPrevious.innerText.length
                  ? (previousPrevious.lastChild?.textContent as string).length
                  : caretOffset > (jumpNode.textContent as string).length
                  ? (jumpNode.textContent as string).length
                  : caretOffset;

              setCaretOffset(jumpNode, computedCaretOffset);
            }
          } else {
            const nodeAtCaretOffset = getNodeAt(previous, caretOffset);
            const jumpNode =
              caretOffset > previous.innerText.length
                ? previous.lastChild ?? previous
                : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
                ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
                : nodeAtCaretOffset;

            const computedCaretOffset =
              caretOffset > previous.innerText.length
                ? (previous.lastChild?.textContent as string).length
                : caretOffset > (jumpNode.textContent as string).length
                ? (jumpNode.textContent as string).length
                : caretOffset;

            setCaretOffset(jumpNode, computedCaretOffset);
          }
        }
        break;
      }
      case "arrowdown": {
        event.preventDefault();
        const { next } = getNodeSiblings(currentBlockNode.id);
        if (next != null) {
          if (
            next.tagName.toLowerCase() === "ol" ||
            next.tagName.toLowerCase() === "ul"
          ) {
            const { next: nextNext } = getNodeSiblings(next.id);
            if (nextNext != null) {
              const nodeAtCaretOffset = getNodeAt(nextNext, caretOffset);
              const jumpNode =
                caretOffset > nextNext.innerText.length
                  ? nextNext.firstChild ?? next
                  : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
                  ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
                  : nodeAtCaretOffset;

              const computedCaretOffset =
                caretOffset > nextNext.innerText.length
                  ? (nextNext.firstChild?.textContent as string).length
                  : caretOffset > (jumpNode.textContent as string).length
                  ? (jumpNode.textContent as string).length
                  : caretOffset;

              setCaretOffset(jumpNode, computedCaretOffset);
            }
          } else {
            const nodeAtCaretOffset = getNodeAt(next, caretOffset);
            const jumpNode =
              caretOffset > next.innerText.length
                ? next.firstChild ?? next
                : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
                ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
                : nodeAtCaretOffset;

            const computedCaretOffset =
              caretOffset > next.innerText.length
                ? (next.firstChild?.textContent as string).length
                : caretOffset > (jumpNode.textContent as string).length
                ? (jumpNode.textContent as string).length
                : caretOffset;

            setCaretOffset(jumpNode, computedCaretOffset);
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

  if (blockRenderTypeFromRole(block.role) === RenderType.TEXT) {
    return (
      <TextRenderer
        block={block}
        editable={editable}
        onUpdate={notifyChange}
        onClick={openLinkInNewTab}
        onSelect={onSelect}
        onKeyPressed={keyHandler}
      />
    );
  }

  if (blockRenderTypeFromRole(block.role) === RenderType.IMAGE) {
    return (
      <ImageRenderer
        parentBlock={parentBlock}
        block={block}
        onChange={onChange}
        editable={editable}
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
      nodeTypeFromRole(block.role),
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
              onPaste={onPaste}
              onSelect={onSelect}
              onActionKeyPressed={onActionKeyPressed}
              onImageRequest={onImageRequest}
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
