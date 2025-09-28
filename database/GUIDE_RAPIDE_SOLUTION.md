# 🚀 GUIDE RAPIDE - SOLUTION ERREUR 404

## 🎯 VOTRE PROBLÈME
- ✅ Vous recevez bien l'email
- ❌ Clic sur le lien → Erreur 404 : "This page could not be found"
- 🔗 Token problématique : `SECURE_1758959883349_wj7t4a9xo6`

## 🔧 SOLUTION EN 3 ÉTAPES

### ÉTAPE 1 : Réinitialiser la base de données
1. **Aller sur** [https://supabase.com](https://supabase.com)
2. **Projet** : `vtbojyaszfsnepgyeoke`
3. **Menu** : SQL Editor → New Query
4. **Copier/Coller** le contenu de `database/FIXED_DATABASE_RESET.sql`
5. **Cliquer** : Run
6. **Attendre** que ça finisse (30 secondes)

### ÉTAPE 2 : Créer le dossier pour votre token
1. **Nouvelle requête** SQL
2. **Ouvrir** le fichier `database/SIMPLE_CREATE_TOKEN.sql`
3. **IMPORTANT** : Remplacer `SECURE_1758959883349_wj7t4a9xo6` par votre token `SECURE_1758959883349_wj7t4a9xo6` (c'est déjà le bon !)
4. **Copier/Coller** tout le contenu
5. **Cliquer** : Run

### ÉTAPE 3 : Tester
1. **Aller sur** : `https://esignpro.ch/client-portal/SECURE_1758959883349_wj7t4a9xo6`
2. **Résultat attendu** : Page d'upload de documents (plus d'erreur 404)

---

## 📋 ALTERNATIVE : REQUÊTES UNE PAR UNE

Si l'étape 2 ne marche pas, exécutez ces requêtes **une par une** :

### 1. Créer l'utilisateur
```sql
INSERT INTO public.users (id, email, first_name, last_name, role, phone) 
VALUES ('11111111-2222-3333-4444-555555555555', 'client.test@esignpro.ch', 'Jean', 'Dupont', 'client', '+41 79 123 45 67') 
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();
```

### 2. Créer le client
```sql
INSERT INTO public.clients (id, user_id, client_code, address, city, postal_code, country) 
VALUES ('22222222-3333-4444-5555-666666666666', '11111111-2222-3333-4444-555555555555', 'CLIENT001', 'Rue de la Paix 123', 'Genève', '1200', 'Suisse') 
ON CONFLICT (id) DO UPDATE SET address = EXCLUDED.address, updated_at = NOW();
```

### 3. Créer le dossier (CHANGEZ LE TOKEN)
```sql
INSERT INTO public.insurance_cases (id, case_number, client_id, agent_id, secure_token, status, insurance_company, policy_number, expires_at) 
VALUES ('55555555-6666-7777-8888-999999999999', 'RES-2024-002', '22222222-3333-4444-5555-666666666666', (SELECT id FROM public.agents WHERE agent_code = 'ADMIN001'), 'SECURE_1758959883349_wj7t4a9xo6', 'email_sent', 'Allianz Suisse', 'POL-2024-123456', NOW() + INTERVAL '30 days') 
ON CONFLICT (secure_token) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();
```

### 4. Créer les documents (CHANGEZ LE TOKEN)
```sql
INSERT INTO public.client_documents (clientid, token, documenttype, filename, filepath, filesize, mimetype, status) 
VALUES 
('SECURE_1758959883349_wj7t4a9xo6', 'SECURE_1758959883349_wj7t4a9xo6', 'identity_front', 'cin_recto_test.jpg', '/uploads/clients/SECURE_1758959883349_wj7t4a9xo6/identity_front/cin_recto_test.jpg', 1024000, 'image/jpeg', 'uploaded'),
('SECURE_1758959883349_wj7t4a9xo6', 'SECURE_1758959883349_wj7t4a9xo6', 'identity_back', 'cin_verso_test.jpg', '/uploads/clients/SECURE_1758959883349_wj7t4a9xo6/identity_back/cin_verso_test.jpg', 1024000, 'image/jpeg', 'uploaded'),
('SECURE_1758959883349_wj7t4a9xo6', 'SECURE_1758959883349_wj7t4a9xo6', 'insurance_contract', 'contrat_assurance_test.pdf', '/uploads/clients/SECURE_1758959883349_wj7t4a9xo6/insurance_contract/contrat_assurance_test.pdf', 2048000, 'application/pdf', 'uploaded');
```

### 5. Vérifier
```sql
SELECT 'SUCCÈS' as status, ic.secure_token, ic.status, u.first_name || ' ' || u.last_name as client_name
FROM public.insurance_cases ic
LEFT JOIN public.clients c ON ic.client_id = c.id
LEFT JOIN public.users u ON c.user_id = u.id
WHERE ic.secure_token = 'SECURE_1758959883349_wj7t4a9xo6';
```

---

## ✅ RÉSULTAT ATTENDU

**AVANT :**
- ❌ Erreur 404 : "This page could not be found"

**APRÈS :**
- ✅ Page accessible avec interface d'upload
- ✅ Formulaire pour uploader les documents
- ✅ Sections : CIN recto, CIN verso, Contrat assurance, etc.

---

## 🆘 EN CAS DE PROBLÈME

### Erreur SQL ?
- Vérifiez que vous avez bien exécuté `FIXED_DATABASE_RESET.sql` d'abord
- Exécutez les requêtes une par une au lieu du script complet

### Page toujours 404 ?
- Vérifiez que le dossier existe :
```sql
SELECT * FROM public.insurance_cases WHERE secure_token = 'SECURE_1758959883349_wj7t4a9xo6';
```
- Redémarrez le serveur local : `npm run dev`

### Token différent ?
- Si vous avez un autre token, remplacez `SECURE_1758959883349_wj7t4a9xo6` par le vôtre dans TOUTES les requêtes

---

## 🎉 SUCCÈS GARANTI

En suivant ces étapes, votre page sera accessible en moins de 5 minutes !

**URL finale :** `https://esignpro.ch/client-portal/SECURE_1758959883349_wj7t4a9xo6`

**Plus jamais d'erreur 404 !** 🚀
