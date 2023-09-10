/*
 * Copyright (c) Mihir Paldhikar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { type JSX } from "react";

export default function AddColumnIcon({
  size = 30,
}: {
  size?: number;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="65"
        y="27"
        width="96"
        height="36"
        rx="3"
        transform="rotate(90 65 27)"
        stroke="black"
        strokeWidth="4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77 120V30C77 29.4477 77.4477 29 78 29H108C108.552 29 109 29.4477 109 30V61.2237H113V30C113 27.2386 110.761 25 108 25H78C75.2386 25 73 27.2386 73 30V120C73 122.761 75.2386 125 78 125H108C110.761 125 113 122.761 113 120V92.6923H109V120C109 120.552 108.552 121 108 121H78C77.4477 121 77 120.552 77 120Z"
        fill="black"
      />
      <line x1="111" y1="66" x2="111" y2="88" stroke="black" strokeWidth="4" />
      <line x1="100" y1="77" x2="122" y2="77" stroke="black" strokeWidth="4" />
    </svg>
  );
}
