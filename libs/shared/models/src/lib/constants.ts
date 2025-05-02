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
  CountDown = 'countDown',
  NotifyGameOver = 'notifyGameOver',
}

export const LOST = -1;
