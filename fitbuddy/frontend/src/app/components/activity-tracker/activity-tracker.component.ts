import { Component, type OnInit } from "@angular/core"
import { ActivityService } from "../../services/activity.service"
import { MatDialog } from "@angular/material/dialog"
import { ActivityEntryDialogComponent } from "./activity-entry-dialog.component"

@Component({
  selector: "app-activity-tracker",
  templateUrl: "./activity-tracker.component.html",
  styleUrls: ["./activity-tracker.component.scss"],
})
export class ActivityTrackerComponent implements OnInit {
  activeTab = "steps"
  activityData: {date: string, steps: number, sleep: number, workout: number}[] = []
  stepsData: number[] = []
  sleepData: number[] = []
  workoutMinutesData: number[] = []
  dateLabels: string[] = []


  constructor(
    private activityService: ActivityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadActivityData()
  }

  loadActivityData(): void {
    this.activityService.getUserActivities().subscribe({
      next: (data) => {
        if (data) {
          this.activityData = data;
          this.processActivityData();
        }
      },
      error: (err) => {
        console.error('Failed to load activity data:', err);
      }
    });
  }

  processActivityData(): void {
    this.stepsData = this.activityData.map(item => item.steps);
    this.sleepData = this.activityData.map(item => item.sleep);
    this.workoutMinutesData = this.activityData.map(item => item.workout);
    this.dateLabels = this.activityData.map(item => 
      new Date(item.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
    );
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  getStepBarHeight(steps: number): string {
    return `${(steps / 10000) * 100}%`
  }

  getSleepBarHeight(hours: number): string {
    return `${(hours / 8) * 100}%` // Using 8 hours as ideal sleep target
  }

  getWorkoutBarHeight(minutes: number): string {
    return `${(minutes / 60) * 100}%` // Using 60 minutes as target workout duration
  }

  // Add these methods for button functionality
  openActivityDialog(): void {
    const dialogRef = this.dialog.open(ActivityEntryDialogComponent, {
      width: '400px',
      data: { steps: '', sleep: '', workoutMinutes: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.steps && !isNaN(Number(result.steps))) {
          const steps = Number(result.steps);
          this.stepsData[this.stepsData.length - 1] += steps;
          localStorage.setItem('stepsData', JSON.stringify(this.stepsData));
        }
        
        if (result.sleep && !isNaN(Number(result.sleep))) {
          const hours = Number(result.sleep);
          this.sleepData[this.sleepData.length - 1] = hours;
          localStorage.setItem('sleepData', JSON.stringify(this.sleepData));
        }
        
        if (result.workoutMinutes && !isNaN(Number(result.workoutMinutes))) {
         const workOutMinutes = Number(result.workoutMinutes);
          this.workoutMinutesData[this.workoutMinutesData.length - 1] = workOutMinutes;
          localStorage.setItem('workoutMinutesData', JSON.stringify(this.workoutMinutesData));
        }
      }
    });
  }


}

