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

import { type Block, type Coordinates } from "../interfaces";

type BlockFunction = (
  block: Block,
  onComplete: (
    block: Block | Block[],
    focusBlockId: string,
    caretOffset?: number
  ) => void,
  blocks?: Block[],
  coordinates?: Coordinates,
  caretOffset?: number
) => void;

export default BlockFunction;
