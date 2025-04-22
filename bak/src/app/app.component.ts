import { Component, HostListener } from '@angular/core';
import { GameService } from './services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <h1>Tetris</h1>
      <div class="score">Score: {{ score }}</div>
      <div class="game-board">
        <div class="row" *ngFor="let row of board">
          <div class="cell" *ngFor="let cell of row" [style.background-color]="cell"></div>
        </div>
      </div>
      <div class="controls">
        <button (click)="startGame()">{{ gameOver ? 'Play Again' : 'Start Game' }}</button>
      </div>
      <div class="game-over" *ngIf="gameOver">
        <h2>Game Over!</h2>
        <p>Final Score: {{ score }}</p>
      </div>
    </div>
  `
})
export class AppComponent {
  board: string[][] = [];
  score = 0;
  gameOver = false;

  constructor(private gameService: GameService) {
    this.gameService.boardSubject.subscribe(board => this.board = board);
    this.gameService.scoreSubject.subscribe(score => this.score = score);
    this.gameService.gameOverSubject.subscribe(state => this.gameOver = state);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.gameService.moveLeft();
        break;
      case 'ArrowRight':
        this.gameService.moveRight();
        break;
      case 'ArrowUp':
        this.gameService.rotate();
        break;
      case 'ArrowDown':
        this.gameService.drop();
        break;
    }
  }

  startGame() {
    this.gameService.startGame();
  }
}