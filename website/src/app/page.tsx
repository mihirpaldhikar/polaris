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
import { type JSX, useEffect, useState } from "react";
import {
  type Blob,
  DEFAULT_POLARIS_CONFIG,
  Editor,
  generateUUID,
  serializeFileToBase64,
} from "@mihirpaldhikar/polaris";
import Link from "next/link";
import { FeatureCard, Glow, ProgressBar, ZigZag } from "@components/index";
import { FaMarkdown } from "react-icons/fa6";
import { FaMagic } from "react-icons/fa";

export default function Home(): JSX.Element {
  const [mounted, setMounted] = useState(false);

  const blob: Blob = {
    id: generateUUID(),
    name: "Polaris Doc",
    blocks: [
      {
        id: generateUUID(),
        role: "title",
        data: "Introducing Polaris",
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
        data: "Polaris is a WYSIWYG Editor, built on top of Web APIs and React for creating a rich editing experiences. With powerful editing support, you can write and get exact output in HTML.",
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
        role: "subTitle",
        data: "Features",
        style: [],
      },
      {
        id: generateUUID(),
        role: "numberedList",
        data: [
          {
            id: generateUUID(),
            role: "paragraph",
            data: "'/' (slash) commands for performing various actions.",
            style: [],
          },
          {
            id: generateUUID(),
            role: "paragraph",
            data: 'Selection menu for applying inline styling such as <span data-type="inline-specifier" style="font-weight: bold;">bold</span>, <span data-type="inline-specifier" style="font-style: italic;">italic</span>, <span data-type="inline-specifier" style="text-decoration: underline;">underline</span> and <span data-type="inline-specifier" data-link="https://mihirpaldhikar.com" style="text-decoration: underline;">links</span>.',
            style: [],
          },
          {
            id: generateUUID(),
            role: "paragraph",
            data: "Markdown support",
            style: [],
          },
          {
            id: generateUUID(),
            role: "paragraph",
            data: "Images support",
            style: [],
          },
        ],
        style: [],
      },
      {
        id: generateUUID(),
        role: "subHeading",
        data: "Tables Support",
        style: [],
      },
      {
        id: generateUUID(),
        role: "table",
        data: {
          rows: [
            {
              id: generateUUID(),
              columns: [
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Sr. No",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Company",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "CEO",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Headquarters",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Website",
                  style: [],
                },
              ],
            },
            {
              id: generateUUID(),
              columns: [
                {
                  id: "k123s9A1BBKurgZShm4a6JpE23",
                  role: "paragraph",
                  data: "1",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Google",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Sundar Pichai",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Googleplex, Mountain View, CA, USA",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: '<span data-type="inline-specifier" data-link="https://google.com" style="text-decoration: underline;">https://google.com</span>',
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
                  data: "2",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Microsoft",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Satya Nadella",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Redmond, Washington, USA",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: '<span data-type="inline-specifier" data-link="https://microsoft.com" style="text-decoration: underline;">https://microsoft.com</span>',
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
                  data: "3",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Apple",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "Tim Cook",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: "One Apple Park Way, Cupertino, CA, USA",
                  style: [],
                },
                {
                  id: generateUUID(),
                  role: "paragraph",
                  data: '<span data-type="inline-specifier" data-link="https://apple.com" style="text-decoration: underline;">https://apple.com</span>',
                  style: [],
                },
              ],
            },
          ],
        },
        style: [],
      },
      {
        id: generateUUID(),
        role: "quote",
        data: "This is an interactive playground. Start writing in the editor to experience the power of Polaris.",
        style: [],
      },
    ],
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <main className={"h-screen flex"}>
        <div className={"m-auto w-[300px] flex flex-col"}>
          <ProgressBar type={"linear"} />
        </div>
      </main>
    );

  return (
    <main>
      <div className={"flex items-center justify-center flex-col"}>
        <h2
          className={
            "font-black text-3xl md:text-5xl text-center my-10 md:mt-20 md:mb-5"
          }
        >
          Write at the speed of
          <span className={"flex flex-col justify-center items-center"}>
            thought <ZigZag />
          </span>
        </h2>
        <div className={"my-9"}>
          <Glow>
            <pre className={"px-5 py-3 rounded-md"}>
              npm install @mihirpaldhikar/polaris
            </pre>
          </Glow>
        </div>
      </div>
      <div
        className={
          "border-gray-300 border bg-white min-h-[300px] mb-10 lg:mx-60 rounded-md px-4 py-3"
        }
      >
        <Editor
          blob={blob}
          config={DEFAULT_POLARIS_CONFIG}
          onAttachmentSelected={async (data) => {
            if (typeof data !== "string")
              return await serializeFileToBase64(data);
            return "";
          }}
        />
      </div>
      <div className={"flex items-center flex-col justify-center"}>
        <div className={"my-10 grid grid-cols-1 md:grid-cols-2 gap-4"}>
          <FeatureCard
            title={"Format as you go"}
            icon={<FaMarkdown />}
            description={
              "Polaris has first class support for Markdown and Slash commands which changes the properties of the content on demand with just a '/'"
            }
          />
          <FeatureCard
            title={"Bring content to life"}
            icon={<FaMagic />}
            description={
              "Insert Images, Embeds like Twitter posts, YouTube videos and GitHub Gists in the document"
            }
          />
        </div>
        <div
          className={"my-10 flex flex-col items-center text-center space-y-5"}
        >
          <h2 className={"text-xl md:text-4xl font-bold"}>
            What You See Is What You Get
          </h2>
          <p className={"md:w-1/2 text-lg font-medium"}>
            Polaris displays live preview of your document as you type and
            format your content, so you can structure your writing the way you
            like! With the inbuilt feature of exporting content to pure HTML,
            you can get the HTML of your document instantly.
          </p>
          <Link
            href={"https://github.com/mihirpaldhikar/polaris#readme"}
            target={"_blank"}
            className={
              "bg-blue-700 hover:bg-blue-800 transition-colors duration-300 text-white rounded-md px-3 py-2"
            }
          >
            Integrate In You Project
          </Link>
        </div>
      </div>
    </main>
  );
}
