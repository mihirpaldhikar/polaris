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

import { Fragment, type JSX, useCallback, useEffect, useState } from "react";
import {
  type Attachment,
  type Blob,
  type Block,
  type Coordinates,
  type InputArgs,
  type Menu,
  type Style,
} from "../../interfaces";
import {
  blockRenderTypeFromNode,
  blockRenderTypeFromRole,
  dispatchEvent,
  elementContainsStyle,
  generateBlockId,
  getBlockNode,
  getCaretCoordinates,
  inlineSpecifierManager,
  nodeInViewPort,
  normalizeContent,
  removeEmptyInlineSpecifiers,
  rgbStringToHex,
  serializeNodeToBlock,
  setCaretOffset,
  traverseAndDelete,
  traverseAndFindBlockPosition,
  traverseAndUpdate,
  traverseAndUpdateBelow,
} from "../../utils";
import { type Role } from "../../types";
import { createRoot, type Root } from "react-dom/client";
import { InlineToolbar } from "../InlineToolbar";
import { MasterBlockTools, MasterInlineTools } from "../../assets";
import { LINK_ATTRIBUTE } from "../../constants";
import { BlockTools } from "../BlockTools";
import RenderType from "../../enums/RenderType";
import RootContext from "../../contexts/RootContext/RootContext";
import { debounce } from "debounce";
import { cloneDeep } from "lodash";
import { Composer } from "../Composer";

interface EditorProps {
  editable?: boolean;
  blob: Blob;
  onSave?: (blob: Blob) => void;
  autoSaveTimeout?: number;
  inlineTools?: Menu[];
  onAttachmentSelected: (data: File | string) => Promise<string>;
  onChange?: (blob: Blob) => void;
}

/**
 * @function Editor
 *
 * @param editable
 * @param blob
 * @param autoSaveTime
 * @param inlineTools
 * @param onSave
 *
 * @description A Workspace is essentially as Editor which manages all the contents of the blob. Workspace also handles user interactions and updates the re-renders the DOM accordingly.
 *
 * @author Mihir Paldhikar
 */

export default function Editor({
  editable = true,
  blob,
  autoSaveTimeout,
  inlineTools,
  onSave,
  onAttachmentSelected,
  onChange,
}: EditorProps): JSX.Element {
  let masterInlineTools: readonly Menu[] = cloneDeep(MasterInlineTools).concat(
    ...(inlineTools ?? []),
  );
  let masterBlockTools: readonly Menu[] = cloneDeep(MasterBlockTools);

  const [masterBlocks, updateMasterBlocks] = useState<Block[]>(blob.contents);
  const [focusedNode, setFocusedNode] = useState<
    | {
        nodeId: string;
        caretOffset: number;
        nodeIndex?: number;
      }
    | undefined
  >(undefined);

  const [popUpRoot, setPopUpRoot] = useState<Root>();
  const [dialogRoot, setDialogRoot] = useState<Root>();

  useEffect(() => {
    setPopUpRoot(
      createRoot(document.getElementById(`popup-${blob.id}`) as HTMLElement),
    );
    setDialogRoot(
      createRoot(document.getElementById(`dialog-${blob.id}`) as HTMLElement),
    );
    return () => {
      setPopUpRoot(undefined);
      setDialogRoot(undefined);
    };
  }, [blob.id]);

  const keyboardManager = useCallback(
    (event: KeyboardEvent): void => {
      switch (event.key.toLowerCase()) {
        case "s": {
          if (event.ctrlKey) {
            event.preventDefault();
            if (onSave !== undefined) {
              const blockRef = masterBlocks.map((block) => {
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
    [masterBlocks, blob, onSave],
  );

  useEffect(() => {
    if (editable && autoSaveTimeout !== undefined && onSave !== undefined) {
      setInterval(() => {
        const blockRef = masterBlocks.map((block) => {
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
  }, [autoSaveTimeout, masterBlocks, blob, editable, onSave]);

  useEffect(() => {
    window.addEventListener("keydown", keyboardManager);
    return () => {
      window.removeEventListener("keydown", keyboardManager);
    };
  }, [keyboardManager]);

  useEffect(() => {
    if (focusedNode !== undefined) {
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
    const blockIndex: number = masterBlocks
      .map((blk) => blk.id)
      .indexOf(block.id);
    if (blockIndex === -1) {
      traverseAndUpdate(masterBlocks, block);
    } else {
      masterBlocks[blockIndex] = block;
      updateMasterBlocks(masterBlocks);
    }
    if (blockRenderTypeFromRole(block.role) === RenderType.ATTACHMENT) {
      setFocusedNode({
        nodeId: block.id,
        nodeIndex: 0,
        caretOffset: 0,
      });
    }
    if (onChange !== undefined) {
      onChange(blob);
    }
  }

  function propagateChanges(
    blocks: Block[],
    focus?: {
      nodeId: string;
      caretOffset: number;
      nodeIndex?: number;
    },
  ): void {
    updateMasterBlocks(blocks);
    setFocusedNode(focus);
    if (onChange !== undefined) {
      onChange(blob);
    }
  }

  function createHandler(
    parentBlock: Block,
    targetBlock: Block,
    creationType: "list" | "nonList",
  ): void {
    if (creationType === "list") {
      traverseAndUpdate(masterBlocks, parentBlock);
    } else {
      const blockIndex = masterBlocks
        .map((blk) => blk.id)
        .indexOf(parentBlock.id);
      masterBlocks[blockIndex] = parentBlock;
      masterBlocks.splice(blockIndex + 1, 0, targetBlock);
    }
    propagateChanges(masterBlocks, {
      nodeId: targetBlock.id,
      caretOffset: 0,
      nodeIndex: 0,
    });
  }

  function deletionHandler(
    block: Block,
    previousBlock: Block,
    nodeId: string,
    setCursorToStart?: boolean,
  ): void {
    const previousNode = getBlockNode(nodeId) as HTMLElement;

    const previousBlockChildNodeIndex =
      setCursorToStart !== undefined && setCursorToStart
        ? 0
        : previousNode?.lastChild?.textContent === ""
        ? previousNode.childNodes.length - 2
        : previousNode.childNodes.length - 1;

    const computedCaretOffset =
      setCursorToStart !== undefined && setCursorToStart
        ? 0
        : previousNode.childNodes[previousBlockChildNodeIndex] != null
        ? previousNode.childNodes[previousBlockChildNodeIndex].nodeType ===
          Node.ELEMENT_NODE
          ? (
              previousNode.childNodes[previousBlockChildNodeIndex]
                .textContent as string
            ).length
          : previousNode.childNodes[previousBlockChildNodeIndex].textContent
              ?.length ?? previousNode.innerText.length
        : previousNode.innerText.length;

    if (blockRenderTypeFromRole(block.role) === RenderType.LIST) {
      traverseAndUpdate(masterBlocks, block);
    } else {
      traverseAndUpdate(masterBlocks, previousBlock);
      traverseAndDelete(masterBlocks, block);
    }
    propagateChanges(masterBlocks, {
      nodeId,
      caretOffset: computedCaretOffset,
      nodeIndex: previousBlockChildNodeIndex,
    });
  }

  function pasteHandler(
    block: Block,
    data: string | string[],
    caretOffset: number,
  ): void {
    if (typeof block.data !== "string") return;
    const blockIndex = masterBlocks.indexOf(block);
    block.data = normalizeContent(block.data);
    const contentLengthAfterCaretOffset =
      block.data.substring(caretOffset).length;

    if (
      blockRenderTypeFromRole(block.role) === RenderType.TEXT &&
      Array.isArray(data)
    ) {
      const pasteBlocks: Block[] = data.map((copiedText, index) => {
        return {
          id: generateBlockId(),
          role: block.role,
          style: block.style,
          data:
            index === 0
              ? (block.data as string)
                  .substring(0, caretOffset)
                  .concat(copiedText)
              : index === data.length - 1
              ? copiedText.concat((block.data as string).substring(caretOffset))
              : copiedText,
        };
      });
      masterBlocks.splice(blockIndex, 1, ...pasteBlocks);

      const pasteContentLength = normalizeContent(
        pasteBlocks[pasteBlocks.length - 1].data as string,
      ).length;

      const computedCaretOffset: number =
        pasteContentLength - contentLengthAfterCaretOffset < 0
          ? contentLengthAfterCaretOffset - pasteContentLength
          : pasteContentLength - contentLengthAfterCaretOffset;

      propagateChanges(masterBlocks, {
        nodeId: pasteBlocks[pasteBlocks.length - 1].id,
        caretOffset: computedCaretOffset,
      });
    } else if (
      blockRenderTypeFromRole(block.role) === RenderType.TEXT &&
      typeof data === "string"
    ) {
      masterBlocks[blockIndex].data = (masterBlocks[blockIndex].data as string)
        .substring(0, caretOffset)
        .concat(data)
        .concat(
          (masterBlocks[blockIndex].data as string).substring(caretOffset),
        );

      const pasteContentLength = normalizeContent(block.data).length;

      const computedCaretOffset: number =
        pasteContentLength - contentLengthAfterCaretOffset < 0
          ? contentLengthAfterCaretOffset - pasteContentLength
          : pasteContentLength - contentLengthAfterCaretOffset;

      propagateChanges(masterBlocks, {
        nodeId: block.id,
        caretOffset: computedCaretOffset,
      });
    }
  }

  function selectionHandler(block: Block): void {
    const selection = window.getSelection();

    const popupNode = window.document.getElementById(`popup-${blob.id}`);
    const blockNode = getBlockNode(block.id);
    const editorNode = window.document.getElementById(`editor-${blob.id}`);

    if (
      !editable ||
      selection == null ||
      blockNode == null ||
      editorNode == null ||
      popupNode == null ||
      popUpRoot === undefined
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

    for (const menu of masterInlineTools) {
      if (menu.execute.type === "style" && Array.isArray(menu.execute.args)) {
        if (
          elementContainsStyle(startNodeParent, menu.execute.args) &&
          elementContainsStyle(endNodeParent, menu.execute.args)
        ) {
          menu.active = true;
        }
      }

      if (menu.execute.type === "input") {
        const inputArgs = menu.execute.args as InputArgs;
        if (
          typeof inputArgs.initialPayload === "object" &&
          inputArgs.executionTypeAfterInput === "style" &&
          elementContainsStyle(startNodeParent, inputArgs.initialPayload) &&
          elementContainsStyle(endNodeParent, inputArgs.initialPayload)
        ) {
          inputArgs.initialPayload.value =
            inputArgs.type === "color"
              ? rgbStringToHex(
                  startNodeParent.style.getPropertyValue(
                    inputArgs.initialPayload.name,
                  ),
                )
              : startNodeParent.style.getPropertyValue(
                  inputArgs.initialPayload.name,
                );
          menu.active = true;
        }

        if (
          typeof inputArgs.initialPayload === "string" &&
          inputArgs.executionTypeAfterInput === "link" &&
          startNodeParent.getAttribute(LINK_ATTRIBUTE) !== null &&
          endNodeParent.getAttribute(LINK_ATTRIBUTE) !== null
        ) {
          inputArgs.initialPayload =
            startNodeParent.getAttribute(LINK_ATTRIBUTE) ?? "";
          menu.active = true;
        }
      }
    }

    popUpRoot.render(
      <InlineToolbar
        dialogRoot={dialogRoot}
        coordinates={selectionMenuCoordinates}
        menus={masterInlineTools}
        onClose={() => {
          popUpRoot.render(<Fragment />);
          masterInlineTools = cloneDeep(MasterInlineTools).concat(
            ...(inlineTools ?? []),
          );
        }}
        onMenuSelected={(executable) => {
          selection.removeAllRanges();
          selection.addRange(range);
          switch (executable.type) {
            case "style": {
              inlineSpecifierManager(blockNode, executable.args as Style[]);
              block.data = blockNode.innerHTML;
              changeHandler(block);
              break;
            }
            case "link": {
              inlineSpecifierManager(blockNode, [], executable.args as string);
              block.data = blockNode.innerHTML;
              changeHandler(block);
              break;
            }
          }
        }}
      />,
    );

    editorNode.addEventListener(
      "keydown",
      (event) => {
        if (!event.ctrlKey || !event.shiftKey) {
          popUpRoot.render(<Fragment />);
          masterInlineTools = cloneDeep(MasterInlineTools).concat(
            ...(inlineTools ?? []),
          );
        }
      },
      {
        once: true,
      },
    );
    editorNode.addEventListener(
      "mousedown",
      () => {
        popUpRoot.render(<Fragment />);
        masterInlineTools = cloneDeep(MasterInlineTools).concat(
          ...(inlineTools ?? []),
        );
      },
      {
        once: true,
      },
    );
  }

  function actionKeyHandler(
    nodeIndex: number,
    block: Block,
    previousContent: string,
    caretOffset: number,
  ): void {
    masterBlockTools = masterBlockTools.filter((menu) => {
      if (menu.allowedOn !== undefined) {
        return menu.allowedOn?.includes(block.role);
      }
      return true;
    });

    const popupNode = window.document.getElementById(`popup-${blob.id}`);
    const editorNode = window.document.getElementById(`editor-${blob.id}`);
    const currentNode = getBlockNode(block.id);
    if (
      popupNode == null ||
      editorNode == null ||
      currentNode == null ||
      popUpRoot === undefined ||
      typeof block.data !== "string"
    ) {
      return;
    }

    if (popupNode.childElementCount !== 0) {
      popUpRoot.render(<Fragment />);
      dispatchEvent("onActionMenu", {
        opened: false,
      });
      return;
    }

    if (!nodeInViewPort(currentNode)) {
      currentNode.scrollIntoView();
    }

    const newBlock: Block = {
      id: generateBlockId(),
      style: block.style,
      role: block.role,
      data: previousContent,
    };
    const { x, y } = getCaretCoordinates(true);
    const actionMenuCoordinates: Coordinates = {
      x: block.data.length === 0 ? currentNode.getBoundingClientRect().x : x,
      y:
        (block.data.length === 0 ? currentNode.getBoundingClientRect().y : y) +
        30,
    };

    dispatchEvent("onActionMenu", {
      opened: true,
    });

    popUpRoot.render(
      <BlockTools
        coordinates={actionMenuCoordinates}
        menu={masterBlockTools}
        onClose={() => {
          dispatchEvent("onActionMenu", {
            opened: false,
          });
          popUpRoot.render(<Fragment />);
        }}
        onEscape={(query) => {
          setFocusedNode({
            nodeId: block.id,
            caretOffset: caretOffset + query.length + 1,
            nodeIndex,
          });
        }}
        onSelect={(execute) => {
          switch (execute.type) {
            case "role": {
              newBlock.role = execute.args as Role;

              if (
                blockRenderTypeFromRole(newBlock.role) === RenderType.ATTACHMENT
              ) {
                newBlock.data = {
                  url: "",
                  description: "",
                  width: 300,
                  height: 200,
                } satisfies Attachment;
              } else if (
                blockRenderTypeFromRole(newBlock.role) === RenderType.LIST
              ) {
                newBlock.data = [
                  {
                    id: generateBlockId(),
                    data: previousContent,
                    role: block.role,
                    style: [],
                  },
                ];
              }

              if (blockRenderTypeFromNode(currentNode) === RenderType.LIST) {
                const currentBlockParent = serializeNodeToBlock(
                  currentNode.parentElement?.parentElement as HTMLElement,
                );

                if (Array.isArray(currentBlockParent.data)) {
                  const currentBlockIndex = currentBlockParent.data
                    .map((blk) => blk.id)
                    .indexOf(block.id);

                  if (
                    blockRenderTypeFromRole(newBlock.role) ===
                    RenderType.ATTACHMENT
                  ) {
                    if (
                      currentBlockIndex ===
                      currentBlockParent.data.length - 1
                    ) {
                      const emptyBlock: Block = {
                        id: generateBlockId(),
                        data: "",
                        role: "paragraph",
                        style: [],
                      };
                      currentBlockParent.data.splice(
                        currentBlockIndex + 1,
                        0,
                        emptyBlock,
                      );
                    }
                    block.data = previousContent;
                    currentBlockParent.data.splice(
                      currentBlockIndex,
                      1,
                      ...[block, newBlock],
                    );
                  } else if (
                    blockRenderTypeFromRole(newBlock.role) === RenderType.LIST
                  ) {
                    block.data = newBlock.data;
                    block.role = newBlock.role;
                    block.style = newBlock.style;
                    traverseAndUpdate(currentBlockParent.data, block);
                  } else {
                    currentBlockParent.data.splice(
                      currentBlockIndex,
                      1,
                      newBlock,
                    );
                  }

                  traverseAndUpdate(masterBlocks, currentBlockParent);
                }
              } else {
                if (
                  blockRenderTypeFromRole(newBlock.role) ===
                  RenderType.ATTACHMENT
                ) {
                  block.data = previousContent;
                  traverseAndUpdate(masterBlocks, block);
                  traverseAndUpdateBelow(masterBlocks, block, newBlock);
                  const newBlockIndex = traverseAndFindBlockPosition(
                    masterBlocks,
                    newBlock,
                  );

                  if (newBlockIndex === masterBlocks.length - 1) {
                    const emptyBlock: Block = {
                      id: generateBlockId(),
                      data: "",
                      role: "paragraph",
                      style: [],
                    };
                    traverseAndUpdateBelow(masterBlocks, newBlock, emptyBlock);
                  }
                } else {
                  newBlock.id = block.id;
                  traverseAndUpdate(masterBlocks, newBlock);
                }
              }
              propagateChanges(
                masterBlocks,
                blockRenderTypeFromRole(newBlock.role) === RenderType.ATTACHMENT
                  ? {
                      nodeId: block.id,
                      caretOffset,
                    }
                  : blockRenderTypeFromRole(newBlock.role) === RenderType.LIST
                  ? {
                      nodeId: (newBlock.data as Block[])[0].id,
                      caretOffset,
                    }
                  : {
                      nodeId: newBlock.id,
                      caretOffset,
                    },
              );
              break;
            }
            case "style": {
              if (Array.isArray(execute.args)) {
                block.data = previousContent;
                block.style.push(...execute.args);
                traverseAndUpdate(masterBlocks, block);
                propagateChanges(masterBlocks, {
                  nodeId: block.id,
                  caretOffset,
                });
              }
              break;
            }
          }
        }}
      />,
    );

    editorNode.addEventListener("mousedown", () => {
      popUpRoot.render(<Fragment />);
    });
  }

  function attachmentRequestHandler(block: Block, data: File | string): void {
    if (block.role !== "image" || typeof block.data !== "object") {
      return;
    }

    const blockIndex = masterBlocks.indexOf(block);
    void onAttachmentSelected(data).then((str) => {
      (block.data as Attachment).url = str;
      (block.data as Attachment).height = 300;
      (block.data as Attachment).width = 500;
      block.id = generateBlockId();
      masterBlocks[blockIndex] = block;
      propagateChanges(masterBlocks, {
        nodeId: block.id,
        caretOffset: 0,
      });
    });
  }

  function markdownHandler(block: Block): void {
    traverseAndUpdate(masterBlocks, block);
    propagateChanges(masterBlocks, {
      nodeId:
        blockRenderTypeFromRole(block.role) === RenderType.LIST
          ? (block.data as Block[])[0].id
          : block.id,
      caretOffset: 0,
    });
  }

  return (
    <RootContext.Provider
      value={{
        dialogRoot,
        popUpRoot,
      }}
    >
      <div
        id={`popup-${blob.id}`}
        className={"select-none"}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      ></div>
      <div
        id={`dialog-${blob.id}`}
        className={"select-none"}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      ></div>
      <div
        data-type={"editor-root"}
        id={`editor-${blob.id}`}
        className={"block editor"}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {masterBlocks.map((block) => {
          return (
            <Composer
              key={block.id}
              editable={editable}
              block={block}
              onChange={debounce((block) => {
                changeHandler(block);
              }, 360)}
              onCreate={createHandler}
              onDelete={deletionHandler}
              onPaste={pasteHandler}
              onSelect={debounce((block) => {
                selectionHandler(block);
              }, 360)}
              onActionKeyPressed={actionKeyHandler}
              onAttachmentRequest={attachmentRequestHandler}
              onMarkdown={markdownHandler}
            />
          );
        })}
      </div>
    </RootContext.Provider>
  );
}
