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

export default function NumberedListIcon({
  size,
}: {
  size?: number;
}): JSX.Element {
  return (
    <svg
      width={size ?? 40}
      height={size ?? 40}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="54"
        y1="70.5"
        x2="167"
        y2="70.5"
        stroke="black"
        strokeWidth="7"
      />
      <line
        x1="54"
        y1="100.5"
        x2="132"
        y2="100.5"
        stroke="black"
        strokeWidth="7"
      />
      <line
        x1="54"
        y1="130.5"
        x2="143"
        y2="130.5"
        stroke="black"
        strokeWidth="7"
      />
      <path
        d="M33.1525 76V66.25L34.0075 67.135H30.9325V65.5H35.1025V76H33.1525ZM38.3554 76.105C38.0154 76.105 37.7254 75.99 37.4854 75.76C37.2454 75.52 37.1254 75.22 37.1254 74.86C37.1254 74.48 37.2454 74.18 37.4854 73.96C37.7254 73.73 38.0154 73.615 38.3554 73.615C38.6954 73.615 38.9854 73.73 39.2254 73.96C39.4654 74.18 39.5854 74.48 39.5854 74.86C39.5854 75.22 39.4654 75.52 39.2254 75.76C38.9854 75.99 38.6954 76.105 38.3554 76.105Z"
        fill="black"
      />
      <path
        d="M29.7555 104V102.695L33.9255 98.735C34.2755 98.405 34.5355 98.115 34.7055 97.865C34.8755 97.615 34.9855 97.385 35.0355 97.175C35.0955 96.955 35.1255 96.75 35.1255 96.56C35.1255 96.08 34.9605 95.71 34.6305 95.45C34.3005 95.18 33.8155 95.045 33.1755 95.045C32.6655 95.045 32.2005 95.135 31.7805 95.315C31.3705 95.495 31.0155 95.77 30.7155 96.14L29.3505 95.09C29.7605 94.54 30.3105 94.115 31.0005 93.815C31.7005 93.505 32.4805 93.35 33.3405 93.35C34.1005 93.35 34.7605 93.475 35.3205 93.725C35.8905 93.965 36.3255 94.31 36.6255 94.76C36.9355 95.21 37.0905 95.745 37.0905 96.365C37.0905 96.705 37.0455 97.045 36.9555 97.385C36.8655 97.715 36.6955 98.065 36.4455 98.435C36.1955 98.805 35.8305 99.22 35.3505 99.68L31.7655 103.085L31.3605 102.35H37.4955V104H29.7555ZM39.9374 104.105C39.5974 104.105 39.3074 103.99 39.0674 103.76C38.8274 103.52 38.7074 103.22 38.7074 102.86C38.7074 102.48 38.8274 102.18 39.0674 101.96C39.3074 101.73 39.5974 101.615 39.9374 101.615C40.2774 101.615 40.5674 101.73 40.8074 101.96C41.0474 102.18 41.1674 102.48 41.1674 102.86C41.1674 103.22 41.0474 103.52 40.8074 103.76C40.5674 103.99 40.2774 104.105 39.9374 104.105Z"
        fill="black"
      />
      <path
        d="M33.2637 132.15C32.5237 132.15 31.7987 132.045 31.0887 131.835C30.3887 131.615 29.7987 131.315 29.3187 130.935L30.1587 129.42C30.5387 129.73 30.9987 129.98 31.5387 130.17C32.0787 130.36 32.6437 130.455 33.2337 130.455C33.9337 130.455 34.4787 130.315 34.8687 130.035C35.2587 129.745 35.4537 129.355 35.4537 128.865C35.4537 128.385 35.2737 128.005 34.9137 127.725C34.5537 127.445 33.9737 127.305 33.1737 127.305H32.2137V125.97L35.2137 122.4L35.4687 123.135H29.8287V121.5H36.9837V122.805L33.9837 126.375L32.9637 125.775H33.5487C34.8387 125.775 35.8037 126.065 36.4437 126.645C37.0937 127.215 37.4187 127.95 37.4187 128.85C37.4187 129.44 37.2687 129.985 36.9687 130.485C36.6687 130.985 36.2087 131.39 35.5887 131.7C34.9787 132 34.2037 132.15 33.2637 132.15ZM39.8642 132.105C39.5242 132.105 39.2342 131.99 38.9942 131.76C38.7542 131.52 38.6342 131.22 38.6342 130.86C38.6342 130.48 38.7542 130.18 38.9942 129.96C39.2342 129.73 39.5242 129.615 39.8642 129.615C40.2042 129.615 40.4942 129.73 40.7342 129.96C40.9742 130.18 41.0942 130.48 41.0942 130.86C41.0942 131.22 40.9742 131.52 40.7342 131.76C40.4942 131.99 40.2042 132.105 39.8642 132.105Z"
        fill="black"
      />
    </svg>
  );
}
