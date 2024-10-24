import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeType } from '../../../models/employee.model';
import { DocumentType } from '../../../models/employee.model';
import { StatusType } from '../../../models/employee.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from '../../../services/employees.service';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent implements OnInit {
  employeeForm = new FormGroup({
    id: new FormControl(0),
    firstName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    employeeType: new FormControl(EmployeeType.ADMIN, Validators.required),
    hiringDate: new FormControl(new Date().toISOString().split('T')[0], [Validators.required]), // Default to today
    documentType: new FormControl(DocumentType.DNI, Validators.required),
    docNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9.-]*$/)]),
    salary: new FormControl(0, [Validators.required, Validators.min(0)]),
    state: new FormControl(StatusType.ACTIVE),
  });

  private readonly employeeService = inject(EmployeesService);
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly router = inject(Router);
  employeeTypes= Object.values(EmployeeType);
  documentTypes= Object.values(DocumentType);
  isEdit:boolean=false;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.getById(id);
      }
    });
  }

  getById(id: number) {
    this.employeeService.getEmployee(id).subscribe((data) => {
      this.employeeForm.patchValue({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        employeeType: data.employeeType,
        hiringDate: new Date(data.hiringDate).toISOString().split('T')[0], // Format for input
        documentType: data.documentType,
        docNumber: data.docNumber,
        state: StatusType.ACTIVE,
        salary: data.salary,
      });
    });
    this.isEdit=true;
  }

  saveEmployee() {
    if (this.employeeForm.valid) {
      const employeeData = this.prepareEmployeeData();
      if (this.employeeForm.value.id) {
        this.updateEmployee(employeeData);
      } else {
        this.createEmployee(employeeData);
      }
    }
  }

  prepareEmployeeData(): Employee {
    const { id, firstName, lastName, employeeType, hiringDate, documentType, docNumber, salary, state } = this.employeeForm.value;    
    
    let parsedHiringDate: Date | null = null;
    if (hiringDate) {
      parsedHiringDate = new Date(hiringDate);
    }

    return {
      id,
      firstName,
      lastName,
      employeeType,
      documentType: documentType,
      docNumber,
      hiringDate: parsedHiringDate,
      salary,
      state,
    } as Employee;
  }

  createEmployee(employee: Employee) {
    this.employeeService.addEmployee(employee).subscribe((data) => {
      console.log(data);
      // Navigate or show success message
    });
  }

  updateEmployee(employee: Employee) {
    console.log(employee);
    this.employeeService.updateEmployee(employee).subscribe((data) => {
      console.log(data);
      // Navigate or show success message
    });
  }

  return() {
    this.router.navigate(['employees/list']);
  }
}
