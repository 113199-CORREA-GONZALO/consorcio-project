import { InventoryComponent } from './components/inventory/inventory_inventories/inventory_inventories.component';
import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { ArticleComponent } from './components/inventory/inventory_article/inventory_article.component';
import { TransactionComponent } from './components/inventory/inventory_transaction/inventory_transaction.component';
import { ProviderListComponent } from './components/provider/provider-list/provider-list.component';
import { ProviderFormComponent } from './components/provider/provider-form/provider-form.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeesComponent },
  { path: 'providers/list', component: ProviderListComponent },
  { path: 'providers/form', component: ProviderFormComponent },
  { path: 'providers/form/:id', component: ProviderFormComponent },
  { path: 'article', component: ArticleComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' }
];
