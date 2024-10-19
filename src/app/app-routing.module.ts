import { InventoryComponent } from './components/inventory/inventory_inventories/inventory_inventories.component';
import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { ProvidersComponent } from './components/providers/providers.component';
import { ArticleComponent } from './components/inventory/inventory-article/inventory-article-form/inventory-article-form.component';
import { TransactionComponent } from './components/inventory/inventory_transaction/inventory_transaction.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeesComponent },
  { path: 'providers', component: ProvidersComponent },
  { path: 'article', component: ArticleComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' }
];
