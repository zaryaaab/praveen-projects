import { Component } from "@angular/core"
import  { Router } from "@angular/router"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  features = [
    {
      icon: "menu_book",
      title: "Extensive Book Catalog",
      description: "Search and filter through thousands of books by title, author, or ISBN",
    },
    {
      icon: "people",
      title: "User-Friendly Profiles",
      description: "Manage your personal information and reading preferences",
    },
    {
      icon: "schedule",
      title: "Easy Reservations",
      description: "Reserve books with a single click and get notified when they're available",
    },
    {
      icon: "bookmark",
      title: "Admin Controls",
      description: "Comprehensive tools for librarians to manage the entire collection",
    },
    {
      icon: "bar_chart",
      title: "Smart Recommendations",
      description: "Get personalized book suggestions based on your reading history",
    },
    {
      icon: "analytics",
      title: "Reading Analytics",
      description: "Track your reading habits and set goals for continuous improvement",
    },
  ]

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path])
  }
}

