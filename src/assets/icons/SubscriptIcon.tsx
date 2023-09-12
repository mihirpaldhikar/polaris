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

export default function SubscriptIcon({
  size = 22,
}: {
  size?: number;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_110_6)">
        <path
          d="M3.00282 16L7.23282 10.492L7.19682 11.698L3.16482 6.388H5.66682L8.49282 10.168H7.53882L10.3828 6.388H12.8128L8.74482 11.698L8.76282 10.492L12.9748 16H10.4368L7.46682 11.986L8.40282 12.112L5.48682 16H3.00282Z"
          fill="black"
        />
        <path
          d="M14.4398 22V21.13L17.2198 18.49C17.4532 18.27 17.6265 18.0767 17.7398 17.91C17.8532 17.7433 17.9265 17.59 17.9598 17.45C17.9998 17.3033 18.0198 17.1667 18.0198 17.04C18.0198 16.72 17.9098 16.4733 17.6898 16.3C17.4698 16.12 17.1465 16.03 16.7198 16.03C16.3798 16.03 16.0698 16.09 15.7898 16.21C15.5165 16.33 15.2798 16.5133 15.0798 16.76L14.1698 16.06C14.4432 15.6933 14.8098 15.41 15.2698 15.21C15.7365 15.0033 16.2565 14.9 16.8298 14.9C17.3365 14.9 17.7765 14.9833 18.1498 15.15C18.5298 15.31 18.8198 15.54 19.0198 15.84C19.2265 16.14 19.3298 16.4967 19.3298 16.91C19.3298 17.1367 19.2998 17.3633 19.2398 17.59C19.1798 17.81 19.0665 18.0433 18.8998 18.29C18.7332 18.5367 18.4898 18.8133 18.1698 19.12L15.7798 21.39L15.5098 20.9H19.5998V22H14.4398Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_110_6">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
