/*
 * Copyright (c) 2023 Mihir Paldhikar
 *
 * Polaris is a proprietary software owned, developed and
 * maintained by Mihir Paldhikar.
 *
 * No part of the software should be distributed or reverse
 * engineered in any form without the permission of the owner.
 *
 * Doing so will result into a legal action without any prior notice.
 *
 * All Rights Reserved.
 */

import { type JSX, useEffect, useRef, useState } from "react";
import { type Coordinates, type Executable, type Menu } from "../../interfaces";
import { isAllowedActionMenuKey } from "../../utils";
import { matchSorter } from "match-sorter";

const ACTION_MENU_HEIGHT: number = 246;
const ACTION_MENU_WIDTH: number = 288;
const ACTION_MENU_OPTION_HEIGHT: number = 58;

interface ActionMenuProps {
  coordinates: Coordinates;
  menu: Menu[];
  onSelect: (execute: Executable) => void;
  onClose: () => void;
  onEscape: (query: string) => void;
}

export default function ActionMenu({
  coordinates,
  menu,
  onSelect,
  onClose,
  onEscape,
}: ActionMenuProps): JSX.Element {
  const xAxis =
    window.innerWidth - (coordinates.x + ACTION_MENU_WIDTH) <= 0
      ? coordinates.x - ACTION_MENU_WIDTH
      : coordinates.x;

  const [yAxis, setYAxis] = useState(
    window.innerHeight - (coordinates.y + ACTION_MENU_HEIGHT) <= 0
      ? coordinates.y - ACTION_MENU_HEIGHT - 40
      : coordinates.y
  );

  const currentMenuIndex = useRef(-1);
  const query = useRef("");
  const [matchedMenu, setMatchedMenu] = useState([...menu]);

  useEffect(() => {
    function keyManager(event: KeyboardEvent): void {
      switch (event.key.toLowerCase()) {
        case "escape": {
          onEscape(query.current);
          onClose();
          break;
        }
        case "enter": {
          onSelect(
            currentMenuIndex.current === -1
              ? matchedMenu[0].execute
              : matchedMenu[currentMenuIndex.current].execute
          );
          onClose();
          break;
        }
        case "arrowdown":
        case "tab": {
          event.preventDefault();
          currentMenuIndex.current =
            (currentMenuIndex.current + 1) % matchedMenu.length;

          focusMenuNode();
          break;
        }
        case "arrowup": {
          event.preventDefault();
          currentMenuIndex.current =
            (currentMenuIndex.current - 1 < 0
              ? matchedMenu.length - 1
              : currentMenuIndex.current - 1) % matchedMenu.length;

          focusMenuNode();
          break;
        }
        case "backspace": {
          if (query.current.length === 0) {
            onClose();
          }
          query.current = query.current.substring(0, query.current.length - 1);

          const matchedMenu =
            query.current.length === 0
              ? menu
              : matchSorter(menu, query.current, {
                  keys: ["name"],
                });

          setYAxis(
            matchedMenu.length === menu.length &&
              window.innerHeight - (coordinates.y + ACTION_MENU_HEIGHT) <= 0
              ? coordinates.y - ACTION_MENU_HEIGHT - 40
              : coordinates.y
          );

          setMatchedMenu(matchedMenu);
          break;
        }
        default: {
          if (isAllowedActionMenuKey(event.key)) {
            query.current = query.current.concat(event.key.toLowerCase());

            const matchedMenu =
              query.current.length === 0
                ? menu
                : matchSorter(menu, query.current, {
                    keys: ["name"],
                  });

            if (matchedMenu.length === 0) {
              onClose();
            } else {
              currentMenuIndex.current = 0;

              setYAxis(
                matchedMenu.length !== menu.length &&
                  window.innerHeight -
                    (coordinates.y +
                      matchedMenu.length * ACTION_MENU_OPTION_HEIGHT) <=
                    0
                  ? coordinates.y -
                      matchedMenu.length * ACTION_MENU_OPTION_HEIGHT -
                      (matchedMenu.length <= 3 ? matchedMenu.length * 22 : 0)
                  : coordinates.y
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
    focusMenuNode,
    matchedMenu,
    menu,
    onClose,
    onEscape,
    onSelect,
  ]);

  function focusMenuNode(): void {
    const menuNode = document.getElementById(
      matchedMenu[currentMenuIndex.current].id
    ) as HTMLElement;
    menuNode.focus();
  }

  return (
    <div
      style={{
        top: yAxis,
        left: xAxis,
      }}
      className={
        "fixed flex max-h-[246px] w-72 scroll-py-1 flex-col space-y-1 overflow-y-auto rounded-lg border border-black/10 bg-white p-1 shadow-md"
      }
    >
      {matchedMenu.map((menu) => {
        return (
          <div
            key={menu.id}
            id={menu.id}
            tabIndex={0}
            className={
              "flex h-[58px] cursor-pointer flex-row items-center justify-start space-x-3 rounded-md p-2 text-sm font-semibold text-black outline-none ring-0 hover:bg-gray-100 focus:bg-gray-100"
            }
            onClick={() => {
              onSelect(menu.execute);
              onClose();
            }}
          >
            <div
              className={
                "h-10 w-10 items-center justify-center rounded-md border border-gray-300"
              }
            >
              {menu.icon}
            </div>
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
