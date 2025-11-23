import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  TableComponent,
  TableColumn,
} from '../../../shared/components/table/table';
import { ButtonComponent } from '../../../shared/components/button/button';
import { DialogComponent } from '../../../shared/components/dialog/dialog';
import { NotificationService } from '../../../shared/components/notification/notification.service';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload';
import {
  SidebarComponent,
  SidebarField,
} from '../../../shared/components/sidebar/sidebar';
import { UserService } from '../../../shared/services';
import { User } from '../../../shared/interfaces';
import { PrivilegeAccess } from '../../../shared/enums';
import {
  FormInputComponent,
  SelectOption,
} from '../../../shared/components/form-input/form-input';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-users-section',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    ButtonComponent,
    DialogComponent,
    ReactiveFormsModule,
    ImageUploadComponent,
    SidebarComponent,
    FormInputComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected readonly columns: TableColumn[] = [
    {
      label: 'Image',
      key: 'image',
      type: 'image',
      filterable: false,
      sortable: false,
    },
    { label: 'Name', key: 'fullName', filterable: true, sortable: true },
    { label: 'Email', key: 'email', filterable: true, sortable: true },
    { label: 'Phone', key: 'phone', filterable: true, sortable: true },
    {
      label: 'Verified',
      key: 'isVerified',
      type: 'badge',
      badgeClassKey: 'verifiedClass',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Verified', value: 'true' },
        { label: 'Not Verified', value: 'false' },
      ],
      sortable: true,
    },
    {
      label: 'Status',
      key: 'isActive',
      type: 'badge',
      badgeClassKey: 'statusClass',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
      sortable: true,
    },
  ];

  protected users = signal<User[]>([]);
  protected totalCount = signal(0);
  protected tableLoading = signal(false);
  protected createDialogLoading = signal(false);
  protected deleteDialogLoading = signal(false);
  private currentPage = 1;
  private currentLimit = 10;
  private currentSearch = '';
  private currentFilters: Record<string, string> = {};
  protected sortBy?: string;
  protected sortDirection?: 'asc' | 'desc';

  protected readonly excludedActions: Array<
    'canRead' | 'canWrite' | 'canEdit' | 'canDelete'
  > = ['canWrite'];
  protected readonly functionKey = 'users';
  protected readonly writePrivilege = PrivilegeAccess.W;
  protected readonly deletePrivilege = PrivilegeAccess.D;
  protected readonly PrivilegeAccess = PrivilegeAccess;

  protected isCreateDialogOpen = false;
  protected createUserForm: FormGroup;
  protected selectedImageFile?: File;
  protected imagePreview?: string;
  protected selectedUser?: User;
  protected isDeleteDialogOpen = false;
  protected userToDelete?: User;
  protected isSidebarOpen = false;
  protected sidebarUser?: User;

  constructor(
    private fb: FormBuilder,
    private notifications: NotificationService,
    private userService: UserService
  ) {
    this.createUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: this.fb.group({
        code: [''],
        number: [''],
      }),
      password: ['', [Validators.required, Validators.minLength(6)]],
      image: [''],
    });
  }

  ngOnInit(): void {
    this.tableLoading.set(false);
    this.loadUsers(
      this.currentPage,
      this.currentLimit,
      this.currentSearch,
      this.sortBy,
      this.sortDirection,
      this.currentFilters
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
    filters?: Record<string, string>
  ): void {
    this.tableLoading.set(true);
    this.currentPage = page;
    this.currentLimit = limit;
    if (search !== undefined) {
      this.currentSearch = search;
    }
    if (sortBy !== undefined) {
      this.sortBy = sortBy;
    }
    if (sortDirection !== undefined) {
      this.sortDirection = sortDirection;
    }
    if (filters !== undefined) {
      this.currentFilters = filters;
    }

    this.userService
      .findMany(
        page,
        limit,
        this.currentSearch,
        this.sortBy,
        this.sortDirection,
        this.currentFilters
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const transformedUsers = response.data.map((user) =>
            this.transformUserForTable(user)
          ) as User[];
          this.users.set(transformedUsers);
          this.totalCount.set(response.totalCount);
          this.tableLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.notifications.danger(
            error.error?.message || 'An error occurred while loading users',
            'Failed to load users'
          );
          this.users.set([]);
          this.totalCount.set(0);
          this.tableLoading.set(false);
        },
      });
  }

  protected transformUserForTable(user: User): Record<string, unknown> {
    const phoneDisplay = user.phone
      ? `+${user.phone.code} ${user.phone.number}`
      : '—';
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      phone: phoneDisplay,
      statusClass: user.isActive ? 'success' : 'warning',
      isActive: user.isActive ? 'Active' : 'Inactive',
      verifiedClass: user.isVerified ? 'success' : 'warning',
      isVerified: user.isVerified ? 'Verified' : 'Not Verified',
      image: user.image || undefined,
    };
  }

  protected onPageChange(page: number): void {
    this.loadUsers(
      page,
      this.currentLimit,
      this.currentSearch,
      this.sortBy,
      this.sortDirection,
      this.currentFilters
    );
  }

  protected onLimitChange(limit: number): void {
    this.loadUsers(
      1,
      limit,
      this.currentSearch,
      this.sortBy,
      this.sortDirection,
      this.currentFilters
    );
  }

  protected onSearchChange(searchTerm: string): void {
    this.loadUsers(
      1,
      this.currentLimit,
      searchTerm,
      this.sortBy,
      this.sortDirection,
      this.currentFilters
    );
  }

  protected onFilterChange(filters: Record<string, string>): void {
    this.loadUsers(
      1,
      this.currentLimit,
      this.currentSearch,
      this.sortBy,
      this.sortDirection,
      filters
    );
  }

  protected onSortChange(event: {
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }): void {
    this.loadUsers(
      1,
      this.currentLimit,
      this.currentSearch,
      event.sortBy,
      event.sortDirection,
      this.currentFilters
    );
  }

  protected get isEditMode(): boolean {
    return !!this.selectedUser;
  }

  protected get emailControl(): FormControl {
    return this.createUserForm.get('email') as FormControl;
  }

  protected get firstNameControl(): FormControl {
    return this.createUserForm.get('firstName') as FormControl;
  }

  protected get lastNameControl(): FormControl {
    return this.createUserForm.get('lastName') as FormControl;
  }

  protected get phoneCodeControl(): FormControl {
    return this.createUserForm.get('phone.code') as FormControl;
  }

  protected get phoneNumberControl(): FormControl {
    return this.createUserForm.get('phone.number') as FormControl;
  }

  protected get passwordControl(): FormControl {
    return this.createUserForm.get('password') as FormControl;
  }

  protected get dialogTitle(): string {
    return this.isEditMode ? 'Edit user' : 'Create user';
  }

  protected get dialogDescription(): string {
    return this.isEditMode
      ? 'Update user information.'
      : 'Add a new user to the system.';
  }

  protected get createButtonLabel(): string {
    if (this.createDialogLoading()) {
      return this.isEditMode ? 'Updating...' : 'Creating...';
    }
    return this.isEditMode ? 'Update user' : 'Create user';
  }

  protected get deleteButtonLabel(): string {
    return this.deleteDialogLoading() ? 'Deleting...' : 'Delete';
  }

  protected openCreateUserDialog() {
    this.selectedUser = undefined;
    this.isCreateDialogOpen = true;
    this.resetForm();
  }

  protected closeCreateUserDialog() {
    if (this.createDialogLoading()) {
      return;
    }
    this.isCreateDialogOpen = false;
    this.selectedUser = undefined;
    this.selectedImageFile = undefined;
    this.imagePreview = undefined;
    this.createDialogLoading.set(false);
    this.resetForm();
  }

  private resetForm() {
    this.createUserForm.reset({
      email: '',
      firstName: '',
      lastName: '',
      phone: {
        code: '',
        number: '',
      },
      password: '',
      image: '',
    });
    const passwordControl = this.createUserForm.get('password');
    passwordControl?.setValidators([
      Validators.required,
      Validators.minLength(6),
    ]);
    passwordControl?.updateValueAndValidity();
  }

  protected onImageFileSelected(file: File) {
    this.selectedImageFile = file;
  }

  protected onImageChange(value?: string) {
    this.imagePreview = value;
    const control = this.createUserForm.get('image');
    control?.setValue(value ?? '', { emitEvent: true });
  }

  protected onCreateUserSubmit() {
    this.createUserForm.markAllAsTouched();
    if (this.createUserForm.invalid || this.createDialogLoading()) {
      return;
    }

    this.createDialogLoading.set(true);
    this.tableLoading.set(true);
    const formValue = this.createUserForm.value;

    const userData: Partial<User> = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
    };

    if (formValue.phone?.code && formValue.phone?.number) {
      userData.phone = {
        code: Number(formValue.phone.code),
        number: Number(formValue.phone.number),
      };
    }

    if (formValue.password) {
      userData['password'] = formValue.password;
    }

    if (this.isEditMode && this.selectedUser?._id) {
      userData._id = this.selectedUser._id;
    }

    const operation = this.isEditMode
      ? this.userService.update(userData, this.selectedImageFile)
      : this.userService.create(userData, this.selectedImageFile);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        this.createDialogLoading.set(false);
        this.closeCreateUserDialog();
        this.loadUsers(
          this.currentPage,
          this.currentLimit,
          this.currentSearch,
          this.sortBy,
          this.sortDirection,
          this.currentFilters
        );

        this.notifications.success(
          this.isEditMode ? 'User updated' : 'User created',
          `${user.firstName} ${user.lastName} has been ${
            this.isEditMode ? 'updated' : 'added'
          } successfully`
        );
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} user:`,
          error
        );
        this.createDialogLoading.set(false);
        this.notifications.danger(
          error.error?.message ||
            `An error occurred while ${
              this.isEditMode ? 'updating' : 'creating'
            } the user`,
          `Failed to ${this.isEditMode ? 'update' : 'create'} user`
        );
        this.tableLoading.set(false);
      },
    });
  }

  protected onRead(user: Record<string, unknown>): void {
    const userId = user['_id'] as string;
    const fullUser = this.users().find((u) => u._id === userId);

    if (!fullUser) {
      this.notifications.danger(
        'User not found',
        'Could not load user details'
      );
      return;
    }

    this.sidebarUser = fullUser;
    this.isSidebarOpen = true;
  }

  protected closeSidebar(): void {
    this.isSidebarOpen = false;
    this.sidebarUser = undefined;
  }

  protected get sidebarFields(): SidebarField[] {
    if (!this.sidebarUser) return [];
    return [
      {
        label: 'Email',
        key: 'email',
        type: 'text',
      },
      {
        label: 'First Name',
        key: 'firstName',
        type: 'text',
      },
      {
        label: 'Last Name',
        key: 'lastName',
        type: 'text',
      },
      {
        label: 'Full Name',
        key: 'fullName',
        type: 'text',
        format: () =>
          `${this.sidebarUser?.firstName} ${this.sidebarUser?.lastName}`,
      },
      {
        label: 'Phone',
        key: 'phone',
        type: 'text',
      },
      {
        label: 'Verified',
        key: 'isVerified',
        type: 'badge',
        badgeClassKey: 'verifiedClass',
        format: () =>
          this.sidebarUser?.isVerified ? 'Verified' : 'Not Verified',
      },
      {
        label: 'Status',
        key: 'isActive',
        type: 'badge',
        badgeClassKey: 'statusClass',
        format: () => (this.sidebarUser?.isActive ? 'Active' : 'Inactive'),
      },
      {
        label: 'Image',
        key: 'image',
        type: 'image',
      },
      {
        label: 'Created At',
        key: 'createdAt',
        type: 'date',
      },
      {
        label: 'Updated At',
        key: 'updatedAt',
        type: 'date',
      },
    ];
  }

  protected get sidebarData(): Record<string, unknown> {
    if (!this.sidebarUser) return {};
    return {
      ...this.sidebarUser,
      fullName: `${this.sidebarUser.firstName} ${this.sidebarUser.lastName}`,
      statusClass: this.sidebarUser.isActive ? 'success' : 'warning',
      isActive: this.sidebarUser.isActive ? 'Active' : 'Inactive',
      verifiedClass: this.sidebarUser.isVerified ? 'success' : 'warning',
      isVerified: this.sidebarUser.isVerified ? 'Verified' : 'Not Verified',
      image: this.sidebarUser.image || '',
    };
  }

  protected onUpdate(user: Record<string, unknown>): void {
    const userId = user['_id'] as string;
    const fullUser = this.users().find((u) => u._id === userId);

    if (!fullUser) {
      this.notifications.danger(
        'User not found',
        'Could not load user details for editing'
      );
      return;
    }

    this.selectedUser = fullUser;
    this.isCreateDialogOpen = true;

    this.createUserForm.patchValue({
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      phone: {
        code: fullUser.phone?.code?.toString() || '',
        number: fullUser.phone?.number?.toString() || '',
      },
      image: fullUser.image || '',
    });

    if (fullUser.image) {
      this.imagePreview = environment.IMG_URL + fullUser.image;
    }

    const passwordControl = this.createUserForm.get('password');
    passwordControl?.clearValidators();
    passwordControl?.updateValueAndValidity();
  }

  protected onDelete(user: Record<string, unknown>): void {
    const userId = user['_id'] as string;
    const fullUser = this.users().find((u) => u._id === userId);

    if (!fullUser) {
      this.notifications.danger(
        'User not found',
        'Could not find user to delete'
      );
      return;
    }

    this.userToDelete = fullUser;
    this.isDeleteDialogOpen = true;
  }

  protected closeDeleteDialog() {
    if (this.deleteDialogLoading()) {
      return;
    }
    this.isDeleteDialogOpen = false;
    this.userToDelete = undefined;
    this.deleteDialogLoading.set(false);
  }

  protected confirmDelete() {
    if (!this.userToDelete?._id || this.deleteDialogLoading()) {
      return;
    }

    this.deleteDialogLoading.set(true);
    this.tableLoading.set(true);
    this.userService
      .delete(this.userToDelete._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deleteDialogLoading.set(false);
          this.closeDeleteDialog();
          this.loadUsers(
            this.currentPage,
            this.currentLimit,
            this.currentSearch,
            this.sortBy,
            this.sortDirection,
            this.currentFilters
          );

          this.notifications.success(
            'User deleted',
            `${this.userToDelete?.firstName} ${this.userToDelete?.lastName} has been deleted successfully`
          );
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.deleteDialogLoading.set(false);
          this.notifications.danger(
            error.error?.message || 'An error occurred while deleting the user',
            'Failed to delete user'
          );
          this.tableLoading.set(false);
        },
      });
  }
}
