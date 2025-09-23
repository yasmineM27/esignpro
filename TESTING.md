# Guide de Test Complet - eSignPro

## 🚀 Tests Automatisés

### 1. Test des Emails
```bash
npm run test:email
```
**Ce que ça teste :**
- ✅ Configuration Resend API
- ✅ Envoi d'emails HTML
- ✅ Templates d'email
- ✅ Réception des emails

### 2. Test Complet de l'Application
```bash
npm run test:complete
```
**Ce que ça teste :**
- ✅ Connexion base de données Supabase
- ✅ Service email fonctionnel
- ✅ Workflow complet (création → signature → finalisation)
- ✅ Variables d'environnement

### 3. Démonstration Complète
```bash
npm run demo
```
**Ce que ça fait :**
- 🔄 Crée un dossier de résiliation
- 📧 Envoie l'email d'invitation client
- 📄 Simule l'upload de documents
- 📧 Envoie l'email de rappel
- ✍️ Simule la signature électronique
- 📧 Envoie l'email de confirmation

## 🖥️ Tests Interface Utilisateur

### 1. Page de Connexion
**URL :** http://localhost:3001/login

**Tests à effectuer :**
- [ ] Affichage correct du formulaire
- [ ] Validation des champs email/mot de passe
- [ ] Messages d'erreur appropriés
- [ ] Redirection après connexion réussie

**Comptes de test :**
- **Admin :** yasminemassaoudi27@gmail.com / admin123
- **Agent :** wael.hamda@esignpro.ch / agent123

### 2. Espace Admin
**URL :** http://localhost:3001/admin

**Tests à effectuer :**
- [ ] Dashboard avec statistiques
- [ ] Gestion des agents
- [ ] Configuration des templates email
- [ ] Rapports et analytics
- [ ] Audit trail
- [ ] Configuration email

### 3. Espace Agent
**URL :** http://localhost:3001/agent

**Tests à effectuer :**
- [ ] Navigation entre sections
- [ ] Création nouveau dossier
- [ ] Liste des clients
- [ ] Dossiers en attente/terminés
- [ ] Envoi d'invitations client

### 4. Workflow Client
**URL :** http://localhost:3001/client/[token]

**Tests à effectuer :**
- [ ] Accès via token sécurisé
- [ ] Upload de documents d'identité
- [ ] Validation des types de fichiers
- [ ] Signature électronique
- [ ] Confirmation finale

## 🔧 Tests de Configuration

### Variables d'Environnement
Vérifiez que toutes ces variables sont configurées dans `.env.local` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vtbojyaszfsnepgyeoke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend
RESEND_API_KEY=re_Tx7YrXqY_3qJRkmWvFDi2B8zZpgrwMiCb
EMAIL_FROM=onboarding@resend.dev
EMAIL_REPLY_TO=onboarding@resend.dev

# Test
TEST_AGENT_EMAIL=yasminemassaoudi27@gmail.com
TEST_CLIENT_EMAIL=yasminemassaoudi27@gmail.com
```

### Base de Données
1. **Schéma :** Exécutez `database/supabase-schema.sql` dans Supabase SQL Editor
2. **Données :** Exécutez `database/test-data.sql` dans Supabase SQL Editor
3. **Vérification :** Lancez `npm run test:complete`

## 📧 Tests Email Détaillés

### 1. Configuration Resend
- [ ] Clé API valide
- [ ] Domaine vérifié (ou utilisation de onboarding@resend.dev)
- [ ] Limites de taux respectées

### 2. Types d'Emails Testés
- [ ] **Email de test** - Vérification configuration
- [ ] **Invitation client** - Avec lien sécurisé
- [ ] **Rappel documents** - Si documents manquants
- [ ] **Confirmation finale** - Dossier terminé

### 3. Contenu des Emails
- [ ] HTML bien formaté
- [ ] Variables remplacées correctement
- [ ] Liens fonctionnels
- [ ] Images et styles corrects

## 🐛 Résolution des Problèmes Courants

### Erreur "acceptedTypes.join is not a function"
**Solution :** Corrigée dans `components/file-uploader.tsx`
```typescript
accept={Array.isArray(acceptedTypes) ? acceptedTypes.join(",") : acceptedTypes}
```

### Erreur "Users is not defined"
**Solution :** Ajout de l'import dans `components/agent-clients.tsx`
```typescript
import { Users } from "lucide-react"
```

### Erreur Email "Domain not verified"
**Solution :** Utilisation de `onboarding@resend.dev` pour les tests

### Erreur Base de Données
**Solution :** Vérifiez que les scripts SQL ont été exécutés dans Supabase

## ✅ Checklist de Test Complet

### Avant de Commencer
- [ ] Variables d'environnement configurées
- [ ] Base de données Supabase configurée
- [ ] Application démarrée (`npm run dev`)

### Tests Automatisés
- [ ] `npm run test:email` - ✅ Réussi
- [ ] `npm run test:complete` - ✅ Réussi
- [ ] `npm run demo` - ✅ Réussi

### Tests Interface
- [ ] Page de connexion fonctionnelle
- [ ] Espace admin accessible
- [ ] Espace agent fonctionnel
- [ ] Workflow client complet

### Tests Email
- [ ] Réception des emails de test
- [ ] Liens dans les emails fonctionnels
- [ ] Formatage correct des emails

### Tests Workflow
- [ ] Création de dossier
- [ ] Upload de documents
- [ ] Signature électronique
- [ ] Finalisation du dossier

## 📊 Métriques de Réussite

**Application considérée comme fonctionnelle si :**
- ✅ Tous les tests automatisés passent
- ✅ Interface utilisateur responsive
- ✅ Emails envoyés et reçus
- ✅ Workflow complet sans erreur
- ✅ Base de données opérationnelle

## 🔄 Tests de Régression

Après chaque modification, relancez :
1. `npm run test:complete`
2. Test manuel de l'interface
3. Vérification des emails

## 📞 Support

En cas de problème :
1. Consultez les logs de l'application
2. Vérifiez les logs Supabase
3. Consultez les logs Resend
4. Créez une issue avec les détails de l'erreur
