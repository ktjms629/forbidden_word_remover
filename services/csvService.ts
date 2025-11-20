
import Papa from 'papaparse';
import { ProductRow, CsvData } from '../types';

/**
 * Parses a CSV file into a structured object using PapaParse.
 * @param file The File object to parse.
 * @returns A Promise that resolves with the parsed CsvData.
 */
export const parseCsvFile = (file: File): Promise<CsvData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'utf-8-sig', // Handles BOM for UTF-8 files
      complete: (results: Papa.ParseResult<ProductRow>) => {
        resolve({
          meta: results.meta,
          data: results.data.filter(row => Object.values(row).some(value => value !== null && value !== undefined && String(value).trim() !== '')),
          errors: results.errors,
        });
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

/**
 * Generates a CSV string from an array of data.
 * @param data The array of data objects to convert to CSV.
 * @param fields Optional array of field names to include as headers.
 * @returns The generated CSV string.
 */
export const generateCsvString = (data: ProductRow[], fields?: string[]): string => {
  return Papa.unparse(data, {
    header: true,
    columns: fields,
  });
};
