import { Component, Input } from "@angular/core"
import type { MatSidenav } from "@angular/material/sidenav"
import  { Router } from "@angular/router"
import  { AuthService } from "../../auth/auth.service"

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  @Input() sidenav!: MatSidenav
  @Input() isHandset = false

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  toggleSidenav(): void {
    this.sidenav.toggle()
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if(user){
      return user.firstName[0]+user.lastName[0]
    }
    return 'JD'
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/"])
  }
}

