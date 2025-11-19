import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  TableComponent,
  TableColumn,
} from '../../../shared/components/table/table';
import { ButtonComponent } from '../../../shared/components/button/button';
import { DialogComponent } from '../../../shared/components/dialog/dialog';
import { NotificationService } from '../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-admin-types-section',
  standalone: true,
  imports: [
    TableComponent,
    ButtonComponent,
    DialogComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './admin-types.html',
  styleUrl: './admin-types.scss',
})
export class AdminTypesComponent {
  protected readonly columns: TableColumn[] = [
    { label: 'Admin Type', key: 'name', filterable: true, sortable: true },
    {
      label: 'Permissions',
      key: 'permissions',
      filterable: true,
      sortable: true,
    },
    { label: 'Description', key: 'description', filterable: true },
  ];

  protected adminTypes = [
    {
      name: 'Global Admin',
      permissions: 42,
      description: 'Full access to all settings and data.',
      canRead: true,
      canEdit: true,
      canDelete: true,
    },
    {
      name: 'Security Admin',
      permissions: 28,
      description: 'Manages security controls and audits.',
      canRead: true,
      canEdit: true,
      canDelete: false,
    },
    {
      name: 'Billing Admin',
      permissions: 15,
      description: 'Controls invoices, subscriptions and payments.',
      canRead: true,
      canEdit: false,
      canDelete: false,
    },
  ];

  protected isCreateDialogOpen = false;
  protected createTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notifications: NotificationService,
  ) {
    this.createTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      permissions: [10, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(12)]],
      canRead: [true],
      canEdit: [false],
      canDelete: [false],
    });
  }

  protected openCreateTypeDialog() {
    this.isCreateDialogOpen = true;
  }

  protected closeCreateTypeDialog() {
    this.isCreateDialogOpen = false;
    this.createTypeForm.reset({
      name: '',
      permissions: 10,
      description: '',
      canRead: true,
      canEdit: false,
      canDelete: false,
    });
  }

  protected onCreateTypeSubmit() {
    this.createTypeForm.markAllAsTouched();
    if (this.createTypeForm.invalid) {
      return;
    }

    const newType = { ...this.createTypeForm.value };

    this.adminTypes = [newType, ...this.adminTypes];
    this.closeCreateTypeDialog();

    this.notifications.success(
      `${newType.name || 'Admin type'} created`,
      `${newType.permissions} permissions configured`,
    );
  }
}

