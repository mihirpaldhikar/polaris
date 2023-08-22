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
import {
  blockRenderTypeFromRole,
  conditionalClassName,
  nodeTypeFromRole,
  setNodeStyle,
} from "../../utils";
import { BLOCK_NODE } from "../../constants";
import { type Block } from "../../interfaces";
import type RenderType from "../../enums/RenderType";

interface TextRendererProps {
  block: Block;
  editable: boolean;
  onUpdate: (event: ChangeEvent<HTMLElement>, renderType: RenderType) => void;
  onClick: (event: MouseEvent) => void;
  onSelect: (block: Block) => void;
  onKeyPressed: (event: KeyboardEvent, index: number) => void;
}

export default function TextRenderer({
  block,
  editable,
  onUpdate,
  onClick,
  onSelect,
  onKeyPressed,
}: TextRendererProps): JSX.Element {
  return createElement(nodeTypeFromRole(block.role), {
    "data-type": BLOCK_NODE,
    "data-block-render-type": blockRenderTypeFromRole(block.role),
    id: block.id,
    role: block.role,
    disabled: !editable,
    contentEditable: editable,
    dangerouslySetInnerHTML: { __html: block.content },
    style: setNodeStyle(block.style),
    spellCheck: true,
    className: conditionalClassName(
      "focus:outline-none focus:ring-0 outline-none ring-0 w-full cursor-text break-words",
      block.role === "title"
        ? "font-bold text-4xl"
        : block.role === "subTitle"
        ? "font-medium text-[24px]"
        : block.role === "heading"
        ? "font-bold text-[22px]"
        : block.role === "subHeading"
        ? "font-medium text-[19px]"
        : block.role === "quote"
        ? "rounded-md border-l-[6px] border-gray-400 bg-gray-200 p-4"
        : "font-normal text-[17px]"
    ),
    onInput: (event: ChangeEvent<HTMLElement>) => {
      onUpdate(event, blockRenderTypeFromRole(block.role));
    },
    onKeyDown: (event: KeyboardEvent) => {
      onKeyPressed(event, -1);
    },
    onClick,
    onMouseUp: () => {
      onSelect(block);
    },
  });
}
