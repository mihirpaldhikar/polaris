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

import { type JSX } from "react";
import { type Executable } from "./index";

interface Menu {
  separator?: boolean;
  id: string;
  name: string;
  description?: string;
  icon?: JSX.Element;
  active?: boolean;
  execute: Executable;
}

export default Menu;
