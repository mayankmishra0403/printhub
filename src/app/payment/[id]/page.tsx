'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Order {
  id: string
  total_amount: number
  payment_status: string
  order_status: string
  full_name: string
  email: string
  phone: string
  service_type: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchOrder()
    loadRazorpay()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error

      setOrder(data)

      // If already paid, redirect to orders
      if (data.payment_status === 'paid') {
        router.push('/orders')
      }
    } catch (error: any) {
      console.error('Error fetching order:', error)
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRazorpay = () => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }

  const handlePayment = async () => {
    if (!order) return

    setProcessing(true)

    try {
      // Calculate amount in paise (1 INR = 100 paise)
      const amountInPaise = Math.round(order.total_amount * 100)

      // Create Razorpay order via Supabase Edge Function
      // For now, we'll use direct checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: amountInPaise,
        currency: 'INR',
        name: 'PrintHub',
        description: `Order for ${order.service_type}`,
        order_id: orderId, // This should come from backend
        handler: async function (response: any) {
          // Payment successful
          await handlePaymentSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature)
        },
        prefill: {
          name: order.full_name,
          email: order.email,
          contact: order.phone
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
            toast({
              title: 'Payment cancelled',
              description: 'You cancelled the payment',
              variant: 'destructive',
            })
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      })
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = async (paymentId: string, orderId: string, signature: string) => {
    try {
      // Update order with payment details
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          transaction_id: paymentId,
          order_status: 'confirmed'
        })
        .eq('id', orderId)

      if (orderError) throw orderError

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          amount: order!.total_amount,
          currency: 'INR',
          payment_method: 'razorpay',
          transaction_id: paymentId,
          status: 'success',
          payment_data: {
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature
          }
        })

      if (paymentError) throw paymentError

      toast({
        title: 'Payment Successful!',
        description: 'Your order has been confirmed.',
      })

      router.push('/orders')
    } catch (error: any) {
      console.error('Error updating payment:', error)
      toast({
        title: 'Error',
        description: 'Payment recorded but order update failed',
        variant: 'destructive',
      })
    }
  }

  const handleUPIPayment = () => {
    // For UPI, you would typically generate a QR code or UPI intent
    toast({
      title: 'UPI Payment',
      description: 'Please use Razorpay to select UPI payment method',
    })
    handlePayment()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-muted/50">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <CardDescription>
              Order #{orderId.slice(0, 8)} - {order.service_type}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{order.service_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-yellow-600">Pending Payment</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h3 className="font-semibold">Select Payment Method</h3>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 text-base"
              >
                {processing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="mr-2 h-5 w-5" /> Pay with Razorpay</>
                )}
              </Button>

              <Button
                onClick={handleUPIPayment}
                disabled={processing}
                variant="outline"
                className="w-full h-12 text-base"
              >
                Pay via UPI
              </Button>
            </div>

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Secure payment powered by Razorpay</p>
              <p>• Multiple payment options: Cards, UPI, Netbanking, Wallets</p>
              <p>• Instant payment confirmation</p>
            </div>

            {/* Cancel */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.back()}
            >
              Cancel and Return
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
