import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, MapPin, Clock, Building2, ArrowLeft, MessageCircle, Loader2, Euro, GraduationCap, Timer } from "lucide-react";
import type { Vacancy } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function VacancyDetail() {
  const [, params] = useRoute("/vacancies/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [applicationMessage, setApplicationMessage] = useState("");

  const { data: vacancy, isLoading } = useQuery<Vacancy>({
    queryKey: [`/api/vacancies/${params?.id}`],
    enabled: !!params?.id,
  });

  const { data: existingApplications } = useQuery<any[]>({
    queryKey: ["/api/my-applications"],
    enabled: user?.role === 'zzper',
  });

  const { data: responseTimeData } = useQuery<{ averageResponseTimeHours: number }>({
    queryKey: [`/api/organisations/${vacancy?.userId}/average-response-time`],
    enabled: !!vacancy?.userId,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { targetType: string; targetId: string; message: string }) => {
      const response = await apiRequest("POST", "/api/applications", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Er is iets misgegaan");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reactie verzonden!",
        description: "Het bureau heeft je reactie ontvangen. Je kunt nu met hen chatten.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      setApplicationMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Er is iets misgegaan",
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!applicationMessage.trim()) {
      toast({
        title: "Bericht vereist",
        description: "Voeg een bericht toe aan je reactie",
        variant: "destructive",
      });
      return;
    }

    if (!vacancy?.id) return;

    applyMutation.mutate({
      targetType: 'vacancy',
      targetId: vacancy.id,
      message: applicationMessage,
    });
  };

  const hasApplied = existingApplications?.some(
    (app) => app.targetType === 'vacancy' && app.targetId === params?.id
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Vacature niet gevonden</p>
          <Button onClick={() => setLocation("/vacancies")} className="mt-4">
            Terug naar overzicht
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/vacancies")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{vacancy.title}</h1>
          <p className="text-muted-foreground mt-1">{vacancy.organisationName}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Locatie</p>
                <p className="text-sm text-muted-foreground">{vacancy.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Contract type</p>
                <p className="text-sm text-muted-foreground">{vacancy.contractType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {vacancy.hourlyRate && (
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Uurtarief</p>
                  <p className="text-sm font-semibold text-primary">€{vacancy.hourlyRate}/uur</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {vacancy.educationLevel && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Opleidingsniveau</p>
                  <p className="text-sm text-muted-foreground">{vacancy.educationLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {responseTimeData && responseTimeData.averageResponseTimeHours > 0 && (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {vacancy.organisationName} reageert gemiddeld binnen{' '}
                  {responseTimeData.averageResponseTimeHours < 1 
                    ? 'een uur' 
                    : responseTimeData.averageResponseTimeHours < 24
                    ? `${Math.round(responseTimeData.averageResponseTimeHours)} uur`
                    : '1 dag'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Over de vacature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Beschrijving</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{vacancy.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Eisen en wensen</h3>
            <ul className="space-y-2">
              {vacancy.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {vacancy.createdAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
              <Clock className="h-4 w-4" />
              <span>Geplaatst op {new Date(vacancy.createdAt).toLocaleDateString('nl-NL')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {user?.role === 'zzper' && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Reageren op deze vacature</CardTitle>
            <CardDescription>
              {hasApplied 
                ? "Je hebt al gereageerd op deze vacature. Je kunt nu met het bureau chatten."
                : "Laat weten waarom je geschikt bent voor deze functie"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasApplied ? (
              <div className="space-y-4">
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Je hebt al gereageerd op deze vacature
                  </p>
                </div>
                <Button onClick={() => setLocation("/messages")} className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ga naar berichten
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="message">Je bericht *</Label>
                  <Textarea
                    id="message"
                    placeholder="Vertel waarom je interesse hebt in deze vacature en wat je kwalificaties zijn..."
                    className="min-h-32 mt-2"
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleApply} 
                  disabled={applyMutation.isPending || !applicationMessage.trim()}
                  className="w-full"
                >
                  {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verstuur reactie
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  ✓ Reageren is altijd gratis voor ZZP'ers
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {user?.role === 'organisatie' && (
        <Card className="border-muted">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Als bureau kun je reacties ontvangen op je vacatures, maar niet zelf reageren.
            </p>
            <Button onClick={() => setLocation("/my-vacancies")} variant="outline" className="mt-4">
              Bekijk mijn advertenties
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
