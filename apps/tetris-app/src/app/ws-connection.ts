import { resource, ResourceRef, signal } from '@angular/core';
import { GameState, WebsocketMessages } from '@tetris-game/models';

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

export type WebsocketSendMessage =
  | {
      type: WebsocketMessages.JoinGame;
      payload: {
        clientId: string;
        name: string;
      };
    }
  | {
      type: WebsocketMessages.NotifyGameOver;
      payload: {
        playerId: string;
      };
    };

export type WebsocketReceivedMessage = {
  type: WebsocketMessages.GameState;
  state: GameState;
};

export type WebsocketConnection = {
  resource: ResourceRef<WebsocketReceivedMessage | undefined>;
  connected: () => boolean;
  joinGame: (clientId: string, playerName: string) => void;
  notifyGameOver: (playerId: string) => void;
};

export function websocketConnection(config: {
  server: string;
  port: number;
  namespace: string;
  path: string;
  reconnection?: boolean;
  reconnectionAttempts?: number;
}): WebsocketConnection {
  const connected = signal(false);

  const socket = io(`${config.server}:${config.port}${config.namespace}`, {
    path: config.path,
    reconnection: config.reconnection || true,
    reconnectionAttempts: config.reconnectionAttempts || 5,
    reconnectionDelay: 1000,
  });

  const wsResource: ResourceRef<WebsocketReceivedMessage | undefined> =
    resource({
      request: () => true,
      stream: async ({ abortSignal }) => {
        const messagesSignal = signal<
          StreamItem<WebsocketReceivedMessage | undefined>
        >({
          value: undefined,
        });

        //// Socket event listeners ////
        socket?.on(WebsocketMessages.Connect, () => {
          console.log('Connected to game server');
          connected.set(true);
        });

        socket?.on(WebsocketMessages.ConnectionError, (error) => {
          console.error('Connection error:', error);
          connected.set(false);
          messagesSignal.set({ error });
        });

        socket?.on(WebsocketMessages.Disconnect, (reason) => {
          console.log('Disconnected from game server:', reason);
          connected.set(false);
          messagesSignal.set({ value: undefined });
        });

        socket?.on(WebsocketMessages.GameState, (state: GameState) => {
          messagesSignal.set({
            value: { type: WebsocketMessages.GameState, state },
          });
        });

        //////////////////////

        abortSignal.addEventListener('abort', () => {
          if (abortSignal.aborted) {
            socket.removeAllListeners();
            socket.disconnect();
            console.log('WebSocket connection closed');
          }
        });

        return messagesSignal;
      },
    });

  const sendMessage = (message: WebsocketSendMessage) =>
    socket.emit(message.type, message.payload);

  const joinGame = (clientId: string, playerName: string) =>
    socket?.emit(WebsocketMessages.JoinGame, {
      clientId,
      name: playerName,
    });

  const notifyGameOver = (playerId: string) =>
    socket?.emit(WebsocketMessages.NotifyGameOver, {
      playerId,
    });

  return {
    connected,
    resource: wsResource,
    joinGame,
    notifyGameOver,
    sendMessage,
  } as WebsocketConnection;
}
