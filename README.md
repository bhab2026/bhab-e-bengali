# Bhab E Bengali - Authentic Bengali Cloud Kitchen Platform

A complete online ordering platform for authentic Bengali cuisine with real-time tracking, catering, and bulk order management.

## Features

### Customer Features
✅ **Phone + OTP Authentication** - Quick login with mobile number
✅ **Browse Menu** - Filter by category (Fish, Chicken, Mutton, Vegetarian, Rice, Thali, etc.)
✅ **View Item Details** - Prep time, availability status, pricing
✅ **Shopping Cart** - Add/remove items, adjust quantities
✅ **Regular Orders** - Order for delivery with real-time tracking
✅ **Customize Dishes** - Add/remove ingredients, adjust spice level
✅ **Catering Orders** - Plan events with bulk dish selection
✅ **Bulk Inquiry** - Request quotes for 50-100 person events
✅ **Order Tracking** - Real-time status (Preparing → Packed → Out for Delivery → Delivered)
✅ **Payment Options** - Online (UPI/Card) or Cash on Delivery
✅ **Leave Reviews** - Rate and review dishes (owner approval required)
✅ **Order History** - View past orders and reorder

### Owner/Admin Features
✅ **Admin Dashboard** - Manage all orders
✅ **Order Status Management** - Update order status in real-time
✅ **Review Approval** - Approve customer reviews before they appear
✅ **Delivery Tracking** - Track delivery status for each order
✅ **Order Analytics** - View all orders and customer activity

## Technology Stack

- **Frontend**: React 18
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Phone + OTP
- **Payments**: Razorpay (UPI, Cards, Wallets)
- **Hosting**: Netlify
- **Security**: Row Level Security (RLS) in Supabase

## Project Structure

```
bhab-e-bengali/
├── public/
│   └── index.html                 # HTML entry point
├── src/
│   ├── App.jsx                    # Main React app
│   └── index.js                   # React DOM render
├── package.json                   # Dependencies
├── bhab_e_bengali_schema.sql      # Supabase database schema
├── .env.example                   # Environment template
├── DEPLOYMENT_GUIDE.md            # Step-by-step deployment
└── README.md                      # This file
```

## Getting Started

### Prerequisites

1. **Supabase Account** (free tier available)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project

2. **GitHub Account** (for version control)
   - Sign up at [github.com](https://github.com)

3. **Netlify Account** (for hosting)
   - Sign up at [netlify.com](https://netlify.com)
   - Connect your GitHub account

4. **Razorpay Account** (for payments)
   - Sign up at [razorpay.com](https://razorpay.com) (optional, can use cash/mock for testing)

### Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once project is created, go to **SQL Editor**
3. Copy the entire content from `bhab_e_bengali_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to create all tables, indexes, and RLS policies

### Step 2: Get Supabase Credentials

1. Go to **Settings > API** in your Supabase project
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Key** (the `anon` public key, NOT the service role key)
3. Save these - you'll need them shortly

### Step 3: Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
   - Name: `bhab-e-bengali`
   - Description: "Authentic Bengali Cloud Kitchen Platform"
   - Make it **Public**
   - **Do NOT** initialize with README (we have one)

2. Clone the repo to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bhab-e-bengali.git
   cd bhab-e-bengali
   ```

3. Copy all files from this project into your local repository

4. Create `.env.local` file (copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

5. Fill in your Supabase credentials in `.env.local`:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_KEY=your_supabase_anon_key
   REACT_APP_RAZORPAY_KEY=your_razorpay_key_optional
   ```

6. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: Bhab E Bengali app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bhab-e-bengali.git
   git push -u origin main
   ```

### Step 4: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub**
4. Authorize Netlify to access your GitHub account
5. Select your `bhab-e-bengali` repository
6. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - Click **Deploy site**

### Step 5: Set Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Click **Site settings** → **Build & deploy** → **Environment**
3. Click **Edit variables**
4. Add these variables:
   ```
   REACT_APP_SUPABASE_URL = your_supabase_url
   REACT_APP_SUPABASE_KEY = your_supabase_anon_key
   REACT_APP_RAZORPAY_KEY = your_razorpay_public_key
   ```
5. Click **Trigger redeploy** from the Deploys tab

### Step 6: Test Your Live Site

Your site will be live at: `https://your-site-name.netlify.app`

1. Open the URL on desktop and mobile
2. Test login:
   - Enter any 10-digit phone number
   - Copy the OTP shown in browser console/alert
   - Verify OTP
3. Browse menu and add items to cart
4. Test checkout flow
5. Switch to admin mode (click 👤 button) to manage orders and reviews

## Available Pages & Features

### Public Pages
- **Home** - Login page with features showcase
- **Menu** - Browse items by category
- **Checkout** - Review cart and place order
- **Order Confirmation** - Real-time tracking
- **Order History** - View past orders

### Customer Features
- **Catering** - Request catering for events (50+ people)
- **Bulk Orders** - Submit inquiry for 50-100 person events
- **Reviews** - Rate and comment on dishes

### Admin Features
- **Dashboard** - Manage all orders
- **Order Status** - Update order through preparation stages
- **Review Approval** - Approve/reject customer reviews
- **Delivery Tracking** - Real-time delivery updates

## Authentication & Security

### Phone + OTP Flow
1. User enters 10-digit phone number
2. App generates 6-digit OTP (shown in demo)
3. In production, use SMS gateway (Twilio, AWS SNS, etc.)
4. OTP verified, user logged in
5. Each user only sees their own data (Row Level Security)

### Row Level Security (RLS)
- `users`: Users see only their own profile
- `orders`: Users see only their own orders
- `reviews`: Users see only approved reviews + their own
- `catering_orders`: Users see only their inquiries
- `bulk_orders`: Users see only their inquiries
- `delivery_tracking`: Users see only their order tracking

## Menu Categories

The default menu includes:
- **Fish**: Rui Kalia, Ilish Bhapa, Chingri Malai Curry, etc.
- **Chicken**: Kosha, Dak Bungalow, Rezala, etc.
- **Mutton**: Kosha, Jhol, Rak Bungalow, etc.
- **Vegetarian**: Paneer, Lentils, Vegetables, etc.
- **Rice & Breads**: Basmati, Ghee Rice, Roti, Paratha
- **Thali**: Complete meals with multiple items
- **Kichri**: Rice and lentil comfort dishes

Edit menu items directly in Supabase `menu_items` table.

## Customization

### Colors & Branding
Edit the `colors` object in `src/App.jsx`:
```javascript
const colors = {
  cream: '#F5E6D3',
  darkRed: '#8B1A1A',
  forestGreen: '#2D5016',
  gold: '#D4AF37',
  brown: '#4A2C2A',
  lightCream: '#F9F3ED',
};
```

### Adding More Features
- **Payment Gateway**: Integrate Razorpay in checkout
- **SMS Notifications**: Use Twilio for order updates
- **Email**: SendGrid for confirmations
- **Analytics**: Add Google Analytics

### Database Updates
- Add more menu items to `menu_items` table
- Adjust prices directly in Supabase
- Manage delivery addresses and settings

## Troubleshooting

### Build Errors
- Clear npm cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`
- Check Netlify build logs

### Database Connection Issues
- Verify Supabase URL and Anon Key in `.env.local`
- Check Netlify environment variables match
- Verify RLS policies are correct in Supabase

### OTP Not Working
- Check browser console for errors
- In demo, OTP is shown in alert - copy exactly
- For production, integrate real SMS gateway

### Phone Login Issues
- Verify phone number format (10 digits for demo)
- Check Supabase users table for records
- Ensure RLS policies allow operations

## Production Checklist

Before going live with real customers:

- [ ] Set up real SMS gateway (Twilio/AWS SNS)
- [ ] Integrate Razorpay payment gateway
- [ ] Add email notifications (SendGrid/Mailgun)
- [ ] Set up admin email alerts for orders
- [ ] Add Google Analytics
- [ ] Configure CORS in Supabase
- [ ] Set up SSL certificate (Netlify handles this)
- [ ] Create privacy policy and terms
- [ ] Add customer support email/chat
- [ ] Test on multiple devices and browsers
- [ ] Load testing for expected traffic
- [ ] Database backups enabled in Supabase

## Support & Documentation

### Official Docs
- **React**: https://react.dev
- **Supabase**: https://supabase.com/docs
- **Netlify**: https://docs.netlify.com
- **Razorpay**: https://razorpay.com/docs

### Contact
For issues or feature requests, create a GitHub issue in your repository.

## License

This project is created for Bhab E Bengali. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Built with**: React + Supabase + Netlify
