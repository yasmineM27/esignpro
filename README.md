# eSignPro - Plateforme de Signature Électronique

Une plateforme complète de gestion des résiliations d'assurance avec signature électronique sécurisée.

## 🚀 Fonctionnalités

- **Gestion des dossiers** : Création et suivi des dossiers de résiliation
- **Signature électronique** : Signature sécurisée avec validation juridique
- **Workflow automatisé** : Processus guidé pour clients et agents
- **Notifications email** : Envoi automatique d'emails via Resend
- **Interface multi-rôles** : Espaces dédiés pour admins, agents et clients
- **Audit complet** : Traçabilité de toutes les actions
- **Sécurité avancée** : Chiffrement et tokens sécurisés

## 🛠️ Technologies

- **Frontend** : Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Supabase
- **Base de données** : PostgreSQL (Supabase)
- **Authentification** : Supabase Auth
- **Email** : Resend API
- **Tests** : Jest
- **UI Components** : Radix UI, Lucide Icons

## 📋 Prérequis

- Node.js 18+ 
- Compte Supabase
- Compte Resend (pour les emails)
- Git

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd insurance-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créez un nouveau projet sur [Supabase](https://supabase.com)
2. Allez dans **Settings > API** et copiez :
   - Project URL
   - Anon public key
   - Service role key (secret)

### 4. Configuration Resend

1. Créez un compte sur [Resend](https://resend.com)
2. Générez une clé API dans **API Keys**
3. Configurez votre domaine (optionnel)

### 5. Variables d'environnement

Copiez `.env.example` vers `.env.local` et configurez :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos vraies valeurs :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration (Resend)
RESEND_API_KEY=re_your-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=eSignPro
EMAIL_REPLY_TO=support@yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=eSignPro

# Test Configuration
TEST_AGENT_EMAIL=your-agent-email@gmail.com
TEST_CLIENT_EMAIL=your-client-email@gmail.com
```

### 6. Configuration de la base de données

1. Ouvrez l'éditeur SQL de Supabase
2. Exécutez le script `database/supabase-schema.sql`
3. Exécutez le script `database/test-data.sql` pour les données de test

```bash
# Aide-mémoire
npm run db:setup  # Instructions pour le schéma
npm run db:seed   # Instructions pour les données de test
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

### Comptes de test

- **Admin** : yasminemassaoudi27@gmail.com / admin123
- **Agent** : wael.hamda@esignpro.ch / agent123
- **Client** : Accès via lien sécurisé uniquement

## 📧 Démonstration complète avec emails

### Lancer la démo automatique

```bash
npm run demo
```

Cette commande :
1. Crée un dossier de résiliation
2. Envoie un email d'invitation au client
3. Simule l'upload de documents
4. Envoie un email de rappel
5. Simule la signature électronique
6. Envoie un email de confirmation

### Test manuel des emails

1. Connectez-vous en tant qu'admin
2. Allez dans **Configuration Email > Tests**
3. Envoyez un email de test à votre adresse

## 🧪 Tests

### Lancer tous les tests

```bash
npm run test
```

### Tests en mode watch

```bash
npm run test:watch
```

### Coverage des tests

```bash
npm run test:coverage
```

### Tests spécifiques

```bash
# Tests email uniquement
npm test -- tests/email.test.ts

# Tests workflow uniquement  
npm test -- tests/workflow.test.ts
```

## 📱 Utilisation

### Espace Agent

1. Connexion : [http://localhost:3000/login](http://localhost:3000/login)
2. Créer un nouveau dossier
3. Envoyer l'invitation client
4. Suivre le processus de validation

### Espace Client

1. Recevoir l'email d'invitation
2. Cliquer sur le lien sécurisé
3. Uploader les documents d'identité
4. Signer électroniquement
5. Recevoir la confirmation

### Espace Admin

1. Gestion des agents et utilisateurs
2. Configuration des templates d'email
3. Rapports et statistiques
4. Audit et sécurité

## 🔐 Sécurité

- **Tokens sécurisés** : Liens d'accès client avec expiration
- **Chiffrement** : Toutes les communications sont chiffrées
- **Audit trail** : Traçabilité complète des actions
- **RLS** : Row Level Security sur Supabase
- **Validation** : Vérification des documents uploadés

## 📊 Monitoring

### Logs d'email

Tous les emails sont loggés dans la table `email_logs` avec :
- Statut d'envoi
- ID du message Resend
- Timestamps de livraison
- Messages d'erreur

### Audit trail

Toutes les actions sont enregistrées dans `audit_logs` :
- Actions utilisateur
- Modifications de données
- Accès aux documents
- Signatures électroniques

## 🐛 Dépannage

### Problèmes d'email

1. Vérifiez votre clé API Resend
2. Vérifiez la configuration du domaine
3. Consultez les logs dans l'admin

### Problèmes de base de données

1. Vérifiez les variables d'environnement Supabase
2. Vérifiez les politiques RLS
3. Consultez les logs Supabase

### Problèmes d'authentification

1. Vérifiez la configuration Supabase Auth
2. Vérifiez les redirections d'URL
3. Effacez le cache du navigateur

## 📚 Structure du projet

```
├── app/                    # Pages Next.js 14 (App Router)
│   ├── admin/             # Interface administrateur
│   ├── agent/             # Interface agent
│   ├── client/            # Interface client
│   ├── login/             # Page de connexion
│   └── api/               # API Routes
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   └── ...               # Composants métier
├── lib/                  # Utilitaires et services
│   ├── supabase.ts       # Configuration Supabase
│   └── email.ts          # Service email
├── database/             # Scripts SQL
├── tests/                # Tests automatisés
└── scripts/              # Scripts utilitaires
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Créez une issue sur GitHub
- Contactez l'équipe de développement
- Consultez la documentation Supabase et Resend

---

**eSignPro** - Simplifiez vos résiliations d'assurance avec la signature électronique sécurisée.
