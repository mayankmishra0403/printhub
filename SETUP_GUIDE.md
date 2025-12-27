# PrintHub Serverless - Setup Guide

## 🎉 Your Serverless Printing Application is Ready!

### What Has Been Built

A complete, production-ready printing service application using:
- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Supabase (Serverless BaaS)
- **Database**: PostgreSQL via Supabase
- **Auth**: Email + Phone OTP
- **Storage**: Supabase Storage (50MB limit per file)
- **Payments**: Razorpay integration
- **UI**: shadcn/ui + Tailwind CSS

## 📁 Key Files Created

### Database & Configuration
- `supabase/schema.sql` - Complete database schema with RLS policies
- `src/lib/supabase.ts` - Supabase client configuration
- `.env.example` - Environment variables template

### Pages & Components
- `src/app/login/page.tsx` - Email + Phone OTP authentication
- `src/app/orders/new/page.tsx` - Order submission with file upload
- `src/app/payment/[id]/page.tsx` - Payment processing
- `src/app/orders/page.tsx` - User order history
- `src/app/admin/page.tsx` - Admin dashboard
- `src/contexts/auth-context.tsx` - Authentication state management
- `src/components/navigation.tsx` - Updated with auth awareness

### Documentation
- `SERVERLESS_ARCHITECTURE.md` - Comprehensive architecture guide
  - How frontend acts as backend
  - Complete setup instructions
  - Security implementation
  - Code snippets for all operations
  - Troubleshooting guide
  - Deployment instructions

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Supabase Project (2 min)

1. Go to https://supabase.com
2. Click "New Project"
3. Enter project name (e.g., "PrintHub")
4. Choose a strong password
5. Wait for project to be ready (1-2 min)

### Step 2: Get Credentials (30 sec)

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - anon public key
   - service_role key (for admin operations)

### Step 3: Set Up Database (1 min)

1. Go to SQL Editor in Supabase
2. Copy contents of `supabase/schema.sql`
3. Paste and click "Run"
4. Verify all tables created successfully

### Step 4: Configure Auth (30 sec)

1. Go to Authentication → Providers
2. Enable Email provider
3. Enable Phone provider
4. Configure SMS provider (for OTP):
   - Click Phone → Set up SMS provider
   - Choose Twilio, MessageBird, or AWS SNS
   - Add API keys from your SMS provider

### Step 5: Configure Storage (30 sec)

1. Go to Storage in Supabase
2. Create bucket named `order-files`
3. Settings:
   - Public: No
   - File size limit: 52428800 (50MB)
   - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`
4. Policies are automatically created from schema.sql

### Step 6: Set Environment Variables (1 min)

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional - for Razorpay payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

### Step 7: Create Admin User (30 sec)

Run this in Supabase SQL Editor:

```sql
-- 1. Sign up via email/password on your site
-- 2. Then run this to make first user admin:

UPDATE public.users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

### Step 8: Start Development (Already Running!)

```bash
# The dev server is already running
# Access at: http://localhost:3000
```

## 🌐 Pages Overview

| Page | Route | Access | Description |
|------|--------|---------|-------------|
| Home | `/` | Public | Landing page with services |
| Services | `/services` | Public | Detailed services list |
| Contact | `/contact` | Public | Contact information |
| Login | `/login` | Public | Email + Phone OTP auth |
| My Orders | `/orders` | Authenticated | User's order history |
| New Order | `/orders/new` | Authenticated | Place order with file upload |
| Payment | `/payment/[id]` | Authenticated | Process payment for order |
| Admin | `/admin` | Admin only | Manage all orders |

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Users can only see their own orders
- ✅ Admins can see all orders and users
- ✅ File uploads restricted to user folders
- ✅ Internal notes hidden from users
- ✅ Payment records protected

### Data Validation
- ✅ File size validation (50MB limit)
- ✅ File type validation (PDF, JPEG, PNG only)
- ✅ Email format validation
- ✅ Required field validation
- ✅ Phone number format validation

### Auth Security
- ✅ Secure session management
- ✅ Protected routes redirect
- ✅ Role-based access control
- ✅ OTP for phone authentication

## 💳 Payment Flow

1. User submits order → Status: Pending
2. Redirect to payment page → `/payment/[order_id]`
3. Razorpay checkout opens
4. User pays successfully
5. Order updates:
   - `payment_status: 'paid'`
   - `order_status: 'confirmed'`
6. Payment record created in database
7. User redirected to orders page

## 📊 Database Schema Summary

### Tables

**users**
- Extends auth.users
- Fields: id, email, phone, full_name, role, created_at, updated_at

**services**
- Printing services catalog
- Fields: id, name, category, description, base_price, price_unit, is_active

**orders**
- Customer orders
- Fields: id, user_id, service_id, full_name, email, phone, service_type, number_of_pages, paper_type, is_emergency, delivery_address, file_url, file_name, file_size, total_amount, payment_status, order_status, transaction_id, notes, created_at, updated_at

**payments**
- Payment transactions
- Fields: id, order_id, user_id, amount, currency, payment_method, transaction_id, status, payment_data, created_at, updated_at

**admin_notes**
- Internal admin notes
- Fields: id, order_id, admin_id, note, is_internal, created_at, updated_at

## 🚀 Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel Dashboard
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - NEXT_PUBLIC_RAZORPAY_KEY_ID (optional)
```

### Environment Variables on Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:
- Add all variables from `.env.example`
- Do NOT include `_SERVICE_ROLE_KEY` on client-side

## 📧 Customization

### Change Prices

Edit `supabase/schema.sql`:

```sql
INSERT INTO public.services (name, category, description, base_price, price_unit) VALUES
('Your Service', 'Category', 'Description', 99.00, 'item')
```

### Add New Services

```sql
INSERT INTO public.services (name, category, description, base_price, price_unit) VALUES
('Custom Banner Printing', 'Large Format', 'Custom size banners', 299.00, 'sqft');
```

### Customize Email Templates

1. Go to Supabase Dashboard → Authentication
2. Click Email Templates
3. Customize templates for:
   - Confirm signup
   - Reset password
   - Email change

## 🔔 Email Notifications

### Option 1: Supabase Built-in
- Auth emails automatically sent
- For order emails, use Supabase Edge Functions

### Option 2: Custom Service

Set up webhook from Razorpay to your Edge Function:
1. Create Edge Function in Supabase
2. Configure webhook URL in Razorpay
3. Send emails on payment success

## 🐛 Troubleshooting

### Issue: Files Not Uploading

**Check:**
1. Storage bucket exists (`order-files`)
2. Storage policies are applied
3. File size < 50MB
4. File type is allowed

**Solution:**
```sql
-- Recreate storage policies
DELETE FROM storage.policies WHERE bucket_id = 'order-files';
-- Then run schema.sql again
```

### Issue: RLS Blocking Access

**Debug:**
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Check user role
SELECT * FROM public.users WHERE id = auth.uid();
```

### Issue: OTP Not Sending

**Check:**
1. Phone provider configured
2. SMS provider credits available
3. Phone number format correct (+91...)

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **shadcn/ui**: https://ui.shadcn.com

## ✅ Checklist Before Going Live

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Auth providers configured
- [ ] Storage bucket created
- [ ] Environment variables set
- [ ] Admin user created
- [ ] Razorpay test keys working
- [ ] Email notifications tested
- [ ] All pages working on mobile
- [ ] File upload tested (PDF, images)
- [ ] Payment flow tested end-to-end
- [ ] RLS policies verified
- [ ] Custom domain configured (if needed)

## 🎓 Next Steps

1. **Test Everything**
   - Create test user
   - Place test orders
   - Process payments
   - Verify admin dashboard
   - Test on mobile devices

2. **Customize Branding**
   - Update colors in `tailwind.config.ts`
   - Add your logo
   - Update company details in components

3. **Set Up Production Keys**
   - Get production Razorpay keys
   - Update environment variables
   - Test production flow

4. **Deploy**
   - Deploy to Vercel/Netlify
   - Configure custom domain
   - Set up SSL (automatic on Vercel)

5. **Monitor**
   - Check Supabase dashboard regularly
   - Monitor costs and usage
   - Review order analytics

---

**Need Help?**
- Check `SERVERLESS_ARCHITECTURE.md` for detailed guides
- Review Supabase logs for errors
- Test in development mode first

Good luck with your printing service! 🚀🖨️
