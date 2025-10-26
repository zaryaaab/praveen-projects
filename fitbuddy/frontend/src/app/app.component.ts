import { Component } from "@angular/core"
import  { Router } from "@angular/router"
import  { AuthService } from "./services/auth.service"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "FitBuddy"

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  isLoginPage(): boolean {
    return this.router.url === "/login" || this.router.url === "/signup"
  }
}

