import { Component, type OnInit } from "@angular/core"
import { FormControl } from "@angular/forms"
import { MatSnackBar } from "@angular/material/snack-bar"
import { BookService, type Book } from "../services/book.service"
import { ReservationService } from "../services/reservation.service"

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  searchControl = new FormControl("")
  categoryControl = new FormControl("all")
  availabilityControl = new FormControl("all")
  ratingControl = new FormControl(0)
  viewType = "grid"

  books: Book[] = []
  filteredBooks: Book[] = []
  categories: string[] = []
  isLoading = false
  error: string | null = null

  constructor(
    private bookService: BookService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBooks()
    // Extract unique categories
    this.categories = [...new Set(this.books.map((book) => book.category))]

    // Initialize filtered books
    this.filteredBooks = [...this.books]

    // Subscribe to form control changes
    this.searchControl.valueChanges.subscribe(() => this.filterBooks())
    this.categoryControl.valueChanges.subscribe(() => this.filterBooks())
    this.availabilityControl.valueChanges.subscribe(() => this.filterBooks())
    this.ratingControl.valueChanges.subscribe(() => this.filterBooks())
  }

  filterBooks(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || ""
    const category = this.categoryControl.value
    const availability = this.availabilityControl.value
    const minRating = this.ratingControl.value || 0

    this.filteredBooks = this.books.filter((book) => {
      // Search term filter
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.includes(searchTerm)

      // Category filter
      const matchesCategory = category === "all" || book.category === category

      // Availability filter
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && book.status === 'available') ||
        (availability === "unavailable" && book.status !== 'available')

      // Rating filter
      const matchesRating = book.rating >= minRating

      return matchesSearch && matchesCategory && matchesAvailability && matchesRating
    })
  }

  setViewType(type: string): void {
    this.viewType = type
  }

  clearFilters(): void {
    this.searchControl.setValue("")
    this.categoryControl.setValue("all")
    this.availabilityControl.setValue("all")
    this.ratingControl.setValue(0)
  }

  loadBooks(): void {
    this.isLoading = true
    this.error = null

    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log(books)
        this.books = books
        this.filteredBooks = books
        this.categories = [...new Set(books.map(book => book.category))]
        this.isLoading = false
      },
      error: (error) => {
        this.error = 'Failed to load books. Please try again later.'
        this.isLoading = false
        console.error('Error loading books:', error)
      }
    })
  }

  reserveBook(book: Book): void {
    this.isLoading = true;
    this.reservationService.createReservation(book._id).subscribe({
      next: (res) => {
        this.snackBar.open(`Successfully reserved "${book.title}"`, 'Close', { duration: 3000 });
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to reserve book', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}

