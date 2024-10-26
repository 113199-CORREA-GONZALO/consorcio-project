import { InventoryService } from './../../../../services/inventory.service';
import { Component, inject } from '@angular/core';
import { Inventory, Transaction, TransactionType } from '../../../../models/inventory.model';
import { Article } from '../../../../models/article.model';
import { CommonModule } from '@angular/common';
import { MapperService } from '../../../../services/MapperCamelToSnake/mapper.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inventory-transaction-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory_transaction_table.component.html',
  styleUrl: './inventory_transaction_table.component.css'
})
export class InventoryTransactionTableComponent {
  private mapperService = inject(MapperService);
  private inventoryService = inject(InventoryService);

  constructor(private route: ActivatedRoute) {}

  transactions: Transaction[] = [];
  inventories: Inventory[] = [];
  isEditing: boolean = false;
  editingTransactionId: number = 0;
  selectedTransactionType: TransactionType = TransactionType.ENTRY;
  articleMap: { [key: number]: Article } = {};
  inventoryMap: { [key: number]: Inventory } = {};
  inventoryId: string | undefined;
  articles: Article[] = [];

  ngOnInit(): void {
    // Suscríbete a los cambios de parámetros
    this.route.paramMap.subscribe(params => {
      const id = params.get('inventoryId');
      if (id) {
        this.inventoryId = id;
        this.loadTransactions(id);
      } else {
        console.error('Invalid inventory ID');
      }
    });
  }

  loadTransactions(inventoryId: string): void {
    this.inventoryService.getTransactionsInventory(inventoryId.toString()).subscribe({
      next: (transactions) => {
        this.transactions = transactions.map(transaction => this.mapperService.toCamelCase(transaction));
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
      }
    });
  }

  getTransactionTypeLabel(type: TransactionType): string {
    switch(type) {
      case TransactionType.ENTRY:
        return 'Entrada';
      case TransactionType.OUTPUT:
        return 'Salida';
      default:
        return 'Desconocido';
    }
  }
deleteTransaction(arg0: any) {
throw new Error('Method not implemented.');
}
editTransaction(_t12: any) {
throw new Error('Method not implemented.');
}

}
