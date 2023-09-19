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

import { type JSX } from "react";
import { getYouTubeVideoID } from "../../utils";
import { type Attachment, type Block } from "../../interfaces";
import { BLOCK_NODE } from "../../constants";

interface YouTubeVideoBlockProps {
  block: Block;
  listMetadata?: {
    parent: Block;
    currentIndex: number;
  };
}

export default function YouTubeVideoBlock({
  block,
  listMetadata,
}: YouTubeVideoBlockProps): JSX.Element {
  const attachment = block.data as Attachment;
  return (
    <iframe
      id={block.id}
      data-type={BLOCK_NODE}
      data-parent-block-id={
        listMetadata === undefined ? null : listMetadata.parent.id
      }
      data-child-block-index={
        listMetadata === undefined ? null : listMetadata.currentIndex
      }
      data-block-url={attachment.url}
      width={attachment.width}
      height={attachment.height}
      src={`https://www.youtube.com/embed/${getYouTubeVideoID(attachment.url)}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen={true}
      className={"rounded-md inline-block border border-gray-300"}
    />
  );
}
