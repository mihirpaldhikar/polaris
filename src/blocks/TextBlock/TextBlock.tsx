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
  type JSX,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  blockRenderTypeFromNode,
  blockRenderTypeFromRole,
  conditionalClassName,
  generateBlockId,
  getBlockNode,
  getCaretOffset,
  getConfigFromRole,
  getNodeSiblings,
  getPlaceholderFromRole,
  nodeTypeFromRole,
  serializeNodeToBlock,
  setNodeStyle,
  splitBlocksAtCaretOffset,
  subscribeToEditorEvent,
  traverseAndUpdate,
  unsubscribeFromEditorEvent,
} from "../../utils";
import { BLOCK_NODE } from "../../constants";
import { type Block } from "../../interfaces";
import RootContext from "../../contexts/RootContext/RootContext";
import { type TextBlockConfig } from "../../interfaces/PolarisConfig";
import RenderType from "../../enums/RenderType";

interface TextBlockProps {
  parentBlock?: Block;
  block: Block;
  editable: boolean;
  onClick: (event: MouseEvent) => void;
  onSelect: (block: Block) => void;
  onChange: (block: Block) => void;
  onCreate: (
    parentBlock: Block,
    targetBlock: Block,
    creationType: "list" | "nonList",
  ) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    nodeId: string,
    setCursorToStart?: boolean,
  ) => void;
  onMarkdown: (block: Block) => void;
}

export default function TextBlock({
  parentBlock,
  block,
  editable,
  onClick,
  onSelect,
  onChange,
  onCreate,
  onDelete,
  onMarkdown,
}: TextBlockProps): JSX.Element {
  const isActionMenuOpen = useRef(false);
  const originalBlock = useRef<Block>({ ...block });
  const roleChangeByMarkdown = useRef(false);
  const { config } = useContext(RootContext);

  useEffect(() => {
    subscribeToEditorEvent("onActionMenu", (event: any) => {
      isActionMenuOpen.current = event.detail.opened;
    });

    return () => {
      unsubscribeFromEditorEvent("onActionMenu", (event: any) => {
        isActionMenuOpen.current = event.detail.opened;
      });
    };
  }, []);

  function onDataChange(event: ChangeEvent<HTMLElement>): void {
    block.data = event.target.innerHTML;
    onChange(block);
  }

  function keyboardHandler(event: KeyboardEvent): void {
    const activeNode = getBlockNode(block.id) as HTMLElement;
    const caretOffset = getCaretOffset(activeNode);
    switch (event.key.toLowerCase()) {
      case "enter": {
        event.preventDefault();

        if (isActionMenuOpen.current) {
          break;
        }

        let newBlock: Block = {
          id: generateBlockId(),
          data: "",
          role: "paragraph",
          style: [],
        };
        if (
          parentBlock !== undefined &&
          blockRenderTypeFromRole(parentBlock.role) === RenderType.LIST &&
          Array.isArray(parentBlock.data)
        ) {
          const currentChildBlockIndex = parentBlock.data
            .map((blk) => blk.id)
            .indexOf(block.id);

          if (
            activeNode.innerText.length === 0 &&
            currentChildBlockIndex === parentBlock.data.length - 1
          ) {
            const parentSiblings = getNodeSiblings(parentBlock.id);

            if (
              parentSiblings.previous?.parentElement?.parentElement != null &&
              blockRenderTypeFromNode(parentSiblings.previous) ===
                RenderType.LIST
            ) {
              const previousParentBlock = serializeNodeToBlock(
                parentSiblings.previous.parentElement.parentElement,
              );
              parentBlock.data.splice(currentChildBlockIndex, 1);
              traverseAndUpdate(
                previousParentBlock.data as Block[],
                parentBlock,
              );
              (previousParentBlock.data as Block[]).push(newBlock);
              onCreate(previousParentBlock, newBlock, "list");
            } else {
              parentBlock.data.pop();
              onCreate(parentBlock, newBlock, "nonList");
            }
          } else if (caretOffset !== activeNode.innerText.length) {
            const spiltBlockPair = splitBlocksAtCaretOffset(block, caretOffset);
            newBlock = spiltBlockPair[1];
            parentBlock.data.splice(
              currentChildBlockIndex,
              1,
              ...spiltBlockPair,
            );
          } else {
            parentBlock.data.splice(currentChildBlockIndex + 1, 0, newBlock);
          }
          onCreate(parentBlock, newBlock, "list");
        } else {
          if (caretOffset !== activeNode.innerText.length) {
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
          Array.isArray(parentBlock.data) &&
          caretOffset === 0
        ) {
          event.preventDefault();

          const currentChildBlockIndex = parentBlock.data
            .map((blk) => blk.id)
            .indexOf(block.id);

          if (
            blockRenderTypeFromRole(block.role) === RenderType.TEXT &&
            currentChildBlockIndex !== 0
          ) {
            const previousBlock = parentBlock.data[currentChildBlockIndex - 1];

            if (
              blockRenderTypeFromRole(previousBlock.role) === RenderType.TEXT
            ) {
              previousBlock.data = (previousBlock.data as string).concat(
                block.data as string,
              );

              parentBlock.data.splice(
                currentChildBlockIndex - 1,
                2,
                previousBlock,
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
                parentSiblings.previous.parentElement.parentElement,
              );
              if (Array.isArray(previousParentBlock.data)) {
                const parentBlockIndex = previousParentBlock.data
                  .map((blk) => blk.id)
                  .indexOf(parentBlock.id);

                previousParentBlock.data.splice(
                  parentBlockIndex,
                  1,
                  ...parentBlock.data,
                );
                onDelete(
                  previousParentBlock,
                  previousParentBlock.data[parentBlockIndex],
                  previousParentBlock.data[parentBlockIndex].id,
                  true,
                );
              }
            } else {
              if (parentSiblings.previous !== null) {
                const previousParentBlock = serializeNodeToBlock(
                  parentSiblings.previous,
                );
                const parentFirstChild = parentBlock.data[0];
                onCreate(previousParentBlock, parentFirstChild, "nonList");
                if (parentBlock.data.length === 1) {
                  parentBlock.role = "paragraph";
                  parentBlock.data = "";
                  onDelete(
                    parentBlock,
                    parentFirstChild,
                    parentFirstChild.id,
                    true,
                  );
                } else {
                  parentBlock.data.splice(0, 1);
                  onDelete(
                    parentBlock,
                    parentFirstChild,
                    parentFirstChild.id,
                    true,
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
              currentNodeSiblings.previous,
            );

            previousBlock.data = (previousBlock.data as string).concat(
              block.data as string,
            );

            onDelete(block, previousBlock, previousBlock.id);
          } else if (
            currentNodeSiblings.previous !== null &&
            blockRenderTypeFromNode(currentNodeSiblings.previous) ===
              RenderType.LIST
          ) {
            const previousBlock = serializeNodeToBlock(
              currentNodeSiblings.previous.parentElement
                ?.parentElement as HTMLElement,
            );

            const previousBlockLastChild = (previousBlock.data as Block[])[
              (previousBlock.data as Block[]).length - 1
            ];

            if (
              blockRenderTypeFromRole(previousBlockLastChild.role) ===
              RenderType.TEXT
            ) {
              previousBlockLastChild.data = (
                previousBlockLastChild.data as string
              ).concat(block.data as string);

              (previousBlock.data as Block[])[
                (previousBlock.data as Block[]).length - 1
              ] = previousBlockLastChild;

              onDelete(block, previousBlock, previousBlockLastChild.id);
            }
          }
        }
        break;
      }
      case " ": {
        if (typeof block.data === "string") {
          switch (block.data) {
            case "#": {
              event.preventDefault();
              block.role = "title";
              block.data = "";
              break;
            }
            case "##": {
              event.preventDefault();
              block.role = "subTitle";
              block.data = "";
              break;
            }
            case "###": {
              event.preventDefault();
              block.role = "heading";
              block.data = "";
              break;
            }
            case "####": {
              event.preventDefault();
              block.role = "subHeading";
              block.data = "";
              break;
            }
            case "&gt;":
            case ">": {
              event.preventDefault();
              block.role = "quote";
              block.data = "";
              break;
            }
            case "+":
            case "-": {
              event.preventDefault();
              block.role = "bulletList";
              block.data = [
                {
                  id: generateBlockId(),
                  data: "",
                  role: "paragraph",
                  style: [],
                },
              ];
              break;
            }
            default: {
              if (/^\d+\.$/.test(block.data)) {
                event.preventDefault();
                block.role = "numberedList";
                block.data = [
                  {
                    id: generateBlockId(),
                    data: "",
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
    }
  }

  return createElement(nodeTypeFromRole(block.role), {
    "data-type": BLOCK_NODE,
    "data-block-render-type": blockRenderTypeFromRole(block.role),
    id: block.id,
    disabled: !editable,
    contentEditable: editable,
    dangerouslySetInnerHTML: { __html: block.data },
    style: {
      fontSize: `${
        (getConfigFromRole(block.role, config) as TextBlockConfig).fontSize
      }rem`,
      ...setNodeStyle(block.style),
    },
    placeholder: getPlaceholderFromRole(block.role),
    spellCheck: true,
    className: conditionalClassName(
      "text_renderer block flex-1 overflow-hidden focus:outline-none focus:ring-0 outline-none ring-0 cursor-text break-words",
      block.role === "quote"
        ? `rounded-md font-medium border-l-[8px] border-gray-300 bg-gray-100 p-4`
        : "",
    ),
    onInput: (event: ChangeEvent<HTMLElement>) => {
      onDataChange(event);
    },
    onKeyDown: (event: KeyboardEvent) => {
      keyboardHandler(event);
    },
    onClick,
    onSelect: () => {
      if (window.getSelection()?.toString().length !== 0) {
        onSelect(block);
      }
    },
  });
}
