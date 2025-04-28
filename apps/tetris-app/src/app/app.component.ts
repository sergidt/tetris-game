import { Component, inject } from '@angular/core';
import { GameStatus } from '@tetris-game/models';
import { CountDownComponent } from './components/count-down.component';
import { JoinComponent } from './components/join.component';
import { ServerStatusComponent } from './components/server-status.component';
import { TetrisComponent } from './components/tetris/tetris.component';
import { TetrisEngine } from './tetris.engine';

@Component({
  imports: [
    ServerStatusComponent,
    JoinComponent,
    CountDownComponent,
    TetrisComponent,
  ],
  selector: 'app-root',
  template: `
    @let gameStatus = game.gameState().status;

    <div class="app-title">BLOCKS</div>
    <app-server-status />

    @if (gameStatus === GameStatus.WaitingPlayers) {
    <app-join />
    } @else if (gameStatus === GameStatus.GettingReady) {
    <app-count-down />
    } @else if (gameStatus === GameStatus.Playing) {
    <app-tetris />
    }
  `,
  styles: ``,
})
export class AppComponent {
  game = inject(TetrisEngine);
  GameStatus = GameStatus;
}
