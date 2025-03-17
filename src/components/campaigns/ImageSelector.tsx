
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Upload, Link, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
  };
  alt_description: string;
}

interface ImageSelectorProps {
  imageUrl: string | null;
  onImageSelected: (url: string) => void;
}

export const ImageSelector = ({ imageUrl, onImageSelected }: ImageSelectorProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UnsplashImage[]>([]);
  const [selectedUnsplashImage, setSelectedUnsplashImage] = useState<UnsplashImage | null>(null);
  const [manualUrl, setManualUrl] = useState(imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Handle file upload to Supabase storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload images.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(data.path);
      
      // Call the callback with the image URL
      onImageSelected(publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Search for images on Unsplash
  const searchUnsplash = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsSearching(true);
      
      // Use Supabase Edge Function to proxy the Unsplash API request
      // Fix: Pass the query parameter using the correct structure for FunctionInvokeOptions
      const { data, error } = await supabase.functions.invoke("unsplash-search", {
        body: { query: searchTerm }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to search for images");
      }
      
      setSearchResults(data?.results || []);
    } catch (error: any) {
      console.error("Error searching Unsplash:", error);
      toast({
        title: "Search failed",
        description: error.message || "Failed to search for images. Please try again.",
        variant: "destructive",
      });
      // Set empty results on error
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select an image from Unsplash search results
  const selectUnsplashImage = (image: UnsplashImage) => {
    setSelectedUnsplashImage(image);
    onImageSelected(image.urls.regular);
  };

  // Apply the manual URL
  const applyManualUrl = () => {
    if (!manualUrl.trim()) return;
    onImageSelected(manualUrl);
  };

  // Clear the current image
  const clearImage = () => {
    onImageSelected("");
    setManualUrl("");
    setSelectedUnsplashImage(null);
  };

  return (
    <div className="space-y-4">
      {/* Preview of the selected image */}
      {imageUrl && (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Campaign cover" 
            className="w-full h-64 object-cover rounded-md border border-white/10" 
          />
          <Button 
            variant="destructive" 
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X size={16} />
          </Button>
        </div>
      )}
      
      {/* Image selection tabs */}
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="upload">
            <Upload size={16} className="mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search size={16} className="mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link size={16} className="mr-2" />
            URL
          </TabsTrigger>
        </TabsList>
        
        {/* Upload tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Upload Image</Label>
            <Input 
              id="picture" 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Search tab */}
        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchUnsplash();
                }
              }}
            />
            <Button 
              onClick={searchUnsplash}
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </Button>
          </div>
          
          {isSearching && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {!isSearching && searchResults.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
              {searchResults.map((image) => (
                <div 
                  key={image.id}
                  onClick={() => selectUnsplashImage(image)}
                  className={`relative cursor-pointer rounded-md overflow-hidden border-2 hover:opacity-90 transition-all ${
                    selectedUnsplashImage?.id === image.id 
                      ? "border-primary" 
                      : "border-transparent"
                  }`}
                >
                  <img 
                    src={image.urls.small} 
                    alt={image.alt_description || "Unsplash image"} 
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                    Photo by {image.user.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isSearching && searchResults.length === 0 && searchTerm && (
            <div className="text-center py-4 text-muted-foreground">
              No images found. Try a different search term.
            </div>
          )}
        </TabsContent>
        
        {/* URL tab */}
        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyManualUrl();
                }
              }}
            />
            <Button 
              onClick={applyManualUrl}
              disabled={!manualUrl.trim()}
            >
              Apply
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
