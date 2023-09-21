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

import { createElement, Fragment, type JSX } from "react";
import {
  type Action,
  type Attachment,
  type BlockLifecycle,
  type BlockSchema,
  type Coordinates,
  type Style,
} from "../../interfaces";
import { generateUUID, getBlockNode } from "../../utils";
import { FilePicker } from "../../components/FilePicker";
import {
  AlignCenterIcon,
  AlignEndIcon,
  AlignStartIcon,
  ChangeIcon,
  DeleteIcon,
  ImageIcon,
  ResizeIcon,
} from "../../assets";
import { AttachmentHolder } from "../../components/AttachmentHolder";
import { SizeDialog } from "../../components/SizeDialog";

interface ImageBlockProps {
  block: BlockSchema;
  blockLifecycle: BlockLifecycle;
}

const imageAttachmentActions: readonly Action[] = [
  {
    id: generateUUID(),
    name: "Align Left",
    icon: <AlignStartIcon size={30} />,
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        const style: Style = {
          name: "text-align",
          value: "left",
        };
        const index = block.style.map((sty) => sty.name).indexOf(style.name);
        if (index === -1) {
          block.style.push(style);
        } else {
          block.style[index] = style;
        }
        onChange(block, block.id);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Align Center",
    icon: <AlignCenterIcon size={30} />,
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        const style: Style = {
          name: "text-align",
          value: "center",
        };
        const index = block.style.map((sty) => sty.name).indexOf(style.name);
        if (index === -1) {
          block.style.push(style);
        } else {
          block.style[index] = style;
        }
        onChange(block, block.id);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Align Right",
    icon: <AlignEndIcon size={30} />,
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        const style: Style = {
          name: "text-align",
          value: "right",
        };
        const index = block.style.map((sty) => sty.name).indexOf(style.name);
        if (index === -1) {
          block.style.push(style);
        } else {
          block.style[index] = style;
        }
        onChange(block, block.id);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Resize",
    icon: <ResizeIcon size={30} />,
    execute: {
      type: "blockFunction",
      args: (block, onChange, _onDelete, _popupRoot, dialogRoot) => {
        if (dialogRoot !== undefined) {
          const currentNode = getBlockNode(block.id) as HTMLElement;
          const coordinates: Coordinates = {
            y: currentNode.getBoundingClientRect().y,
            x: currentNode.getBoundingClientRect().right,
          };

          dialogRoot.render(
            <SizeDialog
              initialSize={{
                width: (block.data as Attachment).width,
                height: (block.data as Attachment).height,
              }}
              coordinates={coordinates}
              onConfirm={(width, height) => {
                (block.data as Attachment).width = width;
                (block.data as Attachment).height = height;
                onChange(block, block.id);
              }}
              onClose={() => {
                dialogRoot.render(<Fragment />);
              }}
            />,
          );
        }
      },
    },
  },
  {
    id: generateUUID(),
    name: "Change",
    icon: <ChangeIcon size={30} />,
    execute: {
      type: "blockFunction",
      args: (block, onChange) => {
        (block.data as Attachment).url = "";
        onChange(block, block.id);
      },
    },
  },
  {
    id: generateUUID(),
    name: "Remove",
    icon: <DeleteIcon size={30} />,
    execute: {
      type: "blockFunction",
      args: (block, _onChange, onDelete) => {
        onDelete(block);
      },
    },
  },
];

export default function ImageBlock({
  block,
  blockLifecycle,
}: ImageBlockProps): JSX.Element {
  if (typeof block.data !== "object") {
    throw new Error(`Invalid schema for block with role '${block.role}'`);
  }
  const {
    previousParentBlock,
    listMetadata,
    onChange,
    onCreate,
    onDelete,
    onAttachmentRequest,
  } = blockLifecycle;
  const attachment: Attachment = block.data;

  function deleteHandler(): void {
    if (listMetadata !== undefined) {
      const listData = listMetadata.parent.data as BlockSchema[];
      listData.splice(listMetadata.currentIndex, 1);
      listMetadata.parent.data = listData;

      if (
        listMetadata.currentIndex === 0 &&
        listData.length > 0 &&
        previousParentBlock != null
      ) {
        onDelete(
          block,
          listData[listMetadata.currentIndex],
          listData[listMetadata.currentIndex].id,
          false,
          listMetadata.parent.data,
        );
      } else if (
        listMetadata.currentIndex === 0 &&
        listData.length === 0 &&
        previousParentBlock != null
      ) {
        onDelete(
          listMetadata.parent,
          previousParentBlock,
          previousParentBlock.id,
        );
      } else if (
        listMetadata.currentIndex === 0 &&
        listData.length === 0 &&
        previousParentBlock == null
      ) {
        const emptyBlock: BlockSchema = {
          id: generateUUID(),
          data: "",
          role: "paragraph",
          style: [],
        };
        onCreate(listMetadata.parent, emptyBlock, undefined, {
          nodeId: emptyBlock.id,
        });
        onDelete(listMetadata.parent, emptyBlock, emptyBlock.id);
      } else {
        onDelete(
          block,
          listData[listMetadata.currentIndex - 1],
          listData[listMetadata.currentIndex - 1].id,
          false,
          listMetadata.parent.data,
        );
      }
      return;
    }

    if (previousParentBlock == null) {
      const emptyBlock: BlockSchema = {
        id: generateUUID(),
        data: "",
        role: "paragraph",
        style: [],
      };
      onCreate(block, emptyBlock, undefined, {
        nodeId: emptyBlock.id,
      });
      onDelete(block, emptyBlock, emptyBlock.id, true);
      return;
    }

    onDelete(block, previousParentBlock, previousParentBlock.id);
  }

  if (attachment.url === "") {
    return (
      <FilePicker
        id={block.id}
        fileIcon={<ImageIcon />}
        listMetadata={listMetadata}
        message={"Drag or click here to add an image."}
        accept={"image/png, image/jpg, image/jpeg, image/svg+xml, image/gif"}
        onFilePicked={(file) => {
          onAttachmentRequest(block, file);
        }}
        onDelete={() => {
          deleteHandler();
        }}
      />
    );
  }

  return (
    <AttachmentHolder
      block={block}
      actions={imageAttachmentActions}
      onDelete={deleteHandler}
      onChange={onChange}
    >
      {createElement("img", {
        id: block.id,
        "data-parent-block-id":
          listMetadata === undefined ? null : listMetadata.parent.id,
        "data-child-block-index":
          listMetadata === undefined ? null : listMetadata.currentIndex,
        draggable: false,
        src: attachment.url,
        alt: attachment.description,
        height: attachment.height,
        width: attachment.width,
        className: "inline-block rounded-lg border border-gray-300",
      })}
    </AttachmentHolder>
  );
}
