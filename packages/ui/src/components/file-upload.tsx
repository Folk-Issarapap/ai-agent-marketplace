'use client';

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from 'lucide-react';

import { useFileUpload, type FileWithPreview } from '@workspace/ui/hooks/use-file-upload';
import { Button } from '@workspace/ui/components/button';

interface FileUploadProps {
  accept?: string; // Default: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif"
  maxSizeMB?: number; // Default: 2
  dropLabel?: string; // Default: "Drop your image here"
  selectLabel?: string; // Default: "Select image"
  removeLabel?: string; // Default: "Remove image"
  description?: string; // Optional description text
  acceptedTypesLabel?: string; // Default: "SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)"
  defaultFileUrl?: string; // Optional default/preview URL
  onFileChange?: (file: File | null) => void; // Callback when file changes
}

export function FileUpload({
  accept = 'image/svg+xml,image/png,image/jpeg,image/jpg,image/gif',
  maxSizeMB = 2,
  dropLabel = 'Drop your image here',
  selectLabel = 'Select image',
  removeLabel = 'Remove image',
  description,
  acceptedTypesLabel,
  defaultFileUrl,
  onFileChange,
}: FileUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept,
    maxSize,
    onFilesChange: (updatedFiles: FileWithPreview[]) => {
      const file = updatedFiles[0]?.file;
      onFileChange?.(file instanceof File ? file : null);
    },
  });

  const previewUrl = files[0]?.preview || defaultFileUrl || null;
  const fileName = files[0]?.file.name || null;

  // Generate accepted types label with maxSizeMB if not provided
  const displayAcceptedTypesLabel =
    acceptedTypesLabel || `SVG, PNG, JPG or GIF (max. ${maxSizeMB}MB)`;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input {...getInputProps()} className="sr-only" aria-label="Upload image file" />

          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt={fileName || 'Uploaded image'}
                className="mx-auto max-h-full rounded object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">{dropLabel}</p>
              <p className="text-xs text-muted-foreground">{displayAcceptedTypesLabel}</p>
              <Button variant="outline" className="mt-4" onClick={openFileDialog}>
                <UploadIcon className="-ms-1 size-4 opacity-60" aria-hidden="true" />
                {selectLabel}
              </Button>
            </div>
          )}
        </div>

        {previewUrl && files[0] && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={() => removeFile(files[0]!.id)}
              aria-label={removeLabel}
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-destructive" role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {description && (
        <p className="mt-2 text-center text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
