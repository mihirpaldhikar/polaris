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

import { type ChangeEvent, createElement, type JSX } from "react";
import { setNodeStyle } from "../../utils";
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
    "data-block-type": content.type,
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
