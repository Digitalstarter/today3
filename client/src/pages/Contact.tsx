import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Klantenservice</h1>
        <p className="text-muted-foreground mt-2">
          Heeft u vragen of problemen? Wij helpen u graag!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact opnemen</CardTitle>
            <CardDescription>
              Neem contact met ons op via onderstaande gegevens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Email</h3>
                <a 
                  href="mailto:Info@mijnzorgmatch.nl" 
                  className="text-primary hover:underline"
                >
                  Info@mijnzorgmatch.nl
                </a>
                <p className="text-sm text-muted-foreground mt-1">
                  We reageren meestal binnen 24 uur
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Openingstijden</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Maandag - Vrijdag: 09:00 - 17:00</p>
                  <p>Weekend: Gesloten</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Support</h3>
                <p className="text-sm text-muted-foreground">
                  Voor technische vragen en problemen kun je ook contact opnemen via email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Veelgestelde Vragen</CardTitle>
            <CardDescription>
              Antwoorden op de meest gestelde vragen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Hoe plaats ik een vacature?</h3>
              <p className="text-sm text-muted-foreground">
                Als organisatie kun je eenvoudig vacatures plaatsen via het dashboard. 
                Je eerste vacature is gratis!
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Hoe reageer ik op vacatures?</h3>
              <p className="text-sm text-muted-foreground">
                Als ZZP'er kun je gratis reageren op alle vacatures. 
                Klik op een vacature en verstuur je motivatie.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Hoe werkt de chat functie?</h3>
              <p className="text-sm text-muted-foreground">
                Zodra je reageert op een vacature, kun je direct chatten met het bureau. 
                Je vindt alle gesprekken in het Berichten menu.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Wat kost het platform?</h3>
              <p className="text-sm text-muted-foreground">
                Voor ZZP'ers is reageren altijd gratis. Organisaties kunnen hun 
                eerste vacature gratis plaatsen. Voor meer vacatures gelden aantrekkelijke tarieven.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
