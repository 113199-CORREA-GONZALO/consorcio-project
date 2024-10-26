import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { EmployeeToastComponent } from "./components/employee/employee-toast/employee-toast.component";
import { EmployeeFiltersComponent } from "./components/employee/employee-filters/employee-filters.component";
import { EmployeeModalRegisterComponent } from "./components/employee/employee-modal-register/employee-modal-register.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, NgbDropdownModule, NgbCollapseModule, CommonModule, EmployeeToastComponent, EmployeeFiltersComponent, EmployeeModalRegisterComponent]
})
export class AppComponent {
  title = 'consorcio-management';
  isMenuCollapsed = true;
}