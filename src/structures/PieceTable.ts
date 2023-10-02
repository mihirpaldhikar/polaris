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

import { type Piece } from "../interfaces";

class PieceTable {
  private readonly pieceTable: Piece[];
  private readonly originalString: string;
  private appendString: string;

  public constructor(initialString: string) {
    this.originalString = initialString;
    this.appendString = "";
    this.pieceTable = [
      {
        source: "original",
        offset: 0,
        length: initialString.length,
      },
    ];
  }

  public insert(string: string, offset: number): void {
    const appendStringLength: number = this.appendString.length;
    const [pieceIndex] = this.getPieceIndex(offset);
    this.appendString = this.appendString.concat(string);
    const currentPiece = this.pieceTable[pieceIndex];
    currentPiece.length =
      currentPiece.source === "original"
        ? this.originalString.substring(currentPiece.offset, offset).length
        : this.appendString.substring(currentPiece.offset, offset).length;
    const newPiece: Piece = {
      source: "append",
      offset: appendStringLength,
      length: string.length,
    };
    const endPiece: Piece = {
      source: currentPiece.source,
      offset: currentPiece.length,
      length:
        currentPiece.source === "original"
          ? this.originalString.substring(offset).length
          : this.appendString.substring(offset).length,
    };

    this.pieceTable.splice(
      pieceIndex,
      1,
      ...[currentPiece, newPiece, endPiece].filter((piece) => piece.length > 0),
    );
  }

  public getSequence(): string {
    let string: string = "";
    for (let i = 0; i < this.pieceTable.length; i++) {
      if (this.pieceTable[i].source === "original") {
        string = string.concat(
          this.originalString.substring(
            this.pieceTable[i].offset,
            this.pieceTable[i].offset + this.pieceTable[i].length,
          ),
        );
      } else {
        string = string.concat(
          this.appendString.substring(
            this.pieceTable[i].offset,
            this.pieceTable[i].offset + this.pieceTable[i].length,
          ),
        );
      }
    }
    return string;
  }

  public delete(offset: number, length: number): void {
    if (length === 0) {
      return;
    }
    if (length < 0) {
      this.delete(offset + length, -length);
    }
    if (offset < 0) {
      throw new Error("Index out of bound");
    }

    const [initialAffectedPieceIndex, initialBufferOffset] =
      this.getPieceIndex(offset);
    const [finalAffectedPieceIndex, finalBufferOffset] = this.getPieceIndex(
      offset + length,
    );

    if (initialAffectedPieceIndex === finalAffectedPieceIndex) {
      const piece = this.pieceTable[initialAffectedPieceIndex];
      if (initialBufferOffset === piece.offset) {
        piece.offset += length;
        piece.length -= length;
        return;
      } else if (finalBufferOffset === piece.offset + piece.length) {
        piece.length -= length;
        return;
      }
    }

    const deletePieces: Piece[] = [
      {
        source: this.pieceTable[initialAffectedPieceIndex].source,
        offset: this.pieceTable[initialAffectedPieceIndex].offset,
        length:
          initialBufferOffset -
          this.pieceTable[initialAffectedPieceIndex].offset,
      },
      {
        source: this.pieceTable[finalAffectedPieceIndex].source,
        offset: finalBufferOffset,
        length:
          this.pieceTable[finalAffectedPieceIndex].length -
          (finalBufferOffset - this.pieceTable[finalAffectedPieceIndex].offset),
      },
    ].filter(function (piece: Piece) {
      return piece.length > 0;
    });

    this.pieceTable.splice(
      initialAffectedPieceIndex,
      finalAffectedPieceIndex - initialAffectedPieceIndex + 1,
      ...deletePieces,
    );
  }

  public stringAt(offset: number, length: number): string | null {
    if (length < 0) {
      return this.stringAt(offset + length, -length);
    }
    let str = "";
    const [initialPieceIndex] = this.getPieceIndex(offset);
    const [finalPieceIndex] = this.getPieceIndex(offset + length);

    if (initialPieceIndex === finalPieceIndex) {
      str = str.concat(
        this.pieceTable[initialPieceIndex].source === "original"
          ? this.originalString.substring(
              this.pieceTable[initialPieceIndex].offset,
              length,
            )
          : this.appendString.substring(
              this.pieceTable[initialPieceIndex].offset,
              length,
            ),
      );
    } else {
      for (let i = initialPieceIndex; i <= finalPieceIndex; i++) {
        if (i === initialPieceIndex) {
          str = str.concat(
            this.pieceTable[i].source === "original"
              ? this.originalString.substring(
                  offset,
                  this.pieceTable[i].offset + this.pieceTable[i].length,
                )
              : this.appendString.substring(
                  offset,
                  this.pieceTable[i].offset + this.pieceTable[i].length,
                ),
          );
        } else if (i === finalPieceIndex) {
          str = str.concat(
            this.pieceTable[i].source === "original"
              ? this.originalString.substring(
                  this.pieceTable[i].offset,
                  length + 1,
                )
              : this.appendString.substring(
                  this.pieceTable[i].offset,
                  length + 1,
                ),
          );
        } else {
          str = str.concat(
            this.pieceTable[i].source === "original"
              ? this.originalString.substring(
                  this.pieceTable[i].offset,
                  this.pieceTable[i].offset + this.pieceTable[i].length,
                )
              : this.appendString.substring(
                  this.pieceTable[i].offset,
                  this.pieceTable[i].offset + this.pieceTable[i].length,
                ),
          );
        }
      }
    }
    return str === "" ? null : str;
  }

  private getPieceIndex(offset: number): number[] {
    if (offset < 0) {
      throw new Error("Index out of bound.");
    }
    let remainingOffset = offset;
    for (let i = 0; i < this.pieceTable.length; i++) {
      if (remainingOffset <= this.pieceTable[i].length) {
        return [i, this.pieceTable[i].offset + remainingOffset];
      }
      remainingOffset = remainingOffset - this.pieceTable[i].length;
    }
    throw new Error("Index out of bound.");
  }
}

export default PieceTable;
