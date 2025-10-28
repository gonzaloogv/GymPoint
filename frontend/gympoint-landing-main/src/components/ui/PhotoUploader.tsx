import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui';
import { useTheme } from '../../hooks';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 10,
}) => {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'gympoint/gyms');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Error al subir la imagen');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (photos.length + acceptedFiles.length > maxPhotos) {
        alert(`Máximo ${maxPhotos} fotos permitidas`);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const uploadPromises = acceptedFiles.map(async (file, index) => {
          const url = await uploadToCloudinary(file);
          setUploadProgress(((index + 1) / acceptedFiles.length) * 100);
          return url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        onPhotosChange([...photos, ...uploadedUrls]);
      } catch (error) {
        console.error('Error uploading photos:', error);
        alert('Error al subir las fotos. Por favor, intenta nuevamente.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [photos, maxPhotos, onPhotosChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5242880, // 5MB
    multiple: true,
    disabled: uploading || photos.length >= maxPhotos,
    noClick: false,
    noKeyboard: false,
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-secondary bg-secondary/10' : 
            theme === 'light' 
              ? 'border-gray-300 hover:border-secondary' 
              : 'border-gray-600 hover:border-secondary'
          }
          ${uploading || photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <p className={`mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Subiendo fotos... {Math.round(uploadProgress)}%
            </p>
            <div className={`w-full rounded-full h-2 ${
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            }`}>
              <div
                className="bg-secondary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div>
            <svg
              className={`mx-auto h-12 w-12 ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className={`mt-2 text-sm ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {isDragActive
                ? '¡Suelta las fotos aquí!'
                : 'Arrastra fotos aquí o haz clic para seleccionar'}
            </p>
            <p className={`text-xs mt-1 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              PNG, JPG, WEBP hasta 5MB ({photos.length}/{maxPhotos} fotos)
            </p>
          </div>
        )}
      </div>

      {/* Preview de Fotos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className={`p-4 rounded-lg ${
        theme === 'light' 
          ? 'bg-blue-100 border border-blue-300' 
          : 'bg-blue-900/30 border border-blue-700'
      }`}>
        <p className={`text-sm ${
          theme === 'light' ? 'text-blue-900' : 'text-blue-200'
        }`}>
          💡 <strong>Tip:</strong> Los gimnasios con fotos reciben hasta{' '}
          <strong>7x más visitas</strong> que aquellos sin imágenes.
        </p>
      </div>
    </div>
  );
};