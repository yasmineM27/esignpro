# 🚀 **Déploiement Infomaniak - esignpro.ch**

## 📋 **Prérequis**

- ✅ Compte Infomaniak avec hébergement web
- ✅ Domaine `esignpro.ch` configuré
- ✅ Accès FTP/SFTP ou File Manager
- ✅ Support Node.js activé (si disponible)

## 🎯 **Options de Déploiement**

### **Option 1 : Hébergement Statique (Recommandé)**

#### **1. Build de Production**

```bash
# Dans votre projet local
npm run build
npm run export  # Si disponible, sinon utiliser next export
```

#### **2. Upload des Fichiers**

1. **Dossier à uploader** : `out/` ou `.next/` + `public/`
2. **Destination** : Racine de votre domaine `esignpro.ch`
3. **Méthode** : FTP, SFTP ou File Manager Infomaniak

#### **3. Configuration Apache (.htaccess)**

Créer un fichier `.htaccess` dans la racine :

```apache
# Redirection HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Support des routes Next.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Headers de sécurité
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache des assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>
```

### **Option 2 : Hébergement Node.js (Si Disponible)**

#### **1. Vérifier le Support Node.js**

Contactez Infomaniak pour vérifier si votre plan supporte Node.js.

#### **2. Configuration**

```bash
# Package.json - scripts de production
"scripts": {
  "build": "next build",
  "start": "next start -p 3000",
  "deploy": "npm run build && npm run start"
}
```

#### **3. Variables d'Environnement**

Configurer dans le panneau Infomaniak ou via `.env.production` :

```env
NEXT_PUBLIC_APP_URL=https://esignpro.ch
NODE_ENV=production
TEST_CLIENT_EMAIL=yasminemassaoudi27@gmail.com
```

## 🔧 **Configuration DNS**

### **1. Enregistrements DNS Requis**

Dans votre panneau Infomaniak DNS :

```
Type    Nom     Valeur                  TTL
A       @       [IP_SERVEUR_INFOMANIAK] 3600
A       www     [IP_SERVEUR_INFOMANIAK] 3600
CNAME   *       esignpro.ch             3600
```

### **2. Certificat SSL**

- ✅ Activer SSL/TLS dans le panneau Infomaniak
- ✅ Forcer HTTPS (redirection automatique)
- ✅ Vérifier le certificat Let's Encrypt

## 📧 **Configuration Email**

### **1. Emails avec Domaine esignpro.ch**

Configurer dans Infomaniak :

```
noreply@esignpro.ch
support@esignpro.ch
admin@esignpro.ch
```

### **2. Configuration SMTP**

```env
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_USER=noreply@esignpro.ch
SMTP_PASS=votre_mot_de_passe
```

### **3. Alternative Resend**

Garder Resend pour la fiabilité :

```env
RESEND_API_KEY=re_votre_cle
EMAIL_FROM=noreply@esignpro.ch
```

## 🚀 **Étapes de Déploiement**

### **Étape 1 : Préparation Locale**

```bash
# 1. Mettre à jour les variables
cp .env.production .env.local

# 2. Tester localement
npm run dev
# Vérifier que tout fonctionne avec esignpro.ch

# 3. Build de production
npm run build
```

### **Étape 2 : Upload**

1. **Se connecter** au FTP/SFTP Infomaniak
2. **Naviguer** vers le dossier de `esignpro.ch`
3. **Uploader** :
   - Tous les fichiers du dossier `out/` (export statique)
   - Ou dossier `.next/` + `public/` + `package.json` (Node.js)
4. **Créer** le fichier `.htaccess`

### **Étape 3 : Configuration**

1. **Variables d'environnement** (si Node.js supporté)
2. **Permissions** des fichiers (755 pour dossiers, 644 pour fichiers)
3. **Test** des URLs principales

### **Étape 4 : Tests**

1. **https://esignpro.ch** ➜ Page d'accueil
2. **https://esignpro.ch/agent** ➜ Interface agent
3. **https://esignpro.ch/api/health** ➜ API (si Node.js)

## 🔍 **Dépannage**

### **Erreur 404**

- Vérifier le fichier `.htaccess`
- Vérifier que `index.html` existe
- Vérifier les permissions

### **Erreur 500**

- Vérifier les logs Infomaniak
- Vérifier les variables d'environnement
- Vérifier les permissions PHP/Node.js

### **CSS/JS non chargés**

- Vérifier les chemins relatifs
- Vérifier le cache navigateur
- Vérifier les headers CORS

## 📊 **Avantages Infomaniak**

- ✅ **Domaine professionnel** : esignpro.ch
- ✅ **Hébergement suisse** : Conformité RGPD
- ✅ **Support technique** : En français
- ✅ **Emails inclus** : noreply@esignpro.ch
- ✅ **SSL gratuit** : Let's Encrypt
- ✅ **Backup automatique** : Sécurité des données

## 🎉 **Résultat Final**

Une fois déployé :

- **URL Production** : https://esignpro.ch
- **Interface Agent** : https://esignpro.ch/agent
- **API Email** : https://esignpro.ch/api/email-preview
- **Emails** : noreply@esignpro.ch

## 📞 **Support**

- **Documentation Infomaniak** : https://www.infomaniak.com/fr/support
- **Support technique** : Via le panneau client
- **Communauté** : Forum Infomaniak

---

**🚀 Votre application eSignPro sera accessible sur votre propre domaine professionnel !**
