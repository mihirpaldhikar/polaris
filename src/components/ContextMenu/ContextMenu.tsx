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

interface ContextMenuProps {
  coordinates: Coordinates;
  menu: Menu[];
  onClick: (execute: Executable) => void;
  onClose: () => void;
}

export default function ContextMenu({
  coordinates,
  menu,
  onClick,
  onClose,
}: ContextMenuProps): JSX.Element {
  return (
    <div
      className={
        "fixed z-10 flex w-60 flex-col space-y-1 rounded-lg border border-black/10 bg-white shadow-md"
      }
      style={{
        top: coordinates.y,
        left: coordinates.x,
      }}
    >
      {menu.map((m) => {
        return (
          <span
            key={m.id}
            id={m.id}
            className={
              "flex w-full cursor-pointer select-none flex-row items-center space-x-1 rounded-md px-1 text-sm outline-none ring-0 hover:bg-gray-200 focus:bg-gray-200"
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
