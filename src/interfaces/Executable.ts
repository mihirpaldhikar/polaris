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

import type Style from "./Style";
import type InputArgs from "./InputArgs";
import { type BlockFunction, type Role } from "../types";

interface Executable {
  type: "style" | "link" | "input" | "role" | "blockFunction";
  args: Style[] | string | InputArgs | Role | BlockFunction;
}

export default Executable;
