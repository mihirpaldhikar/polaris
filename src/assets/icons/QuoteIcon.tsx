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

export default function QuoteIcon({ size }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size ?? 36}
      height={size ?? 36}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M92.8945 74.6L81.2945 119L78.0945 104C82.7612 104 86.6279 105.467 89.6945 108.4C92.7612 111.333 94.2945 115.267 94.2945 120.2C94.2945 125.133 92.7612 129.133 89.6945 132.2C86.6279 135.133 82.8279 136.6 78.2945 136.6C73.4945 136.6 69.5612 135.067 66.4945 132C63.4279 128.933 61.8945 125 61.8945 120.2C61.8945 118.6 61.9612 117.133 62.0945 115.8C62.3612 114.333 62.8279 112.6 63.4945 110.6C64.1612 108.6 65.0945 106.067 66.2945 103L76.8945 74.6H92.8945ZM135.295 74.6L123.695 119L120.495 104C125.161 104 129.028 105.467 132.095 108.4C135.161 111.333 136.695 115.267 136.695 120.2C136.695 125.133 135.161 129.133 132.095 132.2C129.028 135.133 125.228 136.6 120.695 136.6C115.895 136.6 111.961 135.067 108.895 132C105.828 128.933 104.295 125 104.295 120.2C104.295 118.6 104.361 117.133 104.495 115.8C104.761 114.333 105.228 112.6 105.895 110.6C106.561 108.6 107.495 106.067 108.695 103L119.295 74.6H135.295Z"
        fill="black"
      />
    </svg>
  );
}
