import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4 md:px-6 mb-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">+91 98765 43210</p>
                  <p className="text-sm text-muted-foreground">
                    Available 9 AM - 9 PM, 7 days a week
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xl font-bold">info@printhub.com</p>
                  <p className="text-sm text-muted-foreground">
                    We'll respond within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">PrintHub</p>
                  <p className="text-sm text-muted-foreground">
                    Main Market, New Delhi - 110001
                  </p>
                  <p className="text-sm text-muted-foreground">
                    India
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">9 AM - 9 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10 AM - 8 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">10 AM - 6 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About Us */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>About PrintHub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                PrintHub is your trusted partner for all printing needs. We are committed to delivering high-quality printing services with fast turnaround times. Whether you need urgent document printing, personalized calendars, banners, or business cards, we've got you covered.
              </p>
              <p className="text-muted-foreground">
                Our team of experienced professionals ensures every print job is completed with precision and care. We use state-of-the-art printing technology and premium materials to deliver results that exceed your expectations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-2">5000+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-2">10000+</div>
                  <div className="text-sm text-muted-foreground">Orders Completed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-2">5+ Years</div>
                  <div className="text-sm text-muted-foreground">Experience</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Choose Us */}
          <Card>
            <CardHeader>
              <CardTitle>Why Choose PrintHub?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Quality Guaranteed</h4>
                  <p className="text-sm text-muted-foreground">
                    We use premium materials and the latest printing technology to ensure every print meets the highest quality standards.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Fast Turnaround</h4>
                  <p className="text-sm text-muted-foreground">
                    Most orders completed within 24-48 hours. Same-day printing available for urgent requirements.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Competitive Pricing</h4>
                  <p className="text-sm text-muted-foreground">
                    Best prices in the market without compromising on quality. Bulk order discounts available.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Customer Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Dedicated support team to help you with your queries. Available 7 days a week.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
