import { Component } from "@angular/core"
import {  FormBuilder, FormGroup, Validators } from "@angular/forms"
import  { Router } from "@angular/router"
import  { AuthService } from "../auth.service"
import  { MatSnackBar } from "@angular/material/snack-bar"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup
  isLoading = false
  hidePassword = true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    })
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true

      // Simulate authentication
      setTimeout(() => {
        this.authService.login(this.loginForm.value).subscribe(
          () => {
            this.isLoading = false
            this.router.navigate(["/dashboard"])
          },
          () => {
            this.isLoading = false
          })
      
      }, 1500)
    } else {
      this.markFormGroupTouched(this.loginForm)
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

  navigateToRegister(): void {
    this.router.navigate(["/auth/register"])
  }


}

