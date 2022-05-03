export enum FilterKey {
  Author = 'author',
  Publisher = 'publisher',
  Year = 'year',
  Pages = 'pages',
  Language = 'language',
  Extension = 'extension',
}

export const FilterInputs = [
  {
    label: 'Author(s)',
    key: FilterKey.Author,
  },
  {
    label: 'Publisher',
    key: FilterKey.Publisher,
  },
  {
    label: 'Year',
    key: FilterKey.Year,
  },
  {
    label: 'Pages',
    key: FilterKey.Pages,
  },
  {
    label: 'Language',
    key: FilterKey.Language,
  },
  {
    label: 'Extension',
    key: FilterKey.Extension,
  },
];

export type FilterRecord = Record<FilterKey, string>;
