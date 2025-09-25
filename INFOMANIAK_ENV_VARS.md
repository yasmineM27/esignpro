# 🔧 Variables d'Environnement pour Infomaniak

## 📧 Configuration Email avec Domaine Vérifié

Ajoutez ces variables dans le panneau Infomaniak :

```env
# Configuration de base
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://esignpro.ch
PORT=3000

# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vtbojyaszfsnepgyeoke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Ym9qeWFzemZzbmVwZ3llb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0OTM1ODMsImV4cCI6MjA3NDA2OTU4M30.CAILVDhosSQ1aMd9XTrGLvOIF15R4Kv3rbzSVqz0Tng
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Ym9qeWFzemZzbmVwZ3llb2tlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ5MzU4MywiZXhwIjoyMDc0MDY5NTgzfQ.imbjVr7_cM5p9BJ_RMyUiuPfJhn5IpVQ1i18XauZ4vg

# Configuration Email - DOMAINE VÉRIFIÉ esignpro.ch
RESEND_API_KEY=re_Tx7YrXqY_3qJRkmWvFDi2B8zZpgrwMiCb
EMAIL_FROM=noreply@esignpro.ch
EMAIL_FROM_NAME=eSignPro
EMAIL_REPLY_TO=support@esignpro.ch

# IMPORTANT: Forcer le mode production pour les emails
FORCE_PRODUCTION_EMAIL=true

# Email de test (pour développement uniquement)
TEST_CLIENT_EMAIL=yasminemassaoudi27@gmail.com
```

## 🎯 Changements Importants

### ✅ Avant (Problématique)

```
EMAIL_FROM=onboarding@resend.dev  ❌ Domaine de test
```

### ✅ Après (Correct)

```
EMAIL_FROM=noreply@esignpro.ch    ✅ Votre domaine vérifié
EMAIL_REPLY_TO=support@esignpro.ch ✅ Votre domaine vérifié
```

## 🔍 Vérifications à Faire

1. **Dans Resend Dashboard** :

   - ✅ Domaine `esignpro.ch` vérifié
   - ✅ DNS records configurés
   - ✅ Status "Verified" vert

2. **Dans Infomaniak** :
   - ✅ Variables d'environnement mises à jour
   - ✅ `NODE_ENV=production`
   - ✅ Redémarrage de l'application

## 🚀 Test Après Déploiement

Une fois déployé, testez avec :

```bash
curl -X POST https://esignpro.ch/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"clientEmail":"test@example.com","clientName":"Test Client"}'
```

## 📋 Checklist de Déploiement

- [ ] Variables d'environnement mises à jour
- [ ] Application redémarrée
- [ ] Test d'envoi d'email
- [ ] Vérification des logs
- [ ] Confirmation de réception
