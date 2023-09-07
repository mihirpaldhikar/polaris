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

import { type ChangeEvent, createElement, type JSX, useContext } from "react";
import {
  blockRenderTypeFromRole,
  conditionalClassName,
  getConfigFromRole,
  getPlaceholderFromRole,
  nodeTypeFromRole,
  setNodeStyle,
} from "../../utils";
import { BLOCK_NODE } from "../../constants";
import { type Block } from "../../interfaces";
import type RenderType from "../../enums/RenderType";
import RootContext from "../../contexts/RootContext/RootContext";
import { TextBlockConfig } from "../../interfaces/PolarisConfig";

interface TextEngineProps {
  block: Block;
  editable: boolean;
  onUpdate: (event: ChangeEvent<HTMLElement>, renderType: RenderType) => void;
  onClick: (event: MouseEvent) => void;
  onSelect: (block: Block) => void;
  onKeyPressed: (event: KeyboardEvent, index: number) => void;
}

export default function TextEngine({
  block,
  editable,
  onUpdate,
  onClick,
  onSelect,
  onKeyPressed,
}: TextEngineProps): JSX.Element {
  const { config } = useContext(RootContext);
  return createElement(nodeTypeFromRole(block.role), {
    "data-type": BLOCK_NODE,
    "data-block-render-type": blockRenderTypeFromRole(block.role),
    id: block.id,
    disabled: !editable,
    contentEditable: editable,
    dangerouslySetInnerHTML: { __html: block.data },
    style: {
      fontSize: `${
        (getConfigFromRole(block.role, config) as TextBlockConfig).fontSize
      }rem`,
      lineHeight: `${
        (getConfigFromRole(block.role, config) as TextBlockConfig).lineHeight
      }rem`,
      ...setNodeStyle(block.style),
    },
    placeholder: getPlaceholderFromRole(block.role),
    spellCheck: true,
    className: conditionalClassName(
      "text_renderer block flex-1 overflow-hidden focus:outline-none focus:ring-0 outline-none ring-0 cursor-text break-words",
      block.role === "quote"
        ? `rounded-md font-medium border-l-[8px] border-gray-300 bg-gray-100 p-4`
        : "",
    ),
    onInput: (event: ChangeEvent<HTMLElement>) => {
      onUpdate(event, blockRenderTypeFromRole(block.role));
    },
    onKeyDown: (event: KeyboardEvent) => {
      onKeyPressed(event, -1);
    },
    onClick,
    onSelect: () => {
      if (window.getSelection()?.toString().length !== 0) {
        onSelect(block);
      }
    },
  });
}
