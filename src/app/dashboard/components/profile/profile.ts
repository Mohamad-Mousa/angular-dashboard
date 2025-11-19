import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogComponent } from '../../../shared/components/dialog/dialog';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  title: string;
  bio: string;
}

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
export class ProfileComponent {
  protected profile: Profile = {
    firstName: 'Amelia',
    lastName: 'Carter',
    email: 'amelia.carter@phd-labs.com',
    image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=80',
    title: 'Global Admin',
    bio: 'Drives access policy strategy and reviews weekly compliance signals.',
  };

  protected isEditDialogOpen = false;
  protected profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: [this.profile.firstName, [Validators.required]],
      lastName: [this.profile.lastName, [Validators.required]],
      email: [this.profile.email, [Validators.required, Validators.email]],
      image: [this.profile.image, [Validators.required]],
      title: [this.profile.title, [Validators.required]],
      bio: [this.profile.bio, [Validators.required, Validators.minLength(10)]],
    });
  }

  protected get initials() {
    return `${this.profile.firstName[0]}${this.profile.lastName[0]}`;
  }

  protected openEditDialog() {
    this.profileForm.reset({ ...this.profile });
    this.isEditDialogOpen = true;
  }

  protected closeEditDialog() {
    this.isEditDialogOpen = false;
  }

  protected saveProfile() {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }

    this.profile = {
      ...this.profile,
      ...this.profileForm.value,
    };
    this.isEditDialogOpen = false;
  }

  protected onImageChange(value?: string) {
    const control = this.profileForm.get('image');
    control?.setValue(value ?? '', { emitEvent: true });
    control?.markAsTouched();
    control?.markAsDirty();
  }
}

