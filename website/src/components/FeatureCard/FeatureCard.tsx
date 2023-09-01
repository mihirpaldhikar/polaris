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
import { IconContext } from "react-icons";
import { Glow } from "@components/index";

interface FeatureCardProps {
  title: string;
  icon: JSX.Element;
  description: string;
}

export default function FeatureCard({
  title,
  icon,
  description,
}: FeatureCardProps): JSX.Element {
  return (
    <div className="max-w-md mx-auto bg-white rounded-md border border-gray-300 overflow-hidden md:max-w-2xl">
      <div className="flex">
        <div className="md:shrink-0 flex items-center px-5">
          <Glow>
            <IconContext.Provider value={{ size: "25" }}>
              <div className={"p-3"}>{icon}</div>
            </IconContext.Provider>
          </Glow>
        </div>
        <div className="p-8">
          <h2 className="block mt-1 text-lg leading-tight font-bold text-black hover:underline">
            {title}
          </h2>
          <p className="mt-2 text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  );
}
