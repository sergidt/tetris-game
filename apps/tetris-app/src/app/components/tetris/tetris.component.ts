import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../game.service';
import { TetrisBoardComponent } from "./board.component";
import { keysComponent } from "./keys.component";
import { NextPiecesComponent } from "./next-pieces.component";

@Component({
  selector: 'app-tetris',
  imports: [CommonModule, FormsModule, NextPiecesComponent, TetrisBoardComponent, keysComponent],
  template: `
  <app-tetris-board/>
  <app-next-pieces/>
  <app-keys/>
  `,
  styles: `
  :host{
    display: flex;
    gap: 4em;
    align-items: flex-start;
    margin-top: 2em;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TetrisComponent {


  tetris = inject(GameService);

}
