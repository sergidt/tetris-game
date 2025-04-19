import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-tetris-board',
  imports: [CommonModule, FormsModule],
  template: `
  board
  `,
  styles: `
  :host {
    height: 600px;
    width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: solid 4px white;
    border-radius: 20px;
    mix-blend-mode: exclusion;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TetrisBoardComponent {
  tetris = inject(GameService);
}
