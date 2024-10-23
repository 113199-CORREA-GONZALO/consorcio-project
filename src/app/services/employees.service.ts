import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeePayment } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private apiUrl = 'http://localhost:3000/employees'; // URL de la API para empleados

  constructor(private http: HttpClient) {}

  // Obtener empleados
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // Agregar un nuevo empleado
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // Actualizar un empleado existente
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, employee);
  }

  // Eliminar (o desactivar) un empleado
  deleteEmployee(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, { state: 'INACTIVE' });
  }

  // Obtener pagos de un empleado
  getEmployeePayments(employeeId: number): Observable<EmployeePayment[]> {
    return this.http.get<EmployeePayment[]>(`${this.apiUrl}/${employeeId}/payments`);
  }
}
