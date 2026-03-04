'use client';

import { Camera, CircleUserRoundIcon, XIcon } from 'lucide-react';

import { useFileUpload } from '@workspace/ui/hooks/use-file-upload';
import { Button } from '@workspace/ui/components/button';

interface AvatarUploadProps {
  uploadLabel?: string;
  changeLabel?: string;
  removeLabel?: string;
  description?: string;
  defaultImageUrl?: string;
  onFileChange?: (file: File | null) => void;
  onRemove?: () => void;
}

export function AvatarUpload({
  uploadLabel = 'Upload image',
  changeLabel = 'Change image',
  removeLabel = 'Remove image',
  description,
  defaultImageUrl,
  onFileChange,
  onRemove,
}: AvatarUploadProps) {
  const [
    { files, isDragging },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: 'image/*',
    onFilesChange: (updatedFiles) => {
      const file = updatedFiles[0]?.file;
      onFileChange?.(file instanceof File ? file : null);
    },
  });

  const previewUrl = files[0]?.preview || defaultImageUrl || null;
  const hasUploadedFile = !!files[0];
  const hasDefaultImage = !!defaultImageUrl && !hasUploadedFile;

  const handleRemove = () => {
    if (hasUploadedFile && files[0]) {
      // Remove uploaded file from hook
      removeFile(files[0].id);
      // Notify parent that file is removed
      onFileChange?.(null);
    } else if (hasDefaultImage) {
      // Remove existing avatar (notify parent)
      onRemove?.();
      onFileChange?.(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        {/* Drop area */}
        <button
          type="button"
          className="group relative flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-input transition-colors outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none data-[dragging=true]:bg-accent/50"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={previewUrl ? changeLabel : uploadLabel}
        >
          {previewUrl ? (
            <>
              <img
                className="size-full object-cover"
                src={previewUrl}
                alt={files[0]?.file?.name || 'Avatar'}
                width={64}
                height={64}
                style={{ objectFit: 'cover' }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Camera className="size-5 text-white" aria-hidden="true" />
              </div>
            </>
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="size-4 opacity-60" />
            </div>
          )}
        </button>
        {previewUrl && (
          <Button
            type="button"
            onClick={handleRemove}
            size="icon"
            className="absolute -top-1 -right-1 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
            aria-label={removeLabel}
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
        />
      </div>
      {description && <p className="text-xs text-muted-foreground text-center">{description}</p>}
    </div>
  );
}
