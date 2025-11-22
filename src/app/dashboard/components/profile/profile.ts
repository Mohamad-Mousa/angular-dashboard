import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogComponent } from '../../../shared/components/dialog/dialog';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload';
import { AuthService, AdminService } from '../../../shared/services';
import { NotificationService } from '../../../shared/components/notification/notification.service';
import { Admin } from '../../../shared/interfaces';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogComponent,
    ImageUploadComponent,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent implements OnInit {
  protected profile = signal<Admin | null>(null);
  protected isEditDialogOpen = false;
  protected profileForm: FormGroup;
  protected isLoading = signal(false);
  protected isSaving = signal(false);
  protected selectedImageFile?: File;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adminService: AdminService,
    private notifications: NotificationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      image: [''],
      title: [''],
      bio: [''],
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  protected loadProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profile.set(currentUser);
      this.profileForm.patchValue({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        image: currentUser.image || '',
        title: currentUser['title'] || '',
        bio: currentUser['bio'] || '',
      });
    }
  }

  protected get adminTypeName(): string {
    const admin = this.profile();
    return admin?.type?.name || 'Admin';
  }

  protected get isActive(): boolean {
    const admin = this.profile();
    return admin?.isActive ?? false;
  }

  protected get initials(): string {
    const admin = this.profile();
    if (!admin) return '';
    const firstName = admin.firstName?.[0] || '';
    const lastName = admin.lastName?.[0] || '';
    return `${firstName}${lastName}`.toUpperCase();
  }

  protected getProfileImage(): string | undefined {
    const admin = this.profile();
    if (!admin?.image) return undefined;
    return environment.IMG_URL + admin.image;
  }

  protected openEditDialog() {
    const admin = this.profile();
    if (admin) {
      this.profileForm.patchValue({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        image: admin.image || '',
        title: admin['title'] || '',
        bio: admin['bio'] || '',
      });
    }
    this.isEditDialogOpen = true;
  }

  protected closeEditDialog() {
    this.isEditDialogOpen = false;
    this.selectedImageFile = undefined;
  }

  protected saveProfile() {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }

    const admin = this.profile();
    if (!admin?._id) {
      this.notifications.danger('Unable to update profile. Please try again.');
      return;
    }

    this.isSaving.set(true);

    const updateData: Partial<Admin> = {
      _id: admin._id,
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      title: this.profileForm.value.title || undefined,
      bio: this.profileForm.value.bio || undefined,
    };

    // Only include image if it's a new file or URL
    if (this.selectedImageFile) {
      // Image file will be handled separately
    } else if (this.profileForm.value.image) {
      updateData.image = this.profileForm.value.image;
    }

    this.adminService.update(updateData, this.selectedImageFile).subscribe({
      next: (updatedAdmin) => {
        this.profile.set(updatedAdmin);
        this.authService.setCurrentUser(updatedAdmin);
        this.isEditDialogOpen = false;
        this.selectedImageFile = undefined;
        this.isSaving.set(false);
        this.notifications.success('Profile updated successfully');
      },
      error: (error) => {
        this.isSaving.set(false);
        const errorMessage =
          error?.error?.message ||
          'Failed to update profile. Please try again.';
        this.notifications.danger(errorMessage);
      },
    });
  }

  protected onImageChange(value?: string) {
    const control = this.profileForm.get('image');
    control?.setValue(value ?? '', { emitEvent: true });
    control?.markAsTouched();
    control?.markAsDirty();
  }

  protected onImageFileSelected(file: File) {
    this.selectedImageFile = file;
  }
}
