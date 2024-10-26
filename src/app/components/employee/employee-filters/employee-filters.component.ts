import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeType } from '../../../models/employee.model';
import { StatusType } from '../../../models/inventory.model';

@Component({
  selector: 'app-employee-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employee-filters.component.html',
  styleUrl: './employee-filters.component.css'
})
export class EmployeeFiltersComponent {
  filterForm: FormGroup;
  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);
  statusTypes = Object.values(StatusType);
  showFilters: boolean = false;

  constructor(private fb: FormBuilder) {
      this.filterForm = this.fb.group({
          firstName: [''],
          lastName: [''],
          employeeType: [''],
          documentTypes: [''],
          docNumber: [''],
          hiringDate: [''],
          state: [''],
          salary: ['']
      });
  }

  toggleFilters() {
      this.showFilters = !this.showFilters;
  }
}
