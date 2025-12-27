# PrintHub - Serverless Printing Service Application

## 🚀 Architecture Overview

This is a **fully serverless printing service application** where all backend logic is handled via Supabase BaaS (Backend-as-a-Service). No traditional backend server (Express, Django, etc.) is needed.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                  │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │ Login Page │ Order Page  │ User Pages │ Admin Panel │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
│                            │                                  │
│                            ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Direct Client Calls
                           │
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (Serverless)                   │
│  ┌──────────────┬──────────────┬──────────────┐           │
│  │  PostgreSQL   │   Storage     │  Auth         │           │
│  │  Database     │   (S3-like)  │  (Email+Phone)│           │
│  └──────────────┴──────────────┴──────────────┘           │
│                                                             │
│         ┌─────────────────────────────────────┐               │
│         │  Row Level Security (RLS)        │               │
│         │  - Users see only their orders    │               │
│         │  - Admins see everything          │               │
│         └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Webhook Events (Optional)
                           │
┌─────────────────────────────────────────────────────────────────┐
│              Email Notification Service (Supabase)            │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 How Frontend Acts as Backend

### Traditional vs Serverless

**Traditional Architecture:**
```
Frontend → API Server → Database
         ↓
    Business Logic
    Auth
    File Upload
    Validation
```

**Serverless Architecture:**
```
Frontend → Supabase SDK → Database
         ↓
    Direct Database Access (via RLS)
    Built-in Auth
    Built-in Storage
    Client-side Validation
```

### Key Differences:

1. **No API Layer Needed**: Frontend talks directly to Supabase via SDK
2. **Security via RLS**: Database policies replace middleware/auth guards
3. **Real-time**: Subscriptions replace polling
4. **File Upload**: Direct to Supabase Storage (no file server needed)

## 🛠 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL
   - Anon Public Key
   - Service Role Key (for admin operations)

### Step 2: Configure Environment Variables

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay Configuration (for production)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

### Step 3: Set Up Database

Run the SQL schema file in Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and execute
4. This will create all tables, indexes, RLS policies, and initial services

### Step 4: Configure Auth

In Supabase Dashboard → Authentication:

1. **Email/Password**:
   - Enable email provider
   - Set confirm email: true/false based on preference

2. **Phone OTP**:
   - Enable phone provider
   - Configure SMS provider (Twilio, MessageBird, etc.)
   - Add API keys for SMS provider

### Step 5: Configure Storage

1. Go to Storage → Create bucket named `order-files`
2. Set:
   - Public: false
   - File size limit: 50MB
   - Allowed MIME types: application/pdf, image/jpeg, image/png, image/jpg
3. Storage policies are already defined in schema.sql

### Step 6: Set Up Razorpay (Optional)

1. Create account at [razorpay.com](https://razorpay.com)
2. Get API keys
3. Add to environment variables

## 📁 Project Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx              # Email + Phone OTP auth
│   ├── orders/
│   │   ├── page.tsx              # User order history
│   │   └── new/
│   │       └── page.tsx          # Order submission + file upload
│   ├── payment/
│   │   └── [id]/
│   │       └── page.tsx          # Payment processing
│   └── admin/
│       └── page.tsx              # Admin dashboard
├── contexts/
│   └── auth-context.tsx          # Auth state management
├── lib/
│   └── supabase.ts              # Supabase client config
└── components/
    └── ui/                     # shadcn/ui components
```

## 🔐 Security Implementation

### Row Level Security (RLS) Policies

#### 1. Users can only see their own orders
```sql
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);
```

#### 2. Admins can see all orders
```sql
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 3. Storage Security
```sql
-- Users can upload files only to their own folder
CREATE POLICY "Users can upload files to their orders"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### File Upload Security

```typescript
// Client-side validation
const validateFile = (file: File) => {
  // Size check (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File too large')
  }

  // Type check
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
}

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('order-files')
  .upload(`${user.id}/${fileName}`, file)
```

## 💰 Payment Integration (Razorpay)

### Flow:

1. **Order Created** → `payment_status: 'pending'`
2. **Redirect to Payment Page** → `/payment/[order_id]`
3. **Razorpay Checkout** → User pays
4. **Payment Success** → Update order:
   ```typescript
   await supabase.from('orders').update({
     payment_status: 'paid',
     transaction_id: paymentId,
     order_status: 'confirmed'
   }).eq('id', orderId)
   ```
5. **Create Payment Record**:
   ```typescript
   await supabase.from('payments').insert({
     order_id,
     amount,
     payment_method: 'razorpay',
     transaction_id,
     status: 'success'
   })
   ```

## 📊 Database Schema

### Tables:

1. **users** - Extended auth.users with role
2. **services** - Available printing services
3. **orders** - Customer orders
4. **payments** - Payment transactions
5. **admin_notes** - Internal admin notes

### Key Relationships:
- `orders.user_id` → `users.id`
- `orders.service_id` → `services.id`
- `payments.order_id` → `orders.id`
- `admin_notes.order_id` → `orders.id`
- `admin_notes.admin_id` → `users.id`

## 🔔 Notifications

### Email Notifications (Supabase Built-in)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Email change

### Order Confirmation Email

Option 1: Supabase Edge Function
```typescript
// Edge Function: send-order-confirmation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { order_id } = await req.json()
  // Fetch order details
  // Send email using Supabase or Resend/SendGrid
  return new Response("Email sent")
})
```

Option 2: Webhook from Payment Gateway
1. Set up webhook on Razorpay
2. Call Edge Function on successful payment
3. Edge Function sends email

## 👤 Admin Panel

### Features:
- View all orders with filters
- Update order status (pending → printing → delivered)
- Download uploaded files
- Add internal notes (not visible to users)
- View payment status

### Access Control:
- Only users with `role = 'admin' in users table can access
- Protected by RLS policies
- Redirect non-admin users to home page

## 📱 Code Snippets

### Authentication Flow

#### Email Sign Up:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: { full_name: 'John Doe' }
  }
})

// Create user profile
await supabase.from('users').insert({
  id: data.user.id,
  email: 'user@example.com',
  full_name: 'John Doe',
  role: 'user'
})
```

#### Phone OTP Login:
```typescript
// Send OTP
await supabase.auth.signInWithOtp({
  phone: '+919876543210'
})

// Verify OTP
await supabase.auth.verifyOtp({
  phone: '+919876543210',
  token: '123456',
  type: 'sms'
})
```

### Order Submission

```typescript
const { data, error } = await supabase.from('orders').insert({
  user_id: user.id,
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+919876543210',
  service_type: 'Color Printing',
  number_of_pages: 100,
  paper_type: 'a4-premium',
  is_emergency: false,
  delivery_address: '123 Main St, Delhi',
  file_url: 'https://...',
  total_amount: 1000,
  payment_status: 'pending',
  order_status: 'pending'
})
```

### Fetching Orders

```typescript
// User's orders (RLS enforces user_id = auth.uid())
const { data } = await supabase
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false })

// Admin - all orders
const { data: allOrders } = await supabase
  .from('orders')
  .select('*, users(full_name, email)')
  .order('created_at', { ascending: false })
```

### File Upload

```typescript
const uploadFile = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('order-files')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('order-files')
    .getPublicUrl(fileName)

  return publicUrl
}
```

## 🚀 Deployment

### Vercel (Recommended for Next.js):

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel Dashboard
4. Deploy automatically on push

### Other Platforms:
- Netlify
- AWS Amplify
- Cloudflare Pages

## 📈 Scaling Considerations

### What Scales Automatically:
- **Database**: Supabase PostgreSQL scales automatically
- **Storage**: S3-compatible storage scales automatically
- **Auth**: Handles unlimited users

### What You Monitor:
- **Costs**: Supabase usage (bandwidth, storage, database size)
- **Performance**: Use Supabase Dashboard metrics
- **Edge Functions**: Monitor execution time and errors

### Cost Optimization:
1. **Storage**: Delete old files periodically
2. **Database**: Archive old orders
3. **Caching**: Use Supabase real-time subscriptions instead of polling

## 🔒 Best Practices

1. **Never expose Service Role Key**: Only use on server
2. **Always validate on client**: Before sending to Supabase
3. **Use RLS policies**: For all data access
4. **Implement rate limiting**: Via Edge Functions if needed
5. **Sanitize user inputs**: Supabase handles most, but be careful
6. **Monitor logs**: Supabase logs for debugging
7. **Backup database**: Supabase does daily backups, but export regularly

## 🐛 Troubleshooting

### Common Issues:

#### 1. RLS Policy Blocking Access
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Temporarily disable RLS for debugging
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
```

#### 2. File Upload Fails
- Check storage policy
- Verify file size limit
- Check bucket permissions
- Review Supabase logs

#### 3. Auth Not Working
- Verify auth providers are enabled
- Check email templates
- Review SMS provider configuration
- Check network requests in browser dev tools

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.gg/supabase
- Next.js Docs: https://nextjs.org/docs

## 📄 License

This project is for demonstration purposes. Customize as needed for your use case.
