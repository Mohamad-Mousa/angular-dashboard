import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@shared/services';

interface NavTab {
  label: string;
  path: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() menuToggle = new EventEmitter<void>();
  protected readonly navTabs: NavTab[] = [
    { label: 'Home', path: 'overview' },
    { label: 'Admins', path: 'admins' },
    { label: 'Admin Types', path: 'admin-types' },
    { label: 'Settings', path: 'settings' },
  ];

  protected isProfileMenuOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  protected toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  protected onMenuClick(event: MouseEvent) {
    event.stopPropagation();
  }

  protected goToProfile(event?: MouseEvent) {
    event?.stopPropagation();
    this.isProfileMenuOpen = false;
    this.router.navigate(['/dashboard', 'profile']);
  }

  protected logout(event?: MouseEvent) {
    event?.stopPropagation();
    this.isProfileMenuOpen = false;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  @HostListener('document:click')
  protected closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }
}
