import { Injectable, Logger } from '@nestjs/common';
import { BOARD_HEIGHT, BOARD_WIDTH, GameState, GameStatus, SHAPES, TetrisPiece } from '@tetris-game/models';

@Injectable()
export class GameService {
  private players = new Map<string, any>();
  private gameState: GameState = {
    status: GameStatus.WaitingPlayers,
    players: [],
  };
  private readonly logger = new Logger('GameService');


  warmUpCallback: () => void | undefined;
  gameOverCallback: () => void | undefined;


  setNotifiers(warmUpCb: () => void, gameOverCb: () => void) {
    this.warmUpCallback = warmUpCb;
    this.gameOverCallback = gameOverCb;
  }

  addPlayer(playerId: string, playerName: string) {
    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
    };

    this.players.set(playerId, player);
    this.gameState.players.push(player);

    this.logger.log(`${playerName} player joined the game`);

    if (this.players.size === 2) {
      this.countDown();
    }

    return player;
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
    this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);

    if (this.players.size < 2) {
      this.gameState.status = GameStatus.WaitingPlayers;
    }
  }

  private countDown() {
    this.gameState.status = GameStatus.WarmingUp;
    this.warmUpCallback();
    // this.gameState.status = GameStatus.Playing;
  }

  async startGame() {
    this.gameState.status = GameStatus.Playing;
    await this.spawnPieces();
  }


  private async spawnPieces() {
    const pieces = Object.values(SHAPES);
    const spawnPieces: TetrisPiece[] = [];
    for (let i = 0; i < 1000; i++) {
      spawnPieces.push({
        ...pieces[Math.floor(Math.random() * pieces.length)],
        position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
      });
    }
    this.gameState.gamePieces = spawnPieces;
    return new Promise((resolve) => resolve(this.getGameState()));
  }

  movePiece(playerId: string, direction: 'left' | 'right' | 'down') {
    const player = this.players.get(playerId);
    if (!player || !player.currentPiece) return;

    const newPosition = { ...player.currentPiece.position };

    switch (direction) {
      case 'left':
        newPosition.x--;
        break;
      case 'right':
        newPosition.x++;
        break;
      case 'down':
        newPosition.y++;
        break;
    }

    if (this.isValidMove(player, newPosition)) {
      player.currentPiece.position = newPosition;
    } else if (direction === 'down') {
      this.lockPiece(player);
      this.clearLines(player);
    }
  }

  private isValidMove(player: any, newPosition: { x: number; y: number }): boolean {
    const { shape } = player.currentPiece;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = newPosition.x + x;
          const newY = newPosition.y + y;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && player.board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private lockPiece(player: any) {
    const { shape, position, color } = player.currentPiece;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;

          if (boardY >= 0) {
            player.board[boardY][boardX] = color;
          }
        }
      }
    }
  }

  private clearLines(player: any) {
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (player.board[y].every(cell => cell !== null)) {
        player.board.splice(y, 1);
        player.board.unshift(Array(BOARD_WIDTH).fill(null));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      player.score += linesCleared * 100;
    }
  }

  getGameState() {
    return this.gameState;
  }
}
