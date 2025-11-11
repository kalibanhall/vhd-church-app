# Configuration des Emails Supabase

## 🚨 Problème : Les emails ne sont pas reçus

Par défaut, Supabase utilise un serveur de test qui ne livre pas les emails en production.

## ✅ Solution : Configurer SMTP

### Option 1 : Gmail (Gratuit)

1. **Créer un mot de passe d'application Gmail**
   - Allez sur https://myaccount.google.com/apppasswords
   - Connectez-vous avec votre compte Gmail
   - Nom de l'app : `Supabase VHD Church`
   - Copiez le mot de passe généré (16 caractères)

2. **Configurer dans Supabase**
   - Allez sur https://supabase.com/dashboard/project/lwmyferidfbzcnggddob/settings/auth
   - Scrollez jusqu'à **"SMTP Settings"**
   - Activez **"Enable Custom SMTP"**
   - Remplissez :
     ```
     Host: smtp.gmail.com
     Port: 587
     Username: kasongongozulu@gmail.com
     Password: [Votre mot de passe d'application]
     Sender email: kasongongozulu@gmail.com
     Sender name: My Church App
     ```
   - Cliquez **Save**

### Option 2 : SendGrid (Gratuit 100 emails/jour)

1. **Créer un compte SendGrid**
   - https://signup.sendgrid.com/
   - Vérifiez votre email
   - Créez une clé API : Settings → API Keys → Create API Key

2. **Configurer dans Supabase**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Votre clé API SendGrid]
   Sender email: kasongongozulu@gmail.com
   Sender name: My Church App
   ```

### Option 3 : Resend (Moderne, 100 emails/jour gratuit)

1. **Créer un compte Resend**
   - https://resend.com/signup
   - Vérifiez votre domaine ou utilisez `onboarding.resend.dev` pour les tests

2. **Configurer dans Supabase**
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Votre clé API Resend]
   Sender email: onboarding@resend.dev (ou votre domaine)
   Sender name: My Church App
   ```

## 🧪 Tester la configuration

1. Après avoir configuré SMTP, retournez sur votre app
2. Allez sur https://vhd-church-app.vercel.app/forgot-password
3. Entrez votre email
4. Vérifiez votre boîte de réception (et spam)

## 📋 Personnaliser les templates d'emails

1. Allez sur https://supabase.com/dashboard/project/lwmyferidfbzcnggddob/auth/templates
2. Sélectionnez **"Reset Password"**
3. Personnalisez le contenu :
   - Sujet : `Réinitialisation de votre mot de passe - My Church App`
   - Corps : Modifiez le message selon vos besoins
4. Cliquez **Save**

## ⚠️ Important

- **Gmail** : Limite de 500 emails/jour
- **SendGrid** : 100 emails/jour gratuits, puis payant
- **Resend** : 100 emails/jour gratuits, puis payant
- Pour un usage en production intensive, considérez un service payant

## 🔍 Vérifier les emails de test (Développement)

Si vous n'avez pas configuré SMTP, Supabase stocke les emails de test :

1. https://supabase.com/dashboard/project/lwmyferidfbzcnggddob/auth/templates
2. Cherchez un lien **"Inbucket"** ou **"Test emails"**
3. Vous y verrez tous les emails envoyés en mode test

---

**Dernière mise à jour** : Novembre 2025
