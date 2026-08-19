import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SearchApiResponse, SearchResult } from '../../../core/models/search.models';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    private apiUrl = `${environment.apiUrl}${environment.searchEndpoint}`;
    private cache = new Map<string, SearchResult[]>();

    constructor(private http: HttpClient) {}

    search(query: string, limit: number = 20, start: number = 0): Observable<SearchResult[]> {

        const cacheKey = `${query}-${limit}-${start}`;

        if (this.cache.has(cacheKey)) {
            return of(this.cache.get(cacheKey)!);
        }

        const params = new HttpParams()
            .set('q', query)
            .set('limit', limit.toString())
            .set('st', start.toString());

        return this.http.get<SearchApiResponse>(this.apiUrl, { params }).pipe(
            map(response => response.results),
            tap(results => {
                this.cache.set(cacheKey, results);
            }),
            catchError(() => of([]))
        );
    }

    clearCache(): void {
        this.cache.clear();
    }
}