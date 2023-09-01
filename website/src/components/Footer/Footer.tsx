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
import Link from "next/link";

export default function Footer(): JSX.Element {
  return (
    <footer
      className={
        "min-w-full bg-gray-50 px-5 py-3 border-t border-gray-300 flex"
      }
    >
      <div
        className={
          "flex flex-col items-center justify-center min-w-full space-y-3"
        }
      >
        <span>
          Copyright &copy;&nbsp;
          <Link href={"https://mihirpaldhikar.com"} className={"underline"}>
            Mihir Paldhikar
          </Link>
        </span>
        <span className={"text-sm"}>Released Under MIT License.</span>
      </div>
    </footer>
  );
}
