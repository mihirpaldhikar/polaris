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

import { generateRandomString } from "./SharedUtils";

/**
 * @function generateRefreshKey
 *
 * @description Generates a unique key which is used to refresh the DOM.
 *
 * @author Mihir Paldhikar
 */

export function generateRefreshKey(): string {
  return generateRandomString(20);
}
