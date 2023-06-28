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
import { generateRandomString } from "../../utils";

interface FilePickerProps {
  message: string;
  accept: string;
  onFilePicked: (file: File) => void;
  onDelete: () => void;
}

export default function FilePicker({
  message,
  accept,
  onFilePicked,
  onDelete,
}: FilePickerProps): JSX.Element {
  const randomImageId = generateRandomString(30);
  return (
    <div
      className={
        "relative my-4 h-32 w-full cursor-pointer rounded-lg border-2 border-dashed border-black/20 bg-gray-200"
      }
    >
      <input
        id={`filePicker-${randomImageId}`}
        className={
          "filePicker absolute h-full w-full cursor-pointer select-none"
        }
        type={"file"}
        accept={accept}
        onChange={() => {
          const filePicker = document.getElementById(
            `filePicker-${randomImageId}`
          ) as HTMLInputElement;
          if (filePicker.files !== null) {
            onFilePicked(filePicker.files[0]);
          }
        }}
      />
      <span
        className={
          "absolute flex w-full justify-end px-2 py-1 text-sm text-red-600"
        }
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        Remove
      </span>
      <div
        className={"flex h-full w-full flex-col items-center justify-center"}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}
