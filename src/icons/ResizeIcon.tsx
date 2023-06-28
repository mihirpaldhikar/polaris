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

export default function ResizeIcon({ size }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size ?? 36}
      height={size ?? 36}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="44"
        y="44"
        width="112"
        height="112"
        rx="17"
        stroke="black"
        strokeWidth="6"
      />
      <path
        d="M134.02 69C134.02 67.3431 132.677 66 131.02 66H104.02C102.363 66 101.02 67.3431 101.02 69C101.02 70.6569 102.363 72 104.02 72H128.02V96C128.02 97.6569 129.363 99 131.02 99C132.677 99 134.02 97.6569 134.02 96V69ZM108.121 96.1413L133.141 71.1213L128.899 66.8787L103.879 91.8987L108.121 96.1413Z"
        fill="black"
      />
      <path
        d="M65 130.02C65 131.677 66.3432 133.02 68 133.02H95C96.6569 133.02 98 131.677 98 130.02C98 128.363 96.6569 127.02 95 127.02H71V103.02C71 101.363 69.6569 100.02 68 100.02C66.3432 100.02 65 101.363 65 103.02V130.02ZM90.8987 102.879L65.8787 127.899L70.1213 132.141L95.1413 107.121L90.8987 102.879Z"
        fill="black"
      />
    </svg>
  );
}
