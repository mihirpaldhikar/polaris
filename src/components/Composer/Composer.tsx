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

import { type JSX, useState } from "react";
import { Canvas } from "../Canvas";
import { type Block } from "../../interfaces";
import { generateRefreshKey } from "../../utils";

interface ComposerProps {
  editable: boolean;
  previousBlock: Block | null;
  block: Block;
  nextBlock: Block | null;
  onChange: (block: Block) => void;
}

/**
 * @function Composer
 *
 * @param editable
 * @param previousBlock
 * @param block
 * @param nextBlock
 * @param onChange
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
}: ComposerProps): JSX.Element {
  const [refreshKey, setRefreshKey] = useState(generateRefreshKey());

  return (
    <Canvas
      key={refreshKey}
      editable={editable}
      block={block}
      onChange={onChange}
    />
  );
}
