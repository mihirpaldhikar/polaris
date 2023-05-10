/*
 * Copyright (c) 2023 Mihir Paldhikar
 *
 * Polaris is a proprietary software owned, developed and
 * maintained by Mihir Paldhikar.
 *
 * No part of the software should be distributed or reverse
 * engineered in any form without the permission of the owner.
 *
 * Doing so will result into a legal action without any prior notice.
 *
 * All Rights Reserved.
 */

import { createRef, type JSX, useEffect, useState } from "react";
import { Composer } from "../Composer";
import { type Block, type Document } from "../../interfaces";
import { getBlockNode, setCaretOffset } from "../../utils";

interface WorkspaceProps {
  editable: boolean;
  document: Document;
}

/**
 * @function Workspace
 *
 * @param editable
 * @param document
 *
 * @description A Workspace is essentially as Editor which manages all the blocks of the document. Workspace also handles user interactions and updates the re-renders the DOM accordingly.
 *
 * @author Mihir Paldhikar
 */

export default function Workspace({
  editable,
  document,
}: WorkspaceProps): JSX.Element {
  const [blocks, updateBlocks] = useState<Block[]>(
    document.blocks.map((block) => {
      return {
        ...block,
        reference: createRef<HTMLElement>(),
      };
    })
  );

  const [focusedNode, setFocusedNode] = useState<{
    nodeId: string;
    caretOffset: number;
    fromStart?: boolean;
    nodeIndex?: number;
  } | null>(null);

  useEffect(() => {
    if (focusedNode != null) {
      const { nodeId, nodeIndex, caretOffset, fromStart } = focusedNode;
      const node = getBlockNode(nodeId);

      if (node != null) {
        const jumpNode: Node =
          nodeIndex !== undefined &&
          node.childNodes[nodeIndex] !== undefined &&
          fromStart === undefined
            ? node.childNodes[nodeIndex]
            : fromStart !== undefined && fromStart
            ? node.firstChild ?? node
            : node.lastChild ?? node;

        setCaretOffset(jumpNode, caretOffset);
      }
    }
  }, [focusedNode]);

  function changeHandler(block: Block): void {
    const blockIndex: number = blocks.indexOf(block);
    blocks[blockIndex] = block;
    updateBlocks(blocks);
  }

  function createHandler(
    block: Block,
    newBlock: Block,
    position: "above" | "below"
  ): void {
    const blockIndex = blocks.indexOf(block);
    blocks[blockIndex] = block;
    blocks.splice(
      position === "below" ? blockIndex + 1 : blockIndex,
      0,
      newBlock
    );
    updateBlocks(blocks);
    setFocusedNode({
      nodeId: newBlock.id,
      caretOffset: 0,
      fromStart: true,
    });
  }

  function deletionHandler(
    block: Block,
    previousBlock: Block,
    nodeIndex: number,
    caretOffset: number
  ): void {
    const blockIndex = blocks.indexOf(block);
    blocks.splice(blockIndex, 1);
    updateBlocks(blocks);
    setFocusedNode({
      nodeId: previousBlock.id,
      caretOffset,
      nodeIndex,
    });
  }

  return (
    <div
      id={`workspace-${document.id}`}
      className={"min-h-screen w-full px-2 pb-60"}
    >
      {blocks.map((block, index) => {
        return (
          <Composer
            key={block.id}
            editable={editable}
            previousBlock={index !== 0 ? blocks[index - 1] : null}
            block={block}
            nextBlock={index !== blocks.length - 1 ? blocks[index + 1] : null}
            onChange={changeHandler}
            onCreate={createHandler}
            onDelete={deletionHandler}
          />
        );
      })}
    </div>
  );
}
