import { Component, EventEmitter, inject, ModelSignal, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { DocumentType, Employee, EmployeeFilter, EmployeeType, StatusType } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

//exportar a pdf y excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { EmployeeEditModalComponent } from "../employee-edit-modal/employee-edit-modal.component";
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { state } from '@angular/animations';


@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, EmployeeEditModalComponent, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})

export class EmployeeListComponent implements OnInit{
  employeeList: Employee[] = [
    {
      id: 110,
      firstName: 'test',
      lastName: 'TEST',
      employeeType: EmployeeType.ADMIN,
      documentType: DocumentType.DNI,
      docNumber: '123456789',
      hiringDate: new Date().toISOString().split('T')[0],
      //hiringDate: new Date(),
      salary: 0,
      state: StatusType.ACTIVE,
    },
    {
      id: 100,
      firstName: 'test 2',
      lastName: 'TEST 2',
      employeeType: EmployeeType.ADMIN,
      documentType: DocumentType.DNI,
      docNumber: '123456781',
      hiringDate: new Date().toISOString().split('T')[0],
      salary: 0,
      state: StatusType.INACTIVE,
    }
    
  ];

  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  private originalEmployeeList: Employee[] = [];
  currentFilter: 'all' | 'active' | 'inactive' = 'all';
  filteredEmployeeList: Employee[] = [];
  
  //private modal: Modal | null = null;
  private fb = inject(FormBuilder);
  filterForm: FormGroup;

  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 10;
  totalElements: number = 0;
  selectedStatus?: StatusType;
  statusTypes = Object.values(StatusType);
  employeeTypes = Object.values(EmployeeType);

  documentTypes = Object.values(DocumentType);
  private employeeService = inject(EmployeesService);
  private router = inject(Router);
  private mapperService = inject(MapperService);
  private modalService = inject(NgbModal);
  showModalFilters: boolean = false;

  searchFilter = new FormControl('');

  constructor() {
    this.filterForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      employeeType: [''],
      docType: [''],
      docNumber: [''],
      hiringDate: [''],
      salary: [''],
      state: [''],
      enabled: [true]
    });
  }

  
  ngOnInit(): void {
    this.getEmployees();
    this.setupFilterSubscription();
    this.applyFilters();
    this.totalPages=1;
    // this.loadEmployees(); // Use this for API integration
    this.mockGetEmployees(); // Use this for mock data

    const modalElement = document.getElementById('filterModal');
    if (modalElement) {
      //this.modal = new Moda(modalElement);
    }

  }

  getEmployees() {
    // Ya no manejamos la suscripción del searchFilter aquí

    this.employeeService.getEmployees().subscribe(employeeList => {
      employeeList = this.mapperService.toCamelCase(employeeList);
      this.originalEmployeeList = employeeList;
      this.employeeList = employeeList;
      this.filteredEmployeeList = employeeList;
      this.applyCurrentFilter(); // Aplicar el filtro actual después de cargar los datos
    });
  }

  private setupFilterSubscription(): void {
    this.searchFilter.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (!searchTerm || searchTerm.trim() === '') {
          // Si el término de búsqueda está vacío, restaurar la lista original
          this.employeeList = [...this.originalEmployeeList];
          this.applyCurrentFilter(); // Mantener el filtro actual (activo/inactivo/todos)
        } else {
          // Filtrar la lista original
          this.employeeList = this.originalEmployeeList.filter(employee =>
            employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.salary.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        this.filteredEmployeeList = [...this.employeeList];
      });
  }

  applyFilter(): void {
    const filter: EmployeeFilter = Object.entries(this.filterForm.value).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        (acc as any)[key] =  value;
      }
      return acc;
    }, {} as EmployeeFilter);
    Object.keys(filter).forEach(key => {
      if (!filter[key as keyof typeof filter]) {
        delete filter[key as keyof typeof filter];
      }
    });
    this.employeeService.searchEmployees(filter).subscribe(employees => {
        this.employeeList = employees;
        this.filteredEmployeeList = employees
      },
      (error) => {
        console.error('Error al filtrar empleados:', error);
        Swal.fire('Error', 'Error al filtrar empleados', 'error');
      }
    );
  }

  clearFilters(){
    this.searchFilter.reset();
    this.applyFilters();
    this.filterForm.reset({
      employeeType: '',
      docType: '',
      state: '',
    });
  }

  /*goToNextPage() {
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
  }*/

  editEmployee(employee: Employee): void {
    this.router.navigate(['employees/form', employee.id]);
  }

  @Output() showEditModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  showEditForm: boolean = false;
  editEmployee2(employee: Employee) {
    this.employeeService.setSelectedEmployee(employee);
    this.showEditForm = true;
  }

  deleteEmployee(id: number): void {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        this.getEmployees();
        Swal.fire(
          'Eliminado!',
          'El empleado ha sido eliminado.',
          'success'
        );
      });
    }
  });
}

exportToPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configurar el título
  const title = 'Listado de Empleados';
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  const tableColumn = ['Empleado', 'Tipo', 'Documento', 'Fecha de contratación', 'Estado'];
  const tableRows: any[][] = [];

  function formatDateArg(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  }

  // Preparar los datos para la tabla
  this.employeeList.forEach(employee => {
    const hiringDate = new Date(employee.hiringDate).toISOString().split('T')[0];
      const [year, month, day] = hiringDate.split('-');
      const formattedDate = `${day}/${month}/${year}`;

    const employeeData = [
      employee.lastName + ' ' + employee.firstName,
      employee.employeeType,
      employee.documentType + ': ' + employee.docNumber,
      formattedDate,
      employee.state
    ];
    tableRows.push(employeeData);
  });

  // Configurar y generar la tabla
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25
  });
  

  // Generar el PDF
  doc.save('lista-empleados.pdf');
}

exportToExcel() {
  // Preparar los datos para Excel
  const data = this.employeeList.map(employee => {
    const hiringDate = new Date(employee.hiringDate).toISOString().split('T')[0];
    const [year, month, day] = hiringDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    return {
      Empleado: `${employee.lastName} ${employee.firstName}`,
      Tipo: employee.employeeType,
      Documento: `${employee.documentType}: ${employee.docNumber}`,
      'Fecha de contratación': formattedDate,
      Estado: employee.state
    };
  });

  // Crear una hoja de trabajo
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  
  // Crear un libro de trabajo y agregar la hoja
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Empleados');

  // Ajustar el ancho de las columnas
  const columnsWidth = [
    { wch: 25 }, // Empleado
    { wch: 15 }, // Tipo
    { wch: 25 }, // Documento
    { wch: 20 }, // Fecha de contratación
    { wch: 15 }  // Estado
  ];
  ws['!cols'] = columnsWidth;

  // Generar el archivo Excel
  XLSX.writeFile(wb, 'lista-empleados.xlsx');
}

  onModalClose() {
    this.showEditForm = false;
    this.getEmployees();
  }


  loadEmployees() {
    this.employeeService
      .getEmployeesPageable(this.currentPage - 1, this.itemsPerPage, this.selectedStatus)
      .subscribe({
        next: (response) => {
          response = this.mapperService.toCamelCase(response);
          this.employeeList = this.mapperService.toCamelCase(response.content);
          console.log(response)
          this.totalPages = this.mapperService.toCamelCase(response.totalPages);
          this.totalElements = this.mapperService.toCamelCase(response.totalElements);
        },
        error: (error) => {
          console.error('Error loading employees:', error);
        }
      });
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadEmployees();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadEmployees();
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1; // Reset to first page when changing items per page
    this.loadEmployees();
  }

  filterByStatus(status?: StatusType) {
    this.selectedStatus = status;
    this.currentPage = 1; // Reset to first page when filtering
    this.loadEmployees();
  }

  openModalFilters(){
    this.showModalFilters = !this.showModalFilters; 
  }

/*
  applyFilter(): void {
    // Crear objeto de filtro solo con los campos que tienen valor
    const filter: EmployeeFilter = Object.entries(this.filterForm.value).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as EmployeeFilter);

    // Llamar al servicio con los filtros
    this.employeeService.searchEmployees(filter).subscribe(
      (employees) => {
        this.employeeList = employees;
      },
      (error) => {
        console.error('Error al filtrar empleados:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    );
  }*/
 
    // Funciones para filtrar por estado
    filterActiveEmployees(): void {
      console.log(this.employeeList.filter(employee => employee.state === StatusType.ACTIVE));
      this.currentFilter = 'active';
      // For mock data
      this.employeeList = this.originalEmployeeList.filter(employee => employee.state === StatusType.ACTIVE);
      this.filteredEmployeeList = [...this.employeeList];
      console.log("Using active filter");
      // For API integration
      // this.applyFilters();
    }
  
    filterInactiveEmployees(): void {
      console.log(this.employeeList.filter(employee => employee.state === StatusType.INACTIVE));
      this.currentFilter = 'inactive';
      // For mock data
      this.employeeList = this.originalEmployeeList.filter(employee => employee.state === StatusType.INACTIVE);
      this.filteredEmployeeList = [...this.employeeList];
      console.log("Using inactive filter");
      // For API integration
      // this.applyFilters();
    }
  
    showAllEmployees(): void {
      console.log(this.employeeList);
      this.currentFilter = 'all';
      // For mock data
      this.employeeList = [...this.originalEmployeeList];
      this.filteredEmployeeList = [...this.originalEmployeeList];
      console.log("Using all filter");
      // For API integration
      this.applyFilters();
    }
  
    // Modified to use mock data
    mockGetEmployees() {
      //this.isLoading = true;
      // Simulate API call delay
      setTimeout(() => {
        // Save a copy of the original data
        this.originalEmployeeList = [...this.employeeList]; // Using the mock data from your component
        this.employeeList = [...this.employeeList];
        this.filteredEmployeeList = [...this.employeeList];
        //this.isLoading = false;
      }, 500);
  
      // Add filter subscriptions if needed
      this.filterForm.get('firstName')?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(data => {
          if (data === null || data === '') {
            this.filteredEmployeeList = [...this.employeeList];
          } else {
            this.filteredEmployeeList = this.employeeList.filter(
              x => x.firstName.toLowerCase().includes(data.toLowerCase())
            );
          }
        });
    }
  
    private applyCurrentFilter(): void {
      switch (this.currentFilter) {
        case 'active':
          this.employeeList = this.originalEmployeeList.filter(
            employee => employee.state === StatusType.ACTIVE
          );
          break;
        case 'inactive':
          this.employeeList = this.originalEmployeeList.filter(
            employee => employee.state === StatusType.INACTIVE
          );
          break;
        default:
          this.employeeList = [...this.originalEmployeeList];
      }
      this.filteredEmployeeList = [...this.employeeList];
      console.log("Using applyCurrentFilter method");
    }
  
    setFilter(filter: 'all' | 'active' | 'inactive'): void {
      this.currentFilter = filter;
      this.applyCurrentFilter();
      this.applyFilters();
      console.log("Using setFilter method");
    }
  
    // Modify existing applyFilters method to work with the new filtering system
    applyFilters(): void {
      const filter: EmployeeFilter = {
        ...Object.entries(this.filterForm.value).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            (acc as any)[key] = value;
          }
          return acc;
        }, {} as EmployeeFilter),
        state: this.currentFilter === 'all' ? undefined : 
               this.currentFilter === 'active' ? StatusType.ACTIVE : StatusType.INACTIVE
      };
  
      this.employeeService.searchEmployees(filter).subscribe(
        (employees) => {
          this.employeeList = employees;
          this.filteredEmployeeList = [...employees];
        },
        (error) => {
          console.error('Error filtering employees:', error);
          Swal.fire('Error', 'Error filtering employees', 'error');
        }
      );
    }

    isLoading = false;
  sortedProviderList: Employee[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

    sort(column: keyof Employee): void {
      // Cambia la dirección de orden si la columna ya está seleccionada, sino reinicia a 'asc'
      this.sortDirection = this.sortColumn === column ? (this.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
      this.sortColumn = column;
    
      // Ordena la lista
      this.employeeList = [...this.employeeList].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];
    
        if (valueA == null || valueB == null) return 0; // Evita ordenamiento si es null o undefined
    
        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
}
