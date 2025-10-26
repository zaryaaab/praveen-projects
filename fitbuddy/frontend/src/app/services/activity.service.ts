import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { type Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserActivities(): Observable<any> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get<any>(`${this.apiUrl}/activities/last7days`, { headers })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  createUserActivity(
    date: Date,
    steps: number,
    sleep: number,
    workout: number
  ): Observable<any> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .post<any>(
        `${this.apiUrl}/activities`,
        { date, steps, sleep, workout },
        { headers }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
