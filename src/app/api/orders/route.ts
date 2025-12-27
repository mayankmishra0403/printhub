import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { name, email, phone, service, quantity } = body

    if (!name || !email || !phone || !service || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // If user ID is provided, ensure user exists in public.users table
    let userId = null
    if (body.userId) {
      // Check if user exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', body.userId)
        .single()

      if (!existingUser) {
        // Create user in public.users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: body.userId,
            email: email,
            full_name: name,
            phone: phone,
            role: 'user'
          })

        if (userError) {
          console.warn('Could not create user record:', userError.message)
          // Continue without user_id if user creation fails
        } else {
          userId = body.userId
        }
      } else {
        userId = body.userId
      }
    }

    // Save order to Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        full_name: name,
        email,
        phone,
        service_type: service,
        number_of_pages: parseInt(quantity) || null,
        paper_type: 'standard',
        is_emergency: body.urgency === 'urgent',
        delivery_address: body.description || 'To be confirmed',
        total_amount: 0, // Will be calculated later
        payment_status: 'pending',
        order_status: 'pending',
        notes: body.description || null
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      )
    }

    console.log('New order created in Supabase:', order)

    // Here you could also:
    // 1. Send confirmation email to customer
    // 2. Send notification email/SMS to admin
    // 3. Integrate with payment gateway
    // 4. Send SMS confirmation to customer

    return NextResponse.json(
      {
        message: 'Order submitted successfully',
        orderId: order.id,
        order
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
