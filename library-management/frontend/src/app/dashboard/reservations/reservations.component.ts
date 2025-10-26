import { Component, type OnInit } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { ReservationService, Reservation } from "../../services/reservation.service"
import { MatSnackBar } from "@angular/material/snack-bar"



@Component({
  selector: "app-reservations",
  templateUrl: "./reservations.component.html",
  styleUrls: ["./reservations.component.scss"],
})
export class ReservationsComponent implements OnInit {
  activeReservations: Reservation[] = []
  pendingReservations: Reservation[] = []
  historyReservations: Reservation[] = []
  isLoading = false
  error: string | null = null
   

  selectedReservation: Reservation | null = null
  cancelDialogOpen = false

  constructor(
    private dialog: MatDialog,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReservations()
  }

  private loadReservations(): void {
    this.isLoading = true
    this.error = null

    this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        this.activeReservations = reservations.filter(r => ['approved'].includes(r.status))
        this.pendingReservations = reservations.filter(r => ['pending'].includes(r.status))
        this.historyReservations = reservations.filter(r => ['completed', 'cancelled','denied'].includes(r.status))
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading reservations:', error)
        this.error = 'Failed to load reservations. Please try again.'
        this.isLoading = false
        this.snackBar.open(this.error, 'Close', { duration: 3000 })
      }
    })
  }

  getStatusInfo(status: string): { icon: string; label: string; color: string } {
    switch (status) {
      case "borrowed":
        return {
          icon: "check_circle",
          label: "Borrowed",
          color: "green",
        }
      case "overdue":
        return {
          icon: "error",
          label: "Overdue",
          color: "red",
        }
      case "ready":
        return {
          icon: "check_circle",
          label: "Ready for Pickup",
          color: "green",
        }
      case "waitlist":
        return {
          icon: "schedule",
          label: `Waitlist Position: ${this.selectedReservation?.waitlistPosition || ""}`,
          color: "amber",
        }
      case "completed":
        return {
          icon: "check_circle",
          label: "Completed",
          color: "green",
        }
      case "cancelled":
        return {
          icon: "cancel",
          label: "Cancelled",
          color: "gray",
        }
      default:
        return {
          icon: "schedule",
          label: "Unknown",
          color: "blue",
        }
    }
  }

  handleReturnBook(reservation: Reservation): void {
    this.reservationService.updateReservationStatus(reservation._id,'completed').subscribe({
      next: () => {
        const index = this.activeReservations.findIndex(r => r._id === reservation._id)
        if (index !== -1) {
          const returnedReservation = {
            ...this.activeReservations[index],
            status: 'completed',
            returnDate: new Date()
          }
          this.activeReservations.splice(index, 1)
          this.historyReservations.unshift(returnedReservation as Reservation)
        }
        this.snackBar.open('Book returned successfully', 'Close', { duration: 3000 })
      },
      error: (error) => {
        console.error('Error returning book:', error)
        this.snackBar.open('Failed to return book. Please try again.', 'Close', { duration: 3000 })
      }
    })
  }

  handleCancelReservation(reservation: Reservation): void {
    this.selectedReservation = reservation
    this.cancelDialogOpen = true
  }

  confirmCancelReservation(): void {
    if (this.selectedReservation) {
      this.reservationService.cancelReservation(this.selectedReservation._id).subscribe({
        next: () => {
          const index = this.pendingReservations.findIndex(r => r._id === this.selectedReservation?._id)
          if (index !== -1) {
            const cancelledReservation = {
              ...this.pendingReservations[index],
              status: 'cancelled'
            }
            this.pendingReservations.splice(index, 1)
            this.historyReservations.unshift(cancelledReservation as Reservation)
          }
          this.snackBar.open('Reservation cancelled successfully', 'Close', { duration: 3000 })
          this.closeDialog()
        },
        error: (error) => {
          console.error('Error cancelling reservation:', error)
          this.snackBar.open('Failed to cancel reservation. Please try again.', 'Close', { duration: 3000 })
          this.closeDialog()
        }
      })
    }
  }

  closeDialog(): void {
    this.cancelDialogOpen = false
    this.selectedReservation = null
  }
}

