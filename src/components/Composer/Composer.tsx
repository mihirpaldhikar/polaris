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

import { createElement, Fragment, type JSX, useContext } from "react";
import { type BlockSchema } from "../../interfaces";
import {
  conditionalClassName,
  getConfigFromRole,
  nodeTypeFromRole,
  openLinkInNewTab,
  setNodeStyle,
} from "../../utils";
import {
  GitHubGistBlock,
  ImageBlock,
  TableBlock,
  TextBlock,
  YouTubeVideoBlock,
} from "../../blocks";
import RootContext from "../../contexts/RootContext/RootContext";
import { type AttachmentBlockConfig } from "../../interfaces/PolarisConfig";
import { type TableBlockSchema, type TextBlockSchema } from "../../schema";

interface ComposerProps {
  editable: boolean;
  previousParentBlock: BlockSchema | null;
  block: BlockSchema;
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

/**
 * @function Composer
 *
 * @param editable
 * @param block
 * @param onChange
 * @param onEnter
 * @param onDelete
 * @param onSelect
 * @returns JSX.Element
 *
 * @description Composer is responsible for rendering the Node from the BlockSchema. It also manages and updates the content of the block when the Node is mutated.
 *
 * @author Mihir Paldhikar
 */

export default function Composer({
  editable,
  previousParentBlock,
  listMetadata,
  block,
  onChange,
  onCreate,
  onDelete,
  onSelect,
  onAttachmentRequest,
  onMarkdown,
}: ComposerProps): JSX.Element {
  const { config } = useContext(RootContext);

  if (
    block.role === "title" ||
    block.role === "subTitle" ||
    block.role === "heading" ||
    block.role === "subHeading" ||
    block.role === "paragraph" ||
    block.role === "quote"
  ) {
    return (
      <TextBlock
        listMetadata={listMetadata}
        previousParentBlock={previousParentBlock}
        block={block as TextBlockSchema}
        editable={editable}
        onChange={onChange}
        onClick={openLinkInNewTab}
        onSelect={onSelect}
        onDelete={onDelete}
        onCreate={onCreate}
        onMarkdown={onMarkdown}
      />
    );
  } else if (block.role === "image") {
    return (
      <ImageBlock
        block={block}
        previousParentBlock={previousParentBlock}
        listMetadata={listMetadata}
        onCreate={onCreate}
        onChange={onChange}
        onAttachmentRequest={onAttachmentRequest}
        onDelete={onDelete}
      />
    );
  } else if (block.role === "youtubeVideoEmbed") {
    return (
      <YouTubeVideoBlock
        block={block}
        previousParentBlock={previousParentBlock}
        listMetadata={listMetadata}
        onCreate={onCreate}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  } else if (block.role === "githubGistEmbed") {
    return (
      <GitHubGistBlock
        block={block}
        previousParentBlock={previousParentBlock}
        listMetadata={listMetadata}
        onCreate={onCreate}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  } else if (block.role === "table") {
    return (
      <TableBlock
        block={block as TableBlockSchema}
        previousParentBlock={previousParentBlock}
        listMetadata={listMetadata}
        editable={editable}
        onChange={onChange}
        onClick={openLinkInNewTab}
        onSelect={onSelect}
        onDelete={onDelete}
        onCreate={onCreate}
      />
    );
  } else if (Array.isArray(block.data)) {
    return createElement(
      nodeTypeFromRole(block.role),
      {
        id: block.id,
        disabled: !editable,
        style: setNodeStyle(block.style),
        spellCheck: true,
        className: conditionalClassName(
          `my-4 ml-4 pl-4 block`,
          block.role === "numberedList" ? "list-decimal" : "list-disc",
        ),
      },
      block.data.map((childBlock: BlockSchema, index) => {
        if (childBlock.role.toLowerCase().includes("list")) {
          return <Fragment key={childBlock.id} />;
        }
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
              listMetadata={{
                parent: block,
                currentIndex: index,
              }}
              previousParentBlock={previousParentBlock}
              editable={editable}
              block={childBlock}
              onChange={onChange}
              onCreate={onCreate}
              onDelete={onDelete}
              onSelect={onSelect}
              onAttachmentRequest={onAttachmentRequest}
              onMarkdown={onMarkdown}
            />
          </li>
        );
      }),
    );
  }
  throw new Error(`Block with role '${block.role}' is undefined.`);
}
