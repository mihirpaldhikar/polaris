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

import { Fragment, type JSX, useContext } from "react";
import { DeleteIcon } from "../../assets";
import RootContext from "../../contexts/RootContext/RootContext";
import { InputDialog } from "../InputDialog";
import { getBlockNode } from "../../utils";
import { type BlockSchema, type Coordinates } from "../../interfaces";

interface EmbedPickerProps {
  id: string;
  message: string;
  icon: JSX.Element;
  listMetadata?: {
    parent: BlockSchema;
    currentIndex: number;
  };
  onEmbedPicked: (url: string) => void;
  onDelete: () => void;
}

export default function EmbedPicker({
  id,
  message,
  icon,
  onEmbedPicked,
  listMetadata,
  onDelete,
}: EmbedPickerProps): JSX.Element {
  const { dialogRoot } = useContext(RootContext);
  return (
    <div
      id={id}
      data-parent-block-id={
        listMetadata === undefined ? null : listMetadata.parent.id
      }
      data-child-block-index={
        listMetadata === undefined ? null : listMetadata.currentIndex
      }
      className={
        "relative h-14 block my-2 w-full cursor-pointer rounded-md border border-gray-300 bg-gray-50"
      }
      onClick={() => {
        if (dialogRoot === undefined) return;

        const currentNode = getBlockNode(id) as HTMLElement;
        const coordinates: Coordinates = {
          x: window.innerWidth > 500 ? window.innerWidth / 2 : 30,
          y: currentNode.getBoundingClientRect().y,
        };

        dialogRoot.render(
          <InputDialog
            coordinates={coordinates}
            active={false}
            inputArgs={{
              type: "text",
              hint: "Add Link...",
              payload: "",
              regex:
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/,
            }}
            onConfirm={(data) => {
              onEmbedPicked(data);
            }}
            onClose={() => {
              dialogRoot.render(<Fragment />);
            }}
          />,
        );
      }}
    >
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
      <div
        className={
          "flex space-x-3 h-full w-full text-gray-500 items-center justify-center"
        }
      >
        {icon}
        <span className={"font-medium text-sm"}>{message}</span>
      </div>
    </div>
  );
}
