import { Component, type OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Book, BookService } from "../../services/book.service";
import { Reservation, ReservationService } from "../../services/reservation.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  searchTerm = "";
  loading = false;
  error = "";

  displayedBookColumns: string[] = ["title", "author", "isbn", "category", "status", "actions"];
  displayedReservationColumns: string[] = ["bookTitle", "studentName", "requestDate", "status", "actions"];

  books: Book[] = [];
  reservations: Reservation[] = [];

  addBookForm: FormGroup;
  editBookForm: FormGroup;
  addBookDialogOpen = false;
  editBookDialogOpen = false;
  selectedBook: Book | null = null;
  coverImagePreview: string | null = null;
  coverImageFile: File | null = null;
  coverImageError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private bookService: BookService,
    private reservationService: ReservationService
  ) {
    const bookFormConfig = {
      title: ["", [Validators.required]],
      author: ["", [Validators.required]],
      isbn: ["", [Validators.required]],
      category: ["", [Validators.required]],
      description: [""],
      status: ["available", [Validators.required]],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
    };

    this.addBookForm = this.fb.group(bookFormConfig);
    this.editBookForm = this.fb.group(bookFormConfig);
  }

  ngOnInit(): void {
    this.loadBooks();
    this.loadReservations();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load books';
        this.loading = false;
        this.snackBar.open('Error loading books', 'Close', { duration: 3000 });
      }
    });
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load reservations';
        this.loading = false;
        this.snackBar.open('Error loading reservations', 'Close', { duration: 3000 });
      }
    });
  }

  get filteredBooks(): Book[] {
    return this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.isbn.includes(this.searchTerm)
    );
  }

  openAddBookDialog(): void {
    this.addBookForm.reset({
      status: 'available',
      rating: 0
    });
    this.addBookDialogOpen = true;
  }

  openEditBookDialog(book: Book): void {
    this.selectedBook = book;
    this.editBookForm.patchValue({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description,
    });
    this.editBookDialogOpen = true;
  }

  addBook(): void {
    if (this.addBookForm.valid) {
      const formData = new FormData();
      const formValue = this.addBookForm.value;

      Object.keys(formValue).forEach(key => {
        formData.append(key, formValue[key]);
      });

      if (this.coverImageFile) {
        formData.append('coverImage', this.coverImageFile);
      }


      this.loading = true;
      this.bookService.createBook(formData).subscribe({
        next: (book) => {
          this.books.push(book);
          this.snackBar.open("Book added successfully", "Close", { duration: 3000 });
          this.closeAddBookDialog();
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || "Error adding book", "Close", { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.addBookForm);
    }
  }

  editBook(): void {
    if (this.editBookForm.valid && this.selectedBook) {
      this.loading = true;
      this.bookService.updateBook(this.selectedBook._id, this.editBookForm.value).subscribe({
        next: (book) => {
          const index = this.books.findIndex((b) => b._id === this.selectedBook!._id);
          if (index !== -1) {
            this.books[index] = book;
          }
          this.snackBar.open("Book updated successfully", "Close", { duration: 3000 });
          this.closeEditBookDialog();
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || "Error updating book", "Close", { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.editBookForm);
    }
  }

  deleteBook(book: Book): void {
    this.bookService.deleteBook(book._id).subscribe({
      next: () => {
        this.books = this.books.filter((b) => b._id !== book._id);
        this.snackBar.open(`Book "${book.title}" deleted successfully`, "Close", { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open("Error deleting book", "Close", { duration: 3000 });
      }
    });
  }

  approveReservation(reservation: Reservation): void {
    this.reservationService.updateReservationStatus(reservation._id, 'approved').subscribe({
      next: (updatedReservation) => {
        const index = this.reservations.findIndex((r) => r._id === updatedReservation._id);
        if (index !== -1) {
          this.reservations[index] = updatedReservation;
        }
        this.snackBar.open(`Reservation approved successfully`, "Close", { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open("Error approving reservation", "Close", { duration: 3000 });
      }
    });
  }

  denyReservation(reservation: Reservation): void {
    this.reservationService.updateReservationStatus(reservation._id, 'denied').subscribe({
      next: (updatedReservation) => {
        const index = this.reservations.findIndex((r) => r._id === updatedReservation._id);
        if (index !== -1) {
          this.reservations[index] = updatedReservation;
        }
        this.snackBar.open(`Reservation denied successfully`, "Close", { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open("Error denying reservation", "Close", { duration: 3000 });
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  triggerCoverImageUpload(): void {
    document.getElementById('coverImage')?.click();
  }

  onCoverImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size <= 5000000) { // 5MB limit
          this.coverImageFile = file;
          this.coverImageError = null;
          const reader = new FileReader();
          reader.onload = () => {
            this.coverImagePreview = reader.result as string;
          };
          reader.readAsDataURL(file);
        } else {
          this.coverImageError = 'Image size should not exceed 5MB';
        }
      } else {
        this.coverImageError = 'Please select a valid image file';
      }
    }
  }

  resetImageState(): void {
    this.coverImageFile = null;
    this.coverImagePreview = null;
    this.coverImageError = null;
  }

  closeAddBookDialog(): void {
    this.addBookDialogOpen = false;
    this.addBookForm.reset({
      status: 'available',
      rating: 0
    });
    this.resetImageState();
  }

  closeEditBookDialog(): void {
    this.editBookDialogOpen = false;
    this.selectedBook = null;
    this.resetImageState();
  }
}



