import {
  PipeTransform,
  Pipe
} from '@angular/core';

/**
 * This function takes the object access the key values annd returns the average value
 * @param value - Object
 * @param name -Column name
 * Usage:
 *   object | avg:'name'
 * Example:
 *   {{ object | avg:'value' }}
 * @returns number
**/

@Pipe({
  name: 'avg'
})
export class AveragePipe implements PipeTransform {

  transform(value: any[], name: string): string {
    if (!value || value.length === 0 || !name) {
      return 'No data';
    }

    const arr: number[] = value.map(item => parseFloat(item[name]));
    const sum: number = arr.reduce((a, i) => a + i, 0);
    const avg: number = sum / value.length;

    return `${avg}`;
  }
}