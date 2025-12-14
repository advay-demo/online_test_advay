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
- PostgreSQL database (`yaksh-db`)
- Redis instance (`yaksh-redis`)
- Web service (`yaksh-backend`)
- Celery worker (`yaksh-celery`)

---

### Step 4: Configure Environment Variables

After deployment completes:

1. Go to your web service (`yaksh-backend`)
2. Click **Environment** tab
3. Add these variables:

```
ALLOWED_HOSTS=yaksh-backend.onrender.com
DOMAIN_HOST=https://yaksh-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

4. Click **Save Changes** (triggers redeploy)

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

**Starter Plan (Production):**
- PostgreSQL: $7/month
- Redis: $10/month
- Web Service: $7/month
- Celery Worker: $7/month
- **Total: $31/month**

**Free Tier (Testing):**
- Services sleep after 15min inactivity
- Limited to 750 hours/month

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

