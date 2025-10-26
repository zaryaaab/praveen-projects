import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { AuthService } from "./auth.service"
import { map } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    const user = this.authService.getCurrentUser();
    if(user?.role === 'admin'){
        return true
    }
    this.router.navigate(["/dashboard"])
    return false
  }
}