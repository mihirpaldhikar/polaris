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
  blockRenderTypeFromRole,
  getBlockNode,
  getNodeSiblings,
  nodeTypeFromRole,
  serializeNodeToBlock,
} from "../../utils";
import { type Attachment, type Block } from "../../interfaces";
import { FilePicker } from "../../components/FilePicker";
import { GitHubIcon, ImageIcon, YouTubeIcon } from "../../assets";
import { EmbedPicker } from "../../components/EmbedPicker";
import { AttachmentHolder } from "../../components/AttachmentHolder";
import { YouTubeVideoBlock } from "../YouTubeVideoBlock";
import { AttachmentTools } from "../../assets/tools/AttachmentTools";
import RenderType from "../../enums/RenderType";
import { BLOCK_NODE } from "../../constants";
import { GitHubGistBlock } from "../GitHubGistBlock";

interface AttachmentBlockProps {
  parentBlock?: Block;
  block: Block;
  onAttachmentRequest: (block: Block, data: File | string) => void;
  onDelete: (block: Block, previousBlock: Block, nodeId: string) => void;
  onChange: (block: Block) => void;
}

export default function AttachmentBlock({
  parentBlock,
  block,
  onAttachmentRequest,
  onDelete,
  onChange,
}: AttachmentBlockProps): JSX.Element {
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

        let previousNode: HTMLElement | null;

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

  if (
    attachment.url === "" &&
    (block.role === "youtubeVideoEmbed" || block.role === "githubGistEmbed")
  ) {
    return (
      <EmbedPicker
        id={block.id}
        icon={
          block.role === "youtubeVideoEmbed" ? (
            <YouTubeIcon size={25} />
          ) : (
            <GitHubIcon size={25} />
          )
        }
        message={`Click here to embed ${
          block.role === "youtubeVideoEmbed" ? "a YouTube Video" : "GitHub Gist"
        }.`}
        onEmbedPicked={(url) => {
          attachment.url = url;
          block.data = attachment;
          onChange(block);
        }}
        onDelete={() => {
          deleteHandler();
        }}
      />
    );
  }

  if (block.role === "youtubeVideoEmbed")
    return (
      <AttachmentHolder
        block={block}
        attachmentTools={AttachmentTools}
        onDelete={deleteHandler}
        onChange={onChange}
      >
        <YouTubeVideoBlock block={block} />
      </AttachmentHolder>
    );

  if (block.role === "githubGistEmbed")
    return (
      <AttachmentHolder
        block={block}
        attachmentTools={AttachmentTools}
        onDelete={deleteHandler}
        onChange={onChange}
      >
        <GitHubGistBlock block={block} />
      </AttachmentHolder>
    );

  if (block.role === "image")
    return (
      <AttachmentHolder
        block={block}
        attachmentTools={AttachmentTools}
        onDelete={deleteHandler}
        onChange={onChange}
      >
        {createElement(nodeTypeFromRole(block.role), {
          id: block.id,
          "data-type": BLOCK_NODE,
          "data-block-render-type": blockRenderTypeFromRole(block.role),
          draggable: false,
          src: attachment.url,
          alt: attachment.description,
          height: attachment.height,
          width: attachment.width,
          className: "inline-block rounded-lg border border-gray-300",
        })}
      </AttachmentHolder>
    );

  return <Fragment />;
}
