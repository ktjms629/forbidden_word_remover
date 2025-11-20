
import React from 'react';
import { ProductRow } from '@/types';

interface ProductTableProps {
  products: ProductRow[];
  originalColumn: keyof ProductRow;
  processedColumn: keyof ProductRow;
  title: string;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  originalColumn,
  processedColumn,
  title,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600 mt-6 md:mt-8 lg:mt-10">
        No product data to display. Please upload a product CSV file and process it.
      </div>
    );
  }

  // Ensure unique keys for table rows
  const generateKey = (row: ProductRow, index: number) => 
    `product-${row['상품코드'] || index}-${row['*상품명'] || index}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6 md:mt-8 lg:mt-10 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">{title}</h2>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original Product Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cleaned Product Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr key={generateKey(product, index)}>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900 break-words max-w-xs sm:max-w-md">
                  {product[originalColumn]}
                </td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 font-medium break-words max-w-xs sm:max-w-md">
                  {product[processedColumn]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
