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

import { type BlockSchema } from "./index";

interface BlockLifecycle {
  editable: boolean;
  previousParentBlock: BlockSchema | null;
  listMetadata?: {
    parent: BlockSchema;
    currentIndex: number;
  };
  onChange: (block: BlockSchema, focus?: boolean) => void;
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
  onDelete: (
    block: BlockSchema,
    previousBlock: BlockSchema,
    nodeId: string,
    setCursorToStart?: boolean,
    holder?: BlockSchema[],
  ) => void;
  onSelect: (block: BlockSchema) => void;
  onAttachmentRequest: (block: BlockSchema, data: File | string) => void;
  onMarkdown: (block: BlockSchema, focusBlockId?: string) => void;
}

export default BlockLifecycle;
