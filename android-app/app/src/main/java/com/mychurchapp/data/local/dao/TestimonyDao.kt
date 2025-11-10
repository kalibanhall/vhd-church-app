package com.mychurchapp.data.local.dao

import com.mychurchapp.data.models.User

import androidx.room.*
import com.mychurchapp.data.local.entity.TestimonyEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TestimonyDao {
    @Query("SELECT * FROM testimonies WHERE isApproved = 1 ORDER BY date DESC")
    fun getApprovedTestimonies(): Flow<List<TestimonyEntity>>

    @Query("SELECT * FROM testimonies WHERE isApproved = 0 ORDER BY date DESC")
    fun getPendingTestimonies(): Flow<List<TestimonyEntity>>

    @Query("SELECT * FROM testimonies ORDER BY date DESC")
    fun getAllTestimonies(): Flow<List<TestimonyEntity>>

    @Query("SELECT * FROM testimonies WHERE id = :testimonyId")
    suspend fun getTestimonyById(testimonyId: String): TestimonyEntity?

    @Query("SELECT * FROM testimonies WHERE id = :testimonyId")
    fun getTestimonyByIdFlow(testimonyId: String): Flow<TestimonyEntity?>

    @Query("SELECT * FROM testimonies WHERE userId = :userId ORDER BY date DESC")
    fun getTestimoniesByUser(userId: String): Flow<List<TestimonyEntity>>

    @Query("SELECT * FROM testimonies WHERE category = :category AND isApproved = 1 ORDER BY date DESC")
    fun getTestimoniesByCategory(category: String): Flow<List<TestimonyEntity>>

    @Query("SELECT * FROM testimonies WHERE isPinned = 1 AND isApproved = 1 ORDER BY date DESC")
    fun getPinnedTestimonies(): Flow<List<TestimonyEntity>>

    @Query("SELECT * FROM testimonies WHERE isApproved = 1 AND (title LIKE '%' || :query || '%' OR content LIKE '%' || :query || '%') ORDER BY date DESC")
    fun searchTestimonies(query: String): Flow<List<TestimonyEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTestimony(testimony: TestimonyEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTestimonies(testimonies: List<TestimonyEntity>)

    @Update
    suspend fun updateTestimony(testimony: TestimonyEntity)

    @Delete
    suspend fun deleteTestimony(testimony: TestimonyEntity)

    @Query("DELETE FROM testimonies WHERE id = :testimonyId")
    suspend fun deleteTestimonyById(testimonyId: String)

    @Query("DELETE FROM testimonies")
    suspend fun deleteAllTestimonies()

    @Query("UPDATE testimonies SET isApproved = :isApproved, approvedBy = :approvedBy, approvedAt = :approvedAt WHERE id = :testimonyId")
    suspend fun approveTestimony(testimonyId: String, isApproved: Boolean, approvedBy: String, approvedAt: Long)

    @Query("UPDATE testimonies SET isPinned = :isPinned WHERE id = :testimonyId")
    suspend fun pinTestimony(testimonyId: String, isPinned: Boolean)

    @Query("UPDATE testimonies SET likes = :likes, commentsCount = :commentsCount, shares = :shares WHERE id = :testimonyId")
    suspend fun updateStats(testimonyId: String, likes: Int, commentsCount: Int, shares: Int)

    @Query("SELECT COUNT(*) FROM testimonies WHERE isApproved = 0")
    fun getPendingTestimoniesCount(): Flow<Int>

    @Query("SELECT * FROM testimonies WHERE lastSyncedAt < :timestamp ORDER BY date DESC")
    suspend fun getTestimoniesNeedingSync(timestamp: Long): List<TestimonyEntity>
}
