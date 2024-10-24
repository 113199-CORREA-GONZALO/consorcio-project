import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee, EmployeeFilter, EmployeePayment } from '../models/employee.model';
import { MapperService } from './MapperCamelToSnake/mapper.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private apiUrl = 'http://localhost:8063/employees';
  private mapperService = inject(MapperService);
  private http = inject(HttpClient);

  getEmployees(): Observable<Employee[]> {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      map(employees => this.mapperService.toCamelCase(employees))
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(employee => this.mapperService.toCamelCase(employee))
    );
  }

  addEmployee(employee: Employee): Observable<Employee> {
    // Assuming employee.hiringDate is a Date object
    employee.hiringDate.setHours(employee.hiringDate.getHours() + 5);
    return this.http.post<Employee>(this.apiUrl, employee);
  }
  // Actualizar un empleado existente
  updateEmployee(employee: Employee): Observable<Employee> {
    employee.hiringDate.setHours(employee.hiringDate.getHours() + 5);
    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEmployeePayments(employeeId: number): Observable<EmployeePayment[]> {
    return this.http.get<EmployeePayment[]>(`${this.apiUrl}/${employeeId}/payments`);
  }

  getEmployee(id:number):Observable<Employee>{
    return this.http.get<Employee>(this.apiUrl+"/"+id);
  }

  searchEmployees(filter: EmployeeFilter): Observable<Employee[]> {
    const snakeCaseFilter = this.mapperService.toSnakeCase(filter);
    return this.http.post<any[]>(`${this.apiUrl}/search`, snakeCaseFilter).pipe(
      map(employees => this.mapperService.toCamelCase(employees))
    );
  }
}

