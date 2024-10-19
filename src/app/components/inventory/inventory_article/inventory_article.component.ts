import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../services/inventory.service';
import { Article, ArticleCategory, ArticleType, ArticleCondition, MeasurementUnit,Status } from '../../../models/article.model';
import { ServiceType } from '../../../models/enums/service-tpye.enum';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Agrega ReactiveFormsModule aquí
  templateUrl: './inventory_article.component.html',
  styleUrls: ['./inventory_article.component.css']
})
export class ArticleComponent implements OnInit {
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
      location: [''],
      type: [ArticleType.NON_REGISTRABLE, Validators.required],
      status: [ArticleCondition.FUNCTIONAL, Validators.required],
      category: [ArticleCategory.DURABLES, Validators.required],
      measurement_unit: [MeasurementUnit.UNITS, Validators.required],
      article_status: [Status.ACTIVE]
    });
  }

  ngOnInit(): void {
    this.getArticles();
  }

  getArticles(): void {
    this.inventoryService.getArticles().subscribe(articles => {
      this.articles = articles; //filter(article => article.article_status === Status.ACTIVE); // Mostrar solo ítems activos
      console.log(this.articles);
    });
  }

  addArticle(): void {
    if (this.articleForm.valid) {
      const newArticle = this.articleForm.value;

      if (this.isEditing) {
        this.updateArticle(newArticle); // Llama a updateArticle si estamos editando
      } else {
        this.inventoryService.addArticle(newArticle).subscribe(() => {
          this.getArticles(); // Recargar la lista
          this.resetForm(); // Limpiar el formulario
        });
      }
    }
  }

  editArticle(article: Article): void {
    this.isEditing = true; // Cambia el estado a edición
    this.currentArticleId = article.id; // Guarda el ID del ítem actual
    this.articleForm.patchValue(article); // Llena el formulario con los datos del ítem a editar
  }

  updateArticle(article: Article): void {
    if (this.currentArticleId) {
      // Actualiza el ítem con el ID actual
      this.inventoryService.updateArticle(this.currentArticleId, article).subscribe(() => {
        this.getArticles(); // Recarga la lista de ítems
        this.resetForm(); // Resetea el formulario después de actualizar
      });
    }
  }

  deleteArticle(article_id: number): void {
    this.inventoryService.deleteArticle(article_id).subscribe(() => {
      this.getArticles();
    });
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
