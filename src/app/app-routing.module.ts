import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { ProvidersComponent } from './components/providers/providers.component';
import { InventoryComponent } from './components/inventory/inventory.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeesComponent },
  { path: 'providers', component: ProvidersComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' }
];
