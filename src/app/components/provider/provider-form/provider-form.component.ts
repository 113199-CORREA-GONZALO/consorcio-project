import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceType } from '../../../models/enums/service-tpye.enum';
import { StatusType } from '../../../models/inventory.model';
import { ProvidersService } from '../../../services/providers.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {  Supplier } from '../../../models/supplier.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './provider-form.component.html',
  styleUrl: './provider-form.component.css'
})
export class ProviderFormComponent implements OnInit{
  providerForm: FormGroup;
  serviceTypes = Object.values(ServiceType);
  statusTypes = Object.values(StatusType);
  isEditMode = false;
  currentProviderId: number | null = null;

  private providerService = inject(ProvidersService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalService = inject(NgbModal);

  constructor() {
    this.providerForm = this.fb.group({
      name: ['', Validators.required],
      cuil: ['', Validators.required],
      service: ['', Validators.required],
      contact: ['', Validators.required],
      address: ['', Validators.required],
      details: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.currentProviderId = +id;
        this.loadProviderData(this.currentProviderId);
      }
    });
  }

  onSubmit(): void {
    if (this.providerForm.valid) {
      const formData = { ...this.providerForm.value };
      
      // Remover el id si existe, ya que no se debe enviar en el POST
      if (!this.isEditMode) {
        delete formData.id;
      }
      
      if (this.isEditMode && this.currentProviderId !== null) {
        formData.id = this.currentProviderId; // Asignar el ID actual al proveedor en modo edición
        this.updateProvider(formData);
      } else {
        this.addProvider(formData);
      }
    }
  }
  
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  addProvider(providerData: Supplier): void {
    this.providerService.addProvider(providerData).subscribe(() => {
      Swal.fire({
        title: 'Proveedor agregado!',
        text: 'El proveedor ha sido agregado.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      this.resetForm();
      this.router.navigate(['/providers/list']);
    });
  }

  showInfo(): void {
    this.modalService.open(this.infoModal, { centered: true });
  }
  
  updateProvider(providerData: Supplier): void {
    this.providerService.updateProvider(providerData).subscribe(() => {
      Swal.fire({
        title: 'Proveedor actualizado!',
        text: 'El proveedor ha sido actualizado.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      this.router.navigate(['/providers/list']);
    });
  }

  resetForm() {
    this.providerForm.reset();
    this.isEditMode = false;
    this.currentProviderId = null;
    this.router.navigate(['/providers/list']);
  }

  loadProviderData(id: number): void {
    this.providerService.getProviderById(id).subscribe(
      (provider: Supplier) => {
        this.currentProviderId = provider.id; // Asegúrate de asignar el id
        this.providerForm.patchValue(provider);
      },
      (error) => {
        console.error('Error loading provider data:', error);
        Swal.fire('Error', 'No se pudo cargar los datos del proveedor', 'error');
      }
    );
  }
  
}
