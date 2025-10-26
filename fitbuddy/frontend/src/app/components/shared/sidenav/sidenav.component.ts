import { Component } from "@angular/core"
import  { Router } from "@angular/router"
import  { AuthService } from "../../../services/auth.service"

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
})
export class SidenavComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  isActive(route: string): boolean {
    return this.router.url === route
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}

