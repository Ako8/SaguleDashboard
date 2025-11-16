import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, buildApiUrl } from "@/lib/queryClient";
import type { Property, PropertyType, City } from "@shared/schema";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch data
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/property'],
  });

  const { data: propertyTypes = [] } = useQuery<PropertyType[]>({
    queryKey: ['/api/propertytype'],
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/city'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('auth_token');
      const url = buildApiUrl(`/api/property/${id}`);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete property');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/property'] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      setDeleteDialogOpen(false);
      setDeletingPropertyId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !selectedCity || property.cityId.toString() === selectedCity;
      const matchesType = !selectedType || property.propertyTypeId.toString() === selectedType;
      return matchesSearch && matchesCity && matchesType;
    });
  }, [properties, searchTerm, selectedCity, selectedType]);

  const handleAddProperty = () => {
    setEditingPropertyId(null);
    setFormOpen(true);
  };

  const handleEditProperty = (id: number) => {
    setEditingPropertyId(id);
    setFormOpen(true);
  };

  const handleDeleteProperty = (id: number) => {
    setDeletingPropertyId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPropertyId) {
      deleteMutation.mutate(deletingPropertyId);
    }
  };

  const getPropertyTypeName = (typeId: number) => {
    return propertyTypes.find(t => t.id === typeId)?.name || 'Unknown';
  };

  const getPropertyTypeIcon = (typeId: number) => {
    return propertyTypes.find(t => t.id === typeId)?.iconUrl || '🏠';
  };

  const getCityName = (cityId: number) => {
    return cities.find(c => c.id === cityId)?.name || 'Unknown';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-background">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-testid="input-search-properties"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCity || "all"} onValueChange={(value) => setSelectedCity(value === "all" ? "" : value)}>
            <SelectTrigger data-testid="select-city-filter" className="w-full sm:w-40">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType || "all"} onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}>
            <SelectTrigger data-testid="select-type-filter" className="w-full sm:w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            data-testid="button-add-property"
            onClick={handleAddProperty}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="flex-1 overflow-auto p-4">
        {propertiesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading properties...</div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Home className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No properties found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm || selectedCity || selectedType
                ? "Try adjusting your filters"
                : "Get started by adding your first property"}
            </p>
            {!searchTerm && !selectedCity && !selectedType && (
              <Button onClick={handleAddProperty} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                propertyTypeName={getPropertyTypeName(property.propertyTypeId)}
                propertyTypeIcon={getPropertyTypeIcon(property.propertyTypeId)}
                cityName={getCityName(property.cityId)}
                onEdit={() => handleEditProperty(property.id)}
                onDelete={() => handleDeleteProperty(property.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Form Dialog */}
      <PropertyForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        propertyId={editingPropertyId}
        onSave={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['/api/property'] });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-property">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
              All associated rooms and pictures will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  propertyTypeName: string;
  propertyTypeIcon: string;
  cityName: string;
  onEdit: () => void;
  onDelete: () => void;
}

function PropertyCard({
  property,
  propertyTypeName,
  propertyTypeIcon,
  cityName,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  // In a real app, we would fetch the property's images
  // For now, show a placeholder
  const hasImage = false;

  return (
    <Card data-testid={`card-property-${property.id}`} className="hover-elevate overflow-hidden">
      <CardHeader className="p-0">
        {hasImage ? (
          <img
            src="/placeholder-property.jpg"
            alt={property.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {property.availabilityId === 1 ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-lg line-clamp-1" data-testid={`text-property-name-${property.id}`}>
            {property.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {propertyTypeIcon} {propertyTypeName}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {property.address}, {cityName}
        </p>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-semibold text-primary">
              ${property.price}
            </span>
            <span className="text-sm text-muted-foreground">/night</span>
          </div>
          {property.minNight && property.minNight > 1 && (
            <span className="text-xs text-muted-foreground">
              Min {property.minNight} nights
            </span>
          )}
        </div>

        {property.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          data-testid={`button-edit-property-${property.id}`}
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          data-testid={`button-delete-property-${property.id}`}
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="flex-1"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
