import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';

@Component({
  selector: 'app-server-status',
  imports: [CommonModule, FormsModule],
  template: `
      <div class="start-screen"><span>Server status: </span><span>{{game.socketStatus()}}</span></div>
      <div class="start-screen"><span>Game status: </span><span>{{game.gameState().status}}</span></div>
      <div class="start-screen"><span>Players connected: </span><span>{{game.gameState().players.length}}</span></div>

  `,
  styles: `
  :host {
    position: absolute;
    bottom: .5rem;
    right: .5rem;
    font-family: 'ErikSans', sans-serif;
    font-size: 12px;
    color: white;
    line-height: 18px;

  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerStatusComponent {
  playerName: string | undefined = undefined;

  game = inject(GameService);

}
