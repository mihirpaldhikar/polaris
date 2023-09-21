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
import { generateUUID, nodeTypeFromRole } from "../../utils";
import { type Attachment, type BlockSchema } from "../../interfaces";
import { FilePicker } from "../../components/FilePicker";
import { GitHubIcon, ImageIcon, YouTubeIcon } from "../../assets";
import { EmbedPicker } from "../../components/EmbedPicker";
import { AttachmentHolder } from "../../components/AttachmentHolder";
import { YouTubeVideoBlock } from "../YouTubeVideoBlock";
import { AttachmentActions } from "../../assets/actions/AttachmentActions";
import { GitHubGistBlock } from "../GitHubGistBlock";
import { type AttachmentBlockSchema } from "../../schema";

interface AttachmentBlockProps {
  previousParentBlock: BlockSchema | null;
  block: AttachmentBlockSchema;
  listMetadata?: {
    parent: BlockSchema;
    currentIndex: number;
  };
  onAttachmentRequest: (block: BlockSchema, data: File | string) => void;
  onChange: (block: BlockSchema) => void;
  onDelete: (
    block: BlockSchema,
    previousBlock: BlockSchema,
    nodeId: string,
    setCursorToStart?: boolean,
    holder?: BlockSchema[],
  ) => void;
  onCreate: (
    parentBlock: BlockSchema,
    targetBlock: BlockSchema,
    holder?: BlockSchema[],
    focusOn?: {
      nodeId: string;
      nodeChildIndex?: number;
      caretOffset?: number;
    },
  ) => void;
}

export default function AttachmentBlock({
  block,
  onAttachmentRequest,
  onDelete,
  onChange,
  onCreate,
  previousParentBlock,
  listMetadata,
}: AttachmentBlockProps): JSX.Element {
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

  if (attachment.url === "" && block.role === "image") {
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

  if (
    attachment.url === "" &&
    (block.role === "youtubeVideoEmbed" || block.role === "githubGistEmbed")
  ) {
    return (
      <EmbedPicker
        id={block.id}
        listMetadata={listMetadata}
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
        actions={AttachmentActions}
        onDelete={deleteHandler}
        onChange={onChange}
      >
        <YouTubeVideoBlock block={block} listMetadata={listMetadata} />
      </AttachmentHolder>
    );

  if (block.role === "githubGistEmbed")
    return (
      <AttachmentHolder
        block={block}
        actions={AttachmentActions}
        onDelete={deleteHandler}
        onChange={onChange}
      >
        <GitHubGistBlock block={block} listMetadata={listMetadata} />
      </AttachmentHolder>
    );

  if (block.role === "image")
    return (
      <AttachmentHolder
        block={block}
        actions={AttachmentActions}
        onDelete={deleteHandler}
        onChange={onChange}
      >
        {createElement(nodeTypeFromRole(block.role), {
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

  return <Fragment />;
}
