import {
  computed,
  resource,
  ResourceRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { GameState, GameStatus, WebsocketMessages } from '@tetris-game/models';

import { io } from 'socket.io-client';

export type StreamItem<T> =
  | {
      value: T;
    }
  | {
      error: unknown;
    };

enum WebsocketStatus {
  Init = 'Init',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error',
}

export type WebsocketReceivedMessage =
  | {
      type: WebsocketMessages.Connect;
    }
  | {
      type: WebsocketMessages.ConnectionError;
      error: Error;
    }
  | {
      type: WebsocketMessages.GameState;
      payload: GameState;
    }
  | {
      type: WebsocketMessages.CountDown;
      countDown: number;
    };

export type WebsocketConnection = {
  resource: ResourceRef<WebsocketReceivedMessage[] | undefined>;
  connect: () => boolean;
  //send: (message: WebsocketMessages, payload: any) => void;
};

export function websocketConnection(config: {
  server: string;
  port: number;
  namespace: string;
  path: string;
  reconnection?: boolean;
  reconnectionAttempts?: number;
}): WebsocketConnection {
  const status: WritableSignal<WebsocketStatus> = signal(
    WebsocketStatus.Connecting
  );

  const connected = computed(() => status() === WebsocketStatus.Connected);

  const socket = io(`${config.server}:${config.port}${config.namespace}`, {
    path: config.path,
    reconnection: config.reconnection || true,
    reconnectionAttempts: config.reconnectionAttempts || 5,
    reconnectionDelay: 1000,
  });

  const wsResource: ResourceRef<WebsocketReceivedMessage[]> = resource({
    request: () => status() === WebsocketStatus.Connecting,
    stream: async ({ abortSignal }) => {
      let messages: WebsocketReceivedMessage[] = [];

      const messagesSignal = signal<StreamItem<WebsocketReceivedMessage[]>>({
        value: messages,
      });

      ////// SOCKET EVENTS HANDLERS //////
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
        if (state.status === GameStatus.Start) this.startGame();
      });

      this.socket?.on(WebsocketMessages.CountDown, (countDown: number) =>
        this.countDown.set(3 - countDown)
      );
      //////

      abortSignal.addEventListener('abort', () => {
        socket.disconnect();
        console.log('WebSocket connection closed');
      });

      return messagesSignal;
    },
  }) as ResourceRef<WebsocketReceivedMessage[]>;
}
