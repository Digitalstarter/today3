import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, AlertCircle, Building2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';

const stripeEnabled = Boolean(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const stripePromise = stripeEnabled ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

function PaymentForm({ 
  onSuccess, 
  buttonText,
  successMessage 
}: { 
  onSuccess: () => void;
  buttonText: string;
  successMessage: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Betaling mislukt",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Betaling voltooid!",
          description: successMessage,
        });
        
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Fout",
        description: err.message || "Er ging iets mis",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verwerken...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </form>
  );
}

export default function Credits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSubscription, setShowSubscription] = useState(false);
  const [showVacancyPayment, setShowVacancyPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'subscription' | 'vacancy'>('subscription');

  const { data: vacancyCount, refetch: refetchVacancies } = useQuery<number>({
    queryKey: ["/api/my-vacancies/count"],
  });

  const { data: transactions, refetch: refetchTransactions } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  const handleSubscribe = async () => {
    try {
      const response = await apiRequest('POST', '/api/create-subscription');
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentType('subscription');
      setShowSubscription(true);
      setShowVacancyPayment(false);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon abonnement niet starten",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseVacancyCredit = async () => {
    try {
      const response = await apiRequest('POST', '/api/purchase-vacancy-credit');
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentType('vacancy');
      setShowVacancyPayment(true);
      setShowSubscription(false);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon betaling niet starten",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Weet je zeker dat je het abonnement wilt opzeggen?')) {
      return;
    }

    try {
      await apiRequest('POST', '/api/cancel-subscription');
      toast({
        title: "Abonnement opgezegd",
        description: "Je abonnement is succesvol opgezegd.",
      });
      refetchVacancies();
      refetchTransactions();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon abonnement niet opzeggen",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setShowSubscription(false);
    setShowVacancyPayment(false);
    setClientSecret(null);
    refetchVacancies();
    refetchTransactions();
    window.location.reload();
  };

  const totalVacancies = vacancyCount || 0;
  const hasActiveSubscription = user?.subscriptionStatus === 'active';

  if (!stripeEnabled) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Betalingen & Abonnement</h1>
          <p className="text-muted-foreground mt-2">
            Beheer je abonnement voor het plaatsen van vacatures
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Betalingen niet geconfigureerd</AlertTitle>
          <AlertDescription>
            De betalingsfunctionaliteit is momenteel niet beschikbaar. 
            Neem contact op met de beheerder om Stripe te configureren.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Je Status</CardTitle>
            <CardDescription>Huidige abonnement status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Geplaatste vacatures</span>
              <Badge variant="secondary" className="text-lg">
                {totalVacancies}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Abonnement</span>
              {hasActiveSubscription ? (
                <Badge className="bg-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Actief
                </Badge>
              ) : (
                <Badge variant="outline">
                  <X className="mr-1 h-3 w-3" />
                  Niet actief
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Betalingen & Abonnement</h1>
        <p className="text-muted-foreground mt-2">
          Beheer je abonnement voor het plaatsen van vacatures
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Je Status</CardTitle>
            <CardDescription>Huidige situatie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Geplaatste vacatures</span>
              <Badge variant="secondary" className="text-lg">
                {totalVacancies}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Abonnement</span>
              {hasActiveSubscription ? (
                <Badge className="bg-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Actief
                </Badge>
              ) : (
                <Badge variant="outline">
                  <X className="mr-1 h-3 w-3" />
                  Niet actief
                </Badge>
              )}
            </div>

            {totalVacancies === 0 && (
              <Alert className="mt-4">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Eerste vacature gratis!</AlertTitle>
                <AlertDescription>
                  Je kunt je eerste vacature gratis plaatsen om het platform te testen.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prijsmodel</CardTitle>
            <CardDescription>Kies wat het beste bij je past</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent/30 transition-all cursor-pointer" onClick={handlePurchaseVacancyCredit}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Per vacature</span>
                <Badge variant="outline">€49</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Betaal per vacature die je plaatst (na je eerste gratis vacature)
              </p>
              {user?.credits && user.credits > 0 && (
                <Badge className="bg-green-600 text-xs">
                  {user.credits} {user.credits === 1 ? 'credit' : 'credits'} beschikbaar
                </Badge>
              )}
            </div>

            <div className="p-4 border-2 border-primary rounded-lg bg-accent/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Abonnement</span>
                <Badge className="bg-primary">€149/maand</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Plaats onbeperkt vacatures
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Onbeperkt vacatures
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Meer zichtbaarheid
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Opzeggen wanneer je wilt
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasActiveSubscription && !showSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Start een abonnement</CardTitle>
            <CardDescription>
              Plaats onbeperkt vacatures voor €149 per maand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSubscribe} className="w-full md:w-auto">
              <Building2 className="mr-2 h-4 w-4" />
              Start abonnement
            </Button>
          </CardContent>
        </Card>
      )}

      {hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Actief Abonnement</CardTitle>
            <CardDescription>
              Je hebt een actief abonnement en kunt onbeperkt vacatures plaatsen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Abonnement opzeggen
            </Button>
          </CardContent>
        </Card>
      )}

      {(showSubscription || showVacancyPayment) && clientSecret && stripePromise && (
        <Card>
          <CardHeader>
            <CardTitle>
              {paymentType === 'subscription' ? 'Abonnement Betaling' : 'Vacature Credit Betaling'}
            </CardTitle>
            <CardDescription>
              {paymentType === 'subscription' 
                ? 'Vul je betalingsgegevens in om het abonnement te starten' 
                : 'Betaal €49 voor één vacature credit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                onSuccess={handlePaymentSuccess}
                buttonText={paymentType === 'subscription' ? 'Start abonnement - €149/maand' : 'Betaal €49'}
                successMessage={paymentType === 'subscription' 
                  ? 'Je kunt nu onbeperkt vacatures plaatsen.' 
                  : 'Je hebt 1 vacature credit ontvangen!'}
              />
            </Elements>
            <Button
              variant="ghost"
              onClick={() => {
                setShowSubscription(false);
                setShowVacancyPayment(false);
                setClientSecret(null);
              }}
              className="w-full mt-4"
            >
              Annuleren
            </Button>
          </CardContent>
        </Card>
      )}

      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactiegeschiedenis</CardTitle>
            <CardDescription>Overzicht van je betalingen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{parseFloat(transaction.amount).toFixed(2)}</p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status === 'completed' ? 'Voltooid' : 'In behandeling'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
