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

export default function SuperscriptIcon({
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
      <path
        d="M3.00282 21L7.23282 15.492L7.19682 16.698L3.16482 11.388H5.66682L8.49282 15.168H7.53882L10.3828 11.388H12.8128L8.74482 16.698L8.76282 15.492L12.9748 21H10.4368L7.46682 16.986L8.40282 17.112L5.48682 21H3.00282Z"
        fill="black"
      />
      <path
        d="M13.4398 11V10.13L16.2198 7.49C16.4532 7.27 16.6265 7.07667 16.7398 6.91C16.8532 6.74333 16.9265 6.59 16.9598 6.45C16.9998 6.30333 17.0198 6.16667 17.0198 6.04C17.0198 5.72 16.9098 5.47333 16.6898 5.3C16.4698 5.12 16.1465 5.03 15.7198 5.03C15.3798 5.03 15.0698 5.09 14.7898 5.21C14.5165 5.33 14.2798 5.51333 14.0798 5.76L13.1698 5.06C13.4432 4.69333 13.8098 4.41 14.2698 4.21C14.7365 4.00333 15.2565 3.9 15.8298 3.9C16.3365 3.9 16.7765 3.98333 17.1498 4.15C17.5298 4.31 17.8198 4.54 18.0198 4.84C18.2265 5.14 18.3298 5.49667 18.3298 5.91C18.3298 6.13667 18.2998 6.36333 18.2398 6.59C18.1798 6.81 18.0665 7.04333 17.8998 7.29C17.7332 7.53667 17.4898 7.81333 17.1698 8.12L14.7798 10.39L14.5098 9.9H18.5998V11H13.4398Z"
        fill="black"
      />
    </svg>
  );
}
