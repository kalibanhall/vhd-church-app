# 📱 Liens pour Tests Mobile - VHD Church App

## 🌐 Accès réseau local pour tests mobile

### URLs principales
- **Application locale :** http://10.80.211.225:3001
- **Page de connexion :** http://10.80.211.225:3001/auth  
- **Dashboard après connexion :** http://10.80.211.225:3001/

### 🔐 Comptes de test

#### Administrateur
- **Email :** admin@vhd.app
- **Mot de passe :** Qualis@2025
- **Accès :** Dashboard complet + Administration

#### Utilisateur standard (si créé)
- Vous pouvez créer un compte standard via l'interface d'inscription

### 📋 Liste de tests mobile à effectuer

#### 1. Test de connexion
- [ ] Ouvrir http://10.80.211.225:3001 sur mobile
- [ ] Se connecter avec admin@vhd.app / Qualis@2025
- [ ] Vérifier le dashboard responsive

#### 2. Test des donations 💰
- [ ] Aller dans "Soutien financier"
- [ ] Tester la sélection de montant (boutons tactiles)
- [ ] Tester les devises USD/CDF
- [ ] Soumettre un don et vérifier l'absence d'erreur
- [ ] Vérifier la couleur bleue du bouton "Envoyer le don"

#### 3. Test des rendez-vous 📅
- [ ] Aller dans "Rendez-vous pastoraux" 
- [ ] Créer un nouveau rendez-vous
- [ ] Vérifier que les dates passées sont désactivées
- [ ] Tester les champs date/heure sur mobile
- [ ] Confirmer la création

#### 4. Test des prières 🙏
- [ ] Aller dans "Intentions de prière"
- [ ] Tester les onglets responsive (largeur pleine sur mobile)
- [ ] Créer une nouvelle prière
- [ ] Vérifier les boutons plus grands (py-3)
- [ ] Confirmer la soumission

#### 5. Test des témoignages ✝️
- [ ] Aller dans "Témoignages"
- [ ] Tester les onglets "Tous" / "Mes témoignages"
- [ ] Créer un nouveau témoignage
- [ ] Vérifier les boutons en colonne sur mobile
- [ ] Confirmer la soumission

#### 6. Test de l'interface générale 📱
- [ ] Vérifier la navigation sur mobile
- [ ] Tester le menu hamburger (si présent)
- [ ] Vérifier l'affichage des cartes/composants
- [ ] Tester le défilement (scroll)
- [ ] Vérifier la lisibilité des textes

#### 7. Test d'administration (admin uniquement) ⚙️
- [ ] Accéder au panel d'administration
- [ ] Tester la gestion des membres
- [ ] Vérifier les validations de contenu
- [ ] Tester les analytics

### 🚨 Problèmes connus à surveiller
- Messages d'erreur lors de soumission (normalement corrigés)
- Boutons trop petits sur mobile (normalement corrigés)
- Onglets qui débordent de l'écran (normalement corrigés)
- Dates antérieures sélectionnables (normalement corrigé)

### 📞 Instructions de connexion mobile

1. **Assurez-vous que votre mobile et PC sont sur le même WiFi**
2. **Ouvrez votre navigateur mobile (Chrome/Safari)**
3. **Tapez l'URL :** `http://10.80.211.225:3001`
4. **Ajoutez à l'écran d'accueil pour faciliter les tests**

### 🔧 Si vous rencontrez des problèmes

#### L'URL ne fonctionne pas :
- Vérifiez que le serveur tourne (voir terminal)
- Vérifiez que mobile et PC sont sur même réseau WiFi
- Essayez de redémarrer le serveur : `npm run dev:network`

#### Erreurs dans l'application :
- Ouvrez les outils de développement mobile (Chrome > Menu > Plus d'outils > Outils de développement)
- Consultez l'onglet Console pour voir les erreurs détaillées
- Comparez avec le comportement sur desktop

### 📊 Serveur de développement
- **Status :** ✅ Actif sur port 3001
- **Mode :** Network (accessible depuis mobile)
- **IP locale :** 10.80.211.225
- **Commande :** `npm run dev:network`

---
*Créé le : $(Get-Date)*  
*Serveur actif : ✅ http://10.80.211.225:3001*