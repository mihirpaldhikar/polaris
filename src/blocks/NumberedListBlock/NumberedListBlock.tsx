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

import { createElement, Fragment, type JSX, useContext } from "react";
import {
  type BlockLifecycle,
  type BlockSchema,
  type GenericBlockPlugin,
} from "../../interfaces";
import { type ListBlockSchema } from "../../schema";
import { getConfigFromRole, setNodeStyle } from "../../utils";
import { type ListBlockConfig } from "../../interfaces/PolarisConfig";
import RootContext from "../../contexts/RootContext/RootContext";

interface NumberedListBlockProps {
  block: ListBlockSchema;
  blockLifecycle: BlockLifecycle;
}

export default function NumberedListBlock({
  block,
  blockLifecycle,
}: NumberedListBlockProps): JSX.Element {
  const { editable } = blockLifecycle;
  const { config } = useContext(RootContext);

  return createElement(
    "ol",
    {
      id: block.id,
      disabled: !editable,
      style: setNodeStyle(block.style),
      spellCheck: true,
      className: "my-4 ml-4 pl-4 block list-decimal",
    },
    block.data.map((childBlock: BlockSchema, index) => {
      if (
        typeof childBlock.role === "string" &&
        childBlock.role.toLowerCase().includes("list")
      ) {
        return <Fragment key={childBlock.id} />;
      }
      return (
        <li
          key={childBlock.id}
          className={"pl-2"}
          style={{
            marginTop: `${
              (getConfigFromRole(block.role, config) as ListBlockConfig).spacing
            }rem`,
          }}
        >
          {window.registeredBlocks.has(block.role) ? (
            (
              window.registeredBlocks?.get(
                childBlock.role,
              ) as GenericBlockPlugin
            ).render(childBlock, {
              listMetadata: {
                parent: block,
                currentIndex: index,
              },
              ...blockLifecycle,
            })
          ) : (
            <Fragment />
          )}
        </li>
      );
    }),
  );
}
