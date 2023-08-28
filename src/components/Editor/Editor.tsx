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
import { Composer } from "../Composer";
import {
  type Blob,
  type Block,
  type Coordinates,
  type ImageContent,
  type InputArgs,
  type Menu,
  type Style,
} from "../../interfaces";
import {
  blockRenderTypeFromNode,
  blockRenderTypeFromRole,
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
import { type Content, type Role } from "../../types";
import { createRoot, type Root } from "react-dom/client";
import { SelectionMenu } from "../SelectionMenu";
import { MasterActionMenu, MasterSelectionMenu } from "../../assets";
import { LINK_ATTRIBUTE } from "../../constants";
import { ActionMenu } from "../ActionMenu";
import { actionMenuClosedEvent, actionMenuOpenedEvent } from "../../events";
import RenderType from "../../enums/RenderType";
import RootContext from "../../contexts/RootContext/RootContext";
import { debounce } from "debounce";
import { cloneDeep } from "lodash";

interface WorkspaceProps {
  editable?: boolean;
  blob: Blob;
  onSave?: (blob: Blob) => void;
  autoSaveTimeout?: number;
  selectionMenu?: Menu[];
  onImageSelected: (file: File) => Promise<string>;
  onChange?: (blob: Blob) => void;
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
  editable = true,
  blob,
  autoSaveTimeout,
  selectionMenu,
  onSave,
  onImageSelected,
  onChange,
}: WorkspaceProps): JSX.Element {
  let masterSelectionMenu: readonly Menu[] = cloneDeep(
    MasterSelectionMenu
  ).concat(...(selectionMenu ?? []));
  let masterActionMenu: readonly Menu[] = cloneDeep(MasterActionMenu);

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
      createRoot(document.getElementById(`popup-${blob.id}`) as HTMLElement)
    );
    setDialogRoot(
      createRoot(document.getElementById(`dialog-${blob.id}`) as HTMLElement)
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
    [masterBlocks, blob, onSave]
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
    if (blockRenderTypeFromRole(block.role) === RenderType.IMAGE) {
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
    }
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
    creationType: "list" | "nonList"
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
    setCursorToStart?: boolean
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
    content: Content | Content[],
    caretOffset: number
  ): void {
    if (typeof block.content !== "string") return;
    const blockIndex = masterBlocks.indexOf(block);
    block.content = normalizeContent(block.content);
    const contentLengthAfterCaretOffset =
      block.content.substring(caretOffset).length;

    if (
      blockRenderTypeFromRole(block.role) === RenderType.TEXT &&
      Array.isArray(content)
    ) {
      const pasteBlocks: Block[] = content.map((copiedText, index) => {
        return {
          id: generateBlockId(),
          role: block.role,
          style: block.style,
          content:
            index === 0
              ? (block.content as string)
                  .substring(0, caretOffset)
                  .concat(copiedText)
              : index === content.length - 1
              ? copiedText.concat(
                  (block.content as string).substring(caretOffset)
                )
              : copiedText,
        };
      });
      masterBlocks.splice(blockIndex, 1, ...pasteBlocks);

      const pasteContentLength = normalizeContent(
        pasteBlocks[pasteBlocks.length - 1].content as string
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
      typeof content === "string"
    ) {
      masterBlocks[blockIndex].content = (
        masterBlocks[blockIndex].content as string
      )
        .substring(0, caretOffset)
        .concat(content)
        .concat(
          (masterBlocks[blockIndex].content as string).substring(caretOffset)
        );

      const pasteContentLength = normalizeContent(block.content).length;

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

    for (const menu of masterSelectionMenu) {
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
                    inputArgs.initialPayload.name
                  )
                )
              : startNodeParent.style.getPropertyValue(
                  inputArgs.initialPayload.name
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
      <SelectionMenu
        dialogRoot={dialogRoot}
        coordinates={selectionMenuCoordinates}
        menus={masterSelectionMenu}
        onClose={() => {
          popUpRoot.render(<Fragment />);
          masterSelectionMenu = cloneDeep(MasterSelectionMenu).concat(
            ...(selectionMenu ?? [])
          );
        }}
        onMenuSelected={(executable) => {
          selection.removeAllRanges();
          selection.addRange(range);
          switch (executable.type) {
            case "style": {
              inlineSpecifierManager(blockNode, executable.args as Style[]);
              block.content = blockNode.innerHTML;
              changeHandler(block);
              break;
            }
            case "link": {
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
      (event) => {
        if (!event.ctrlKey || !event.shiftKey) {
          popUpRoot.render(<Fragment />);
          masterSelectionMenu = cloneDeep(MasterSelectionMenu).concat(
            ...(selectionMenu ?? [])
          );
        }
      },
      {
        once: true,
      }
    );
    editorNode.addEventListener(
      "mousedown",
      () => {
        popUpRoot.render(<Fragment />);
        masterSelectionMenu = cloneDeep(MasterSelectionMenu).concat(
          ...(selectionMenu ?? [])
        );
      },
      {
        once: true,
      }
    );
  }

  function actionKeyHandler(
    nodeIndex: number,
    block: Block,
    previousContent: Content,
    caretOffset: number
  ): void {
    masterActionMenu = masterActionMenu.filter((menu) => {
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
      typeof block.content !== "string"
    ) {
      return;
    }

    if (popupNode.childElementCount !== 0) {
      popUpRoot.render(<Fragment />);
      window.dispatchEvent(actionMenuClosedEvent);
      return;
    }

    if (!nodeInViewPort(currentNode)) {
      currentNode.scrollIntoView();
    }

    const newBlock: Block = {
      id: generateBlockId(),
      style: block.style,
      role: block.role,
      content: previousContent,
    };
    const { x, y } = getCaretCoordinates(true);
    const actionMenuCoordinates: Coordinates = {
      x: block.content.length === 0 ? currentNode.getBoundingClientRect().x : x,
      y:
        (block.content.length === 0
          ? currentNode.getBoundingClientRect().y
          : y) + 30,
    };

    window.dispatchEvent(actionMenuOpenedEvent);

    popUpRoot.render(
      <ActionMenu
        coordinates={actionMenuCoordinates}
        menu={masterActionMenu}
        onClose={() => {
          window.dispatchEvent(actionMenuClosedEvent);
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

              if (blockRenderTypeFromRole(newBlock.role) === RenderType.IMAGE) {
                newBlock.content = {
                  url: "",
                  description: "",
                  width: 300,
                  height: 200,
                } satisfies ImageContent;
              } else if (
                blockRenderTypeFromRole(newBlock.role) === RenderType.LIST
              ) {
                newBlock.content = [
                  {
                    id: generateBlockId(),
                    content: previousContent,
                    role: block.role,
                    style: [],
                  },
                ];
              }

              if (blockRenderTypeFromNode(currentNode) === RenderType.LIST) {
                const currentBlockParent = serializeNodeToBlock(
                  currentNode.parentElement?.parentElement as HTMLElement
                );

                if (Array.isArray(currentBlockParent.content)) {
                  const currentBlockIndex = currentBlockParent.content
                    .map((blk) => blk.id)
                    .indexOf(block.id);

                  if (
                    blockRenderTypeFromRole(newBlock.role) === RenderType.IMAGE
                  ) {
                    if (
                      currentBlockIndex ===
                      currentBlockParent.content.length - 1
                    ) {
                      const emptyBlock: Block = {
                        id: generateBlockId(),
                        content: "",
                        role: "paragraph",
                        style: [],
                      };
                      currentBlockParent.content.splice(
                        currentBlockIndex + 1,
                        0,
                        emptyBlock
                      );
                    }
                    block.content = previousContent;
                    currentBlockParent.content.splice(
                      currentBlockIndex,
                      1,
                      ...[block, newBlock]
                    );
                  } else if (
                    blockRenderTypeFromRole(newBlock.role) === RenderType.LIST
                  ) {
                    block.content = newBlock.content;
                    block.role = newBlock.role;
                    block.style = newBlock.style;
                    traverseAndUpdate(currentBlockParent.content, block);
                  } else {
                    currentBlockParent.content.splice(
                      currentBlockIndex,
                      1,
                      newBlock
                    );
                  }

                  traverseAndUpdate(masterBlocks, currentBlockParent);
                }
              } else {
                if (
                  blockRenderTypeFromRole(newBlock.role) === RenderType.IMAGE
                ) {
                  block.content = previousContent;
                  traverseAndUpdate(masterBlocks, block);
                  traverseAndUpdateBelow(masterBlocks, block, newBlock);
                  const newBlockIndex = traverseAndFindBlockPosition(
                    masterBlocks,
                    newBlock
                  );

                  if (newBlockIndex === masterBlocks.length - 1) {
                    const emptyBlock: Block = {
                      id: generateBlockId(),
                      content: "",
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
                blockRenderTypeFromRole(newBlock.role) === RenderType.IMAGE
                  ? {
                      nodeId: block.id,
                      caretOffset,
                    }
                  : blockRenderTypeFromRole(newBlock.role) === RenderType.LIST
                  ? {
                      nodeId: (newBlock.content as Block[])[0].id,
                      caretOffset,
                    }
                  : {
                      nodeId: newBlock.id,
                      caretOffset,
                    }
              );
              break;
            }
            case "style": {
              if (Array.isArray(execute.args)) {
                block.content = previousContent;
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
      />
    );

    editorNode.addEventListener("mousedown", () => {
      popUpRoot.render(<Fragment />);
    });
  }

  function imageRequestHandler(block: Block, file: File): void {
    if (block.role !== "image" || typeof block.content !== "object") {
      return;
    }

    const blockIndex = masterBlocks.indexOf(block);
    void onImageSelected(file).then((str) => {
      (block.content as ImageContent).url = str;
      (block.content as ImageContent).height = 300;
      (block.content as ImageContent).width = 500;
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
          ? (block.content as Block[])[0].id
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
        className={"min-h-screen w-full px-2 pb-60"}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {masterBlocks.map((block, index) => {
          return (
            <Composer
              key={block.id}
              editable={editable}
              previousBlock={index !== 0 ? masterBlocks[index - 1] : null}
              block={block}
              nextBlock={
                index !== masterBlocks.length - 1
                  ? masterBlocks[index + 1]
                  : null
              }
              onChange={debounce((block) => {
                changeHandler(block);
              }, 360)}
              onCreate={createHandler}
              onDelete={deletionHandler}
              onPaste={pasteHandler}
              onSelect={debounce((block) => {
                selectionHandler(block);
              }, 360)}
              onCommandKeyPressed={actionKeyHandler}
              onImageRequest={imageRequestHandler}
              onMarkdown={markdownHandler}
            />
          );
        })}
      </div>
    </RootContext.Provider>
  );
}
