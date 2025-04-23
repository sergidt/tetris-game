import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TETROMINOES, Tetromino, Point } from '../models/tetromino.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 20;
  private board: string[][] = [];
  private currentPiece: Tetromino | null = null;
  private gameInterval: any;
  private score = 0;

  boardSubject = new BehaviorSubject<string[][]>([]);
  scoreSubject = new BehaviorSubject<number>(0);
  gameOverSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeBoard();
  }

  private initializeBoard() {
    this.board = Array(this.BOARD_HEIGHT).fill(null)
      .map(() => Array(this.BOARD_WIDTH).fill(''));
    this.boardSubject.next(this.board);
  }

  startGame() {
    this.initializeBoard();
    this.score = 0;
    this.scoreSubject.next(this.score);
    this.gameOverSubject.next(false);
    this.spawnNewPiece();
    this.gameInterval = setInterval(() => this.tick(), 1000);
  }

  private spawnNewPiece() {
    const pieces = Object.keys(TETROMINOES);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const tetromino = TETROMINOES[randomPiece as keyof typeof TETROMINOES];

    this.currentPiece = {
      shape: [...tetromino.shape],
      position: { x: Math.floor(this.BOARD_WIDTH / 2) - 2, y: 0 },
      color: tetromino.color
    };

    if (!this.isValidMove(this.currentPiece)) {
      this.gameOver();
    }

    this.updateBoard();
  }

  /**
   * Game loop that runs every second.
   * This method moves the current piece down.
   */
  private tick() {
    if (this.currentPiece) {
      if (this.canMoveDown()) {
        this.currentPiece.position.y++;
        this.updateBoard();
      } else {
        this.lockPiece();
        this.clearLines();
        this.spawnNewPiece();
      }
    }
  }

  /**
   * Check if the current piece can move down.
   * @returns {boolean} True if the piece can move down, false otherwise.
   */
  private canMoveDown(): boolean {
    if (!this.currentPiece) return false;
    const newPosition: Point = {
      x: this.currentPiece.position.x,
      y: this.currentPiece.position.y + 1
    };
    return this.isValidMove({ ...this.currentPiece, position: newPosition });
  }

  /**
   *
   * this method ensures that a Tetromino can be placed or moved to
   * a new position without violating the game's rules. It plays a critical role
   * in maintaining the integrity of the game logic by preventing invalid moves.
   */
  private isValidMove(piece: Tetromino): boolean {
    return piece.shape.every((row, dy) =>
      row.every((value, dx) => {
        if (!value) return true;
        const newX = piece.position.x + dx;
        const newY = piece.position.y + dy;
        return (
          newX >= 0 &&
          newX < this.BOARD_WIDTH &&
          newY >= 0 &&
          newY < this.BOARD_HEIGHT &&
          !this.board[newY][newX]
        );
      })
    );
  }

  /**
   * Locks the current piece in place on the board.
   * This method updates the board to reflect the position of the current piece,
   * making it a permanent part of the game state.
   */
  private lockPiece() {
    if (!this.currentPiece) return;
    this.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = y + this.currentPiece!.position.y;
          const boardX = x + this.currentPiece!.position.x;
          if (boardY >= 0 && boardY < this.BOARD_HEIGHT) {
            this.board[boardY][boardX] = this.currentPiece!.color;
          }
        }
      });
    });
  }

  /**
   * Clears completed lines from the board and updates the score.
   * This method checks each row of the board,
   * removes any full rows, and shifts the remaining rows down.
   * It also updates the score based on the number of lines cleared.
   */
  private clearLines() {
    let linesCleared = 0;
    for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== '')) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.BOARD_WIDTH).fill(''));
        linesCleared++;
        y++;
      }
    }
    if (linesCleared > 0) {
      this.score += linesCleared * 100;
      this.scoreSubject.next(this.score);
    }
  }

  /**
   * Updates the board with the current piece's position.
   * This method is called whenever the piece moves or rotates,
   * ensuring that the board reflects the current state of the game.
   */
  private updateBoard() {
    const tempBoard = this.board.map(row => [...row]);
    if (this.currentPiece) {
      this.currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            const boardY = y + this.currentPiece!.position.y;
            const boardX = x + this.currentPiece!.position.x;
            if (boardY >= 0 && boardY < this.BOARD_HEIGHT) {
              tempBoard[boardY][boardX] = this.currentPiece!.color;
            }
          }
        });
      });
    }
    this.boardSubject.next(tempBoard);
  }

  /**
   * Moves the current piece to the left.
   * This method checks if the piece can move left without colliding with other pieces or going out of bounds.
   */
  moveLeft() {
    if (!this.currentPiece) return;
    const newPosition: Point = {
      x: this.currentPiece.position.x - 1,
      y: this.currentPiece.position.y
    };
    if (this.isValidMove({ ...this.currentPiece, position: newPosition })) {
      this.currentPiece.position = newPosition;
      this.updateBoard();
    }
  }

  /**
   * Moves the current piece to the right.
   * This method checks if the piece can move right without colliding with other pieces or going out of bounds.
   */
  moveRight() {
    if (!this.currentPiece) return;
    const newPosition: Point = {
      x: this.currentPiece.position.x + 1,
      y: this.currentPiece.position.y
    };
    if (this.isValidMove({ ...this.currentPiece, position: newPosition })) {
      this.currentPiece.position = newPosition;
      this.updateBoard();
    }
  }

  /**
   * Rotates the current piece.
   * This method checks if the piece can be rotated without colliding with other pieces or going out of bounds.
   */
  rotate() {
    if (!this.currentPiece) return;
    const newShape = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece!.shape.map(row => row[i]).reverse()
    );
    if (this.isValidMove({ ...this.currentPiece, shape: newShape })) {
      this.currentPiece.shape = newShape;
      this.updateBoard();
    }
  }

  /**
   * Drops the current piece to the bottom of the board.
   * This method moves the piece down until it can no longer move,
   * locks it in place.
   */
  drop() {
    if (!this.currentPiece) return;
    while (this.canMoveDown()) {
      this.currentPiece.position.y++;
    }
    this.updateBoard();
    this.lockPiece();
    this.clearLines();
    this.spawnNewPiece();
  }

  private gameOver() {
    clearInterval(this.gameInterval);
    this.gameOverSubject.next(true);
  }
}
