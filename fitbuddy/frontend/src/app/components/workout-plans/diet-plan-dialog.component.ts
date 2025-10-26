import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-diet-plan-dialog',
  templateUrl: './diet-plan-dialog.component.html',
  styleUrls: ['./diet-plan-dialog.component.scss'],
})
export class DietPlanDialogComponent {
  dietPlanForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DietPlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private workoutService: WorkoutService
  ) {
    this.dietPlanForm = this.fb.group({
      name: ['', Validators.required],
      calories: ['', [Validators.required, Validators.min(0)]],
      protein: ['', [Validators.required, Validators.min(0)]],
      carbs: ['', [Validators.required, Validators.min(0)]],
      fat: ['', [Validators.required, Validators.min(0)]],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.dietPlanForm.valid) {
      const { name, calories, fat, carbs, protein } = this.dietPlanForm.value;
        this.workoutService.createDietPlan(name, calories, fat, carbs, protein).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (err) => {
            console.error('Error creating diet plan:', err);
          }
        });
    }
  }
}
