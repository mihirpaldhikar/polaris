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
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { BLOCK_NODE } from "../../constants";
import { type Block, type Coordinates, type Table } from "../../interfaces";
import {
  blockRenderTypeFromRole,
  conditionalClassName,
  generateUUID,
  getBlockNode,
  getEditorRoot,
  getNodeSiblings,
  serializeNodeToBlock,
  setNodeStyle,
  subscribeToEditorEvent,
  unsubscribeFromEditorEvent,
} from "../../utils";
import RootContext from "../../contexts/RootContext/RootContext";
import {
  AddColumnIcon,
  AddRowIcon,
  DeleteColumnIcon,
  DeleteIcon,
  DeleteRowIcon,
} from "../../assets";
import RenderType from "../../enums/RenderType";

interface TableBlockProps {
  parentBlock?: Block;
  block: Block;
  editable: boolean;
  onChange: (block: Block, focus?: boolean) => void;
  onClick: (even: MouseEvent) => void;
  onSelect: (block: Block) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    nodeId: string,
    setCursorToStart?: boolean | undefined,
  ) => void;
}

export default function TableBlock({
  parentBlock,
  block,
  editable,
  onClick,
  onChange,
  onSelect,
  onDelete,
}: TableBlockProps): JSX.Element {
  const tableData = block.data as Table;

  function onCellChange(
    event: ChangeEvent<HTMLElement>,
    rowIndex: number,
    columnIndex: number,
  ): void {
    tableData.rows[rowIndex].columns[columnIndex].data = event.target.innerHTML;
    block.data = tableData;
    onChange(block);
  }

  const isActionMenuOpen = useRef(false);

  const { popUpRoot } = useContext(RootContext);

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

  const keyboardHandler = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "enter": {
          event.preventDefault();
          break;
        }
        case "arrowright":
        case "arrowleft":
        case "arrowup":
        case "arrowdown": {
          const activeNode = document.activeElement;
          if (
            !isActionMenuOpen.current &&
            (activeNode == null ||
              activeNode.getAttribute("data-block-type") !== "tableCell")
          ) {
            if (popUpRoot !== undefined) {
              popUpRoot.render(<Fragment />);
            }
          }
          break;
        }
      }
    },
    [popUpRoot],
  );

  useEffect(() => {
    window.addEventListener("keyup", keyboardHandler);
    return () => {
      window.removeEventListener("keyup", keyboardHandler);
    };
  }, [keyboardHandler]);

  function deleteHandler(): void {
    if (
      parentBlock !== undefined &&
      blockRenderTypeFromRole(parentBlock.role) === RenderType.LIST &&
      Array.isArray(parentBlock.data)
    ) {
      const currentBlockIndex = parentBlock.data
        .map((blk) => blk.id)
        .indexOf(block.id);
      if (currentBlockIndex !== -1) {
        parentBlock.data.splice(currentBlockIndex, 1);

        let previousNode: HTMLElement | null;

        if (currentBlockIndex === 0) {
          const currentNodeSibling = getNodeSiblings(parentBlock.id);
          previousNode = currentNodeSibling.previous;
        } else {
          previousNode = getBlockNode(
            parentBlock.data[currentBlockIndex - 1].id,
          );
        }
        if (previousNode !== null) {
          onDelete(parentBlock, block, previousNode.id);
        }
      }
    } else {
      const currentBlockSibling = getNodeSiblings(block.id);
      if (currentBlockSibling.previous != null) {
        onDelete(
          block,
          serializeNodeToBlock(currentBlockSibling.previous),
          currentBlockSibling.previous.id,
        );
      }
    }
    if (popUpRoot !== undefined) {
      popUpRoot.render(<Fragment />);
    }
  }

  function showTablePopup(rowIndex: number, columnIndex: number): void {
    if (popUpRoot === undefined) return;

    const tableNode = getBlockNode(block.id) as HTMLElement;

    const totalRow = tableData.rows.length;
    const totalColumns = tableData.rows[rowIndex].columns.length;

    const coordinates: Coordinates = {
      x: tableNode.getBoundingClientRect().x,
      y: tableNode.getBoundingClientRect().top - 46,
    };

    const editorRootNode = getEditorRoot();

    editorRootNode.addEventListener("click", () => {
      if (
        document.activeElement == null ||
        document.activeElement?.getAttribute("data-block-type") !== "tableCell"
      ) {
        if (popUpRoot !== undefined) {
          popUpRoot.render(<Fragment />);
        }
      }
    });

    popUpRoot.render(
      <div
        style={{
          top: coordinates.y,
          left: coordinates.x,
        }}
        className={
          "fixed z-50 flex space-x-1 flex-row items-center rounded-lg border border-gray-200 bg-white h-[40px] shadow-md px-2 py-1"
        }
      >
        <div
          title={"Add row after current row"}
          className={"p-1 rounded-md hover:bg-gray-100 cursor-pointer"}
          onClick={() => {
            const columns: Block[] = [];
            for (let i = 0; i < totalColumns; i++) {
              columns.push({
                id: generateUUID(),
                role: "paragraph",
                data: "",
                style: [],
              });
            }
            const newRow = {
              id: generateUUID(),
              columns,
            };
            tableData.rows.splice(rowIndex + 1, 0, newRow);
            block.data = tableData;
            onChange(block, true);
          }}
        >
          <AddRowIcon size={25} />
        </div>
        <div
          title={"Add column after current column"}
          className={"p-1 rounded-md hover:bg-gray-100 cursor-pointer"}
          onClick={() => {
            for (let i = 0; i < tableData.rows.length; i++) {
              for (let j = 0; j < tableData.rows[i].columns.length; j++) {
                if (j === columnIndex) {
                  tableData.rows[i].columns.splice(columnIndex + 1, 0, {
                    id: generateUUID(),
                    role: "paragraph",
                    data: "",
                    style: [],
                  });
                }
              }
            }
            block.data = tableData;
            onChange(block, true);
          }}
        >
          <AddColumnIcon size={25} />
        </div>
        <div
          title={"Delete current row"}
          className={"p-1 rounded-md hover:bg-gray-100 cursor-pointer"}
          onClick={() => {
            if (totalRow === 1) {
              deleteHandler();
              return;
            }
            for (let i = 0; i < tableData.rows.length; i++) {
              if (i === rowIndex) {
                tableData.rows.splice(i, 1);
              }
            }
            block.data = tableData;
            onChange(block, true);
          }}
        >
          <DeleteRowIcon size={25} />
        </div>
        <div
          title={"Delete current column"}
          className={"p-1 rounded-md hover:bg-gray-100 cursor-pointer"}
          onClick={() => {
            if (totalColumns === 1) {
              deleteHandler();
              return;
            }
            for (let i = 0; i < tableData.rows.length; i++) {
              for (let j = 0; j < tableData.rows[i].columns.length; j++) {
                if (j === columnIndex) {
                  tableData.rows[i].columns.splice(j, 1);
                }
              }
            }
            block.data = tableData;
            onChange(block, true);
          }}
        >
          <DeleteColumnIcon size={25} />
        </div>
        <div
          title={"Delete table"}
          className={"p-1 rounded-md hover:bg-gray-100 cursor-pointer"}
          onClick={() => {
            deleteHandler();
          }}
        >
          <DeleteIcon size={25} />
        </div>
      </div>,
    );
  }

  return (
    <table
      id={block.id}
      key={block.id}
      data-type={BLOCK_NODE}
      className={"table-auto my-3 block overflow-x-auto w-full"}
    >
      <tbody>
        {tableData.rows.map((row, rowIndex) => {
          return (
            <tr key={row.id} id={row.id}>
              {row.columns.map((cell, columnIndex) => {
                return createElement(rowIndex === 0 ? "th" : "td", {
                  id: cell.id,
                  key: cell.id,
                  "data-block-type": "tableCell",
                  "data-parent-block-id": block.id,
                  "data-top-node-id":
                    rowIndex === 0
                      ? "null"
                      : tableData.rows[rowIndex - 1].columns[columnIndex].id,
                  "data-bottom-node-id":
                    rowIndex === tableData.rows.length - 1
                      ? "null"
                      : tableData.rows[rowIndex + 1].columns[columnIndex].id,
                  "data-left-node-id":
                    columnIndex === 0
                      ? "null"
                      : row.columns[columnIndex - 1].id,
                  "data-right-node-id":
                    columnIndex === row.columns.length - 1
                      ? "null"
                      : row.columns[columnIndex + 1].id,
                  className: conditionalClassName(
                    `border focus:ring-0 max-w-fit min-w-[150px] focus:outline-none ring-0 outline-none border-gray-300 px-3 py-2`,
                    rowIndex === 0 ? "text-center" : "text-start",
                  ),
                  contentEditable: editable,
                  disabled: !editable,
                  spellCheck: true,
                  style: { ...setNodeStyle(cell.style) },
                  dangerouslySetInnerHTML: { __html: cell.data },
                  onSelect: () => {
                    if (window.getSelection()?.toString().length !== 0) {
                      onSelect(cell);
                    }
                  },
                  onClick,
                  onInput: (event: ChangeEvent<HTMLElement>) => {
                    onCellChange(event, rowIndex, columnIndex);
                  },
                  onFocus: () => {
                    showTablePopup(rowIndex, columnIndex);
                  },
                });
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
