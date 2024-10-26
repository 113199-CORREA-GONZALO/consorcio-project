import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Inventory, StatusType } from '../../../models/inventory.model';
import { Article, ArticleCategory, ArticleCondition, ArticleType, MeasurementUnit, Status } from '../../../models/article.model';
import { InventoryService } from '../../../services/inventory.service';
import { ArticleFormComponent } from '../inventory_articles/inventory_articles_form/inventory_articles_form.component';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

//exportar a pdf y excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ArticleFormComponent, RouterModule],
  templateUrl: './inventory_inventories.component.html',
  styleUrls: ['./inventory_inventories.component.css']
})
export class InventoryTableComponent implements OnInit {
  @ViewChild('inventoryTable') inventoryTable: ElementRef | undefined;

  private mapperService = inject(MapperService);

  showRegisterForm: boolean = false;
  inventoryForm: FormGroup;
  inventories: Inventory[] = [];
  articles: Article[] = [];
  activeArticles: Article[] = []; // Solo los ítems activos
  articleMap: { [key: number]: string } = {}; // Mapa para almacenar nombre de ítems con sus IDs
  isEditing: boolean = false;
  editingInventoryId: any | null = null; // Para guardar el ID del inventario en edición
  filteredInventories: Inventory[] = [];
  isLoading = false;

  // Filtros individuales para búsqueda en tiempo real
  articleNameFilter = new FormControl('');
  stockFilter = new FormControl('');
  minStockFilter = new FormControl('');
  locationFilter = new FormControl('');

  // Formulario para filtros que requieren llamada al servidor
  filterForm: FormGroup;
  readonly MeasurementUnit = MeasurementUnit;

  measurementUnits: MeasurementUnit[] = [MeasurementUnit.LITERS, MeasurementUnit.KILOS, MeasurementUnit.UNITS];

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.inventoryForm = this.fb.group({
      article_id: ['', Validators.required],
      stock: [1, Validators.required], // Stock inicial es 1
      min_stock: [1],
      inventory_status: [StatusType.ACTIVE]
    });
    this.filterForm = this.fb.group({
      measure: [this.measurementUnits[2]],
    });

  }

  ngOnInit(): void {
    this.getInventories();
    //this.getInventoriesUnit('UNITS');
    
    this.setupFilterSubscriptions();
    
  }
//   getInventoriesUnit(measure: string): void {
//     this.inventoryService.getInventoriesUnit(measure).subscribe((inventories: Inventory[]) => {
//       this.inventories = inventories;
//     });
// }

  private setupFilterSubscriptions(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        console.log('Aplicando filtros...', this.filterForm.value);
        this.applyAllFilters();
      });
    });
  }

   applyAllFilters(): void {
    const filters = {
      measure: this.filterForm.get('measure')?.value
    }

    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof typeof filters]) {
        delete filters[key as keyof typeof filters];
      }
    });

    this.inventoryService.getInventoriesUnit(filters.measure).subscribe((inventories: Inventory[]) => {
      this.inventories = inventories.map( inventory => ({
        ...this.mapperService.toCamelCase(inventory),
      }));
      this.inventories.forEach(inventory => {
        inventories.map(inventory.article = this.mapperService.toCamelCase(inventory.article));
      });
      this.inventories = inventories;
      this.filteredInventories = inventories;
      this.isLoading = false;
      console.log('CHANCHA FILTRADA', this.inventories);
    });
  }

  clearFilters(): void {
    this.articleNameFilter.reset();
    this.stockFilter.reset();
    this.getInventories(); // Recargar todos los inventarios
  }

  getInventories(): void {
    this.isLoading = true;
    this.articleNameFilter.valueChanges.subscribe( data => {
      if(data === null || data === ''){
        this.getInventories();
      }
      this.inventories = this.inventories.filter(
        x => x.article.name.toLowerCase().includes(data!.toLowerCase())
      )
    })
    this.stockFilter.valueChanges.subscribe( data => {
      if(data === null || data === ''){
        this.getInventories();
      }
      this.inventories = this.inventories.filter(
        x => x.stock.toString().toLowerCase().includes(data!.toLowerCase())
      )
    })
    // this.inventoryService.getInventories().subscribe((inventories: Inventory[]) => {
    //   this.inventories = inventories.map(inventory => ({
    //     ...this.mapperService.toCamelCase(inventory), // Convertir todo el inventario a camelCase
    //     article: this.mapperService.toCamelCase(inventory.article) // Convertir el artículo a camelCase
    //     //transactions: inventory.transactions.map(transaction => this.mapperService.toCamelCase(transaction)) // Convertir las transacciones a camelCase
    //   }));
    this.inventoryService.getInventories().subscribe((inventories: Inventory[]) => {
      this.inventories = inventories.map( inventory => ({
        ...this.mapperService.toCamelCase(inventory),
      }));
      this.inventories.forEach(inventory => {
        inventories.map(inventory.article = this.mapperService.toCamelCase(inventory.article));
      });
      this.inventories = inventories;
      this.filteredInventories = inventories;
      this.isLoading = false;
      console.log('CHANCHA', this.inventories);
    });      

      console.log(this.inventories); // Para verificar que la conversión se realizó correctamente
    };
  

 // Método para convertir la unidad de medida a una representación amigable
getDisplayUnit(unit: MeasurementUnit): string {
  console.log('Santoro Killer:', unit);
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



exportToPDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const title = 'Listado de Inventario';
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

  const tableColumn = ['Identificador','Artículo', 'Descripcion','Stock','Medida', 'Stock Mínimo', 'Ubicación'];
  const tableRows: any[][] = [];
  
  this.inventories.forEach(inventory => {
    const inventoryData = [
      inventory.article.identifier,
      inventory.article.name,
      inventory.article.description,
      inventory.stock,
      this.getDisplayUnit(inventory.article.measurementUnit),
      inventory.minStock,
      inventory.location
    ];
    tableRows.push(inventoryData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
  });

  doc.save('inventario.pdf');
}

exportToExcel(): void {
  try{
    let element = document.getElementById('inventoryTable');
    if(!element){
      console.warn('No se encontró el elemento con el ID "inventoryTable"');
      element = this.createTableFromData();
    }
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, 'inventario.xlsx');
  } catch( error ){
    console.error('Error al exportar a Excel:', error);
  }
}

private createTableFromData(): HTMLTableElement {
  const table = document.createElement('table');
  const thead = table.createTHead();
  const tbody = table.createTBody();

  const headerRow = thead.insertRow();
  const headers = ['Identificador','Artículo', 'Descripcion','Stock','Medida', 'Stock Mínimo', 'Ubicación'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });

  this.inventories.forEach(inventory => {
    const unid = this.getDisplayUnit(inventory.article.measurementUnit);
    const row = tbody.insertRow();
    [inventory.article.identifier, inventory.article.name, inventory.article.description, inventory.stock, unid, inventory.minStock, inventory.location].forEach(text => {
      const cell = row.insertCell();
      cell.textContent = text !== undefined && text !== null ? text.toString() : null;
    });
  });

  return table;
}
}
