import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Supplier } from '../../../models/supplier.model';
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

  exportToPDF() {
    const doc = new jsPDF();
    const tableColumn = ["Nombre", "Tipo de servicio", "Contacto", "Estado"];
    const tableRows: any[][] = [];
  
    this.providerList.forEach(provider => {
      const providerData = [
        provider.name,
        provider.serviceType,
        provider.contact,
        provider.state
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
    this.providerList.forEach(provider => {
      const row = tbody.insertRow();
      [provider.name, provider.serviceType, provider.contact, provider.state].forEach(text => {
        const cell = row.insertCell();
        cell.textContent = text;
      });
    });

    return table;
  }
}
