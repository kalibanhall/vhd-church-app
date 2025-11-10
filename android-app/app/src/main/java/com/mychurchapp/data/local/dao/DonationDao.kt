package com.mychurchapp.data.local.dao

import com.mychurchapp.data.models.User

import androidx.room.*
import com.mychurchapp.data.local.entity.DonationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DonationDao {
    @Query("SELECT * FROM donations ORDER BY date DESC")
    fun getAllDonations(): Flow<List<DonationEntity>>

    @Query("SELECT * FROM donations WHERE id = :donationId")
    suspend fun getDonationById(donationId: String): DonationEntity?

    @Query("SELECT * FROM donations WHERE id = :donationId")
    fun getDonationByIdFlow(donationId: String): Flow<DonationEntity?>

    @Query("SELECT * FROM donations WHERE userId = :userId ORDER BY date DESC")
    fun getDonationsByUser(userId: String): Flow<List<DonationEntity>>

    @Query("SELECT * FROM donations WHERE type = :type ORDER BY date DESC")
    fun getDonationsByType(type: String): Flow<List<DonationEntity>>

    @Query("SELECT * FROM donations WHERE status = :status ORDER BY date DESC")
    fun getDonationsByStatus(status: String): Flow<List<DonationEntity>>

    @Query("SELECT * FROM donations WHERE date >= :fromDate AND date <= :toDate ORDER BY date DESC")
    fun getDonationsBetweenDates(fromDate: Long, toDate: Long): Flow<List<DonationEntity>>

    @Query("SELECT * FROM donations WHERE projectId = :projectId ORDER BY date DESC")
    fun getDonationsByProject(projectId: String): Flow<List<DonationEntity>>

    @Query("SELECT SUM(amount) FROM donations WHERE status = 'COMPLETED' AND date >= :fromDate AND date <= :toDate")
    fun getTotalDonationsBetweenDates(fromDate: Long, toDate: Long): Flow<Double?>

    @Query("SELECT SUM(amount) FROM donations WHERE status = 'COMPLETED' AND type = :type AND date >= :fromDate AND date <= :toDate")
    fun getTotalDonationsByType(type: String, fromDate: Long, toDate: Long): Flow<Double?>

    @Query("SELECT SUM(amount) FROM donations WHERE userId = :userId AND status = 'COMPLETED'")
    fun getUserTotalDonations(userId: String): Flow<Double?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDonation(donation: DonationEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDonations(donations: List<DonationEntity>)

    @Update
    suspend fun updateDonation(donation: DonationEntity)

    @Delete
    suspend fun deleteDonation(donation: DonationEntity)

    @Query("DELETE FROM donations WHERE id = :donationId")
    suspend fun deleteDonationById(donationId: String)

    @Query("DELETE FROM donations")
    suspend fun deleteAllDonations()

    @Query("UPDATE donations SET status = :status WHERE id = :donationId")
    suspend fun updateDonationStatus(donationId: String, status: String)

    @Query("UPDATE donations SET receiptUrl = :receiptUrl WHERE id = :donationId")
    suspend fun updateReceiptUrl(donationId: String, receiptUrl: String)

    @Query("SELECT * FROM donations WHERE lastSyncedAt < :timestamp ORDER BY date DESC")
    suspend fun getDonationsNeedingSync(timestamp: Long): List<DonationEntity>
}
