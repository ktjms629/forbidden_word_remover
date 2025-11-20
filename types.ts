
export interface ProductRow {
  '상품코드': string;
  '키워드': string;
  '*상품명': string;
  '금지어가 제거된 상품명': string;
  [key: string]: string; // Allow other properties dynamically
}

export interface CsvData {
  meta: {
    fields: string[];
  };
  data: ProductRow[];
  errors: any[];
}
