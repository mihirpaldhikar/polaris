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

interface Executable {
  type: "styleManager" | "linkManager" | "userInput";
  args: Style[] | string | InputArgs;
}

export default Executable;