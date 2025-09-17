import React from "react";

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <label className={`relative block cursor-pointer ${className}`}>
      {children ? children : <span>{label || "Upload File"}</span>}

      <input
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
