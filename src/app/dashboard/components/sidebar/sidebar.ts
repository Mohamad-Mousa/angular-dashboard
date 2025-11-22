import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DialogComponent } from '../../../shared/components/dialog/dialog';
import { AuthService } from '@shared/services';
import { PrivilegeAccess } from '@shared/enums';

interface NavTab {
  label: string;
  description: string;
  icon: string;
  path: string;
  absolute?: boolean;
  logout?: boolean;
  functionKey?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DialogComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected isCollapsed = false;
  protected isLogoutDialogOpen = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  protected readonly allNavTabs: NavTab[] = [
    {
      label: 'Home',
      description: 'Realtime summary of all admins',
      path: 'overview',
      icon: 'home',
      functionKey: 'dashboard',
    },
    {
      label: 'Admins',
      description: 'View and onboard new admins',
      path: 'admins',
      icon: 'groups',
      functionKey: 'admins',
    },
    {
      label: 'Admin Types',
      description: 'Configure policies by role',
      path: 'admin-types',
      icon: 'badge',
      functionKey: 'adminTypes',
    },
    {
      label: 'Settings',
      description: 'Audit logs and preferences',
      path: 'settings',
      icon: 'settings',
      functionKey: 'settings',
    },
    {
      label: 'Logout',
      description: 'Sign out and return to login',
      path: 'login',
      icon: 'logout',
      absolute: true,
      logout: true,
    },
  ];

  protected get navTabs(): NavTab[] {
    return this.allNavTabs.filter((tab) => {
      if (tab.logout) {
        return true;
      }
      if (tab.functionKey) {
        return this.authService.hasPrivilege(
          tab.functionKey,
          PrivilegeAccess.R
        );
      }
      return true;
    });
  }

  constructor(private router: Router, private authService: AuthService) {}

  protected toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  protected closeMobilePanel() {
    if (this.mobileOpen) {
      this.mobileOpenChange.emit(false);
    }
  }

  protected handleNavSelection() {
    this.closeMobilePanel();
  }

  protected openLogoutDialog() {
    this.isLogoutDialogOpen = true;
  }

  protected closeLogoutDialog() {
    this.isLogoutDialogOpen = false;
  }

  protected confirmLogout() {
    this.isLogoutDialogOpen = false;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.closeMobilePanel();
      },
      error: () => {
        this.router.navigate(['/login']);
        this.closeMobilePanel();
      },
    });
  }
}
