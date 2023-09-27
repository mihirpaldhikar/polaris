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

import { type JSX, useEffect } from "react";
import { type Coordinates } from "../../interfaces";
import { getEditorRoot } from "../../utils";

interface DialogBoxProps {
  focusElementId: string;
  coordinates: Coordinates;
  children: JSX.Element;
  onClose: () => void;
  onConfirm: () => void;
  onInitialize?: () => void;
}

export default function DialogBox({
  focusElementId,
  coordinates,
  children,
  onConfirm,
  onClose,
  onInitialize,
}: DialogBoxProps): JSX.Element {
  useEffect(() => {
    function onKeyboardEvent(event: KeyboardEvent): void {
      switch (event.key.toLowerCase()) {
        case "escape": {
          event.preventDefault();
          onClose();
          break;
        }
        case "enter": {
          event.preventDefault();
          onConfirm();
          onClose();
          break;
        }
      }
    }

    function onMouseEvent(): void {
      onClose();
    }

    const editorRootNode = getEditorRoot();

    const dialogBoxNode = document.getElementById("dialog-box") as HTMLElement;

    dialogBoxNode.addEventListener("keydown", onKeyboardEvent);
    editorRootNode.addEventListener("mousedown", onMouseEvent);

    const focusElement = document.getElementById(focusElementId);
    if (focusElement != null) {
      focusElement.focus();
    }

    if (onInitialize !== undefined) {
      onInitialize();
    }

    return () => {
      dialogBoxNode.removeEventListener("keydown", onKeyboardEvent);
      editorRootNode.removeEventListener("mousedown", onMouseEvent);
    };
  }, [focusElementId, onClose, onConfirm, onInitialize]);

  const DIALOG_WIDTH: number = 250;

  const xAxis: number =
    window.innerWidth > 500
      ? coordinates.x + DIALOG_WIDTH > window.innerWidth
        ? coordinates.x - DIALOG_WIDTH
        : coordinates.x
      : 30;

  return (
    <div
      id={"dialog-box"}
      style={{
        top: coordinates.y - 60,
        left: xAxis,
      }}
      data-y-coordinate={coordinates.y - 60}
      data-x-coordinate={xAxis}
      className={
        "fixed flex w-[250px] flex-col z-30 space-y-3 rounded-lg border border-gray-300 bg-white px-2 py-3 shadow-lg"
      }
    >
      {children}
    </div>
  );
}
