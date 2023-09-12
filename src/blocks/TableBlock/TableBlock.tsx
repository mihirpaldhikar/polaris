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
  useContext,
} from "react";
import { BLOCK_NODE } from "../../constants";
import { type Block, type Coordinates, type Table } from "../../interfaces";
import {
  blockRenderTypeFromRole,
  conditionalClassName,
  generateBlockId,
  getBlockNode,
  getCaretOffset,
  getEditorRoot,
  getNodeAt,
  getNodeSiblings,
  serializeNodeToBlock,
  setCaretOffset,
  setNodeStyle,
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

  const { popUpRoot } = useContext(RootContext);

  function handleKeyboard(
    event: KeyboardEvent,
    rowIndex: number,
    columnIndex: number,
  ): void {
    const totalRow = tableData.rows.length;
    const totalColumns = tableData.rows[rowIndex].columns.length;
    const cell: Block = tableData.rows[rowIndex].columns[columnIndex];
    const cellNode = getBlockNode(cell.id) as HTMLElement;
    const caretOffset = getCaretOffset(cellNode);
    switch (event.key.toLowerCase()) {
      case "enter": {
        event.preventDefault();
        break;
      }
      case "arrowright": {
        if (caretOffset === cellNode.innerText.length) {
          event.preventDefault();
          if (columnIndex + 1 < totalColumns) {
            const nextCell = tableData.rows[rowIndex].columns[columnIndex + 1];
            const nextCellNode = getBlockNode(nextCell.id) as HTMLElement;
            setCaretOffset(nextCellNode, 0);
          } else if (rowIndex + 1 < totalRow) {
            const nextCell = tableData.rows[rowIndex + 1].columns[0];
            const nextCellNode = getBlockNode(nextCell.id) as HTMLElement;
            setCaretOffset(nextCellNode, 0);
          } else if (
            columnIndex + 1 === totalColumns &&
            rowIndex + 1 === totalRow
          ) {
            const cellSiblings = getNodeSiblings(block.id);
            if (cellSiblings.next != null) {
              setCaretOffset(cellSiblings.next, 0);
              if (popUpRoot !== undefined) {
                popUpRoot.render(<Fragment />);
              }
            }
          }
        }
        break;
      }
      case "arrowleft": {
        if (caretOffset === 0) {
          event.preventDefault();
          if (columnIndex - 1 >= 0) {
            const previousCell =
              tableData.rows[rowIndex].columns[columnIndex - 1];
            const previousCellNode = getBlockNode(
              previousCell.id,
            ) as HTMLElement;
            focusOnNode(previousCellNode);
          } else if (rowIndex - 1 >= 0) {
            const nextCell =
              tableData.rows[rowIndex - 1].columns[totalColumns - 1];
            const previousCellNode = getBlockNode(nextCell.id) as HTMLElement;
            focusOnNode(previousCellNode);
          } else if (columnIndex === 0 && rowIndex === 0) {
            const cellSiblings = getNodeSiblings(block.id);
            if (cellSiblings.previous != null) {
              focusOnNode(cellSiblings.previous);
              if (popUpRoot !== undefined) {
                popUpRoot.render(<Fragment />);
              }
            }
          }
        }
        break;
      }
      case "arrowup": {
        event.preventDefault();
        if (rowIndex - 1 >= 0) {
          const aboveCell = tableData.rows[rowIndex - 1].columns[columnIndex];
          const aboveCellNode = getBlockNode(aboveCell.id) as HTMLElement;

          const nodeAtCaretOffset = getNodeAt(aboveCellNode, caretOffset);

          const jumpNode =
            caretOffset > aboveCellNode.innerText.length
              ? aboveCellNode.lastChild ?? aboveCellNode
              : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
              ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
              : nodeAtCaretOffset;

          const computedCaretOffset =
            caretOffset > aboveCellNode.innerText.length
              ? aboveCellNode.lastChild?.textContent == null
                ? 0
                : aboveCellNode.lastChild.textContent.length
              : caretOffset > (jumpNode.textContent as string).length
              ? jumpNode.textContent == null
                ? 0
                : jumpNode.textContent.length
              : caretOffset;

          setCaretOffset(jumpNode, computedCaretOffset);
        } else {
          const tableSiblings = getNodeSiblings(block.id);
          if (tableSiblings.previous != null) {
            const previousNode = tableSiblings.previous;

            const nodeAtCaretOffset = getNodeAt(previousNode, caretOffset);

            const jumpNode =
              caretOffset > previousNode.innerText.length
                ? previousNode.lastChild ?? previousNode
                : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
                ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
                : nodeAtCaretOffset;

            const computedCaretOffset =
              caretOffset > previousNode.innerText.length
                ? previousNode.lastChild?.textContent == null
                  ? 0
                  : previousNode.lastChild.textContent.length
                : caretOffset > (jumpNode.textContent as string).length
                ? jumpNode.textContent == null
                  ? 0
                  : jumpNode.textContent.length
                : caretOffset;

            setCaretOffset(jumpNode, computedCaretOffset);
            if (popUpRoot !== undefined) {
              popUpRoot.render(<Fragment />);
            }
          }
        }
        break;
      }
      case "arrowdown": {
        event.preventDefault();
        if (rowIndex + 1 < totalRow) {
          const belowCell = tableData.rows[rowIndex + 1].columns[columnIndex];
          const belowCellNode = getBlockNode(belowCell.id) as HTMLElement;

          const nodeAtCaretOffset = getNodeAt(belowCellNode, caretOffset);

          const jumpNode =
            caretOffset > belowCellNode.innerText.length
              ? belowCellNode.lastChild ?? belowCellNode
              : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
              ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
              : nodeAtCaretOffset;

          const computedCaretOffset =
            caretOffset > belowCellNode.innerText.length
              ? belowCellNode.lastChild?.textContent == null
                ? 0
                : belowCellNode.lastChild.textContent.length
              : caretOffset > (jumpNode.textContent as string).length
              ? jumpNode.textContent == null
                ? 0
                : jumpNode.textContent.length
              : caretOffset;

          setCaretOffset(jumpNode, computedCaretOffset);
        } else {
          const tableSiblings = getNodeSiblings(block.id);
          if (tableSiblings.next != null) {
            const nextNode = tableSiblings.next;

            const nodeAtCaretOffset = getNodeAt(nextNode, caretOffset);

            const jumpNode =
              caretOffset > nextNode.innerText.length
                ? nextNode.lastChild ?? nextNode
                : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
                ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
                : nodeAtCaretOffset;

            const computedCaretOffset =
              caretOffset > nextNode.innerText.length
                ? nextNode.lastChild?.textContent == null
                  ? 0
                  : nextNode.lastChild.textContent.length
                : caretOffset > (jumpNode.textContent as string).length
                ? jumpNode.textContent == null
                  ? 0
                  : jumpNode.textContent.length
                : caretOffset;

            setCaretOffset(jumpNode, computedCaretOffset);
            if (popUpRoot !== undefined) {
              popUpRoot.render(<Fragment />);
            }
          }
        }
        break;
      }
    }
  }

  function focusOnNode(node: HTMLElement): void {
    const previousCellChildNodeIndex =
      node?.lastChild?.textContent === ""
        ? node.childNodes.length - 2
        : node.childNodes.length - 1;

    const computedCaretOffset =
      previousCellChildNodeIndex === -1
        ? 0
        : node.childNodes[previousCellChildNodeIndex] != null
        ? node.childNodes[previousCellChildNodeIndex].nodeType ===
          Node.ELEMENT_NODE
          ? (node.childNodes[previousCellChildNodeIndex].textContent as string)
              .length
          : node.childNodes[previousCellChildNodeIndex].textContent?.length ??
            node.innerText.length
        : node.innerText.length;
    setCaretOffset(
      previousCellChildNodeIndex === -1
        ? node
        : node.childNodes[previousCellChildNodeIndex].nodeType ===
          Node.ELEMENT_NODE
        ? node.childNodes[previousCellChildNodeIndex].firstChild ?? node
        : node.childNodes[previousCellChildNodeIndex],
      computedCaretOffset,
    );
  }

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
        document.activeElement?.getAttribute("data-block-render-type") !==
          "tableCell"
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
                id: generateBlockId(),
                role: "paragraph",
                data: "",
                style: [],
              });
            }
            const newRow = {
              id: generateBlockId(),
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
                    id: generateBlockId(),
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
      data-block-render-type={"table"}
      className={"table-auto my-3 block overflow-x-auto w-full"}
    >
      <tbody>
        {tableData.rows.map((row, rowIndex) => {
          return (
            <tr key={row.id} id={row.id} data-block-render-type={"tableRow"}>
              {row.columns.map((cell, columnIndex) => {
                return createElement(rowIndex === 0 ? "th" : "td", {
                  id: cell.id,
                  key: cell.id,
                  "data-block-render-type": "tableCell",
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
                  onKeyDown: (event: KeyboardEvent) => {
                    handleKeyboard(event, rowIndex, columnIndex);
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
