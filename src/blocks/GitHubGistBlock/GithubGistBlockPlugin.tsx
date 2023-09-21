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
import { GitHubIcon } from "../../assets";
import { generateUUID } from "../../utils";
import GitHubGistBlock from "./GitHubGistBlock";
import { type AttachmentBlockSchema } from "../../schema";

export default class GithubGistBlockPlugin
  implements GenericBlockPlugin<AttachmentBlockSchema>
{
  description: string;
  icon: React.JSX.Element;
  name: string;
  role: string;

  constructor() {
    this.name = "GitHub Gist";
    this.description = "Add a GitHub Gist.";
    this.role = "githubGist";
    this.icon = <GitHubIcon />;
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
        role: "githubGist",
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

  render(
    block: AttachmentBlockSchema,
    lifecycle: BlockLifecycle,
  ): React.JSX.Element {
    return <GitHubGistBlock block={block} blockLifecycle={lifecycle} />;
  }
}
