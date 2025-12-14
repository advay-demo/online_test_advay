# Render Deployment Guide

## ✅ Step 1: COMPLETED
Configuration files have been created:
- `render.yaml` - Blueprint configuration
- `requirements/requirements-production.txt` - Production dependencies
- `online_test/settings.py` - Updated with production settings
- `RENDER_ENV_VARS.md` - Environment variables reference

---

## 🚀 Next Steps

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

If you don't have a GitHub repo yet:

```bash
git init
git add .
git commit -m "Initial commit with Render config"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

---

### Step 3: Deploy on Render

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub repository
5. Render will detect `render.yaml`
6. Click **"Apply"**
7. Wait 5-10 minutes for deployment

This will create:
- Web service (`yaksh-backend`)
- Celery worker (`yaksh-celery`)

**Note:** Redis and PostgreSQL need to be added manually (see Step 3b below).

---

### Step 3b: Create Redis Manually

Before adding environment variables, create a Redis instance:

1. In Render Dashboard, click **"New +"** → **"Redis"**
2. Name: `yaksh-redis`
3. Plan: **Free**
4. Region: Same as your services (Oregon recommended)
5. Click **"Create Redis"**
6. Once created, copy the **Internal Redis URL** (starts with `redis://`)

---

### Step 4: Configure Environment Variables

After Redis is created and Blueprint deployment completes:

#### For Web Service (`yaksh-backend`):

1. Go to your web service (`yaksh-backend`)
2. Click **Environment** tab
3. Add these variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_9HAJz7WwSEiC@ep-long-tree-ad7bfusc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
REDIS_URL=redis://your-internal-redis-url:6379
ALLOWED_HOSTS=yaksh-backend.onrender.com
DOMAIN_HOST=https://yaksh-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### For Celery Worker (`yaksh-celery`):

4. Go to `yaksh-celery` service → **Environment** tab
5. Add these variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_9HAJz7WwSEiC@ep-long-tree-ad7bfusc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
REDIS_URL=redis://your-internal-redis-url:6379
```

6. Click **Save Changes** on both services (triggers redeploy)

**⚠️ Important:** Both services need `DATABASE_URL` and `REDIS_URL`!

See `RENDER_ENV_VARS.md` for more details.

---

### Step 5: Create Superuser

1. Go to web service → **Shell** tab
2. Run:
```bash
python manage.py createsuperuser
```

3. Follow prompts to create admin account

---

### Step 6: Configure Vercel Frontend

In Vercel project settings:

1. Settings → Environment Variables
2. Add:
```
VITE_API_URL=https://yaksh-backend.onrender.com
```

3. Redeploy frontend

---

### Step 7: Test Deployment

Visit:
- Backend Admin: `https://yaksh-backend.onrender.com/admin`
- API: `https://yaksh-backend.onrender.com/api/`
- Frontend: Your Vercel URL

---

## 📝 Important Notes

### What Works:
✅ User authentication
✅ Course creation
✅ Quiz creation (MCQ, Fill-in-blanks)
✅ Student enrollment
✅ Grading system
✅ Admin dashboard
✅ API endpoints
✅ Background tasks (Celery)

### What Doesn't Work (Yet):
❌ Code execution (Python, C++, Java, etc.)

Code execution requires a separate server with Docker. Can be added later.

---

## 💰 Costs

**Your Setup (FREE TIER):**
- Neon DB PostgreSQL: **FREE** ✅ (up to 0.5GB storage, 3GB transfer/month)
- Render Redis: **FREE** ✅
- Render Web Service: **FREE** ✅
- Render Celery Worker: **FREE** ✅
- **Total: $0/month** 🎉 **Completely FREE!**

**Free Tier Limitations:**
- Render services sleep after 15min inactivity (wake up in ~30 seconds)
- Limited to 750 hours/month total across all services
- Shared resources (slower performance)
- Neon DB free tier is always active (no sleep)

**To Upgrade Later (Production):**
- Change `plan: free` to `plan: starter` in render.yaml
- Cost would be: $24/month (Redis $10 + Web $7 + Worker $7)

---

## 🐛 Troubleshooting

### Issue: "Application failed to respond"
Check `ALLOWED_HOSTS` includes your Render URL

### Issue: "CORS error"
Update `CORS_ALLOWED_ORIGINS` with correct Vercel URL

### Issue: Static files not loading
Run in Render shell:
```bash
python manage.py collectstatic --no-input
```

### Issue: Database errors
Check if migrations ran:
```bash
python manage.py migrate
```

---

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- Environment Variables: See `RENDER_ENV_VARS.md`

---

Ready to deploy! Proceed with Step 2: Push to GitHub 🚀

