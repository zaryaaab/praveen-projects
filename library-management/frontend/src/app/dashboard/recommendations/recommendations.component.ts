import { Component, OnInit } from "@angular/core"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Book, BookService } from "../../services/book.service"
import { ReservationService } from "src/app/services/reservation.service"

@Component({
  selector: "app-recommendations",
  templateUrl: "./recommendations.component.html",
  styleUrls: ["./recommendations.component.scss"],
})
export class RecommendationsComponent implements OnInit {
  recommendedBooks: Book[] = []
  popularBooks: Book[] = []
  loading = false
  error: string | null = null

  constructor(private snackBar: MatSnackBar, private bookService: BookService,private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadRecommendedBooks()
    this.loadPopularBooks()
  }

  loadRecommendedBooks(): void {
    this.loading = true
    this.bookService.getRecommendedBooks().subscribe({
      next: (books) => {
        this.recommendedBooks = books
        this.loading = false
      },
      error: (error) => {
        this.error = 'Failed to load recommended books'
        this.loading = false
        this.snackBar.open('Error loading recommended books', 'Close', { duration: 3000 })
      }
    })
  }

  loadPopularBooks(): void {
    this.loading = true
    this.bookService.getPopularBooks().subscribe({
      next: (books) => {
        this.popularBooks = books
        this.loading = false
      },
      error: (error) => {
        this.error = 'Failed to load popular books'
        this.loading = false
        this.snackBar.open('Error loading popular books', 'Close', { duration: 3000 })
      }
    })
  }

  reserveBook(book: Book): void {
    this.loading = true;
    this.reservationService.createReservation(book._id).subscribe({
      next: (res) => {
        this.snackBar.open(`Successfully reserved "${book.title}"`, 'Close', { duration: 3000 });
        this.loading = false;
        // Refresh the book lists to get updated status
        this.loadRecommendedBooks();
        this.loadPopularBooks();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to reserve book', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}

