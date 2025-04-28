import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisEngine } from '../../tetris.engine';

@Component({
  selector: 'app-tetris-board',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="game-board">
      @for (row of tetris.board(); track $index) {
      <div class="row">
        @for (cell of row; track $index) {
        <div class="cell" [style.background-color]="cell"></div>
        }
      </div>
      }
    </div>
  `,
  styles: `
    .game-board {
      border: 2px solid #333;
      background-color: transparent;
      border-radius: 8px;
      padding: 10px;
    }

    .row {
      display: flex;
    }

    .cell {
      width: 30px;
      height: 30px;
      border: 1px solid #333;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TetrisBoardComponent {
  tetris = inject(TetrisEngine);
}
