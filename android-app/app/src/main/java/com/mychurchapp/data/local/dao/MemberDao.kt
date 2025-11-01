package com.mychurchapp.data.local.dao

import androidx.room.*
import com.mychurchapp.data.local.entity.MemberEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MemberDao {
    @Query("SELECT * FROM members ORDER BY lastName ASC, firstName ASC")
    fun getAllMembers(): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE id = :memberId")
    suspend fun getMemberById(memberId: String): MemberEntity?

    @Query("SELECT * FROM members WHERE id = :memberId")
    fun getMemberByIdFlow(memberId: String): Flow<MemberEntity?>

    @Query("SELECT * FROM members WHERE email = :email LIMIT 1")
    suspend fun getMemberByEmail(email: String): MemberEntity?

    @Query("SELECT * FROM members WHERE role = :role ORDER BY lastName ASC, firstName ASC")
    fun getMembersByRole(role: String): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE status = :status ORDER BY lastName ASC, firstName ASC")
    fun getMembersByStatus(status: String): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE department = :department ORDER BY lastName ASC, firstName ASC")
    fun getMembersByDepartment(department: String): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE firstName LIKE '%' || :query || '%' OR lastName LIKE '%' || :query || '%' OR email LIKE '%' || :query || '%' ORDER BY lastName ASC, firstName ASC")
    fun searchMembers(query: String): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE faceDescriptor IS NOT NULL AND faceDescriptor != ''")
    suspend fun getMembersWithFaceDescriptor(): List<MemberEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMember(member: MemberEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMembers(members: List<MemberEntity>)

    @Update
    suspend fun updateMember(member: MemberEntity)

    @Delete
    suspend fun deleteMember(member: MemberEntity)

    @Query("DELETE FROM members WHERE id = :memberId")
    suspend fun deleteMemberById(memberId: String)

    @Query("DELETE FROM members")
    suspend fun deleteAllMembers()

    @Query("UPDATE members SET faceDescriptor = :descriptor WHERE id = :memberId")
    suspend fun updateFaceDescriptor(memberId: String, descriptor: String)

    @Query("UPDATE members SET profilePictureUrl = :url WHERE id = :memberId")
    suspend fun updateProfilePicture(memberId: String, url: String)

    @Query("UPDATE members SET status = :status WHERE id = :memberId")
    suspend fun updateMemberStatus(memberId: String, status: String)

    @Query("UPDATE members SET role = :role WHERE id = :memberId")
    suspend fun updateMemberRole(memberId: String, role: String)

    @Query("SELECT COUNT(*) FROM members WHERE status = 'ACTIVE'")
    fun getActiveMembersCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM members")
    fun getTotalMembersCount(): Flow<Int>

    @Query("SELECT * FROM members WHERE lastSyncedAt < :timestamp ORDER BY lastName ASC")
    suspend fun getMembersNeedingSync(timestamp: Long): List<MemberEntity>
}
