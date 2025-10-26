import { Injectable } from "@angular/core"
import  { CanActivate, Router } from "@angular/router"
import  { AuthService } from "./auth.service"

/**
 * Route guard that protects routes from unauthorized access.
 * Implements Angular's CanActivate interface to control navigation to protected routes.
 *
 * @remarks
 * This guard checks if a user is authenticated before allowing access to protected routes.
 * If the user is not authenticated, they are redirected to the login page.
 */
@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  /**
   * Determines if a route can be activated.
   * @returns true if the user is authenticated, false otherwise
   */
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true
    }

    // Redirect to login page if not authenticated
    this.router.navigate(["/auth/login"])
    return false
  }
}

