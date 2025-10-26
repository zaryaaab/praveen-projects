import { Component, type OnInit } from "@angular/core"
import {  FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  personalInfoForm: FormGroup
  bmi: number | null = null;
 
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.personalInfoForm = this.fb.group({
      name: ["Alex Doe", Validators.required],
      email: ["alex.doe@college.edu", [Validators.required, Validators.email]],
      college: ["State University", Validators.required],
      goal: ["", Validators.required],
      weight: ["", Validators.required],
      height: ["", Validators.required],
    })

  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  calculateBMI(): void {
    const weight = this.personalInfoForm.get('weight')?.value;
    const heightCm = this.personalInfoForm.get('height')?.value;
    if (weight && heightCm) {
      const heightM = heightCm / 100;
      this.bmi = +(weight / (heightM * heightM)).toFixed(2);
    } else {
      this.bmi = null;
    }
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe((profile) => {
      if (profile) {
        // Populate forms with user data
        this.personalInfoForm.patchValue({
          name: profile.name,
          email: profile.email,
          college: profile.college,
          goal: profile.goal,
          weight: profile.weight,
          height: profile.height,
        });
        this.calculateBMI();
      }
    });
  }

}

