import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ImageCropModal from './ImageCropModal';
import { uploadBlob } from '@/lib/speakerflow/api';
import { updateImageURL } from '@/lib/speakerflow/media';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: number;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Local replacement for OneHub's hub-settings ImageUploadField: pick a file,
 * crop it, then upload through the platform file endpoint.
 */
export function ImageUploadField({
  id,
  label,
  hint,
  value,
  onChange,
  aspectRatio,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleCropped = async (cropped: string) => {
    setRawImage(null);
    setUploading(true);
    try {
      const blob = await dataUrlToBlob(cropped);
      const url = await uploadBlob(`${id}.jpg`, blob);
      onChange(updateImageURL(url));
    } catch (err) {
      console.error('ImageUploadField upload failed:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> {value ? 'Replace image' : 'Upload image'}
            </>
          )}
        </Button>

        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {rawImage && (
        <ImageCropModal
          open
          imageSrc={rawImage}
          aspectRatio={aspectRatio}
          onClose={() => setRawImage(null)}
          onCropComplete={handleCropped}
        />
      )}
    </div>
  );
}