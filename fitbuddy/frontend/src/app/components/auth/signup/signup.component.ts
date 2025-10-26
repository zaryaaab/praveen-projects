import { Component } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  colleges = [
    { value: 'State University', viewValue: 'State University' },
    { value: 'Tech Institute', viewValue: 'Tech Institute' },
    { value: 'Liberal Arts College', viewValue: 'Liberal Arts College' },
    { value: 'Community College', viewValue: 'Community College' },
    { value: 'Other', viewValue: 'Other' },
  ];
  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        college: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        goal: [''],
        weight: [''],
        height: [''],
      },
      { validator: this.checkPasswords }
    );
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { notMatching: true };
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.isStep1Valid()) {
      this.currentStep = 2; // Move to step 2
      this.setStep2Validators();
    } else if (this.currentStep === 2 && this.isStep2Valid()) {
      this.onSubmit(); // Submit the form
    }
  }

  isStep1Valid(): boolean {
    return (
      this.signupForm.get('name')!.valid &&
      this.signupForm.get('email')!.valid &&
      this.signupForm.get('college')!.valid &&
      this.signupForm.get('password')!.valid &&
      this.signupForm.get('confirmPassword')!.valid
    );
  }

  isStep2Valid(): boolean {
    return (
      this.signupForm.get('goal')!.valid &&
      this.signupForm.get('weight')!.valid &&
      this.signupForm.get('height')!.valid
    );
  }

  setStep2Validators(): void {
    this.signupForm.get('goal')!.setValidators(Validators.required);
    this.signupForm.get('weight')!.setValidators(Validators.required);
    this.signupForm.get('height')!.setValidators(Validators.required);

    this.signupForm.get('goal')!.updateValueAndValidity();
    this.signupForm.get('weight')!.updateValueAndValidity();
    this.signupForm.get('height')!.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { name, email, college, password, goal, weight, height } = this.signupForm.value;
      this.authService.signup(name, email, college, password, goal, weight, height).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Signup failed:', error);
          // Handle signup error (show message, etc.)
        },
      });
    }
  }
}
