
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { ImageSelector } from "./ImageSelector";

const campaignFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  target_amount: z.coerce
    .number()
    .min(1, "Target amount must be greater than 0"),
  end_date: z.date().optional(),
  image_url: z.string().url("Please enter a valid URL").optional().nullable(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  campaign?: Campaign;
  onSuccess?: () => void;
}

export const CampaignForm = ({ campaign, onSuccess }: CampaignFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues = campaign 
    ? {
        title: campaign.title,
        description: campaign.description || "",
        target_amount: campaign.target_amount / 100, // Convert from cents to pounds/dollars
        end_date: campaign.end_date ? new Date(campaign.end_date) : undefined,
        image_url: campaign.image_url,
      }
    : {
        title: "",
        description: "",
        target_amount: 100, // Default 100 pounds/dollars
        end_date: undefined,
        image_url: "",
      };

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  });

  // Set image URL from ImageSelector component
  const handleImageSelected = (url: string) => {
    form.setValue("image_url", url || null, { 
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const onSubmit = async (values: CampaignFormValues) => {
    try {
      setIsSubmitting(true);
      const amountInCents = Math.round(values.target_amount * 100);
      
      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Authentication error:", authError);
        toast.error("Authentication error. Please try logging in again.");
        navigate("/auth");
        return;
      }
      
      if (!user) {
        toast.error("You must be logged in to create a campaign");
        navigate("/auth");
        return;
      }
      
      console.log("Creating campaign with data:", {
        ...values, 
        target_amount: amountInCents,
        user_id: user.id
      });
      
      // Prepare the data
      const campaignData = {
        title: values.title,
        description: values.description,
        target_amount: amountInCents,
        end_date: values.end_date?.toISOString(),
        image_url: values.image_url || null,
        user_id: user.id // Add the user_id
      };
      
      if (campaign) {
        // Update existing campaign
        const { data, error } = await supabase
          .from("campaigns")
          .update(campaignData)
          .eq("id", campaign.id)
          .select();
          
        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message || "Error updating campaign");
        }
        
        console.log("Campaign updated successfully:", data);
        toast.success("Campaign updated successfully");
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from("campaigns")
          .insert(campaignData)
          .select("slug")
          .single();
          
        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message || "Error creating campaign");
        }
        
        console.log("Campaign created successfully:", data);
        toast.success("Campaign created successfully");
        
        // Navigate to the new campaign page
        if (data?.slug) {
          navigate(`/campaigns/${data.slug}`);
        }
      }
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast.error(error.message || "Failed to save campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter campaign title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your campaign and its purpose"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Image selection field */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Image</FormLabel>
              <FormControl>
                <ImageSelector 
                  imageUrl={field.value || null} 
                  onImageSelected={handleImageSelected}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount (£)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    min={1}
                    step={1}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {campaign ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              campaign ? 'Update Campaign' : 'Create Campaign'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
