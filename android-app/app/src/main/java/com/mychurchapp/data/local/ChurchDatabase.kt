package com.mychurchapp.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.mychurchapp.data.local.dao.*
import com.mychurchapp.data.local.entity.*

@Database(
    entities = [
        SermonEntity::class,
        EventEntity::class,
        MemberEntity::class,
        TestimonyEntity::class,
        AppointmentEntity::class,
        DonationEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class ChurchDatabase : RoomDatabase() {
    abstract fun sermonDao(): SermonDao
    abstract fun eventDao(): EventDao
    abstract fun memberDao(): MemberDao
    abstract fun testimonyDao(): TestimonyDao
    abstract fun appointmentDao(): AppointmentDao
    abstract fun donationDao(): DonationDao

    companion object {
        const val DATABASE_NAME = "church_database"
    }
}
