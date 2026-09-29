import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Apollo, gql } from 'apollo-angular';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { Product } from '../interfaces/product';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      image
      stripePriceId
    }
  }
`;
const SEARCH_PRODUCTS = gql`
  query SearchProducts($searchTerm: String!) {
  searchProducts(term:$searchTerm) {
    id
    description
    price
    image
    stripePriceId
    name
  }
}
`;
export interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  loading: true,
  error: null,
};

export const ProductStore = signalStore(
  {
    providedIn: 'root',
  },
  withState(initialState),
  withMethods((store, apollo = inject(Apollo)) => ({
    loadProducts() {
      patchState(store, { loading: true });
      apollo
        .watchQuery<{ products: Product[] }>({
          query: GET_PRODUCTS,
        })
        .valueChanges.pipe(
          tap({
            next: ({ data }) =>
              patchState(store, {
                products: (data?.products ?? []) as Product[],
                loading: false,
              }),
            error: (error) =>
              patchState(store, { error: error.message, loading: false }),
          })
        )
        .subscribe();
    },
    searchProducts(term: string) {
      patchState(store, { loading: true, error: null });
      apollo
        .query<{ searchProducts: Product[] }>({
          query: SEARCH_PRODUCTS,
          variables:{ 
            searchTerm:term
          }
        })
        .pipe(
          map(({data}) =>
            patchState(store, { products: data?.searchProducts, loading: false}),
          ),
          catchError((error)=>{
            patchState(store, { error: error.message, loading: false });
            return EMPTY; 
          })
        )
        .subscribe();
    },
  }))
);
