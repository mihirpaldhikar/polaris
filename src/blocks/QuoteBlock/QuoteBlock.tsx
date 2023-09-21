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
  conditionalClassName,
  generateUUID,
  getBlockNode,
  getCaretOffset,
  getConfigFromRole,
  openLinkInNewTab,
  setNodeStyle,
  splitBlocksAtCaretOffset,
  subscribeToEditorEvent,
  unsubscribeFromEditorEvent,
} from "../../utils";
import {
  type BlockLifecycle,
  type BlockSchema,
  type Table,
} from "../../interfaces";
import RootContext from "../../contexts/RootContext/RootContext";
import { type TextBlockConfig } from "../../interfaces/PolarisConfig";
import { type TextBlockSchema } from "../../schema";

interface QuoteBlockProps {
  block: TextBlockSchema;
  blockLifecycle: BlockLifecycle;
}

export default function QuoteBlock({
  block,
  blockLifecycle,
}: QuoteBlockProps): JSX.Element {
  const {
    previousParentBlock,
    editable,
    listMetadata,
    onChange,
    onCreate,
    onDelete,
    onMarkdown,
    onSelect,
  } = blockLifecycle;
  const isActionMenuOpen = useRef(false);
  const originalBlock = useRef<BlockSchema>({ ...block });
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

        let newBlock: BlockSchema = {
          id: generateUUID(),
          data: "",
          role: "paragraph",
          style: [],
        };

        const splitNode = splitBlocksAtCaretOffset<TextBlockSchema>(
          block,
          caretOffset,
        );
        block = splitNode[0];
        newBlock = splitNode[1];

        if (
          listMetadata !== undefined &&
          block.data.length === 0 &&
          (newBlock.data as string).length === 0
        ) {
          const listData = listMetadata.parent.data as BlockSchema[];
          const remainingList = listData.splice(
            listMetadata.currentIndex,
            listData.length - listMetadata.currentIndex,
          );
          remainingList.splice(0, 1);
          listMetadata.parent.data = listData;
          onCreate(listMetadata.parent, newBlock);

          if (remainingList.length > 0) {
            const newListBlock: BlockSchema = {
              id: generateUUID(),
              role: listMetadata.parent.role,
              style: listMetadata.parent.style,
              data: remainingList,
            };
            onCreate(newBlock, newListBlock, undefined, {
              nodeId: newBlock.id,
            });
          }

          return;
        }

        onCreate(
          block,
          newBlock,
          listMetadata !== undefined
            ? (listMetadata.parent.data as BlockSchema[])
            : undefined,
        );
        break;
      }

      case "backspace": {
        if (roleChangeByMarkdown.current) {
          event.preventDefault();
          onMarkdown(originalBlock.current);
          roleChangeByMarkdown.current = false;
          break;
        }
        if (caretOffset !== 0) return;

        event.preventDefault();

        if (
          listMetadata !== undefined &&
          typeof listMetadata.parent.role === "string"
        ) {
          const listData = listMetadata.parent.data as BlockSchema[];
          if (listMetadata.currentIndex === 0) {
            if (previousParentBlock == null) return;
            const separateBlock = listData.splice(0, 1)[0];
            onCreate(previousParentBlock, separateBlock, undefined, {
              nodeId: separateBlock.id,
              caretOffset: 0,
            });
            if (listData.length === 0) {
              onDelete(
                listMetadata.parent,
                separateBlock,
                separateBlock.id,
                true,
              );
            }
          } else if (
            typeof listData[listMetadata.currentIndex - 1].data === "string"
          ) {
            listData[listMetadata.currentIndex - 1].data = (
              listData[listMetadata.currentIndex - 1].data as string
            ).concat(block.data);
            listMetadata.parent.data = listData;
            onDelete(
              block,
              listData[listMetadata.currentIndex - 1],
              listData[listMetadata.currentIndex - 1].id,
              false,
              listMetadata.parent.data,
            );
          } else if (
            typeof listData[listMetadata.currentIndex - 1].data === "object" &&
            (listData[listMetadata.currentIndex - 1].role as string)
              .toLowerCase()
              .includes("table")
          ) {
            const tableData = listData[listMetadata.currentIndex - 1]
              .data as Table;
            tableData.rows[tableData.rows.length - 1].columns[
              tableData.rows[tableData.rows.length - 1].columns.length - 1
            ].data = tableData.rows[tableData.rows.length - 1].columns[
              tableData.rows[tableData.rows.length - 1].columns.length - 1
            ].data.concat(block.data);
            listData[listMetadata.currentIndex - 1].data = tableData;
            onDelete(
              block,
              tableData.rows[tableData.rows.length - 1].columns[
                tableData.rows[tableData.rows.length - 1].columns.length - 1
              ],
              tableData.rows[tableData.rows.length - 1].columns[
                tableData.rows[tableData.rows.length - 1].columns.length - 1
              ].id,
            );
          }
          return;
        }

        if (previousParentBlock == null) return;

        if (typeof previousParentBlock.data === "string") {
          previousParentBlock.data = previousParentBlock.data.concat(
            block.data,
          );
          onDelete(block, previousParentBlock, previousParentBlock.id);
        } else if (
          Array.isArray(previousParentBlock.data) &&
          (previousParentBlock.role as string).toLowerCase().includes("list")
        ) {
          const listData = previousParentBlock.data;
          if (typeof listData[listData.length - 1].data === "string") {
            listData[listData.length - 1].data = (
              listData[listData.length - 1].data as string
            ).concat(block.data);
            onDelete(
              block,
              listData[listData.length - 1],
              listData[listData.length - 1].id,
            );
          }
        } else if (
          typeof previousParentBlock.data === "object" &&
          (previousParentBlock.role as string).toLowerCase().includes("table")
        ) {
          const tableData = previousParentBlock.data as Table;
          tableData.rows[tableData.rows.length - 1].columns[
            tableData.rows[tableData.rows.length - 1].columns.length - 1
          ].data = tableData.rows[tableData.rows.length - 1].columns[
            tableData.rows[tableData.rows.length - 1].columns.length - 1
          ].data.concat(block.data);
          previousParentBlock.data = tableData;
          onDelete(
            block,
            tableData.rows[tableData.rows.length - 1].columns[
              tableData.rows[tableData.rows.length - 1].columns.length - 1
            ],
            tableData.rows[tableData.rows.length - 1].columns[
              tableData.rows[tableData.rows.length - 1].columns.length - 1
            ].id,
          );
        }

        break;
      }
      case " ": {
        switch (block.data) {
          case "#": {
            event.preventDefault();
            block.role = "title";
            block.data = "";
            roleChangeByMarkdown.current = true;
            onMarkdown(block);
            break;
          }
          case "##": {
            event.preventDefault();
            block.role = "subTitle";
            block.data = "";
            roleChangeByMarkdown.current = true;
            onMarkdown(block);
            break;
          }
          case "###": {
            event.preventDefault();
            block.role = "heading";
            block.data = "";
            roleChangeByMarkdown.current = true;
            onMarkdown(block);
            break;
          }
          case "####": {
            event.preventDefault();
            block.role = "subHeading";
            block.data = "";
            roleChangeByMarkdown.current = true;
            onMarkdown(block);
            break;
          }
          case "&gt;":
          case ">": {
            event.preventDefault();
            block.role = "quote";
            block.data = "";
            roleChangeByMarkdown.current = true;
            onMarkdown(block);
            break;
          }
          case "+":
          case "-": {
            event.preventDefault();
            const focusBlockId = generateUUID();
            const newBlock: BlockSchema = {
              id: block.id,
              role: "bulletList",
              style: [],
              data: [
                {
                  id: focusBlockId,
                  data: "",
                  role: "paragraph",
                  style: [],
                },
              ],
            };
            roleChangeByMarkdown.current = true;
            onMarkdown(newBlock, focusBlockId);
            break;
          }
          default: {
            if (/^\d+\.$/.test(block.data)) {
              event.preventDefault();
              const focusBlockId = generateUUID();
              const newBlock: BlockSchema = {
                id: block.id,
                role: "numberedList",
                style: [],
                data: [
                  {
                    id: focusBlockId,
                    data: "",
                    role: "paragraph",
                    style: [],
                  },
                ],
              };
              roleChangeByMarkdown.current = true;
              onMarkdown(newBlock, focusBlockId);
            }
          }
        }
        break;
      }
    }
  }

  return createElement("blockquote", {
    "data-parent-block-id":
      listMetadata === undefined ? null : listMetadata.parent.id,
    "data-child-block-index":
      listMetadata === undefined ? null : listMetadata.currentIndex,
    id: block.id,
    disabled: !editable,
    contentEditable: editable,
    dangerouslySetInnerHTML: { __html: block.data },
    style: {
      fontSize: `${
        (getConfigFromRole(block.role, config) as TextBlockConfig).fontSize
      }rem`,
      fontWeight: (getConfigFromRole(block.role, config) as TextBlockConfig)
        .fontWeight,
      lineHeight: (getConfigFromRole(block.role, config) as TextBlockConfig)
        .lineHeight,
      ...setNodeStyle(block.style),
    },
    placeholder: "Write your quote...",
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
    onClick: (event: MouseEvent) => {
      openLinkInNewTab(event);
    },
    onSelect: () => {
      if (window.getSelection()?.toString().length !== 0) {
        onSelect(block);
      }
    },
  });
}
