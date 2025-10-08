# 🔧 Environment Setup Guide

## Creating Your .env File

Since `.env` files contain sensitive information, they're not included in the repository. Here's how to create yours:

---

## 🚀 Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
./setup-env.sh
```

This will prompt you for your Supabase credentials and create the `.env` file automatically.

---

## 📝 Option 2: Manual Setup

Create a `.env` file in the project root with the following content:

```env
# SongWars Environment Configuration

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================

# Your Supabase project URL (get from Supabase Dashboard → Settings → API)
NUXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Your Supabase anon/public key (get from Supabase Dashboard → Settings → API)
NUXT_PUBLIC_SUPABASE_KEY=your_anon_public_key

# Your Supabase service role key (get from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Base URL for your application (development)
NUXT_PUBLIC_BASE_URL=http://localhost:3000

# Base URL for assets and routing (usually / for root domain)
NUXT_APP_BASE_URL=/

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================

# Enable Nuxt devtools in development
NUXT_DEVTOOLS=true
```

---

## 🔑 Getting Your Supabase Credentials

### Step 1: Go to Supabase Dashboard
1. Visit [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your SongWars project

### Step 2: Get API Keys
1. Go to **Settings** → **API**
2. Copy the following values:

#### **Project URL**
```
https://your-project-ref.supabase.co
```

#### **anon public key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **service_role key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Verification Steps

After creating your `.env` file:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check for errors** in the console

3. **Test the connection** by trying to sign up or sign in

4. **Verify the values** are correct in your `.env` file

---

## 🔒 Security Notes

- **Never commit** your `.env` file to version control
- **Keep your service role key secret** - it has admin privileges
- **Use different keys** for development and production
- **Rotate keys regularly** for security

---

## 🚨 Troubleshooting

### "Your project's URL and Key are required"
- Check that `.env` file exists in project root
- Verify `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_KEY` are set
- Restart the development server

### "Invalid API key"
- Check that you copied the correct keys from Supabase Dashboard
- Verify there are no extra spaces or characters
- Make sure you're using the anon key, not the service role key for public variables

### "Connection failed"
- Check your internet connection
- Verify the Supabase project URL is correct
- Make sure your Supabase project is active

---

## 📚 Additional Resources

- [Supabase Setup Specification](SUPABASE_SETUP_SPEC.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Nuxt.js Environment Variables](https://nuxt.com/docs/guide/concepts/auto-imports#environment-variables) 