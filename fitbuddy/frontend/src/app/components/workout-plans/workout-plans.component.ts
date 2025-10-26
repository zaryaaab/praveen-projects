import { Component, type OnInit } from "@angular/core"
import { MatDialog } from "@angular/material/dialog";
import { DietPlanDialogComponent } from "./diet-plan-dialog.component";
interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface WorkoutPlan {
  name: string;
  type: string;
  duration: number;
  exercises: Exercise[];
}

interface CustomPlan {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlan {
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

import  { WorkoutService } from "../../services/workout.service"

@Component({
  selector: "app-workout-plans",
  templateUrl: "./workout-plans.component.html",
  styleUrls: ["./workout-plans.component.scss"],
})
export class WorkoutPlansComponent implements OnInit {
  activeTab = "recommended"

  recommendedWorkouts: WorkoutPlan[] = []

  myPlans: CustomPlan[] = []

  dietPlans: DietPlan[] = []

  constructor(
    private workoutService: WorkoutService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWorkoutPlans()
  }

  loadWorkoutPlans(): void {
    this.workoutService.getWorkouts().subscribe((workouts) => {
      if (workouts) this.recommendedWorkouts = workouts
    })

    this.workoutService.getMyPlans().subscribe((plans) => {
      if (plans) this.myPlans = plans
    })

    this.workoutService.getDietPlans().subscribe((plans) => {
      if (plans) this.dietPlans = plans
    })
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  openDietPlanDialog(): void {
    const dialogRef = this.dialog.open(DietPlanDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.myPlans.push(result);
      }
    });
  }
}

