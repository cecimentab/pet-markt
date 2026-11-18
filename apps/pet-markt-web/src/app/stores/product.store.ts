import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
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
const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($featured: Boolean) {
    products(featured: $featured) {
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
    searchProducts(term: $searchTerm) {
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
            next: ({ data, loading }) =>
              patchState(store, {
                products: (data?.products ?? []) as Product[],
                loading,
              }),
            error: (error) =>
              patchState(store, { error: error.message, loading: false }),
          }),
        )
        .subscribe();
    },
    getFeaturedProducts: rxMethod<boolean>(
      pipe(
        switchMap((featured) =>
          apollo.query<{ products: Product[] }>({
            query: GET_FEATURED_PRODUCTS, //Configuration of the query to get featured products
            variables: { featured },
          }),
        ),
        tap({
          next: ({ data }) =>
            patchState(store, {
              products: data?.products ?? [],
              loading: false,
              error: null,
            }),
          error: (error) =>
            patchState(store, { error: error.message, loading: false }),
        }),
      ),
    ),
    searchProducts(term: string) {
      patchState(store, { loading: true, error: null });
      apollo
        .query<{ searchProducts: Product[] }>({
          query: SEARCH_PRODUCTS,
          variables: {
            searchTerm: term,
          },
        })
        .pipe(
          map(({ data }) =>
            patchState(store, {
              products: data?.searchProducts,
              loading: false,
            }),
          ),
          catchError((error) => {
            patchState(store, { error: error.message, loading: false });
            return EMPTY;
          }),
        )
        .subscribe();
    },
  })),
);
