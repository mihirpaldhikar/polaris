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

import { type Blob } from "../interfaces";
import { serializeBlockToNode } from "./DOMUtils";

export function serializeBlobToHTML(blob: Blob): string {
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
    const node = serializeBlockToNode(block);
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

export async function serializeFileToBase64(file: File): Promise<string> {
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
