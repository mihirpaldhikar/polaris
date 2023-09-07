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
import { type Attachment, type Block } from "../../interfaces";
import { BLOCK_NODE } from "../../constants";
import {
  blockRenderTypeFromRole,
  generateGitHubGistURL,
  getBlockNode,
} from "../../utils";

interface GitHubGistEmbedProps {
  block: Block;
}

export default function GitHubGistEmbed({
  block,
}: GitHubGistEmbedProps): JSX.Element {
  const attachment: Attachment = block.data as Attachment;

  const gistDocument = `
        data:text/html;charset=utf-8,
        <head>
          <base target="_blank" />
          <title></title>
        </head>
        <body onload="adjustFrame()">
          <style>
              * {
                margin: 0;
                padding: 0;
              }
          </style>
          <script src="${generateGitHubGistURL(attachment.url)}"></script>
          <script>
             function adjustFrame() {
                window.top.postMessage("iframe-height:" +document.body.scrollHeight, "*");
             }
          </script>
        </body>
      `;

  return (
    <iframe
      id={block.id}
      data-type={BLOCK_NODE}
      data-block-render-type={blockRenderTypeFromRole(block.role)}
      data-block-url={attachment.url}
      className={"w-full"}
      style={{
        border: 0,
      }}
      src={gistDocument}
      onLoad={() => {
        window.onmessage = function (messageEvent) {
          if (
            typeof messageEvent.data === "string" &&
            messageEvent.data.includes("iframe-height:")
          ) {
            const height = messageEvent.data.replace("iframe-height:", "");
            const gistFrame = getBlockNode(block.id) as HTMLIFrameElement;
            gistFrame.style.height = `${height}px`;
          }
        };
      }}
    ></iframe>
  );
}
