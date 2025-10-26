import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Book } from "../../services/book.service";

@Component({
  selector: "app-book-list-item",
  templateUrl: "./book-list-item.component.html",
  styleUrls: ["./book-list-item.component.scss"],
})
export class BookListItemComponent {
  @Input() book!: Book;
  @Output() reserve = new EventEmitter<Book>();

  get isAvailable(): boolean {
    return this.book.status === 'available';
  }

  reserveBook(): void {
    if (this.isAvailable) {
      this.reserve.emit(this.book);
    }
  }
}

