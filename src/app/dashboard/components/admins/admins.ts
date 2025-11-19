import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  TableComponent,
  TableColumn,
} from '../../../shared/components/table/table';
import { ButtonComponent } from '../../../shared/components/button/button';
import { DialogComponent } from '../../../shared/components/dialog/dialog';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-admins-section',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    ButtonComponent,
    DialogComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class AdminsComponent {
  protected readonly columns: TableColumn[] = [
    { label: 'Name', key: 'name', filterable: true, sortable: true },
    { label: 'Role', key: 'role', filterable: true, sortable: true },
    {
      label: 'Status',
      key: 'status',
      type: 'badge',
      badgeClassKey: 'statusClass',
      filterable: true,
      filterType: 'select',
      filterOptions: ['Active', 'Pending'],
      sortable: true,
    },
  ];

  protected admins = [
    {
      name: 'Amelia Carter',
      role: 'Global Admin',
      status: 'Active',
      statusClass: 'success',
      canRead: true,
      canEdit: true,
      canDelete: false,
    },
    {
      name: 'Noah Bennett',
      role: 'Billing Admin',
      status: 'Pending',
      statusClass: 'warning',
      canRead: true,
      canEdit: false,
      canDelete: false,
    },
    {
      name: 'Leah Singh',
      role: 'Security Admin',
      status: 'Active',
      statusClass: 'success',
      canRead: true,
      canEdit: true,
      canDelete: true,
    },
  ];

  protected readonly statusOptions = ['Active', 'Pending'];
  protected readonly roleSuggestions = [
    'Global Admin',
    'Security Admin',
    'Billing Admin',
  ];

  protected isCreateDialogOpen = false;
  protected createAdminForm: FormGroup;
  protected tableLoading = false;

  constructor(
    private fb: FormBuilder,
    private notifications: NotificationService,
  ) {
    this.createAdminForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', Validators.required],
      status: ['Active', Validators.required],
      canRead: [true],
      canEdit: [false],
      canDelete: [false],
    });
  }

  protected openCreateAdminDialog() {
    this.isCreateDialogOpen = true;
  }

  protected closeCreateAdminDialog() {
    this.isCreateDialogOpen = false;
    this.createAdminForm.reset({
      name: '',
      role: '',
      status: 'Active',
      canRead: true,
      canEdit: false,
      canDelete: false,
    });
  }

  protected onCreateAdminSubmit() {
    this.createAdminForm.markAllAsTouched();
    if (this.createAdminForm.invalid) {
      return;
    }

    const newAdmin = {
      ...this.createAdminForm.value,
      statusClass:
        this.createAdminForm.value.status === 'Active' ? 'success' : 'warning',
    };

    this.tableLoading = true;
    this.closeCreateAdminDialog();

    setTimeout(() => {
      this.admins = [newAdmin, ...this.admins];
      this.tableLoading = false;

      this.notifications.success(
        `${newAdmin.name} added`,
        `${newAdmin.role} permissions granted`,
      );
    }, 1500);
  }
}

