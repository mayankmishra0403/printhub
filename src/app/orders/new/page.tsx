'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'

const services = [
  'Black & White Printing',
  'Color Printing',
  'Photocopy Service',
  'Custom Calendar',
  'Greeting Cards',
  'Photo Books',
  'Visiting Cards',
  'Brochures & Pamphlets',
  'Letterhead',
  'Poster Printing',
  'Banners & Flex',
  'Standee & Roll-up Banners',
  'Spiral Binding',
  'Hardcover Binding',
  'Lamination'
]

const paperTypes = [
  { id: 'a4-normal', name: 'A4 Normal (80 GSM)', price: 0 },
  { id: 'a4-premium', name: 'A4 Premium (100 GSM)', price: 2 },
  { id: 'a4-glossy', name: 'A4 Glossy', price: 5 },
  { id: 'cardstock', name: 'Cardstock (300 GSM)', price: 8 }
]

export default function NewOrderPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    service_type: '',
    number_of_pages: '',
    paper_type: 'a4-normal',
    is_emergency: false,
    delivery_address: '',
    notes: ''
  })

  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string>('')

  // Redirect if not logged in
  if (!user && typeof window !== 'undefined') {
    window.location.href = '/login'
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 50MB',
        variant: 'destructive',
      })
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF, JPEG, and PNG files are allowed',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)
    // Store file locally, upload will happen on submit if storage is available
    toast({
      title: 'File selected',
      description: `${selectedFile.name} ready to upload with order.`,
    })
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('order-files')
        .upload(fileName, file)

      if (error) {
        console.warn('File upload skipped due to storage policy issue:', error.message)
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('order-files')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error: any) {
      console.warn('Upload error (non-critical):', error)
      return null
    }
  }

  const calculatePrice = () => {
    // Per-page prices for printing services
    const perPagePrices: { [key: string]: number } = {
      'Black & White Printing': 1,
      'Color Printing': 5,
      'Photocopy Service': 0.5,
      'Lamination': 10
    }

    // Fixed prices for other services
    const fixedPrices: { [key: string]: number } = {
      'Custom Calendar': 199,
      'Greeting Cards': 49,
      'Photo Books': 499,
      'Visiting Cards': 299,
      'Brochures & Pamphlets': 599,
      'Letterhead': 799,
      'Poster Printing': 99,
      'Banners & Flex': 249,
      'Standee & Roll-up Banners': 1499,
      'Spiral Binding': 40,
      'Hardcover Binding': 149
    }

    const pages = parseInt(formData.number_of_pages) || 1
    let total = 0

    // Check if it's a per-page service
    if (perPagePrices[formData.service_type] !== undefined) {
      // Per-page pricing
      const pricePerPage = perPagePrices[formData.service_type]
      
      // Add paper type extra cost per page
      const paperType = paperTypes.find(pt => pt.id === formData.paper_type)
      const paperExtraPerPage = paperType?.price || 0
      
      total = (pricePerPage + paperExtraPerPage) * pages
    } else {
      // Fixed price service
      total = fixedPrices[formData.service_type] || 0
    }

    // Emergency fee (50% extra)
    return formData.is_emergency ? Math.round(total * 1.5) : total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Try to upload file if selected (non-blocking)
      let uploadedFileUrl: string | null = null
      if (file) {
        uploadedFileUrl = await uploadFile(file)
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          service_type: formData.service_type,
          number_of_pages: parseInt(formData.number_of_pages) || null,
          paper_type: formData.paper_type,
          is_emergency: formData.is_emergency,
          delivery_address: formData.delivery_address,
          file_url: uploadedFileUrl,
          file_name: file?.name || null,
          file_size: file?.size || null,
          total_amount: calculatePrice(),
          payment_status: 'pending',
          order_status: 'pending',
          notes: formData.notes
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Order submitted successfully!',
        description: `Order #${data.id.slice(0, 8)} created. Proceed to payment.`,
      })

      // Redirect to payment page
      window.location.href = `/payment/${data.id}`
    } catch (error: any) {
      console.error('Order submission error:', error)
      toast({
        title: 'Order submission failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-muted/50">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Place Your Order</CardTitle>
            <CardDescription>
              Fill in the details below and upload your file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Type *</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                    required
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pages">Number of Pages *</Label>
                    <Input
                      id="pages"
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.number_of_pages}
                      onChange={(e) => setFormData({ ...formData, number_of_pages: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paperType">Paper Type *</Label>
                    <Select
                      value={formData.paper_type}
                      onValueChange={(value) => setFormData({ ...formData, paper_type: value })}
                      required
                    >
                      <SelectTrigger id="paperType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paperTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="emergency"
                    checked={formData.is_emergency}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_emergency: checked })}
                  />
                  <Label htmlFor="emergency">Emergency Order (50% extra)</Label>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload File</h3>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> Choose File</>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    PDF, JPEG, PNG up to 50MB
                  </p>
                  {file && (
                    <div className="mt-2 text-sm">
                      <span className="text-primary font-medium">
                        ✓ {file.name}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Delivery Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete delivery address"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or instructions"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Price Summary */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Estimated Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{calculatePrice().toFixed(2)}
                    </span>
                  </div>
                  {formData.is_emergency && (
                    <p className="text-sm text-muted-foreground mt-2">
                      * Includes 50% emergency surcharge
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || !fileUrl}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Submit Order</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
