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
 * @interface Blob
 *
 * @description Blob is a collection of blocks in the semantic manner. A Blob contains all the information required by the Polaris to create rich content editing experience.
 */

interface Blob {
  id: string;
  contents: Block[];
}

export default Blob;
