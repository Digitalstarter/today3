import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Plus, Eye, FileText } from "lucide-react";
import type { Vacancy, Application } from "@shared/schema";
import { useLocation } from "wouter";

export default function MyVacancies() {
  const [, setLocation] = useLocation();

  const { data: vacancies, isLoading: vacanciesLoading } = useQuery<Vacancy[]>({
    queryKey: ["/api/my-vacancies"],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const isLoading = vacanciesLoading || applicationsLoading;

  const getApplicationsCount = (vacancyId: string) => {
    return applications?.filter(
      app => app.targetType === 'vacancy' && app.targetId === vacancyId
    ).length || 0;
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mijn Advertenties</h1>
          <p className="text-muted-foreground mt-2">
            Beheer je vacatures en bekijk reacties
          </p>
        </div>
        <Button onClick={() => setLocation("/my-vacancies/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe advertentie
        </Button>
      </div>

      {vacancies && vacancies.length > 0 ? (
        <div className="space-y-4">
          {vacancies.map((vacancy) => {
            const applicationsCount = getApplicationsCount(vacancy.id);
            
            return (
              <Card key={vacancy.id} className="hover-elevate transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{vacancy.title}</CardTitle>
                      <CardDescription>{vacancy.location} · {vacancy.contractType}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {applicationsCount > 0 && (
                        <Badge variant="default" className="bg-primary">
                          {applicationsCount} {applicationsCount === 1 ? 'reactie' : 'reacties'}
                        </Badge>
                      )}
                      <Badge variant={vacancy.status === 'active' ? 'default' : 'secondary'}>
                        {vacancy.status === 'active' ? 'Actief' : 'Inactief'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {vacancy.description}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setLocation(`/vacancies/${vacancy.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijk
                    </Button>
                    <Button 
                      size="sm" 
                      variant={applicationsCount > 0 ? "default" : "outline"}
                      onClick={() => setLocation(`/my-vacancies/${vacancy.id}/applications`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Reacties {applicationsCount > 0 && `(${applicationsCount})`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Je hebt nog geen advertenties geplaatst</p>
            <Button onClick={() => setLocation("/my-vacancies/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Eerste advertentie plaatsen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
