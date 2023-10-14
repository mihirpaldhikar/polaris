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
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Action,
  type Blob,
  type BlockSchema,
  type Coordinates,
  type PolarisConfig,
  type Style,
} from "../../interfaces";
import {
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
  serializeFile,
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
import { AnnotationToolbar } from "../AnnotationToolbar";
import { DEFAULT_POLARIS_CONFIG, LINK_ATTRIBUTE } from "../../constants";
import { BlockTools } from "../BlockTools";
import RootContext from "../../contexts/RootContext/RootContext";
import { debounce } from "debounce";
import { cloneDeep } from "lodash";
import { Composer } from "../Composer";
import { AnnotationActions, BlockActions } from "../../assets/index";
import type GenericBlockPlugin from "../../interfaces/GenericBlockPlugin";
import { BlockPlugin } from "../../plugins";
import {
  BulletListBlockPlugin,
  GitHubGistBlockPlugin,
  HeadingBlockPlugin,
  ImageBlockPlugin,
  NumberedListBlockPlugin,
  ParagraphBlockPlugin,
  QuoteBlockPlugin,
  SubHeadingBlockPlugin,
  SubTitleBlockPlugin,
  TableBlockPlugin,
  TitleBlockPlugin,
  YouTubeVideoBlockPlugin,
} from "../../blocks";
import { useHotkeys } from "react-hotkeys-hook";

declare global {
  interface Window {
    registeredBlocks: Readonly<Map<string, GenericBlockPlugin>>;
  }
}

interface EditorProps {
  editable?: boolean;
  blob: Blob;
  config?: PolarisConfig;
  className?: string;
  annotationActions?: Action[];
  onAttachmentSelected?: (data: File | string) => Promise<string>;
}

/**
 * @function Editor
 *
 * @param editable
 * @param blob
 * @param config
 * @param onAttachmentSelected
 * @param className
 * @param annotationActions
 *
 * @description An Editor  manages all the blocks of the blob. Editor also handles user interactions and updates the re-renders the DOM accordingly.
 *
 * @author Mihir Paldhikar
 */

const blockPlugin = new BlockPlugin();

export default function Editor({
  editable = true,
  blob,
  config = DEFAULT_POLARIS_CONFIG,
  annotationActions,
  className,
  onAttachmentSelected,
}: EditorProps): JSX.Element {
  window.registeredBlocks = useMemo(() => {
    blockPlugin.registerBlock(new ParagraphBlockPlugin());
    blockPlugin.registerBlock(new TitleBlockPlugin());
    blockPlugin.registerBlock(new SubTitleBlockPlugin());
    blockPlugin.registerBlock(new HeadingBlockPlugin());
    blockPlugin.registerBlock(new SubHeadingBlockPlugin());
    blockPlugin.registerBlock(new QuoteBlockPlugin());
    blockPlugin.registerBlock(new ImageBlockPlugin());
    blockPlugin.registerBlock(new YouTubeVideoBlockPlugin());
    blockPlugin.registerBlock(new GitHubGistBlockPlugin());
    blockPlugin.registerBlock(new TableBlockPlugin());
    blockPlugin.registerBlock(new NumberedListBlockPlugin());
    blockPlugin.registerBlock(new BulletListBlockPlugin());
    return blockPlugin.registeredBlocks();
  }, []);

  const popupNode = useRef<HTMLDivElement>(null);
  const dialogNode = useRef<HTMLDivElement>(null);
  const editorNode = useRef<HTMLDivElement>(null);
  const screenOffset = useRef(0);
  const [popUpRoot, setPopupRoot] = useState<Root>();
  const [dialogRoot, setDialogRoot] = useState<Root>();
  const isActionMenuOpen = useRef<boolean>(false);
  const isDocumentSelected = useRef(false);

  const registeredBlockActions: Action[] = useMemo(() => {
    return Array.from(blockPlugin.registeredBlocks().values()).map((block) => {
      return {
        id: generateUUID(),
        name: block.name,
        description: block.description,
        icon: block.icon,
        execute: {
          type: "role",
          args: {
            onInitialized: block.onInitialized,
          },
        },
      };
    });
  }, []);

  const defaultBlockActions: Readonly<Action[]> = useMemo(() => {
    return [...registeredBlockActions, ...BlockActions];
  }, [registeredBlockActions]);

  let defaultAnnotationActions: readonly Action[] = useMemo(() => {
    return cloneDeep(AnnotationActions).concat(...(annotationActions ?? []));
  }, [annotationActions]);

  const [masterBlocks, updateMasterBlocks] = useState<BlockSchema[]>(
    blob.blocks,
  );
  const [focusedNode, setFocusedNode] = useState<
    | {
        nodeId: string;
        caretOffset: number;
        nodeIndex?: number;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    setPopupRoot(createRoot(popupNode.current as HTMLDivElement));
    setDialogRoot(createRoot(dialogNode.current as HTMLDivElement));
  }, [blob.id]);

  const propagateChanges = useCallback(
    (
      blocks: BlockSchema[],
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

  const actionKeyHandler = useCallback(
    (
      nodeIndex: number,
      block: BlockSchema,
      previousContent: string,
      caretOffset: number,
      blockTools: readonly Action[],
    ) => {
      const activeNode = getBlockNode(block.id);
      if (activeNode == null || typeof block.data !== "string") {
        return;
      }

      const listMetadata = getListMetadata(activeNode);

      if (popupNode.current?.childElementCount !== 0) {
        popUpRoot?.render(<Fragment />);
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
      popUpRoot?.render(
        <BlockTools
          coordinates={actionMenuCoordinates}
          actions={blockTools}
          onClose={() => {
            dispatchEditorEvent("onActionMenu", {
              opened: false,
            });
            isActionMenuOpen.current = false;
            popUpRoot?.render(<Fragment />);
          }}
          onEscape={(query) => {
            setFocusedNode({
              nodeId: block.id,
              caretOffset: caretOffset + query.length + 1,
              nodeIndex,
            });
          }}
          onActionSelected={(execute) => {
            switch (execute.type) {
              case "role": {
                let { focusBlockId, setCaretToStart, inPlace, template } =
                  execute.args.onInitialized(previousContent);
                if (listMetadata !== null) {
                  const parentBlock = traverseAndFind(
                    masterBlocks,
                    listMetadata.parentId,
                  );
                  if (parentBlock == null) return;
                  const listData = parentBlock.data as BlockSchema[];
                  if (inPlace !== undefined && inPlace) {
                    listData.splice(listMetadata.childIndex, 1, template);
                  } else {
                    block.data = previousContent;
                    listData.splice(
                      listMetadata.childIndex,
                      1,
                      ...[block, template],
                    );
                  }
                  if (
                    (listMetadata.childIndex === listData.length - 1 ||
                      listMetadata.childIndex + 1 === listData.length - 1) &&
                    typeof template.data !== "string"
                  ) {
                    const emptyBlock: BlockSchema = {
                      id: generateUUID(),
                      data: "",
                      role: "paragraph",
                      style: [],
                    };
                    listData.splice(
                      inPlace !== undefined && inPlace
                        ? listMetadata.childIndex + 1
                        : listMetadata.childIndex + 2,
                      0,
                      emptyBlock,
                    );
                  }
                  parentBlock.data = listData;
                  traverseAndUpdate(masterBlocks, parentBlock);
                } else {
                  if (inPlace !== undefined && inPlace) {
                    template.id = block.id;
                    if (typeof template.data === "string") {
                      focusBlockId = template.id;
                    }
                    traverseAndUpdate(masterBlocks, template);
                  } else {
                    block.data = previousContent;
                    traverseAndUpdate(masterBlocks, block);
                    traverseAndUpdateBelow(masterBlocks, block, template);
                  }
                  const blockIndex = traverseAndFindBlockPosition(
                    masterBlocks,
                    template,
                  );
                  if (
                    (blockIndex === masterBlocks.length - 1 ||
                      blockIndex + 1 === masterBlocks.length - 1) &&
                    typeof template.data !== "string"
                  ) {
                    const emptyBlock: BlockSchema = {
                      id: generateUUID(),
                      data: "",
                      role: "paragraph",
                      style: [],
                    };
                    traverseAndUpdateBelow(masterBlocks, template, emptyBlock);
                  }
                }

                propagateChanges(masterBlocks, {
                  nodeId: focusBlockId,
                  caretOffset: setCaretToStart ?? false ? 0 : caretOffset,
                  nodeIndex: setCaretToStart ?? false ? 0 : nodeIndex,
                });
                break;
              }
              case "style": {
                const newStyle = execute.args;
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

      editorNode.current?.addEventListener("mousedown", () => {
        popUpRoot?.render(<Fragment />);
      });
    },
    [masterBlocks, popUpRoot, propagateChanges],
  );

  const actionMenuTriggerHandler = useCallback(
    (activeBlock: BlockSchema, activeNode: HTMLElement, isMobile: boolean) => {
      screenOffset.current = window.scrollY;
      const caretOffset = getCaretOffset(activeNode);
      if (typeof activeBlock.data === "string") {
        const nodeAtCaretOffset = getNodeAt(activeNode, caretOffset);
        const computedCaretOffset = getCaretOffset(
          nodeAtCaretOffset as HTMLElement,
        );
        actionKeyHandler(
          getNodeIndex(activeNode, nodeAtCaretOffset),
          activeBlock,
          !isMobile
            ? activeBlock.data
            : activeBlock.data
                .substring(0, caretOffset - 1)
                .concat(activeBlock.data.substring(caretOffset)),
          isMobile ? computedCaretOffset - 1 : computedCaretOffset,
          defaultBlockActions,
        );
      }
    },
    [actionKeyHandler, defaultBlockActions],
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
            popUpRoot?.render(<Fragment />);
          }
        }
      }
    },
    [actionMenuTriggerHandler, masterBlocks, popUpRoot],
  );

  useHotkeys(
    "ctrl+s",
    () => {
      dispatchEditorEvent(`onSaved-${blob.id}`, {
        ...blob,
        blocks: masterBlocks,
      } satisfies Blob);
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    "ctrl+a",
    () => {
      const range = new Range();
      range.selectNodeContents(editorNode.current as HTMLElement);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      isDocumentSelected.current = true;
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      ignoreEventWhen: () => {
        return (
          editorNode.current === null ||
          !editorNode.current?.contains(document.activeElement)
        );
      },
    },
  );

  useHotkeys(
    "/",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
      if (activeBlock != null) {
        actionMenuTriggerHandler(activeBlock, activeNode, false);
      }
    },
    {
      enableOnContentEditable: true,
      ignoreEventWhen: () => {
        return (
          isActionMenuOpen.current ||
          document.activeElement == null ||
          document.activeElement.getAttribute("contenteditable") !== "true"
        );
      },
    },
  );

  useHotkeys(
    "arrowup",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const caretOffset = getCaretOffset(activeNode);
      const previousNode = findPreviousTextNode(activeNode, "top");
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
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      ignoreEventWhen: () => {
        return (
          isActionMenuOpen.current ||
          document.activeElement == null ||
          document.activeElement.getAttribute("contenteditable") !== "true" ||
          !(editorNode.current?.contains(document.activeElement) ?? false)
        );
      },
    },
  );

  useHotkeys(
    "arrowdown",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const caretOffset = getCaretOffset(activeNode);
      const nextNode = findNextTextNode(activeNode, "bottom");
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
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      ignoreEventWhen: () => {
        return (
          isActionMenuOpen.current ||
          document.activeElement == null ||
          document.activeElement.getAttribute("contenteditable") !== "true" ||
          !(editorNode.current?.contains(document.activeElement) ?? false)
        );
      },
    },
  );

  useHotkeys(
    "arrowleft",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const previousNode = findPreviousTextNode(activeNode, "left");
      if (previousNode != null) {
        const previousBlockChildNodeIndex =
          previousNode?.lastChild?.textContent === ""
            ? previousNode.childNodes.length - 2
            : previousNode.childNodes.length - 1;

        const jumpNode =
          previousBlockChildNodeIndex === -1
            ? previousNode
            : previousNode.childNodes[previousBlockChildNodeIndex].nodeType ===
              Node.ELEMENT_NODE
            ? previousNode.childNodes[previousBlockChildNodeIndex].firstChild ??
              previousNode
            : previousNode.childNodes[previousBlockChildNodeIndex];

        const computedCaretOffset =
          previousBlockChildNodeIndex === -1
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
        setCaretOffset(jumpNode, computedCaretOffset);
      }
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      ignoreEventWhen: () => {
        return (
          isActionMenuOpen.current ||
          document.activeElement == null ||
          document.activeElement.getAttribute("contenteditable") !== "true" ||
          getCaretOffset(document.activeElement) !== 0
        );
      },
    },
  );

  useHotkeys(
    "arrowright",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const nextNode = findNextTextNode(activeNode, "right");
      if (nextNode != null) {
        setCaretOffset(nextNode.firstChild ?? nextNode, 0);
      }
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      ignoreEventWhen: () => {
        return (
          isActionMenuOpen.current ||
          document.activeElement == null ||
          document.activeElement.getAttribute("contenteditable") !== "true" ||
          getCaretOffset(document.activeElement) !==
            (document.activeElement as HTMLElement).innerText.length
        );
      },
    },
  );

  useHotkeys(
    "ctrl+b",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
      if (activeBlock == null) return;

      const style: Style[] = [
        {
          name: "font-weight",
          value: "bold",
        },
      ];

      inlineAnnotationsManager(activeNode, style);

      activeBlock.data = activeNode.innerHTML;
      changeHandler(activeBlock);
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      ignoreEventWhen: () => {
        return (
          document.activeElement?.getAttribute("contenteditable") !== "true"
        );
      },
    },
  );

  useHotkeys(
    "ctrl+i",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
      if (activeBlock == null) return;

      const style: Style[] = [
        {
          name: "font-style",
          value: "italic",
        },
      ];

      inlineAnnotationsManager(activeNode, style);

      activeBlock.data = activeNode.innerHTML;
      changeHandler(activeBlock);
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      ignoreEventWhen: () => {
        return (
          document.activeElement?.getAttribute("contenteditable") !== "true"
        );
      },
    },
  );

  useHotkeys(
    "ctrl+u",
    () => {
      const activeNode = document.activeElement as HTMLElement;
      const activeBlock = traverseAndFind(masterBlocks, activeNode.id);
      if (activeBlock == null) return;

      const style: Style[] = [
        {
          name: "text-decoration",
          value: "underline",
        },
      ];

      inlineAnnotationsManager(activeNode, style);

      activeBlock.data = activeNode.innerHTML;
      changeHandler(activeBlock);
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      ignoreEventWhen: () => {
        return (
          document.activeElement?.getAttribute("contenteditable") !== "true"
        );
      },
    },
  );

  useHotkeys(
    "backspace",
    () => {
      const emptyBlock: BlockSchema[] = [
        {
          id: generateUUID(),
          role: "paragraph",
          data: "",
          style: [],
        },
      ];

      propagateChanges(...[emptyBlock], {
        nodeId: emptyBlock[0].id,
        caretOffset: 0,
        nodeIndex: 0,
      });
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      ignoreEventWhen: () => {
        return !isDocumentSelected.current;
      },
    },
  );

  const scrollHandler = useCallback(() => {
    if ((popupNode.current?.childElementCount ?? 0) > 0) {
      (popupNode.current as HTMLElement).hidden = true;
    }
    if ((dialogNode.current?.childElementCount ?? 0) > 0) {
      (dialogNode.current as HTMLElement).hidden = true;
    }
  }, []);

  const scrollEndHandler = useCallback(() => {
    const popupChild = popupNode.current?.firstElementChild;
    const dialogChild = dialogNode.current?.firstElementChild;
    if (popupChild != null) {
      setTimeout(() => {
        const yCoordinate = parseInt(
          popupChild.getAttribute("data-y-coordinate") as string,
        );
        (popupChild as HTMLElement).style.top = `${
          yCoordinate - (window.scrollY - screenOffset.current)
        }px`;
        (popupNode.current as HTMLElement).hidden = false;
      });
    }
    if (dialogChild != null) {
      setTimeout(() => {
        const yCoordinate = parseInt(
          dialogChild.getAttribute("data-y-coordinate") as string,
        );
        (dialogChild as HTMLElement).style.top = `${
          yCoordinate - (window.scrollY - screenOffset.current)
        }px`;
        (dialogNode.current as HTMLElement).hidden = false;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    window.addEventListener("scrollend", scrollEndHandler);
    window.addEventListener("input", mobileInputHandler);
    window.addEventListener("click", () => {
      isDocumentSelected.current = false;
    });
    subscribeToEditorEvent(`saveEditor-${blob.id}`, () => {
      dispatchEditorEvent(`onSaved-${blob.id}`, {
        ...blob,
        blocks: masterBlocks,
      } satisfies Blob);
    });
    return () => {
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("scrollend", scrollEndHandler);
      window.removeEventListener("input", mobileInputHandler);
      window.removeEventListener("click", () => {
        isDocumentSelected.current = false;
      });
    };
  }, [blob, masterBlocks, mobileInputHandler, scrollEndHandler, scrollHandler]);

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
    parentBlock: BlockSchema,
    targetBlock: BlockSchema,
    holder?: BlockSchema[],
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

  function changeHandler(block: BlockSchema, focus?: boolean): void {
    const blockIndex: number = masterBlocks
      .map((blk) => blk.id)
      .indexOf(block.id);
    if (blockIndex === -1) {
      traverseAndUpdate(masterBlocks, block);
    } else {
      masterBlocks[blockIndex] = block;
      updateMasterBlocks(masterBlocks);
    }
    if (focus !== undefined && focus) {
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
  }

  function deletionHandler(
    block: BlockSchema,
    previousBlock: BlockSchema,
    nodeId: string,
    setCursorToStart?: boolean,
    holder?: BlockSchema[],
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

  function annotationsHandler(block: BlockSchema): void {
    const selection = window.getSelection();

    const activeNode = getBlockNode(block.id);

    if (
      !editable ||
      selection == null ||
      activeNode == null ||
      isDocumentSelected.current
    ) {
      return;
    }
    screenOffset.current = window.scrollY;
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

    for (const action of defaultAnnotationActions) {
      if (
        action.execute.type === "style" &&
        Array.isArray(action.execute.args)
      ) {
        if (
          elementContainsStyle(startNodeParent, action.execute.args) &&
          elementContainsStyle(endNodeParent, action.execute.args)
        ) {
          action.active = true;
        }
      }

      if (action.execute.type === "styleInput") {
        const args = action.execute.args;
        if (
          elementContainsStyle(startNodeParent, args.payload) &&
          elementContainsStyle(endNodeParent, args.payload)
        ) {
          args.payload.value =
            args.inputType === "color"
              ? rgbStringToHex(
                  startNodeParent.style.getPropertyValue(args.payload.name),
                )
              : startNodeParent.style.getPropertyValue(args.payload.name);
          action.active = true;
        }
      } else if (
        action.execute.type === "linkInput" &&
        startNodeParent.getAttribute(LINK_ATTRIBUTE) !== null &&
        endNodeParent.getAttribute(LINK_ATTRIBUTE) !== null
      ) {
        action.execute.args.payload =
          startNodeParent.getAttribute(LINK_ATTRIBUTE) ?? "";
        action.active = true;
      }
    }

    popUpRoot?.render(
      <AnnotationToolbar
        dialogRoot={dialogRoot}
        coordinates={selectionMenuCoordinates}
        actions={defaultAnnotationActions}
        onClose={() => {
          popUpRoot?.render(<Fragment />);
          defaultAnnotationActions = cloneDeep(AnnotationActions).concat(
            ...(annotationActions ?? []),
          );
        }}
        onActionSelected={(executable) => {
          selection.removeAllRanges();
          selection.addRange(range);
          switch (executable.type) {
            case "style": {
              inlineAnnotationsManager(activeNode, executable.args);
              block.data = activeNode.innerHTML;
              changeHandler(block);
              break;
            }
            case "linkInput": {
              inlineAnnotationsManager(activeNode, [], executable.args.payload);
              block.data = activeNode.innerHTML;
              changeHandler(block);
              break;
            }
          }
        }}
      />,
    );

    editorNode.current?.addEventListener(
      "keydown",
      (event) => {
        if (!event.ctrlKey || !event.shiftKey) {
          popUpRoot?.render(<Fragment />);
          defaultAnnotationActions = cloneDeep(AnnotationActions).concat(
            ...(annotationActions ?? []),
          );
        }
      },
      {
        once: true,
      },
    );
    editorNode.current?.addEventListener(
      "mousedown",
      () => {
        popUpRoot?.render(<Fragment />);
        defaultAnnotationActions = cloneDeep(AnnotationActions).concat(
          ...(annotationActions ?? []),
        );
      },
      {
        once: true,
      },
    );
  }

  function attachmentRequestHandler(
    block: BlockSchema,
    data: File | string,
  ): void {
    if (typeof block.data !== "object") {
      return;
    }

    if (onAttachmentSelected !== undefined) {
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
            ) as BlockSchema;
            traverseAndUpdate(parentBlock.data as BlockSchema[], block);
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
    } else if (typeof data !== "string") {
      void serializeFile(data).then((payload) => {
        block.data.url = payload;
        const blockIndex = masterBlocks.indexOf(block);
        if (blockIndex === -1) {
          const activeNode = getBlockNode(block.id) as HTMLElement;
          const listMetadata = getListMetadata(activeNode);
          if (listMetadata != null) {
            const parentBlock = traverseAndFind(
              masterBlocks,
              listMetadata.parentId,
            ) as BlockSchema;
            traverseAndUpdate(parentBlock.data as BlockSchema[], block);
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
  }

  function markdownHandler(block: BlockSchema, focusBlockId?: string): void {
    traverseAndUpdate(masterBlocks, block);
    propagateChanges(masterBlocks, {
      nodeId: focusBlockId ?? block.id,
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
        ref={popupNode}
        className={"select-none"}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      ></div>
      <div ref={dialogNode} className={"select-none"}></div>
      <div
        ref={editorNode}
        data-node-type={"editor-root"}
        id={`editor-${blob.id}`}
        className={"block editor".concat(" ").concat(className ?? "")}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {masterBlocks.map((block, index) => {
          return (
            <Composer
              key={block.id}
              block={block}
              blockLifecycle={{
                editable,
                previousParentBlock:
                  index === 0 ? null : masterBlocks[index - 1],
                onChange: debounce((block, focus) => {
                  changeHandler(block, focus);
                }, 260),
                onCreate: createHandler,
                onDelete: deletionHandler,
                onSelect: debounce((block) => {
                  annotationsHandler(block);
                }, 260),
                onAttachmentRequest: attachmentRequestHandler,
                onMarkdown: markdownHandler,
              }}
            />
          );
        })}
      </div>
    </RootContext.Provider>
  );
}
