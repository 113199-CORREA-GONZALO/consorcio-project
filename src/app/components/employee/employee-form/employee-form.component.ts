import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee, EmployeeType, ShiftType, StatusType } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit{
  employeeForm: FormGroup;
  isEditMode = false;
  currentEmployeeId: number | null = null;

  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);
  statusTypes = Object.values(StatusType);
  shiftTypes = Object.values(ShiftType);

  private employeeService = inject(EmployeesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  constructor(){
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employeeType: ['', Validators.required],
      docType: ['', Validators.required],
      docNumber: ['', Validators.required],
      hiringDate: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      state: ['', Validators.required],
      shifts: this.fb.group({
        shifts: [[], Validators.required],
        shiftType: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.currentEmployeeId = +params['id'];
        this.loadEmployeeData(this.currentEmployeeId);
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formData = this.prepareFormData();
      
      if (this.isEditMode) {
        this.updateEmployee(formData);
      } else {
        this.addEmployee(formData);
      }
    } else {
      this.markFormGroupTouched(this.employeeForm);
    }
  }

  private prepareFormData(): Employee {
    const formValue = this.employeeForm.value;
    const shiftsValue = formValue.shifts.shifts;
    
    // Convertir el string de turnos a array si es necesario
    const shiftsArray = typeof shiftsValue === 'string' 
      ? shiftsValue.split(',').map(s => s.trim()).filter(s => s !== '')
      : shiftsValue;

    return {
      id: this.currentEmployeeId || 0,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      employeeType: formValue.employeeType,
      docType: formValue.docType,
      docNumber: formValue.docNumber,
      hiringDate: formValue.hiringDate,
      salary: formValue.salary,
      state: formValue.state,
      shifts: {
        shifts: shiftsArray,
        shiftType: formValue.shifts.shiftType
      }
    };
  }

  addEmployee(employee: Employee): void {
    this.employeeService.addEmployee(employee).subscribe({
      next: () => {
        Swal.fire({
          title: 'Empleado Agregado',
          text: 'El empleado ha sido agregado con éxito',
          icon: 'success',
          timer: 2000,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.router.navigate(['employees/list']);
      },
      error: (error) => {
        console.error('Error adding employee', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo agregar el empleado',
          icon: 'error',
        });
      }
    });
  }

  updateEmployee(employee: Employee): void {
    this.employeeService.updateEmployee(employee).subscribe({
      next: () => {
        Swal.fire({
          title: 'Empleado actualizado!',
          text: 'El empleado ha sido actualizado.',
          icon: 'success',
          timer: 2000,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.router.navigate(['employees/list']);
      },
      error: (error) => {
        console.error('Error updating employee', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar la información del empleado',
          icon: 'error',
        });
      }
    });
  }

  resetForm() {
    this.employeeForm.reset();
    this.isEditMode = false;
    this.currentEmployeeId = null;
    this.router.navigate(['employees/list']);
  }

  loadEmployeeData(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee: Employee) => {
        // Convertir el array de shifts a string para el input
        const shiftsString = employee.shifts.shifts.join(', ');
        
        this.employeeForm.patchValue({
          ...employee,
          shifts: {
            shifts: shiftsString,
            shiftType: employee.shifts.shiftType
          }
        });
      },
      error: (error) => {
        console.error('Error loading employee data', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la información del empleado',
          icon: 'error',
        });
        this.router.navigate(['employees/list']);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
