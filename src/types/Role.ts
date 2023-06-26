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

/**
 * @type Role
 *
 * @description Describes the role of the block in the Editor when rendered.
 * @author Mihir Paldhikar
 */
type Role =
  | "title"
  | "subTitle"
  | "heading"
  | "subHeading"
  | "paragraph"
  | "blockquote"
  | "unorderedList"
  | "orderedList"
  | "listChild";

export default Role;
