import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"
import { RouterModule } from "@angular/router"

import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"

// Material Modules
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatListModule } from "@angular/material/list"
import { MatMenuModule } from "@angular/material/menu"
import { MatNativeDateModule } from "@angular/material/core"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatSelectModule } from "@angular/material/select"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatSliderModule } from "@angular/material/slider"
import { MatTabsModule } from "@angular/material/tabs"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatDialogModule } from "@angular/material/dialog"; // Add this import

// Components
import { ActivityTrackerComponent } from "./components/activity-tracker/activity-tracker.component"
import { WorkoutPlansComponent } from "./components/workout-plans/workout-plans.component"
import { ChallengesComponent } from "./components/challenges/challenges.component"
import { LoginComponent } from "./components/auth/login/login.component"
import { SignupComponent } from "./components/auth/signup/signup.component"
import { ProfileComponent } from "./components/profile/profile.component"
import { SidenavComponent } from "./components/shared/sidenav/sidenav.component"
import { ActivityEntryDialogComponent } from "./components/activity-tracker/activity-entry-dialog.component";
import { DietPlanDialogComponent } from "./components/workout-plans/diet-plan-dialog.component";

// Services
import { AuthService } from "./services/auth.service"
import { WorkoutService } from "./services/workout.service"
import { ActivityService } from "./services/activity.service"

@NgModule({
  declarations: [
    AppComponent,
    ActivityTrackerComponent,
    WorkoutPlansComponent,
    ChallengesComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent,
    SidenavComponent,
    ActivityEntryDialogComponent,
    DietPlanDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    // Material Modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatTabsModule,
    MatToolbarModule,
    MatDialogModule,
  ],
  providers: [AuthService, WorkoutService, ActivityService],
  bootstrap: [AppComponent],
})
export class AppModule {}

