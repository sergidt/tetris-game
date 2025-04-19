import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../game.service';
import { MiniPieceComponent } from "./mini-piece.component";

@Component({
  selector: 'app-next-pieces',
  imports: [CommonModule, FormsModule, MiniPieceComponent],
  template: `
  <div class="title">Next pieces</div>
@for (piece of nextPieces(); track $index) {
<app-mini-piece [piece]="piece"/>
}
  `,
  styles: `
  :host {
    display: flex;
    flex-direction: column;
    border: solid 2px  rgb(80, 71, 71);
    justify-content: center;
    padding: 10px 10px 40px 30px;
    width: 50px;
    border-radius: 10px;
    position: relative;
    gap: 50px;

    .title {
      font-family: 'ErikSans', sans-serif;
      color: #4a4242;
    }
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextPiecesComponent {
  tetris = inject(GameService);

  nextPieces = computed(() => this.tetris.pieces().slice(0, 3));

  constructor() {
    effect(() => console.log(this.nextPieces()));
  }
}
