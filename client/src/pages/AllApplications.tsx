import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, User, Clock, Briefcase } from "lucide-react";
import type { Application, Vacancy } from "@shared/schema";
import { useLocation } from "wouter";

export default function AllApplications() {
  const [, setLocation] = useLocation();

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: vacancies, isLoading: vacanciesLoading } = useQuery<Vacancy[]>({
    queryKey: ["/api/my-vacancies"],
  });

  const isLoading = applicationsLoading || vacanciesLoading;

  const getVacancyForApplication = (app: Application) => {
    if (app.targetType === 'vacancy') {
      return vacancies?.find(v => v.id === app.targetId);
    }
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alle Reacties</h1>
          <p className="text-muted-foreground mt-2">
            Overzicht van alle reacties op je vacatures
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {applications?.length || 0} totaal
        </Badge>
      </div>

      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => {
            const vacancy = getVacancyForApplication(application);
            
            return (
              <Card key={application.id} className="hover-elevate transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 mb-2">
                        <User className="h-5 w-5" />
                        {(application as any).applicant?.firstName && (application as any).applicant?.lastName
                          ? `${(application as any).applicant.firstName} ${(application as any).applicant.lastName}`
                          : (application as any).applicant?.email || 'ZZP\'er'}
                      </CardTitle>
                      {vacancy && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-medium">{vacancy.title}</span>
                        </div>
                      )}
                      <CardDescription className="flex items-center gap-2">
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
                    <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {application.message}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      size="sm"
                      onClick={() => setLocation(`/messages?userId=${application.applicantId}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start gesprek
                    </Button>
                    {vacancy && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setLocation(`/my-vacancies/${vacancy.id}/applications`)}
                      >
                        Bekijk vacature reacties
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nog geen reacties ontvangen</p>
            <p className="text-sm text-muted-foreground mt-2">
              Zodra professionals op je vacatures reageren, verschijnen ze hier
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
