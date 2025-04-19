import { computed, effect, Injectable, linkedSignal, OnDestroy, signal, WritableSignal } from '@angular/core';
import { GameState, GameStatus, TetrisPiece, WebsocketMessages, WebsocketProperties } from '@tetris-game/models';

import { io, Socket } from 'socket.io-client';

enum WebsocketStatus {
  Init = 'Init',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error'
}

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private socket: Socket | null = null;


  pieces: WritableSignal<TetrisPiece[]> = signal([]);


  gameState: WritableSignal<GameState> = signal({
    players: [],
    status: GameStatus.WaitingPlayers
  });

  me = signal('');

  waitingUsers = computed(() => {
    const { status, players } = this.gameState();
    return status === GameStatus.WaitingPlayers && !players.some(p => p.name === this.me());
  });

  joinedAndWaiting = computed(() => {
    const { status, players } = this.gameState();
    return status === GameStatus.WaitingPlayers && players.some(p => p.name === this.me());
  });

  socketStatus: WritableSignal<WebsocketStatus> = signal(WebsocketStatus.Init);


  gamePieces = computed(() => this.gameState().gamePieces || []);

  next3Pieces = linkedSignal({
    source: this.gamePieces,
    computation: (gamePieces: TetrisPiece[] | undefined) => (gamePieces || []).slice(0, 3)
  });

  constructor() {
    this.initializeSocketConnection();

    effect(() => console.log('[Tetris game]: Game state updated: ', this.gameState()));
  }

  private initializeSocketConnection() {
    this.socketStatus.set(WebsocketStatus.Connecting);

    this.socket = io(`http://localhost:${WebsocketProperties.port}${WebsocketProperties.namespace}`, {
      path: WebsocketProperties.path,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

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
      this.gameState.set(state);
      this.log('game state', state);
    });

    this.socket?.on(WebsocketMessages.CountDown, (countDown: number) => {
      this.gameState.update(s => ({ ...s, countDown: 3 - countDown }))
      this.log('Count down: ', 3 - countDown);
    });
    /*
        this.socket?.on('playerLeft', (playerId: string) => {
          this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
        });
        */
  }

  joinGame(playerName: string) {
    this.me.set(playerName);
    this.socket?.emit(WebsocketMessages.JoinGame, { name: playerName });
  }

  movePiece(direction: 'left' | 'right' | 'down') {
    this.socket?.emit('movePiece', { direction });
  }

  rotatePiece() {
    this.socket?.emit('rotatePiece');
  }

  startGame() {
    this.socket?.emit('startGame');
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
}
