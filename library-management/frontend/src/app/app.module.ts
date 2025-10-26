import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"
import { RouterModule } from "@angular/router"
import { AuthInterceptor } from "./auth/auth.interceptor"

/**
 * Angular Material UI component imports
 * These modules provide the material design components used throughout the application
 * for consistent styling and enhanced user experience
 */
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatChipsModule } from "@angular/material/chips"
import { MatDialogModule } from "@angular/material/dialog"
import { MatDividerModule } from "@angular/material/divider"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatGridListModule } from "@angular/material/grid-list"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatListModule } from "@angular/material/list"
import { MatMenuModule } from "@angular/material/menu"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatRadioModule } from "@angular/material/radio"
import { MatSelectModule } from "@angular/material/select"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatSliderModule } from "@angular/material/slider"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatSortModule } from "@angular/material/sort"
import { MatTableModule } from "@angular/material/table"
import { MatTabsModule } from "@angular/material/tabs"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatBadgeModule } from "@angular/material/badge"
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

/**
 * Application Components
 * These components make up the different views and features of the application
 */
import { AppComponent } from "./app.component"
import { HomeComponent } from "./home/home.component"
import { LoginComponent } from "./auth/login/login.component"
import { RegisterComponent } from "./auth/register/register.component"
import { DashboardComponent } from "./dashboard/dashboard.component"
import { ReservationsComponent } from "./dashboard/reservations/reservations.component"
import { ProfileComponent } from "./dashboard/profile/profile.component"
import { RecommendationsComponent } from "./dashboard/recommendations/recommendations.component"
import { AdminComponent } from "./dashboard/admin/admin.component"
import { SidenavComponent } from "./shared/sidenav/sidenav.component"
import { HeaderComponent } from "./shared/header/header.component"
import { BookCardComponent } from "./shared/book-card/book-card.component"
import { BookListItemComponent } from "./shared/book-list-item/book-list-item.component"

// Routes
import { routes } from "./app.routes";


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    ReservationsComponent,
    ProfileComponent,
    RecommendationsComponent,
    AdminComponent,
    SidenavComponent,
    HeaderComponent,
    BookCardComponent,
    BookListItemComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),

    // Angular Material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSlideToggleModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

