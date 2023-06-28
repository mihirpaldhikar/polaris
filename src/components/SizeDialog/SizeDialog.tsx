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

import { type Coordinates } from "../../interfaces";
import { type JSX, useEffect, useState } from "react";

interface SizeDialogProps {
  initialSize: {
    width: number;
    height: number;
  };
  coordinates: Coordinates;
  onConfirm: (width: number, height: number) => void;
  onClose: () => void;
}

export default function SizeDialog({
  initialSize,
  coordinates,
  onConfirm,
  onClose,
}: SizeDialogProps): JSX.Element {
  const [width, setWidth] = useState(initialSize.width.toString());
  const [height, setHeight] = useState(initialSize.height.toString());

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    function keyManager(event: KeyboardEvent): void {
      if (event.key.toLowerCase() === "escape") {
        onClose();
      }
      if (event.key.toLowerCase() === "enter") {
        if (width !== "" && height !== "") {
          onConfirm(parseInt(width), parseInt(height));
        }
        onClose();
      }
    }

    window.addEventListener("keydown", keyManager);
    return () => {
      window.removeEventListener("keydown", keyManager);
    };
  }, [height, onClose, onConfirm, width]);

  return (
    <div
      style={{
        top: coordinates.y + 30,
        left: coordinates.x,
      }}
      className={
        "fixed flex w-72 flex-col space-y-5 rounded-lg border border-black/10 bg-white px-2 py-3 shadow-md"
      }
    >
      <div className={"flex flex-row items-center space-x-2"}>
        <input
          type={"number"}
          placeholder={"width"}
          min={0}
          className={
            "w-full rounded-md border-2 px-2 py-1 outline-none focus:border-blue-600"
          }
          value={width}
          onChange={(event) => {
            setWidth(event.target.value);
            setDisabled(event.target.value === "");
          }}
        />
        <span>x</span>
        <input
          type={"number"}
          placeholder={"height"}
          min={0}
          className={
            "w-full rounded-md border-2 px-2 py-1 outline-none focus:border-blue-600"
          }
          value={height}
          onChange={(event) => {
            setHeight(event.target.value);
            setDisabled(event.target.value === "");
          }}
        />
      </div>
      <div
        className={
          "flex w-full flex-row items-center justify-between space-x-2"
        }
      >
        <button
          disabled={disabled}
          className={
            "w-full rounded-md bg-blue-600 p-1 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500"
          }
          onClick={() => {
            onConfirm(parseInt(width), parseInt(height));
            onClose();
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
