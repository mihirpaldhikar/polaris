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

export default function ChangeIcon({ size }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size ?? 36}
      height={size ?? 36}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M145.108 118.175C141.613 127.196 135.52 134.977 127.602 140.535C119.684 146.093 110.295 149.179 100.624 149.401C90.952 149.623 81.4316 146.972 73.2664 141.784C65.1013 136.595 58.6581 129.102 54.7516 120.252L61.4638 117.289C64.7844 124.812 70.2611 131.181 77.2015 135.591C84.1419 140.001 92.2342 142.255 100.455 142.066C108.676 141.877 116.656 139.254 123.387 134.53C130.117 129.806 135.296 123.192 138.267 115.524L145.108 118.175Z"
        fill="black"
      />
      <path
        d="M53.7732 81.7007C57.4115 72.7367 63.6262 65.0529 71.6314 59.6209C79.6366 54.1889 89.0729 51.2528 98.7468 51.1837C108.421 51.1146 117.898 53.9158 125.98 59.2329C134.062 64.5501 140.386 72.1444 144.152 81.0555L137.393 83.9116C134.192 76.3372 128.817 69.882 121.947 65.3624C115.078 60.8428 107.022 58.4619 98.7992 58.5206C90.5764 58.5793 82.5556 61.075 75.7511 65.6922C68.9467 70.3094 63.6642 76.8406 60.5716 84.46L53.7732 81.7007Z"
        fill="black"
      />
      <line
        x1="58.3993"
        y1="115.119"
        x2="49.1568"
        y2="138.968"
        stroke="black"
        strokeWidth="6"
      />
      <line
        x1="140.423"
        y1="86.1294"
        x2="150.042"
        y2="62.43"
        stroke="black"
        strokeWidth="6"
      />
      <line
        x1="55.0057"
        y1="115.574"
        x2="78.8544"
        y2="124.817"
        stroke="black"
        strokeWidth="6"
      />
      <line
        x1="143.823"
        y1="85.7284"
        x2="120.124"
        y2="76.1094"
        stroke="black"
        strokeWidth="6"
      />
    </svg>
  );
}
