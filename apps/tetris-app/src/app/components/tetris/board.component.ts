import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisEngine } from '../../tetris.engine';
import { ScoreComponent } from './score.component';

@Component({
  selector: 'app-tetris-board',
  imports: [CommonModule, FormsModule, ScoreComponent],
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

    <app-score />
  `,
  styles: `
    .game-board {
      border: 2px solid #888888;
      background-color: #444444;
      border-radius: 8px;
      padding: 10px;
    }

    .row {
      display: flex;
    }

    .cell {
      width: 30px;
      height: 30px;
      border: 1px solid #888888;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TetrisBoardComponent {
  tetris = inject(TetrisEngine);
}
