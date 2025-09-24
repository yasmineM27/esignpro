# 🔧 **Configuration Infomaniak - Instructions Exactes**

## 🚨 **Problème Actuel**
```
sh: 1: next: not found
```
**Cause :** Next.js n'est pas installé ou accessible sur le serveur.

## ✅ **Solution - Étapes Exactes**

### **Étape 1 : Arrêter l'Application**
1. **Panneau Infomaniak** → Hébergement Web → Sites
2. **Sélectionner** : esignpro.ch
3. **Onglet** : Node.js
4. **Cliquer** : "Arrêter" (bouton rouge)

### **Étape 2 : Modifier la Configuration**

**Dans "Paramètres avancés" :**

| Paramètre | Ancienne Valeur | **Nouvelle Valeur** |
|-----------|----------------|-------------------|
| Version Node.js | 22 | **18** |
| Commande de construction | `npm run build` | **`npm install && npm run build`** |
| Commande d'exécution | `npm start` | **`npx next start -p 3000`** |
| Port d'écoute | 3000 | **3000** ✅ |

### **Étape 3 : Variables d'Environnement**

**Ajouter ces variables :**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://esignpro.ch
PORT=3000
TEST_CLIENT_EMAIL=yasminemassaoudi27@gmail.com
```

### **Étape 4 : Upload des Fichiers**

**Via FTP/File Manager, uploader :**
- `package.json` (modifié)
- `start.js` (nouveau)
- `next.config.js`
- Tous les autres fichiers du projet

### **Étape 5 : Redémarrer**

1. **Cliquer** : "Démarrer" l'application
2. **Attendre** 2-3 minutes pour l'installation
3. **Vérifier** les logs

## 🔄 **Alternative si Ça Échoue Encore**

### **Option A : Commande Plus Robuste**

```
Commande d'exécution: node start.js
```

### **Option B : Installation Forcée**

```
Commande de construction: rm -rf node_modules && npm install && npm run build
```

### **Option C : Hébergement Statique**

Si Node.js continue de poser problème :

1. **Désactiver** Node.js
2. **Activer** hébergement web classique
3. **Build local** : `npm run build && npm run export`
4. **Upload** le contenu du dossier `out/`
5. **Utiliser** le fichier `.htaccess` créé

## 📊 **Vérification du Succès**

### **Logs Attendus :**
```
✅ Installation des dépendances...
✅ Construction de l'application...
✅ Application démarrée sur le port 3000
```

### **URLs à Tester :**
- https://esignpro.ch ➜ Page d'accueil
- https://esignpro.ch/agent ➜ Interface agent
- https://esignpro.ch/api/health ➜ API de santé

## 🚨 **Si Ça Ne Marche Toujours Pas**

### **Diagnostic :**

1. **Vérifier** que tous les fichiers sont uploadés
2. **Vérifier** les permissions (755 pour dossiers, 644 pour fichiers)
3. **Consulter** les logs détaillés dans le panneau
4. **Contacter** le support Infomaniak si nécessaire

### **Solution de Secours :**

**Hébergement Statique (100% Fonctionnel) :**

1. **Désactiver** Node.js dans le panneau
2. **Utiliser** l'hébergement web classique
3. **Upload** les fichiers statiques générés
4. **Utiliser** le fichier `.htaccess` pour les routes

## 📞 **Support**

Si vous avez besoin d'aide :
1. **Copier-coller** les logs d'erreur exacts
2. **Vérifier** la version Node.js supportée par votre plan
3. **Contacter** le support Infomaniak si nécessaire

---

## 🎯 **Résumé des Actions**

1. ✅ **Arrêter** l'application
2. ✅ **Changer** Node.js 22 → 18
3. ✅ **Modifier** commande : `npx next start -p 3000`
4. ✅ **Ajouter** variables d'environnement
5. ✅ **Upload** fichiers corrigés
6. ✅ **Redémarrer** l'application

**🚀 Après ces étapes, votre application devrait fonctionner sur https://esignpro.ch !**
