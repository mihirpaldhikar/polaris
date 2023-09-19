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

import { type PolarisConfig } from "../interfaces";

export const DEFAULT_POLARIS_CONFIG: PolarisConfig = {
  block: {
    text: {
      title: {
        fontSize: 2.25,
        fontWight: 800,
      },
      subTitle: {
        fontSize: 1.875,
        fontWight: 700,
      },
      heading: {
        fontSize: 1.5,
        fontWight: 600,
      },
      subHeading: {
        fontSize: 1.25,
        fontWight: 500,
      },
      paragraph: {
        fontSize: 1,
        fontWight: 400,
      },
      quote: {
        fontSize: 1,
        fontWight: 500,
      },
    },
    attachment: {
      spacing: 1,
    },
    list: {
      spacing: 1,
    },
  },
};
