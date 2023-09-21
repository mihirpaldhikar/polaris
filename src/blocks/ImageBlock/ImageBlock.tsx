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
import { type Attachment, type BlockSchema } from "../../interfaces";
import { type AttachmentBlockSchema } from "../../schema";

interface ImageBlockProps {
  block: AttachmentBlockSchema;
  listMetadata?: {
    parent: BlockSchema;
    currentIndex: number;
  };
}

export default function ImageBlock({
  block,
  listMetadata,
}: ImageBlockProps): JSX.Element {
  const attachment: Attachment = block.data;
  return createElement("img", {
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
  });
}
