import { PropertyResolver } from '../property-resolver';
import { Injectable } from '@angular/core';

/**
 * Service for filtering an array of items based on search criteria.
 *
 * @class FilterService
 */
@Injectable({
  providedIn: 'root'
})
export class FilterService {

  /**
   * Filters an array of items based on a search string and a list of properties to search within.
   *
   * @template T - The type of items in the array.
   * @param {T[]} items - The array of items to filter.
   * @param {string} data - The search string or term.
   * @param {string[]} props - The list of properties to search within.
   * @returns {T[]} An array of items that match the search criteria.
   */
  filter<T>(items: T[], data: string, props: string[]): T[] {
    return items.filter((item: T) => {
      let match = false;
      for (const prop of props) {
        if (prop.indexOf('.') > -1) {
          const value = PropertyResolver.resolve(prop, item);
          if (value && value.toUpperCase().indexOf(data) > -1) {
            match = true;
            break;
          }
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((item as any)[prop].toString().toUpperCase().indexOf(data) > -1) {
          match = true;
          break;
        }
      }
      return match;
    });
  }
}
