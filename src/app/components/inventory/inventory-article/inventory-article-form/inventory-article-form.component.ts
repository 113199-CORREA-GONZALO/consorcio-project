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
  templateUrl: './inventory-article-form.component.html',
  styleUrls: ['./inventory-article-form.component.css']
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
      identifier: [''],
      name: ['', Validators.required],
      description: [''],
      // Cambia 'type' a 'articleType'
      articleType: [ArticleType.NON_REGISTRABLE, Validators.required],
      // Cambia 'status' a 'articleCondition'
      articleCondition: [ArticleCondition.FUNCTIONAL, Validators.required],
      // Cambia 'category' a 'articleCategory'
      articleCategory: [ArticleCategory.DURABLES, Validators.required],
      measurementUnit: [MeasurementUnit.UNITS, Validators.required],
      // article_status: [Status.ACTIVE]
    });
  }

  ngOnInit(): void {
    this.getArticles();
  }

  getArticles(): void {
    this.inventoryService.getArticles().subscribe(articles => {
      this.articles = articles;
    });
  }

  addArticle(): void {
    if (this.articleForm.valid) {
      const newArticle = this.articleForm.value;

      // Convierte el artículo a snake_case antes de enviarlo
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
      type: ArticleType.REGISTRABLE, // Valor por defecto
      status: ArticleCondition.FUNCTIONAL, // Valor por defecto
      category: ArticleCategory.DURABLES, // Valor por defecto
      measurement_unit: MeasurementUnit.UNITS // Valor por defecto

    });
    this.isEditing = false; // Cambia el estado a no edición
    this.currentArticleId = undefined; // Limpia el ID del ítem actual
  }
}
