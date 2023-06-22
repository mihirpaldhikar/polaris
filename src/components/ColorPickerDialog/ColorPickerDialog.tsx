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

import { type JSX, useEffect, useState } from "react";
import { type Coordinates, type InputArgs } from "../../interfaces";
import { REMOVE_COLOR } from "../../constants";

interface ColorPickerDialogProps {
  coordinates: Coordinates;
  active: boolean;
  inputArgs: InputArgs;
  onColorSelected: (colorHexCode: string) => void;
  onClose: () => void;
}

export default function ColorPickerDialog({
  coordinates,
  active,
  inputArgs,
  onColorSelected,
  onClose,
}: ColorPickerDialogProps): JSX.Element {
  const [colorHexCode, setColorHexCode] = useState(
    typeof inputArgs.initialPayload === "object"
      ? inputArgs.initialPayload.value !== ""
        ? inputArgs.initialPayload.value
        : "#000000"
      : inputArgs.initialPayload !== ""
      ? inputArgs.initialPayload
      : "#000000"
  );

  const [disabled, setDisabled] = useState(
    !inputArgs.validStringRegExp.test(colorHexCode)
  );

  const defaultColors: string[] = [
    "#304FFE",
    "#0097A7",
    "#00695C",
    "#E53935",
    "#F06292",
    "#0288D1",
    "#EF6C00",
    "#6D4C41",
  ];

  useEffect(() => {
    function keyManager(event: KeyboardEvent): void {
      if (event.key.toLowerCase() === "escape") {
        onClose();
      }
      if (event.key.toLowerCase() === "enter") {
        if (inputArgs.validStringRegExp.test(colorHexCode)) {
          onColorSelected(colorHexCode);
        }
        onClose();
      }
    }

    window.addEventListener("keydown", keyManager);
    return () => {
      window.removeEventListener("keydown", keyManager);
    };
  }, [colorHexCode, inputArgs.validStringRegExp, onClose, onColorSelected]);

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
      <div
        className={
          "grid w-full grid-cols-4 place-items-center justify-center gap-4"
        }
      >
        {defaultColors.map((color, index) => {
          return (
            <div
              key={index}
              className={"h-7 w-7 cursor-pointer rounded-full"}
              style={{
                backgroundColor: color,
              }}
              onClick={() => {
                if (inputArgs.validStringRegExp.test(color)) {
                  onColorSelected(color);
                }
                onClose();
              }}
            ></div>
          );
        })}
      </div>
      <div
        className={"flex flex-row items-center justify-evenly space-x-4 px-2"}
      >
        <div
          className={"h-7 w-7 cursor-pointer rounded-full"}
          style={{
            backgroundColor: colorHexCode,
          }}
          onClick={() => {
            if (inputArgs.validStringRegExp.test(colorHexCode)) {
              onColorSelected(colorHexCode);
            }
            onClose();
          }}
        ></div>
        <input
          placeholder={inputArgs.hint}
          value={colorHexCode}
          className={
            "w-[90px] rounded-md border-2 px-2 py-1 outline-none focus:border-blue-600"
          }
          onChange={(e) => {
            setColorHexCode(e.target.value);
            setDisabled(!inputArgs.validStringRegExp.test(e.target.value));
          }}
        />
        <button
          disabled={disabled}
          className={
            "flex w-fit cursor-pointer flex-row items-center justify-center rounded-lg bg-blue-600 px-3 py-1 font-medium text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
          }
          onClick={() => {
            if (inputArgs.validStringRegExp.test(colorHexCode)) {
              onColorSelected(colorHexCode);
            }
            onClose();
          }}
        >
          Choose
        </button>
      </div>
      <div className={"flex flex-row justify-center space-x-2 px-2"}>
        <button
          hidden={!active}
          className={
            "w-full rounded-md bg-red-600 p-1 text-white hover:bg-red-700"
          }
          onClick={() => {
            onColorSelected(REMOVE_COLOR);
            onClose();
          }}
        >
          Remove Color
        </button>
        <button
          className={
            "w-full rounded-md bg-gray-300 p-1 text-black hover:bg-gray-400"
          }
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}