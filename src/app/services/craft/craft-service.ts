import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import { Craft, CraftOption } from '../../interfaces/craft';
import { API_BASE_URL } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class CraftService {
  private apiUrl = `${API_BASE_URL}/crafts`;
  private crafts$;

  constructor(private http: HttpClient) {
    this.crafts$ = this.http.get<Craft[]>(`${this.apiUrl}/all`).pipe(shareReplay(1));
  }

  getCraftOptions() {
    return this.crafts$.pipe(
      map((crafts) =>
        (Array.isArray(crafts) ? crafts : []).map((c): CraftOption => ({
          label: c.name,
          value: c.name,
          keywords: [...(c.Keywords || []), ...(c.SearchKeywords || [])],
        })),
      ),
    );
  }
}
