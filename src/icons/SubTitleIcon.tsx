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

export default function SubTitleIcon({ size }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size ?? 36}
      height={size ?? 36}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M89.3983 70.6H101.358V135H89.3983V70.6ZM56.0943 135H44.1343V70.6H56.0943V135ZM90.3183 107.4H55.0823V97.188H90.3183V107.4ZM113.187 135V126.996L138.763 102.708C140.909 100.684 142.504 98.9053 143.547 97.372C144.589 95.8387 145.264 94.428 145.571 93.14C145.939 91.7907 146.123 90.5333 146.123 89.368C146.123 86.424 145.111 84.1547 143.087 82.56C141.063 80.904 138.088 80.076 134.163 80.076C131.035 80.076 128.183 80.628 125.607 81.732C123.092 82.836 120.915 84.5227 119.075 86.792L110.703 80.352C113.217 76.9787 116.591 74.372 120.823 72.532C125.116 70.6307 129.9 69.68 135.175 69.68C139.836 69.68 143.884 70.4467 147.319 71.98C150.815 73.452 153.483 75.568 155.323 78.328C157.224 81.088 158.175 84.3693 158.175 88.172C158.175 90.2573 157.899 92.3427 157.347 94.428C156.795 96.452 155.752 98.5987 154.219 100.868C152.685 103.137 150.447 105.683 147.503 108.504L125.515 129.388L123.031 124.88H160.659V135H113.187Z"
        fill="black"
      />
    </svg>
  );
}
