import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisPiece } from '@tetris-game/models';
const BLOCK_SIZE = 12;
@Component({
  selector: 'app-mini-piece',
  imports: [CommonModule, FormsModule],
  template: `
@for (row of piece().shape; let i = $index; track i) {
  @for (cell of row; let j = $index; track j) {
<div [class]="cell === 0 ? 'empty' : 'fill'"
[style.background-color]="piece().color"
[style.top.px]="i * BLOCK_SIZE"
[style.left.px]="j * BLOCK_SIZE"></div>
}
}
  `,
  styles: `
  :host {
    position: relative;
    display: block;

    .empty {
      position: absolute;
      opacity: 0;
      width: ${BLOCK_SIZE}px;
      height: ${BLOCK_SIZE}px;
      display: block;
    }

    .fill {
      position: absolute;
      opacity: 1;
      width: ${BLOCK_SIZE}px;
      height: ${BLOCK_SIZE}px;
      display: block;
      border: solid 1px  rgb(80, 71, 71);
    }
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniPieceComponent {
  piece = input.required<TetrisPiece>();
  BLOCK_SIZE = BLOCK_SIZE;
}
