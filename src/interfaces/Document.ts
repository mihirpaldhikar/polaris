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

import type Block from "./Block";

/**
 * @interface Document
 *
 * @description Document is a collection of blocks in the semantic manner. A Document contains all the information required by the Polaris to create rich content editing experience.
 */

interface Document {
  id: string;
  blocks: Block[];
}

export default Document;
