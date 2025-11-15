import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Property, PropertyType, City, Amenity, Picture } from "@shared/schema";
import { propertyFormSchema } from "@shared/schema";
import { ImageUpload } from "./ImageUpload";

interface PropertyFormProps {
  open: boolean;
  onClose: () => void;
  propertyId: number | null;
  onSave: () => void;
}

export function PropertyForm({ open, onClose, propertyId, onSave }: PropertyFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  const isEditMode = propertyId !== null;

  // Fetch reference data
  const { data: propertyTypes = [] } = useQuery<PropertyType[]>({
    queryKey: ['/api/property-types'],
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/cities'],
  });

  const { data: amenities = [] } = useQuery<Amenity[]>({
    queryKey: ['/api/amenities'],
  });

  // Fetch property data if editing
  const { data: property } = useQuery<Property>({
    queryKey: ['/api/properties', propertyId],
    enabled: isEditMode && open,
  });

  // Form
  const form = useForm<z.infer<typeof propertyFormSchema>>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      propertyTypeId: 0,
      cityId: 0,
      price: 0,
      minNight: 1,
      maxNight: 30,
      checkInTime: "14:00:00",
      checkOutTime: "11:00:00",
      mapLocation: "",
    },
  });

  // Reset form when opening or property changes
  useEffect(() => {
    if (open) {
      if (property && isEditMode) {
        form.reset({
          name: property.name,
          description: property.description || "",
          address: property.address,
          propertyTypeId: property.propertyTypeId,
          cityId: property.cityId,
          price: property.price,
          minNight: property.minNight,
          maxNight: property.maxNight,
          checkInTime: property.checkInTime,
          checkOutTime: property.checkOutTime,
          mapLocation: property.mapLocation || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          address: "",
          propertyTypeId: 0,
          cityId: 0,
          price: 0,
          minNight: 1,
          maxNight: 30,
          checkInTime: "14:00:00",
          checkOutTime: "11:00:00",
          mapLocation: "",
        });
      }
      setActiveTab("basic");
    }
  }, [open, property, isEditMode, form]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof propertyFormSchema>) => {
      const token = localStorage.getItem('token');
      const url = isEditMode ? `/api/properties/${propertyId}` : '/api/properties';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save property');
      }

      if (!isEditMode) {
        return await res.json(); // Returns { id: number }
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Property ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      onSave();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof propertyFormSchema>) => {
    saveMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Group amenities by category
  const amenitiesByCategory = amenities.reduce((acc, amenity) => {
    const category = amenity.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-property-form">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" data-testid="tab-basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
                <TabsTrigger value="rooms" data-testid="tab-rooms">Rooms</TabsTrigger>
                <TabsTrigger value="amenities" data-testid="tab-amenities">Amenities</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Information */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Name *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-property-name"
                              placeholder="Enter property name"
                              {...field}
                            />
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
                              data-testid="input-property-description"
                              placeholder="Enter property description"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-property-address"
                              placeholder="Enter property address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="propertyTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type *</FormLabel>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-property-type">
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.iconUrl} {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-city">
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Night *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                data-testid="input-property-price"
                                type="number"
                                placeholder="0"
                                className="pl-7"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minNight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Nights</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-min-nights"
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxNight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Nights</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-max-nights"
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Time</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-checkin-time"
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Time</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-checkout-time"
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Photos */}
              <TabsContent value="photos" className="mt-4">
                {isEditMode && propertyId ? (
                  <ImageUpload propertyId={propertyId} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Save the property first to upload photos.</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Rooms */}
              <TabsContent value="rooms" className="mt-4">
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Rooms can be added after the property is created.
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Save the property first, then edit it to add rooms.
                  </p>
                </div>
              </TabsContent>

              {/* Tab 4: Amenities */}
              <TabsContent value="amenities" className="mt-4">
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Amenity management coming soon
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    You'll be able to assign amenities to properties in a future update
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Dialog Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                data-testid="button-cancel-property-form"
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                data-testid="button-save-property"
                type="submit"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
