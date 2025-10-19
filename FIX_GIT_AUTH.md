# 🔐 GUIDE AUTHENTIFICATION GITHUB

## 🎯 CHRIS NGOZULU KASONGO (KalibanHall) - Authentification Git

### 🚨 PROBLÈME
Git credential non valide - Authentification échouée

### ✅ SOLUTION: Personal Access Token (PAT)

#### ÉTAPE 1: Créer un Personal Access Token
1. **Aller sur:** https://github.com/settings/tokens
2. **Cliquer:** "Generate new token" → "Generate new token (classic)"
3. **Nom:** `VHD Church App - CHRIS NGOZULU KASONGO`
4. **Expiration:** 90 days (ou No expiration si vous préférez)
5. **Scopes à cocher:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages)
6. **Cliquer:** "Generate token"
7. **COPIER LE TOKEN IMMÉDIATEMENT** (il ne sera plus affiché !)

#### ÉTAPE 2: Configurer Git avec le token
```bash
# Supprimer les anciennes credentials
git config --global --unset user.password

# Configurer l'URL avec le token
git remote set-url origin https://VOTRE_TOKEN@github.com/kalibanhall/vhd-church-app.git
```

#### ÉTAPE 3: Alternative - Credential Manager
Si vous préférez utiliser le gestionnaire de credentials Windows:
```bash
# Installer Git Credential Manager
winget install --id Microsoft.GitCredentialManagerCore

# Ou télécharger manuellement
# https://github.com/GitCredentialManager/git-credential-manager/releases
```

### 🔗 LIENS DIRECTS
- **Créer token:** https://github.com/settings/tokens
- **Credential Manager:** https://github.com/GitCredentialManager/git-credential-manager/releases

---

*Guide par CHRIS NGOZULU KASONGO (KalibanHall)*