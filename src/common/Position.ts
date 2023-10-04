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
 * A position in the editor. This interface is suitable for serialization.
 */
export interface IPosition {
  /**
   * line number (starts at 1)
   */
  readonly lineNumber: number;
  /**
   * column (the first character in a line is between column 1 and column 2)
   */
  readonly column: number;
}

/**
 * A position in the editor.
 */
export class Position {
  /**
   * line number (starts at 1)
   */
  public readonly lineNumber: number;
  /**
   * column (the first character in a line is between column 1 and column 2)
   */
  public readonly column: number;

  constructor(lineNumber: number, column: number) {
    this.lineNumber = lineNumber;
    this.column = column;
  }

  /**
   * Test if position `a` equals position `b`
   */
  public static equals(a: IPosition | null, b: IPosition | null): boolean {
    if (a == null && b == null) {
      return true;
    }
    return (
      !(a == null) &&
      !(b == null) &&
      a.lineNumber === b.lineNumber &&
      a.column === b.column
    );
  }

  /**
   * Test if position `a` is before position `b`.
   * If the two positions are equal, the result will be false.
   */
  public static isBefore(a: IPosition, b: IPosition): boolean {
    if (a.lineNumber < b.lineNumber) {
      return true;
    }
    if (b.lineNumber < a.lineNumber) {
      return false;
    }
    return a.column < b.column;
  }

  /**
   * Test if position `a` is before position `b`.
   * If the two positions are equal, the result will be true.
   */
  public static isBeforeOrEqual(a: IPosition, b: IPosition): boolean {
    if (a.lineNumber < b.lineNumber) {
      return true;
    }
    if (b.lineNumber < a.lineNumber) {
      return false;
    }
    return a.column <= b.column;
  }

  /**
   * A function that compares positions, useful for sorting
   */
  public static compare(a: IPosition, b: IPosition): number {
    const aLineNumber = a.lineNumber | 0;
    const bLineNumber = b.lineNumber | 0;

    if (aLineNumber === bLineNumber) {
      const aColumn = a.column | 0;
      const bColumn = b.column | 0;
      return aColumn - bColumn;
    }

    return aLineNumber - bLineNumber;
  }

  /**
   * Create a `Position` from an `IPosition`.
   */
  public static lift(pos: IPosition): Position {
    return new Position(pos.lineNumber, pos.column);
  }

  /**
   * Test if `obj` is an `IPosition`.
   */
  public static isIPosition(obj: any): obj is IPosition {
    return (
      typeof obj === "object" &&
      typeof obj.lineNumber === "number" &&
      typeof obj.column === "number"
    );
  }

  /**
   * Create a new position from this position.
   *
   * @param newLineNumber new line number
   * @param newColumn new column
   */
  with(
    newLineNumber: number = this.lineNumber,
    newColumn: number = this.column,
  ): Position {
    if (newLineNumber === this.lineNumber && newColumn === this.column) {
      return this;
    } else {
      return new Position(newLineNumber, newColumn);
    }
  }

  /**
   * Derive a new position from this position.
   *
   * @param deltaLineNumber line number delta
   * @param deltaColumn column delta
   */
  delta(deltaLineNumber: number = 0, deltaColumn: number = 0): Position {
    return this.with(
      this.lineNumber + deltaLineNumber,
      this.column + deltaColumn,
    );
  }

  /**
   * Test if this position equals other position
   */
  public equals(other: IPosition): boolean {
    return Position.equals(this, other);
  }

  /**
   * Test if this position is before other position.
   * If the two positions are equal, the result will be false.
   */
  public isBefore(other: IPosition): boolean {
    return Position.isBefore(this, other);
  }

  /**
   * Test if this position is before other position.
   * If the two positions are equal, the result will be true.
   */
  public isBeforeOrEqual(other: IPosition): boolean {
    return Position.isBeforeOrEqual(this, other);
  }

  // ---

  /**
   * Clone this position.
   */
  public clone(): Position {
    return new Position(this.lineNumber, this.column);
  }

  /**
   * Convert to a human-readable representation.
   */
  public toString(): string {
    return "(" + this.lineNumber + "," + this.column + ")";
  }
}
