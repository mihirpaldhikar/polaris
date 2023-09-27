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

import { type JSX, useEffect, useRef, useState } from "react";
import {
  type Action,
  type Coordinates,
  type Executable,
} from "../../interfaces";
import { isAllowedActionMenuKey } from "../../utils";
import { matchSorter } from "match-sorter";

const ACTION_MENU_HEIGHT: number = 200;
const ACTION_MENU_WIDTH: number = 250;
const ACTION_MENU_OPTION_HEIGHT: number = 60;

interface BlockToolsProps {
  coordinates: Coordinates;
  actions: readonly Action[];
  onActionSelected: (execute: Executable) => void;
  onClose: () => void;
  onEscape: (query: string) => void;
}

export default function BlockTools({
  coordinates,
  actions,
  onActionSelected,
  onClose,
  onEscape,
}: BlockToolsProps): JSX.Element {
  const xAxis =
    window.innerWidth > 500
      ? window.innerWidth - (coordinates.x + ACTION_MENU_WIDTH) <= 0
        ? coordinates.x - ACTION_MENU_WIDTH
        : coordinates.x
      : (window.innerWidth - ACTION_MENU_WIDTH) / 2;

  const [yAxis, setYAxis] = useState(
    window.innerHeight - (coordinates.y + ACTION_MENU_HEIGHT) <= 0
      ? coordinates.y - ACTION_MENU_HEIGHT - 40
      : coordinates.y,
  );

  const currentMenuIndex = useRef(-1);
  const query = useRef("");
  const [matchedMenu, setMatchedMenu] = useState<readonly Action[]>([
    ...actions,
  ]);

  useEffect(() => {
    function keyManager(event: KeyboardEvent): void {
      switch (event.key.toLowerCase()) {
        case "escape": {
          onEscape(query.current);
          onClose();
          break;
        }
        case "enter": {
          event.preventDefault();
          onActionSelected(
            currentMenuIndex.current === -1
              ? matchedMenu[0].execute
              : matchedMenu[currentMenuIndex.current].execute,
          );
          onClose();
          break;
        }
        case "arrowdown":
        case "tab": {
          event.preventDefault();
          currentMenuIndex.current =
            (currentMenuIndex.current + 1) % matchedMenu.length;

          const menuNode = document.getElementById(
            matchedMenu[currentMenuIndex.current].id,
          ) as HTMLElement;
          menuNode.focus();

          break;
        }
        case "arrowup": {
          event.preventDefault();
          currentMenuIndex.current =
            (currentMenuIndex.current - 1 < 0
              ? matchedMenu.length - 1
              : currentMenuIndex.current - 1) % matchedMenu.length;

          const menuNode = document.getElementById(
            matchedMenu[currentMenuIndex.current].id,
          ) as HTMLElement;
          menuNode.focus();

          break;
        }
        case "backspace": {
          if (query.current.length === 0) {
            onClose();
          }
          query.current = query.current.substring(0, query.current.length - 1);

          const matchedMenu =
            query.current.length === 0
              ? actions
              : matchSorter(actions, query.current, {
                  keys: ["name"],
                });

          setYAxis(
            matchedMenu.length === actions.length &&
              window.innerHeight - (coordinates.y + ACTION_MENU_HEIGHT) <= 0
              ? coordinates.y - ACTION_MENU_HEIGHT - 40
              : coordinates.y,
          );

          setMatchedMenu(matchedMenu);
          break;
        }
        default: {
          if (isAllowedActionMenuKey(event.key)) {
            query.current = query.current.concat(event.key.toLowerCase());

            const matchedMenu =
              query.current.length === 0
                ? actions
                : matchSorter(actions, query.current, {
                    keys: ["name"],
                  });

            if (matchedMenu.length === 0) {
              onClose();
            } else {
              currentMenuIndex.current = 0;

              setYAxis(
                matchedMenu.length !== actions.length &&
                  window.innerHeight -
                    (coordinates.y +
                      matchedMenu.length * ACTION_MENU_OPTION_HEIGHT) <=
                    0
                  ? coordinates.y -
                      matchedMenu.length * ACTION_MENU_OPTION_HEIGHT -
                      (matchedMenu.length <= 3 ? matchedMenu.length * 22 : 0)
                  : coordinates.y,
              );

              setMatchedMenu(matchedMenu);
            }
          }
          break;
        }
      }
    }

    window.addEventListener("keydown", keyManager);
    return () => {
      window.removeEventListener("keydown", keyManager);
    };
  }, [
    coordinates.y,
    matchedMenu,
    actions,
    onClose,
    onEscape,
    onActionSelected,
  ]);

  return (
    <div
      style={{
        top: yAxis,
        left: xAxis,
      }}
      data-y-coordinate={yAxis}
      data-x-coordinate={xAxis}
      className={
        "fixed z-30 flex max-h-[200px] w-[250px] scroll-py-0.5 flex-col space-y-0.5 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
      }
    >
      {matchedMenu.map((menu) => {
        return (
          <div
            key={menu.id}
            id={menu.id}
            tabIndex={0}
            className={
              "flex h-[60px] cursor-pointer flex-row items-center justify-start space-x-3 rounded-md p-1 text-sm font-medium text-black outline-none ring-0 hover:bg-gray-100 focus:bg-gray-100"
            }
            onClick={() => {
              onActionSelected(menu.execute);
              onClose();
            }}
          >
            <span className={"rounded-md border border-gray-300 p-0.5"}>
              {menu.icon}
            </span>
            <div className={"flex flex-col items-start space-y-0.5"}>
              <span>{menu.name}</span>
              <span
                className={"overflow-ellipsis font-normal text-gray-400"}
                style={{
                  fontSize: "12px",
                }}
              >
                {menu.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
