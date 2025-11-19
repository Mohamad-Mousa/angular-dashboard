import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoaderComponent } from '../loader/loader';

type ButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class ButtonComponent {
  @Input() label = 'Action';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() icon?: string;
  @Input() loading = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  protected get hostClasses(): string[] {
    return [
      'btn',
      `btn-${this.variantMap[this.variant] ?? 'primary'}`,
      this.sizeClassMap[this.size] ?? '',
    ].filter(Boolean);
  }

  private readonly variantMap: Record<ButtonVariant, string> = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    outline: 'outline-secondary',
    ghost: 'link',
  };

  private readonly sizeClassMap: Record<ButtonSize, string> = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  protected onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      return;
    }
    this.clicked.emit(event);
  }
}

