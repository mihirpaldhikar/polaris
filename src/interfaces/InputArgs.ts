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

interface InputArgs {
  hint: string;
  type: "text" | "number" | "email" | "color";
  executionTypeAfterInput: "styleManager" | "linkManager";
  validStringRegExp: RegExp;
  initialPayload: string | Style;
  unit?: string;
  payloadIfRemovedClicked?: string;
}

export default InputArgs;
