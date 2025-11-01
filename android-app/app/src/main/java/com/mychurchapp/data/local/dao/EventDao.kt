package com.mychurchapp.data.local.dao

import androidx.room.*
import com.mychurchapp.data.local.entity.EventEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface EventDao {
    @Query("SELECT * FROM events ORDER BY startDate ASC")
    fun getAllEvents(): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE id = :eventId")
    suspend fun getEventById(eventId: String): EventEntity?

    @Query("SELECT * FROM events WHERE id = :eventId")
    fun getEventByIdFlow(eventId: String): Flow<EventEntity?>

    @Query("SELECT * FROM events WHERE status = :status ORDER BY startDate ASC")
    fun getEventsByStatus(status: String): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE type = :type ORDER BY startDate ASC")
    fun getEventsByType(type: String): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE startDate >= :fromDate AND startDate <= :toDate ORDER BY startDate ASC")
    fun getEventsBetweenDates(fromDate: Long, toDate: Long): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE startDate >= :currentTime AND status = 'UPCOMING' ORDER BY startDate ASC LIMIT :limit")
    fun getUpcomingEvents(currentTime: Long, limit: Int = 10): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE title LIKE '%' || :query || '%' OR description LIKE '%' || :query || '%' ORDER BY startDate ASC")
    fun searchEvents(query: String): Flow<List<EventEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: EventEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvents(events: List<EventEntity>)

    @Update
    suspend fun updateEvent(event: EventEntity)

    @Delete
    suspend fun deleteEvent(event: EventEntity)

    @Query("DELETE FROM events WHERE id = :eventId")
    suspend fun deleteEventById(eventId: String)

    @Query("DELETE FROM events")
    suspend fun deleteAllEvents()

    @Query("UPDATE events SET currentAttendees = :count WHERE id = :eventId")
    suspend fun updateAttendeeCount(eventId: String, count: Int)

    @Query("UPDATE events SET status = :status WHERE id = :eventId")
    suspend fun updateEventStatus(eventId: String, status: String)

    @Query("SELECT * FROM events WHERE lastSyncedAt < :timestamp ORDER BY startDate ASC")
    suspend fun getEventsNeedingSync(timestamp: Long): List<EventEntity>
}
