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
  createRef,
  Fragment,
  type JSX,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Composer } from "../Composer";
import {
  type Block,
  type Coordinates,
  type Document,
  type Menu,
  type Style,
} from "../../interfaces";
import {
  elementContainsStyle,
  generateBlockId,
  generateMenuId,
  getBlockNode,
  getCaretCoordinates,
  inlineSpecifierManager,
  normalizeContent,
  removeEmptyInlineSpecifiers,
  setCaretOffset,
} from "../../utils";
import { type Content } from "../../types";
import { createRoot } from "react-dom/client";
import { SelectionMenu } from "../SelectionMenu";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "../../icons";

interface WorkspaceProps {
  editable: boolean;
  document: Document;
  onSave?: (document: Document) => void;
  autoSaveTimeout?: number;
  selectionMenu?: Menu[];
}

/**
 * @function Workspace
 *
 * @param editable
 * @param document
 * @param autoSaveTime
 * @param selectionMenu
 * @param onSave
 *
 * @description A Workspace is essentially as Editor which manages all the blocks of the document. Workspace also handles user interactions and updates the re-renders the DOM accordingly.
 *
 * @author Mihir Paldhikar
 */

export default function Workspace({
  editable,
  document,
  autoSaveTimeout,
  selectionMenu,
  onSave,
}: WorkspaceProps): JSX.Element {
  const [blocks, updateBlocks] = useState<Block[]>(
    document.blocks.map((block) => {
      return {
        ...block,
        reference: createRef<HTMLElement>(),
      };
    })
  );

  const [focusedNode, setFocusedNode] = useState<{
    nodeId: string;
    caretOffset: number;
    nodeIndex?: number;
  } | null>(null);

  const keyboardManager = useCallback(
    (event: KeyboardEvent): void => {
      switch (event.key.toLowerCase()) {
        case "s": {
          if (event.ctrlKey) {
            event.preventDefault();
            if (onSave !== undefined) {
              const blockRef = blocks.map((block) => {
                return {
                  ...block,
                  reference: undefined,
                };
              });
              const documentRef = document;
              documentRef.blocks = blockRef;
              onSave(documentRef);
            }
          }

          break;
        }
      }
    },
    [blocks, document, onSave]
  );

  useEffect(() => {
    if (editable && autoSaveTimeout !== undefined && onSave !== undefined) {
      setInterval(() => {
        const blockRef = blocks.map((block) => {
          return {
            ...block,
            reference: undefined,
          };
        });
        const documentRef = document;
        documentRef.blocks = blockRef;
        onSave(documentRef);
      }, autoSaveTimeout);
    }
  }, [autoSaveTimeout, blocks, document, editable, onSave]);

  useEffect(() => {
    window.addEventListener("keydown", keyboardManager);
    return () => {
      window.removeEventListener("keydown", keyboardManager);
    };
  }, [keyboardManager]);

  useEffect(() => {
    if (focusedNode != null) {
      const { nodeId, nodeIndex, caretOffset } = focusedNode;
      const node = getBlockNode(nodeId);

      if (node != null) {
        const computedNode: Node =
          nodeIndex !== undefined && node.childNodes[nodeIndex] !== undefined
            ? node.childNodes[nodeIndex]
            : node;

        const jumpNode =
          computedNode.nodeType === Node.ELEMENT_NODE
            ? (computedNode.firstChild as Node) ?? node
            : computedNode;

        setCaretOffset(jumpNode, caretOffset);
        removeEmptyInlineSpecifiers(node);
      }
    }
  }, [focusedNode]);

  function changeHandler(block: Block): void {
    const blockIndex: number = blocks.indexOf(block);
    blocks[blockIndex] = block;
    updateBlocks(blocks);
  }

  function createHandler(
    block: Block,
    newBlock: Block,
    position: "above" | "below"
  ): void {
    const blockIndex = blocks.indexOf(block);
    blocks[blockIndex] = block;
    blocks.splice(
      position === "below" ? blockIndex + 1 : blockIndex,
      0,
      newBlock
    );
    updateBlocks(blocks);
    setFocusedNode({
      nodeId: newBlock.id,
      caretOffset: 0,
      nodeIndex: 0,
    });
  }

  function deletionHandler(
    block: Block,
    previousBlock: Block,
    nodeIndex: number,
    caretOffset: number
  ): void {
    const blockIndex = blocks.indexOf(block);
    blocks.splice(blockIndex, 1);
    updateBlocks(blocks);
    setFocusedNode({
      nodeId: previousBlock.id,
      caretOffset,
      nodeIndex,
    });
  }

  function pasteHandler(
    block: Block,
    content: Content | Content[],
    caretOffset: number
  ): void {
    const blockIndex = blocks.indexOf(block);
    block.content = normalizeContent(block.content);
    const contentLengthAfterCaretOffset =
      block.content.substring(caretOffset).length;

    if (block.type === "text" && Array.isArray(content)) {
      const pasteBlocks: Block[] = content.map((copiedText, index) => {
        return {
          id: generateBlockId(),
          reference: createRef<HTMLElement>(),
          type: block.type,
          role: block.role,
          style: block.style,
          content:
            index === 0
              ? block.content.substring(0, caretOffset).concat(copiedText)
              : index === content.length - 1
              ? copiedText.concat(block.content.substring(caretOffset))
              : copiedText,
        };
      });
      blocks.splice(blockIndex, 1, ...pasteBlocks);
      updateBlocks(blocks);

      const pasteContentLength = normalizeContent(
        pasteBlocks[pasteBlocks.length - 1].content
      ).length;

      const computedCaretOffset: number =
        pasteContentLength - contentLengthAfterCaretOffset < 0
          ? contentLengthAfterCaretOffset - pasteContentLength
          : pasteContentLength - contentLengthAfterCaretOffset;

      setFocusedNode({
        nodeId: pasteBlocks[pasteBlocks.length - 1].id,
        caretOffset: computedCaretOffset,
      });
    } else if (block.type === "text" && typeof content === "string") {
      blocks[blockIndex].content = blocks[blockIndex].content
        .substring(0, caretOffset)
        .concat(content)
        .concat(blocks[blockIndex].content.substring(caretOffset));

      updateBlocks(blocks);

      const pasteContentLength = normalizeContent(block.content).length;

      const computedCaretOffset: number =
        pasteContentLength - contentLengthAfterCaretOffset < 0
          ? contentLengthAfterCaretOffset - pasteContentLength
          : pasteContentLength - contentLengthAfterCaretOffset;

      setFocusedNode({
        nodeId: block.id,
        caretOffset: computedCaretOffset,
      });
    }
  }

  function selectionHandler(block: Block): void {
    const selection = window.getSelection();

    const blockNode = getBlockNode(block.id);
    const popupNode = window.document.getElementById(`popup-${document.id}`);
    const workspaceNode = window.document.getElementById(
      `workspace-${document.id}`
    );

    if (
      selection == null ||
      blockNode == null ||
      popupNode == null ||
      workspaceNode == null ||
      selection.toString() === ""
    ) {
      return;
    }

    const { x: endX } = getCaretCoordinates(false);
    const { x: startX, y: startY } = getCaretCoordinates(true);
    const middleX = startX + (endX - startX) / 2;

    const selectionMenuCoordinates: Coordinates = {
      x: middleX,
      y: startY,
    };
    const range = selection.getRangeAt(0);
    const startNodeParent = range.startContainer.parentElement;
    const endNodeParent = range.endContainer.parentElement;

    if (startNodeParent == null || endNodeParent == null) {
      return;
    }

    const popupRoot = createRoot(popupNode);

    const defaultSelectionMenu: Menu[] = [
      {
        id: generateMenuId(),
        name: "Bold",
        icon: <BoldIcon />,
        execute: {
          type: "styleManager",
          args: [
            {
              name: "font-weight",
              value: "bold",
            },
          ],
        },
      },
      {
        id: generateMenuId(),
        name: "Italic",
        icon: <ItalicIcon />,
        execute: {
          type: "styleManager",
          args: [
            {
              name: "font-style",
              value: "italic",
            },
          ],
        },
      },
      {
        id: generateMenuId(),
        name: "Underline",
        icon: <UnderlineIcon />,
        execute: {
          type: "styleManager",
          args: [
            {
              name: "text-decoration",
              value: "underline",
            },
          ],
        },
      },
    ];

    if (selectionMenu !== undefined && selectionMenu.length !== 0) {
      defaultSelectionMenu.push(...selectionMenu);
    }

    for (const menu of defaultSelectionMenu) {
      if (menu.execute.type === "styleManager") {
        if (
          elementContainsStyle(startNodeParent, menu.execute.args as Style[]) &&
          elementContainsStyle(endNodeParent, menu.execute.args as Style[])
        ) {
          menu.active = true;
        }
      }
    }

    popupRoot.render(
      <SelectionMenu
        coordinates={selectionMenuCoordinates}
        menus={defaultSelectionMenu}
        onClose={() => {
          popupRoot.unmount();
        }}
        onMenuSelected={(executable) => {
          selection.removeAllRanges();
          selection.addRange(range);
          switch (executable.type) {
            case "styleManager": {
              inlineSpecifierManager(blockNode, executable.args as Style[]);
              block.content = blockNode.innerHTML;
              changeHandler(block);
            }
          }
        }}
      />
    );

    workspaceNode.addEventListener(
      "keydown",
      () => {
        selection.removeAllRanges();
        popupRoot.unmount();
      },
      {
        once: true,
      }
    );
    workspaceNode.addEventListener(
      "mousedown",
      () => {
        selection.removeAllRanges();
        popupRoot.unmount();
      },
      {
        once: true,
      }
    );
  }

  return (
    <Fragment>
      <div id={`popup-${document.id}`}></div>
      <div id={`dialog-${document.id}`}></div>
      <div
        id={`workspace-${document.id}`}
        className={"min-h-screen w-full px-2 pb-60"}
      >
        {blocks.map((block, index) => {
          return (
            <Composer
              key={block.id}
              editable={editable}
              previousBlock={index !== 0 ? blocks[index - 1] : null}
              block={block}
              nextBlock={index !== blocks.length - 1 ? blocks[index + 1] : null}
              onChange={changeHandler}
              onCreate={createHandler}
              onDelete={deletionHandler}
              onPaste={pasteHandler}
              onSelect={selectionHandler}
            />
          );
        })}
      </div>
    </Fragment>
  );
}
