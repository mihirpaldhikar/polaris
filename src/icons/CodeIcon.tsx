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

export default function CodeIcon({ size }: { size?: number }): JSX.Element {
  return (
    <svg
      height={size ?? 25}
      width={size ?? 25}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M45 99.1394L83.3022 67"
        stroke="black"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M45.3376 100.392L83.6399 132.531"
        stroke="black"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M154.302 100.139L116 132.279"
        stroke="black"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M154.302 99.1394L116 67"
        stroke="black"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
