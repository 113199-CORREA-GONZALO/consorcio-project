import { Component, inject, OnInit } from '@angular/core';
import { Supplier } from '../../../models/supplier.model';
import { ProvidersService } from '../../../services/providers.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceType } from '../../../models/enums/service-tpye.enum';
import { CommonModule } from '@angular/common';
import { StatusType } from '../../../models/inventory.model';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './provider-list.component.html',
  styleUrl: './provider-list.component.css'
})
export class ProviderListComponent implements OnInit{
  providerList: Supplier[] = [];
  filterForm: FormGroup;
  serviceTypes = Object.values(ServiceType);
  statusTypes = Object.values(StatusType);

  private providerService = inject(ProvidersService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.filterForm = this.fb.group({
      serviceType: [''],
      state: [''],
      contactNumber: ['']
    });
  }

  ngOnInit(): void {
    this.getProviders();
    this.filterForm.get('serviceType')?.valueChanges.subscribe(() => this.applyFilters());
    this.filterForm.get('state')?.valueChanges.subscribe(() => this.applyFilters());
  }

  getProviders() {
    this.applyFilters();
  }

  applyFilters(): void {
    const filters = {
      serviceType: this.filterForm.get('serviceType')?.value,
      state: this.filterForm.get('state')?.value,
      contactNumber: this.filterForm.get('contactNumber')?.value
    };
    this.providerService.getProviders(filters).subscribe((providerList) => {
      this.providerList = providerList;
    });
  }

  searchByContact() {
    this.applyFilters();
  }

  clearSearch() {
    this.filterForm.reset();
    this.applyFilters();
  }

  editProvider(id: number) {
    this.router.navigate(['/providers/form', id]);
  }

  deleteProvider(id: number){
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podras revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if(result.isConfirmed){
        this.providerService.deleteProvider(id).subscribe(() => {
          this.getProviders();
          Swal.fire(
            'Eliminado!',
            'El proveedor ha sido eliminado.',
            'success'
          )
        })
      }
    })
  }
}
