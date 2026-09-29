import {
  Component,
  inject,
  signal,
  effect,
  afterNextRender,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { ProductStore } from '../stores/product.store';
import { ProductCard } from '../components/product-card/product-card';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-products',
  imports: [ProductCard, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  searchTerm = signal('');
  private environmentInjector = inject(EnvironmentInjector);
  productStore = inject(ProductStore)
  searchSubject = new Subject<string>();

  constructor() {
    this.productStore.loadProducts();

    afterNextRender(() => {
      runInInjectionContext(this.environmentInjector, () => {    
        this.searchSubject
          .pipe(
            debounceTime(500), 
            distinctUntilChanged(),
            takeUntilDestroyed(),
          )
          .subscribe((term) => {
            this.productStore.searchProducts(term);
          });
      });
    });
  }
  _ = effect(() => {
    this.searchSubject.next(this.searchTerm());
  });
}
