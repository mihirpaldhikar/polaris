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

import { type ChangeEvent, createElement, type JSX } from "react";
import { blockRenderType, setNodeStyle } from "../../utils";
import { type Block } from "../../interfaces";
import { BLOCK_NODE } from "../../constants";

interface ListChildProps {
  editable: boolean;
  content: Block;
  onClick: (event: MouseEvent) => void;
  onInput: (event: ChangeEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onSelect: (block: Block) => void;
}

export default function ListChild({
  editable,
  content,
  onInput,
  onClick,
  onKeyDown,
  onSelect,
}: ListChildProps): JSX.Element {
  return createElement("li", {
    "data-type": BLOCK_NODE,
    "data-block-render-type": blockRenderType(content.role),
    key: content.id,
    id: content.id,
    className:
      "w-full cursor-text break-words outline-none ring-0 focus:outline-none focus:ring-0",
    disabled: !editable,
    contentEditable: editable,
    style: setNodeStyle(content.style),
    spellCheck: true,
    dangerouslySetInnerHTML: { __html: content.content },
    onInput,
    onClick,
    onKeyDown,
    onMouseUp: () => {
      onSelect(content);
    },
    onContextMenu: (event: MouseEvent) => {
      event.preventDefault();
    },
  });
}
