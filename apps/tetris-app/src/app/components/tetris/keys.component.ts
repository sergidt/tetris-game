import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisEngine } from '../../tetris.engine';

@Component({
  selector: 'app-keys',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="title">Keys</div>
  <div class="key">
  <div class="symbol">⬆️</div>
  <div class="text">Rotate</div>
  </div>

  <div class="key">
  <div class="symbol">⬅️</div>
  <div class="text">Move to left</div>
  </div>

  <div class="key">
  <div class="symbol">➡️</div>
  <div class="text">Move to right</div>
  </div>

  <div class="key">
  <div class="symbol">⬇️</div>
  <div class="text">Drop</div>
  </div>

  `,
  styles: `
  :host {
    display: flex;
    justify-content: center;
    padding: 10px 10px 40px 30px;
    width: 50px;
    border-radius: 10px;
    position: absolute;
    bottom: 0;
    margin-left: 12%;
    gap: 1em;
    color: #444444;
    font-family: 'ErikSans', sans-serif;

  .key {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;

    .symbol {
      font-size: 30px;
    }

    .text {
      text-align: center;
      width: 120px;
    }
  }
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class keysComponent {
  tetris = inject(TetrisEngine);

  nextPieces = computed(() => this.tetris.pieces().slice(0, 3));

  constructor() {
    effect(() => console.log(this.nextPieces()));
  }
}
