import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as queryString from 'query-string';

import { environment } from '../../environments/environment';
import Partnership, { PartnershipParams, ResultPartnerships } from '../interfaces/partnership';
import Partner, { PartnerParams, ResultPartners } from '../interfaces/partners';
import { CacheService } from './cache.service';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: `Token ${environment.api.token}`
  })
};

@Injectable({
  providedIn: 'root'
})
export class PartnershipsService {
  private cachePartnerships: BehaviorSubject<Partnership[]> = new BehaviorSubject([]);
  private cachePartners: BehaviorSubject<Partner[]> = new BehaviorSubject([]);

  constructor(
    private cache: CacheService
  ) {
  }

  /**
   * Returns partnerships results and keep results in cache
   */
  public searchPartnerships(query?: PartnershipParams): Observable<ResultPartnerships> {
    return this.requestPartnerships(query).pipe(
      tap(partnerships => {
        this.cachePartnerships.next(partnerships.results);
      })
    );
  }

  /**
   * Returns a single partnership, from cache if any
   * or fetched
   */
  public getPartnership(id: string) {
    if (this.cachePartnerships.value.length > 0) {
      return this.cachePartnerships.pipe(
        map(partnerships => partnerships.find(partnership => {
          return partnership.uuid === id;
        }))
      );
    }

    return this.requestPartnership(id);
  }

  public searchPartners(query: PartnerParams): Observable<ResultPartners> {
    return this.requestPartners(query).pipe(
      tap((partners) => {
        this.cachePartners.next(partners.results);
      })
    );
  }

  /**
   * Returns a single partner, from cache if any
   * or fetched
   */
  public getPartner(id: string) {
    return this.cachePartners.pipe(
      map(partners => partners.find(partner => partner.uuid === id))
    );
  }

  private requestPartnerships(query: object) {
    return this.cache.get<ResultPartnerships>(`${environment.api.url}partnerships?${queryString.stringify(query)}`, httpOptions);
  }

  private requestPartnership(id: string) {
    return this.cache.get<Partnership>(`${environment.api.url}partnerships/${id}`, httpOptions);
  }

  private requestPartners(query: object) {
    return this.cache.get<ResultPartners>(`${environment.api.url}partners?${queryString.stringify(query)}`, httpOptions);
  }
}
