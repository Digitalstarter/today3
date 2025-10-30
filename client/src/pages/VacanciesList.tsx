import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Building2, Euro, GraduationCap } from "lucide-react";
import type { Vacancy } from "@shared/schema";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";

export default function VacanciesList() {
  const [, setLocation] = useLocation();
  const [locationFilter, setLocationFilter] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [educationFilter, setEducationFilter] = useState<string | undefined>(undefined);

  const { data: vacancies, isLoading } = useQuery<Vacancy[]>({
    queryKey: ["/api/vacancies"],
  });

  const filteredVacancies = useMemo(() => {
    if (!vacancies) return [];
    
    return vacancies.filter((vacancy) => {
      if (locationFilter && !vacancy.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      
      if (vacancy.hourlyRate) {
        const rate = parseFloat(vacancy.hourlyRate);
        if (minSalary && rate < parseFloat(minSalary)) return false;
        if (maxSalary && rate > parseFloat(maxSalary)) return false;
      }
      
      if (educationFilter && educationFilter !== "all" && vacancy.educationLevel !== educationFilter) {
        return false;
      }
      
      return true;
    });
  }, [vacancies, locationFilter, minSalary, maxSalary, educationFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alle Vacatures</h1>
        <p className="text-muted-foreground mt-2">
          Ontdek opdrachten van zorginstellingen en bureaus
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Locatie</label>
              <Input
                placeholder="Bijv. Amsterdam"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Min. uurtarief (€)</label>
              <Input
                type="number"
                placeholder="25"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Max. uurtarief (€)</label>
              <Input
                type="number"
                placeholder="50"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Opleidingsniveau</label>
              <Select value={educationFilter} onValueChange={setEducationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle niveaus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle niveaus</SelectItem>
                  <SelectItem value="MBO niveau 4">MBO niveau 4</SelectItem>
                  <SelectItem value="HBO niveau 5">HBO niveau 5</SelectItem>
                  <SelectItem value="Universiteit niveau 3">Universiteit niveau 3</SelectItem>
                  <SelectItem value="Anders">Anders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredVacancies && filteredVacancies.length > 0 ? (
        <div className="space-y-4">
          {filteredVacancies.map((vacancy) => (
            <Card 
              key={vacancy.id} 
              className="hover-elevate transition-all duration-200 cursor-pointer"
              onClick={() => setLocation(`/vacancies/${vacancy.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{vacancy.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {vacancy.organisationName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {vacancy.location}
                      </span>
                      {vacancy.hourlyRate && (
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Euro className="h-4 w-4" />
                          €{vacancy.hourlyRate}/uur
                        </span>
                      )}
                      {vacancy.educationLevel && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {vacancy.educationLevel}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{vacancy.contractType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {vacancy.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {vacancy.requirements.slice(0, 3).map((req, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {vacancy.requirements.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{vacancy.requirements.length - 3} meer
                    </Badge>
                  )}
                </div>
                <Button size="sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Bekijk details en reageer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nog geen vacatures beschikbaar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
