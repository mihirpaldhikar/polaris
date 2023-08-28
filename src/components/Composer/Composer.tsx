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
import { Canvas } from "../Canvas";
import { type Block } from "../../interfaces";
import { type Content } from "../../types";

interface ComposerProps {
  editable: boolean;
  block: Block;
  onChange: (block: Block) => void;
  onCreate: (
    parentBlock: Block,
    targetBlock: Block,
    creationType: "list" | "nonList"
  ) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    nodeId: string,
    setCursorToStart?: boolean
  ) => void;
  onPaste: (
    block: Block,
    content: Content | Content[],
    caretOffset: number
  ) => void;
  onSelect: (block: Block) => void;
  onCommandKeyPressed: (
    nodeIndex: number,
    block: Block,
    previousContent: Content,
    caretOffset: number
  ) => void;
  onImageRequest: (block: Block, file: File) => void;
  onMarkdown: (block: Block) => void;
}

/**
 * @function Composer
 *
 * @param editable
 * @param actionMenuOpen
 * @param block
 * @param onChange
 * @param onCreate
 * @param onDelete
 * @param onPaste
 *
 * @param onSelect
 * @param onCommandKeyPressed
 * @description Composer is responsible for communicating with sibling blocks and handling events from the Canvas.
 *
 * @author Mihir Paldhikar
 */

export default function Composer({
  editable,
  block,
  onChange,
  onCreate,
  onDelete,
  onPaste,
  onSelect,
  onCommandKeyPressed,
  onImageRequest,
  onMarkdown,
}: ComposerProps): JSX.Element {
  return (
    <Canvas
      editable={editable}
      block={block}
      onChange={onChange}
      onCreate={onCreate}
      onDelete={onDelete}
      onPaste={onPaste}
      onSelect={onSelect}
      onActionKeyPressed={onCommandKeyPressed}
      onImageRequest={onImageRequest}
      onMarkdown={onMarkdown}
    />
  );
}
