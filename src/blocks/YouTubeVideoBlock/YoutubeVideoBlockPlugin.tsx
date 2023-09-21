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

import { type BlockLifecycle, type GenericBlockPlugin } from "../../interfaces";
import type React from "react";
import { YouTubeIcon } from "../../assets";
import { generateUUID, getYouTubeVideoID } from "../../utils";
import YouTubeVideoBlock from "./YouTubeVideoBlock";
import { type AttachmentBlockSchema } from "../../schema";
import { kebabCase } from "lodash";

export default class YoutubeVideoBlockPlugin
  implements GenericBlockPlugin<AttachmentBlockSchema>
{
  description: string;
  icon: React.JSX.Element;
  name: string;
  role: string;

  constructor() {
    this.name = "Youtube Video";
    this.description = "Add a YouTube Video.";
    this.role = "youtubeVideo";
    this.icon = <YouTubeIcon />;
  }

  onInitialized(content: string): {
    focusBlockId: string;
    setCaretToStart?: boolean;
    inPlace?: boolean;
    template: AttachmentBlockSchema;
  } {
    const focusId = generateUUID();
    return {
      focusBlockId: focusId,
      inPlace: content.length === 0,
      setCaretToStart: true,
      template: {
        id: focusId,
        role: "youtubeVideo",
        data: {
          url: "",
          description: "",
          width: 500,
          height: 300,
        },
        style: [],
      },
    };
  }

  serializeToHTMLElement(block: AttachmentBlockSchema): HTMLElement {
    const node = document.createElement("div");
    for (const style of block.style) {
      node.style.setProperty(kebabCase(style.name), kebabCase(style.value));
    }
    node.style.setProperty("width", "100%");
    node.style.setProperty("padding-top", "15px");
    node.style.setProperty("padding-bottom", "15px");
    const childNode = document.createElement("div");
    childNode.style.setProperty("display", "inline-block");
    childNode.style.setProperty("width", "100%");
    const attachment = block.data;
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
    node.appendChild(childNode);
    return node;
  }

  render(
    block: AttachmentBlockSchema,
    lifecycle: BlockLifecycle,
  ): React.JSX.Element {
    return <YouTubeVideoBlock block={block} blockLifecycle={lifecycle} />;
  }
}
