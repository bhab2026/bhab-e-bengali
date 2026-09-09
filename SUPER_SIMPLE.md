# 🍛 YOUR RESTAURANT WEBSITE IN 20 CLICKS

**Just do these 20 steps. That's it. Takes 30 minutes.**

---

## ✅ STEP 1-5: CREATE DATABASE

### STEP 1
- Open Google Chrome
- Go to: `supabase.com`
- Click **"Start Your Project"** button

### STEP 2
- Click **"GitHub"** button
- (If you don't have GitHub, click "Create an account" first)
- Click **"Authorize netlify"**

### STEP 3
- Enter email: (any email you use)
- Create password: (write it down!)
- Enter username: `bengali-kitchen` (or any name)
- Click **"Create account"**
- Check your email, click verification link

### STEP 4
- Back on Supabase
- **Project Name:** `bhab-e-bengali`
- **Password:** (any password, write it down)
- **Region:** Leave default
- Click **"Create new project"**
- ⏳ Wait 2-3 minutes...

### STEP 5
- Look for **"Settings"** on left
- Click **"API"**
- See **"Project URL"** - Copy it (Ctrl+C)
- See **"Anon Key"** - Copy it (Ctrl+C)
- Paste both in Notepad and save

✅ **Database Done!**

---

## ✅ STEP 6-10: CREATE WEBSITE PROJECT

### STEP 6
- Open `github.com`
- Click **"+"** (top right)
- Click **"New repository"**

### STEP 7
- **Repository name:** `bhab-e-bengali`
- **Description:** `Bengali Restaurant`
- Click **"Public"**
- Leave everything else blank
- Click **"Create repository"**

✅ **GitHub Project Done!**

---

## ✅ STEP 11-15: MAKE IT LIVE

### STEP 11
- Open `netlify.com`
- Click **"Sign up"** (top right)
- Click **"GitHub"**
- Click **"Authorize netlify"**

### STEP 12
- Click **"Add new site"**
- Click **"GitHub"**
- Click your repository: `bhab-e-bengali`

### STEP 13
- Don't change anything
- Click **"Deploy site"** button
- ⏳ Wait 5 minutes (it will turn green)

### STEP 14
- Copy the link at top (looks like: `https://happy-abc123.netlify.app`)
- Save it - this is your website!

### STEP 15
- Click **"Site settings"** (top menu)
- Click **"Build & deploy"**
- Click **"Environment"**
- Click **"Edit variables"**

Add variable 1:
```
Key: REACT_APP_SUPABASE_URL
Value: (paste your Project URL from Step 5)
```

Add variable 2:
```
Key: REACT_APP_SUPABASE_KEY
Value: (paste your Anon Key from Step 5)
```

✅ **Website Live!**

---

## ✅ STEP 16-17: ADD YOUR MENU

### STEP 16
- Go to `supabase.com`
- Click your project
- Click **"Editor"** (left side)
- Click **"menu_items"** (in table list)

### STEP 17
- Click **"Insert row"**
- Fill in:
  - **name:** (your dish name)
  - **description:** (short description)
  - **category:** `chicken` (or fish, mutton, vegetarian)
  - **price:** (number like 250)
  - **prep_time_mins:** (like 30)
  - **available:** Toggle to YES
- Click **"Save"**
- Repeat for each dish

✅ **Menu Added!**

---

## ✅ STEP 18-20: TEST & SHARE

### STEP 18
- Copy your website link from Step 14
- Open it in browser
- Enter phone: `9876543210`
- Click **"Send OTP"**
- Copy the OTP shown
- Paste it in OTP box
- Click **"Verify"**

✅ You should see your menu!

### STEP 19
- Test on your phone too
- Tap menu items
- Add to cart
- Make sure it works

### STEP 20
- Share your website link with customers
- Post on WhatsApp, Instagram, email
- Done! 🎉

---

## 📝 THAT'S IT!

Your website is LIVE.

Customers can:
- Visit your link
- Login with phone
- Browse menu
- Order food
- Track order

---

## 🔗 YOUR WEBSITE LINK

**Save this:** `https://your-netlify-link.netlify.app`

This is what you give customers!

---

## 📱 MANAGE ORDERS

1. Go to your website
2. Login as customer
3. Look for 👤 button (top right)
4. Click it = Admin Dashboard
5. You see all orders
6. Click to change status
7. Approve reviews

---

## 🆘 QUICK HELP

**"Deploy failed"?** 
- Wait 10 minutes and try again

**"Blank website"?**
- Go to Step 15 and make sure variables are added
- Wait 5 min
- Refresh website (Ctrl+R)

**Login not working?**
- Make sure Step 5 was done correctly
- Supabase link and key must be exactly copied

**Menu not showing?**
- Wait 1 minute after adding items
- Refresh website

**Still stuck?**
- Go back and do the step again carefully
- Read the exact words on your screen
- Make sure you click the right button

---

## ✨ YOU'RE DONE!

No more steps. Website is working. Customers can order. You made a real business! 

🍛 Congrats!
