import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Accueil
                </Link>
              </Button>
              <Image src="/images/esignpro-logo.png" alt="eSignPro" width={150} height={45} className="h-10 w-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe d'experts est là pour répondre à vos questions et vous accompagner dans votre projet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-red-600 to-gray-700 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Demande d'Information</CardTitle>
                <CardDescription className="text-red-100">
                  Remplissez ce formulaire et nous vous recontacterons dans les 24h
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input id="firstName" placeholder="Votre prénom" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input id="lastName" placeholder="Votre nom" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel *</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" type="tel" placeholder="+41 XX XXX XX XX" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise</Label>
                      <Input id="company" placeholder="Nom de votre entreprise" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisissez un sujet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Demande de démonstration</SelectItem>
                          <SelectItem value="pricing">Questions sur les tarifs</SelectItem>
                          <SelectItem value="technical">Support technique</SelectItem>
                          <SelectItem value="partnership">Partenariat</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" placeholder="Décrivez votre projet ou vos besoins..." rows={5} required />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="consent" className="rounded" required />
                    <Label htmlFor="consent" className="text-sm text-gray-600">
                      J'accepte d'être contacté par eSignPro concernant ma demande *
                    </Label>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-lg py-3">
                    <Send className="mr-2 h-5 w-5" />
                    Envoyer ma demande
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 text-red-600 mr-2" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Support général</p>
                <a href="mailto:support@esignpro.ch" className="text-red-600 hover:underline font-medium">
                  support@esignpro.ch
                </a>
                <p className="text-gray-600 mt-4 mb-2">Ventes</p>
                <a href="mailto:sales@esignpro.ch" className="text-red-600 hover:underline font-medium">
                  sales@esignpro.ch
                </a>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 text-red-600 mr-2" />
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Support technique</p>
                <a href="tel:+41225551234" className="text-red-600 hover:underline font-medium text-lg">
                  +41 22 555 12 34
                </a>
                <p className="text-gray-600 mt-4 mb-2">Ventes</p>
                <a href="tel:+41225551235" className="text-red-600 hover:underline font-medium text-lg">
                  +41 22 555 12 35
                </a>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 text-red-600 mr-2" />
                  Horaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lundi - Vendredi</span>
                    <span className="font-medium">8h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Samedi</span>
                    <span className="font-medium">9h00 - 12h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimanche</span>
                    <span className="font-medium">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 text-red-600 mr-2" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="text-gray-600 not-italic">
                  eSignPro SA
                  <br />
                  Rue du Commerce 15
                  <br />
                  1204 Genève
                  <br />
                  Suisse
                </address>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-red-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide immédiate ?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Consultez notre centre d'aide ou planifiez un appel avec un expert
                </p>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href="/help">Centre d'aide</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full bg-red-600 hover:bg-red-700">
                    <Link href="/demo">Planifier une démo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
