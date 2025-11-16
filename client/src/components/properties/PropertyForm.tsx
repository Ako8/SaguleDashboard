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
import { queryClient, buildApiUrl } from "@/lib/queryClient";
import type { Property, PropertyType, City, Amenity, Picture, Availability, Room, RoomType, AmenityCategory } from "@shared/schema";
import { propertyFormSchema, roomFormSchema } from "@shared/schema";
import { ImageUpload } from "./ImageUpload";

// Helper function to decode JWT token and extract user ID
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Try different possible claim paths
    if (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) {
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'].toString();
    }
    if (payload.userId) {
      return payload.userId.toString();
    }
    if (payload.sub) {
      return payload.sub.toString();
    }
    if (payload.id) {
      return payload.id.toString();
    }
    
    return null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

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
  
  // Room form
  const roomForm = useForm<z.infer<typeof roomFormSchema>>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      roomTypeId: 0,
      availibilityId: 1,
      capacity: undefined,
      bedsCount: undefined,
      description: "",
    },
  });

  // Amenity form
  const amenityForm = useForm<{
    name: string;
    icon: string;
    amenityCategoryId: number;
  }>({
    defaultValues: {
      name: "",
      icon: "",
      amenityCategoryId: 0,
    },
  });

  // Fetch reference data
  const { data: propertyTypes = [] } = useQuery<PropertyType[]>({
    queryKey: ['/api/propertytype'],
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/city'],
  });

  const { data: amenities = [] } = useQuery<Amenity[]>({
    queryKey: ['/api/amenity'],
  });

  const { data: amenityCategories = [] } = useQuery<AmenityCategory[]>({
    queryKey: ['/api/AmenityCategory'],
  });

  const { data: availabilities = [] } = useQuery<Availability[]>({
    queryKey: ['/api/Availibility'],
  });

  const { data: roomTypes = [] } = useQuery<RoomType[]>({
    queryKey: ['/api/RoomType'],
  });

  // Fetch existing rooms for the property
  const { data: rooms = [], refetch: refetchRooms } = useQuery<Room[]>({
    queryKey: ['/api/room/property', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const token = localStorage.getItem('auth_token');
      const url = buildApiUrl(`/api/room/property/${propertyId}`);
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch rooms');
      return await res.json();
    },
    enabled: isEditMode && !!propertyId && open,
  });

  // Fetch property data if editing
  const { data: property } = useQuery<Property>({
    queryKey: ['/api/property', propertyId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const url = buildApiUrl(`/api/property/${propertyId}`);
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch property');
      return await res.json();
    },
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
      availibilityId: 1,
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
          minNight: property.minNight || 1,
          maxNight: property.maxNight || 30,
          checkInTime: property.checkInTime || "14:00:00",
          checkOutTime: property.checkOutTime || "11:00:00",
          mapLocation: property.mapLocation || "",
          availibilityId: property.availabilityId || 1,
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
          availibilityId: 1,
        });
      }
      setActiveTab("basic");
    }
  }, [open, property, isEditMode, form]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof propertyFormSchema>) => {
      const token = localStorage.getItem('auth_token');
      const userId = getUserIdFromToken(token);
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
      
      const path = isEditMode ? `/api/property/${propertyId}` : '/api/property';
      const url = buildApiUrl(path);
      const method = isEditMode ? 'PUT' : 'POST';

      // Include hostId in the payload
      const payload = {
        ...data,
        hostId: userId,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
      queryClient.invalidateQueries({ queryKey: ['/api/property'] });
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

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (data: z.infer<typeof roomFormSchema>) => {
      if (!propertyId) {
        throw new Error('Property ID is required');
      }
      
      const token = localStorage.getItem('auth_token');
      const url = buildApiUrl('/api/Room');
      
      const payload = {
        propertyId: propertyId,
        roomTypeId: data.roomTypeId,
        availibilityId: data.availibilityId || 1,
        capacity: data.capacity || undefined,
        bedsCount: data.bedsCount || undefined,
        description: data.description || undefined,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create room');
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room added successfully",
      });
      refetchRooms();
      roomForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const token = localStorage.getItem('auth_token');
      const url = buildApiUrl(`/api/Room/${roomId}`);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete room');
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      refetchRooms();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof propertyFormSchema>) => {
    saveMutation.mutate(data);
  };

  const onRoomSubmit = (data: z.infer<typeof roomFormSchema>) => {
    createRoomMutation.mutate(data);
  };

  // Create amenity mutation
  const createAmenityMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; amenityCategoryId: number }) => {
      const token = localStorage.getItem('auth_token');
      const url = buildApiUrl('/api/Amenity');
      
      const payload = {
        name: data.name,
        icon: data.icon,
        amenityCategoryId: data.amenityCategoryId,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create amenity');
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Amenity added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/amenity'] });
      amenityForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAmenitySubmit = (data: { name: string; icon: string; amenityCategoryId: number }) => {
    createAmenityMutation.mutate(data);
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
                                  {type.name}
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
                      name="availibilityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability *</FormLabel>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-availability">
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availabilities.map((availability) => (
                                <SelectItem key={availability.id} value={availability.id.toString()}>
                                  {availability.name}
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
                {!isEditMode || !propertyId ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      Rooms can be added after the property is created.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Save the property first, then edit it to add rooms.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Add Room Form */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Add New Room</h3>
                      <Form {...roomForm}>
                        <form onSubmit={roomForm.handleSubmit(onRoomSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={roomForm.control}
                              name="roomTypeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room Type *</FormLabel>
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select room type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {roomTypes.map((type) => (
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
                              control={roomForm.control}
                              name="availibilityId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Availability</FormLabel>
                                  <Select
                                    value={field.value?.toString() || "1"}
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select availability" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {availabilities.map((availability) => (
                                        <SelectItem key={availability.id} value={availability.id.toString()}>
                                          {availability.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={roomForm.control}
                              name="capacity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Capacity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Number of people"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={roomForm.control}
                              name="bedsCount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Beds Count</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Number of beds"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={roomForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Room description"
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={createRoomMutation.isPending}
                          >
                            {createRoomMutation.isPending ? 'Adding...' : 'Add Room'}
                          </Button>
                        </form>
                      </Form>
                    </div>

                    {/* Existing Rooms List */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Existing Rooms</h3>
                      {rooms.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">No rooms added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {rooms.map((room) => {
                            const roomType = roomTypes.find(rt => rt.id === room.roomTypeId);
                            const availability = availabilities.find(a => a.id === room.availabilityId);
                            return (
                              <div key={room.id} className="border rounded-lg p-4 flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{roomType?.iconUrl || '🏠'}</span>
                                    <h4 className="font-medium">{roomType?.name || 'Unknown Room Type'}</h4>
                                    {availability && (
                                      <span className="text-xs bg-muted px-2 py-1 rounded">
                                        {availability.name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    {room.capacity && <p>Capacity: {room.capacity} people</p>}
                                    {room.bedsCount !== null && <p>Beds: {room.bedsCount}</p>}
                                    {room.description && <p>{room.description}</p>}
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteRoomMutation.mutate(room.id)}
                                  disabled={deleteRoomMutation.isPending}
                                >
                                  Delete
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 4: Amenities */}
              <TabsContent value="amenities" className="mt-4">
                <div className="space-y-6">
                  {/* Add Amenity Form */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Add New Amenity</h3>
                    <Form {...amenityForm}>
                      <form onSubmit={amenityForm.handleSubmit(onAmenitySubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={amenityForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amenity Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., WiFi, Pool, Parking"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={amenityForm.control}
                            name="icon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Icon *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., 📶, 🏊, 🚗"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={amenityForm.control}
                          name="amenityCategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select
                                value={field.value?.toString() || ""}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {amenityCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={createAmenityMutation.isPending}
                        >
                          {createAmenityMutation.isPending ? 'Adding...' : 'Add Amenity'}
                        </Button>
                      </form>
                    </Form>
                  </div>

                  {/* Existing Amenities List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Existing Amenities</h3>
                    {amenities.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No amenities added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {amenitiesByCategory && Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => (
                          <div key={category} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-3">{category}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {categoryAmenities.map((amenity) => (
                                <div key={amenity.id} className="flex items-center gap-2 p-2 border rounded">
                                  <span className="text-lg">{amenity.icon}</span>
                                  <span className="text-sm">{amenity.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
