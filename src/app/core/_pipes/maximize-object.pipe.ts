import {
  PipeTransform,
  Pipe
} from '@angular/core';

/**
 * This function takes the object access the key values annd returns the max value
 * @param value - Object
 * @param name -Column name
 * Usage:
 *   object | max:'name'
 * Example:
 *   {{ object | max:'value' }}
 * @returns number
**/

@Pipe({
  name: 'max'
})
export class MaximizePipe implements PipeTransform {

  transform(value: any[], name: string): string {
    if (!value || value.length === 0 || !name) {
      return 'No data';
    }

    const arr: number[] = value.map(item => parseFloat(item[name]));
    const max: number = Math.max(...arr);

    return `${max}`;
  }
}
