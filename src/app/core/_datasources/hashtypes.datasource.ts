import { catchError, finalize, of } from 'rxjs';

import { BaseDataSource } from './base.datasource';
import { Hashtype } from '../_models/hashtype.model';
import { ListResponseWrapper } from '../_models/response.model';
import { SERV } from '../_services/main.config';

export class HashtypesDataSource extends BaseDataSource<Hashtype> {
  loadAll(): void {
    this.loadingSubject.next(true);

    const params = { maxResults: this.maxResults };
    const hashtypes$ = this.service.getAll(SERV.HASHTYPES, params);

    this.subscriptions.push(
      hashtypes$
        .pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
        )
        .subscribe((response: ListResponseWrapper<Hashtype>) => {
          this.setPaginationConfig(
            this.pageSize,
            this.currentPage,
            response.total
          );
          this.setData(response.values);
        })
    );
  }

  reload(): void {
    this.reset();
    this.loadAll();
  }
}
