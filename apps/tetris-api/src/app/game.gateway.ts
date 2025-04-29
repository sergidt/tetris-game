import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebsocketMessages, WebsocketProperties } from '@tetris-game/models';
import { interval, take } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: WebsocketProperties.namespace,
  path: WebsocketProperties.path,
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('GameGateway');

  constructor(private gameService: GameService) {}

  afterInit(server: Server) {
    this.logger.log('Gateway initialized');
    this.logger.log(`Websocket namespace: ${WebsocketProperties.namespace}`);
    this.gameService.setNotifiers(
      this.countDown.bind(this),
      this.gameFinished.bind(this)
    );
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.gameService.removePlayer(client.id);
    this.broadcastGameState();
  }

  @SubscribeMessage(WebsocketMessages.JoinGame)
  handleJoinGame(client: Socket, payload: { clientId: string; name: string }) {
    const player = this.gameService.addPlayer(payload.clientId, payload.name);
    this.broadcastGameState();
    return player;
  }

  @SubscribeMessage(WebsocketMessages.NotifyGameOver)
  gameOver(client: Socket, payload: { playerId: string }) {
    this.gameService.playerGameIsOver(payload.playerId);
    this.broadcastGameState();
  }

  private broadcastGameState() {
    this.logger.log('sending Game state...');
    this.server.emit(
      WebsocketMessages.GameState,
      this.gameService.getGameState()
    );
  }

  private countDown() {
    interval(1000)
      .pipe(take(4))
      .subscribe({
        next: (n) => this.server.emit(WebsocketMessages.CountDown, n),
        complete: () =>
          this.gameService.startGame(this.broadcastGameState.bind(this)),
      });
  }

  private gameFinished() {
    this.server.emit(
      WebsocketMessages.GameState,
      this.gameService.getGameState()
    );
  }
}
