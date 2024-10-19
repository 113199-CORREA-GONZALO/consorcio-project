import { InventoryService } from '../../../../services/inventory.service';
import { Component, inject, OnInit } from '@angular/core';
import { Article, ArticleCategory, ArticleCondition, ArticleType, MeasurementUnit } from '../../../../models/article.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-inventory-article-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-article-table.component.html',
  styleUrl: './inventory-article-table.component.css'
})
export class InventoryArticleTableComponent {

  private inventoryService = inject(InventoryService);

  articles: Article[] = [];
  isEditing: boolean = false; // Variable para controlar el estado de edición
  currentArticleId?: number; // Almacena el ID del ítem actual en edición

  // Propiedades para los enumerados
  ArticleType = ArticleType; // Asignamos el enum ArticleType a una propiedad del componente
  ArticleStatus = ArticleCondition; // Asignamos el enum ArticleStatus a una propiedad del componente
  ArticleCategory = ArticleCategory; // Asignamos el enum ArticleCategory a una propiedad del componente
  MeasurementUnit = MeasurementUnit; // Asignamos el enum MeasurementUnit a una propiedad del componente

  constructor() { }

  ngOnInit(): void {
    this.getArticles();
  }

  getArticles(): void {
    this.inventoryService.getArticles().subscribe(articles => {
      this.articles = articles;
    });
  }


  editArticle(article: Article): void {
    this.isEditing = true; // Cambia el estado a edición
    this.currentArticleId = article.id; // Guarda el ID del ítem actual
    //this.articleForm.patchValue(article); // Llena el formulario con los datos del ítem a editar
  }

  updateArticle(article: Article): void {
    if (this.currentArticleId) {
      // Actualiza el ítem con el ID actual
      this.inventoryService.updateArticle(this.currentArticleId, article).subscribe(() => {
        this.getArticles(); // Recarga la lista de ítems
      });
    }
  }

  deleteArticle(article_id: number): void {
    this.inventoryService.deleteArticle(article_id).subscribe(() => {
      this.getArticles();
    });
  }

}
