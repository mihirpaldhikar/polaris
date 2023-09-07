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
import {
  conditionalClassName,
  getBlockNode,
  getEditorRoot,
  setNodeStyle,
} from "../../utils";
import {
  type Attachment,
  type Block,
  type Coordinates,
  type Menu,
} from "../../interfaces";
import RootContext from "../../contexts/RootContext/RootContext";
import { MoreOptionsIcon } from "../../assets";
import { ContextMenu } from "../../components/ContextMenu";

interface AttachmentHolderProps {
  children: JSX.Element;
  parentBlock?: Block;
  block: Block;
  attachmentTools: Menu[];
  onDelete: () => void;
  onChange: (block: Block) => void;
}

export default function AttachmentHolder({
  block,
  children,
  attachmentTools,
  onDelete,
  onChange,
}: AttachmentHolderProps): JSX.Element {
  const { popUpRoot, dialogRoot } = useContext(RootContext);

  const tools = attachmentTools.filter((tool) => {
    if (tool.allowedOn !== undefined) {
      return tool.allowedOn?.includes(block.role);
    }
    return true;
  });

  return (
    <div
      className={"w-full"}
      style={{
        ...setNodeStyle(block.style),
      }}
    >
      <div
        className={conditionalClassName(
          "relative",
          (block.data as Attachment).url.startsWith("https://gist.github.com/")
            ? "w-full block"
            : "w-fit inline-block",
        )}
      >
        {children}
        <div
          className={
            "absolute right-0 top-0 m-1 flex w-fit cursor-pointer items-center justify-end rounded-md border border-gray-300 bg-white/60 backdrop-blur"
          }
        >
          <div
            onClick={() => {
              const currentNode = getBlockNode(block.id) as HTMLElement;
              const coordinates: Coordinates = {
                y: currentNode.getBoundingClientRect().y,
                x:
                  window.innerWidth > 500
                    ? currentNode.getBoundingClientRect().right
                    : 30,
              };

              if (popUpRoot !== undefined && dialogRoot !== undefined) {
                const editorRoot = getEditorRoot();
                editorRoot.addEventListener(
                  "click",
                  () => {
                    popUpRoot.render(<Fragment />);
                    dialogRoot.render(<Fragment />);
                  },
                  {
                    once: true,
                  },
                );
                popUpRoot.render(
                  <ContextMenu
                    coordinates={coordinates}
                    menu={tools}
                    onClick={(execute) => {
                      if (typeof execute.args === "function") {
                        execute.args(
                          block,
                          onChange,
                          onDelete,
                          popUpRoot,
                          dialogRoot,
                        );
                      }
                    }}
                    onClose={() => {
                      popUpRoot.render(<Fragment />);
                    }}
                  />,
                );
              }
            }}
          >
            <MoreOptionsIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
