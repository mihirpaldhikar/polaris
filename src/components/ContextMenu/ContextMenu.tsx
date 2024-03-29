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
import {
  type Action,
  type Coordinates,
  type Executable,
} from "../../interfaces";

interface ContextMenuProps {
  coordinates: Coordinates;
  menu: readonly Action[];
  onClick: (execute: Executable) => void;
  onClose: () => void;
}

export default function ContextMenu({
  coordinates,
  menu,
  onClick,
  onClose,
}: ContextMenuProps): JSX.Element {
  const CONTEXT_MENU_WIDTH: number = 176;

  const xAxis =
    coordinates.x + CONTEXT_MENU_WIDTH > window.innerWidth
      ? coordinates.x - CONTEXT_MENU_WIDTH - 50
      : coordinates.x;

  return (
    <div
      className={
        "fixed overflow-y-auto z-40 max-h-96 flex w-44 flex-col space-y-0.5 px-1 py-1 rounded-lg border border-gray-300 bg-white shadow-md"
      }
      style={{
        top: coordinates.y,
        left: xAxis,
      }}
    >
      {menu.map((m) => {
        return (
          <span
            key={m.id}
            id={m.id}
            className={
              "flex w-full cursor-pointer font-medium select-none flex-row items-center space-x-1 rounded-md px-1 text-xs outline-none ring-0 hover:bg-gray-100 focus:bg-gray-200"
            }
            onClick={() => {
              onClick(m.execute);
              onClose();
            }}
          >
            {m.icon}
            {m.name}
          </span>
        );
      })}
    </div>
  );
}
