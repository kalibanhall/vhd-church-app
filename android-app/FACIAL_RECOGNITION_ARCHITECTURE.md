# 🎯 Architecture de Reconnaissance Faciale - MyChurchApp

**Date**: Novembre 2025  
**Objectif**: Gestion automatique des présences aux cultes via reconnaissance faciale

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTÈME DE RECONNAISSANCE FACIALE             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   WEB APP        │      │   MOBILE APP     │      │   CAMÉRAS        │
│                  │      │                  │      │   ÉGLISE         │
│ - Upload photo   │      │ - CameraX        │      │                  │
│ - Inscription    │      │ - ML Kit         │      │ - IP Cameras     │
│ - Admin panel    │      │ - Face Detection │      │ - RTSP Stream    │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND API (Next.js)                     │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Photo Upload   │  │ Face Encoding  │  │ Face Matching  │   │
│  │ API            │  │ Service        │  │ Service        │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Attendance     │  │ Event/Culte    │  │ WebSocket      │   │
│  │ Tracking       │  │ Management     │  │ Real-time      │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BASE DE DONNÉES (PostgreSQL)                │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ users          │  │ face_encodings │  │ attendances    │   │
│  │ - id           │  │ - userId       │  │ - userId       │   │
│  │ - photo_url    │  │ - encoding     │  │ - culteId      │   │
│  │ - ...          │  │ - confidence   │  │ - timestamp    │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │ cultes         │  │ cameras        │                        │
│  │ - id           │  │ - id           │                        │
│  │ - date         │  │ - rtsp_url     │                        │
│  │ - scan_active  │  │ - location     │                        │
│  └────────────────┘  └────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STOCKAGE (Supabase Storage)                    │
│                                                                  │
│  photos/                                                         │
│  ├── profiles/                                                   │
│  │   ├── user_123_profile.jpg                                   │
│  │   ├── user_456_profile.jpg                                   │
│  │   └── ...                                                     │
│  └── captures/                                                   │
│      ├── culte_789_capture_001.jpg                              │
│      └── ...                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technologies & Bibliothèques

### Backend (Next.js API)
- **face-api.js** ou **@vladmandic/face-api** - Détection et reconnaissance faciale JavaScript
- **sharp** - Traitement d'images (resize, crop, optimize)
- **@supabase/storage-js** - Upload vers Supabase Storage
- **Socket.io** - WebSocket pour temps réel

### Mobile Android
- **ML Kit Face Detection** (Google) - Détection de visages
- **TensorFlow Lite** - Modèle de reconnaissance (FaceNet)
- **CameraX** - Capture photo haute qualité
- **Retrofit** - Upload photo au backend

### Web App
- **React Webcam** ou **MediaDevices API** - Capture webcam
- **face-api.js** - Détection côté client (validation)
- **Next.js API Routes** - Upload et traitement

### Caméras IP
- **RTSP Stream** - Protocoles standard (ONVIF)
- **FFmpeg** - Conversion stream vers frames
- **Node.js Child Process** - Traitement des streams

---

## 💡 Proposition d'Architecture Optimisée

### 🎯 Workflow Utilisateur - Inscription avec Photo

#### 1. **Web App - Inscription**
```typescript
// Page inscription améliorée
┌─────────────────────────────────────┐
│  Inscription Nouveau Membre         │
├─────────────────────────────────────┤
│  Nom: ___________________           │
│  Email: _________________           │
│  Photo de profil: [Capture]         │
│                                     │
│  ┌──────────────────────┐          │
│  │   📷 Webcam Preview   │          │
│  │                      │          │
│  │   [Visage détecté ✓] │          │
│  │                      │          │
│  └──────────────────────┘          │
│                                     │
│  [Capturer Photo] [Uploader]       │
│                                     │
│  ⚠️ La photo doit:                  │
│  - Montrer clairement le visage    │
│  - Être prise de face              │
│  - Avoir un bon éclairage          │
└─────────────────────────────────────┘

Backend:
1. Réception photo
2. Validation (face-api.js détecte 1 visage)
3. Extraction encodage facial (128D vector)
4. Upload photo vers Supabase Storage
5. Sauvegarde encodage en DB (face_encodings)
6. Création user avec photo_url
```

#### 2. **Android App - Inscription**
```kotlin
// ProfilePhotoCapture.kt
┌─────────────────────────────────────┐
│  Ajouter Photo de Profil            │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────┐          │
│  │   📷 CameraX Preview  │          │
│  │                      │          │
│  │   ◯ Visage centré    │          │
│  │                      │          │
│  │   [Guide ovale]      │          │
│  └──────────────────────┘          │
│                                     │
│  ML Kit Face Detection:             │
│  ✓ Visage détecté                   │
│  ✓ Bien éclairé                     │
│  ✓ Centré                           │
│                                     │
│  [Capturer Photo]                   │
└─────────────────────────────────────┘

Workflow:
1. CameraX capture photo
2. ML Kit valide présence d'un visage
3. Upload vers API /api/users/upload-photo
4. Backend extrait encodage
5. Confirmation inscription
```

---

### 🎯 Workflow Admin - Gestion des Présences

#### **Dashboard Admin - Gestion Cultes**
```typescript
┌──────────────────────────────────────────────────────────┐
│  ADMIN - Gestion des Présences aux Cultes               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📅 Culte du: 2025-11-03 (Dimanche 10h00)              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  État: ⚪ Pas démarré                           │    │
│  │                                                 │    │
│  │  [▶️ Démarrer Scan Automatique]                 │    │
│  │                                                 │    │
│  │  Caméras connectées: 3/3                       │    │
│  │  ✓ Caméra Entrée Principale                    │    │
│  │  ✓ Caméra Salle Principale                     │    │
│  │  ✓ Caméra Salle Jeunes                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Configuration:                                          │
│  ☑️ Scan automatique toutes les 5 minutes               │
│  ☑️ Notifications temps réel                            │
│  ☑️ Doublon check (même personne plusieurs caméras)     │
│  Seuil de confiance: [━━━━━━━●━━] 85%                  │
│                                                          │
│  Présences en temps réel: 127 membres                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  10:02 - Jean Dupont (Conf: 92%)               │    │
│  │  10:03 - Marie Martin (Conf: 88%)              │    │
│  │  10:05 - Paul Durand (Conf: 95%)               │    │
│  │  10:07 - Sophie Bernard (Conf: 91%)            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [📊 Voir Statistiques] [📥 Exporter PDF]              │
└──────────────────────────────────────────────────────────┘
```

#### **Pendant le Scan Actif**
```typescript
┌──────────────────────────────────────────────────────────┐
│  🔴 SCAN EN COURS - Culte du 2025-11-03                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ⏱️ Durée: 1h 23min                                     │
│  👥 Présents: 127 / 156 membres (81%)                   │
│                                                          │
│  📹 Caméra Entrée Principale      [🟢 Live]             │
│  ┌────────────────────────────────────────────────┐    │
│  │  [Stream vidéo avec overlay visages détectés]  │    │
│  │                                                 │    │
│  │  🔵 Jean (92%)    🔵 Marie (88%)               │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  📹 Caméra Salle Principale       [🟢 Live]             │
│  📹 Caméra Salle Jeunes          [🟢 Live]             │
│                                                          │
│  Dernières détections (5 sec):                          │
│  • Pierre Dubois (89%) - Caméra Entrée                 │
│  • Alice Petit (93%) - Caméra Salle                    │
│                                                          │
│  [⏸️ Pause Scan] [⏹️ Arrêter Scan]                      │
└──────────────────────────────────────────────────────────┘
```

---

### 🎯 Workflow Scan Automatique

#### **Flux de Reconnaissance en Temps Réel**

```
1. Admin démarre le scan pour un culte
   ↓
2. Backend active WebSocket connections vers caméras IP
   ↓
3. FFmpeg capture frames (1 frame toutes les 2-5 secondes)
   ↓
4. Pour chaque frame:
   ├─ Détection de visages (face-api.js)
   ├─ Extraction encodages faciaux (128D vectors)
   ├─ Comparaison avec DB (face_encodings table)
   │  └─ Algorithme: Euclidean distance < threshold (0.6)
   ├─ Si match trouvé:
   │  ├─ Vérifier si déjà marqué présent (éviter doublons)
   │  ├─ Créer attendance record
   │  ├─ WebSocket notification → Admin dashboard
   │  └─ Log: timestamp, userId, cameraId, confidence
   └─ Si pas de match: Ignorer ou log "visage inconnu"
   ↓
5. Admin voit en temps réel les présences
   ↓
6. Fin du culte: Admin arrête le scan
   ↓
7. Génération rapport PDF avec:
   - Liste complète des présents
   - Heure d'arrivée de chacun
   - Statistiques (taux présence, membres absents)
   - Graphiques
```

---

## 📊 Modèle de Données

### **Table: face_encodings**
```sql
CREATE TABLE face_encodings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    encoding FLOAT8[], -- Array de 128 floats (FaceNet embedding)
    confidence FLOAT DEFAULT 1.0, -- Confiance lors de l'extraction
    photo_url TEXT, -- URL Supabase Storage
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id) -- 1 encoding par utilisateur
);

-- Index pour recherche rapide
CREATE INDEX idx_face_encodings_user ON face_encodings(user_id);
```

### **Table: cultes**
```sql
CREATE TABLE cultes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    type VARCHAR(50), -- DIMANCHE, SEMAINE, SPECIAL
    lieu VARCHAR(255),
    scan_active BOOLEAN DEFAULT FALSE, -- Scan en cours ou non
    scan_started_at TIMESTAMP,
    scan_ended_at TIMESTAMP,
    total_attendees INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: attendances**
```sql
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    culte_id UUID REFERENCES cultes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    detected_at TIMESTAMP DEFAULT NOW(),
    camera_id UUID REFERENCES cameras(id),
    confidence FLOAT, -- % de confiance du match (85-99%)
    method VARCHAR(50), -- 'FACIAL_RECOGNITION', 'MANUAL', 'QR_CODE'
    verified_by UUID REFERENCES users(id), -- Admin qui a validé manuellement
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Un user ne peut être marqué présent qu'une fois par culte
    UNIQUE(culte_id, user_id)
);

CREATE INDEX idx_attendances_culte ON attendances(culte_id);
CREATE INDEX idx_attendances_user ON attendances(user_id);
CREATE INDEX idx_attendances_date ON attendances(detected_at);
```

### **Table: cameras**
```sql
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    location VARCHAR(255), -- 'Entrée Principale', 'Salle Principale'
    rtsp_url TEXT, -- rtsp://admin:password@192.168.1.100:554/stream
    is_active BOOLEAN DEFAULT TRUE,
    last_ping TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: detection_logs** (optionnel - pour debugging)
```sql
CREATE TABLE detection_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    culte_id UUID REFERENCES cultes(id),
    camera_id UUID REFERENCES cameras(id),
    detected_at TIMESTAMP DEFAULT NOW(),
    faces_detected INT, -- Nombre de visages détectés
    matches_found INT, -- Nombre de matchs trouvés
    unknown_faces INT, -- Visages non reconnus
    processing_time_ms INT, -- Temps de traitement
    frame_url TEXT -- URL du frame capturé (debug)
);
```

---

## 🔐 Sécurité & Confidentialité

### **Conformité RGPD**
1. **Consentement explicite**
   - Case à cocher lors de l'inscription
   - "J'accepte l'utilisation de ma photo pour la reconnaissance faciale"
   
2. **Droit à l'oubli**
   - Suppression encodage si user supprime son compte
   - Cascade delete dans PostgreSQL

3. **Chiffrement**
   - Photos stockées sur Supabase (HTTPS + encryption at rest)
   - Encodages en DB (pas de données biométriques brutes)

4. **Accès restreint**
   - Seuls les ADMIN/PASTEUR peuvent démarrer scans
   - Logs d'accès pour audit trail

### **Sécurité Technique**
```typescript
// Validation côté backend
if (!user.consentFacialRecognition) {
    throw new Error("User has not consented to facial recognition");
}

if (user.role !== 'ADMIN' && user.role !== 'PASTEUR') {
    throw new Error("Unauthorized to start facial scan");
}

// Rate limiting
if (scanActiveForCulte) {
    throw new Error("A scan is already active for this event");
}
```

---

## 🚀 Implémentation Progressive

### **Phase 1: Upload Photo & Encodage** (Semaine 1)
- ✅ API upload photo profil (Web + Android)
- ✅ Intégration Supabase Storage
- ✅ Extraction encodage facial (face-api.js)
- ✅ Stockage en DB (face_encodings table)

### **Phase 2: Admin Dashboard** (Semaine 2)
- ✅ CRUD Cultes
- ✅ CRUD Caméras
- ✅ Interface démarrage/arrêt scan
- ✅ Visualisation présences temps réel

### **Phase 3: Reconnaissance Temps Réel** (Semaine 3-4)
- ✅ Connexion caméras IP (RTSP)
- ✅ Extraction frames avec FFmpeg
- ✅ Détection visages (face-api.js)
- ✅ Matching avec DB
- ✅ WebSocket notifications temps réel

### **Phase 4: Rapports & Analytics** (Semaine 5)
- ✅ Génération PDF présences
- ✅ Statistiques membres (taux présence)
- ✅ Graphiques évolution présences
- ✅ Export Excel/CSV

---

## 📱 Fonctionnalités Bonus

### **1. Mode Hors-ligne (Android)**
- Photo capturée en mode avion
- Upload différé avec WorkManager
- Queue locale avec Room

### **2. QR Code Backup**
- Si reconnaissance échoue, QR code scannable
- Génération QR unique par membre
- Scan manuel par admin

### **3. Notifications Push**
- "Votre présence a été enregistrée ✓"
- "N'oubliez pas le culte de dimanche 📅"

### **4. Multi-Photos**
- Enregistrer plusieurs encodages par user
- Visage avec/sans lunettes, barbe, coiffure différente
- Améliore taux de reconnaissance

### **5. Dashboard Analytics**
```
Statistiques Globales:
- Taux présence moyen: 78%
- Membres les plus assidus (Top 10)
- Membres absents 3+ fois consécutives
- Graphique tendance mensuelle
- Heatmap jours/heures de pointe
```

---

## 🎯 Recommandations Finales

### ✅ **Ce qui est optimal:**

1. **Upload photo obligatoire à l'inscription**
   - 1 photo minimum (visage face caméra)
   - Validation ML Kit côté Android
   - Validation face-api.js côté Web

2. **Encodage 128D avec FaceNet**
   - Standard industrie
   - Performant et léger
   - Compatible face-api.js et TensorFlow Lite

3. **Scan automatique multi-caméras**
   - Admin contrôle start/stop
   - Détection temps réel
   - Anti-doublon automatique

4. **Dashboard temps réel**
   - WebSocket pour live updates
   - Confiance % affichée
   - Validation manuelle possible

5. **RGPD compliant**
   - Consentement explicite
   - Droit à l'oubli
   - Chiffrement données

### ⚠️ **Points d'attention:**

1. **Éclairage caméras**
   - Infrarouge si cultes de nuit
   - Angles multiples pour couverture complète

2. **Masques/Accessoires**
   - Reconnaissance moins fiable avec masque
   - Alternative: QR code backup

3. **Performance**
   - 1 frame / 2-5 secondes suffisant
   - Pas de traitement vidéo continu (CPU intensive)

4. **Faux positifs**
   - Seuil confiance minimum: 85%
   - Validation admin pour nouveaux membres

---

## 📚 Ressources Techniques

### **Bibliothèques Recommandées**

**Backend:**
- `@vladmandic/face-api` - Face detection & recognition
- `canvas` - Node.js canvas pour face-api
- `sharp` - Image processing
- `fluent-ffmpeg` - RTSP stream processing

**Android:**
- `com.google.mlkit:face-detection` - Face detection
- `org.tensorflow:tensorflow-lite` - Face recognition model
- `androidx.camera:camera-camera2` - CameraX

**Web:**
- `react-webcam` - Webcam capture
- `face-api.js` - Face detection client-side

### **Modèles ML**

- **FaceNet** - 128D embeddings (standard)
- **MTCNN** - Multi-task CNN pour détection
- **MobileFaceNet** - Version légère pour mobile

---

## 🎉 Conclusion

Cette architecture offre:
- ✅ **Scalabilité** - Support multi-caméras et milliers de membres
- ✅ **Performance** - Reconnaissance temps réel avec confiance >85%
- ✅ **Sécurité** - RGPD compliant, chiffrement, accès contrôlé
- ✅ **UX** - Simple pour membres, puissant pour admins
- ✅ **Fiabilité** - Backup manuel, logs complets, analytics

**Prêt à implémenter Phase 1 ?** 🚀
