# Configuration de la Récupération de Mot de Passe

## ✅ Fonctionnalités Implémentées

### 1. Page "Mot de passe oublié" (`/forgot-password`)
- Formulaire pour entrer l'email
- Envoi d'email de réinitialisation via Supabase
- Confirmation visuelle
- Redirection vers login

### 2. Page "Réinitialisation" (`/reset-password`)
- Formulaire sécurisé avec confirmation
- Validation du mot de passe (min 6 caractères)
- Affichage/masquage du mot de passe
- Conseils de sécurité
- Vérification de la correspondance des mots de passe

### 3. Intégration
- ✅ Lien "Mot de passe oublié ?" sur la page de connexion
- ✅ Toast notifications pour feedback utilisateur
- ✅ Design cohérent avec l'application

## 📋 Configuration Supabase Requise

### Étape 1: Configurer les URLs de redirection

Dans votre tableau de bord Supabase :

1. Allez dans **Authentication** > **URL Configuration**

2. Ajoutez ces URLs dans **Redirect URLs** :

```
https://vhd-church-app.vercel.app/reset-password
http://localhost:3000/reset-password
```

### Étape 2: Configurer les templates d'email

1. Allez dans **Authentication** > **Email Templates**

2. Sélectionnez **Reset Password**

3. Utilisez ce template :

**Sujet:**
```
Réinitialisation de votre mot de passe VHD Church App
```

**Corps de l'email:**
```html
<h2>Réinitialisation de mot de passe</h2>

<p>Bonjour,</p>

<p>Vous avez demandé à réinitialiser votre mot de passe pour VHD Church App.</p>

<p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Réinitialiser mon mot de passe
  </a>
</p>

<p>Ou copiez-collez ce lien dans votre navigateur :</p>
<p>{{ .ConfirmationURL }}</p>

<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>

<p>Ce lien est valide pendant 60 minutes.</p>

<p>Cordialement,<br>L'équipe VHD Church App</p>
```

### Étape 3: Vérifier la configuration SMTP

Assurez-vous que Supabase peut envoyer des emails :

1. **Développement** : Supabase utilise son propre service d'email
2. **Production** : Configurez votre propre service SMTP dans **Project Settings** > **SMTP Settings**

Fournisseurs recommandés :
- SendGrid
- Mailgun  
- Amazon SES
- Resend

## 🧪 Test du Système

### Test en local

1. Lancez l'application :
```bash
npm run dev
```

2. Accédez à http://localhost:3000/auth

3. Cliquez sur "Mot de passe oublié ?"

4. Entrez un email valide (d'un utilisateur existant)

5. Vérifiez votre boîte email (ou les logs Supabase en dev)

6. Cliquez sur le lien de réinitialisation

7. Créez un nouveau mot de passe

8. Connectez-vous avec le nouveau mot de passe

### Test en production

Même procédure mais sur https://vhd-church-app.vercel.app

## 🔒 Sécurité

### Mesures implémentées :
- ✅ Lien de réinitialisation à usage unique
- ✅ Expiration après 60 minutes
- ✅ Validation du mot de passe (minimum 6 caractères)
- ✅ Confirmation du mot de passe
- ✅ Vérification de session avant réinitialisation
- ✅ Toast notifications pour retour utilisateur

### Bonnes pratiques :
- Les liens ne fonctionnent qu'une seule fois
- L'ancien mot de passe reste valide jusqu'à réinitialisation
- Aucune information sensible dans les URLs
- Les emails sont envoyés uniquement si le compte existe

## 📱 Flux Utilisateur

```
1. Utilisateur oublie son mot de passe
   ↓
2. Clique sur "Mot de passe oublié ?" 
   ↓
3. Entre son email sur /forgot-password
   ↓
4. Reçoit un email avec lien de réinitialisation
   ↓
5. Clique sur le lien → redirigé vers /reset-password
   ↓
6. Entre nouveau mot de passe (2x pour confirmation)
   ↓
7. Mot de passe mis à jour
   ↓
8. Redirection vers /login
   ↓
9. Connexion avec nouveau mot de passe
```

## 🐛 Dépannage

### L'email n'arrive pas
- Vérifiez les dossiers spam/courrier indésirable
- Vérifiez que l'email existe dans la base de données
- Consultez les logs Supabase (Dashboard > Logs)
- Vérifiez la configuration SMTP en production

### "Lien invalide ou expiré"
- Le lien est à usage unique
- Le lien expire après 60 minutes
- Redemandez un nouveau lien

### Erreur lors de la réinitialisation
- Vérifiez que le mot de passe fait au moins 6 caractères
- Vérifiez que les deux mots de passe correspondent
- Vérifiez la console pour erreurs détaillées

## 🚀 Déploiement

Les pages sont déjà déployées sur Vercel. Pour activer la fonctionnalité :

1. **Configurer les URLs** dans Supabase (voir Étape 1)
2. **Configurer le template email** (voir Étape 2)  
3. **Tester le flux complet** en production

C'est tout ! Le système est prêt à fonctionner. 🎉
