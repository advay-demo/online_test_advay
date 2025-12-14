# Neon DB Setup Guide

## ✅ What Changed

Your deployment has been updated to use **Neon DB** instead of Render's PostgreSQL.

### Benefits:
- 💰 **Save $7/month** - Neon DB free tier is generous
- ⚡ **Better performance** - Neon is optimized for serverless
- 🌐 **No cold starts** - Database is always active
- 📦 **More storage** - Free tier includes 0.5GB storage

---

## Your Neon DB Connection

**Connection String:**
```
postgresql://neondb_owner:npg_9HAJz7WwSEiC@ep-long-tree-ad7bfusc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Important:** This connection string is already configured in the environment variables guide!

---

## Updated Architecture

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)               │
│    https://your-app.vercel.app         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│     Render Web Service (Django)         │
│   https://yaksh-backend.onrender.com   │
└──────┬──────────────────┬───────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│  Neon DB     │   │ Render Redis │
│ (PostgreSQL) │   │   (Cache)    │
└──────────────┘   └──────────────┘
       ▲
       │
┌──────────────────┐
│  Celery Worker   │
│    (Render)      │
└──────────────────┘
```

---

## Deployment Steps with Neon DB

### Step 1: ✅ COMPLETED
Configuration files updated to use Neon DB

### Step 2: Push to GitHub
```bash
cd /Users/mohitrana/Desktop/online_test
git add .
git commit -m "Add Render deployment with Neon DB"
git push origin main
```

### Step 3: Deploy Blueprint on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. New → Blueprint
3. Connect your GitHub repo
4. Click "Apply"

Render will create:
- ✅ Redis instance
- ✅ Web service
- ✅ Celery worker

### Step 4: Add Environment Variables

**CRITICAL:** You must add `DATABASE_URL` manually to both services!

#### For Web Service (`yaksh-backend`):
```
DATABASE_URL=postgresql://neondb_owner:npg_9HAJz7WwSEiC@ep-long-tree-ad7bfusc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
ALLOWED_HOSTS=yaksh-backend.onrender.com
DOMAIN_HOST=https://yaksh-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### For Celery Worker (`yaksh-celery`):
```
DATABASE_URL=postgresql://neondb_owner:npg_9HAJz7WwSEiC@ep-long-tree-ad7bfusc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 5: Migrations
Database migrations will run automatically during deployment!

The build command includes:
```bash
python manage.py migrate
```

### Step 6: Create Superuser
Once deployed, go to Render Shell:
```bash
python manage.py createsuperuser
```

---

## Testing Neon DB Connection Locally

Test the connection on your local machine:

```bash
# Activate your virtual environment
cd /Users/mohitrana/Desktop/online_test
source venv/bin/activate

# Set the DATABASE_URL
export DATABASE_URL="postgresql://neondb_owner:npg_9HAJz7WwSEiC@ep-long-tree-ad7bfusc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
export DEBUG=False

# Test connection
python manage.py check --database default

# Run migrations
python manage.py migrate

# Create test superuser
python manage.py createsuperuser
```

---

## Neon DB Dashboard

Access your Neon DB dashboard at:
- https://console.neon.tech/

Here you can:
- Monitor database usage
- View query performance
- Manage backups
- See connection stats
- Scale if needed

---

## Cost Breakdown

### Neon DB Free Tier Limits:
- Storage: 0.5 GB
- Data Transfer: 3 GB/month
- Branches: 1 project
- Always Active: Yes ✅

### Render Costs:
- Redis: $10/month
- Web Service: $7/month
- Celery Worker: $7/month

**Total: $24/month** (vs $31/month with Render PostgreSQL)

---

## Scaling Options

If you exceed Neon's free tier:

### Neon Paid Plans:
- **Launch:** $19/month - 10GB storage, 100GB transfer
- **Scale:** $69/month - 50GB storage, 500GB transfer

### Alternative:
- Keep Neon free tier for database
- Use Render PostgreSQL only if needed ($7/month)

---

## Security Notes

✅ **Connection String Security:**
- Your connection string is already secured with SSL (`sslmode=require`)
- Neon uses connection pooling by default (`-pooler` in URL)
- Never commit connection strings to git (use environment variables)

✅ **Best Practices:**
- Store `DATABASE_URL` in Render's environment variables
- Use different databases for dev/staging/production
- Enable Neon's IP allowlist if needed
- Rotate credentials periodically

---

## Troubleshooting

### Issue: "SSL connection required"
**Solution:** Your connection string already includes `sslmode=require` ✅

### Issue: "Connection pool exhausted"
**Solution:** Neon free tier has connection limits. Upgrade plan or optimize queries.

### Issue: "Database doesn't exist"
**Solution:** Check that database name is `neondb` (it's in your connection string)

### Issue: "Permission denied"
**Solution:** Verify the username is `neondb_owner` and password is correct

---

## Next Steps

1. ✅ Files are updated for Neon DB
2. Push to GitHub (Step 2)
3. Deploy on Render (Step 3)
4. Add environment variables (Step 4)
5. Create superuser (Step 6)
6. Connect frontend to backend

You're ready to deploy! 🚀

