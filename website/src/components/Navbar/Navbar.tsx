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

"use client";

import { type JSX, useState } from "react";
import { type Menu } from "@interfaces/index";
import { Bars2Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { MenuItem } from "@components/index";

interface NavbarProps {
  menus: Menu[];
}

export default function Navbar({ menus }: NavbarProps): JSX.Element {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className={
        "fixed flex-col top-0 w-full z-50 flex bg-white/30 backdrop-blur"
      }
    >
      <div
        className={
          "flex items-center px-5 py-2  justify-between h-16 border-b border-b-gray-300"
        }
      >
        <div className={"flex items-center justify-start space-x-2"}>
          <span className={"font-bold text-2xl"}>Polaris</span>
          <span
            className={
              "font-medium bg-red-600 text-white text-sm rounded-md px-1 py-0.5"
            }
          >
            Alpha
          </span>
        </div>
        <div className={"desktopMenu space-x-4"}>
          {menus.map((menu, index) => {
            return <MenuItem key={index} menu={menu} />;
          })}
        </div>
        <div
          className={"mobileMenu w-9 h-9"}
          onClick={() => {
            setMobileMenuOpen(!isMobileMenuOpen);
          }}
        >
          {!isMobileMenuOpen ? <Bars2Icon /> : <XMarkIcon />}
        </div>
      </div>
      <div
        hidden={!isMobileMenuOpen}
        className={"space-y-3 px-5 py-3 border-b"}
      >
        {menus.map((menu, index) => {
          return <MenuItem key={index} menu={menu} />;
        })}
      </div>
    </nav>
  );
}
