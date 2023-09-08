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

import { Fragment, type JSX, useState } from "react";
import { type Coordinates, type InputArgs } from "../../interfaces";
import { Button } from "../Button";
import { DialogBox } from "../DialogBox";

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
      : inputArgs.initialPayload.value.replaceAll(inputArgs.unit ?? "", ""),
  );

  const [disabled, setDisabled] = useState(
    !inputArgs.validStringRegExp.test(data) || data === "",
  );

  return (
    <DialogBox
      focusElementId={"dialog-input"}
      coordinates={coordinates}
      onClose={onClose}
      onConfirm={() => {
        if (inputArgs.validStringRegExp.test(data)) {
          onConfirm(data);
        }
      }}
    >
      <Fragment>
        <input
          id={"dialog-input"}
          type={inputArgs.type}
          placeholder={inputArgs.hint}
          className={
            "w-full rounded-md border border-gray-300 px-2 py-1 outline-none focus:border-blue-700 text-sm"
          }
          value={data}
          onChange={(event) => {
            setData(event.target.value);
            setDisabled(
              !inputArgs.validStringRegExp.test(event.target.value) ||
                event.target.value === "",
            );
          }}
        />
        <div>
          <div
            className={
              "flex w-full flex-row items-center justify-between space-x-2"
            }
          >
            <Button
              disabled={disabled}
              text={"Confirm"}
              onClick={() => {
                onConfirm(data);
                onClose();
              }}
            />
            <Button
              text={"Cancel"}
              color={"cancel"}
              onClick={() => {
                onClose();
              }}
            />
          </div>
        </div>
        <Button
          hidden={!active}
          text={"Remove"}
          color={"danger"}
          onClick={() => {
            onConfirm(inputArgs.payloadIfRemovedClicked ?? "", true);
            onClose();
          }}
        />
      </Fragment>
    </DialogBox>
  );
}
