import { InputHTMLAttributes, forwardRef, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, File } from 'lucide-react';
import Button from './Button';

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: string;
    error?: string;
    onChange?: (files: FileList | null) => void;
    maxSize?: number; // em MB
    acceptedTypes?: string;
    showPreview?: boolean;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
    ({ className, label, error, onChange, maxSize, acceptedTypes, showPreview = true, id, ...props }, ref) => {
        const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
        const [dragActive, setDragActive] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        const handleFiles = (files: FileList | null) => {
            if (!files) return;

            const filesArray = Array.from(files);

            if (maxSize) {
                const validFiles = filesArray.filter(file => file.size <= maxSize * 1024 * 1024);
                if (validFiles.length !== filesArray.length) {
                    alert(`Alguns arquivos excedem o tamanho máximo de ${maxSize}MB`);
                }
                setSelectedFiles(validFiles);
            } else {
                setSelectedFiles(filesArray);
            }

            onChange?.(files);
        };

        const handleDrag = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === 'dragenter' || e.type === 'dragover') {
                setDragActive(true);
            } else if (e.type === 'dragleave') {
                setDragActive(false);
            }
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
        };

        const removeFile = (index: number) => {
            const newFiles = selectedFiles.filter((_, i) => i !== index);
            setSelectedFiles(newFiles);
        };

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                        'relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded cursor-pointer transition-colors',
                        dragActive ? 'border-primary bg-primary-50' : 'border-gray-300 hover:border-gray-400',
                        error && 'border-red-500',
                        className
                    )}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        id={inputId}
                        ref={(e) => {
                            if (typeof ref === 'function') ref(e);
                            else if (ref) ref.current = e;
                            (inputRef as any).current = e;
                        }}
                        type="file"
                        className="hidden"
                        accept={acceptedTypes}
                        onChange={(e) => handleFiles(e.target.files)}
                        {...props}
                    />
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                        Arraste arquivos ou <span className="text-primary font-medium">clique para selecionar</span>
                    </p>
                    {maxSize && (
                        <p className="text-xs text-gray-500 mt-1">Tamanho máximo: {maxSize}MB</p>
                    )}
                </div>

                {showPreview && selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;
