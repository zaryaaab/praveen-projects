import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivityService } from 'src/app/services/activity.service';

@Component({
  selector: 'app-activity-entry-dialog',
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Edit' : 'Add' }} Activity Data</h2>
    <mat-dialog-content>
      <form [formGroup]="activityForm">
        <mat-form-field appearance="outline">
          <mat-label>Steps</mat-label>
          <input
            matInput
            type="number"
            formControlName="steps"
            placeholder="Enter steps"
            required
            min="0"
          />
          <mat-error *ngIf="activityForm.get('steps')?.hasError('required')"
            >Steps is required</mat-error
          >
          <mat-error *ngIf="activityForm.get('steps')?.hasError('min')"
            >Steps must be positive</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Sleep (hours)</mat-label>
          <input
            matInput
            type="number"
            step="0.1"
            formControlName="sleep"
            placeholder="Enter sleep hours"
            required
            min="0"
            max="24"
          />
          <mat-error *ngIf="activityForm.get('sleep')?.hasError('required')"
            >Sleep hours is required</mat-error
          >
          <mat-error *ngIf="activityForm.get('sleep')?.hasError('min')"
            >Minimum sleep is 0 hours</mat-error
          >
          <mat-error *ngIf="activityForm.get('sleep')?.hasError('max')"
            >Maximum sleep is 24 hours</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="date"
            required
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="activityForm.get('date')?.hasError('required')"
            >Date is required</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Workout Minutes</mat-label>
          <input
            matInput
            type="number"
            formControlName="workoutMinutes"
            placeholder="Enter workout minutes"
            required
            min="0"
          />
          <mat-error
            *ngIf="activityForm.get('workoutMinutes')?.hasError('required')"
            >Workout minutes is required</mat-error
          >
          <mat-error *ngIf="activityForm.get('workoutMinutes')?.hasError('min')"
            >Workout minutes must be positive</mat-error
          >
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        type="button"
        (click)="onSave()"
        [disabled]="activityForm.invalid"
      >
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
        margin-bottom: 16px;
      }
      mat-dialog-content {
        padding-top: 8px;
      }
    `,
  ],
})
export class ActivityEntryDialogComponent implements OnInit {
  activityForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ActivityEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private activityService: ActivityService
  ) {
    this.activityForm = this.fb.group({
      date: [new Date(), [Validators.required]],
      steps: [0, [Validators.required, Validators.min(0)]],
      sleep: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      workoutMinutes: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    // If data exists, patch the form with it (for edit operations)
    if (this.data && this.data.activity) {
      this.activityForm.patchValue(this.data.activity);
    }
  }

  onSave(): void {
    if (this.activityForm.valid) {
      const { steps, date, sleep, workoutMinutes } = this.activityForm.value;
      this.activityService
        .createUserActivity(date, steps, sleep, workoutMinutes)
        .subscribe({
          next: () => {
            this.dialogRef.close(this.activityForm.value);
          },
          error: (err) => {
            console.error('Failed to save activity:', err);
          },
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
