import {
  computed,
  effect,
  Injectable,
  linkedSignal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  BASE_INTERVAL,
  Board,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CYCLE_DURATION,
  GameState,
  GameStatus,
  INTERVAL_STEP,
  MIN_INTERVAL,
  Position,
  TetrisPiece,
  WebsocketProperties,
} from '@tetris-game/models';
import { filter, interval, switchMap, takeUntil, timer } from 'rxjs';
import { websocketConnection } from './ws-connection';

@Injectable({
  providedIn: 'root',
})
export class TetrisEngine {
  /// Websocket connection
  readonly conn = websocketConnection({
    server: 'http://localhost',
    port: WebsocketProperties.port,
    namespace: WebsocketProperties.namespace,
    path: WebsocketProperties.path,
  });

  board: WritableSignal<Board> = signal(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(''))
  );

  /**
   * The auxBoard is used to store the intermediate state of the game, helping
   * to manage the current piece's position and the board's state.
   */
  auxBoard = Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill('')
  );

  gameState: WritableSignal<GameState> = signal({
    players: [],
    status: GameStatus.WaitingPlayers,
  });

  gameOver = computed(() => this.gameState().status === GameStatus.GameOver);

  score = signal(0);

  gameOver$ = toObservable(this.gameOver);

  clientId = crypto.randomUUID();

  me = linkedSignal(() =>
    this.gameState().players.find((p) => p.id === this.clientId)
  );

  /**
   * waitingUsers is a computed property that checks if the game is in
   * the WaitingPlayers status and if the current player is not already in the game.
   */
  waitingUsers = computed(() => {
    const { status, players } = this.gameState();
    return (
      status === GameStatus.WaitingPlayers &&
      !players.some((p) => p.id === this.clientId)
    );
  });

  /**
   * joinedAndWaiting is a computed property that checks if the game is in
   * the WaitingPlayers status and if the current player is already in the game.
   */
  joinedAndWaiting = computed(() => {
    const { status, players } = this.gameState();
    return (
      status === GameStatus.WaitingPlayers &&
      players.some((p) => p.id === this.clientId)
    );
  });

  movingPiece: TetrisPiece | undefined | null;

  placedPieces = signal(0);

  next3Pieces = computed(() => {
    const gamePieces = this.gameState().gamePieces || [];
    const placedPieces = this.placedPieces();
    return gamePieces.slice(placedPieces, placedPieces + 3).reverse();
  });

  currentPiece = linkedSignal(() =>
    structuredClone((this.gameState().gamePieces || [])[this.placedPieces()])
  );

  gameStateEffect = effect(() => {
    const message = this.conn.resource.value();
    if (message) {
      this.gameState.set(message.state);
      if (this.gameState().status === GameStatus.Start) this.startGame();
    }
  });

  private initializeBoard() {
    this.board.set(
      Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(''))
    );
  }

  joinGame(playerName: string) {
    this.conn.joinGame(this.clientId, playerName);
  }

  notifyGameOver() {
    this.conn.notifyGameOver(this.me()!.id);
  }

  /// Game engine methods

  startGame() {
    this.initializeBoard();
    this.score.set(0);
    this.placedPieces.set(0);

    let currentInterval: number | undefined = undefined;

    /**
     * Game loop.
     * This method is responsible for the main game loop,
     * which changes every 10 seconds, updating the game speed.
     */
    timer(0, CYCLE_DURATION)
      .pipe(
        switchMap(() => {
          currentInterval = currentInterval
            ? Math.max(MIN_INTERVAL, currentInterval - INTERVAL_STEP)
            : BASE_INTERVAL;

          return interval(currentInterval);
        }),
        takeUntil(this.gameOver$.pipe(filter((_) => _ === true)))
      )
      .subscribe({
        next: this.tick.bind(this),
        error: (err) => console.error('Error in game loop:', err),
      });
  }

  /**
   * Game loop that runs every second.
   * This method moves the current piece down.
   */
  private tick() {
    this.movingPiece = this.movingPiece || this.currentPiece();
    if (this.canMoveDown()) {
      this.movingPiece = {
        shape: this.movingPiece.shape,
        color: this.movingPiece.color,
        position: {
          x: this.movingPiece.position.x,
          y: this.movingPiece.position.y + 1,
        },
      };
      this.updateBoard();
    } else {
      this.lockPiece();
      this.clearLines();
      this.spawnNewPiece();
    }
  }

  /**
   * Check if the current piece can move down.
   * @returns {boolean} True if the piece can move down, false otherwise.
   */
  private canMoveDown(): boolean {
    if (!this.movingPiece) return false;
    const newPosition: Position = {
      x: this.movingPiece.position.x,
      y: this.movingPiece.position.y + 1,
    };
    return this.isValidMove({ ...this.movingPiece, position: newPosition });
  }

  /**
   *
   * this method ensures that a piece can be placed or moved to
   * a new position without violating the game's rules. It plays a critical role
   * in maintaining the integrity of the game logic by preventing invalid moves.
   */
  private isValidMove(piece: TetrisPiece): boolean {
    return piece.shape.every((row, dy) => {
      return row.every((value, dx) => {
        if (!value) return true;
        const newX = piece.position.x + dx;
        const newY = piece.position.y + dy;

        return (
          newX >= 0 &&
          newX < BOARD_WIDTH &&
          newY >= 0 &&
          newY < BOARD_HEIGHT &&
          this.auxBoard[newY][newX] === ''
        );
      });
    });
  }

  /**
   * Locks the current piece in place on the board.
   * This method updates the board to reflect the position of the current piece,
   * making it a permanent part of the game state.
   */
  private lockPiece() {
    if (!this.movingPiece) return;
    this.movingPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = y + this.movingPiece!.position.y;
          const boardX = x + this.movingPiece!.position.x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT) {
            this.auxBoard[boardY][boardX] = this.movingPiece!.color;
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
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.auxBoard[y].every((cell) => cell !== '')) {
        this.auxBoard.splice(y, 1);
        this.auxBoard.unshift(Array(BOARD_WIDTH).fill(''));
        this.board.set(this.auxBoard);
        linesCleared++;
        y++;
      }
    }
    if (linesCleared > 0) {
      this.score.update((score) => score + linesCleared * 100);
      this.board.set(this.auxBoard);
    }
  }

  /**
   * Updates the board with the current piece's position.
   * This method is called whenever the piece moves or rotates,
   * ensuring that the board reflects the current state of the game.
   */
  private updateBoard() {
    const tempBoard = this.auxBoard.map((row) => [...row]);
    if (this.movingPiece) {
      this.movingPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            const boardY = y + this.movingPiece!.position.y;
            const boardX = x + this.movingPiece!.position.x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT) {
              tempBoard[boardY][boardX] = this.movingPiece!.color;
            }
          }
        });
      });
    }
    this.board.set(tempBoard);
  }

  /**
   * Moves the current piece to the left.
   * This method checks if the piece can move left without colliding with other pieces or going out of bounds.
   */
  moveLeft() {
    if (!this.movingPiece) return;
    const newPosition: Position = {
      x: this.movingPiece.position.x - 1,
      y: this.movingPiece.position.y,
    };

    if (this.isValidMove({ ...this.movingPiece, position: newPosition })) {
      this.movingPiece.position = newPosition;
      this.updateBoard();
    }
  }

  /**
   * Moves the current piece to the right.
   * This method checks if the piece can move right without colliding with other pieces or going out of bounds.
   */
  moveRight() {
    if (!this.movingPiece) return;
    const newPosition: Position = {
      x: this.movingPiece.position.x + 1,
      y: this.movingPiece.position.y,
    };
    if (this.isValidMove({ ...this.movingPiece, position: newPosition })) {
      this.movingPiece.position = newPosition;
      this.updateBoard();
    }
  }

  /**
   * Rotates the current piece.
   * This method checks if the piece can be rotated without colliding with other pieces or going out of bounds.
   */
  rotate() {
    if (!this.movingPiece) return;
    const newShape = this.movingPiece.shape[0].map((_, i) =>
      this.movingPiece!.shape.map((row) => row[i]).reverse()
    );
    if (this.isValidMove({ ...this.movingPiece, shape: newShape })) {
      this.movingPiece.shape = newShape;
      this.updateBoard();
    }
  }

  /**
   * Drops the current piece to the bottom of the board.
   * This method moves the piece down until it can no longer move,
   * locks it in place.
   */
  drop() {
    if (!this.movingPiece) return;
    while (this.canMoveDown()) {
      this.movingPiece.position.y++;
    }
    this.updateBoard();
    this.lockPiece();
    this.clearLines();
    this.spawnNewPiece();
  }

  spawnNewPiece() {
    this.placedPieces.update((_) => _ + 1);
    this.movingPiece = this.currentPiece();
    if (!this.isValidMove(this.movingPiece!)) {
      this.notifyGameOver();
    }

    this.updateBoard();
  }
}
