import React from 'react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  className?: string;
  children?: React.ReactNode;
  required?: boolean; // 👈 add this
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onFileSelect,
  className,
  children,
  required,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Always reset input after selection to allow re-selection of same file
      // Use setTimeout to ensure the value is cleared after the event completes
      setTimeout(() => {
        if (e.target) {
          e.target.value = '';
        }
      }, 0);
    }
  };

  return (
    <label className={`relative block cursor-pointer ${className}`}>
      {children ? children : <span>{label || 'Upload File'}</span>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        required={required}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>
  );
};

export default FileUpload;
