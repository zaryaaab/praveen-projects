import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, tap } from "rxjs"
import { environment } from "../../environments/environment"

interface User {
  id?: string
  firstName: string
  lastName: string
  username: string
  email: string
  role: 'admin' | 'normal'
}

/**
 * Service responsible for handling authentication-related operations.
 * Manages user authentication state, token storage, and API communication.
 */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  /** Base URL for authentication endpoints */
  private apiUrl = `${environment.apiUrl}/auth`
  
  /** BehaviorSubject to track and emit the current user state */
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  
  /** Observable of the current user state for components to subscribe to */
  public currentUser = this.currentUserSubject.asObservable()
  
  /** Key used for storing the authentication token in localStorage */
  private tokenKey = 'auth_token'

  /**
   * Initializes the service and restores user session if available.
   * @param http - Angular's HttpClient for making API requests
   */
  constructor(private http: HttpClient) {
    const token = this.getToken()
    const storedUser = localStorage.getItem("currentUser")
    if (token && storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser))
    }
  }

  /**
   * Authenticates a user with their credentials.
   * @param credentials - Object containing user email and password
   * @returns Observable of the login response
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${this.apiUrl}/login`, credentials, { headers }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setToken(response.token)
          localStorage.setItem("currentUser", JSON.stringify(response.user))
          this.currentUserSubject.next(response.user)
        }
      })
    )
  }

  register(userData: {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
  }): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${this.apiUrl}/register`, userData, { headers }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setToken(response.token)
          localStorage.setItem("currentUser", JSON.stringify(response.user))
          this.currentUserSubject.next(response.user)
        }
      })
    )
  }

  updateProfile(userData: {
    firstName: string
    lastName: string
    email: string
  }): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put(`${this.apiUrl}/profile`, userData, { headers }).pipe(
      tap((response: any) => {
        if (response && response.user) {
          localStorage.setItem("currentUser", JSON.stringify(response.user))
          this.currentUserSubject.next(response.user)
        }
      })
    )
  }

  logout(): void {
    localStorage.removeItem("currentUser")
    localStorage.removeItem(this.tokenKey)
    this.currentUserSubject.next(null)
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }
}

