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
  BlockquoteIcon,
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  ParagraphIcon,
  SubHeadingIcon,
  SubTitleIcon,
  TextBackgroundColorIcon,
  TextColorIcon,
  TextSizeIcon,
  TitleIcon,
  UnderlineIcon,
  UnorderedListIcon,
} from "../../icons";
import {
  LINK_ATTRIBUTE,
  REMOVE_COLOR,
  REMOVE_LINK,
  REMOVE_STYLE,
} from "../../constants";
import { ActionMenu } from "../ActionMenu";
import { actionMenuClosedEvent, actionMenuOpenedEvent } from "../../events";

interface WorkspaceProps {
  editable?: boolean;
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
  editable = true,
  blob,
  autoSaveTimeout,
  selectionMenu,
  onSave,
}: WorkspaceProps): JSX.Element {
  const [contents, updateContents] = useState<Block[]>(
    blob.contents.map((block) => {
      if (
        block.role === "blockquote" &&
        (block.style.length === 0 ||
          !block.style.every(
            (style) =>
              style.name === "backgroundColor" ||
              style.name === "padding" ||
              style.name === "borderTopRightRadius" ||
              style.name === "borderBottomRightRadius" ||
              style.name === "borderLeft"
          ))
      ) {
        block.style.push(
          ...[
            {
              name: "backgroundColor",
              value: "#f8f5f5",
            },
            {
              name: "borderLeft",
              value: "6px solid #ccc",
            },
            {
              name: "padding",
              value: "15px",
            },
            {
              name: "borderTopRightRadius",
              value: "8px",
            },
            {
              name: "borderBottomRightRadius",
              value: "8px",
            },
          ]
        );
      } else if (
        block.role === "unorderedList" &&
        (block.style.length === 0 ||
          !block.style.every((style) => style.name === "listStyleType"))
      ) {
        block.style.push(
          ...[
            {
              name: "listStyleType",
              value: "disc",
            },
          ]
        );
      } else if (
        block.role === "orderedList" &&
        (block.style.length === 0 ||
          !block.style.every((style) => style.name === "listStyleType"))
      ) {
        block.style.push(
          ...[
            {
              name: "listStyleType",
              value: "decimal",
            },
          ]
        );
      }
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

  const [popupRoot, setPopupRoot] = useState<Root>();

  useEffect(() => {
    setPopupRoot(
      createRoot(document.getElementById(`popup-${blob.id}`) as HTMLElement)
    );
    return () => {
      setPopupRoot(undefined);
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
      updateContents(contents);

      const pasteContentLength = normalizeContent(
        pasteBlocks[pasteBlocks.length - 1].content as string
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
      contents[blockIndex].content = (contents[blockIndex].content as string)
        .substring(0, caretOffset)
        .concat(content)
        .concat(
          (contents[blockIndex].content as string).substring(caretOffset)
        );

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
        allowedOn: [
          "subTitle",
          "heading",
          "subHeading",
          "paragraph",
          "blockquote",
        ],
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
        allowedOn: [
          "title",
          "heading",
          "subHeading",
          "paragraph",
          "blockquote",
        ],
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
        allowedOn: [
          "title",
          "subTitle",
          "subHeading",
          "paragraph",
          "blockquote",
        ],
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
        allowedOn: ["title", "subTitle", "heading", "paragraph", "blockquote"],
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
        allowedOn: ["title", "subTitle", "heading", "subHeading", "blockquote"],
        execute: {
          type: "role",
          args: "paragraph",
        },
      },
      {
        id: generateMenuId(),
        name: "Blockquote",
        description: `Change ${block.role} to Blockquote`,
        icon: <BlockquoteIcon />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "blockquote",
        },
      },
      {
        id: generateMenuId(),
        name: "Unordered List",
        description: `Change ${block.role} to Unordered List`,
        icon: <UnorderedListIcon />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "unorderedList",
        },
      },
      {
        id: generateMenuId(),
        name: "Ordered List",
        description: `Change ${block.role} to Ordered List`,
        icon: <OrderedListIcon />,
        allowedOn: ["paragraph"],
        execute: {
          type: "role",
          args: "orderedList",
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
          "orderedList",
          "unorderedList",
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
          "orderedList",
          "unorderedList",
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
          "orderedList",
          "unorderedList",
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
      popupRoot === undefined
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
      reference: createRef(),
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
                if (newBlock.role === "orderedList") {
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
                } else if (newBlock.role === "unorderedList") {
                  newBlock.type = "list";
                  newBlock.style.push(
                    ...[
                      {
                        name: "listStyleType",
                        value: "disc",
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
                } else if (newBlock.role === "blockquote") {
                  newBlock.style.push(
                    ...[
                      {
                        name: "backgroundColor",
                        value: "#f8f5f5",
                      },
                      {
                        name: "borderLeft",
                        value: "6px solid #ccc",
                      },
                      {
                        name: "padding",
                        value: "15px",
                      },
                      {
                        name: "borderTopRightRadius",
                        value: "8px",
                      },
                      {
                        name: "borderBottomRightRadius",
                        value: "8px",
                      },
                    ]
                  );
                } else {
                  newBlock.style = newBlock.style.filter((style) => {
                    return !(
                      style.name === "backgroundColor" ||
                      style.name === "padding" ||
                      style.name === "borderTopRightRadius" ||
                      style.name === "borderBottomRightRadius" ||
                      style.name === "borderLeft" ||
                      style.name === "listStyleType"
                    );
                  });
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
          updateContents(contents);
          setFocusedNode({
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
    updateContents(contents);
    setFocusedNode({
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
    updateContents(contents);
    setFocusedNode({
      nodeId: parentBlock.content[childBlockIndex].id,
      caretOffset,
      nodeIndex: childNodeIndex,
    });
  }

  return (
    <Fragment>
      <div
        id={`popup-${blob.id}`}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      ></div>
      <div
        id={`dialog-${blob.id}`}
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
            />
          );
        })}
      </div>
    </Fragment>
  );
}
