import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Inventory, StatusType } from '../../../models/inventory.model';
import { Article, MeasurementUnit, Status } from '../../../models/article.model';
import { InventoryService } from '../../../services/inventory.service';
import { ArticleFormComponent } from '../inventory_articles/inventory_articles_form/inventory_articles_form.component';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ArticleFormComponent, RouterModule],
  templateUrl: './inventory_inventories.component.html',
  styleUrls: ['./inventory_inventories.component.css']
})
export class InventoryTableComponent implements OnInit {

  private mapperService = inject(MapperService);

  showRegisterForm: boolean = false;
  inventoryForm: FormGroup;
  inventories: Inventory[] = [];
  articles: Article[] = [];
  activeArticles: Article[] = []; // Solo los ítems activos
  articleMap: { [key: number]: string } = {}; // Mapa para almacenar nombre de ítems con sus IDs
  isEditing: boolean = false;
  editingInventoryId: any | null = null; // Para guardar el ID del inventario en edición



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
    // this.getArticles();
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
    this.isEditing = true; // Activar el modo edición
    this.editingInventoryId = inventory.id; // Guardar el ID del inventario en edición
    this.inventoryForm.patchValue({
      article_id: inventory.article_id,
      stock: inventory.stock,
      min_stock: inventory.min_stock,
      inventory_status: inventory.inventory_status
    });
  }


  updateInventory(): void {
    if (this.inventoryForm.valid) {
      const updatedInventory = this.inventoryForm.value;
      this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
        this.getInventories();
        this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
      });
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
        this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
          this.getInventories(); // Recargar la lista después de actualizar
          this.resetForm(); // Resetear el formulario después de editar
        });
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

}
