import { Component, type OnInit, ViewChild } from "@angular/core"
import type { MatSidenav } from "@angular/material/sidenav"
import {  Router, NavigationEnd } from "@angular/router"
import { filter } from "rxjs/operators"
import {  BreakpointObserver, Breakpoints } from "@angular/cdk/layout"
import  { AuthService } from "../../auth/auth.service"

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
})
export class SidenavComponent implements OnInit {
  @ViewChild("sidenav") sidenav!: MatSidenav
  isHandset = false

  navItems = [
    { name: "Dashboard", route: "/dashboard", icon: "home" },
    { name: "My Reservations", route: "/dashboard/reservations", icon: "bookmark" },
    { name: "Recommendations", route: "/dashboard/recommendations", icon: "bar_chart" },
  ]

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isHandset = result.matches
      if (this.isHandset) {
        this.sidenav?.close()
      } else {
        this.sidenav?.open()
      }
    })

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.isHandset) {
        this.sidenav?.close()
      }
    })
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: "exact",
      queryParams: "exact",
      fragment: "ignored",
      matrixParams: "ignored",
    })
  }

  isAdminRouteShow(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin'
  }
}

