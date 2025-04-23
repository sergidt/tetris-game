import { Injectable, Logger } from '@nestjs/common';
import {
  BOARD_WIDTH,
  GameState,
  GameStatus,
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

  warmUpCallback: () => void | undefined;
  gameOverCallback: () => void | undefined;

  constructor() {
    this.resetGame();
  }

  setNotifiers(warmUpCb: () => void, gameOverCb: () => void) {
    this.warmUpCallback = warmUpCb;
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

    if (this.gameState.players.length === 2) {
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

    if (this.gameState.players.length === 2) {
      this.gameState.status = GameStatus.WaitingPlayers;
    }
  }

  private countDown() {
    this.gameState.status = GameStatus.WarmingUp;
    this.warmUpCallback();
    // this.gameState.status = GameStatus.Playing;
  }

  async startGame() {
    await this.spawnPieces();
    this.gameState.status = GameStatus.Playing;
    return new Promise((resolve) => resolve(this.getGameState()));
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
}
