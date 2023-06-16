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
 * @interface Style
 *
 * @description Describes about the type of style needs to be applied to the contents of the block when rendered.
 *
 * @author Mihir Paldhikar
 */

interface Style {
  name: string;
  value: string;
  enabled?: boolean;
}

export default Style;
