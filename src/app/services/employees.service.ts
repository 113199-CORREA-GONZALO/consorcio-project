import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
// URL de la API donde se manejarán las operaciones de CRUD para empleados.
// para ejecutar json server en la terminal poner:
// json-server --watch db.json --port 3000
  private apiUrl = 'http://localhost:3000/employees';

  // Inyectamos HttpClient en el constructor para realizar peticiones HTTP.
  constructor(private http: HttpClient) {}

  // Método para obtener la lista de empleados desde la API.
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Método para agregar un nuevo empleado a la API.
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // Método para actualizar los datos de un empleado en la API.
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, employee);
  }

  // Método para eliminar un empleado de la API (deberia cambio de estado).
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
