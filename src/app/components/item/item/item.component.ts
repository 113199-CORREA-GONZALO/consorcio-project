import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../services/inventory.service';
import { Item, ItemCategory, ItemType, ItemStatus, MeasurementUnit,Status } from '../../../models/item.model';
import { ServiceType } from '../../../models/enums/service-tpye.enum';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Agrega ReactiveFormsModule aquí
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {
  itemForm: FormGroup;
  items: Item[] = [];
  isEditing: boolean = false; // Variable para controlar el estado de edición
  currentItemId?: number; // Almacena el ID del ítem actual en edición

  // Propiedades para los enumerados
  ItemType = ItemType; // Asignamos el enum ItemType a una propiedad del componente
  ItemStatus = ItemStatus; // Asignamos el enum ItemStatus a una propiedad del componente
  ItemCategory = ItemCategory; // Asignamos el enum ItemCategory a una propiedad del componente
  MeasurementUnit = MeasurementUnit; // Asignamos el enum MeasurementUnit a una propiedad del componente

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.itemForm = this.fb.group({
      identifier: [''],
      name: ['', Validators.required],
      description: [''],
      location: [''],
      type: [ItemType.NON_REGISTRABLE, Validators.required],
      status: [ItemStatus.FUNCTIONAL, Validators.required],
      category: [ItemCategory.DURABLES, Validators.required],
      measurement_unit: [MeasurementUnit.UNITS, Validators.required],
      item_status: [Status.ACTIVE]
    });
  }

  ngOnInit(): void {
    this.getItems();
  }

  getItems(): void {
    this.inventoryService.getItems().subscribe(items => {
      this.items = items.filter(item => item.item_status === Status.ACTIVE); // Mostrar solo ítems activos
    });
  }

  addItem(): void {
    if (this.itemForm.valid) {
      const newItem = this.itemForm.value;

      if (this.isEditing) {
        this.updateItem(newItem); // Llama a updateItem si estamos editando
      } else {
        this.inventoryService.addItem(newItem).subscribe(() => {
          this.getItems(); // Recargar la lista
          this.resetForm(); // Limpiar el formulario
        });
      }
    }
  }

  editItem(item: Item): void {
    this.isEditing = true; // Cambia el estado a edición
    this.currentItemId = item.id; // Guarda el ID del ítem actual
    this.itemForm.patchValue(item); // Llena el formulario con los datos del ítem a editar
  }

  updateItem(item: Item): void {
    if (this.currentItemId) {
      // Actualiza el ítem con el ID actual
      this.inventoryService.updateItem(this.currentItemId, item).subscribe(() => {
        this.getItems(); // Recarga la lista de ítems
        this.resetForm(); // Resetea el formulario después de actualizar
      });
    }
  }

  deleteItem(item_id: number): void {
    this.inventoryService.deleteItem(item_id).subscribe(() => {
      this.getItems();
    });
  }
  resetForm(): void {
    this.itemForm.reset({
      identifier: '',
      name: '',
      description: '',
      location: '',
      type: ItemType.REGISTRABLE, // Valor por defecto
      status: ItemStatus.FUNCTIONAL, // Valor por defecto
      category: ItemCategory.DURABLES, // Valor por defecto
      measurement_unit: MeasurementUnit.UNITS // Valor por defecto

    });
    this.isEditing = false; // Cambia el estado a no edición
    this.currentItemId = undefined; // Limpia el ID del ítem actual
  }
}