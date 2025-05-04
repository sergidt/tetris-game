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
  GettingReady = 'GettingReady',
  Start = 'Start',
  Playing = 'Playing',
  GameOver = 'Game over',
}

export interface GameState {
  players: Player[];
  status: GameStatus;
  gamePieces?: TetrisPiece[];
}

export const SHAPES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#F6C2F3',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#CDABEB',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#C7CAFF',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#C1EBC0',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#FAFABE',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#F6CA94',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#F09EA7',
  },
};
