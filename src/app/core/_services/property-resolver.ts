/**
 * Utility class for resolving properties in a nested object by providing a property path.
 *
 * @example
 * To access a nested property within an object:
 *
 * const obj = {
 *   person: {
 *     name: 'John',
 *     address: {
 *       city: 'New York'
 *     }
 *   }
 * };
 *
 * const city = PropertyResolver.resolve('person.address.city', obj); // Returns 'New York'
 *
 * @class PropertyResolver
 */
export class PropertyResolver {
  /**
   * Resolves a property within a nested object by providing a property path.
   *
   * @param {string} path - The property path to resolve (e.g., 'person.address.city').
   * @param {any} obj - The object in which to resolve the property.
   * @returns {any} The resolved property value or `undefined` if the path is not found.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static resolve(path: string, obj: any) {
    return path.split('.').reduce((prev, curr) => {
      return (prev ? prev[curr] : undefined);
    }, obj || self);
  }
}


