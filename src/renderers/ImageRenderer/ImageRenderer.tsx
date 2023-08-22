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
  type Block,
  type Coordinates,
  type ImageContent,
} from "../../interfaces";
import { FilePicker } from "../../components/FilePicker";
import RenderType from "../../enums/RenderType";
import {
  AlignCenterIcon,
  AlignEndIcon,
  AlignStartIcon,
  ChangeIcon,
  DeleteIcon,
  ResizeIcon,
} from "../../assets/icons";
import RootContext from "../../contexts/RootContext/RootContext";
import { SizeDialog } from "../../components/SizeDialog";

interface ImageRendererProps {
  parentBlock?: Block;
  block: Block;
  editable: boolean;
  onImageRequest: (block: Block, file: File) => void;
  onDelete: (
    block: Block,
    previousBlock: Block | Block[],
    nodeId: string,
    nodeIndex: number,
    caretOffset: number
  ) => void;
  onChange: (block: Block) => void;
}

export default function ImageRenderer({
  parentBlock,
  block,
  editable,
  onImageRequest,
  onDelete,
  onChange,
}: ImageRendererProps): JSX.Element {
  const { popUpRoot } = useContext(RootContext);

  const imageData = block.content as ImageContent;

  function deleteHandler(): void {
    if (
      parentBlock !== undefined &&
      blockRenderTypeFromRole(parentBlock.role) === RenderType.LIST &&
      Array.isArray(parentBlock.content)
    ) {
      const currentBlockIndex = parentBlock.content
        .map((blk) => blk.id)
        .indexOf(block.id);
      if (currentBlockIndex !== -1) {
        parentBlock.content.splice(currentBlockIndex, 1);

        let previousNode: HTMLElement | null = null;

        if (currentBlockIndex === 0) {
          const currentNodeSibling = getNodeSiblings(parentBlock.id);
          previousNode = currentNodeSibling.previous;
        } else {
          previousNode = getBlockNode(
            parentBlock.content[currentBlockIndex - 1].id
          );
        }
        if (previousNode !== null) {
          const previousBlockLastChildNodeIndex =
            previousNode?.lastChild?.textContent === ""
              ? previousNode.childNodes.length - 2
              : previousNode.childNodes.length - 1;

          const computedCaretOffset =
            previousNode.childNodes[previousBlockLastChildNodeIndex] != null
              ? previousNode.childNodes[previousBlockLastChildNodeIndex]
                  .nodeType === Node.ELEMENT_NODE
                ? (
                    previousNode.childNodes[previousBlockLastChildNodeIndex]
                      .textContent as string
                  ).length
                : previousNode.childNodes[previousBlockLastChildNodeIndex]
                    .textContent?.length ?? previousNode.innerText.length
              : previousNode.innerText.length;

          onDelete(
            parentBlock,
            block,
            previousNode.id,
            previousBlockLastChildNodeIndex,
            computedCaretOffset
          );
        }
      }
    } else {
      const currentBlockSibling = getNodeSiblings(block.id);
      if (currentBlockSibling.previous != null) {
        const previousBlockLastChildNodeIndex =
          currentBlockSibling.previous?.lastChild?.textContent === ""
            ? currentBlockSibling.previous.childNodes.length - 2
            : currentBlockSibling.previous.childNodes.length - 1;

        const computedCaretOffset =
          currentBlockSibling.previous.childNodes[
            previousBlockLastChildNodeIndex
          ] != null
            ? currentBlockSibling.previous.childNodes[
                previousBlockLastChildNodeIndex
              ].nodeType === Node.ELEMENT_NODE
              ? (
                  currentBlockSibling.previous.childNodes[
                    previousBlockLastChildNodeIndex
                  ].textContent as string
                ).length
              : currentBlockSibling.previous.childNodes[
                  previousBlockLastChildNodeIndex
                ].textContent?.length ??
                currentBlockSibling.previous.innerText.length
            : currentBlockSibling.previous.innerText.length;

        onDelete(
          block,
          serializeNodeToBlock(currentBlockSibling.previous),
          currentBlockSibling.previous.id,
          previousBlockLastChildNodeIndex,
          computedCaretOffset
        );
      }
    }
  }

  if (imageData.url === "") {
    return (
      <FilePicker
        id={block.id}
        message={"Drag or click here to add an image."}
        accept={"image/png, image/jpg, image/jpeg, image/svg+xml, image/gif"}
        onFilePicked={(file) => {
          onImageRequest(block, file);
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
        {createElement(nodeTypeFromRole(block.role), {
          "data-type": BLOCK_NODE,
          "data-block-render-type": blockRenderTypeFromRole(block.role),
          id: block.id,
          role: block.role,
          disabled: !editable,
          draggable: false,
          src: imageData.url,
          alt: imageData.description,
          height: imageData.height,
          width: imageData.width,
          className: "inline-block rounded-md",
        })}
        <div
          className={
            "absolute right-0 top-0 m-1 flex w-fit cursor-pointer items-center justify-end rounded-md border border-gray-300 bg-white/60 p-0.5 backdrop-blur"
          }
        >
          <div
            title={"Align Left"}
            onClick={() => {
              block.style.push({
                name: "text-align",
                value: "left",
              });
              onChange(block);
            }}
          >
            <AlignStartIcon size={30} />
          </div>
          <div
            title={"Align Center"}
            onClick={() => {
              block.style.push({
                name: "text-align",
                value: "center",
              });
              onChange(block);
            }}
          >
            <AlignCenterIcon size={30} />
          </div>
          <div
            title={"Align Right"}
            onClick={() => {
              block.style.push({
                name: "text-align",
                value: "right",
              });
              onChange(block);
            }}
          >
            <AlignEndIcon size={30} />
          </div>
          <div
            title={"Resize Image"}
            onClick={() => {
              if (popUpRoot !== undefined) {
                const editorRoot = getEditorRoot();
                const currentNode = getBlockNode(block.id) as HTMLElement;
                const coordinates: Coordinates = {
                  x:
                    currentNode.getBoundingClientRect().x +
                    currentNode.getBoundingClientRect().width / 2,
                  y: currentNode.getBoundingClientRect().y + 20,
                };

                editorRoot.addEventListener(
                  "click",
                  () => {
                    popUpRoot.render(<Fragment />);
                  },
                  {
                    once: true,
                  }
                );

                popUpRoot.render(
                  <SizeDialog
                    initialSize={{
                      width: (block.content as ImageContent).width,
                      height: (block.content as ImageContent).height,
                    }}
                    coordinates={coordinates}
                    onConfirm={(width, height) => {
                      (block.content as ImageContent).width = width;
                      (block.content as ImageContent).height = height;
                      onChange(block);
                    }}
                    onClose={() => {
                      popUpRoot.render(<Fragment />);
                    }}
                  />
                );
              }
            }}
          >
            <ResizeIcon size={30} />
          </div>
          <div
            title={"Change Image"}
            onClick={() => {
              (block.content as ImageContent).url = "";
              (block.content as ImageContent).description = "";
              onChange(block);
            }}
          >
            <ChangeIcon size={30} />
          </div>
          <div
            title={"Remove Image"}
            onClick={() => {
              deleteHandler();
            }}
          >
            <DeleteIcon size={30} />
          </div>
        </div>
      </div>
    </div>
  );
}
