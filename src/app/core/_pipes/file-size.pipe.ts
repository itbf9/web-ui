import {
  PipeTransform,
  Pipe
} from '@angular/core';
import { formatFileSize } from 'src/app/shared/utils/util';

/**
 * Transform bytes to a readable unit adding abbreviation units or long form
 * @param sizeB - The input number
 * @param longForm -The output unit abbreviation or long text
 * @param basesize - If exist change base size
 * Usage:
 *   value | fileSize:Units:
 * Example:
 *   {{ 1024 | fileSize:false }}
 * @returns 1KB
 *   {{ 1000| fileSize:false:1000 }}
 * @returns 1B
**/


@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  transform(sizeB: number, longForm: boolean, baseSize = 1024, threshold = 1024): string {
    return formatFileSize(sizeB, longForm ? 'long' : 'short', baseSize, threshold)
  }

}
