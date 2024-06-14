export class FilterOperations {
  static addFilter(filters, inputOptions) {
    const existingIndex = filters.findIndex((f) => f.filterType === inputOptions.filterType);
    if (existingIndex !== -1) {
      throw new Error('Filter already applied');
    }
    filters.push(inputOptions);
  }
  static updateFilter(filters, inputOptions) {
    const index = filters.findIndex((f) => f.filterType === inputOptions.filterType);
    if (index === -1) {
      throw new Error('Filter not found');
    }
    filters[index] = { ...filters[index], ...inputOptions };
  }
  static removeFilter(filters, filterType) {
    return filters.filter((f) => f.filterType !== filterType);
  }
}
