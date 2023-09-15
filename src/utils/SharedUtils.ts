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

import { isYouTubeURL } from "./Validators";
import { YoutubeURLRegex } from "../constants";
import { v4 as uuid } from "uuid";

/**
 * @function generateUUID
 *
 * @description Generates a random string of provided length size.
 *
 * @returns string
 *
 * @author Mihir Paldhikar
 */

export function generateUUID(): string {
  return uuid();
}

export function isAllowedActionMenuKey(key: string): boolean {
  switch (key.toLowerCase()) {
    case "a":
    case "b":
    case "c":
    case "d":
    case "e":
    case "f":
    case "g":
    case "h":
    case "i":
    case "j":
    case "k":
    case "l":
    case "m":
    case "n":
    case "o":
    case "p":
    case "q":
    case "r":
    case "s":
    case "t":
    case "u":
    case "v":
    case "w":
    case "x":
    case "y":
    case "z":
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      return true;
    default:
      return false;
  }
}

export function getYouTubeVideoID(url: string): string {
  if (!isYouTubeURL(url)) return "";
  return (url.match(YoutubeURLRegex) as RegExpMatchArray)[1];
}

export function generateGitHubGistURL(url: string): string {
  const githubGistData = url.split("#");
  const gistURL = githubGistData[0];
  let file =
    githubGistData.length === 1
      ? ""
      : "?".concat(githubGistData[1].replace("file-", "file="));
  if (file !== "" && file.includes("-")) {
    const fileMeta = file.split("-");
    file = "";
    for (let i = 0; i < fileMeta.length; i++) {
      if (i === fileMeta.length - 1) {
        file = file.concat(".".concat(fileMeta[i]));
      } else if (i === 0) {
        file = file.concat(fileMeta[i]);
      } else {
        file = file.concat("%20".concat(fileMeta[i]));
      }
    }
  }
  return `${gistURL}.js${file}`;
}
