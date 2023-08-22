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

export default function TextSizeIcon({ size }: { size?: number }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size ?? 22}
      width={size ?? 22}
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path
        fillOpacity=".36"
        d="M2 20h20c1.1 0 2 .9 2 2s-.9 2-2 2H2c-1.1 0-2-.9-2-2s.9-2 2-2z"
      ></path>
      <path d="M10.63 3.93L6.06 15.58c-.27.68.23 1.42.97 1.42.43 0 .82-.27.98-.68L8.87 14h6.25l.87 2.32c.15.41.54.68.98.68.73 0 1.24-.74.97-1.42L13.37 3.93C13.14 3.37 12.6 3 12 3c-.6 0-1.15.37-1.37.93zM9.62 12L12 5.67 14.38 12H9.62z"></path>
    </svg>
  );
}
