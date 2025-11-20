
import React, { useState, useEffect, useCallback } from 'react';
import { parseCsvFile, generateCsvString } from '@/services/csvService';
import FileUpload from '@/components/FileUpload';
import ProductTable from '@/components/ProductTable';
import { ProductRow } from '@/types';

const App: React.FC = () => {
  const [forbiddenWordsFile, setForbiddenWordsFile] = useState<File | null>(null);
  const [productDataFile, setProductDataFile] = useState<File | null>(null);
  const [forbiddenWords, setForbiddenWords] = useState<Set<string>>(new Set());
  const [originalProductData, setOriginalProductData] = useState<ProductRow[]>([]);
  const [processedProductData, setProcessedProductData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const PRODUCT_NAME_COLUMN = '*상품명';
  const CLEANED_PRODUCT_NAME_COLUMN = '금지어가 제거된 상품명';

  // Memoized function to parse forbidden words file
  const processForbiddenWordsFile = useCallback(async () => {
    if (!forbiddenWordsFile) {
      setForbiddenWords(new Set());
      return;
    }
    try {
      const parsed = await parseCsvFile(forbiddenWordsFile);
      const words = new Set<string>();
      // Assuming forbidden words are in the first column of `금지어.csv`
      if (parsed.data && parsed.data.length > 0 && parsed.meta.fields && parsed.meta.fields.length > 0) {
        const forbiddenColumn = parsed.meta.fields[0]; // Get the first column name, e.g., '금지어'
        parsed.data.forEach(row => {
          const word = row[forbiddenColumn];
          if (word) {
            words.add(String(word).trim());
          }
        });
      }
      setForbiddenWords(words);
      setError(null);
    } catch (e: any) {
      setError(`Error parsing forbidden words file: ${e.message}`);
      setForbiddenWords(new Set());
    }
  }, [forbiddenWordsFile]);

  // Memoized function to parse product data file
  const processProductDataFile = useCallback(async () => {
    if (!productDataFile) {
      setOriginalProductData([]);
      setProcessedProductData([]);
      return;
    }
    try {
      const parsed = await parseCsvFile(productDataFile);
      setOriginalProductData(parsed.data);
      // Initialize processed data with original, add the new column if it doesn't exist
      const initialProcessedData = parsed.data.map(row => ({
        ...row,
        [CLEANED_PRODUCT_NAME_COLUMN]: row[PRODUCT_NAME_COLUMN] || '',
      }));
      setProcessedProductData(initialProcessedData);
      setError(null);
    } catch (e: any) {
      setError(`Error parsing product data file: ${e.message}`);
      setOriginalProductData([]);
      setProcessedProductData([]);
    }
  }, [productDataFile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    processForbiddenWordsFile();
  }, [processForbiddenWordsFile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    processProductDataFile();
  }, [processProductDataFile]);

  const handleProcess = useCallback(() => {
    if (forbiddenWords.size === 0 || originalProductData.length === 0) {
      setError('Please upload both files and ensure they contain data.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build a single regex pattern for all forbidden words for efficiency
      // Escaping each word prevents regex special characters from breaking the pattern
      const forbiddenPattern = new RegExp(
        Array.from(forbiddenWords)
             .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
             .join('|'),
        'gi' // global and case-insensitive
      );

      const newProcessedData = originalProductData.map(row => {
        const originalName = row[PRODUCT_NAME_COLUMN] || '';
        const cleanedName = originalName.replace(forbiddenPattern, '').trim();
        return {
          ...row,
          [CLEANED_PRODUCT_NAME_COLUMN]: cleanedName,
        };
      });
      setProcessedProductData(newProcessedData);
    } catch (e: any) {
      setError(`Error during processing: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [forbiddenWords, originalProductData]);

  const handleDownload = () => {
    if (processedProductData.length === 0) {
      setError('No processed data to download.');
      return;
    }

    // Get all unique fields from the processed data to ensure all columns are present
    const allFields = Array.from(new Set(processedProductData.flatMap(row => Object.keys(row))));
    const csv = generateCsvString(processedProductData, allFields);
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' }); // Add BOM for UTF-8 compatibility
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `processed_${productDataFile?.name || 'product_data'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const isProcessEnabled = forbiddenWordsFile && productDataFile && !loading;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gray-100">
      <header className="w-full max-w-5xl text-center py-8">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight leading-tight sm:text-5xl lg:text-6xl">
          Forbidden Word Remover
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Upload your forbidden word list and product data to clean product names efficiently.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-6 md:gap-8 lg:gap-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            id="forbidden-words-upload"
            label="Upload Forbidden Words (금지어.csv)"
            accept=".csv"
            onFileChange={setForbiddenWordsFile}
            currentFile={forbiddenWordsFile}
            disabled={loading}
          />
          <FileUpload
            id="product-data-upload"
            label="Upload Product Data (delete_product_name.csv)"
            accept=".csv"
            onFileChange={setProductDataFile}
            currentFile={productDataFile}
            disabled={loading}
          />
        </section>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 md:mt-6">
          <button
            onClick={handleProcess}
            disabled={!isProcessEnabled}
            className={`px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 
                        ${isProcessEnabled
                          ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } flex items-center justify-center`}
          >
            {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>}
            Process Files
          </button>
          <button
            onClick={handleDownload}
            disabled={processedProductData.length === 0 || loading}
            className={`px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 
                        ${(processedProductData.length > 0 && !loading)
                          ? 'bg-green-600 text-white shadow-md hover:bg-green-700 active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } flex items-center justify-center`}
          >
            Download Processed CSV
          </button>
        </div>

        <ProductTable
          products={processedProductData}
          originalColumn={PRODUCT_NAME_COLUMN}
          processedColumn={CLEANED_PRODUCT_NAME_COLUMN}
          title="Processed Product Data"
        />
      </main>

      <footer className="w-full max-w-5xl text-center py-8 mt-10 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Forbidden Word Remover. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
