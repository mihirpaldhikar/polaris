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
  type ImageContent,
  type InputArgs,
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
  nodeInViewPort,
  normalizeContent,
  removeEmptyInlineSpecifiers,
  rgbStringToHex,
  setCaretOffset,
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
  ChangeIcon,
  CodeIcon,
  DeleteIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  NumberedListIcon,
  ParagraphIcon,
  QuoteIcon,
  ResizeIcon,
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
import { ContextMenu } from "../ContextMenu";
import { SizeDialog } from "../SizeDialog";

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
  const [contents, updateContents] = useState<Block[]>(blob.contents);

  const [focusedNode, setFocusedNode] = useState<
    | {
        nodeId: string;
        caretOffset: number;
        nodeIndex?: number;
      }
    | undefined
  >(undefined);

  const [popupRoot, setPopupRoot] = useState<Root>();
  const [dialogRoot, setDialogRoot] = useState<Root>();
  const [editorNode, setEditorNode] = useState<HTMLElement>();

  useEffect(() => {
    setPopupRoot(
      createRoot(document.getElementById(`popup-${blob.id}`) as HTMLElement)
    );
    setDialogRoot(
      createRoot(document.getElementById(`dialog-${blob.id}`) as HTMLElement)
    );
    setEditorNode(document.getElementById(`editor-${blob.id}`) as HTMLElement);
    return () => {
      setPopupRoot(undefined);
      setEditorNode(undefined);
    };
  }, [blob.id]);

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

        setTimeout(() => {
          setCaretOffset(jumpNode, caretOffset);
        }, 0.001);
        removeEmptyInlineSpecifiers(node);
      }
    }
  }, [focusedNode]);

  function changeHandler(block: Block): void {
    const blockIndex: number = contents.indexOf(block);
    contents[blockIndex] = block;
    updateContents(contents);
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
    updateContents(blocks);
    setFocusedNode(focus);
    if (onChange !== undefined) {
      onChange(blob);
    }
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
    propagateChanges(contents, {
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
    if (typeof block.content !== "string") return;
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
      contents.splice(blockIndex, 1, ...pasteBlocks);

      const pasteContentLength = normalizeContent(
        pasteBlocks[pasteBlocks.length - 1].content as string
      ).length;

      const computedCaretOffset: number =
        pasteContentLength - contentLengthAfterCaretOffset < 0
          ? contentLengthAfterCaretOffset - pasteContentLength
          : pasteContentLength - contentLengthAfterCaretOffset;

      propagateChanges(contents, {
        nodeId: pasteBlocks[pasteBlocks.length - 1].id,
        caretOffset: computedCaretOffset,
      });
    } else if (block.type === "text" && typeof content === "string") {
      contents[blockIndex].content = (contents[blockIndex].content as string)
        .substring(0, caretOffset)
        .concat(content)
        .concat(
          (contents[blockIndex].content as string).substring(caretOffset)
        );

      const pasteContentLength = normalizeContent(block.content).length;

      const computedCaretOffset: number =
        pasteContentLength - contentLengthAfterCaretOffset < 0
          ? contentLengthAfterCaretOffset - pasteContentLength
          : pasteContentLength - contentLengthAfterCaretOffset;

      propagateChanges(contents, {
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
      popupRoot === undefined
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

    popupRoot.render(
      <SelectionMenu
        blobId={blob.id}
        dialogRoot={dialogRoot}
        coordinates={selectionMenuCoordinates}
        menus={defaultSelectionMenu}
        onClose={() => {
          popupRoot.render(<Fragment />);
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
          popupRoot.render(<Fragment />);
        } else {
          selection.removeAllRanges();
          popupRoot.render(<Fragment />);
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
        popupRoot.render(<Fragment />);
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
        description: `Change ${block.role} to Title`,
        icon: <TitleIcon />,
        allowedOn: ["subTitle", "heading", "subHeading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "title",
        },
      },
      {
        id: generateMenuId(),
        name: "Sub Title",
        description: `Change ${block.role} to Sub Title`,
        icon: <SubTitleIcon />,
        allowedOn: ["title", "heading", "subHeading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "subTitle",
        },
      },
      {
        id: generateMenuId(),
        name: "Heading",
        description: `Change ${block.role} to Heading`,
        icon: <HeadingIcon />,
        allowedOn: ["title", "subTitle", "subHeading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "heading",
        },
      },
      {
        id: generateMenuId(),
        name: "Subheading",
        description: `Change ${block.role} to Subheading`,
        icon: <SubHeadingIcon />,
        allowedOn: ["title", "subTitle", "heading", "paragraph", "quote"],
        execute: {
          type: "role",
          args: "subHeading",
        },
      },
      {
        id: generateMenuId(),
        name: "Paragraph",
        description: `Change ${block.role} to Paragraph`,
        icon: <ParagraphIcon />,
        allowedOn: ["title", "subTitle", "heading", "subHeading", "quote"],
        execute: {
          type: "role",
          args: "paragraph",
        },
      },
      {
        id: generateMenuId(),
        name: "Quote",
        description: `Change ${block.role} to Quote`,
        icon: <QuoteIcon />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "quote",
        },
      },
      {
        id: generateMenuId(),
        name: "Bullet List",
        description: `Change ${block.role} to Bullet List`,
        icon: <BulletListIcon />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "bulletList",
        },
      },
      {
        id: generateMenuId(),
        name: "Numbered List",
        description: `Change ${block.role} to Numbered List`,
        icon: <NumberedListIcon />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "numberedList",
        },
      },
      {
        id: generateMenuId(),
        name: "Image",
        description: `Change ${block.role} to Bullet List`,
        icon: <BulletListIcon />,
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
        icon: <AlignStartIcon />,
        allowedOn: [
          "title",
          "subTitle",
          "heading",
          "subHeading",
          "paragraph",
          "numberedList",
          "bulletList",
          "listChild",
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
        icon: <AlignCenterIcon />,
        allowedOn: [
          "title",
          "subTitle",
          "heading",
          "subHeading",
          "paragraph",
          "numberedList",
          "bulletList",
          "listChild",
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
        icon: <AlignEndIcon />,
        allowedOn: [
          "title",
          "subTitle",
          "heading",
          "subHeading",
          "paragraph",
          "numberedList",
          "bulletList",
          "listChild",
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
    const blockNode = getBlockNode(block.id);
    if (
      popupNode == null ||
      editorNode == null ||
      blockNode == null ||
      popupRoot === undefined ||
      typeof block.content !== "string"
    ) {
      return;
    }

    if (popupNode.childElementCount !== 0) {
      popupRoot.render(<Fragment />);
      window.dispatchEvent(actionMenuClosedEvent);
      return;
    }

    if (!nodeInViewPort(blockNode)) {
      blockNode.scrollIntoView();
    }

    const newBlock: Block = {
      id: generateBlockId(),
      type: block.type,
      style: block.style,
      role: block.role,
      content: previousContent,
    };
    const { x, y } = getCaretCoordinates(true);
    const actionMenuCoordinates: Coordinates = {
      x: block.content.length === 0 ? blockNode.getBoundingClientRect().x : x,
      y:
        (block.content.length === 0 ? blockNode.getBoundingClientRect().y : y) +
        30,
    };

    window.dispatchEvent(actionMenuOpenedEvent);

    popupRoot.render(
      <ActionMenu
        coordinates={actionMenuCoordinates}
        menu={actionMenus}
        onClose={() => {
          window.dispatchEvent(actionMenuClosedEvent);
          popupRoot.render(<Fragment />);
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
              if (typeof execute.args === "string") {
                newBlock.role = execute.args as Role;
                if (newBlock.role === "image") {
                  newBlock.type = "image";
                  newBlock.content = {
                    url: "",
                    height: 0,
                    width: 0,
                    description: "",
                  };
                  const emptyBlock: Block = {
                    id: generateBlockId(),
                    type: "text",
                    role: "paragraph",
                    content: "",
                    style: [],
                  };
                  if (previousContent === "") {
                    contents.splice(
                      contents.indexOf(block),
                      1,
                      ...[newBlock, emptyBlock]
                    );
                  } else {
                    contents[contents.indexOf(block)].content = previousContent;
                    contents.splice(
                      contents.indexOf(block) + 1,
                      0,
                      ...[newBlock, emptyBlock]
                    );
                  }
                  propagateChanges(contents, {
                    nodeId: emptyBlock.id,
                    caretOffset: 0,
                  });
                  return;
                } else if (newBlock.role === "numberedList") {
                  newBlock.type = "list";
                  newBlock.style.push(
                    ...[
                      {
                        name: "listStyleType",
                        value: "number",
                      },
                    ]
                  );
                  newBlock.content = [
                    {
                      id: generateBlockId(),
                      style: [],
                      content: previousContent,
                      type: "text",
                      role: "listChild",
                    },
                  ];
                }
              }
              break;
            }
            case "style": {
              if (Array.isArray(execute.args)) {
                if (block.role === "listChild") {
                  const listChildNode = getBlockNode(block.id) as HTMLElement;
                  for (const contentBlock of contents) {
                    if (
                      (listChildNode.parentElement as HTMLElement).id ===
                        contentBlock.id &&
                      Array.isArray(contentBlock.content)
                    ) {
                      const childIndex = contentBlock.content.indexOf(block);
                      contentBlock.content.splice(childIndex, 1, newBlock);
                      contentBlock.style.push(...execute.args);
                    }
                  }
                } else {
                  newBlock.style.push(...execute.args);
                }
              }
              break;
            }
          }
          if (block.role !== "listChild") {
            contents.splice(contents.indexOf(block), 1, newBlock);
          }
          propagateChanges(contents, {
            nodeId: newBlock.id,
            caretOffset,
            nodeIndex,
          });
        }}
      />
    );

    editorNode.addEventListener("mousedown", () => {
      popupRoot.render(<Fragment />);
    });
  }

  function createListHandler(parentBlock: Block, newChildBlock: Block): void {
    if (!Array.isArray(parentBlock.content)) {
      return;
    }
    const parentBlockIndex = contents.indexOf(parentBlock);
    contents[parentBlockIndex] = parentBlock;
    propagateChanges(contents, {
      nodeId: newChildBlock.id,
      caretOffset: 0,
      nodeIndex: 0,
    });
  }

  function deleteListChildHandler(
    parentBlock: Block,
    childBlockIndex: number,
    caretOffset: number,
    childNodeIndex: number
  ): void {
    if (!Array.isArray(parentBlock.content)) {
      return;
    }
    const parentBlockIndex = contents.indexOf(parentBlock);
    contents[parentBlockIndex] = parentBlock;
    propagateChanges(contents, {
      nodeId: parentBlock.content[childBlockIndex].id,
      caretOffset,
      nodeIndex: childNodeIndex,
    });
  }

  function imageRequestHandler(block: Block, file: File): void {
    if (
      block.type !== "image" ||
      block.role !== "image" ||
      typeof block.content !== "object"
    ) {
      return;
    }

    const blockIndex = contents.indexOf(block);
    void onImageSelected(file).then((str) => {
      (block.content as ImageContent).url = str;
      (block.content as ImageContent).height = 300;
      (block.content as ImageContent).width = 500;
      block.id = generateBlockId();
      contents[blockIndex] = block;
      propagateChanges(contents, {
        nodeId: block.id,
        caretOffset: 0,
      });
    });
  }

  function contextMenuHandler(
    block: Block,
    coordinates: Coordinates,
    caretOffset: number
  ): void {
    if (popupRoot === undefined || editorNode === undefined) return;

    const contextMenu: Menu[] = [
      {
        id: generateMenuId(),
        name: "Resize Image",
        icon: <ResizeIcon />,
        allowedOn: ["image"],
        execute: {
          type: "blockFunction",
          args: (block, onComplete, blocks, coordinates) => {
            if (
              (block.type !== "image" &&
                block.role !== "image" &&
                typeof block.content !== "object") ||
              blocks === undefined ||
              coordinates === undefined
            ) {
              return;
            }

            const imageContent = block.content as ImageContent;

            dialogRoot?.render(
              <SizeDialog
                initialSize={{
                  width: imageContent.width,
                  height: imageContent.height,
                }}
                coordinates={coordinates}
                onConfirm={(width, height) => {
                  imageContent.width = width;
                  imageContent.height = height;
                  onComplete(block, block.id);
                }}
                onClose={() => {
                  dialogRoot?.render(<Fragment />);
                }}
              />
            );
          },
        },
      },
      {
        id: generateMenuId(),
        name: "Change Image",
        icon: <ChangeIcon />,
        allowedOn: ["image"],
        execute: {
          type: "blockFunction",
          args: (block, onComplete) => {
            if (
              block.type !== "image" &&
              block.role !== "image" &&
              typeof block.content !== "object"
            ) {
              return;
            }

            const imageContent = block.content as ImageContent;
            imageContent.url = "";
            onComplete(block, block.id);
          },
        },
      },
      {
        id: generateMenuId(),
        name: "Delete",
        icon: <DeleteIcon />,
        execute: {
          type: "blockFunction",
          args: (block, onComplete, blocks) => {
            if (blocks === undefined) return;
            if (blocks.length === 1 && blocks.indexOf(block) === 0) {
              const newBlock: Block = {
                id: generateBlockId(),
                type: "text",
                role: "paragraph",
                content: "",
                style: [],
              };
              blocks.splice(0, 1, newBlock);
              onComplete(blocks, newBlock.id);
              return;
            }
            const targetBlockIndex = contents.indexOf(block);
            blocks.splice(targetBlockIndex, 1);
            onComplete(
              contents,
              blocks.length === 1
                ? blocks[0].id
                : targetBlockIndex - 1 < 0
                ? blocks[targetBlockIndex + 1].id
                : blocks[targetBlockIndex - 1].id
            );
          },
        },
      },
    ];

    const filteredContextMenu = contextMenu.filter((menu) => {
      if (menu.allowedOn === undefined) return true;
      return menu.allowedOn.includes(block.role);
    });

    if (filteredContextMenu.length === 0) return;

    popupRoot.render(
      <ContextMenu
        coordinates={coordinates}
        menu={filteredContextMenu}
        onClose={() => {
          popupRoot.render(<Fragment />);
        }}
        onClick={(execute) => {
          if (
            execute.type === "blockFunction" &&
            typeof execute.args === "function"
          ) {
            execute.args(
              block,
              (updatedBlock, focusBlockId, caretOffset) => {
                let updatedContents: Block[];
                if (Array.isArray(updatedBlock)) {
                  updatedContents = updatedBlock;
                } else {
                  contents[contents.indexOf(updatedBlock)] = updatedBlock;
                  updatedContents = contents;
                }
                propagateChanges(updatedContents, {
                  nodeId: focusBlockId,
                  caretOffset: caretOffset ?? 0,
                });
              },
              contents,
              coordinates,
              caretOffset
            );
          }
        }}
      />
    );

    editorNode.addEventListener(
      "click",
      () => {
        popupRoot.render(<Fragment />);
      },
      {
        once: true,
      }
    );
  }

  function markdownHandler(block: Block, newRole: Role): void {
    const blockIndex = contents.indexOf(block);
    block.role = newRole;
    if (newRole === "numberedList" || newRole === "bulletList") {
      block.type = "list";
      block.content = [
        {
          id: generateBlockId(),
          content: "",
          type: "text",
          role: "listChild",
          style: [],
        },
      ];
    } else {
      block.type = "text";
      contents[blockIndex].content = "";
    }
    contents[blockIndex] = block;
    updateContents(contents);
    setFocusedNode({
      nodeId: block.id,
      caretOffset: 0,
    });
  }

  return (
    <Fragment>
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
        id={`editor-${blob.id}`}
        className={"min-h-screen w-full px-2 pb-60"}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
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
              onCommandKeyPressed={actionKeyHandler}
              onCreateList={createListHandler}
              onListChildDelete={deleteListChildHandler}
              onImageRequest={imageRequestHandler}
              onContextMenu={contextMenuHandler}
              onMarkdown={markdownHandler}
            />
          );
        })}
      </div>
    </Fragment>
  );
}
