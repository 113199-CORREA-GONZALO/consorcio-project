import { ArticlePost } from './../../../../models/article.model';
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
      // Cambia 'type' a 'articleType'
      articleType: [ArticleType.NON_REGISTRABLE, Validators.required],
      // Cambia 'status' a 'articleCondition'
      articleCondition: [ArticleCondition.FUNCTIONAL, Validators.required],
      // Cambia 'category' a 'articleCategory'
      articleCategory: [ArticleCategory.DURABLES, Validators.required],
      measurementUnit: [MeasurementUnit.UNITS, Validators.required],
      location: [''],
      stock: [''],
      stockMin: ['']
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
    if (this.articleForm.valid) {
      const newArticle: ArticlePost = this.articleForm.value as ArticlePost;
      const newArticleFormatted = this.mapperService.toSnakeCase(newArticle);

      if (this.isEditing) {
        //this.updateArticle(newArticleFormatted); // Llama a updateArticle si estamos editando
      } else {
        this.inventoryService.addArticle(newArticleFormatted).subscribe(() => {
          this.getArticles(); // Recargar la lista
          this.resetForm(); // Limpiar el formulario
        });
      }
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
