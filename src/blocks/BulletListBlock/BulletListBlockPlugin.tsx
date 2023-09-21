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
import { BulletListIcon } from "../../assets";
import { generateUUID } from "../../utils";
import BulletListBlock from "./BulletListBlock";
import { type ListBlockSchema } from "../../schema";

export default class BulletListBlockPlugin
  implements GenericBlockPlugin<ListBlockSchema>
{
  description: string;
  icon: React.JSX.Element;
  name: string;
  role: string;

  constructor() {
    this.name = "Bullet List";
    this.description = "Create list with bullets.";
    this.role = "bulletList";
    this.icon = <BulletListIcon />;
  }

  onInitialized(content: string): {
    focusBlockId: string;
    setCaretToStart?: boolean;
    inPlace?: boolean;
    template: ListBlockSchema;
  } {
    const focusId = generateUUID();
    return {
      focusBlockId: focusId,
      inPlace: true,
      setCaretToStart: true,
      template: {
        id: generateUUID(),
        role: "bulletList",
        data: [
          {
            id: focusId,
            data: content,
            role: "paragraph",
            style: [],
          },
        ],
        style: [],
      },
    };
  }

  render(block: ListBlockSchema, lifecycle: BlockLifecycle): React.JSX.Element {
    return <BulletListBlock block={block} blockLifecycle={lifecycle} />;
  }
}
