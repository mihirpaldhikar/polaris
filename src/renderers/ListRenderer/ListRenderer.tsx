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

import { type ChangeEvent, createElement, Fragment, type JSX } from "react";
import {
  blockRenderType,
  conditionalClassName,
  createNodeFromRole,
  getBlockNode,
  getCaretOffset,
  setNodeStyle,
} from "../../utils";
import { BLOCK_NODE } from "../../constants";
import { type Block, type Coordinates } from "../../interfaces";
import RenderType from "../../enums/RenderType";
import { ListChild } from "../../components/ListChild";

interface ListRendererProps {
  block: Block;
  editable: boolean;
  onContextMenu: (
    block: Block,
    coordinates: Coordinates,
    caretOffset: number
  ) => void;
  onClick: (event: MouseEvent) => void;
  onUpdate: (
    event: ChangeEvent<HTMLElement>,
    renderType: RenderType,
    childBlock: Block
  ) => void;
  onSelect: (block: Block) => void;
  onKeyPressed: (event: KeyboardEvent, index: number) => void;
}

export default function ListRenderer({
  block,
  editable,
  onContextMenu,
  onClick,
  onUpdate,
  onSelect,
  onKeyPressed,
}: ListRendererProps): JSX.Element {
  if (!Array.isArray(block.content)) return <Fragment />;
  return createElement(
    createNodeFromRole(block.role),
    {
      "data-type": BLOCK_NODE,
      "data-block-render-type": blockRenderType(block.role),
      id: block.id,
      role: block.role,
      disabled: !editable,
      style: setNodeStyle(block.style),
      spellCheck: true,
      className: conditionalClassName(
        "px-4 space-y-2 text-[17px] my-1",
        block.role === "numberedList" ? "list-decimal" : "list-disc"
      ),
      onContextMenu: (event: MouseEvent) => {
        event.preventDefault();
        onContextMenu(
          block,
          { x: event.clientX, y: event.clientY },
          getCaretOffset(getBlockNode(block.id))
        );
      },
    },
    block.content.map((content, index) => {
      if (
        blockRenderType(content.role) === RenderType.TEXT &&
        content.role === "listChild" &&
        typeof content.content === "string"
      ) {
        return (
          <ListChild
            key={content.id}
            editable={editable}
            content={content}
            onClick={onClick}
            onInput={(event) => {
              onUpdate(event, blockRenderType(block.role), content);
            }}
            onSelect={() => {
              onSelect(content);
            }}
            onKeyDown={(event) => {
              onKeyPressed(event, index);
            }}
          />
        );
      }
      return <Fragment key={content.id} />;
    })
  );
}
