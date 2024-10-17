import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeesService } from '../../services/employees.service';
import { Employee, ShiftType } from '../../models/employee.model';
import { EmployeeType, StatusType, DocumentType } from '../../models/employee.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employeeForm: FormGroup;
  employees: Employee[] = [];
  isEditMode = false;
  currentEmployeeId: number | null = null;

  // Opciones para los select
  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);
  statusTypes = Object.values(StatusType);
  shiftTypes = Object.values(ShiftType);

  constructor(private fb: FormBuilder, private employeesService: EmployeesService) {
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
        shifts: ['', Validators.required],
        shiftType: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    this.employeesService.getEmployees().subscribe((employees) => {
      this.employees = employees;
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      if (this.isEditMode) {
        this.updateEmployee();
      } else {
        this.addEmployee();
      }
    }
  }

  addEmployee(): void {
    this.employeesService.addEmployee(this.employeeForm.value).subscribe(() => {
      this.getEmployees();
      this.employeeForm.reset();
    });
  }

  updateEmployee(): void {
    if (this.currentEmployeeId !== null) {
      const updatedEmployee = { ...this.employeeForm.value, id: this.currentEmployeeId };
      this.employeesService.updateEmployee(updatedEmployee).subscribe(() => {
        this.getEmployees();
        this.employeeForm.reset();
        this.isEditMode = false;
        this.currentEmployeeId = null;
      });
    }
  }

  editEmployee(employee: Employee): void {
    this.employeeForm.patchValue(employee);
    this.isEditMode = true;
    this.currentEmployeeId = employee.id;
  }

  deleteEmployee(id: number): void {
    this.employeesService.deleteEmployee(id).subscribe(() => {
      this.getEmployees();
    });
  }

  cancelEdit(): void {
    this.employeeForm.reset();
    this.isEditMode = false;
    this.currentEmployeeId = null;
  }
}
