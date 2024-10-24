import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { ProvidersComponent } from './components/providers/providers.component';
import { ArticleComponent } from './components/inventory/inventory-articles/inventory-articles-form/inventory-articles-form.component'
import { TransactionComponent } from './components/inventory/inventory_transactions/inventory_transaction.component';
import { InventoryComponent } from './components/inventory/inventory-inventories/inventory-inventories.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeesComponent },
  { path: 'providers', component: ProvidersComponent },
  { path: 'article', component: ArticleComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'transaction/:id', component: TransactionComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' }
];
