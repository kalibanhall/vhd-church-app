-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FIDELE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "birth_date" DATETIME,
    "address" TEXT,
    "profile_image_url" TEXT,
    "membership_date" DATETIME NOT NULL,
    "membership_number" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "baptism_date" DATETIME,
    "marital_status" TEXT,
    "profession" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "donation_type" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_reference" TEXT,
    "donation_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "project_id" TEXT,
    "notes" TEXT,
    "receipt_number" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "donations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "donations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "donation_projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "donation_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_name" TEXT NOT NULL,
    "description" TEXT,
    "target_amount" REAL NOT NULL,
    "current_amount" REAL NOT NULL DEFAULT 0,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "project_image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME,
    "event_type" TEXT NOT NULL,
    "location" TEXT,
    "max_attendees" INTEGER,
    "current_attendees" INTEGER NOT NULL DEFAULT 0,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_pattern" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_by" TEXT NOT NULL,
    "event_image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sermons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "pastor_id" TEXT NOT NULL,
    "event_id" TEXT,
    "sermon_date" DATETIME NOT NULL,
    "sermon_type" TEXT NOT NULL,
    "duration_minutes" INTEGER,
    "audio_url" TEXT,
    "video_url" TEXT,
    "thumbnail_url" TEXT,
    "description" TEXT,
    "bible_verses" TEXT,
    "sermon_notes" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sermons_pastor_id_fkey" FOREIGN KEY ("pastor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sermons_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "pastor_id" TEXT NOT NULL,
    "appointment_date" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "location" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_pastor_id_fkey" FOREIGN KEY ("pastor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prayers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "is_answered" BOOLEAN NOT NULL DEFAULT false,
    "answered_date" DATETIME,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "prayer_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "prayers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prayer_supports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prayer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prayer_supports_prayer_id_fkey" FOREIGN KEY ("prayer_id") REFERENCES "prayers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "prayer_supports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "testimonies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" DATETIME,
    "category" TEXT NOT NULL DEFAULT 'HEALING',
    "image_url" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "testimonies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "testimony_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testimony_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "testimony_likes_testimony_id_fkey" FOREIGN KEY ("testimony_id") REFERENCES "testimonies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "testimony_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "testimony_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testimony_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "testimony_comments_testimony_id_fkey" FOREIGN KEY ("testimony_id") REFERENCES "testimonies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "testimony_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "message_type" TEXT NOT NULL DEFAULT 'TEXT',
    "file_url" TEXT,
    "file_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "attendance_date" DATETIME NOT NULL,
    "check_in_time" DATETIME,
    "check_out_time" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_attendances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PUBLIC',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "channel_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "channel_members_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "channel_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_membership_number_key" ON "users"("membership_number");

-- CreateIndex
CREATE UNIQUE INDEX "donations_receipt_number_key" ON "donations"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_supports_prayer_id_user_id_key" ON "prayer_supports"("prayer_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "testimony_likes_testimony_id_user_id_key" ON "testimony_likes"("testimony_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendances_user_id_event_id_attendance_date_key" ON "event_attendances"("user_id", "event_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "channel_members_channel_id_user_id_key" ON "channel_members"("channel_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_message_id_user_id_emoji_key" ON "message_reactions"("message_id", "user_id", "emoji");
