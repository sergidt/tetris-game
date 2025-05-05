import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LOST } from '@tetris-game/models';
import { TetrisEngine } from '../tetris.engine';

@Component({
  selector: 'app-game-over',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>
      @if (lost() ) { You lost! Better luck next time! } @else { You
      won! Congratulations!
      <br />Your score: {{ tetris.score() }}
      }
    </h2>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 8rem 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverComponent {
  tetris = inject(TetrisEngine);

  lost = computed(() => {
    const players = this.tetris.gameState().players;
    const me = this.tetris.me();

    return players.find((player) => player.id === me!.id)!.score === LOST;
  });
}
