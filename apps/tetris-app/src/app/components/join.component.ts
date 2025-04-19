import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';

@Component({
  selector: 'app-join',
  imports: [CommonModule, FormsModule],
  template: `

@if (tetris.waitingUsers()) {
      <div class="log-in">
        <input [(ngModel)]="playerName" placeholder="Enter your name" />
        <button (click)="joinGame()">Join Blocks!</button>
      </div>
}@else if(tetris.joinedAndWaiting()) {
<h2>Hi {{tetris.me()}}. Waiting for other players to join. The game will start soon...</h2>
}
  `,
  styles: `
  :host {
    display: block;
    margin: 8rem 0;

    .log-in {
      display: flex;
      align-items: center;
      gap: 2em;
      justify-content: center;
    }
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinComponent {
  playerName: string | undefined = undefined;
  tetris = inject(GameService);

  joinGame() {
    console.log(`Joining game player: ${this.playerName}`);
    this.tetris.joinGame(this.playerName!);
  }

}
