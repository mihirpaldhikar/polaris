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

import { type Attachment, type Blob, type Block } from "../interfaces";
import { isInlineAnnotationsNode } from "./DOMUtils";
import { blockRenderTypeFromRole, nodeTypeFromRole } from "./BlockUtils";
import RenderType from "../enums/RenderType";
import { kebabCase } from "lodash";
import { LINK_ATTRIBUTE } from "../constants";
import { generateGitHubGistURL, getYouTubeVideoID } from "./SharedUtils";

export function serializeBlock(block: Block): HTMLElement | null {
  if (
    window === undefined ||
    document === undefined ||
    window == null ||
    document == null ||
    (blockRenderTypeFromRole(block.role) === RenderType.ATTACHMENT &&
      typeof block.data === "object" &&
      (block.data as Attachment).url === "")
  ) {
    return null;
  }

  let node = document.createElement(nodeTypeFromRole(block.role));
  for (const style of block.style) {
    node.style.setProperty(kebabCase(style.name), kebabCase(style.value));
  }

  if (
    blockRenderTypeFromRole(block.role) === RenderType.TEXT &&
    typeof block.data === "string"
  ) {
    node.id = block.id;
    node.innerHTML = block.data;
    for (const childNode of node.childNodes) {
      if (isInlineAnnotationsNode(childNode)) {
        const element = childNode as HTMLElement;
        if (element.getAttribute(LINK_ATTRIBUTE) !== null) {
          const anchorNode = document.createElement("a");
          anchorNode.href = element.getAttribute(LINK_ATTRIBUTE) as string;
          anchorNode.target = "_blank";
          anchorNode.innerText = element.innerText;
          anchorNode.style.cssText = element.style.cssText;
          node.replaceChild(anchorNode, element);
        }
      }
    }
  } else if (
    blockRenderTypeFromRole(block.role) === RenderType.ATTACHMENT &&
    typeof block.data === "object" &&
    (block.data as Attachment).url !== ""
  ) {
    node = document.createElement("div");
    for (const style of block.style) {
      node.style.setProperty(kebabCase(style.name), kebabCase(style.value));
    }
    node.style.setProperty("width", "100%");
    node.style.setProperty("padding-top", "15px");
    node.style.setProperty("padding-bottom", "15px");
    const childNode = document.createElement("div");
    childNode.style.setProperty("display", "inline-block");
    childNode.style.setProperty("width", "100%");
    const attachment = block.data as Attachment;

    if (block.role === "image") {
      const attachmentNode = document.createElement("img");
      attachmentNode.id = block.id;
      attachmentNode.style.setProperty("display", "inline-block");
      attachmentNode.style.setProperty("border", "none");
      attachmentNode.src = attachment.url;
      attachmentNode.alt = attachment.description;
      attachmentNode.width = attachment.width;
      attachmentNode.height = attachment.height;
      childNode.innerHTML = attachmentNode.outerHTML;
    } else if (block.role === "youtubeVideoEmbed") {
      const attachmentNode = document.createElement("iframe");
      attachmentNode.id = block.id;
      attachmentNode.style.setProperty("display", "inline-block");
      attachmentNode.style.setProperty("border", "none");
      attachmentNode.src = `https://www.youtube.com/embed/${getYouTubeVideoID(
        attachment.url,
      )}`;
      attachmentNode.width = `${attachment.width}px`;
      attachmentNode.height = `${attachment.height}px`;
      childNode.innerHTML = attachmentNode.outerHTML;
    } else if (block.role === "githubGistEmbed") {
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
      const attachmentNode = document.createElement("iframe");
      attachmentNode.id = block.id;
      attachmentNode.style.setProperty("display", "inline-block");
      attachmentNode.style.setProperty("border", "none");
      attachmentNode.width = "100%";
      attachmentNode.style.border = "none";
      attachmentNode.src = gistDocument;
      childNode.innerHTML = attachmentNode.outerHTML;
    }
    node.appendChild(childNode);
  } else if (
    blockRenderTypeFromRole(block.role) === RenderType.LIST &&
    Array.isArray(block.data)
  ) {
    for (let i = 0; i < block.data.length; i++) {
      node.style.setProperty("list-style-position", "outside");
      node.style.setProperty(
        "list-style-type",
        block.role === "numberedList" ? "decimal" : "disc",
      );
      const listNode = document.createElement("li");
      listNode.style.setProperty("margin-left", "3px");
      listNode.style.setProperty("margin-right", "3px");
      const listChild = serializeBlock(block.data[i]);
      if (listChild !== null) {
        listNode.innerHTML = listChild.outerHTML;
      }
      node.appendChild(listNode);
    }
  } else if (block.role === "table") {
    node.id = block.id;
    node.style.setProperty("display", "block");
    node.style.setProperty("table-layout", "auto");
    node.style.setProperty("border-collapse", "collapse");
    node.style.setProperty("overflow-x", "auto");
    const tableData = block.data;
    const tableBody = document.createElement("tbody");
    for (let i = 0; i < tableData.rows.length; i++) {
      const row = document.createElement("tr");
      row.id = tableData.rows[i].id;
      for (let j = 0; j < tableData.rows[i].columns.length; j++) {
        const cell = document.createElement(i === 0 ? "th" : "td");
        cell.id = tableData.rows[i].columns[j].id;
        cell.innerHTML = tableData.rows[i].columns[j].data;
        for (const style of tableData.rows[i].columns[j].style) {
          cell.style.setProperty(kebabCase(style.name), kebabCase(style.value));
        }
        cell.style.setProperty("padding-left", "0.75rem");
        cell.style.setProperty("padding-right", "0.75rem");
        cell.style.setProperty("padding-top", "0.5rem");
        cell.style.setProperty("padding-bottom", "0.5rem");
        cell.style.setProperty("border", "1px solid #d1d5db");
        for (const childNode of cell.childNodes) {
          if (isInlineAnnotationsNode(childNode)) {
            const element = childNode as HTMLElement;
            if (element.getAttribute(LINK_ATTRIBUTE) !== null) {
              const anchorNode = document.createElement("a");
              anchorNode.href = element.getAttribute(LINK_ATTRIBUTE) as string;
              anchorNode.target = "_blank";
              anchorNode.innerText = element.innerText;
              anchorNode.style.cssText = element.style.cssText;
              cell.replaceChild(anchorNode, element);
            }
          }
        }
        row.appendChild(cell);
      }
      tableBody.appendChild(row);
    }
    node.appendChild(tableBody);
  }

  return node;
}

export function serializeBlob(blob: Blob): string {
  if (
    window === undefined ||
    document === undefined ||
    window == null ||
    document == null
  )
    return "";
  const master = document.createElement("html");
  const masterBody = document.createElement("body");
  for (const block of blob.blocks) {
    const node = serializeBlock(block);
    if (node !== null) {
      masterBody.appendChild(node);
    }
  }

  masterBody.append(`
    <script type="text/javascript">
      window.onmessage = function (messageEvent) {
         const height = messageEvent.data.height;
         const gistFrame = document.getElementById(messageEvent.data.id);
         if (gistFrame != null) {
            gistFrame.style.height = height + "px";
         }
      };
    </script>
  `);

  const head = document.createElement("head");
  head.innerHTML = `
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="description" content="${blob.description ?? ""}">
    <meta name="author" content="${blob.author ?? ""}">
    <title>${blob.name ?? ""}</title>
  `;
  master.lang = "en";
  master.appendChild(head);
  master.appendChild(masterBody);
  return "<!doctype html>".concat(
    master.outerHTML.replace(/&[l|g]t;/g, function (c) {
      if (c === "&lt;") {
        return "<";
      } else {
        return ">";
      }
    }),
  );
}

export async function serializeFile(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result?.toString() ?? "");
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}
