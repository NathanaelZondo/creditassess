import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})
export class UserRegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(StateService);

  registrationForm!: FormGroup;

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      cellphone: ['', [Validators.required, Validators.pattern(/^0[0-9]{9}$/)]],
    });

    const existingUserData = this.stateService.currentState.userData;
    if (existingUserData) {
      this.registrationForm.patchValue(existingUserData);
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.stateService.setUserData(this.registrationForm.value);
      this.router.navigate(['/credit-evaluation']);
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  get name() {
    return this.registrationForm.get('name');
  }
  get surname() {
    return this.registrationForm.get('surname');
  }
  get email() {
    return this.registrationForm.get('email');
  }
  get cellphone() {
    return this.registrationForm.get('cellphone');
  }
}
