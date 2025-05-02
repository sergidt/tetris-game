import { Component, inject } from '@angular/core';
import { GameStatus } from '@tetris-game/models';
import { CountDownComponent } from './components/count-down.component';
import { GameOverComponent } from './components/game-over.component';
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
    GameOverComponent,
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
    } @else if (gameStatus === GameStatus.GameOver) {
    <app-game-over />
    }
  `,
  styles: ``,
})
export class AppComponent {
  game = inject(TetrisEngine);
  GameStatus = GameStatus;
}
