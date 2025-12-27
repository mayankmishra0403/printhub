import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, Image as ImageIcon, FileText, ArrowRight } from 'lucide-react'

const featuredServices = [
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: 'Urgent Paper Printing',
    description: 'Print all your documents in minimal time. High-quality output.',
    price: '₹5/page onwards'
  },
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: 'Personalized Calendars',
    description: 'Create personalized calendars with your photos and designs.',
    price: '₹199 onwards'
  },
  {
    icon: <ImageIcon className="h-8 w-8 text-primary" />,
    title: 'Poster Printing',
    description: 'Professional posters for your advertisements and events.',
    price: '₹99 onwards'
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Banners & Flex',
    description: 'Banner and flex printing service in any size.',
    price: '₹249 onwards'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Quality Printing at Your{' '}
            <span className="text-primary">Fingertips</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Urgent paper printing, personalized calendars, posters and much more.
            One-stop solution for all your printing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/services">
              <Button size="lg" className="w-full sm:w-auto">
                View Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/order">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground text-lg">
              All types of printing services in one place
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="pt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {service.price}
                    </span>
                    <Link href="/services">
                      <Button variant="ghost" size="sm">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast Service</h3>
              <p className="text-muted-foreground">
                Orders completed within 24 hours. Same-day printing available for most items.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">High Quality</h3>
              <p className="text-muted-foreground">
                High-quality prints and materials. Every print is made with care.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Customization</h3>
              <p className="text-muted-foreground">
                Print according to your designs and ideas. Fully personalized service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Place Your Order Today
            </h2>
            <p className="text-muted-foreground text-lg">
              Experience excellent quality and fast service. Our team is ready to help you.
            </p>
            <Link href="/order">
              <Button size="lg" className="w-full sm:w-auto">
                Start Order
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
