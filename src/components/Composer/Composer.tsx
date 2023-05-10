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

import { createRef, type JSX, useState } from "react";
import { Canvas } from "../Canvas";
import { type Block } from "../../interfaces";
import { generateBlockId, generateRefreshKey } from "../../utils";

interface ComposerProps {
  editable: boolean;
  previousBlock: Block | null;
  block: Block;
  nextBlock: Block | null;
  onChange: (block: Block) => void;
  onCreate: (
    currentBlock: Block,
    newBlock: Block,
    position: "above" | "below"
  ) => void;
  onDelete: (
    block: Block,
    previousBlock: Block,
    nodeIndex: number,
    caretOffset: number
  ) => void;
}

/**
 * @function Composer
 *
 * @param editable
 * @param previousBlock
 * @param block
 * @param nextBlock
 * @param onChange
 * @param onCreate
 * @param onDelete
 *
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
}: ComposerProps): JSX.Element {
  const [refreshKey, setRefreshKey] = useState(generateRefreshKey());

  function enterHandler(splitContent: boolean, caretOffset: number): void {
    const newBlock: Block = {
      id: generateBlockId(),
      reference: createRef<HTMLElement>(),
      type: "text",
      role: "paragraph",
      content: "",
      style: [],
    };

    if (splitContent) {
      const tempNode = document.createElement("div");
      tempNode.innerHTML = block.content;

      const currentBlockContent: string = tempNode.innerText.substring(
        0,
        caretOffset
      );
      const newBlockContent: string = tempNode.innerText.substring(caretOffset);

      block.content = currentBlockContent;
      newBlock.content = newBlockContent;
      newBlock.role = block.role;
      newBlock.type = block.type;
      newBlock.style = block.style;
    }

    onCreate(block, newBlock, "below");
  }

  function deleteHandler(block: Block, joinContent: boolean): void {
    if (previousBlock != null) {
      const previousNode = previousBlock.reference?.current as HTMLElement;

      if (joinContent) {
        previousBlock.id = generateBlockId();
        previousBlock.content = previousBlock.content.concat(block.content);
      }

      const childNodes = Array.from(previousNode.childNodes);

      const caretOffset: number =
        previousNode.lastChild != null
          ? previousNode.lastChild.nodeType === Node.ELEMENT_NODE
            ? 1
            : previousNode.lastChild.textContent?.length ??
              previousNode.innerText.length
          : previousNode.innerText.length;

      onDelete(
        block,
        previousBlock,
        childNodes.indexOf(previousNode.lastChild ?? previousNode),
        caretOffset
      );
    }
  }

  return (
    <Canvas
      key={refreshKey}
      editable={editable}
      block={block}
      onChange={onChange}
      onEnter={enterHandler}
      onDelete={deleteHandler}
    />
  );
}
