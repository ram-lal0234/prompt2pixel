# Supabase Setup Guide for Prompt2Pixel

## 🚀 **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `prompt2pixel` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## 🔧 **Step 2: Get API Keys**

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

## 📝 **Step 3: Set Environment Variables**

Create or update your `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Existing variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
OPENAI_API_KEY=your_openai_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## 🗄️ **Step 4: Create Database Schema**

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click "Run" to execute the schema

This will create:
- ✅ Users table (extends Clerk)
- ✅ Chats table
- ✅ Messages table
- ✅ User preferences table
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for timestamps

## 🗂️ **Step 5: Create Storage Bucket**

After the database schema is created, you can create the storage bucket:

1. **Option A: Use the Storage Service (Recommended)**
   - The storage bucket will be created automatically when you first use the chat interface
   - The `StorageService` will handle bucket creation with proper configuration

2. **Option B: Manual Creation**
   - Go to **Storage** in your Supabase dashboard
   - Click **"New bucket"**
   - Name: `thumbnails`
   - Public: `false` (for security)
   - File size limit: `10MB`
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

## 🔐 **Step 6: Configure Authentication**

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL: `http://localhost:3000`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/chat`
   - `http://localhost:3000/`
4. Save changes

## 🎯 **Step 7: Test the Integration**

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in with Clerk
3. Navigate to `/chat`
4. Try creating a new chat
5. Send a message
6. Check Supabase dashboard to see data being stored

## 📊 **Step 8: Monitor Data**

In your Supabase dashboard, you can monitor:

- **Table Editor**: View stored data
- **Logs**: Check for errors
- **Realtime**: Monitor live connections
- **API**: Test API endpoints

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Invalid API key" error**
   - Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables
   - Ensure the keys are copied correctly from Supabase dashboard

2. **"RLS policy violation" error**
   - Verify Clerk integration is working
   - Check user authentication status

3. **"Table doesn't exist" error**
   - Run the schema SQL again
   - Check table names match exactly

4. **Real-time not working**
   - Check network connectivity
   - Verify subscription setup

### **Debug Commands:**

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
curl -X GET "https://jwmmaajbkqzaxbqucnga.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"
```

## 📈 **Next Steps**

After successful setup:

1. **Integrate with chat interface** (already done)
2. **Add image storage** (Supabase Storage)
3. **Implement memory system** (Mem0i + Qdrant)
4. **Add analytics** (Supabase Analytics)

## 🔗 **Useful Links**

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🎉 **Success Indicators**

You'll know everything is working when:

- ✅ Users can sign in with Clerk
- ✅ Chats are created and stored
- ✅ Messages are saved to database
- ✅ Real-time updates work
- ✅ Data appears in Supabase dashboard
- ✅ No console errors in browser
- ✅ Console shows "Supabase URL: https://jwmmaajbkqzaxbqucnga.supabase.co" and "Supabase Key: Set"
- ✅ Environment variables are properly set: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Need help?** Check the Supabase logs or create an issue in the repository.
