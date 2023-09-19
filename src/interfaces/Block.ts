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

import type Style from "./Style";
import { type Attachment } from "./index";
import type Table from "./Table";

export interface TextBlock {
  id: string;
  role: "title" | "subTitle" | "heading" | "subHeading" | "paragraph" | "quote";
  data: string;
  style: Style[];
}

export interface AttachmentBlock {
  id: string;
  role: "image" | "youtubeVideoEmbed" | "githubGistEmbed";
  data: Attachment;
  style: Style[];
}

export interface TableBlock {
  id: string;
  role: "table";
  data: Table;
  style: Style[];
}

export interface ListBlock {
  id: string;
  role: "bulletList" | "numberedList";
  data: Block[];
  style: Style[];
}

/**
 * @type Block
 *
 * @description Block is the smallest unit of document which contains all the information required by the parser to render DOM Node.
 *
 * @author Mihir Paldhikar
 */

type Block = TextBlock | AttachmentBlock | TableBlock | ListBlock;

export default Block;
