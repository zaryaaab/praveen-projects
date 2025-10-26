import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"

import { ActivityTrackerComponent } from "./components/activity-tracker/activity-tracker.component"
import { WorkoutPlansComponent } from "./components/workout-plans/workout-plans.component"
import { ChallengesComponent } from "./components/challenges/challenges.component"
import { LoginComponent } from "./components/auth/login/login.component"
import { SignupComponent } from "./components/auth/signup/signup.component"
import { ProfileComponent } from "./components/profile/profile.component"

import { AuthGuard } from "./guards/auth.guard"

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: ActivityTrackerComponent, canActivate: [AuthGuard] },
  { path: "workouts", component: WorkoutPlansComponent, canActivate: [AuthGuard] },
  { path: "challenges", component: ChallengesComponent, canActivate: [AuthGuard] },
  { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "**", redirectTo: "/dashboard" },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

