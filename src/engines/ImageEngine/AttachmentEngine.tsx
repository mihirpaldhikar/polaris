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

import { createElement, Fragment, type JSX, useContext } from "react";
import {
  blockRenderTypeFromRole,
  getBlockNode,
  getEditorRoot,
  getNodeSiblings,
  nodeTypeFromRole,
  serializeNodeToBlock,
  setNodeStyle,
} from "../../utils";
import { BLOCK_NODE } from "../../constants";
import {
  type Attachment,
  type Block,
  type Coordinates,
} from "../../interfaces";
import { FilePicker } from "../../components/FilePicker";
import RenderType from "../../enums/RenderType";
import RootContext from "../../contexts/RootContext/RootContext";
import { ImageIcon, MoreOptionsIcon } from "../../assets";
import { ContextMenu } from "../../components/ContextMenu";
import { AttachmentTools } from "../../assets/tools/AttachmentTools";

interface AttachmentEngineProps {
  parentBlock?: Block;
  block: Block;
  editable: boolean;
  onAttachmentRequest: (block: Block, file: File) => void;
  onDelete: (block: Block, previousBlock: Block, nodeId: string) => void;
  onChange: (block: Block) => void;
}

export default function AttachmentEngine({
  parentBlock,
  block,
  editable,
  onAttachmentRequest,
  onDelete,
  onChange,
}: AttachmentEngineProps): JSX.Element {
  const { popUpRoot, dialogRoot } = useContext(RootContext);

  const attachment: Attachment = block.data as Attachment;

  function deleteHandler(): void {
    if (
      parentBlock !== undefined &&
      blockRenderTypeFromRole(parentBlock.role) === RenderType.LIST &&
      Array.isArray(parentBlock.data)
    ) {
      const currentBlockIndex = parentBlock.data
        .map((blk) => blk.id)
        .indexOf(block.id);
      if (currentBlockIndex !== -1) {
        parentBlock.data.splice(currentBlockIndex, 1);

        let previousNode: HTMLElement | null = null;

        if (currentBlockIndex === 0) {
          const currentNodeSibling = getNodeSiblings(parentBlock.id);
          previousNode = currentNodeSibling.previous;
        } else {
          previousNode = getBlockNode(
            parentBlock.data[currentBlockIndex - 1].id,
          );
        }
        if (previousNode !== null) {
          onDelete(parentBlock, block, previousNode.id);
        }
      }
    } else {
      const currentBlockSibling = getNodeSiblings(block.id);
      if (currentBlockSibling.previous != null) {
        onDelete(
          block,
          serializeNodeToBlock(currentBlockSibling.previous),
          currentBlockSibling.previous.id,
        );
      }
    }
  }

  if (attachment.url === "" && block.role === "image") {
    return (
      <FilePicker
        id={block.id}
        fileIcon={<ImageIcon />}
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
    <div
      className={"m-3 w-full"}
      style={{
        ...setNodeStyle(block.style),
      }}
    >
      <div className={"relative inline-block w-fit"}>
        {block.role === "image" ? (
          createElement(nodeTypeFromRole(block.role), {
            "data-type": BLOCK_NODE,
            "data-block-render-type": blockRenderTypeFromRole(block.role),
            id: block.id,
            role: block.role,
            disabled: !editable,
            draggable: false,
            src: attachment.url,
            alt: attachment.description,
            height: attachment.height,
            width: attachment.width,
            className: "block rounded-md",
          })
        ) : (
          <Fragment />
        )}
        <div
          className={
            "absolute right-0 top-0 m-1 flex w-fit cursor-pointer items-center justify-end rounded-md border border-gray-300 bg-white/60 backdrop-blur"
          }
        >
          <div
            onClick={() => {
              const currentNode = getBlockNode(block.id) as HTMLElement;
              const coordinates: Coordinates = {
                y: currentNode.getBoundingClientRect().y,
                x:
                  window.innerWidth > 500
                    ? currentNode.getBoundingClientRect().right
                    : 30,
              };

              if (popUpRoot !== undefined && dialogRoot !== undefined) {
                const editorRoot = getEditorRoot();
                editorRoot.addEventListener(
                  "click",
                  () => {
                    popUpRoot.render(<Fragment />);
                    dialogRoot.render(<Fragment />);
                  },
                  {
                    once: true,
                  },
                );
                popUpRoot.render(
                  <ContextMenu
                    coordinates={coordinates}
                    menu={AttachmentTools}
                    onClick={(execute) => {
                      if (typeof execute.args === "function") {
                        execute.args(
                          block,
                          onChange,
                          deleteHandler,
                          popUpRoot,
                          dialogRoot,
                        );
                      }
                    }}
                    onClose={() => {
                      popUpRoot.render(<Fragment />);
                    }}
                  />,
                );
              }
            }}
          >
            <MoreOptionsIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
