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
import { BLOCK_NODE } from "../../constants";
import { DeleteIcon } from "../../assets";

interface FilePickerProps {
  id: string;
  message: string;
  accept: string;
  fileIcon: JSX.Element;
  onFilePicked: (file: File) => void;
  onDelete: () => void;
}

export default function FilePicker({
  id,
  message,
  fileIcon,
  accept,
  onFilePicked,
  onDelete,
}: FilePickerProps): JSX.Element {
  return (
    <div
      data-type={BLOCK_NODE}
      data-block-render-type={"attachment-placeholder"}
      id={id}
      className={
        "relative h-14 block my-2 w-full cursor-pointer rounded-md border border-gray-300 bg-gray-50"
      }
    >
      <input
        id={`filePicker-${id}`}
        className={
          "filePicker block absolute h-full w-full cursor-pointer select-none"
        }
        type={"file"}
        accept={accept}
        onChange={() => {
          const filePicker = document.getElementById(
            `filePicker-${id}`,
          ) as HTMLInputElement;
          if (filePicker.files !== null) {
            onFilePicked(filePicker.files[0]);
          }
        }}
      />
      <span
        className={
          "absolute right-0 top-0 flex w-fit justify-start px-2 py-1 text-sm text-red-600"
        }
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <DeleteIcon size={20} color={"red"} />
      </span>
      <div className={"flex h-full w-full  items-center justify-center"}>
        {fileIcon}
        <span className={"font-medium text-sm"}>{message}</span>
      </div>
    </div>
  );
}
