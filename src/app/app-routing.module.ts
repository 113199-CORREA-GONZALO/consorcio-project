import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { ProvidersComponent } from './components/providers/providers.component';
import { ArticleComponent } from './components/inventory/inventory_articles/inventory_articles_form/inventory_articles_form.component'
import { TransactionComponent } from './components/inventory/inventory_transaction/inventory_transaction_form/inventory_transaction_form.component';
import { InventoryComponent } from './components/inventory/inventory_inventories/inventory_inventories.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeesComponent },
  { path: 'providers', component: ProvidersComponent },
  { path: 'article', component: ArticleComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'transaction/:id', component: TransactionComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' }
];
