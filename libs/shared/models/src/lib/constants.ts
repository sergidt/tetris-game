export const WebsocketProperties = {
  namespace: '/tetris',
  path: '/socket.io',
  port: 3000,
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export enum WebsocketMessages {
  JoinGame = 'joinGame',
  GameState = 'gameState',
  Connect = 'connect',
  ConnectionError = 'connect_error',
  Disconnect = 'disconnect',
  NotifyGameOver = 'notifyGameOver',
}

export const LOST = -1;

export const BASE_INTERVAL = 1000;
export const MIN_INTERVAL = 100;
export const CYCLE_DURATION = 10000;
export const INTERVAL_STEP = 100;
