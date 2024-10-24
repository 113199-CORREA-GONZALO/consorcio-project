import { ArticleInventoryPost, ArticlePost } from './../../../../models/article.model';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../../services/inventory.service';
import { Article, ArticleCategory, ArticleType, ArticleCondition, MeasurementUnit,Status } from '../../../../models/article.model';
import { MapperService } from '../../../../services/MapperCamelToSnake/mapper.service';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Agrega ReactiveFormsModule aquí
  templateUrl: './inventory-articles-form.component.html',
  styleUrls: ['./inventory-articles-form.component.css']
})
export class ArticleComponent implements OnInit {

  private mapperService = inject(MapperService);

  articleForm: FormGroup;
  articles: Article[] = [];
  isEditing: boolean = false; // Variable para controlar el estado de edición
  currentArticleId?: number; // Almacena el ID del ítem actual en edición

  // Propiedades para los enumerados
  ArticleType = ArticleType; // Asignamos el enum ArticleType a una propiedad del componente
  ArticleStatus = ArticleCondition; // Asignamos el enum ArticleStatus a una propiedad del componente
  ArticleCategory = ArticleCategory; // Asignamos el enum ArticleCategory a una propiedad del componente
  MeasurementUnit = MeasurementUnit; // Asignamos el enum MeasurementUnit a una propiedad del componente

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.articleForm = this.fb.group({
      identifier: [{value:'', disabled: true}],
      name: ['', Validators.required],
      description: [''],
      articleType: [ArticleType.NON_REGISTRABLE, Validators.required],
      articleCondition: [ArticleCondition.FUNCTIONAL, Validators.required],
      articleCategory: [ArticleCategory.DURABLES, Validators.required],
      measurementUnit: [MeasurementUnit.UNITS, Validators.required],
      location: ['', Validators.required], // Campo ubicación del inventario
      stock: ['', Validators.required],    // Campo stock del inventario
      stockMin: ['', Validators.required], // Campo stock mínimo del inventario
      price: ['', Validators.required]     // Campo precio para la transacción inicial
    });
  }

  ngOnInit(): void {
    this.getArticles();
    this.articleForm.get('articleType')?.valueChanges.subscribe(this.handleArticleTypeChange.bind(this));
  }

  handleArticleTypeChange(value: ArticleType): void {
    if(value === ArticleType.REGISTRABLE) {
      this.articleForm.get('identifier')?.enable();
      this.articleForm.get('measurementUnit')?.disable();
    } else {
      this.articleForm.get('identifier')?.disable();
      this.articleForm.get('measurementUnit')?.enable();
      this.articleForm.get('identifier')?.reset();
    }
  }

  getArticles(): void {
    this.inventoryService.getArticles().subscribe(articles => {
      this.articles = articles;
    });
  }

  addArticle(): void {
    console.log(this.articleForm.value); // Loguear el estado actual del formulario
    if (this.articleForm.valid) {
      const article: ArticlePost = {
        identifier: this.articleForm.get('identifier')?.value ?? null,
        name: this.articleForm.get('name')?.value,
        description: this.articleForm.get('description')?.value ?? null,
        articleCondition: this.articleForm.get('articleCondition')?.value,
        articleCategory: this.articleForm.get('articleCategory')?.value,
        articleType: this.articleForm.get('articleType')?.value,
        measurementUnit: this.articleForm.get('measurementUnit')?.value
      };

      const articleInventory: ArticleInventoryPost = {
        article,
        stock: this.articleForm.get('stock')?.value,
        minStock: this.articleForm.get('stockMin')?.value ?? null,
        location: this.articleForm.get('location')?.value ?? null,
        price: this.articleForm.get('price')?.value ?? null
      };

      const articleInventoryFormatted = this.mapperService.toSnakeCase(articleInventory);

      this.inventoryService.addInventoryArticle(articleInventoryFormatted).subscribe(() => {
        this.getArticles();
        this.resetForm();
      });
    }
  }

  resetForm(): void {
    this.articleForm.reset({
      identifier: '',
      name: '',
      description: '',
      location: '',
      articleType: ArticleType.REGISTRABLE, // Valor por defecto
      articleCondition: ArticleCondition.FUNCTIONAL, // Valor por defecto
      articleCategory: ArticleCategory.DURABLES, // Valor por defecto
      measurementUnit: MeasurementUnit.UNITS // Valor por defecto
    });
    this.isEditing = false; // Cambia el estado a no edición
    this.currentArticleId = undefined; // Limpia el ID del ítem actual
  }
}
