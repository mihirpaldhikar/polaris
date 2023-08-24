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
import { getBlockNode, setCaretOffset } from "../../utils";
import { type Content } from "../../types";

interface ComposerProps {
  editable: boolean;
  previousBlock: Block | null;
  block: Block;
  nextBlock: Block | null;
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
    childNodeIndex: number,
    caretOffset: number
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
 * @param previousBlock
 * @param block
 * @param nextBlock
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
  previousBlock,
  block,
  nextBlock,
  onChange,
  onCreate,
  onDelete,
  onPaste,
  onSelect,
  onCommandKeyPressed,
  onImageRequest,
  onMarkdown,
}: ComposerProps): JSX.Element {
  function navigationHandler(
    navigate: "up" | "down",
    caretOffset: number
  ): void {
    switch (navigate) {
      case "up": {
        if (previousBlock !== null) {
          const previousNode = getBlockNode(previousBlock.id) as HTMLElement;

          const jumpNode: Node =
            previousNode.lastChild?.textContent != null
              ? previousNode.lastChild.nodeType === Node.TEXT_NODE
                ? (previousNode.lastChild as Node)
                : (previousNode.lastChild.firstChild as Node)
              : previousNode;

          const computedCaretOffset: number =
            caretOffset === -1 ||
            caretOffset >= (jumpNode.textContent?.length as number)
              ? (jumpNode.textContent?.length as number)
              : caretOffset;

          setCaretOffset(jumpNode, computedCaretOffset);
        }
        break;
      }
      case "down": {
        if (nextBlock != null) {
          const nextNode: HTMLElement = getBlockNode(
            nextBlock.id
          ) as HTMLElement;

          const jumpNode: Node =
            nextNode.firstChild?.textContent != null
              ? nextNode.firstChild.nodeType === Node.TEXT_NODE
                ? (nextNode.firstChild as Node)
                : (nextNode.firstChild.firstChild as Node)
              : nextNode;

          const computedCaretOffset: number =
            caretOffset === -1
              ? 0
              : caretOffset >= (jumpNode.textContent?.length as number)
              ? (jumpNode.textContent?.length as number)
              : caretOffset;

          setCaretOffset(jumpNode, computedCaretOffset);
        }
        break;
      }
    }
  }

  return (
    <Canvas
      editable={editable}
      block={block}
      onChange={onChange}
      onCreate={onCreate}
      onDelete={onDelete}
      onNavigate={navigationHandler}
      onPaste={onPaste}
      onSelect={onSelect}
      onActionKeyPressed={onCommandKeyPressed}
      onImageRequest={onImageRequest}
      onMarkdown={onMarkdown}
    />
  );
}
