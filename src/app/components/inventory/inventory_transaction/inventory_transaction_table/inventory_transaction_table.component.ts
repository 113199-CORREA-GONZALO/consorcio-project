import { Component } from '@angular/core';
import { Inventory, Transaction, TransactionType } from '../../../../models/inventory.model';
import { Article } from '../../../../models/article.model';

@Component({
  selector: 'app-inventory-transaction-table',
  standalone: true,
  imports: [],
  templateUrl: './inventory_transaction_table.component.html',
  styleUrl: './inventory_transaction_table.component.css'
})
export class InventoryTransactionTableComponent {
deleteTransaction(arg0: any) {
throw new Error('Method not implemented.');
}
editTransaction(_t12: any) {
throw new Error('Method not implemented.');
}

  transactions: Transaction[] = [];
  inventories: Inventory[] = [];
  isEditing: boolean = false;
  editingTransactionId: number= 0;
  selectedTransactionType: TransactionType = TransactionType.ENTRY; // Para el control de tipo de transacción
  articleMap: { [key: number]: Article } = {}; // Mapa para almacenar ítems con sus IDs
  inventoryMap: { [key: number]: Inventory } = {}; // Mapa para almacenar inventarios
  articles: Article[] = [];
}
