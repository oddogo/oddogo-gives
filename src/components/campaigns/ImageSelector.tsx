
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Search, X } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface ImageSelectorProps {
  imageUrl: string | null;
  onImageSelected: (url: string) => void;
}

export const ImageSelector = ({ imageUrl, onImageSelected }: ImageSelectorProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Preview the currently selected image (either from URL or file)
  const imagePreview = imageUrl || (selectedFile ? URL.createObjectURL(selectedFile) : null);

  // Clean up object URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (selectedFile) URL.revokeObjectURL(URL.createObjectURL(selectedFile));
    };
  }, [selectedFile, imageUrl]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Clear any existing image URL
      if (imageUrl) onImageSelected("");
    }
  };

  // Handle file upload to Supabase storage
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      // Generate a unique filename with original extension
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, selectedFile);

      if (error) {
        console.error("Error uploading image:", error);
        toast.error(`Upload failed: ${error.message}`);
        setUploading(false);
        return;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(fileName);
      
      onImageSelected(publicUrl);
      setSelectedFile(null);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error in upload process:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle image search using Unsplash
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      setSearchResults([]);
      
      const response = await supabase.functions.invoke('unsplash-search', {
        body: { query: searchQuery.trim() },
      });
      
      if (response.error) {
        console.error("Search error:", response.error);
        toast.error(`Search failed: ${response.error.message || 'Unknown error'}`);
        return;
      }
      
      setSearchResults(response.data?.results || []);
    } catch (error: any) {
      console.error("Error in search process:", error);
      toast.error(`Search failed: ${error.message || 'Unknown error'}`);
    } finally {
      setSearching(false);
    }
  };

  // Handle selecting an image from search results
  const selectSearchResult = (imageUrl: string) => {
    onImageSelected(imageUrl);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Clear the current image
  const clearImage = () => {
    onImageSelected("");
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative">
          <img 
            src={imagePreview} 
            alt="Selected" 
            className="w-full h-48 object-cover rounded-md" 
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload section */}
      {!imagePreview && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary transition-colors">
            <Input 
              type="file" 
              id="image-upload" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm font-medium">Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (max 5MB)</p>
            </label>
          </div>
          
          {selectedFile && (
            <div className="flex justify-center">
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          )}

          {/* Search section */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Or search for free images</p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {searchResults.map((result, index) => (
            <div 
              key={index} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => selectSearchResult(result.urls.regular)}
            >
              <img 
                src={result.urls.small} 
                alt={result.alt_description || "Unsplash image"} 
                className="w-full h-32 object-cover rounded-md"
              />
              <p className="text-xs text-gray-400 mt-1">
                Photo by <a 
                  href={`https://unsplash.com/@${result.user.username}?utm_source=campaign_app&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {result.user.name}
                </a> on <a 
                  href="https://unsplash.com/?utm_source=campaign_app&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  Unsplash
                </a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
