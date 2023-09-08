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
  type PolarisConfig,
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
  upsertStyle,
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
  config: PolarisConfig;
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
 * @description A Workspace is essentially as Editor which manages all the blocks of the blob. Workspace also handles user interactions and updates the re-renders the DOM accordingly.
 *
 * @author Mihir Paldhikar
 */

export default function Editor({
  editable = true,
  blob,
  config,
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

  const [masterBlocks, updateMasterBlocks] = useState<Block[]>(blob.blocks);
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
              blobRef.blocks = blockRef;
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
        blobRef.blocks = blockRef;
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
      if (menu.allowedRoles !== undefined) {
        return menu.allowedRoles?.includes(block.role);
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
              let focusNode = block.id;
              const newRole = execute.args as Role;
              if (blockRenderTypeFromRole(newRole) === RenderType.TEXT) {
                block.role = newRole;
                block.data = previousContent;
                traverseAndUpdate(masterBlocks, block);
              } else if (blockRenderTypeFromRole(newRole) === RenderType.LIST) {
                block.role = newRole;
                focusNode = generateBlockId();
                block.data = [
                  {
                    id: focusNode,
                    data: previousContent,
                    style: block.style,
                    role: "paragraph",
                  },
                ];
                traverseAndUpdate(masterBlocks, block);
              } else if (
                blockRenderTypeFromRole(newRole) === RenderType.ATTACHMENT
              ) {
                let imageBlock: Block = {
                  id: generateBlockId(),
                  data: {
                    url: "",
                    description: "",
                    width: 500,
                    height: 300,
                  },
                  style: [],
                  role: newRole,
                };
                block.data = previousContent;
                if (blockRenderTypeFromNode(currentNode) === RenderType.LIST) {
                  const parentNode = currentNode?.parentElement
                    ?.parentElement as HTMLElement;
                  const parentBlock = serializeNodeToBlock(parentNode);
                  if (previousContent === "") {
                    block.data = imageBlock.data;
                    block.role = imageBlock.role;
                    block.style = imageBlock.style;
                    imageBlock = block;
                  }
                  traverseAndUpdate(parentBlock.data as Block[], block);
                  if (previousContent !== "") {
                    traverseAndUpdateBelow(
                      parentBlock.data as Block[],
                      block,
                      imageBlock,
                    );
                  }
                  traverseAndUpdate(masterBlocks, parentBlock);
                  const newBlockIndex = traverseAndFindBlockPosition(
                    parentBlock.data as Block[],
                    imageBlock,
                  );

                  if (
                    newBlockIndex ===
                    (parentBlock.data as Block[]).length - 1
                  ) {
                    const emptyBlock: Block = {
                      id: generateBlockId(),
                      data: "",
                      role: "paragraph",
                      style: [],
                    };
                    traverseAndUpdateBelow(
                      parentBlock.data as Block[],
                      imageBlock,
                      emptyBlock,
                    );
                  }
                } else {
                  if (previousContent === "") {
                    block.data = imageBlock.data;
                    block.role = imageBlock.role;
                    block.style = imageBlock.style;
                    imageBlock = block;
                  }
                  traverseAndUpdate(masterBlocks, block);
                  if (previousContent !== "") {
                    traverseAndUpdateBelow(masterBlocks, block, imageBlock);
                  }
                  const newBlockIndex = traverseAndFindBlockPosition(
                    masterBlocks,
                    imageBlock,
                  );
                  if (newBlockIndex === masterBlocks.length - 1) {
                    const emptyBlock: Block = {
                      id: generateBlockId(),
                      data: "",
                      role: "paragraph",
                      style: [],
                    };
                    traverseAndUpdateBelow(
                      masterBlocks,
                      imageBlock,
                      emptyBlock,
                    );
                  }
                }
              }

              propagateChanges(masterBlocks, {
                nodeId: focusNode,
                caretOffset,
                nodeIndex,
              });
              break;
            }
            case "style": {
              const newStyle = execute.args as Style[];
              for (let i = 0; i < newStyle.length; i++) {
                block.style = upsertStyle(block.style, newStyle[i]);
              }
              block.data = previousContent;
              traverseAndUpdate(masterBlocks, block);
              propagateChanges(masterBlocks, {
                nodeId: block.id,
                caretOffset,
                nodeIndex,
              });
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

    void onAttachmentSelected(data).then((str) => {
      (block.data as Attachment).url = str;
      const blockIndex = masterBlocks.indexOf(block);
      if (blockIndex === -1) {
        const blockNode = getBlockNode(block.id) as HTMLElement;
        if (blockRenderTypeFromNode(blockNode) === RenderType.LIST) {
          const parentBlock = serializeNodeToBlock(
            blockNode.parentElement?.parentElement as HTMLElement,
          );
          traverseAndUpdate(parentBlock.data as Block[], block);
          traverseAndUpdate(masterBlocks, parentBlock);
        } else {
          traverseAndUpdate(masterBlocks, block);
        }
      } else {
        masterBlocks[blockIndex] = block;
      }
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
        config,
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
