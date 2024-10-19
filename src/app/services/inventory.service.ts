import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticlePost } from '../models/article.model';
import { Inventory, Transaction } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiArticlesUrl = 'http://localhost:8080/articles'; // URL de la API para los ítems DEL BACK
  private apiInventoriesUrl = 'http://localhost:3000/inventories'; // URL de la API para los inventarios
  private apiTransactionsUrl = 'http://localhost:3000/transactions'; // URL de la API para las transacciones

  constructor(private http: HttpClient) {}

  // CRUD para Ítems
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiArticlesUrl);
  }

  addArticle(article: ArticlePost): Observable<ArticlePost> {
    console.log(article);
    return this.http.post<ArticlePost>(this.apiArticlesUrl, article);
  }

  updateArticle(articleId: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiArticlesUrl}/${articleId}`, article);
  }

  deleteArticle(article_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiArticlesUrl}/${article_id}`, { article_status: 'Inactive' });
  }

  // CRUD para Inventarios
  getInventories(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.apiInventoriesUrl);
  }

  addInventory(inventory: Inventory): Observable<Inventory> {
    return this.http.post<Inventory>(this.apiInventoriesUrl, inventory);
  }

  updateInventory(inventory: Inventory): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.apiInventoriesUrl}/${inventory.id}`, inventory);
  }

  deleteInventory(inventory_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiInventoriesUrl}/${inventory_id}`, { inventory_status: 'Inactive' });
  }

  // CRUD para Transacciones
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiTransactionsUrl);
  }

// inventory.service.ts
addTransaction(transaction: Transaction): Observable<Transaction> {
  return this.http.post<Transaction>(this.apiTransactionsUrl, transaction);
}
updateTransaction(transactionId: number, transaction: Transaction): Observable<Transaction> {
  return this.http.put<Transaction>(`${this.apiTransactionsUrl}/${transactionId}`, transaction);
}

  deleteTransaction(transaction_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiTransactionsUrl}/${transaction_id}`, { transaction_status: 'Inactive' });
  }
}
