import { Component } from "@angular/core"
import { Router, NavigationEnd } from "@angular/router"
import { filter } from "rxjs/operators"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "Library Management System"  
  showSidebar = true

  constructor(private router: Router) {
    // Subscribe to router events to handle sidebar visibility
    this.router.events.pipe(
      // Filter for NavigationEnd events only
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide sidebar and header for public routes (home, login, register)
      this.showSidebar = !event.url.startsWith("/auth") && event.url !== "/"
    })
  }
}

