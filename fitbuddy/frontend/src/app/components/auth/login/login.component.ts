import { Component } from "@angular/core"
import {  FormBuilder, type FormGroup, Validators } from "@angular/forms"
import  { Router } from "@angular/router"
import  { AuthService } from "../../../services/auth.service"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value

      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(["/dashboard"])
        },
        error: (error) => {
          console.error("Login failed:", error)
          // Handle login error (show message, etc.)
        },
      })
    }
  }
}

