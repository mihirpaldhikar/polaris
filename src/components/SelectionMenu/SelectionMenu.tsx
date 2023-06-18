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

import { type JSX } from "react";
import { type Coordinates, type Executable, type Menu } from "../../interfaces";
import { conditionalClassName } from "../../utils";

const ACTION_BUTTON_WIDTH: number = 28;
const ACTION_MENU_PADDING: number = 42;

interface SelectionMenuProps {
  coordinates: Coordinates;
  menus: Menu[];
  onMenuSelected: (executable: Executable) => void;
  onClose: () => void;
}

export default function SelectionMenu({
  coordinates,
  menus,
  onMenuSelected,
  onClose,
}: SelectionMenuProps): JSX.Element {
  const ACTION_MENU_WIDTH =
    ACTION_BUTTON_WIDTH * menus.length + ACTION_MENU_PADDING;
  const ACTION_MENU_HEIGHT = 38;

  const xAxis =
    window.innerWidth - (ACTION_MENU_WIDTH + coordinates.x) <= 1
      ? coordinates.x - ACTION_MENU_WIDTH
      : coordinates.x;

  const yAxis =
    coordinates.y <= 30
      ? coordinates.y + ACTION_MENU_HEIGHT - 10
      : coordinates.y - 55;

  return (
    <div
      style={{
        top: yAxis,
        left: xAxis,
      }}
      className={
        "fixed z-10 flex flex-row items-center rounded-lg border border-black/10 bg-white p-1 shadow-md"
      }
    >
      {menus.map((menu) => {
        return (
          <div
            className={conditionalClassName(
              "m-1 cursor-pointer rounded-md hover:bg-gray-200",
              menu.active ?? false ? "bg-blue-200 fill-blue-800" : null
            )}
            key={menu.id}
            title={menu.name}
            onClick={() => {
              onMenuSelected(menu.execute);
              onClose();
            }}
          >
            {menu.icon}
          </div>
        );
      })}
    </div>
  );
}
