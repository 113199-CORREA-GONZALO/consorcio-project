import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  private apiUrl = 'http://localhost:3000/suppliers';

  constructor(private http: HttpClient) {}

  getProviders(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  addProvider(provider: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, provider);
  }

  updateProvider(provider: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${provider.id}`, provider);
  }

  deleteProvider(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
