import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reservation {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
    };
    book: {
        title: string;
        coverImageBase64?: string
        author?: string;
        status?: string;
    };
    status: 'pending' | 'approved' | 'denied' | 'cancelled' | 'completed';
    waitlistPosition: number;
    requestDate: Date;
    approvalDate?: Date;
    dueDate?: Date;
    returnDate?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    private apiUrl = `${environment.apiUrl}/reservations`;

    constructor(private http: HttpClient) { }

    getReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/all`);
    }

    getUserReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/my-reservations`);
    }

    getReservation(id: string): Observable<Reservation> {
        return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
    }

    createReservation(bookId: string): Observable<Reservation> {
        return this.http.post<Reservation>(this.apiUrl, { bookId });
    }

    updateReservationStatus(id: string, status: Reservation['status']): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.apiUrl}/${id}/status`, { status });
    }

    cancelReservation(id: string): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.apiUrl}/${id}/cancel`,{});
    }
}