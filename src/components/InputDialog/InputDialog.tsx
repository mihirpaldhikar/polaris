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

interface InputDialogProps {
  coordinates: Coordinates;
  active: boolean;
  inputArgs: InputArgs;
  onConfirm: (data: string, remove?: boolean) => void;
  onClose: () => void;
}

export default function InputDialog({
  coordinates,
  active,
  inputArgs,
  onConfirm,
  onClose,
}: InputDialogProps): JSX.Element {
  const [data, setData] = useState<string>(
    typeof inputArgs.initialPayload === "string"
      ? inputArgs.initialPayload
      : inputArgs.initialPayload.value.replaceAll(inputArgs.unit ?? "", "")
  );

  const [disabled, setDisabled] = useState(
    !inputArgs.validStringRegExp.test(data) || data === ""
  );

  useEffect(() => {
    function keyManager(event: KeyboardEvent): void {
      if (event.key.toLowerCase() === "escape") {
        onClose();
      }
      if (event.key.toLowerCase() === "enter") {
        if (inputArgs.validStringRegExp.test(data)) {
          onConfirm(data);
        }
        onClose();
      }
    }

    window.addEventListener("keydown", keyManager);
    return () => {
      window.removeEventListener("keydown", keyManager);
    };
  }, [data, inputArgs.validStringRegExp, onClose, onConfirm]);

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
      <input
        type={inputArgs.type}
        placeholder={inputArgs.hint}
        className={
          "w-full rounded-md border-2 px-2 py-1 outline-none focus:border-blue-600"
        }
        value={data}
        onChange={(event) => {
          setData(event.target.value);
          setDisabled(
            !inputArgs.validStringRegExp.test(event.target.value) ||
              event.target.value === ""
          );
        }}
      />
      <div>
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
              onConfirm(data);
              onClose();
            }}
          >
            Confirm
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
      <button
        hidden={!active}
        className={
          "w-full rounded-md bg-red-600 p-1 text-white hover:bg-red-700"
        }
        onClick={() => {
          onConfirm(inputArgs.payloadIfRemovedClicked ?? "", true);
          onClose();
        }}
      >
        Remove
      </button>
    </div>
  );
}
