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

import { type BlockLifecycle, type GenericBlockPlugin } from "../../interfaces";
import type React from "react";
import { TableIcon } from "../../assets";
import { generateUUID, isInlineAnnotationsNode } from "../../utils";
import TableBlock from "./TableBlock";
import { type TableBlockSchema } from "../../schema";
import { kebabCase } from "lodash";
import { LINK_ATTRIBUTE } from "../../constants";

export default class TableBlockPlugin
  implements GenericBlockPlugin<TableBlockSchema>
{
  description: string;
  icon: React.JSX.Element;
  name: string;
  role: string;

  constructor() {
    this.name = "Table";
    this.description = "Add tabular content.";
    this.role = "table";
    this.icon = <TableIcon />;
  }

  onInitialized(content: string): {
    focusBlockId: string;
    setCaretToStart?: boolean;
    inPlace?: boolean;
    template: TableBlockSchema;
  } {
    const focusId = generateUUID();
    return {
      focusBlockId: focusId,
      inPlace: content.length === 0,
      setCaretToStart: true,
      template: {
        id: generateUUID(),
        role: "table",
        style: [],
        data: {
          rows: [
            {
              id: generateUUID(),
              columns: [
                {
                  id: focusId,
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
              ],
            },
            {
              id: generateUUID(),
              columns: [
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
              ],
            },
            {
              id: generateUUID(),
              columns: [
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
              ],
            },
            {
              id: generateUUID(),
              columns: [
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "",
                  style: [],
                },
              ],
            },
          ],
        },
      },
    };
  }

  serializeToHTMLElement(block: TableBlockSchema): HTMLElement {
    const node = document.createElement("table");
    node.id = block.id;
    node.style.setProperty("display", "block");
    node.style.setProperty("table-layout", "auto");
    node.style.setProperty("border-collapse", "collapse");
    node.style.setProperty("overflow-x", "auto");
    const tableData = block.data;
    const tableBody = document.createElement("tbody");
    for (let i = 0; i < tableData.rows.length; i++) {
      const row = document.createElement("tr");
      row.id = tableData.rows[i].id;
      for (let j = 0; j < tableData.rows[i].columns.length; j++) {
        const cell = document.createElement(i === 0 ? "th" : "td");
        cell.id = tableData.rows[i].columns[j].id;
        cell.innerHTML = tableData.rows[i].columns[j].data;
        for (const style of tableData.rows[i].columns[j].style) {
          cell.style.setProperty(kebabCase(style.name), kebabCase(style.value));
        }
        cell.style.setProperty("padding-left", "0.75rem");
        cell.style.setProperty("padding-right", "0.75rem");
        cell.style.setProperty("padding-top", "0.5rem");
        cell.style.setProperty("padding-bottom", "0.5rem");
        cell.style.setProperty("border", "1px solid #d1d5db");
        for (const childNode of cell.childNodes) {
          if (isInlineAnnotationsNode(childNode)) {
            const element = childNode as HTMLElement;
            if (element.getAttribute(LINK_ATTRIBUTE) !== null) {
              const anchorNode = document.createElement("a");
              anchorNode.href = element.getAttribute(LINK_ATTRIBUTE) as string;
              anchorNode.target = "_blank";
              anchorNode.innerText = element.innerText;
              anchorNode.style.cssText = element.style.cssText;
              cell.replaceChild(anchorNode, element);
            }
          }
        }
        row.appendChild(cell);
      }
      tableBody.appendChild(row);
    }
    node.appendChild(tableBody);
    return node;
  }

  render(
    block: TableBlockSchema,
    lifecycle: BlockLifecycle,
  ): React.JSX.Element {
    return <TableBlock block={block} blockLifecycle={lifecycle} />;
  }
}
