import type { Routes } from "@angular/router"
import { HomeComponent } from "./home/home.component"
import { LoginComponent } from "./auth/login/login.component"
import { RegisterComponent } from "./auth/register/register.component"
import { DashboardComponent } from "./dashboard/dashboard.component"
import { ReservationsComponent } from "./dashboard/reservations/reservations.component"
import { ProfileComponent } from "./dashboard/profile/profile.component"
import { RecommendationsComponent } from "./dashboard/recommendations/recommendations.component"
import { AdminComponent } from "./dashboard/admin/admin.component"
import { AuthGuard } from "./auth/auth.guard"
import { AdminGuard } from "./auth/admin.guard"
import { PublicGuard } from "./auth/public.guard"

export const routes: Routes = [
  { path: "", component: HomeComponent, canActivate: [PublicGuard] },
  { path: "auth/login", component: LoginComponent, canActivate: [PublicGuard] },
  { path: "auth/register", component: RegisterComponent, canActivate: [PublicGuard] },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "dashboard/reservations",
    component: ReservationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "dashboard/profile",
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "dashboard/recommendations",
    component: RecommendationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "dashboard/admin",
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: "**", redirectTo: "" },
]

