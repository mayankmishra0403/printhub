'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Download, FileText, Eye, Edit, Search, Filter, Loader2, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react'

interface Order {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  service_type: string
  number_of_pages: number | null
  paper_type: string
  is_emergency: boolean
  delivery_address: string
  file_url: string
  file_name: string | null
  file_size: number | null
  total_amount: number
  payment_status: string
  order_status: string
  transaction_id: string | null
  notes: string | null
  created_at: string
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  printing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-green-600 text-white',
  cancelled: 'bg-red-100 text-red-800'
}

const statusIcons: { [key: string]: any } = {
  pending: Clock,
  confirmed: AlertCircle,
  printing: FileText,
  ready: Package,
  delivered: CheckCircle,
  cancelled: XCircle
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
      return
    }
    fetchOrders()
  }, [isAdmin])

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm) ||
        order.id.includes(searchTerm)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
      setFilteredOrders(data || [])
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)

    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: 'Status updated',
        description: 'Order status has been updated successfully',
      })

      // Refresh orders
      await fetchOrders()
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const addNote = async () => {
    if (!selectedOrder || !newNote.trim()) return

    try {
      const { error } = await supabase
        .from('admin_notes')
        .insert({
          order_id: selectedOrder.id,
          admin_id: user!.id,
          note: newNote,
          is_internal: true
        })

      if (error) throw error

      toast({
        title: 'Note added',
        description: 'Internal note has been added to the order',
      })

      setNewNote('')
    } catch (error: any) {
      console.error('Error adding note:', error)
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      })
    }
  }

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      // For signed URLs, direct download
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

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage all printing orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.order_status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => ['confirmed', 'printing'].includes(o.order_status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.order_status === 'delivered').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="printing">Printing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {filteredOrders.length} orders found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.order_status] || FileText
                  return (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Order Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">#{order.id.slice(0, 8)}</span>
                            {order.is_emergency && (
                              <Badge className="bg-red-100 text-red-800">Emergency</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[order.order_status]}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.order_status}
                            </Badge>
                            <Badge variant="outline">
                              {order.payment_status}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{order.full_name}</span>
                            <span className="text-muted-foreground ml-2">{order.email}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.service_type} • ₹{order.total_amount.toFixed(2)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          {order.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(order.file_url, order.file_name || 'file')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              File
                            </Button>
                          )}
                          <Select
                            value={order.order_status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                            disabled={updating}
                          >
                            <SelectTrigger className="w-40">
                              <Edit className="h-4 w-4 mr-1" />
                              Status
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="printing">Printing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{selectedOrder.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  X
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="font-medium">{selectedOrder.full_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <Label>Service</Label>
                  <p className="font-medium">{selectedOrder.service_type}</p>
                </div>
                <div>
                  <Label>Pages</Label>
                  <p className="font-medium">{selectedOrder.number_of_pages || 'N/A'}</p>
                </div>
                <div>
                  <Label>Paper Type</Label>
                  <p className="font-medium">{selectedOrder.paper_type}</p>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="font-bold text-xl text-primary">
                    ₹{selectedOrder.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <Label>Delivery Address</Label>
                <p className="text-sm bg-muted p-2 rounded">{selectedOrder.delivery_address}</p>
              </div>
              {selectedOrder.file_url && (
                <div>
                  <Label>File</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(selectedOrder.file_url, selectedOrder.file_name || 'file')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {selectedOrder.file_name || 'Download'}
                  </Button>
                </div>
              )}
              {selectedOrder.notes && (
                <div>
                  <Label>Customer Notes</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Add Internal Note */}
              <div className="border-t pt-4">
                <Label>Add Internal Note</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Enter internal note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={addNote} disabled={!newNote.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
