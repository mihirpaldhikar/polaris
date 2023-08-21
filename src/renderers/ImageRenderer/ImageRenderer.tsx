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

import { createElement, type JSX } from "react";
import {
  blockRenderTypeFromRole,
  createNodeFromRole,
  getBlockNode,
  getCaretOffset,
} from "../../utils";
import { BLOCK_NODE } from "../../constants";
import {
  type Block,
  type Coordinates,
  type ImageContent,
} from "../../interfaces";
import { FilePicker } from "../../components/FilePicker";

interface ImageRendererProps {
  block: Block;
  editable: boolean;
  onContextMenu: (
    block: Block,
    coordinates: Coordinates,
    caretOffset: number
  ) => void;
  onImageRequest: (block: Block, file: File) => void;
  onDelete: (
    block: Block,
    previousBlock: Block | Block[],
    nodeId: string,
    nodeIndex: number,
    caretOffset: number
  ) => void;
}

export default function ImageRenderer({
  block,
  editable,
  onContextMenu,
  onImageRequest,
  onDelete,
}: ImageRendererProps): JSX.Element {
  const imageData = block.content as ImageContent;
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
          onDelete(block, block, block.id, 0, 0);
        }}
      />
    );
  }
  return createElement(createNodeFromRole(block.role), {
    "data-type": BLOCK_NODE,
    "data-block-render-type": blockRenderTypeFromRole(block.role),
    id: block.id,
    role: block.role,
    disabled: !editable,
    draggable: false,
    src: imageData.url,
    alt: imageData.description,
    style: {
      height: imageData.height,
      width: imageData.width,
    },
    className: "mx-auto display-block object-center w-full rounded-md",
    onContextMenu: (event: MouseEvent) => {
      event.preventDefault();
      onContextMenu(
        block,
        { x: event.clientX, y: event.clientY },
        getCaretOffset(getBlockNode(block.id))
      );
    },
  });
}
