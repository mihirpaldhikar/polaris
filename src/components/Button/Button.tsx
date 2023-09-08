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
import { conditionalClassName } from "../../utils";

interface ButtonProps {
  text: string;
  onClick: () => void;
  hidden?: boolean;
  disabled?: boolean;
  color?: "primary" | "danger" | "cancel";
  fullWidth?: boolean;
}

export default function Button({
  text,
  onClick,
  color = "primary",
  hidden = false,
  disabled = false,
  fullWidth = true,
}: ButtonProps): JSX.Element {
  return (
    <button
      hidden={hidden}
      disabled={disabled}
      type={"button"}
      onClick={onClick}
      className={conditionalClassName(
        "rounded-md p-1 font-medium text-sm disabled:bg-gray-200 disabled:text-gray-400",
        color === "primary"
          ? "bg-blue-700 text-white"
          : color === "cancel"
          ? "text-gray-400 border hover:bg-gray-100 border-gray-300"
          : "bg-red-700 text-white",
        fullWidth ? "w-full" : "w-fit",
      )}
    >
      {text}
    </button>
  );
}
