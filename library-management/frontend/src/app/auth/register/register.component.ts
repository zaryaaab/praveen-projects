import { Component } from "@angular/core"
import {  FormBuilder, FormGroup, Validators } from "@angular/forms"
import  { Router } from "@angular/router"
import  { AuthService } from "../auth.service"

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  registerForm: FormGroup
  isLoading = false
  hidePassword = true
  hideConfirmPassword = true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validator: this.checkPasswords },
    )
  }

  checkPasswords(group: FormGroup) {
    const password = group.get("password")?.value
    const confirmPassword = group.get("confirmPassword")?.value
    return password === confirmPassword ? null : { notMatching: true }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true

      // Simulate registration
      setTimeout(() => {
        this.authService.register(this.registerForm.value).subscribe(
          () => {
            this.isLoading = false
            this.router.navigate(["/dashboard"])
          },
          () => {
            this.isLoading = false
          })
      }, 1500)
    } else {
      this.markFormGroupTouched(this.registerForm)
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  navigateToLogin(): void {
    this.router.navigate(["/auth/login"])
  }
}

