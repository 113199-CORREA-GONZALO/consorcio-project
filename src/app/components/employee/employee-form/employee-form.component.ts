import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeType } from '../../../models/employee.model';
import { DocumentType } from '../../../models/employee.model';
import { StatusType } from '../../../models/employee.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from '../../../services/employees.service';
import { Employee } from '../../../models/employee.model';
import { debounceTime, map, switchMap } from 'rxjs';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { ToastService } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent implements OnInit {
  employeeForm = new FormGroup({
    id:new FormControl(0),
    firstName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    employeeType: new FormControl(EmployeeType.ADMIN, Validators.required),
    hiringDate: new FormControl(new Date().toISOString().split('T')[0], [Validators.required]), // Default to today
    documentType: new FormControl(DocumentType.DNI, Validators.required),
    docNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9.-]*$/)]),
    salary: new FormControl(0, [Validators.required, Validators.min(0)]),
    state: new FormControl(StatusType.ACTIVE),
  });

  constructor(private toastService: ToastService) {}

  private readonly employeeService = inject(EmployeesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mapperService = inject(MapperService);
  employeeTypes= Object.values(EmployeeType);
  documentTypes= Object.values(DocumentType);
  private currentId = 0;
  isEdit:boolean=false;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const id = +params['id'];
      console.log(id);
      if (id) {
        this.getById(id);
      }
    });
  }

  getById(id: number) {
    this.currentId=id;
    this.employeeService.getEmployee(id).subscribe((data) => {
      data = this.mapperService.toCamelCase(data);
      this.employeeForm.patchValue({
        id:data.id,
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
      let employeeData = this.prepareEmployeeData();
      employeeData = this.mapperService.toSnakeCase(employeeData);
      console.log(employeeData);
      if (this.currentId!=0) {
        employeeData.id=this.currentId;
        this.updateEmployee(employeeData);
      } else {
        employeeData.id
        this.createEmployee(employeeData);
      }
    }
  }

  prepareEmployeeData(): Employee {
    const { id, firstName, lastName, employeeType, hiringDate, documentType, docNumber, salary, state } = this.employeeForm.value;    
    let parsedHiringDate: Date | null = new Date();
    /*if (hiringDate) {
      parsedHiringDate = new Date(hiringDate);
    }*/

    return {
      id,
      firstName,
      lastName,
      employeeType,
      documentType: documentType,
      docNumber,
      hiringDate,
      salary,
      state,
    } as Employee;
  }

  createEmployee(employee: Employee) {
    this.employeeService.addEmployee(employee).subscribe({
      next: (response) => {
        this.toastService.sendSuccess("El Empleado ha sido creado con éxito.");
      },
      error: (error) => {
        this.toastService.sendError("Hubo un error en la creación del empleado.");
      } 
    });
  }

  updateEmployee(employee: Employee) {
    console.log(employee);
    this.employeeService.updateEmployee(employee).subscribe({
      next: (response) => {
        this.toastService.sendSuccess("El Empleado ha sido modificado con éxito.");
      },
      error: (error) => {
        this.toastService.sendError("Hubo un error en la modificación del empleado.");
      }
    });
  }

  return() {
    this.router.navigate(['employees/list']);
  }

  documentExistsValidator(control: AbstractControl) {
    return control.valueChanges.pipe(
      debounceTime(300), // para evitar múltiples llamadas al backend
      switchMap((documentNumber) => 
        this.employeeService.checkIfDocumentExists(documentNumber)
      ),
      map((exists: boolean) => (exists ? { documentExists: true } : null))
    );
}
}