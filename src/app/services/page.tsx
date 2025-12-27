import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, Image as ImageIcon, FileText, Scissors, Layout, Printer, ShoppingBag } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const services = [
  {
    category: 'Urgent Printing Services',
    icon: <Clock className="h-6 w-6 text-primary" />,
    items: [
      {
        title: 'Black & White Printing',
        description: 'A4 size documents, assignments and notes.',
        price: '₹5/page',
        features: ['Crisp quality', 'Fast processing', 'Queue pickup available']
      },
      {
        title: 'Color Printing',
        description: 'Projects, presentations and photo printing.',
        price: '₹10/page',
        features: ['Vibrant colors', 'High resolution', 'Various paper options']
      },
      {
        title: 'Photocopy Service',
        description: 'Bulk photocopy and document processing.',
        price: '₹3/page',
        features: ['Bulk discount', 'Fast turnaround', 'Bidirectional']
      }
    ]
  },
  {
    category: 'Personalized Products',
    icon: <Calendar className="h-6 w-6 text-primary" />,
    items: [
      {
        title: 'Custom Calendars',
        description: 'Personalized calendars with your photos and designs.',
        price: '₹199 onwards',
        features: ['Various sizes', 'Your photos', 'Family pack available']
      },
      {
        title: 'Greeting Cards',
        description: 'Personalized cards for special occasions.',
        price: '₹49/card onwards',
        features: ['Custom message', 'High-quality paper', 'Envelope included']
      },
      {
        title: 'Photo Books',
        description: 'Turn your memories into beautiful photo books.',
        price: '₹499 onwards',
        features: ['Hardcover option', 'Glossy paper', 'Custom layout']
      }
    ]
  },
  {
    category: 'Business Printing',
    icon: <Layout className="h-6 w-6 text-primary" />,
    items: [
      {
        title: 'Visiting Cards',
        description: 'Professional and customized visiting cards.',
        price: '₹299/100 cards',
        features: ['Various paper materials', 'Mat/gloss finish', 'Fast delivery']
      },
      {
        title: 'Brochures & Pamphlets',
        description: 'Professional designs for business promotion.',
        price: '₹599 onwards',
        features: ['Creative designs', 'Various folding', 'Quality print']
      },
      {
        title: 'Letterhead',
        description: 'Professional letterhead for business.',
        price: '₹799/500 papers',
        features: ['Watermark option', 'Premium paper', 'Bulk order']
      }
    ]
  },
  {
    category: 'Large Format Printing',
    icon: <ImageIcon className="h-6 w-6 text-primary" />,
    items: [
      {
        title: 'Poster Printing',
        description: 'Posters for events, advertisements and decoration.',
        price: '₹99 onwards',
        features: ['A3 to A0 size', 'High resolution', 'Mat/gloss option']
      },
      {
        title: 'Banners & Flex',
        description: 'Outdoor and indoor banners.',
        price: '₹249 onwards',
        features: ['Various materials', 'Weatherproof', 'Custom size']
      },
      {
        title: 'Standee & Roll-up Banners',
        description: 'Display stands for professional events.',
        price: '₹1,499 onwards',
        features: ['Easy setup', 'Portable', 'Durable']
      }
    ]
  },
  {
    category: 'Binding & Finishing',
    icon: <Scissors className="h-6 w-6 text-primary" />,
    items: [
      {
        title: 'Spiral Binding',
        description: 'Binding for reports and projects.',
        price: '₹40/copy onwards',
        features: ['Various colors', 'Durable', 'Fast service']
      },
      {
        title: 'Hardcover Binding',
        description: 'Premium binding for thesis and books.',
        price: '₹149 onwards',
        features: ['Premium look', 'Gold/silver print', 'Lamination']
      },
      {
        title: 'Lamination',
        description: 'Laminate documents and photos.',
        price: '₹15/page onwards',
        features: ['Mat/gloss option', 'Waterproof', 'Long lasting']
      }
    ]
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4 md:px-6 mb-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Our Services
          </h1>
          <p className="text-lg text-muted-foreground">
            One solution for all types of printing needs.
            High quality and fast service.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="container mx-auto px-4 md:px-6">
        {services.map((serviceCategory, index) => (
          <div key={index} className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              {serviceCategory.icon}
              <h2 className="text-2xl md:text-3xl font-bold">
                {serviceCategory.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCategory.items.map((service, serviceIndex) => (
                <Card key={serviceIndex} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="pt-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {service.price}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/order" className="block mt-4">
                      <Button className="w-full">
                        Order Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 mt-16">
        <div className="bg-primary/5 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-muted-foreground mb-6">
            We also provide custom printing solutions. Contact us and tell us your requirements.
          </p>
          <Link href="/contact">
            <Button size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
