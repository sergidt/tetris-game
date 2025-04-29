import {
  computed,
  effect,
  Injectable,
  linkedSignal,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  Board,
  GameState,
  GameStatus,
  Position,
  TetrisPiece,
  WebsocketMessages,
  WebsocketProperties,
} from '@tetris-game/models';
import { filter, interval, takeUntil } from 'rxjs';

import { io, Socket } from 'socket.io-client';

enum WebsocketStatus {
  Init = 'Init',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error',
}

@Injectable({
  providedIn: 'root',
})
export class TetrisEngine implements OnDestroy {
  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 20;

  board: WritableSignal<Board> = signal(
    Array.from({ length: this.BOARD_HEIGHT }, () =>
      Array(this.BOARD_WIDTH).fill('')
    )
  );

  auxBoard = Array.from({ length: this.BOARD_HEIGHT }, () =>
    Array(this.BOARD_WIDTH).fill('')
  );

  private socket: Socket | null = null;

  socketStatus: WritableSignal<WebsocketStatus> = signal(WebsocketStatus.Init);

  pieces: WritableSignal<TetrisPiece[]> = signal([]);

  gameState: WritableSignal<GameState> = signal({
    players: [],
    status: GameStatus.WaitingPlayers,
  });

  gameOver = computed(() => this.gameState().status === GameStatus.GameOver);

  score = signal(0);

  gameOver$ = toObservable(this.gameOver);

  countDown = signal(3);

  me = linkedSignal(() =>
    this.gameState().players.find((p) => p.id === this.clientId())
  );

  clientId = signal(crypto.randomUUID());

  waitingUsers = computed(() => {
    const { status, players } = this.gameState();
    return (
      status === GameStatus.WaitingPlayers &&
      !players.some((p) => p.id === this.clientId())
    );
  });

  joinedAndWaiting = computed(() => {
    const { status, players } = this.gameState();
    return (
      status === GameStatus.WaitingPlayers &&
      players.some((p) => p.id === this.clientId())
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

  constructor() {
    this.initializeSocketConnection();

    effect(() => {
      //   console.log('board: ');
      //   console.table(this.board());
      console.log('placed pieces: ', this.placedPieces());
      //console.log('Next pieces: ', this.next3Pieces());
    });
  }

  private initializeSocketConnection() {
    this.socketStatus.set(WebsocketStatus.Connecting);

    this.socket = io(
      `http://localhost:${WebsocketProperties.port}${WebsocketProperties.namespace}`,
      {
        path: WebsocketProperties.path,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket?.on(WebsocketMessages.Connect, () => {
      this.log('Connected to game server');
      this.socketStatus.set(WebsocketStatus.Connected);
    });

    this.socket?.on(WebsocketMessages.ConnectionError, (error) => {
      console.error('Connection error:', error);
      this.socketStatus.set(WebsocketStatus.Error);
    });

    this.socket?.on(WebsocketMessages.GameState, (state: GameState) => {
      this.log('Game state received:', state);
      this.gameState.set(state);
    });

    this.socket?.on(WebsocketMessages.CountDown, (countDown: number) =>
      this.countDown.set(3 - countDown)
    );

    this.socket?.on(WebsocketMessages.GameState, (state: GameState) => {
      if (state.status === GameStatus.Start) this.startGame();
    });
  }

  private initializeBoard() {
    this.board.set(
      Array.from({ length: this.BOARD_HEIGHT }, () =>
        Array(this.BOARD_WIDTH).fill('')
      )
    );
  }

  joinGame(playerName: string) {
    this.socket?.emit(WebsocketMessages.JoinGame, {
      clientId: this.clientId(),
      name: playerName,
    });
  }

  notifyGameOver() {
    this.socket?.emit(WebsocketMessages.NotifyGameOver, {
      playerId: this.me()?.id,
    });
  }

  private cleanupSocketConnection() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.cleanupSocketConnection();
  }

  private log(message: string, params?: any) {
    console.log(`[GameService]: ${message}`, params || '');
  }

  /// Game engine methods

  startGame() {
    this.initializeBoard();
    this.score.set(0);
    this.placedPieces.set(0);

    interval(1000)
      .pipe(takeUntil(this.gameOver$.pipe(filter((_) => _ === true))))
      .subscribe({
        next: (e) => this.tick(),
        error: (err) => console.error('Error in game loop:', err),
        complete: () => console.log('>>>>>> GAME COMPLETED'),
      });
  }

  /**
   * Game loop that runs every second.
   * This method moves the current piece down.
   */
  private tick() {
    console.log('Tick\n------------------------------------');
    this.movingPiece = this.movingPiece || this.currentPiece();
    if (this.canMoveDown()) {
      console.log('Piece can move down');
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
      console.log('Piece cannot move down');
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
    //   console.log('Validating move...', piece);
    return piece.shape.every((row, dy) => {
      //   console.log('     Validating piece Row:', row, dy);
      return row.every((value, dx) => {
        //    console.log('       Validating piece Cell:', value, dx);
        if (!value) return true;
        const newX = piece.position.x + dx;
        const newY = piece.position.y + dy;
        //   console.log('         Validating new x, y:', newX, newY);
        //   console.log('         Validating board:');
        //   console.log(
        //     '            valid x',
        //    newX >= 0 && newX < this.BOARD_WIDTH
        //   );
        //  console.log(
        //    '            valid y',
        //     newY >= 0 && newY < this.BOARD_HEIGHT
        //   );
        //    console.table(this.board());

        //    console.log(
        //      '            Validating board cell:',
        //      this.board()[newY][newX],
        //      '  not empty: ',
        //      this.board()[newY][newX] !== ''
        //    );

        return (
          newX >= 0 &&
          newX < this.BOARD_WIDTH &&
          newY >= 0 &&
          newY < this.BOARD_HEIGHT &&
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
    console.log('Locking piece...');
    if (!this.movingPiece) return;
    this.movingPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = y + this.movingPiece!.position.y;
          const boardX = x + this.movingPiece!.position.x;
          if (boardY >= 0 && boardY < this.BOARD_HEIGHT) {
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
    console.log('Clearing lines...');
    let linesCleared = 0;
    for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.auxBoard[y].every((cell) => cell !== '')) {
        this.auxBoard.splice(y, 1);
        this.auxBoard.unshift(Array(this.BOARD_WIDTH).fill(''));
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
    console.log('Updating board...', this.movingPiece);
    const tempBoard = this.auxBoard.map((row) => [...row]);
    if (this.movingPiece) {
      this.movingPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            const boardY = y + this.movingPiece!.position.y;
            const boardX = x + this.movingPiece!.position.x;
            if (boardY >= 0 && boardY < this.BOARD_HEIGHT) {
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
