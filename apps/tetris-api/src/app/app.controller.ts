import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller()
export class AppController {
  constructor(private readonly appService: GameService) { }

  // @Get()
  // getData() {
  //   return this.appService.getData();
  // }
}
