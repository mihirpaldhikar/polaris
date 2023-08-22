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

export default function HeadingIcon({ size }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size ?? 36}
      height={size ?? 36}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M89.3983 70.6H101.358V135H89.3983V70.6ZM56.0943 135H44.1343V70.6H56.0943V135ZM90.3183 107.4H55.0823V97.188H90.3183V107.4ZM134.255 135.92C129.716 135.92 125.269 135.276 120.915 133.988C116.621 132.639 113.003 130.799 110.059 128.468L115.211 119.176C117.541 121.077 120.363 122.611 123.675 123.776C126.987 124.941 130.452 125.524 134.071 125.524C138.364 125.524 141.707 124.665 144.099 122.948C146.491 121.169 147.687 118.777 147.687 115.772C147.687 112.828 146.583 110.497 144.375 108.78C142.167 107.063 138.609 106.204 133.703 106.204H127.815V98.016L146.215 76.12L147.779 80.628H113.187V70.6H157.071V78.604L138.671 100.5L132.415 96.82H136.003C143.915 96.82 149.833 98.5987 153.759 102.156C157.745 105.652 159.739 110.16 159.739 115.68C159.739 119.299 158.819 122.641 156.979 125.708C155.139 128.775 152.317 131.259 148.515 133.16C144.773 135 140.02 135.92 134.255 135.92Z"
        fill="black"
      />
    </svg>
  );
}
