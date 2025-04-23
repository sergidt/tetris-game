export interface Position {
  x: number;
  y: number;
}

export type Board = string[][];
export type PieceShape = number[][];

export interface TetrisPiece {
  shape: PieceShape;
  position: Position;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export enum GameStatus {
  WaitingPlayers = 'Waiting for players...',
  WarmingUp = 'Warming up',
  Playing = 'Playing',
  GameOver = 'Game over'
}

export interface GameState {
  players: Player[];
  status: GameStatus;
  gamePieces?: TetrisPiece[];
  countDown?: number;
}

export const SHAPES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f0a000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000f0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00f000'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#f00000'
  }
};
