import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TetrisEngine } from '../tetris.engine';

@Component({
  selector: 'app-count-down',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Get ready {{ tetris.me()?.name }}, the game is about to start in...</h2>
    <h1>{{ tetris.countDown() }}</h1>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 8rem 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountDownComponent {
  tetris = inject(TetrisEngine);
}
