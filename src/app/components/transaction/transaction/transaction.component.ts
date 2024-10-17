import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';
import { Transaction, TransactionType, Inventory } from '../../../models/inventory.model';
import { CommonModule } from '@angular/common';
import { Item } from '../../../models/item.model';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  transactionForm: FormGroup;
  transactions: Transaction[] = [];
  inventories: Inventory[] = [];
  isEditing: boolean = false;
  editingTransactionId: number= 0;
  selectedTransactionType: TransactionType = TransactionType.ENTRY; // Para el control de tipo de transacción
  itemMap: { [key: number]: Item } = {}; // Mapa para almacenar ítems con sus IDs
  inventoryMap: { [key: number]: Inventory } = {}; // Mapa para almacenar inventarios
  items: Item[] = []; 

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.transactionForm = this.fb.group({
      transactionType: [TransactionType.ENTRY, Validators.required],
      inventory_id: ['', Validators.required],
      quantity: [0, Validators.required],
      price: [0], // Solo para ingreso
      location: ['', Validators.required],
      transaction_date: [{ value: new Date().toISOString().split('T')[0], disabled: true }] // Fecha autogenerada
    });
  }

  ngOnInit(): void {
    this.getInventories();
    this.getTransactions();
    this.transactionForm.get('transactionType')?.valueChanges.subscribe(value => {
      this.selectedTransactionType = value;
      this.toggleFieldsByTransactionType(value);
    });
    this.getItems();
    this.getInventories()
    console.log('Mapa de ítems:', this.itemMap);
    console.log('Mapa de inventarios:', this.inventoryMap);
  }
  getItems(): void {
    this.inventoryService.getItems().subscribe(items => {
      this.items = items;
      this.buildItemMap(); // Construir el mapa de ítems
    });
  }
  
  buildItemMap(): void {
    this.items.forEach(item => {
      if (item && item.id !== undefined) {
        this.itemMap[item.id] = item; // Mapea el ID del ítem al objeto ítem
      }
    });
    console.log('Mapa de ítems:', this.itemMap); // Verificar si el mapa de ítems se construye bien

  }
  buildInventoryMap(): void {
    this.inventoryMap = {}; // Reiniciar el mapa antes de construirlo
    this.inventories.forEach(inventory => {
      if (inventory && inventory.id !== undefined && inventory.id !== null) {
        this.inventoryMap[inventory.id] = inventory;
      }
    });
    console.log('Mapa de inventarios construido:', this.inventoryMap); // Verificar el contenido del mapa
  }
  
  

  toggleFieldsByTransactionType(type: TransactionType): void {
    const priceControl = this.transactionForm.get('price');
    if (type === TransactionType.ENTRY) {
      priceControl?.setValidators([Validators.required]);
      priceControl?.enable();
    } else {
      priceControl?.clearValidators();
      priceControl?.disable();
    }
    priceControl?.updateValueAndValidity();
  }

  getInventories(): void {
    this.inventoryService.getInventories().subscribe(inventories => {
      this.inventories = inventories.filter(inventory => inventory.inventory_status == "Active");
      this.buildInventoryMap(); // Construimos el mapa después de cargar los inventarios
      console.log('Inventarios cargados:', this.inventories); // Verificar los inventarios cargados
    });
  }
  
  getTransactions(): void {
    this.inventoryService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
    });
    console.log('Transacciones cargadas:', this.transactions); // Verificar si las transacciones tienen el inventory_id correcto

  }

  // addTransaction(): void {
  //   if (this.transactionForm.valid) {
  //     const transactionData = this.transactionForm.value;

  //     const newTransaction: Transaction = {
  //       id: transactionData.id,
  //       quantity: transactionData.quantity,
  //       price: transactionData.price,
  //       //location: transactionData.location, // de momento no la utilizaremos ya que apunta a la ubicacion del item, no deberia poder modificarse.
  //       transaction_date: new Date().toISOString(),
  //       transaction_type: this.selectedTransactionType
  //     };

  //     if (this.isEditing && this.editingTransactionId) {
  //       this.inventoryService.updateTransaction(this.editingTransactionId, newTransaction).subscribe(() => {
  //         this.getTransactions();
  //         this.resetForm();
  //       });
  //     } else {
  //       this.inventoryService.addTransaction(newTransaction).subscribe(() => {
  //         this.getTransactions();
  //         this.resetForm();
  //       });
  //     }
  //   }
  // }

  // addTransaction(): void {
  //   if (this.transactionForm.valid) {
  //     const formValues = this.transactionForm.value;
  
  //     // Crear la transacción con inventory_id y los demás valores
  //     const newTransaction: Transaction = {
  //       inventory_id: formValues.inventory_id, // Aquí asignamos el inventory_id
  //       quantity: formValues.quantity,
  //       price: formValues.price,
  //       transaction_type: formValues.transactionType, // Asignamos el tipo de transacción
  //       transaction_date: new Date().toISOString() // Fecha actual, manejada automáticamente
  //     };
  
  //     // Enviar la transacción al servidor
  //     this.inventoryService.addTransaction(newTransaction).subscribe(() => {
  //       this.getTransactions(); // Recargar la lista de transacciones
  //       this.resetForm(); // Resetea el formulario después de agregar
  //     });
  //   }
  // }
  addTransaction(): void {
    if (this.transactionForm.valid) {
      const formValues = this.transactionForm.value;
  
      // Crear la transacción con inventory_id y los demás valores
      const newTransaction: Transaction = {
        inventory_id: formValues.inventory_id,
        quantity: formValues.quantity,
        price: formValues.price,
        transaction_type: formValues.transactionType,
        transaction_date: new Date().toISOString() // Fecha actual, manejada automáticamente
      };
  
      // Buscar el inventario relacionado con el ID seleccionado
      const selectedInventory = this.inventories.find(inv => inv.id == formValues.inventory_id);
  
      if (selectedInventory) {
        let newStock = selectedInventory.stock;
  
        // Dependiendo del tipo de transacción, modificamos el stock
        if (newTransaction.transaction_type === 'ENTRY') {
          newStock += newTransaction.quantity; // Incrementar el stock
        } else if (newTransaction.transaction_type === 'OUTPUT') {
          if (newStock >= newTransaction.quantity) {
            newStock -= newTransaction.quantity; // Decrementar el stock solo si hay suficiente
          } else {
            alert('No hay suficiente stock disponible');
            return; // Evitar continuar si no hay suficiente stock
          }
        }
  
        // Solo actualizar el inventario si el stock cambia
        if (newStock !== selectedInventory.stock) {
          // Actualizar el inventario con el nuevo stock
          const updatedInventory = { ...selectedInventory, stock: newStock };
          
          this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
            // Después de actualizar el inventario, agregar la transacción
            this.inventoryService.addTransaction(newTransaction).subscribe(() => {
              this.getTransactions(); // Recargar la lista de transacciones
              this.resetForm(); // Resetea el formulario después de agregar
            });
          });
        } else {
          // Si no hay cambio en el stock, solo agregar la transacción
          this.inventoryService.addTransaction(newTransaction).subscribe(() => {
            this.getTransactions(); // Recargar la lista de transacciones
            this.resetForm(); // Resetea el formulario después de agregar
          });
        }
      }
    }
  }
  

  
  updateTransaction(): void {
    if (this.transactionForm.valid && this.editingTransactionId) {
      const formValues = this.transactionForm.value;
  
      // Crear el objeto actualizado de la transacción
      const updatedTransaction: Transaction = {
        id: this.editingTransactionId, // Mantén el ID de la transacción
        inventory_id: formValues.inventory_id,
        quantity: formValues.quantity,
        price: formValues.price,
        transaction_type: formValues.transaction_type, // Asegúrate de capturar correctamente el tipo de transacción
        transaction_date: new Date().toISOString() // Si quieres mantener la fecha actualizada
      };
  
      // Enviar la actualización al servidor
      this.inventoryService.updateTransaction(this.editingTransactionId, updatedTransaction).subscribe(() => {
        this.getTransactions(); // Recargar las transacciones
        this.resetForm(); // Resetea el formulario después de la edición
      });
    }
  }
  
  
  
  editTransaction(transaction: Transaction): void {
    this.isEditing = true;
   // this.editingTransactionId = transaction.id;
    this.transactionForm.patchValue(transaction);
    this.toggleFieldsByTransactionType(transaction.transaction_type);
  }

  deleteTransaction(transaction_id: number): void {
    this.inventoryService.deleteTransaction(transaction_id).subscribe(() => {
      this.getTransactions();
    });
  }

  resetForm(): void {
    this.transactionForm.reset({
      transactionType: '',
      inventory_id: '',
      quantity: 0,
      price: 0,
      location: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    this.isEditing = false;
  //  this.editingTransactionId = null;
  }
}
