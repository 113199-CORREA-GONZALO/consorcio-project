import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { EmployeesService } from '../../services/employees.service';
import { Employee } from '../../models/employee.model';
import { EmployeeType } from '../../models/enums/employee-type.enum';
import { StatusType } from '../../models/enums/status-type.enum';
import { DocumentType } from '../../models/enums/document-type.enum';

@Component({
  selector: 'app-employees',// Nombre del selector para utilizar este componente en HTML.
  standalone: true,// Indica que este componente es independiente y no necesita ser declarado en un módulo.
  imports: [CommonModule, ReactiveFormsModule], // Módulos importados necesarios para el funcionamiento del componente.
  templateUrl: './employees.component.html',// Ruta del archivo HTML de la vista del componente.
  styleUrls: ['./employees.component.css'],// Rutas del archivo CSS para el estilo del componente.
  providers: [EmployeesService]// Proveedores del servicio de empleados para este componente.

})
export class EmployeesComponent {

  // Definición del formulario reactivo para manejar los datos de los empleados.
  employeeForm: FormGroup;
  // Lista para almacenar los empleados obtenidos de la API.
  employees: Employee[] = [];
  // Variable para manejar el modo de edición de los empleados.
  isEditMode = false;
  // Variable para almacenar el ID del empleado que se está editando.
  currentEmployeeId: number | null = null;

  // Listas de opciones para los campos del formulario, utilizando los enums.
  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);
  statusTypes = Object.values(StatusType);

  // Inyectamos el FormBuilder para construir el formulario y el servicio de empleados para realizar operaciones CRUD.
  constructor(private fb: FormBuilder, private employeesService: EmployeesService) {
 // Inicializamos el formulario reactivo con sus campos y validaciones.
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employeeType: ['', Validators.required],
      docType: '',
      docNumber: ['', Validators.required],
      hiringDate: ['', Validators.required],
      entryTime: ['', Validators.required],
      exitTime: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      state: ['', Validators.required]
    });
  }
// Este método se ejecuta al iniciar el componente para cargar la lista de empleados.
  ngOnInit(): void {
    this.getEmployees();
  }
// Método para obtener la lista de empleados desde la API.
  getEmployees(): void {
    this.employeesService.getEmployees().subscribe((employees) => {
      this.employees = employees;
    });
  }
 // Método que se ejecuta al enviar el formulario.
  onSubmit(): void {
    if (this.employeeForm.valid) { // Verifica si el formulario es válido.
      if (this.isEditMode) {
        this.updateEmployee(); // Si estamos en modo de edición, actualiza el empleado.
      } else {
        this.addEmployee(); // Si no, agrega un nuevo empleado.
      }
    }
  }

  // Método para agregar un nuevo empleado.
  addEmployee(): void {
    this.employeesService.addEmployee(this.employeeForm.value).subscribe(() => {
      this.getEmployees();// Recarga la lista de empleados.
      this.employeeForm.reset();// Resetea el formulario.
    });
  }

  // Método para actualizar un empleado existente.
  updateEmployee(): void {
    if (this.currentEmployeeId !== null) {// Verifica que haya un empleado seleccionado.
      const updatedEmployee = { ...this.employeeForm.value, id: this.currentEmployeeId };
      this.employeesService.updateEmployee(updatedEmployee).subscribe(() => {
        this.getEmployees(); // Recarga la lista de empleados.
        this.employeeForm.reset(); // Resetea el formulario.
        this.isEditMode = false; // Cambia el modo de edición a falso.
        this.currentEmployeeId = null; // Reinicia el ID del empleado actual.
      });
    }
  }

  // Método para seleccionar un empleado para edición.
  editEmployee(employee: Employee): void {
    this.employeeForm.patchValue(employee); // Llena el formulario con los datos del empleado.
    this.isEditMode = true; // Cambia a modo de edición.
    this.currentEmployeeId = employee.id; // Guarda el ID del empleado que se está editando.
  }

  // Método para eliminar un empleado.
  deleteEmployee(id: number): void {
    this.employeesService.deleteEmployee(id).subscribe(() => {
      this.getEmployees(); // Recarga la lista de empleados después de eliminar.
    });
  }

  // Método para cancelar la edición.
  cancelEdit(): void {
    this.employeeForm.reset(); // Resetea el formulario.
    this.isEditMode = false; // Cambia el modo de edición a falso.
    this.currentEmployeeId = null; // Reinicia el ID del empleado actual.
  }
}
