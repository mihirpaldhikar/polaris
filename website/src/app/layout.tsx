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

import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { type JSX, type ReactNode } from "react";
import { Navbar } from "@components/Navbar";
import { type Menu } from "@interfaces/index";
import { FaGithub } from "react-icons/fa6";
import { Footer } from "@components/Footer";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polaris",
  description:
    "A Rich Semantic Content Editor for creating rich editing experience built on top of Web APIs and React",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  const menus: Menu[] = [
    {
      name: "GitHub",
      destination: "https://github.com/mihirpaldhikar/polaris",
      icon: <FaGithub />,
    },
  ];

  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Navbar menus={menus} />
        <main className={"pt-20 px-3"}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
