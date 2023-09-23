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
      : "#000000",
  );

  const [disabled, setDisabled] = useState(
    !inputArgs.validStringRegExp.test(colorHexCode),
  );

  const defaultColors: string[] = ["#304FFE", "#0288D1", "#0097A7", "#E53935"];

  return (
    <DialogBox
      focusElementId={"color-input"}
      coordinates={coordinates}
      onClose={onClose}
      onConfirm={() => {
        if (inputArgs.validStringRegExp.test(colorHexCode)) {
          onColorSelected(colorHexCode);
        }
      }}
    >
      <Fragment>
        <div
          className={
            "grid w-full grid-cols-4 place-items-center justify-center gap-5"
          }
        >
          {defaultColors.map((color, index) => {
            return (
              <div
                key={index}
                className={"h-[28px] w-[28px] cursor-pointer rounded-full"}
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
          className={"flex flex-row items-center justify-evenly space-x-2 px-2"}
        >
          <div
            className={"min-h-[28px] min-w-[28px] cursor-pointer rounded-full"}
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
            id={"color-input"}
            placeholder={inputArgs.hint}
            value={colorHexCode}
            className={
              "w-[90px] rounded-md border text-sm border-gray-300 px-2 py-1 outline-none focus:border-blue-700"
            }
            onChange={(e) => {
              setColorHexCode(e.target.value);
              setDisabled(!inputArgs.validStringRegExp.test(e.target.value));
            }}
          />
          <Button
            disabled={disabled}
            text={"Select"}
            onClick={() => {
              if (inputArgs.validStringRegExp.test(colorHexCode)) {
                onColorSelected(colorHexCode);
              }
              onClose();
            }}
          />
        </div>
        <div className={"flex flex-row justify-center space-x-2 px-2"}>
          <Button
            hidden={!active}
            text={"Remove Color"}
            color={"danger"}
            onClick={() => {
              onColorSelected("");
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
      </Fragment>
    </DialogBox>
  );
}
