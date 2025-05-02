import { Injectable, Logger } from '@nestjs/common';
import {
  BOARD_WIDTH,
  GameState,
  GameStatus,
  LOST,
  Player,
  SHAPES,
  TetrisPiece,
} from '@tetris-game/models';

@Injectable()
export class GameService {
  private gameState: GameState = {
    status: GameStatus.WaitingPlayers,
    players: [],
  };
  private readonly logger = new Logger('GameService');

  startingCallback: () => void | undefined;
  gameOverCallback: () => void | undefined;

  constructor() {
    this.resetGame();
  }

  setNotifiers(startingCb: () => void, gameOverCb: () => void) {
    this.startingCallback = startingCb;
    this.gameOverCallback = gameOverCb;
  }

  addPlayer(playerId: string, playerName: string) {
    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
    };

    this.gameState.players.push(player);

    this.logger.log(`${playerName} player joined the game`);

    if (this.gameState.players.length >= 1) {
      // 2
      this.countDown();
    }

    return player;
  }

  private resetGame() {
    this.gameState = {
      status: GameStatus.WaitingPlayers,
      players: [],
      gamePieces: [],
    };
  }

  removePlayer(playerId: string) {
    this.gameState.players = this.gameState.players.filter(
      (p) => p.id !== playerId
    );

    if (this.gameState.players.length < 2) {
      this.gameState.status = GameStatus.WaitingPlayers;
    }
  }

  private countDown() {
    this.gameState.status = GameStatus.GettingReady;
    this.startingCallback();
  }

  async startGame(notifyState: () => void) {
    await this.spawnPieces();
    this.gameState.status = GameStatus.Start;
    notifyState();
    this.gameState.status = GameStatus.Playing;
    notifyState();
  }

  private async spawnPieces() {
    const pieces = Object.values(SHAPES);
    const spawnPieces: TetrisPiece[] = [];
    for (let i = 0; i < 1000; i++) {
      spawnPieces.push({
        ...pieces[Math.floor(Math.random() * pieces.length)],
        position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      });
    }
    this.gameState.gamePieces = spawnPieces;
  }

  getGameState() {
    return this.gameState;
  }

  playerGameIsOver(playerId: string) {
    this.gameState = {
      ...this.gameState,
      status: GameStatus.GameOver,
      players: this.gameState.players.map((player) => {
        if (player.id === playerId) {
          return { ...player, score: LOST };
        }
        return player;
      }),
    };
  }
}
