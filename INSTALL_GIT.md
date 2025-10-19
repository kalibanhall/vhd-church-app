# 📥 INSTALLATION DE GIT - ÉTAPES DÉTAILLÉES

## 🎯 CHRIS NGOZULU KASONGO (KalibanHall) - Installation Git

### Option 1: Installer Git via Winget (Recommandé)
```powershell
# Exécuter en tant qu'administrateur dans PowerShell
winget install --id Git.Git -e --source winget
```

### Option 2: Téléchargement manuel
1. **Aller sur:** https://git-scm.com/download/windows
2. **Télécharger** Git pour Windows (64-bit)
3. **Installer** avec les options par défaut
4. **Redémarrer** le terminal

### Option 3: Via Chocolatey
```powershell
# Si Chocolatey est installé
choco install git
```

### ✅ Vérifier l'installation
```bash
git --version
```

### 🔧 Configuration initiale après installation
```bash
git config --global user.name "CHRIS NGOZULU KASONGO"
git config --global user.email "votre-email@domaine.com"
```

## 📋 ÉTAPES SUIVANTES APRÈS INSTALLATION

1. **Redémarrer PowerShell/VS Code**
2. **Naviguer vers votre projet:** `cd "c:\vhd app"`
3. **Continuer avec:** `git init`

---

*Guide par CHRIS NGOZULU KASONGO (KalibanHall)*