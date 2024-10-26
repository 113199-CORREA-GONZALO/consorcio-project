import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleFormComponent } from '../inventory_articles/inventory_articles_form/inventory_articles_form.component';
import { Router, RouterModule } from '@angular/router';
import { TransactionComponentForm } from '../inventory_transaction/inventory_transaction_form/inventory_transaction_form.component';
import { InventoryTransactionTableComponent } from '../inventory_transaction/inventory_transaction_table/inventory_transaction_table.component';
import { InventoryInventoriesUpdateComponent } from './inventory-inventories-update/inventory-inventories-update.component';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { Inventory, StatusType } from '../../../models/inventory.model';
import { Article, ArticleCategory, ArticleCondition, ArticleType, MeasurementUnit, Status } from '../../../models/article.model';
import { InventoryService } from '../../../services/inventory.service';
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule,
     ReactiveFormsModule,
      ArticleFormComponent,
       RouterModule,
        TransactionComponentForm,
         InventoryTransactionTableComponent,
          InventoryInventoriesUpdateComponent,
          FormsModule
        ],
  templateUrl: './inventory_inventories.component.html',
  styleUrls: ['./inventory_inventories.component.css']
})
export class InventoryTableComponent implements OnInit {
  private router = inject(Router);
  private mapperService = inject(MapperService);

  // Modals
  showRegisterForm: boolean = false;
  showRegisterTransactionForm: boolean = false;
  showTransactions: boolean = false;
  showInventoryUpdate: boolean = false;

  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;

  inventoryForm: FormGroup;
  inventories: Inventory[] = [

  ];
  articles: Article[] = [ 
    {
      id: 100,
      identifier: '1234',
      name: 'Producto 1',
      description: 'Descripción del producto 1',
      articleCondition: ArticleCondition.FUNCTIONAL,
      articleCategory: ArticleCategory.DURABLES,
      articleType: ArticleType.REGISTRABLE,
      measurementUnit: MeasurementUnit.UNITS
    }
  ];
  activeArticles: Article[] = []; // Solo los ítems activos
  articleMap: { [key: number]: string } = {}; // Mapa para almacenar nombre de ítems con sus IDs
  isEditing: boolean = false;
  editingInventoryId: any | null = null; // Para guardar el ID del inventario en edición

  selectedInventoryId: string | null = null;
  selectedInventory: Inventory | null = null;


  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.inventoryForm = this.fb.group({
      article_id: ['', Validators.required],
      stock: [1, Validators.required], // Stock inicial es 1
      min_stock: [1],
      inventory_status: [StatusType.ACTIVE]
    });
  }

  ngOnInit(): void {
    this.getInventories();
  }

  getInventories(): void {
    this.inventoryService.getInventories().subscribe((inventories: any[]) => {
      this.inventories = inventories.map(inventory => ({
        ...this.mapperService.toCamelCase(inventory), // Convertir todo el inventario a camelCase
        article: this.mapperService.toCamelCase(inventory.article) // Convertir el artículo a camelCase
        //transactions: inventory.transactions.map(transaction => this.mapperService.toCamelCase(transaction)) // Convertir las transacciones a camelCase
      }));

      console.log(this.inventories); // Para verificar que la conversión se realizó correctamente
    });
  }

 // Método para convertir la unidad de medida a una representación amigable
getDisplayUnit(unit: MeasurementUnit): string {
  switch (unit) {
      case MeasurementUnit.LITERS:
          return 'Lts.';
      case MeasurementUnit.KILOS:
          return 'Kg.';
      case MeasurementUnit.UNITS:
          return 'Ud.';
      default:
          return unit; // Retorna el valor original si no coincide
  }
}



  buildArticleMap(): void {
    this.articles.forEach(article => {
      // Verificar que el ID y el nombre no sean undefined o nulos
      if (article && article.id !== undefined && article.id !== null && article.name) {
        this.articleMap[article.id] = article.name;
      } else {
        console.warn('Article inválido encontrado:', article);
      }
    });
  }

  // Método para obtener los ítems y filtrar solo los activos

  getArticles(): void {
    this.inventoryService.getArticles().subscribe((articles: Article[]) => {
      this.articles = articles;
      this.activeArticles = this.articles;//.filter(article => article.article_status === Status.ACTIVE); // Usar ArticleStatus.FUNCTIONAL
      this.buildArticleMap();
    });
  }

  addInventory(): void {
    if (this.inventoryForm.valid) {
      const newInventory = this.inventoryForm.value;
      this.inventoryService.addInventory(newInventory).subscribe(() => {
        this.getInventories();
        this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
      });
    }
  }

  editInventory(inventory: Inventory): void {
    console.log(inventory.id);
    this.router.navigate(['articles/article', inventory.id]);
    /*this.isEditing = true; // Activar el modo edición
    this.editingInventoryId = inventory.id; // Guardar el ID del inventario en edición
    this.inventoryForm.patchValue({
      article_id: inventory.article_id,
      stock: inventory.stock,
      min_stock: inventory.min_stock,
      inventory_status: inventory.inventory_status
    });*/
  }


  updateInventory(): void {
    if (this.inventoryForm.valid) {
      const updatedInventory = this.inventoryForm.value;
      /*this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
        this.getInventories();
        this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
      });*/
    }
  }

  deleteInventory(id: number): void {
    this.inventoryService.deleteInventory(id).subscribe(() => {
      this.getInventories();
    });
  }
  resetForm(): void {
    this.isEditing = false; // Desactivar el modo edición
    this.editingInventoryId = null; // Limpiar el ID del inventario en edición
    this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: 'Active' });
  }

  saveInventory(): void {
    if (this.inventoryForm.valid) {
      const inventoryData = this.inventoryForm.value;

      if (this.isEditing && this.editingInventoryId) {
        // Editar inventario existente
        const updatedInventory: Inventory = {
          ...inventoryData,
          id: this.editingInventoryId
        };
        /*this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
          this.getInventories(); // Recargar la lista después de actualizar
          this.resetForm(); // Resetear el formulario después de editar
        });*/
      } else {
        // Agregar nuevo inventario
        this.inventoryService.addInventory(inventoryData).subscribe(() => {
          this.getInventories(); // Recargar la lista después de agregar
          this.resetForm(); // Resetear el formulario después de agregar
        });
      }
    }
  }

  onNewArticle(){
    this.showRegisterForm = !this.showRegisterForm;
  }
  onRegisterClose(){
    this.showRegisterForm = this.showRegisterForm;
}

onNewTransaction(id:any){
  this.selectedInventoryId = id;
  this.showRegisterTransactionForm = !this.showRegisterTransactionForm;
}
onTransactions(id:any){
  this.selectedInventoryId = id;
  this.showTransactions = !this.showTransactions;
}
onInventoryUpdate(inventory: Inventory){
  this.selectedInventory = inventory;
  this.showInventoryUpdate = !this.showInventoryUpdate;
}

onRegisterTransactionClose(){
  this.showRegisterTransactionForm = this.showRegisterTransactionForm;
  this.selectedInventoryId = "";
}
onTransactionsClose(){
  this.showTransactions = this.showTransactions;
  this.selectedInventoryId = "";
}
onInventoryUpdateClose() {
  this.showInventoryUpdate = false;
  this.selectedInventory = null;
  this.getInventories();
}
goToNextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    // Actualizar lista de empleados
  }
}

goToPreviousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    // Actualizar lista de empleados
  }
}
}
