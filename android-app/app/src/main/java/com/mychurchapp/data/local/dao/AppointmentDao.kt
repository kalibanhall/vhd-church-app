package com.mychurchapp.data.local.dao

import androidx.room.*
import com.mychurchapp.data.local.entity.AppointmentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AppointmentDao {
    @Query("SELECT * FROM appointments ORDER BY date ASC")
    fun getAllAppointments(): Flow<List<AppointmentEntity>>

    @Query("SELECT * FROM appointments WHERE id = :appointmentId")
    suspend fun getAppointmentById(appointmentId: String): AppointmentEntity?

    @Query("SELECT * FROM appointments WHERE id = :appointmentId")
    fun getAppointmentByIdFlow(appointmentId: String): Flow<AppointmentEntity?>

    @Query("SELECT * FROM appointments WHERE memberId = :memberId ORDER BY date ASC")
    fun getAppointmentsByMember(memberId: String): Flow<List<AppointmentEntity>>

    @Query("SELECT * FROM appointments WHERE pastorId = :pastorId ORDER BY date ASC")
    fun getAppointmentsByPastor(pastorId: String): Flow<List<AppointmentEntity>>

    @Query("SELECT * FROM appointments WHERE status = :status ORDER BY date ASC")
    fun getAppointmentsByStatus(status: String): Flow<List<AppointmentEntity>>

    @Query("SELECT * FROM appointments WHERE date >= :fromDate AND date <= :toDate ORDER BY date ASC")
    fun getAppointmentsBetweenDates(fromDate: Long, toDate: Long): Flow<List<AppointmentEntity>>

    @Query("SELECT * FROM appointments WHERE pastorId = :pastorId AND date >= :fromDate AND date <= :toDate ORDER BY date ASC")
    fun getPastorAppointmentsBetweenDates(
        pastorId: String,
        fromDate: Long,
        toDate: Long
    ): Flow<List<AppointmentEntity>>

    @Query("SELECT * FROM appointments WHERE date >= :currentTime AND status = 'PENDING' ORDER BY date ASC")
    fun getUpcomingAppointments(currentTime: Long): Flow<List<AppointmentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAppointment(appointment: AppointmentEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAppointments(appointments: List<AppointmentEntity>)

    @Update
    suspend fun updateAppointment(appointment: AppointmentEntity)

    @Delete
    suspend fun deleteAppointment(appointment: AppointmentEntity)

    @Query("DELETE FROM appointments WHERE id = :appointmentId")
    suspend fun deleteAppointmentById(appointmentId: String)

    @Query("DELETE FROM appointments")
    suspend fun deleteAllAppointments()

    @Query("UPDATE appointments SET status = :status WHERE id = :appointmentId")
    suspend fun updateAppointmentStatus(appointmentId: String, status: String)

    @Query("UPDATE appointments SET reminderSent = :sent WHERE id = :appointmentId")
    suspend fun updateReminderStatus(appointmentId: String, sent: Boolean)

    @Query("SELECT COUNT(*) FROM appointments WHERE status = 'PENDING' AND date >= :currentTime")
    fun getPendingAppointmentsCount(currentTime: Long): Flow<Int>

    @Query("SELECT * FROM appointments WHERE lastSyncedAt < :timestamp ORDER BY date ASC")
    suspend fun getAppointmentsNeedingSync(timestamp: Long): List<AppointmentEntity>
}
