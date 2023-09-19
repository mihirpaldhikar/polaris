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
  Fragment,
  type JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type Blob,
  type Block,
  type Coordinates,
  type InputArgs,
  type Menu,
  type PolarisConfig,
  type Style,
  type Table,
} from "../../interfaces";
import {
  blockRenderTypeFromRole,
  dispatchEditorEvent,
  elementContainsStyle,
  findNextTextNode,
  findPreviousTextNode,
  generateUUID,
  getBlockNode,
  getCaretCoordinates,
  getCaretOffset,
  getListMetadata,
  getNodeAt,
  getNodeIndex,
  inlineAnnotationsManager,
  nodeInViewPort,
  removeEmptyInlineAnnotations,
  rgbStringToHex,
  setCaretOffset,
  subscribeToEditorEvent,
  traverseAndDelete,
  traverseAndFind,
  traverseAndFindBlockPosition,
  traverseAndUpdate,
  traverseAndUpdateBelow,
  upsertStyle,
} from "../../utils";
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
  inlineTools?: Menu[];
  onAttachmentSelected: (data: File | string) => Promise<string>;
}

/**
 * @function Editor
 *
 * @param editable
 * @param blob
 * @param config
 * @param config
 * @param onAttachmentSelected
 * @param inlineTools
 *
 * @description An Editor  manages all the blocks of the blob. Editor also handles user interactions and updates the re-renders the DOM accordingly.
 *
 * @author Mihir Paldhikar
 */

export default function Editor({
  editable = true,
  blob,
  config,
  inlineTools,
  onAttachmentSelected,
}: EditorProps): JSX.Element {
  let masterInlineTools: readonly Menu[] = cloneDeep(MasterInlineTools).concat(
    ...(inlineTools ?? []),
  );
  const masterBlockTools: readonly Menu[] = cloneDeep(MasterBlockTools);

  const isActionMenuOpen = useRef<boolean>(false);

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

  const propagateChanges = useCallback(
    (
      blocks: Block[],
      focus?: {
        nodeId: string;
        caretOffset: number;
        nodeIndex?: number;
      },
    ) => {
      updateMasterBlocks(blocks);
      setFocusedNode(focus);
      dispatchEditorEvent(`onChanged-${blob.id}`, {
        ...blob,
        blocks: masterBlocks,
      } satisfies Blob);
    },
    [blob, masterBlocks],
  );

  const changeHandler = useCallback(
    (block: Block, focus?: boolean) => {
      const blockIndex: number = masterBlocks
        .map((blk) => blk.id)
        .indexOf(block.id);
      if (blockIndex === -1) {
        traverseAndUpdate(masterBlocks, block);
      } else {
        masterBlocks[blockIndex] = block;
        updateMasterBlocks(masterBlocks);
      }
      if (
        blockRenderTypeFromRole(block.role) === RenderType.ATTACHMENT ||
        (focus !== undefined && focus)
      ) {
        setFocusedNode({
          nodeId: block.id,
          nodeIndex: 0,
          caretOffset: 0,
        });
      }
      dispatchEditorEvent(`onChanged-${blob.id}`, {
        ...blob,
        blocks: masterBlocks,
      } satisfies Blob);
    },
    [blob, masterBlocks],
  );

  const actionKeyHandler = useCallback(
    (
      nodeIndex: number,
      block: Block,
      previousContent: string,
      caretOffset: number,
      blockTools: Menu[],
    ) => {
      const popupNode = window.document.getElementById(`popup-${blob.id}`);
      const editorNode = window.document.getElementById(`editor-${blob.id}`);
      const activeNode = getBlockNode(block.id);
      if (
        popupNode == null ||
        editorNode == null ||
        activeNode == null ||
        popUpRoot === undefined ||
        typeof block.data !== "string"
      ) {
        return;
      }

      const listMetadata = getListMetadata(activeNode);

      if (popupNode.childElementCount !== 0) {
        popUpRoot.render(<Fragment />);
        dispatchEditorEvent("onActionMenu", {
          opened: false,
        });
        isActionMenuOpen.current = false;
        return;
      }

      if (!nodeInViewPort(activeNode)) {
        activeNode.scrollIntoView();
      }

      const { x, y } = getCaretCoordinates(true);
      const actionMenuCoordinates: Coordinates = {
        x: block.data.length === 0 ? activeNode.getBoundingClientRect().x : x,
        y:
          (block.data.length === 0 ? activeNode.getBoundingClientRect().y : y) +
          30,
      };

      dispatchEditorEvent("onActionMenu", {
        opened: true,
      });
      isActionMenuOpen.current = true;
      popUpRoot.render(
        <BlockTools
          coordinates={actionMenuCoordinates}
          menu={blockTools}
          onClose={() => {
            dispatchEditorEvent("onActionMenu", {
              opened: false,
            });
            isActionMenuOpen.current = false;
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
                const newRole = execute.args.role;
                const defaultTemplate = execute.args.defaultTemplate;

                if (
                  newRole === "title" ||
                  newRole === "subTitle" ||
                  newRole === "heading" ||
                  newRole === "subHeading" ||
                  newRole === "paragraph" ||
                  newRole === "quote"
                ) {
                  block = defaultTemplate;
                  block.id = focusNode;
                  block.data = previousContent;
                  traverseAndUpdate(masterBlocks, block);
                } else if (
                  newRole === "image" ||
                  newRole === "youtubeVideoEmbed" ||
                  newRole === "githubGistEmbed"
                ) {
                  if (previousContent.length === 0) {
                    block = defaultTemplate;
                    block.id = focusNode;
                    if (listMetadata != null) {
                      const parentBlock = traverseAndFind(
                        masterBlocks,
                        listMetadata.parentId,
                      );
                      if (parentBlock != null) {
                        const listData = parentBlock.data as Block[];
                        traverseAndUpdate(listData, block);
                        const blockIndex = listMetadata.childIndex;
                        if (blockIndex === listData.length - 1) {
                          const emptyBlock: Block = {
                            id: generateUUID(),
                            role: "paragraph",
                            data: "",
                            style: [],
                          };
                          traverseAndUpdateBelow(listData, block, emptyBlock);
                        }
                      }
                    } else {
                      traverseAndUpdate(masterBlocks, block);
                      const blockIndex = traverseAndFindBlockPosition(
                        masterBlocks,
                        block,
                      );
                      if (blockIndex === masterBlocks.length - 1) {
                        const emptyBlock: Block = {
                          id: generateUUID(),
                          role: "paragraph",
                          data: "",
                          style: [],
                        };
                        traverseAndUpdateBelow(masterBlocks, block, emptyBlock);
                      }
                    }
                  } else {
                    block.data = previousContent;
                    const imageBlock = defaultTemplate;
                    if (listMetadata != null) {
                      const parentBlock = traverseAndFind(
                        masterBlocks,
                        listMetadata.parentId,
                      );
                      if (parentBlock != null) {
                        const listData = parentBlock.data as Block[];
                        traverseAndUpdate(listData, block);
                        traverseAndUpdateBelow(listData, block, imageBlock);
                        const blockIndex = listMetadata.childIndex;
                        if (blockIndex + 1 === listData.length - 1) {
                          const emptyBlock: Block = {
                            id: generateUUID(),
                            role: "paragraph",
                            data: "",
                            style: [],
                          };
                          traverseAndUpdateBelow(
                            listData,
                            imageBlock,
                            emptyBlock,
                          );
                        }
                      }
                    } else {
                      traverseAndUpdate(masterBlocks, block);
                      traverseAndUpdateBelow(masterBlocks, block, imageBlock);
                      const blockIndex = traverseAndFindBlockPosition(
                        masterBlocks,
                        block,
                      );
                      if (blockIndex + 1 === masterBlocks.length - 1) {
                        const emptyBlock: Block = {
                          id: generateUUID(),
                          role: "paragraph",
                          data: "",
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
                } else if (
                  newRole === "bulletList" ||
                  newRole === "numberedList"
                ) {
                  block = defaultTemplate;
                  block.id = focusNode;
                  focusNode = (defaultTemplate.data as Block[])[0].id;
                  traverseAndUpdate(masterBlocks, block);
                } else if (newRole === "table") {
                  if (previousContent.length === 0) {
                    block = defaultTemplate;
                    block.id = focusNode;
                    focusNode = (defaultTemplate.data as Table).rows[0]
                      .columns[0].id;
                    if (listMetadata != null) {
                      const parentBlock = traverseAndFind(
                        masterBlocks,
                        listMetadata.parentId,
                      );
                      if (parentBlock != null) {
                        const listData = parentBlock.data as Block[];
                        traverseAndUpdate(listData, block);
                        const blockIndex = listMetadata.childIndex;
                        if (blockIndex === listData.length - 1) {
                          const emptyBlock: Block = {
                            id: generateUUID(),
                            role: "paragraph",
                            data: "",
                            style: [],
                          };
                          traverseAndUpdateBelow(listData, block, emptyBlock);
                        }
                      }
                    } else {
                      traverseAndUpdate(masterBlocks, block);
                      const blockIndex = traverseAndFindBlockPosition(
                        masterBlocks,
                        block,
                      );
                      if (blockIndex === masterBlocks.length - 1) {
                        const emptyBlock: Block = {
                          id: generateUUID(),
                          role: "paragraph",
                          data: "",
                          style: [],
                        };
                        traverseAndUpdateBelow(masterBlocks, block, emptyBlock);
                      }
                    }
                  } else {
                    block.data = previousContent;
                    const tableBlock = defaultTemplate;
                    focusNode = (tableBlock.data as Table).rows[0].columns[0]
                      .id;
                    if (listMetadata != null) {
                      const parentBlock = traverseAndFind(
                        masterBlocks,
                        listMetadata.parentId,
                      );
                      if (parentBlock != null) {
                        const listData = parentBlock.data as Block[];
                        traverseAndUpdate(listData, block);
                        traverseAndUpdateBelow(listData, block, tableBlock);
                        const blockIndex = listMetadata.childIndex;
                        if (blockIndex + 1 === listData.length - 1) {
                          const emptyBlock: Block = {
                            id: generateUUID(),
                            role: "paragraph",
                            data: "",
                            style: [],
                          };
                          traverseAndUpdateBelow(
                            listData,
                            tableBlock,
                            emptyBlock,
                          );
                        }
                      }
                    } else {
                      traverseAndUpdate(masterBlocks, block);
                      traverseAndUpdateBelow(masterBlocks, block, tableBlock);
                      const blockIndex = traverseAndFindBlockPosition(
                        masterBlocks,
                        block,
                      );
                      if (blockIndex + 1 === masterBlocks.length - 1) {
                        const emptyBlock: Block = {
                          id: generateUUID(),
                          role: "paragraph",
                          data: "",
                          style: [],
                        };
                        traverseAndUpdateBelow(
                          masterBlocks,
                          tableBlock,
                          emptyBlock,
                        );
                      }
                    }
                  }
                }

                propagateChanges(masterBlocks, {
                  nodeId: focusNode,
                  caretOffset: newRole === "table" ? 0 : caretOffset,
                  nodeIndex: newRole === "table" ? 0 : nodeIndex,
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
    },
    [blob.id, masterBlocks, popUpRoot, propagateChanges],
  );

  const actionMenuTriggerHandler = useCallback(
    (activeBlock: Block, activeNode: HTMLElement, isMobile: boolean) => {
      const caretOffset = getCaretOffset(activeNode);
      if (typeof activeBlock.data === "string") {
        const nodeAtCaretOffset = getNodeAt(activeNode, caretOffset);
        const computedCaretOffset = getCaretOffset(
          nodeAtCaretOffset as HTMLElement,
        );

        const filteredBlockTools = masterBlockTools.filter((menu) => {
          if (menu.allowedRoles !== undefined) {
            return menu.allowedRoles?.includes(activeBlock.role);
          }
          return true;
        });

        actionKeyHandler(
          getNodeIndex(activeNode, nodeAtCaretOffset),
          activeBlock,
          !isMobile
            ? activeBlock.data
            : activeBlock.data
                .substring(0, caretOffset - 1)
                .concat(activeBlock.data.substring(caretOffset)),
          isMobile ? computedCaretOffset - 1 : computedCaretOffset,
          filteredBlockTools,
        );
      }
    },
    [actionKeyHandler, masterBlockTools],
  );

  const mobileInputHandler = useCallback(
    (event: any) => {
      const activeNode = document.activeElement;
      if (
        activeNode != null &&
        activeNode.getAttribute("contenteditable") === "true" &&
        (window.navigator.userAgent.toLowerCase().includes("android") ||
          window.navigator.userAgent.toLowerCase().includes("iphone"))
      ) {
        const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
        if (
          activeBlock != null &&
          event.data != null &&
          event.data === "/" &&
          typeof activeBlock.data === "string"
        ) {
          actionMenuTriggerHandler(
            activeBlock,
            activeNode as HTMLElement,
            true,
          );
        } else {
          if (popUpRoot !== undefined) {
            popUpRoot.render(<Fragment />);
          }
        }
      }
    },
    [actionMenuTriggerHandler, masterBlocks, popUpRoot],
  );

  const keyboardManager = useCallback(
    (event: KeyboardEvent): void => {
      const activeNode = document.activeElement;
      switch (event.key.toLowerCase()) {
        case "s": {
          if (event.ctrlKey) {
            event.preventDefault();
            dispatchEditorEvent(`onSaved-${blob.id}`, {
              ...blob,
              blocks: masterBlocks,
            } satisfies Blob);
          }
          break;
        }
        case "/": {
          if (
            isActionMenuOpen.current ||
            activeNode == null ||
            activeNode.getAttribute("contenteditable") !== "true"
          )
            return;
          const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
          if (activeBlock != null) {
            actionMenuTriggerHandler(
              activeBlock,
              activeNode as HTMLElement,
              false,
            );
          }
          break;
        }
        case "arrowup": {
          event.preventDefault();

          if (
            isActionMenuOpen.current ||
            activeNode == null ||
            activeNode.getAttribute("contenteditable") !== "true"
          )
            return;
          const caretOffset = getCaretOffset(activeNode as HTMLElement);
          const previousNode = findPreviousTextNode(
            activeNode as HTMLElement,
            "top",
          );
          if (previousNode != null) {
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
          }
          break;
        }
        case "arrowdown": {
          event.preventDefault();

          if (
            isActionMenuOpen.current ||
            activeNode == null ||
            activeNode.getAttribute("contenteditable") !== "true"
          )
            return;

          const caretOffset = getCaretOffset(activeNode as HTMLElement);
          const nextNode = findNextTextNode(
            activeNode as HTMLElement,
            "bottom",
          );
          if (nextNode != null) {
            const nodeAtCaretOffset = getNodeAt(nextNode, caretOffset);
            const jumpNode =
              caretOffset > nextNode.innerText.length
                ? nextNode.firstChild ?? nextNode
                : nodeAtCaretOffset.nodeType === Node.ELEMENT_NODE
                ? nodeAtCaretOffset.firstChild ?? nodeAtCaretOffset
                : nodeAtCaretOffset;

            const computedCaretOffset =
              caretOffset > nextNode.innerText.length
                ? nextNode.firstChild?.textContent == null
                  ? 0
                  : nextNode.firstChild.textContent.length
                : caretOffset > (jumpNode.textContent as string).length
                ? jumpNode.textContent == null
                  ? 0
                  : jumpNode.textContent.length
                : caretOffset;
            setCaretOffset(jumpNode, computedCaretOffset);
          }

          break;
        }
        case "arrowleft": {
          if (
            isActionMenuOpen.current ||
            activeNode == null ||
            activeNode.getAttribute("contenteditable") !== "true"
          ) {
            return;
          }

          const caretOffset = getCaretOffset(activeNode as HTMLElement);

          if (caretOffset !== 0) {
            return;
          }

          event.preventDefault();
          const previousNode = findPreviousTextNode(
            activeNode as HTMLElement,
            "left",
          );
          if (previousNode != null) {
            const previousBlockChildNodeIndex =
              previousNode?.lastChild?.textContent === ""
                ? previousNode.childNodes.length - 2
                : previousNode.childNodes.length - 1;

            const jumpNode =
              previousBlockChildNodeIndex === -1
                ? previousNode
                : previousNode.childNodes[previousBlockChildNodeIndex]
                    .nodeType === Node.ELEMENT_NODE
                ? previousNode.childNodes[previousBlockChildNodeIndex]
                    .firstChild ?? previousNode
                : previousNode.childNodes[previousBlockChildNodeIndex];

            const computedCaretOffset =
              previousBlockChildNodeIndex === -1
                ? 0
                : previousNode.childNodes[previousBlockChildNodeIndex] != null
                ? previousNode.childNodes[previousBlockChildNodeIndex]
                    .nodeType === Node.ELEMENT_NODE
                  ? (
                      previousNode.childNodes[previousBlockChildNodeIndex]
                        .textContent as string
                    ).length
                  : previousNode.childNodes[previousBlockChildNodeIndex]
                      .textContent?.length ?? previousNode.innerText.length
                : previousNode.innerText.length;
            setCaretOffset(jumpNode, computedCaretOffset);
          }
          break;
        }
        case "arrowright": {
          if (
            isActionMenuOpen.current ||
            activeNode == null ||
            activeNode.getAttribute("contenteditable") !== "true"
          ) {
            return;
          }

          const caretOffset = getCaretOffset(activeNode as HTMLElement);

          if (caretOffset !== (activeNode as HTMLElement).innerText.length) {
            return;
          }

          event.preventDefault();
          const nextNode = findNextTextNode(activeNode, "right");
          if (nextNode != null) {
            setCaretOffset(nextNode.firstChild ?? nextNode, 0);
          }
          break;
        }
        case "b": {
          if (event.ctrlKey) {
            event.preventDefault();

            if (activeNode == null) return;
            const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
            if (activeBlock == null) return;

            const style: Style[] = [
              {
                name: "font-weight",
                value: "bold",
              },
            ];

            inlineAnnotationsManager(activeNode as HTMLElement, style);

            activeBlock.data = activeNode.innerHTML;
            changeHandler(activeBlock);
          }
          break;
        }
        case "i": {
          if (event.ctrlKey) {
            event.preventDefault();

            if (activeNode == null) return;
            const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
            if (activeBlock == null) return;

            const style: Style[] = [
              {
                name: "font-style",
                value: "italic",
              },
            ];

            inlineAnnotationsManager(activeNode as HTMLElement, style);
            activeBlock.data = activeNode.innerHTML;
            changeHandler(activeBlock);
          }
          break;
        }
        case "u": {
          if (event.ctrlKey) {
            event.preventDefault();

            if (activeNode == null) return;
            const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
            if (activeBlock == null) return;

            const style: Style[] = [
              {
                name: "text-decoration",
                value: "underline",
              },
            ];

            inlineAnnotationsManager(activeNode as HTMLElement, style);
            activeBlock.data = activeNode.innerHTML;
            changeHandler(activeBlock);
          }
          break;
        }
      }
    },
    [blob, masterBlocks, actionMenuTriggerHandler, changeHandler],
  );

  useEffect(() => {
    window.addEventListener("keydown", keyboardManager);
    window.addEventListener("input", mobileInputHandler);
    subscribeToEditorEvent(`saveEditor-${blob.id}`, () => {
      dispatchEditorEvent(`onSaved-${blob.id}`, {
        ...blob,
        blocks: masterBlocks,
      } satisfies Blob);
    });
    return () => {
      window.removeEventListener("keydown", keyboardManager);
      window.removeEventListener("input", mobileInputHandler);
    };
  }, [blob, keyboardManager, masterBlocks, mobileInputHandler]);

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
        removeEmptyInlineAnnotations(node);
      }
    }
  }, [focusedNode]);

  function createHandler(
    parentBlock: Block,
    targetBlock: Block,
    holder?: Block[],
    focusOn?: {
      nodeId: string;
      nodeChildIndex?: number;
      caretOffset?: number;
    },
  ): void {
    traverseAndUpdate(holder ?? masterBlocks, parentBlock);
    traverseAndUpdateBelow(holder ?? masterBlocks, parentBlock, targetBlock);
    propagateChanges(masterBlocks, {
      nodeId: focusOn !== undefined ? focusOn.nodeId : targetBlock.id,
      caretOffset: focusOn?.caretOffset ?? 0,
      nodeIndex: focusOn?.nodeChildIndex ?? 0,
    });
  }

  function deletionHandler(
    block: Block,
    previousBlock: Block,
    nodeId: string,
    setCursorToStart?: boolean,
    holder?: Block[],
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

    traverseAndUpdate(holder ?? masterBlocks, previousBlock);
    traverseAndDelete(holder ?? masterBlocks, block);

    propagateChanges(masterBlocks, {
      nodeId,
      caretOffset: computedCaretOffset,
      nodeIndex: previousBlockChildNodeIndex,
    });
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
              inlineAnnotationsManager(blockNode, executable.args as Style[]);
              block.data = blockNode.innerHTML;
              changeHandler(block);
              break;
            }
            case "link": {
              inlineAnnotationsManager(
                blockNode,
                [],
                executable.args as string,
              );
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

  function attachmentRequestHandler(block: Block, data: File | string): void {
    if (block.role !== "image" || typeof block.data !== "object") {
      return;
    }

    void onAttachmentSelected(data).then((str) => {
      block.data.url = str;
      const blockIndex = masterBlocks.indexOf(block);
      if (blockIndex === -1) {
        const activeNode = getBlockNode(block.id) as HTMLElement;
        const listMetadata = getListMetadata(activeNode);
        if (listMetadata != null) {
          const parentBlock = traverseAndFind(
            masterBlocks,
            listMetadata.parentId,
          ) as Block;
          traverseAndUpdate(parentBlock.data as Block[], block);
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
      <div id={`dialog-${blob.id}`} className={"select-none"}></div>
      <div
        data-node-type={"editor-root"}
        id={`editor-${blob.id}`}
        className={"block editor"}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {masterBlocks.map((block, index) => {
          return (
            <Composer
              key={block.id}
              editable={editable}
              previousParentBlock={index === 0 ? null : masterBlocks[index - 1]}
              block={block}
              onChange={debounce((block, focus) => {
                changeHandler(block, focus);
              }, 260)}
              onCreate={createHandler}
              onDelete={deletionHandler}
              onSelect={debounce((block) => {
                selectionHandler(block);
              }, 260)}
              onAttachmentRequest={attachmentRequestHandler}
              onMarkdown={markdownHandler}
            />
          );
        })}
      </div>
    </RootContext.Provider>
  );
}
