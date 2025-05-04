import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisEngine } from '../../tetris.engine';

@Component({
  selector: 'app-score',
  imports: [CommonModule, FormsModule],
  template: ` <h3>Score: {{ tetris.score() }}</h3> `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      color: #444444;
      font-family: 'ErikSans', sans-serif;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreComponent {
  tetris = inject(TetrisEngine);
}
