import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.scss'],
})
export class DialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() description = '';
  @Input() width = '520px';
  @Input() disableClose = false;

  @Output() closed = new EventEmitter<'backdrop' | 'escape' | 'close-button'>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open && !this.disableClose) {
      this.handleClose('escape');
    }
  }

  handleClose(reason: 'backdrop' | 'escape' | 'close-button') {
    if (this.disableClose) {
      return;
    }
    this.closed.emit(reason);
  }
}


