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
  type Coordinates,
  type Executable,
  type InputArgs,
  type Menu,
  type Style,
} from "../../interfaces";
import { conditionalClassName, getEditorRoot } from "../../utils";
import { InputDialog } from "../InputDialog";
import { ColorPickerDialog } from "../ColorPickerDialog";
import { REMOVE_COLOR } from "../../constants";
import { Root } from "react-dom/client";

const ACTION_BUTTON_WIDTH: number = 28;
const ACTION_MENU_PADDING: number = 42;

interface SelectionMenuProps {
  dialogRoot: Root | undefined;
  coordinates: Coordinates;
  menus: Menu[];
  onMenuSelected: (executable: Executable) => void;
  onClose: () => void;
}

export default function SelectionMenu({
  dialogRoot,
  coordinates,
  menus,
  onMenuSelected,
  onClose,
}: SelectionMenuProps): JSX.Element {
  const ACTION_MENU_WIDTH =
    ACTION_BUTTON_WIDTH * menus.length + ACTION_MENU_PADDING;
  const ACTION_MENU_HEIGHT = 38;

  const xAxis =
    window.innerWidth - (ACTION_MENU_WIDTH + coordinates.x) <= 1
      ? coordinates.x - ACTION_MENU_WIDTH - 30
      : coordinates.x;

  const yAxis =
    coordinates.y <= 30
      ? coordinates.y + ACTION_MENU_HEIGHT - 10
      : coordinates.y - 45;

  return (
    <div
      style={{
        top: yAxis,
        left: xAxis,
      }}
      className={
        "fixed z-10 flex flex-row items-center rounded-lg border border-black/10 bg-white py-0.5 shadow-md"
      }
    >
      {menus.map((menu) => {
        return (
          <div key={menu.id} className={"flex flex-row items-center"}>
            <span
              className={"mx-0.5 h-[23px] w-[1.5px] bg-gray-300 "}
              hidden={!(menu.separator ?? false)}
            />
            <div
              className={conditionalClassName(
                "mx-[3px] cursor-pointer rounded-md p-1 hover:bg-gray-200",
                menu.active ?? false ? "bg-blue-200 fill-blue-800" : null
              )}
              title={menu.name}
              onClick={() => {
                if (menu.execute.type !== "input") {
                  onMenuSelected(menu.execute);
                } else {
                  const inputArgs = menu.execute.args as InputArgs;
                  const editorNode = getEditorRoot();

                  if (dialogRoot === undefined) return;

                  if (inputArgs.type === "color") {
                    dialogRoot.render(
                      <ColorPickerDialog
                        active={menu.active ?? false}
                        coordinates={coordinates}
                        inputArgs={inputArgs}
                        onColorSelected={(colorHexCode) => {
                          const style: Style[] = [
                            {
                              name: (inputArgs.initialPayload as Style).name,
                              value: colorHexCode,
                              enabled: colorHexCode !== REMOVE_COLOR,
                            },
                          ];
                          onMenuSelected({
                            type: "style",
                            args: style,
                          });
                        }}
                        onClose={() => {
                          dialogRoot.render(<Fragment />);
                        }}
                      />
                    );
                  } else {
                    dialogRoot.render(
                      <InputDialog
                        coordinates={coordinates}
                        active={menu.active ?? false}
                        inputArgs={menu.execute.args as InputArgs}
                        onClose={() => {
                          dialogRoot.render(<Fragment />);
                        }}
                        onConfirm={(data, remove) => {
                          switch (inputArgs.executionTypeAfterInput) {
                            case "link": {
                              onMenuSelected({
                                type: "link",
                                args: data,
                              });
                              break;
                            }
                            case "style": {
                              const style: Style[] = [
                                {
                                  name: (inputArgs.initialPayload as Style)
                                    .name,
                                  value: `${data}${inputArgs.unit ?? ""}`,
                                  enabled: !(remove === true),
                                },
                              ];
                              onMenuSelected({
                                type: "style",
                                args: style,
                              });
                              break;
                            }
                          }
                        }}
                      />
                    );
                  }

                  editorNode.addEventListener(
                    "mousedown",
                    () => {
                      dialogRoot.render(<Fragment />);
                    },
                    {
                      once: true,
                    }
                  );
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
