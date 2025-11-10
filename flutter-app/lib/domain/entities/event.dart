import 'package:equatable/equatable.dart';

class Event extends Equatable {
  final String id;
  final String title;
  final String? description;
  final DateTime eventDate;
  final DateTime startTime;
  final DateTime? endTime;
  final String eventType;
  final String? location;
  final int? maxAttendees;
  final int currentAttendees;
  final bool isRecurring;
  final String? recurringPattern;
  final String status;
  final String createdBy;
  final String? animatedBy;
  final String? eventImageUrl;
  final bool showOnHomepage;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Event({
    required this.id,
    required this.title,
    this.description,
    required this.eventDate,
    required this.startTime,
    this.endTime,
    required this.eventType,
    this.location,
    this.maxAttendees,
    required this.currentAttendees,
    required this.isRecurring,
    this.recurringPattern,
    required this.status,
    required this.createdBy,
    this.animatedBy,
    this.eventImageUrl,
    required this.showOnHomepage,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isFull => maxAttendees != null && currentAttendees >= maxAttendees!;
  bool get isScheduled => status == 'SCHEDULED';
  bool get isInProgress => status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      eventDate: DateTime.parse(json['event_date'] as String),
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: json['end_time'] != null
          ? DateTime.parse(json['end_time'] as String)
          : null,
      eventType: json['event_type'] as String,
      location: json['location'] as String?,
      maxAttendees: json['max_attendees'] as int?,
      currentAttendees: json['current_attendees'] as int? ?? 0,
      isRecurring: json['is_recurring'] as bool? ?? false,
      recurringPattern: json['recurring_pattern'] as String?,
      status: json['status'] as String? ?? 'SCHEDULED',
      createdBy: json['created_by'] as String,
      animatedBy: json['animated_by'] as String?,
      eventImageUrl: json['event_image_url'] as String?,
      showOnHomepage: json['show_on_homepage'] as bool? ?? true,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'event_date': eventDate.toIso8601String(),
      'start_time': startTime.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'event_type': eventType,
      'location': location,
      'max_attendees': maxAttendees,
      'current_attendees': currentAttendees,
      'is_recurring': isRecurring,
      'recurring_pattern': recurringPattern,
      'status': status,
      'created_by': createdBy,
      'animated_by': animatedBy,
      'event_image_url': eventImageUrl,
      'show_on_homepage': showOnHomepage,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        eventDate,
        startTime,
        endTime,
        eventType,
        location,
        maxAttendees,
        currentAttendees,
        isRecurring,
        recurringPattern,
        status,
        createdBy,
        animatedBy,
        eventImageUrl,
        showOnHomepage,
        createdAt,
        updatedAt,
      ];
}

class Sermon extends Equatable {
  final String id;
  final String title;
  final String pastorId;
  final String? eventId;
  final DateTime sermonDate;
  final String sermonType;
  final int? durationMinutes;
  final String? audioUrl;
  final String? videoUrl;
  final String? thumbnailUrl;
  final String? description;
  final String? bibleVerses;
  final String? sermonNotes;
  final bool isPublished;
  final int viewCount;
  final int downloadCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Sermon({
    required this.id,
    required this.title,
    required this.pastorId,
    this.eventId,
    required this.sermonDate,
    required this.sermonType,
    this.durationMinutes,
    this.audioUrl,
    this.videoUrl,
    this.thumbnailUrl,
    this.description,
    this.bibleVerses,
    this.sermonNotes,
    required this.isPublished,
    required this.viewCount,
    required this.downloadCount,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get hasAudio => audioUrl != null && audioUrl!.isNotEmpty;
  bool get hasVideo => videoUrl != null && videoUrl!.isNotEmpty;

  factory Sermon.fromJson(Map<String, dynamic> json) {
    return Sermon(
      id: json['id'] as String,
      title: json['title'] as String,
      pastorId: json['pastor_id'] as String,
      eventId: json['event_id'] as String?,
      sermonDate: DateTime.parse(json['sermon_date'] as String),
      sermonType: json['sermon_type'] as String,
      durationMinutes: json['duration_minutes'] as int?,
      audioUrl: json['audio_url'] as String?,
      videoUrl: json['video_url'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      description: json['description'] as String?,
      bibleVerses: json['bible_verses'] as String?,
      sermonNotes: json['sermon_notes'] as String?,
      isPublished: json['is_published'] as bool? ?? false,
      viewCount: json['view_count'] as int? ?? 0,
      downloadCount: json['download_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'pastor_id': pastorId,
      'event_id': eventId,
      'sermon_date': sermonDate.toIso8601String(),
      'sermon_type': sermonType,
      'duration_minutes': durationMinutes,
      'audio_url': audioUrl,
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'description': description,
      'bible_verses': bibleVerses,
      'sermon_notes': sermonNotes,
      'is_published': isPublished,
      'view_count': viewCount,
      'download_count': downloadCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        title,
        pastorId,
        eventId,
        sermonDate,
        sermonType,
        durationMinutes,
        audioUrl,
        videoUrl,
        thumbnailUrl,
        description,
        bibleVerses,
        sermonNotes,
        isPublished,
        viewCount,
        downloadCount,
        createdAt,
        updatedAt,
      ];
}
