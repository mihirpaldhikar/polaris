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
  type Blob,
  type Block,
  type Coordinates,
  type Menu,
  type Style,
} from "../../interfaces";
import {
  elementContainsStyle,
  generateBlockId,
  generateMenuId,
  getBlockNode,
  getCaretCoordinates,
  inlineSpecifierLink,
  inlineSpecifierManager,
  normalizeContent,
  removeEmptyInlineSpecifiers,
  setCaretOffset,
} from "../../utils";
import { type Content } from "../../types";
import { createRoot } from "react-dom/client";
import { SelectionMenu } from "../SelectionMenu";
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  TextSizeIcon,
  UnderlineIcon,
} from "../../icons";
import { REMOVE_LINK, REMOVE_STYLE } from "../../constants";

interface WorkspaceProps {
  editable: boolean;
  blob: Blob;
  onSave?: (blob: Blob) => void;
  autoSaveTimeout?: number;
  selectionMenu?: Menu[];
}

/**
 * @function Editor
 *
 * @param editable
 * @param blob
 * @param autoSaveTime
 * @param selectionMenu
 * @param onSave
 *
 * @description A Workspace is essentially as Editor which manages all the contents of the blob. Workspace also handles user interactions and updates the re-renders the DOM accordingly.
 *
 * @author Mihir Paldhikar
 */

export default function Editor({
  editable,
  blob,
  autoSaveTimeout,
  selectionMenu,
  onSave,
}: WorkspaceProps): JSX.Element {
  const [contents, updateContents] = useState<Block[]>(
    blob.contents.map((block) => {
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
              const blockRef = contents.map((block) => {
                return {
                  ...block,
                  reference: undefined,
                };
              });
              const blobRef = blob;
              blobRef.contents = blockRef;
              onSave(blobRef);
            }
          }

          break;
        }
      }
    },
    [contents, blob, onSave]
  );

  useEffect(() => {
    if (editable && autoSaveTimeout !== undefined && onSave !== undefined) {
      setInterval(() => {
        const blockRef = contents.map((block) => {
          return {
            ...block,
            reference: undefined,
          };
        });
        const blobRef = blob;
        blobRef.contents = blockRef;
        onSave(blobRef);
      }, autoSaveTimeout);
    }
  }, [autoSaveTimeout, contents, blob, editable, onSave]);

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
    const blockIndex: number = contents.indexOf(block);
    contents[blockIndex] = block;
    updateContents(contents);
  }

  function createHandler(
    block: Block,
    newBlock: Block,
    position: "above" | "below"
  ): void {
    const blockIndex = contents.indexOf(block);
    contents[blockIndex] = block;
    contents.splice(
      position === "below" ? blockIndex + 1 : blockIndex,
      0,
      newBlock
    );
    updateContents(contents);
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
    const blockIndex = contents.indexOf(block);
    contents.splice(blockIndex, 1);
    updateContents(contents);
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
    const blockIndex = contents.indexOf(block);
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
      contents.splice(blockIndex, 1, ...pasteBlocks);
      updateContents(contents);

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
      contents[blockIndex].content = contents[blockIndex].content
        .substring(0, caretOffset)
        .concat(content)
        .concat(contents[blockIndex].content.substring(caretOffset));

      updateContents(contents);

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
    const popupNode = window.document.getElementById(`popup-${blob.id}`);
    const editorNode = window.document.getElementById(`editor-${blob.id}`);

    if (
      selection == null ||
      blockNode == null ||
      popupNode == null ||
      editorNode == null ||
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
      {
        id: generateMenuId(),
        name: "Link",
        icon: <LinkIcon />,
        execute: {
          type: "userInput",
          args: {
            hint: "link..",
            type: "text",
            executionTypeAfterInput: "linkManager",
            initialPayload: inlineSpecifierLink() ?? "",
            payloadIfRemovedClicked: REMOVE_LINK,
            validStringRegExp:
              /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/,
          },
        },
      },
      {
        id: generateMenuId(),
        name: "Text Size",
        icon: <TextSizeIcon />,
        execute: {
          type: "userInput",
          args: {
            hint: "size..",
            type: "number",
            unit: "px",
            executionTypeAfterInput: "styleManager",
            initialPayload: {
              name: "font-size",
              value: "",
            },
            payloadIfRemovedClicked: REMOVE_STYLE,
            validStringRegExp: /^[0-9]*$/,
          },
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
        blobId={blob.id}
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
              break;
            }
            case "linkManager": {
              inlineSpecifierManager(blockNode, [], executable.args as string);
              block.content = blockNode.innerHTML;
              changeHandler(block);
              break;
            }
          }
        }}
      />
    );

    editorNode.addEventListener(
      "keydown",
      () => {
        selection.removeAllRanges();
        popupRoot.unmount();
      },
      {
        once: true,
      }
    );
    editorNode.addEventListener(
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
      <div id={`popup-${blob.id}`}></div>
      <div id={`dialog-${blob.id}`}></div>
      <div
        id={`editor-${blob.id}`}
        className={"min-h-screen w-full px-2 pb-60"}
      >
        {contents.map((block, index) => {
          return (
            <Composer
              key={block.id}
              editable={editable}
              previousBlock={index !== 0 ? contents[index - 1] : null}
              block={block}
              nextBlock={
                index !== contents.length - 1 ? contents[index + 1] : null
              }
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
