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
import {
  type Action,
  type Attachment,
  type BlockLifecycle,
  type BlockSchema,
} from "../../interfaces";
import { generateGitHubGistURL, generateUUID } from "../../utils";
import { ChangeIcon, DeleteIcon, GitHubIcon } from "../../assets";
import { EmbedPicker } from "../../components/EmbedPicker";
import { AttachmentHolder } from "../../components/AttachmentHolder";
import { type AttachmentBlockSchema } from "../../schema";
import { GitHubGistURLRegex } from "../../constants";

interface GitHubGistBlockProps {
  block: AttachmentBlockSchema;
  blockLifecycle: BlockLifecycle;
}

const githubGistAttachmentActions: readonly Action[] = [
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

export default function GitHubGistBlock({
  block,
  blockLifecycle,
}: GitHubGistBlockProps): JSX.Element {
  const { previousParentBlock, listMetadata, onChange, onCreate, onDelete } =
    blockLifecycle;
  const attachment: Attachment = block.data;

  const gistDocument = `
   data:text/html;charset=utf-8,
   <head>
     <base target="_blank" />
     <title></title>
   </head>
   <body id="gist-${block.id}" onload="adjustFrame()">
     <style>
       * {
         margin: 0;
         padding: 0;
       }
     </style>
     <script src="${generateGitHubGistURL(attachment.url)}"></script>
     <script>
       function adjustFrame() {
         window.top.postMessage({
           height: document.body.scrollHeight,
           id: document.body.id.replace("gist-", "") 
         }, "*");
       }
     </script>
   </body>
      `;

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
      <EmbedPicker
        id={block.id}
        listMetadata={listMetadata}
        icon={<GitHubIcon size={25} />}
        message={"Click here to embed GitHub Gist"}
        regex={GitHubGistURLRegex}
        onEmbedPicked={(url) => {
          attachment.url = url;
          block.data = attachment;
          onChange(block, true);
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
      actions={githubGistAttachmentActions}
      onDelete={deleteHandler}
      onChange={onChange}
    >
      <iframe
        id={block.id}
        data-parent-block-id={
          listMetadata === undefined ? null : listMetadata.parent.id
        }
        data-child-block-index={
          listMetadata === undefined ? null : listMetadata.currentIndex
        }
        data-block-url={attachment.url}
        className={"w-full"}
        style={{
          border: 0,
        }}
        src={gistDocument}
        onLoad={() => {
          window.onmessage = function (messageEvent) {
            if (typeof messageEvent.data === "object") {
              const height = messageEvent.data.height as number;
              const gistFrame = document.getElementById(messageEvent.data.id);
              if (gistFrame != null) {
                gistFrame.style.height = `${height}px`;
              }
            }
          };
        }}
      ></iframe>
    </AttachmentHolder>
  );
}
