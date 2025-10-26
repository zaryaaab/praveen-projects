import { Component, Input, Output, EventEmitter } from "@angular/core"

@Component({
  selector: "app-book-card",
  templateUrl: "./book-card.component.html",
  styleUrls: ["./book-card.component.scss"],
})
export class BookCardComponent {
  @Input() book: any
  @Output() reserve = new EventEmitter<any>()

  reserveBook(): void {
    this.reserve.emit(this.book)
  }
}

