import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Address, Supplier } from '../../../models/supplier.model';
import { ProvidersService } from '../../../services/providers.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceType } from '../../../models/enums/service-tpye.enum';
import { CommonModule } from '@angular/common';
import { StatusType } from '../../../models/inventory.model';

//exportar a pdf y excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './provider-list.component.html',
  styleUrl: './provider-list.component.css'
})
export class ProviderListComponent implements OnInit{
  @ViewChild('providersTable') providersTable!: ElementRef;
  
  providerList: Supplier[] = [];
  addresses: Address[] = []; // Agregar la lista de direcciones
  filteredProviders: Supplier[] = []; // Proveedores filtrados

  filterForm: FormGroup;
  serviceTypes = Object.values(ServiceType);
  statusTypes = Object.values(StatusType);

  private providerService = inject(ProvidersService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.filterForm = this.fb.group({
      state: [''],
      cuil: [''] // Filtro para buscar por CUIL

    });
  }

  ngOnInit(): void {
    this.getProviders();
    this.loadAddresses(); // Cargar las direcciones
    this.filterForm.get('state')?.valueChanges.subscribe(() => this.applyFilters());
  }
  loadAddresses(): void {
    this.providerService.getAddresses().subscribe((addresses: Address[]) => {
      this.addresses = addresses;
    });
  }
  trackByFn(index: number, item: Supplier): number {
    return item.id; // Devuelve el ID del proveedor como clave
  }
  getAddressById(addressId: number): string {
    const address = this.addresses.find(a => a.id === addressId);
    return address ? address.street_address : 'N/A';
  }

  getProviders() {
    this.providerService.getProviders().subscribe((providerList) => {
      this.providerList = providerList;
      this.filteredProviders = providerList; // Inicialmente, no hay filtros aplicados
    });
  }

  applyFilters(): void {
    const filters = {
      state: this.filterForm.get('state')?.value,
      cuil: this.filterForm.get('cuil')?.value
    };
    this.providerService.getProviders(filters).subscribe((providerList) => {
      this.providerList = providerList;
    });
  }
  // Método para buscar proveedores por CUIL
  searchByCUIL(): void {
    const cuil = this.filterForm.get('cuil')?.value;
    if (cuil) {
      this.filteredProviders = this.providerList.filter(provider => provider.cuil.includes(cuil));
    } else {
      this.filteredProviders = this.providerList; // Restablece la lista si no hay CUIL ingresado
    }
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

  exportToPDF() {
    const doc = new jsPDF();
    const tableColumn = ['Nombre', 'CUIL', 'Tipo de servicio', 'Dirección', 'Estado'];
    const tableRows: any[][] = [];
  
    this.providerList.forEach((provider) => {
      const providerAddress = this.addresses.find((addr) => addr.id === provider.addressId);
      const providerData = [
        provider.name,
        provider.cuil,
        provider.service,
        providerAddress ? providerAddress.street_address : 'N/A', // Mostramos la dirección
        provider.enabled ? 'Activo' : 'Inactivo'
      ];
      tableRows.push(providerData);
    });
  
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });
  
    doc.save('proveedores.pdf');
  }

  exportToExcel() {
    try {
      let element = document.getElementById('providersTable');
      if (!element) {
        console.warn('Table element not found in DOM, using component data instead.');
        element = this.createTableFromData();
      }
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
      XLSX.writeFile(wb, 'proveedores.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      // Aquí puedes añadir una notificación al usuario si lo deseas
    }
  }

  private createTableFromData(): HTMLTableElement {
    const table = document.createElement('table');
    const thead = table.createTHead();
    const tbody = table.createTBody();

    // Crear encabezados
    const headerRow = thead.insertRow();
    ['Nombre', 'Tipo de servicio', 'Contacto', 'Estado'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });

    // Crear filas de datos
    // this.providerList.forEach(provider => {
    //   const row = tbody.insertRow();
    //   [provider.name, provider.serviceType, provider.contact, provider.state].forEach(text => {
    //     const cell = row.insertCell();
    //     cell.textContent = text;
    //   });
    // });
    this.providerList.forEach((provider) => {
      const providerAddress = this.addresses.find((addr) => addr.id === provider.addressId);
      const row = tbody.insertRow();
      [provider.name, provider.cuil, provider.service, providerAddress ? providerAddress.street_address : 'N/A', provider.enabled ? 'Activo' : 'Inactivo'].forEach((text) => {
        const cell = row.insertCell();
        cell.textContent = text;
      });
    });

    return table;
  }
}
