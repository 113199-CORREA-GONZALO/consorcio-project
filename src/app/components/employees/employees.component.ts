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
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
  providers: [
    EmployeesService
  ]
})
export class EmployeesComponent {
  employeeForm: FormGroup;
  employees: Employee[] = [];
  isEditMode = false;
  currentEmployeeId: number | null = null;

  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);
  statusTypes = Object.values(StatusType);

  constructor(private fb: FormBuilder, private employeesService: EmployeesService) {
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
