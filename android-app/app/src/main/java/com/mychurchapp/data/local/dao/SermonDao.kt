package com.mychurchapp.data.local.dao

import androidx.room.*
import com.mychurchapp.data.local.entity.SermonEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SermonDao {
    @Query("SELECT * FROM sermons ORDER BY date DESC")
    fun getAllSermons(): Flow<List<SermonEntity>>

    @Query("SELECT * FROM sermons WHERE id = :sermonId")
    suspend fun getSermonById(sermonId: String): SermonEntity?

    @Query("SELECT * FROM sermons WHERE id = :sermonId")
    fun getSermonByIdFlow(sermonId: String): Flow<SermonEntity?>

    @Query("SELECT * FROM sermons WHERE isDownloaded = 1 ORDER BY date DESC")
    fun getDownloadedSermons(): Flow<List<SermonEntity>>

    @Query("SELECT * FROM sermons WHERE category = :category ORDER BY date DESC")
    fun getSermonsByCategory(category: String): Flow<List<SermonEntity>>

    @Query("SELECT * FROM sermons WHERE pastorId = :pastorId ORDER BY date DESC")
    fun getSermonsByPastor(pastorId: String): Flow<List<SermonEntity>>

    @Query("SELECT * FROM sermons WHERE title LIKE '%' || :query || '%' OR description LIKE '%' || :query || '%' ORDER BY date DESC")
    fun searchSermons(query: String): Flow<List<SermonEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSermon(sermon: SermonEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSermons(sermons: List<SermonEntity>)

    @Update
    suspend fun updateSermon(sermon: SermonEntity)

    @Delete
    suspend fun deleteSermon(sermon: SermonEntity)

    @Query("DELETE FROM sermons WHERE id = :sermonId")
    suspend fun deleteSermonById(sermonId: String)

    @Query("DELETE FROM sermons")
    suspend fun deleteAllSermons()

    @Query("UPDATE sermons SET isDownloaded = :isDownloaded, localVideoPath = :localPath WHERE id = :sermonId")
    suspend fun updateDownloadStatus(sermonId: String, isDownloaded: Boolean, localPath: String?)

    @Query("UPDATE sermons SET views = :views, likes = :likes WHERE id = :sermonId")
    suspend fun updateStats(sermonId: String, views: Int, likes: Int)

    @Query("SELECT * FROM sermons WHERE lastSyncedAt < :timestamp ORDER BY date DESC")
    suspend fun getSermonsNeedingSync(timestamp: Long): List<SermonEntity>
}
