import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisEngine } from '../tetris.engine';

@Component({
  selector: 'app-server-status',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="state">
      <span>Connected to server:</span>
      <span>{{ game.conn.connected() }}</span>
    </div>
    <div class="state">
      <span>Game status:</span>
      <span>{{ game.gameState().status }}</span>
    </div>
    <div class="state">
      <span>Players connected:</span>
      <span>{{ game.gameState().players.length }}</span>
    </div>
  `,
  styles: `
    :host {
      position: absolute;
      bottom: .5rem;
      right: .5rem;
      font-family: 'ErikSans', sans-serif;
      font-size: 12px;
      color: #222222;
      line-height: 18px;
    }

    .state {
      display: flex;
      gap: 0.4rem;
      margin-bottom: 0.4rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerStatusComponent {
  playerName: string | undefined = undefined;

  game = inject(TetrisEngine);
}
