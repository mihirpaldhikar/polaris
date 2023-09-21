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
import { type BlockLifecycle, type BlockSchema } from "../../interfaces";
import type GenericBlockPlugin from "../../interfaces/GenericBlockPlugin";

interface ComposerProps {
  block: BlockSchema;
  blockLifecycle: BlockLifecycle;
}

/**
 * @function Composer
 *
 * @param editable
 * @param block
 * @returns JSX.Element
 *
 * @description Composer is responsible for rendering the Node from the BlockSchema. It also manages and updates the content of the block when the Node is mutated.
 *
 * @author Mihir Paldhikar
 */

export default function Composer({
  blockLifecycle,
  block,
}: ComposerProps): JSX.Element {
  if (window?.registeredBlocks?.has(block.role)) {
    return (
      window.registeredBlocks.get(block.role) as GenericBlockPlugin
    ).render(block, blockLifecycle);
  }
  throw new Error(`Block with role '${block.role}' is not registered.`);
}
