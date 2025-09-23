# Configuration de la Base de Données Supabase

## 📋 Instructions étape par étape

### 1. Accéder à votre projet Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet: `vtbojyaszfsnepgyeoke`

### 2. Ouvrir l'éditeur SQL
1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New Query** pour créer une nouvelle requête

### 3. Exécuter le schéma principal
1. Ouvrez le fichier `database/supabase-schema.sql` dans votre éditeur
2. Copiez tout le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** pour exécuter le script

⚠️ **Important**: Ce script va créer toutes les tables, types, politiques RLS, triggers et indexes nécessaires.

### 4. Exécuter les données de test
1. Créez une nouvelle requête dans l'éditeur SQL
2. Ouvrez le fichier `database/test-data.sql` dans votre éditeur
3. Copiez tout le contenu du fichier
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **Run** pour exécuter le script

### 5. Vérifier l'installation
Exécutez cette requête pour vérifier que tout est bien installé :

```sql
-- Vérifier les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les données de test
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM agents) as agents_count,
  (SELECT COUNT(*) FROM clients) as clients_count,
  (SELECT COUNT(*) FROM insurance_cases) as cases_count,
  (SELECT COUNT(*) FROM email_templates) as templates_count;
```

Vous devriez voir :
- 11 tables créées
- Plusieurs utilisateurs, agents, clients
- 150+ cas d'assurance historiques
- 3 templates d'email

### 6. Test de connexion
Une fois terminé, vous pouvez tester la connexion avec :

```bash
npx tsx scripts/test-complete.ts
```

## 🔧 En cas de problème

### Erreur de permissions
Si vous avez des erreurs de permissions, vérifiez que :
1. Vous utilisez la bonne clé `SUPABASE_SERVICE_ROLE_KEY`
2. Les politiques RLS sont bien configurées

### Tables déjà existantes
Si certaines tables existent déjà, vous pouvez les supprimer avec :

```sql
-- ATTENTION: Ceci supprime toutes les données !
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Puis réexécutez le schéma principal.

### Vérification des politiques RLS
Pour vérifier que les politiques RLS sont actives :

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Toutes les tables doivent avoir `rowsecurity = true`.

## ✅ Validation finale

Une fois la base de données configurée, vous devriez pouvoir :
1. ✅ Vous connecter à l'application
2. ✅ Créer des dossiers
3. ✅ Envoyer des emails
4. ✅ Gérer les utilisateurs
5. ✅ Voir les statistiques

Lancez `npm run demo` pour tester le workflow complet !
