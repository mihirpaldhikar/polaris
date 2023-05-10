/*
 * Copyright (c) 2023 Mihir Paldhikar
 *
 * Polaris is a proprietary software owned, developed and
 * maintained by Mihir Paldhikar.
 *
 * No part of the software should be distributed or reverse
 * engineered in any form without the permission of the owner.
 *
 * Doing so will result into a legal action without any prior notice.
 *
 * All Rights Reserved.
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
