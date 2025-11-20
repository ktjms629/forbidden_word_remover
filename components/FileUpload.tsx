
import React from 'react';

interface FileUploadProps {
  id: string;
  label: string;
  accept: string;
  onFileChange: (file: File | null) => void;
  currentFile: File | null;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  accept,
  onFileChange,
  currentFile,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileChange(event.target.files[0]);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 bg-white shadow-sm hover:border-blue-500 transition-colors duration-200">
      <label htmlFor={id} className="block text-lg font-semibold mb-2 cursor-pointer">
        {label}
      </label>
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      {currentFile ? (
        <span className="text-sm text-blue-600 truncate max-w-full">
          Selected: <span className="font-medium">{currentFile.name}</span>
        </span>
      ) : (
        <span className="text-sm text-gray-500">No file selected.</span>
      )}
    </div>
  );
};

export default FileUpload;
