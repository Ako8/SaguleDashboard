import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Picture } from "@shared/schema";

interface ImageUploadProps {
  propertyId: number;
}

export function ImageUpload({ propertyId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Fetch existing pictures
  const { data: pictures = [], isLoading } = useQuery<Picture[]>({
    queryKey: ['/api/pictures', 'Property', propertyId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pictures/Property/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch pictures');
      return await res.json();
    },
    enabled: !!propertyId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pictures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete picture');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pictures', 'Property', propertyId] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  // Upload function
  const uploadFile = async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`/api/pictures?entityId=${propertyId}&entityType=Property`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Failed to upload image');
    }

    return await res.json();
  };

  // Handle file drop
  const onDrop = async (acceptedFiles: File[]) => {
    if (pictures.length + acceptedFiles.length > 10) {
      toast({
        title: "Error",
        description: "Maximum 10 images allowed per property",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/pictures', 'Property', propertyId] });
      toast({
        title: "Success",
        description: `${acceptedFiles.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading || pictures.length >= 10,
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading images...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${uploading || pictures.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
        `}
        data-testid="dropzone-image-upload"
      >
        <input {...getInputProps()} data-testid="input-image-upload" />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-medium">
              {isDragActive ? 'Drop files here' : 'Drag photos here or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Max 10 images, 5MB each
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: JPG, PNG, WEBP
            </p>
          </div>
          {!uploading && pictures.length < 10 && (
            <Button type="button" variant="outline" size="sm" className="mt-2">
              Browse Files
            </Button>
          )}
          {uploading && (
            <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
          )}
          {pictures.length >= 10 && (
            <p className="text-sm text-destructive mt-2">
              Maximum number of images reached
            </p>
          )}
        </div>
      </div>

      {/* Image Grid */}
      {pictures.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {pictures.map((picture, index) => (
            <div
              key={picture.id}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
              data-testid={`image-preview-${index}`}
            >
              <img
                src={picture.url}
                alt={picture.fileName}
                className="w-full h-full object-cover"
              />
              
              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Main Image
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleDelete(picture.id)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover-elevate"
                data-testid={`button-delete-image-${index}`}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="truncate">{picture.fileName}</p>
                <p className="text-muted-foreground">
                  {(picture.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {pictures.length === 0 && !uploading && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
          <p className="text-sm mt-1">Upload images to showcase your property</p>
        </div>
      )}
    </div>
  );
}
