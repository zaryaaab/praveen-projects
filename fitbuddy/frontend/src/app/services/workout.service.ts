import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWorkouts(): Observable<any> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/workouts`, { headers }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getMyPlans(): Observable<any> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/customdiets`, { headers }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getDietPlans(): Observable<any> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/dietplans`, { headers }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  createDietPlan(name: string, calories: number, fat: number, carbs: number, protein: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { name, calories, fat, carbs, protein };
    return this.http.post<any>(`${this.apiUrl}/customdiets`, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
