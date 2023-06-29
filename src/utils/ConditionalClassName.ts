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

/**
 * @function conditionalClassName
 * @param classNames
 *
 * @description Creates a string containing classNames when corresponding conditions are satisfied.
 *
 * @author Mihir Paldhikar
 */

function conditionalClassName(
  ...classNames: Array<string | boolean | null | undefined>
): string;

function conditionalClassName(): string {
  let className = "";
  let iterator = 0;
  let args: unknown;

  for (; iterator < arguments.length; ) {
    if (Boolean((args = arguments[iterator++])) && typeof args === "string") {
      className += " ";
      className += args;
    }
  }
  return className;
}

export { conditionalClassName };
export default conditionalClassName;
