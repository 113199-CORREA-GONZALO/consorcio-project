import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { Inventory } from '../../models/inventory.model';
import { InventoryType } from '../../models/enums/inventory-type.enum';
import { StatusType } from '../../models/enums/status-type.enum';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  providers: [InventoryService]
})
export class InventoryComponent {
  inventoryForm: FormGroup;
  inventoryList: Inventory[] = [];
  isEditMode = false;
  currentInventoryId: number | null = null;

  inventoryTypes = Object.values(InventoryType);
  statusTypes = Object.values(StatusType);

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.inventoryForm = this.fb.group({
      item: ['', Validators.required],
      type: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]],
      details: ['', Validators.required],
      state: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getInventory();
  }

  getInventory(): void {
    this.inventoryService.getInventory().subscribe((inventoryList) => {
      this.inventoryList = inventoryList;
    });
  }

  onSubmit(): void {
    if (this.inventoryForm.valid) {
      if (this.isEditMode) {
        this.updateInventory();
      } else {
        this.addInventory();
      }
    }
  }

  addInventory(): void {
    this.inventoryService.addInventory(this.inventoryForm.value).subscribe(() => {
      this.getInventory();
      this.inventoryForm.reset();
    });
  }

  updateInventory(): void {
    if (this.currentInventoryId !== null) {
      const updatedInventory = { ...this.inventoryForm.value, id: this.currentInventoryId };
      this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
        this.getInventory();
        this.inventoryForm.reset();
        this.isEditMode = false;
        this.currentInventoryId = null;
      });
    }
  }

  editInventory(inventory: Inventory): void {
    this.inventoryForm.patchValue(inventory);
    this.isEditMode = true;
    this.currentInventoryId = inventory.id;
  }

  deleteInventory(id: number): void {
    this.inventoryService.deleteInventory(id).subscribe(() => {
      this.getInventory();
    });
  }

  cancelEdit(): void {
    this.inventoryForm.reset();
    this.isEditMode = false;
    this.currentInventoryId = null;
  }
}

