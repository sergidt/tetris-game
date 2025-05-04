import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisEngine } from '../../tetris.engine';
import { MiniPieceComponent } from './mini-piece.component';

@Component({
  selector: 'app-next-pieces',
  imports: [CommonModule, FormsModule, MiniPieceComponent],
  template: `
    <div class="title">Next pieces</div>
    @for (piece of tetris.next3Pieces(); track $index) {
    <app-mini-piece [piece]="piece" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      border: solid 1px #444444;
      justify-content: center;
      padding: 10px 10px 40px 15px;
      width: 50px;
      border-radius: 10px;
      position: relative;
      gap: 50px;

      .title {
        font-family: 'ErikSans', sans-serif;
        color: #444444;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextPiecesComponent {
  tetris = inject(TetrisEngine);
}
