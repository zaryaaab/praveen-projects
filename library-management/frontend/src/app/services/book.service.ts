import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  rating: number;
  status: string;
  coverImage?: File;
  coverImageBase64?: string;
  reason?: string;
  borrowCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/search`);
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  createBook(formData: FormData): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}`, formData);
  }

  updateBook(id: string, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchBooks(params: {
    query?: string;
    category?: string;
    minRating?: number;
    status?: string;
  }): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/search`, { params: params as any });
  }

  getRecommendedBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/recommendations`);
  }

  getPopularBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/popular`);
  }
}