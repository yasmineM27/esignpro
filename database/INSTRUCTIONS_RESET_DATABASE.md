# 🗃️ GUIDE COMPLET : RÉINITIALISATION BASE DE DONNÉES ESIGNPRO

## 📋 ÉTAPES À SUIVRE

### 1. 🌐 Accéder à Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet: `vtbojyaszfsnepgyeoke`

### 2. 🛠️ Ouvrir l'éditeur SQL
1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New Query** pour créer une nouvelle requête

### 3. 🗑️ RÉINITIALISATION COMPLÈTE (ATTENTION: SUPPRIME TOUT)
1. Ouvrez le fichier `database/COMPLETE_DATABASE_RESET.sql`
2. **Copiez TOUT le contenu** du fichier (866 lignes)
3. **Collez-le** dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** pour exécuter le script
5. ⏳ **Attendez** que l'exécution se termine (peut prendre 1-2 minutes)

### 4. 🧪 CRÉER LE DOSSIER DE TEST
1. Ouvrez le fichier `database/CREATE_TEST_CASE.sql`
2. **Copiez TOUT le contenu** du fichier
3. **Collez-le** dans une **nouvelle requête** SQL
4. Cliquez sur **Run** pour exécuter le script

---

## ✅ VÉRIFICATION QUE TOUT FONCTIONNE

### 1. 📊 Vérifier les tables créées
Exécutez cette requête dans Supabase :
```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Résultat attendu :** 14 tables + 3 vues

### 2. 🔍 Vérifier le dossier de test
Exécutez cette requête :
```sql
SELECT * FROM public.unified_portal_data 
WHERE secure_token = 'SECURE_1758909118460_202mix6qtsh';
```

**Résultat attendu :** 1 ligne avec les données du dossier test

### 3. 📁 Vérifier les documents
Exécutez cette requête :
```sql
SELECT * FROM public.client_documents 
WHERE token = 'SECURE_1758909118460_202mix6qtsh';
```

**Résultat attendu :** 3 documents (identity_front, identity_back, insurance_contract)

---

## 🌐 TESTER LES PAGES

### 1. 🏠 Local (Développement)
- URL: `http://localhost:3000/client-portal/SECURE_1758909118460_202mix6qtsh`
- **Attendu :** Page d'upload de documents fonctionnelle

### 2. 🚀 Production
- URL: `https://esignpro.ch/client-portal/SECURE_1758909118460_202mix6qtsh`
- **Attendu :** Page accessible (plus d'erreur 404)

---

## 📋 STRUCTURE DE LA BASE DE DONNÉES CRÉÉE

### 🏗️ Tables Principales
- **users** - Utilisateurs (admin, agent, client)
- **agents** - Profils des agents
- **clients** - Profils des clients
- **insurance_cases** - Dossiers d'assurance
- **client_documents** - Documents uploadés (NOUVELLE STRUCTURE)
- **documents** - Documents (ancienne structure, conservée)
- **email_templates** - Modèles d'emails
- **email_logs** - Logs des emails envoyés
- **signatures** - Signatures électroniques
- **signature_logs** - Logs des signatures
- **final_documents** - Documents finaux générés
- **notifications** - Notifications système
- **audit_logs** - Logs d'audit
- **system_settings** - Paramètres système

### 📊 Vues Utiles
- **unified_portal_data** - Vue complète des dossiers
- **dashboard_stats** - Statistiques du dashboard
- **orphan_emails** - Détection des emails orphelins

### ⚙️ Fonctions Utilitaires
- **generate_secure_token()** - Génération de tokens
- **create_audit_log()** - Création de logs d'audit
- **create_missing_case()** - Création automatique de dossiers manquants
- **update_updated_at_column()** - Mise à jour automatique des timestamps

---

## 🔧 DONNÉES DE TEST CRÉÉES

### 👤 Utilisateurs
- **Admin :** admin@esignpro.ch (ID: 550e8400-e29b-41d4-a716-446655440001)
- **Client Test :** client.test@esignpro.ch (Jean Dupont)
- **Agent Test :** agent.test@esignpro.ch (Marie Martin)

### 📄 Dossier de Test
- **Token :** SECURE_1758909118460_202mix6qtsh
- **Numéro :** RES-2024-001
- **Statut :** email_sent
- **Assurance :** Allianz Suisse
- **Documents :** 3 documents de test pré-créés

### 📧 Modèles d'Email
- **Client Invitation** - Email d'invitation client
- **Document Completion** - Email de confirmation de finalisation

---

## 🚨 EN CAS DE PROBLÈME

### ❌ Erreur lors de l'exécution du script
1. Vérifiez que vous avez les **permissions administrateur** sur Supabase
2. Exécutez le script **par petites sections** si nécessaire
3. Vérifiez les **messages d'erreur** dans la console SQL

### 🔍 Page toujours en erreur 404
1. Vérifiez que le dossier de test a été créé :
   ```sql
   SELECT * FROM insurance_cases WHERE secure_token = 'SECURE_1758909118460_202mix6qtsh';
   ```
2. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```

### 📁 Upload de documents ne fonctionne pas
1. Vérifiez la table client_documents :
   ```sql
   SELECT COUNT(*) FROM client_documents;
   ```
2. Vérifiez les permissions RLS :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'client_documents';
   ```

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :
1. 📧 **Email :** support@esignpro.ch
2. 🔍 **Vérifiez les logs** dans la console du navigateur
3. 📋 **Copiez les messages d'erreur** SQL pour diagnostic

---

## 🎉 RÉSULTAT ATTENDU

Après avoir suivi ces étapes :
- ✅ Base de données complètement réinitialisée
- ✅ 14 tables créées avec structure optimisée
- ✅ Dossier de test fonctionnel
- ✅ Page client-portal accessible
- ✅ Upload de documents opérationnel
- ✅ Plus d'erreur 404 ou d'erreur client-side

**La page `https://esignpro.ch/client-portal/SECURE_1758909118460_202mix6qtsh` devrait maintenant fonctionner parfaitement !** 🚀
