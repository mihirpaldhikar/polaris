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

import { Fragment, type JSX } from "react";
import {
  type Action,
  type Coordinates,
  type Executable,
} from "../../interfaces";
import { conditionalClassName } from "../../utils";
import { type Root } from "react-dom/client";
import { InputDialog } from "../InputDialog";
import { ColorPickerDialog } from "../ColorPickerDialog";

const ANNOTATION_BUTTON_WIDTH: number = 28;
const ANNOTATION_MENU_PADDING: number = 42;

interface AnnotationToolbarProps {
  dialogRoot: Root | undefined;
  coordinates: Coordinates;
  actions: readonly Action[];
  onActionSelected: (executable: Executable) => void;
  onClose: () => void;
}

export default function AnnotationToolbar({
  dialogRoot,
  coordinates,
  actions,
  onActionSelected,
  onClose,
}: AnnotationToolbarProps): JSX.Element {
  const ANNOTATION_TOOLBAR_WIDTH =
    ANNOTATION_BUTTON_WIDTH * actions.length + ANNOTATION_MENU_PADDING;
  const ANNOTATION_TOOLBAR_HEIGHT = 38;

  const xAxis =
    window.innerWidth > 500
      ? ANNOTATION_TOOLBAR_WIDTH + coordinates.x >= window.innerWidth
        ? coordinates.x - ANNOTATION_TOOLBAR_WIDTH - 30
        : coordinates.x
      : (window.innerWidth - ANNOTATION_TOOLBAR_WIDTH) / 2 - 32;

  const yAxis =
    coordinates.y <= 30
      ? coordinates.y + ANNOTATION_TOOLBAR_HEIGHT - 10
      : coordinates.y - 45;

  return (
    <div
      style={{
        top: yAxis,
        left: xAxis,
      }}
      data-y-coordinate={yAxis}
      data-x-coordinate={xAxis}
      className={
        "fixed z-50 flex flex-row items-center rounded-lg border border-gray-200 bg-white py-0.5 shadow-md"
      }
    >
      {actions.map((menu) => {
        return (
          <div key={menu.id} className={"flex flex-row items-center"}>
            <span
              className={"mx-0.5 h-[23px] w-[1.5px] bg-gray-300 "}
              hidden={!(menu.separator ?? false)}
            />
            <div
              className={conditionalClassName(
                "mx-[3px] cursor-pointer rounded-md p-1 hover:bg-gray-200",
                menu.active ?? false ? "bg-blue-200 fill-blue-800" : null,
              )}
              title={menu.name}
              onClick={() => {
                switch (menu.execute.type) {
                  case "style": {
                    onActionSelected(menu.execute);
                    break;
                  }
                  case "linkInput": {
                    const args = menu.execute.args;
                    dialogRoot?.render(
                      <InputDialog
                        coordinates={{
                          x: xAxis,
                          y: yAxis,
                        }}
                        active={menu.active ?? false}
                        inputArgs={{
                          type: "text",
                          hint: menu.execute.args.hint,
                          payload: menu.execute.args.payload,
                          regex: menu.execute.args.regex,
                        }}
                        onConfirm={(data) => {
                          onActionSelected({
                            type: "linkInput",
                            args: {
                              ...args,
                              payload: data,
                            },
                          });
                        }}
                        onClose={() => {
                          dialogRoot?.render(<Fragment />);
                        }}
                      />,
                    );
                    break;
                  }
                  case "styleInput": {
                    const args = menu.execute.args;
                    if (args.inputType === "number") {
                      dialogRoot?.render(
                        <InputDialog
                          coordinates={{
                            x: xAxis,
                            y: yAxis,
                          }}
                          active={menu.active ?? false}
                          inputArgs={{
                            type: "text",
                            hint: menu.execute.args.hint,
                            payload: menu.execute.args.payload.value,
                            regex: menu.execute.args.regex,
                          }}
                          onConfirm={(data) => {
                            onActionSelected({
                              type: "style",
                              args: [
                                {
                                  name: args.payload.name,
                                  value: data,
                                },
                              ],
                            });
                          }}
                          onClose={() => {
                            dialogRoot?.render(<Fragment />);
                          }}
                        />,
                      );
                    } else if (args.inputType === "color") {
                      dialogRoot?.render(
                        <ColorPickerDialog
                          coordinates={{
                            x: xAxis,
                            y: yAxis,
                          }}
                          active={menu.active ?? false}
                          inputArgs={{
                            type: args.inputType,
                            regex: args.regex,
                            payload: args.payload.value,
                            hint: args.hint,
                          }}
                          onColorSelected={(colorHexCode) => {
                            onActionSelected({
                              type: "style",
                              args: [
                                {
                                  name: args.payload.name,
                                  value: colorHexCode,
                                },
                              ],
                            });
                          }}
                          onClose={() => {
                            dialogRoot?.render(<Fragment />);
                          }}
                        />,
                      );
                    }
                    break;
                  }
                }
                onClose();
              }}
            >
              {menu.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}
