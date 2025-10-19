-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
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
    "show_on_homepage" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_events" ("created_at", "created_by", "current_attendees", "description", "end_time", "event_date", "event_image_url", "event_type", "id", "is_recurring", "location", "max_attendees", "recurring_pattern", "start_time", "status", "title", "updated_at") SELECT "created_at", "created_by", "current_attendees", "description", "end_time", "event_date", "event_image_url", "event_type", "id", "is_recurring", "location", "max_attendees", "recurring_pattern", "start_time", "status", "title", "updated_at" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
