import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStatus } from '@tetris-game/models';
import { TetrisEngine } from '../../tetris.engine';
import { TetrisBoardComponent } from './board.component';
import { keysComponent } from './keys.component';
import { NextPiecesComponent } from './next-pieces.component';

@Component({
  selector: 'app-tetris',
  imports: [
    CommonModule,
    FormsModule,
    NextPiecesComponent,
    TetrisBoardComponent,
    keysComponent,
  ],
  template: `
    <app-tetris-board />
    <app-next-pieces />
    <app-keys />
  `,
  styles: `
    :host {
      display: flex;
      gap: 4em;
      align-items: flex-start;
      margin-top: 2em;
    }
  `,
  host: {
    '(window:keydown)': 'handleKeyboardEvent($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TetrisComponent {
  tetris = inject(TetrisEngine);

  handleKeyboardEvent(event: KeyboardEvent) {
    console.log(`Key pressed: ${event.key}`);
    
    if (this.tetris.gameState().status === GameStatus.Playing) {
      switch (event.key) {
        case 'ArrowLeft':
          this.tetris.moveLeft();
          break;
        case 'ArrowRight':
          this.tetris.moveRight();
          break;
        case 'ArrowUp':
          this.tetris.rotate();
          break;
        case 'ArrowDown':
          this.tetris.drop();
          break;
      }
    }
  }
}
