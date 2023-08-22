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
  generateMenuId,
  getBlockNode,
  getCaretCoordinates,
  inlineSpecifierManager,
  nodeInViewPort,
  normalizeContent,
  removeEmptyInlineSpecifiers,
  rgbStringToHex,
  serializeNodeToBlock,
  setCaretOffset,
  traverseAndFindBlockPosition,
  traverseAndUpdate,
  traverseAndUpdateBelow,
} from "../../utils";
import { type Content, type Role } from "../../types";
import { createRoot, type Root } from "react-dom/client";
import { SelectionMenu } from "../SelectionMenu";
import {
  AlignCenterIcon,
  AlignEndIcon,
  AlignStartIcon,
  BoldIcon,
  BulletListIcon,
  CodeIcon,
  HeadingIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  NumberedListIcon,
  ParagraphIcon,
  QuoteIcon,
  SubHeadingIcon,
  SubTitleIcon,
  TextBackgroundColorIcon,
  TextColorIcon,
  TextSizeIcon,
  TitleIcon,
  UnderlineIcon,
} from "../../icons";
import {
  LINK_ATTRIBUTE,
  REMOVE_COLOR,
  REMOVE_LINK,
  REMOVE_STYLE,
} from "../../constants";
import { ActionMenu } from "../ActionMenu";
import { actionMenuClosedEvent, actionMenuOpenedEvent } from "../../events";
import RenderType from "../../enums/RenderType";
import RootContext from "../../contexts/RootContext/RootContext";

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
    masterBlocks[blockIndex] = block;
    updateMasterBlocks(masterBlocks);
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
    updateMasterBlocks(masterBlocks);
    setFocusedNode({
      nodeId: targetBlock.id,
      caretOffset: 0,
      nodeIndex: 0,
    });
  }

  function deletionHandler(
    block: Block,
    previousBlock: Block | Block[],
    nodeId: string,
    nodeIndex: number,
    caretOffset: number
  ): void {
    if (blockRenderTypeFromRole(block.role) === RenderType.LIST) {
      traverseAndUpdate(masterBlocks, block);
    } else {
      if (Array.isArray(previousBlock)) {
        traverseAndUpdateBelow(masterBlocks, block, previousBlock[0]);
        for (let i = 1; i < previousBlock.length; i++) {
          traverseAndUpdateBelow(
            masterBlocks,
            previousBlock[i - 1],
            previousBlock[i]
          );
        }
      } else {
        const blockIndex = masterBlocks.map((blk) => blk.id).indexOf(block.id);
        masterBlocks[blockIndex - 1] = previousBlock;
        masterBlocks.splice(blockIndex, 1);
      }
    }
    propagateChanges(masterBlocks, {
      nodeId,
      caretOffset,
      nodeIndex,
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

    const blockNode = getBlockNode(block.id);
    const editorNode = window.document.getElementById(`editor-${blob.id}`);

    if (
      !editable ||
      selection == null ||
      blockNode == null ||
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

    if (
      startNodeParent == null ||
      endNodeParent == null ||
      popUpRoot === undefined
    ) {
      return;
    }

    const defaultSelectionMenu: Menu[] = [
      {
        id: generateMenuId(),
        name: "Bold",
        icon: <BoldIcon />,
        execute: {
          type: "style",
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
          type: "style",
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
          type: "style",
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
        separator: true,
        icon: <LinkIcon />,
        execute: {
          type: "input",
          args: {
            hint: "Add Link..",
            type: "text",
            executionTypeAfterInput: "link",
            initialPayload: "",
            payloadIfRemovedClicked: REMOVE_LINK,
            validStringRegExp:
              /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/,
          },
        },
      },
      {
        id: generateMenuId(),
        name: "Text Size",
        separator: true,
        icon: <TextSizeIcon />,
        execute: {
          type: "input",
          args: {
            hint: "Text Size..",
            type: "number",
            unit: "px",
            executionTypeAfterInput: "style",
            initialPayload: {
              name: "font-size",
              value: "",
            },
            payloadIfRemovedClicked: REMOVE_STYLE,
            validStringRegExp: /^[0-9]*$/,
          },
        },
      },
      {
        id: generateMenuId(),
        name: "Text Color",
        icon: <TextColorIcon />,
        execute: {
          type: "input",
          args: {
            hint: "HEX Code",
            type: "color",
            executionTypeAfterInput: "style",
            initialPayload: {
              name: "color",
              value: "",
            },
            payloadIfRemovedClicked: REMOVE_COLOR,
            validStringRegExp: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          },
        },
      },
      {
        id: generateMenuId(),
        name: "Text Background Color",
        icon: <TextBackgroundColorIcon />,
        execute: {
          type: "input",
          args: {
            hint: "HEX Code",
            type: "color",
            executionTypeAfterInput: "style",
            initialPayload: {
              name: "background-color",
              value: "",
            },
            payloadIfRemovedClicked: REMOVE_COLOR,
            validStringRegExp: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          },
        },
      },
      {
        id: generateMenuId(),
        name: "Code",
        icon: <CodeIcon />,
        execute: {
          type: "style",
          args: [
            {
              name: "font-family",
              value: "monospace",
            },
            {
              name: "background-color",
              value: "#e8e6e6",
            },
            {
              name: "border-radius",
              value: "3px",
            },
            {
              name: "padding",
              value: "2px",
            },
          ],
        },
      },
    ];

    if (selectionMenu !== undefined && selectionMenu.length !== 0) {
      defaultSelectionMenu.push(...selectionMenu);
    }

    for (const menu of defaultSelectionMenu) {
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
        menus={defaultSelectionMenu}
        onClose={() => {
          popUpRoot.render(<Fragment />);
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
        if (event.ctrlKey) {
          popUpRoot.render(<Fragment />);
        } else {
          selection.removeAllRanges();
          popUpRoot.render(<Fragment />);
        }
      },
      {
        once: true,
      }
    );
    editorNode.addEventListener(
      "mousedown",
      () => {
        selection.removeAllRanges();
        popUpRoot.render(<Fragment />);
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
    let actionMenus: Menu[] = [
      {
        id: generateMenuId(),
        name: "Title",
        description: `Big section Heading`,
        icon: <TitleIcon size={32} />,
        allowedOn: ["subTitle", "heading", "subHeading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "title",
        },
      },
      {
        id: generateMenuId(),
        name: "Sub Title",
        description: `Big section Subheading`,
        icon: <SubTitleIcon size={32} />,
        allowedOn: ["title", "heading", "subHeading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "subTitle",
        },
      },
      {
        id: generateMenuId(),
        name: "Heading",
        description: `Small Section heading`,
        icon: <HeadingIcon size={32} />,
        allowedOn: ["title", "subTitle", "subHeading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "heading",
        },
      },
      {
        id: generateMenuId(),
        name: "Subheading",
        description: `Small Section Subheading`,
        icon: <SubHeadingIcon size={32} />,
        allowedOn: ["title", "subTitle", "heading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "subHeading",
        },
      },
      {
        id: generateMenuId(),
        name: "Paragraph",
        description: `Just start typing`,
        icon: <ParagraphIcon size={32} />,
        allowedOn: ["title", "subTitle", "heading", "subHeading", "quote"],
        execute: {
          type: "role",
          args: "paragraph",
        },
      },
      {
        id: generateMenuId(),
        name: "Quote",
        description: `Capture a quote`,
        icon: <QuoteIcon size={32} />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "quote",
        },
      },
      {
        id: generateMenuId(),
        name: "Bullet List",
        description: `Create simple bullet list`,
        icon: <BulletListIcon size={35} />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "bulletList",
        },
      },
      {
        id: generateMenuId(),
        name: "Numbered List",
        description: `Create list with numbering`,
        icon: <NumberedListIcon size={35} />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "numberedList",
        },
      },
      {
        id: generateMenuId(),
        name: "Image",
        description: `Add an image`,
        icon: <ImageIcon size={32} />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "image",
        },
      },
      {
        id: generateMenuId(),
        name: "Align Start",
        description: `Align text to start`,
        icon: <AlignStartIcon size={32} />,
        allowedOn: [
          "title",
          "subTitle",
          "heading",
          "subHeading",
          "paragraph",
          "numberedList",
          "bulletList",
        ],
        execute: {
          type: "style",
          args: [
            {
              name: "textAlign",
              value: "start",
            },
          ],
        },
      },
      {
        id: generateMenuId(),
        name: "Align Center",
        description: `Align text at the center`,
        icon: <AlignCenterIcon size={32} />,
        allowedOn: [
          "title",
          "subTitle",
          "heading",
          "subHeading",
          "paragraph",
          "numberedList",
          "bulletList",
        ],
        execute: {
          type: "style",
          args: [
            {
              name: "textAlign",
              value: "center",
            },
          ],
        },
      },
      {
        id: generateMenuId(),
        name: "Align End",
        description: `Align text at the end`,
        icon: <AlignEndIcon size={32} />,
        allowedOn: [
          "title",
          "subTitle",
          "heading",
          "subHeading",
          "paragraph",
          "numberedList",
          "bulletList",
        ],
        execute: {
          type: "style",
          args: [
            {
              name: "textAlign",
              value: "end",
            },
          ],
        },
      },
    ];

    actionMenus = actionMenus.filter((menu) => {
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
        menu={actionMenus}
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

  function markdownHandler(block: Block, newRole: Role): void {
    const blockIndex = masterBlocks.indexOf(block);
    block.role = newRole;
    if (newRole === "numberedList" || newRole === "bulletList") {
      block.content = [
        {
          id: generateBlockId(),
          content: "",
          role: "paragraph",
          style: [],
        },
      ];
    } else {
      masterBlocks[blockIndex].content = "";
    }
    masterBlocks[blockIndex] = block;
    updateMasterBlocks(masterBlocks);
    setFocusedNode({
      nodeId: block.id,
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
              onChange={changeHandler}
              onCreate={createHandler}
              onDelete={deletionHandler}
              onPaste={pasteHandler}
              onSelect={selectionHandler}
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
