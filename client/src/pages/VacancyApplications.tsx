import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle, User, Clock } from "lucide-react";
import type { Vacancy, Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ApplicationWithApplicant extends Application {
  applicant?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export default function VacancyApplications() {
  const [, params] = useRoute("/my-vacancies/:id/applications");
  const [, setLocation] = useLocation();

  const { data: vacancy, isLoading: vacancyLoading } = useQuery<Vacancy>({
    queryKey: [`/api/vacancies/${params?.id}`],
    enabled: !!params?.id,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const vacancyApplications = applications?.filter(
    (app) => app.targetType === 'vacancy' && app.targetId === params?.id
  ) || [];

  const isLoading = vacancyLoading || applicationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
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

  if (!vacancy) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Vacature niet gevonden</p>
          <Button onClick={() => setLocation("/my-vacancies")} className="mt-4">
            Terug naar mijn advertenties
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/my-vacancies")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Reacties op vacature</h1>
          <p className="text-muted-foreground mt-1">{vacancy.title}</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {vacancyApplications.length} {vacancyApplications.length === 1 ? 'reactie' : 'reacties'}
        </Badge>
      </div>

      {vacancyApplications.length > 0 ? (
        <div className="space-y-4">
          {vacancyApplications.map((application) => (
            <Card key={application.id} className="hover-elevate transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {(application as any).applicant?.firstName && (application as any).applicant?.lastName
                        ? `${(application as any).applicant.firstName} ${(application as any).applicant.lastName}`
                        : (application as any).applicant?.email || 'ZZP\'er'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4" />
                      {new Date(application.createdAt!).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      application.status === 'accepted' ? 'default' :
                      application.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {application.status === 'pending' && 'In behandeling'}
                    {application.status === 'accepted' && 'Geaccepteerd'}
                    {application.status === 'rejected' && 'Afgewezen'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Bericht:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{application.message}</p>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    size="sm" 
                    onClick={() => setLocation(`/messages?userId=${application.applicantId}`)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start gesprek
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nog geen reacties op deze vacature</p>
            <p className="text-sm text-muted-foreground mt-2">
              Zodra professionals reageren, zie je hun reacties hier
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
