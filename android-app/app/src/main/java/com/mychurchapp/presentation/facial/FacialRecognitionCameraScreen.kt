package com.mychurchapp.presentation.facial

import android.Manifest
import android.graphics.Bitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import com.mychurchapp.util.FaceDescriptorExtractor
import timber.log.Timber
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Écran de reconnaissance faciale avec caméra
 * Utilise CameraX, ML Kit Face Detection et TensorFlow Lite pour l'extraction de descripteurs
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FacialRecognitionCameraScreen(
    sessionId: String,
    userId: String,
    mode: FaceRecognitionMode = FaceRecognitionMode.CHECK_IN,
    onCheckInSuccess: (String) -> Unit = {},
    onRegistrationSuccess: () -> Unit = {},
    onBackClick: () -> Unit,
    viewModel: FacialRecognitionViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val uiState by viewModel.uiState.collectAsState()
    
    var hasPermission by remember { mutableStateOf(false) }
    var currentBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var currentFace by remember { mutableStateOf<com.google.mlkit.vision.face.Face?>(null) }
    
    val cameraExecutor: ExecutorService = remember { Executors.newSingleThreadExecutor() }
    val descriptorExtractor = remember { FaceDescriptorExtractor(context) }
    
    // Demande de permission caméra
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasPermission = isGranted
    }
    
    LaunchedEffect(Unit) {
        launcher.launch(Manifest.permission.CAMERA)
    }
    
    // Gère le résultat du check-in
    LaunchedEffect(uiState.checkInResult) {
        when (val result = uiState.checkInResult) {
            is CheckInResult.Success -> {
                onCheckInSuccess(result.userName)
            }
            else -> {}
        }
    }
    
    DisposableEffect(Unit) {
        onDispose {
            cameraExecutor.shutdown()
            descriptorExtractor.close()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        when (mode) {
                            FaceRecognitionMode.CHECK_IN -> "Check-in facial"
                            FaceRecognitionMode.REGISTER -> "Enregistrer visage"
                        }
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, "Retour")
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (hasPermission) {
                // Preview caméra
                CameraPreview(
                    modifier = Modifier.fillMaxSize(),
                    onImageAnalyzed = { bitmap, face ->
                        currentBitmap = bitmap
                        currentFace = face
                        viewModel.detectFace(bitmap)
                    },
                    cameraExecutor = cameraExecutor,
                    lifecycleOwner = lifecycleOwner
                )
                
                // Overlay avec guide du visage
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(300.dp, 400.dp)
                            .border(
                                width = 4.dp,
                                color = if (uiState.faceDetected) Color(0xFF10B981) else Color.White,
                                shape = RoundedCornerShape(200.dp)
                            )
                    )
                }
                
                // Message de statut
                Surface(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 32.dp)
                        .clip(RoundedCornerShape(24.dp)),
                    color = if (uiState.faceDetected) 
                        Color(0xFF10B981).copy(alpha = 0.9f) 
                    else 
                        Color.Black.copy(alpha = 0.7f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (uiState.isProcessing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                if (uiState.faceDetected) Icons.Default.CheckCircle else Icons.Default.Face,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Text(
                            text = uiState.statusMessage,
                            color = Color.White,
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                
                // Bouton de capture
                if (uiState.faceDetected && !uiState.isProcessing) {
                    FloatingActionButton(
                        onClick = {
                            val bitmap = currentBitmap
                            val face = currentFace
                            
                            if (bitmap != null && face != null) {
                                // Extrait le descripteur
                                val descriptor = descriptorExtractor.extractDescriptor(bitmap, face)
                                
                                if (descriptor != null) {
                                    when (mode) {
                                        FaceRecognitionMode.CHECK_IN -> {
                                            // Vérifie contre la base de données
                                            viewModel.verifyFace(descriptor, sessionId, bitmap)
                                        }
                                        FaceRecognitionMode.REGISTER -> {
                                            // Enregistre le nouveau visage
                                            val quality = descriptorExtractor.calculateQuality(descriptor)
                                            viewModel.uploadDescriptor(
                                                userId = userId,
                                                descriptor = descriptor,
                                                photoUrl = null, // TODO: Upload photo
                                                qualityScore = quality,
                                                isPrimary = true
                                            )
                                            onRegistrationSuccess()
                                        }
                                    }
                                } else {
                                    Timber.e("Échec extraction descripteur")
                                }
                            }
                        },
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 48.dp)
                            .size(72.dp),
                        containerColor = Color(0xFF3B82F6)
                    ) {
                        Icon(
                            when (mode) {
                                FaceRecognitionMode.CHECK_IN -> Icons.Default.CheckCircle
                                FaceRecognitionMode.REGISTER -> Icons.Default.Camera
                            },
                            contentDescription = when (mode) {
                                FaceRecognitionMode.CHECK_IN -> "Vérifier"
                                FaceRecognitionMode.REGISTER -> "Capturer"
                            },
                            tint = Color.White,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }
                
                // Afficher les erreurs
                uiState.errorMessage?.let { error ->
                    Snackbar(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(16.dp),
                        action = {
                            TextButton(onClick = { viewModel.clearError() }) {
                                Text("OK")
                            }
                        }
                    ) {
                        Text(error)
                    }
                }
                
                // Dialogue de résultat check-in
                uiState.checkInResult?.let { result ->
                    CheckInResultDialog(
                        result = result,
                        onDismiss = { viewModel.resetState() }
                    )
                }
            } else {
                // Pas de permission
                PermissionDeniedContent(
                    onRequestPermission = { launcher.launch(Manifest.permission.CAMERA) }
                )
            }
        }
    }
}

@Composable
fun CameraPreview(
    modifier: Modifier = Modifier,
    onImageAnalyzed: (Bitmap, com.google.mlkit.vision.face.Face?) -> Unit,
    cameraExecutor: ExecutorService,
    lifecycleOwner: androidx.lifecycle.LifecycleOwner
) {
    val context = LocalContext.current
    val previewView = remember { PreviewView(context) }
    
    LaunchedEffect(Unit) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }
            
            val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor, FaceAnalyzer { bitmap, face ->
                        onImageAnalyzed(bitmap, face)
                    })
                }
            
            val cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
            
            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalysis
                )
            } catch (e: Exception) {
                Timber.e(e, "Erreur caméra")
            }
        }, ContextCompat.getMainExecutor(context))
    }
    
    AndroidView(
        factory = { previewView },
        modifier = modifier
    )
}

/**
 * Analyseur d'images avec ML Kit Face Detection
 */
class FaceAnalyzer(
    private val onFaceDetected: (Bitmap, com.google.mlkit.vision.face.Face?) -> Unit
) : ImageAnalysis.Analyzer {
    
    private val faceDetector = com.google.mlkit.vision.face.FaceDetection.getClient(
        com.google.mlkit.vision.face.FaceDetectorOptions.Builder()
            .setPerformanceMode(com.google.mlkit.vision.face.FaceDetectorOptions.PERFORMANCE_MODE_FAST)
            .setLandmarkMode(com.google.mlkit.vision.face.FaceDetectorOptions.LANDMARK_MODE_ALL)
            .setClassificationMode(com.google.mlkit.vision.face.FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .setMinFaceSize(0.15f)
            .enableTracking()
            .build()
    )
    
    @androidx.annotation.OptIn(ExperimentalGetImage::class)
    override fun analyze(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = com.google.mlkit.vision.common.InputImage.fromMediaImage(
                mediaImage,
                imageProxy.imageInfo.rotationDegrees
            )
            
            faceDetector.process(image)
                .addOnSuccessListener { faces ->
                    val bitmap = imageProxy.toBitmap()
                    val face = faces.firstOrNull()
                    onFaceDetected(bitmap, face)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }
}

/**
 * Extension pour convertir ImageProxy en Bitmap
 */
@androidx.annotation.OptIn(ExperimentalGetImage::class)
fun ImageProxy.toBitmap(): Bitmap {
    return Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
}

@Composable
fun PermissionDeniedContent(
    onRequestPermission: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.CameraAlt,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = Color(0xFF6B7280)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Permission caméra requise",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Veuillez autoriser l'accès à la caméra",
            style = MaterialTheme.typography.bodyMedium,
            color = Color(0xFF6B7280)
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onRequestPermission) {
            Text("Autoriser")
        }
    }
}

@Composable
fun CheckInResultDialog(
    result: CheckInResult,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                when (result) {
                    is CheckInResult.Success -> Icons.Default.CheckCircle
                    is CheckInResult.Failure -> Icons.Default.Error
                },
                contentDescription = null,
                tint = when (result) {
                    is CheckInResult.Success -> Color(0xFF10B981)
                    is CheckInResult.Failure -> Color(0xFFEF4444)
                },
                modifier = Modifier.size(48.dp)
            )
        },
        title = {
            Text(
                text = when (result) {
                    is CheckInResult.Success -> "Présence enregistrée !"
                    is CheckInResult.Failure -> "Échec"
                },
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            when (result) {
                is CheckInResult.Success -> {
                    Column {
                        Text("Bienvenue ${result.userName}")
                        Text(
                            "Confiance: ${(result.confidence * 100).toInt()}%",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }
                }
                is CheckInResult.Failure -> {
                    Text(result.message)
                }
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) {
                Text("OK")
            }
        }
    )
}

/**
 * Mode de reconnaissance faciale
 */
enum class FaceRecognitionMode {
    CHECK_IN,  // Vérification pour check-in
    REGISTER   // Enregistrement nouveau visage
}
