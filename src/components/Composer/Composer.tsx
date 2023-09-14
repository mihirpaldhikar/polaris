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

import { createElement, type JSX, useContext } from "react";
import { type Block } from "../../interfaces";
import {
  blockRenderTypeFromRole,
  conditionalClassName,
  getConfigFromRole,
  nodeTypeFromRole,
  openLinkInNewTab,
  setNodeStyle,
} from "../../utils";
import RenderType from "../../enums/RenderType";
import { AttachmentBlock, TableBlock, TextBlock } from "../../blocks";
import { BLOCK_NODE } from "../../constants";
import RootContext from "../../contexts/RootContext/RootContext";
import { type AttachmentBlockConfig } from "../../interfaces/PolarisConfig";

interface ComposerProps {
  editable: boolean;
  parentBlock?: Block;
  block: Block;
  onChange: (block: Block, focus?: boolean) => void;
  onCreate: (
    parentBlock: Block,
    targetBlock: Block,
    creationType: "list" | "nonList",
  ) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    nodeId: string,
    setCursorToStart?: boolean,
  ) => void;
  onPaste: (block: Block, data: string | string[], caretOffset: number) => void;
  onSelect: (block: Block) => void;
  onAttachmentRequest: (block: Block, data: File | string) => void;
  onMarkdown: (block: Block) => void;
}

/**
 * @function Composer
 *
 * @param editable
 * @param block
 * @param onChange
 * @param onEnter
 * @param onDelete
 * @param onPaste
 * @param onSelect
 * @returns JSX.Element
 *
 * @description Composer is responsible for rendering the Node from the Block. It also manages and updates the content of the block when the Node is mutated.
 *
 * @author Mihir Paldhikar
 */

export default function Composer({
  editable,
  parentBlock,
  block,
  onChange,
  onCreate,
  onDelete,
  onPaste,
  onSelect,
  onAttachmentRequest,
  onMarkdown,
}: ComposerProps): JSX.Element {
  const { config } = useContext(RootContext);

  if (blockRenderTypeFromRole(block.role) === RenderType.TEXT) {
    return (
      <TextBlock
        parentBlock={parentBlock}
        block={block}
        editable={editable}
        onChange={onChange}
        onClick={openLinkInNewTab}
        onSelect={onSelect}
        onDelete={onDelete}
        onCreate={onCreate}
        onMarkdown={onMarkdown}
      />
    );
  }

  if (blockRenderTypeFromRole(block.role) === RenderType.ATTACHMENT) {
    return (
      <AttachmentBlock
        parentBlock={parentBlock}
        block={block}
        onChange={onChange}
        onAttachmentRequest={onAttachmentRequest}
        onDelete={onDelete}
      />
    );
  }

  if (blockRenderTypeFromRole(block.role) === RenderType.TABLE) {
    return (
      <TableBlock
        parentBlock={parentBlock}
        block={block}
        editable={editable}
        onChange={onChange}
        onClick={openLinkInNewTab}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );
  }

  if (
    blockRenderTypeFromRole(block.role) === RenderType.LIST &&
    Array.isArray(block.data)
  ) {
    return createElement(
      nodeTypeFromRole(block.role),
      {
        "data-type": BLOCK_NODE,
        "data-block-render-type": blockRenderTypeFromRole(block.role),
        id: block.id,
        disabled: !editable,
        style: setNodeStyle(block.style),
        spellCheck: true,
        className: conditionalClassName(
          `my-4 ml-4 pl-4 block`,
          block.role === "numberedList" ? "list-decimal" : "list-disc",
        ),
      },
      block.data.map((childBlock) => {
        return (
          <li
            key={childBlock.id}
            className={"pl-2"}
            style={{
              marginTop: `${
                (getConfigFromRole(block.role, config) as AttachmentBlockConfig)
                  .spacing
              }rem`,
            }}
          >
            <Composer
              parentBlock={block}
              editable={editable}
              block={childBlock}
              onChange={onChange}
              onCreate={onCreate}
              onDelete={onDelete}
              onPaste={onPaste}
              onSelect={onSelect}
              onAttachmentRequest={onAttachmentRequest}
              onMarkdown={onMarkdown}
            />
          </li>
        );
      }),
    );
  }

  throw Error(`Block with role '${block.role}' is not a valid block.`);
}
