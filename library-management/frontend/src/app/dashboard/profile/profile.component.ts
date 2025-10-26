import { Component, type OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MatSnackBar } from "@angular/material/snack-bar"
import { AuthService } from "src/app/auth/auth.service"

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  isEditing = false
  isLoading = false
  personalInfoForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser()
    this.personalInfoForm = this.fb.group({
      firstName: [{ value: user ? user.firstName : "John", disabled: !this.isEditing }, [Validators.required]],
      lastName: [{ value: user ? user.lastName : "Doe", disabled: !this.isEditing }, [Validators.required]],
      email: [{ value: user ? user.email : "john.doe@example.com", disabled: !this.isEditing }, [Validators.required, Validators.email]],
    })
  }

  ngOnInit(): void { }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing

    if (this.isEditing) {
      this.personalInfoForm.enable()
    } else {
      this.personalInfoForm.disable()
    }
  }

  savePersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      this.isLoading = true
      this.authService.updateProfile(this.personalInfoForm.value).subscribe(
        () => {
          this.isLoading = false
          this.snackBar.open("Personal information updated successfully", "Close", {
            duration: 3000,
          })
          this.toggleEditMode()
        },
        (error) => {
          this.isLoading = false
          this.snackBar.open(error.error.message || "Failed to update profile", "Close", {
            duration: 3000,
          })
        }
      )
    } else {
      this.markFormGroupTouched(this.personalInfoForm)
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
}

