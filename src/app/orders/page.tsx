'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { Package, Clock, FileText, CheckCircle, Truck, XCircle, Plus, Download } from 'lucide-react'

interface Order {
  id: string
  full_name: string
  email: string
  phone: string
  service_type: string
  number_of_pages: number | null
  paper_type: string
  is_emergency: boolean
  delivery_address: string
  file_url: string | null
  file_name: string | null
  total_amount: number
  payment_status: string
  order_status: string
  notes: string | null
  created_at: string
}

const statusConfig: { [key: string]: { label: string; icon: any; color: string } } = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  printing: { label: 'Printing', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  ready: { label: 'Ready', icon: Package, color: 'bg-green-100 text-green-800' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-600 text-white' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' }
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to load first
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [user, authLoading])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders/user?userId=${user!.id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }

      setOrders(data.orders || [])
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (fileUrl: string, fileName: string) => {
    if (!fileUrl) return

    try {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground mt-1">Track and manage your printing orders</p>
          </div>
          <Button onClick={() => router.push('/orders/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start by placing your first printing order!
              </p>
              <Button onClick={() => router.push('/orders/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Place Your First Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.order_status] || statusConfig.pending
              const StatusIcon = config.icon
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Order Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary">
                            #{order.id.slice(0, 8)}
                          </span>
                          <Badge className={config.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          {order.is_emergency && (
                            <Badge className="bg-red-100 text-red-800">
                              Emergency
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                            Payment: {order.payment_status}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{order.service_type}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.number_of_pages ? `${order.number_of_pages} pages` : 'Custom order'}
                            {order.paper_type && ` • ${order.paper_type}`}
                          </p>
                        </div>

                        <div className="text-sm">
                          <p>
                            <span className="text-muted-foreground">Total: </span>
                            <span className="font-bold text-xl">
                              ₹{order.total_amount.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-muted-foreground mt-1">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Delivery:</span>
                          </p>
                          <p className="text-sm bg-muted p-2 rounded mt-1">
                            {order.delivery_address}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 min-w-[140px]">
                        {order.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(order.file_url!, order.file_name || 'file')}
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            File
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
