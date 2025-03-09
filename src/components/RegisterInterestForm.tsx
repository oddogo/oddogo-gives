
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const RegisterInterestForm = () => {
  const [type, setType] = useState<'Charity' | 'Donor'>('Donor');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    charityName: '',
    charityNumber: '',
    message: '',
    optIn: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('register_interest')
        .insert({
          type,
          full_name: formData.fullName,
          email: formData.email,
          charity_name: type === 'Charity' ? formData.charityName : null,
          charity_number: type === 'Charity' ? parseInt(formData.charityNumber) || null : null,
          message: formData.message,
          opt_in: formData.optIn,
          source: 'oddogo.gives'
        });

      if (error) throw error;

      toast.success("Thank you for your interest!");
      setFormData({
        fullName: '',
        email: '',
        charityName: '',
        charityNumber: '',
        message: '',
        optIn: false
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup value={type} onValueChange={(value: 'Charity' | 'Donor') => setType(value)} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Donor" id="donor" />
          <Label htmlFor="donor">Register as a Person</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Charity" id="charity" />
          <Label htmlFor="charity">Register as a Charity</Label>
        </div>
      </RadioGroup>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        {type === 'Charity' && (
          <>
            <div>
              <Label htmlFor="charityName">Charity Name</Label>
              <Input
                id="charityName"
                value={formData.charityName}
                onChange={(e) => setFormData(prev => ({ ...prev, charityName: e.target.value }))}
                required={type === 'Charity'}
              />
            </div>

            <div>
              <Label htmlFor="charityNumber">Charity Number</Label>
              <Input
                id="charityNumber"
                value={formData.charityNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, charityNumber: e.target.value }))}
                required={type === 'Charity'}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="optIn"
            checked={formData.optIn}
            onChange={(e) => setFormData(prev => ({ ...prev, optIn: e.target.checked }))}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="optIn">I agree to receive updates about Oddogo</Label>
        </div>
      </div>

      <Button type="submit" className="w-full">Get Updates</Button>

      <p className="text-sm text-gray-300 mt-4 text-center">
        Your privacy is important to us. We'll only use your information to send you updates about Oddogo and will never share it with third parties. You can unsubscribe at any time.
      </p>
    </form>
  );
};
