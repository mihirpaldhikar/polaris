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

import { type Content, type Role, type Type } from "../types";
import type Style from "./Style";
import { type RefObject } from "react";

/**
 * @interface Block
 *
 * @description Block is the smallest unit of document which contains all the information required by the parser to render DOM Node.
 *
 * @author Mihir Paldhikar
 */

interface Block {
  id: string;
  reference?: RefObject<HTMLElement>;
  type: Type;
  role: Role;
  content: Content;
  style: Style;
}

export default Block;
