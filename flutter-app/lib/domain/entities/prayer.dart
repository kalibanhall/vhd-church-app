import 'package:equatable/equatable.dart';

class Appointment extends Equatable {
  final String id;
  final String userId;
  final String pastorId;
  final DateTime appointmentDate;
  final DateTime startTime;
  final DateTime endTime;
  final String reason;
  final String status;
  final String? notes;
  final String? location;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Appointment({
    required this.id,
    required this.userId,
    required this.pastorId,
    required this.appointmentDate,
    required this.startTime,
    required this.endTime,
    required this.reason,
    required this.status,
    this.notes,
    this.location,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isScheduled => status == 'SCHEDULED';
  bool get isConfirmed => status == 'CONFIRMED';
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';
  bool get isPast => appointmentDate.isBefore(DateTime.now());

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      pastorId: json['pastor_id'] as String,
      appointmentDate: DateTime.parse(json['appointment_date'] as String),
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      reason: json['reason'] as String,
      status: json['status'] as String? ?? 'SCHEDULED',
      notes: json['notes'] as String?,
      location: json['location'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'pastor_id': pastorId,
      'appointment_date': appointmentDate.toIso8601String(),
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'reason': reason,
      'status': status,
      'notes': notes,
      'location': location,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        pastorId,
        appointmentDate,
        startTime,
        endTime,
        reason,
        status,
        notes,
        location,
        createdAt,
        updatedAt,
      ];
}

class Prayer extends Equatable {
  final String id;
  final String userId;
  final String title;
  final String content;
  final String category;
  final bool isPublic;
  final bool isAnonymous;
  final String status;
  final bool isAnswered;
  final DateTime? answeredDate;
  final String? approvedBy;
  final DateTime? approvedAt;
  final int prayerCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Prayer({
    required this.id,
    required this.userId,
    required this.title,
    required this.content,
    required this.category,
    required this.isPublic,
    required this.isAnonymous,
    required this.status,
    required this.isAnswered,
    this.answeredDate,
    this.approvedBy,
    this.approvedAt,
    required this.prayerCount,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isPending => status == 'PENDING';
  bool get isApproved => status == 'APPROVED';
  bool get isRejected => status == 'REJECTED';

  factory Prayer.fromJson(Map<String, dynamic> json) {
    return Prayer(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      category: json['category'] as String? ?? 'GENERAL',
      isPublic: json['is_public'] as bool? ?? true,
      isAnonymous: json['is_anonymous'] as bool? ?? false,
      status: json['status'] as String? ?? 'PENDING',
      isAnswered: json['is_answered'] as bool? ?? false,
      answeredDate: json['answered_date'] != null
          ? DateTime.parse(json['answered_date'] as String)
          : null,
      approvedBy: json['approved_by'] as String?,
      approvedAt: json['approved_at'] != null
          ? DateTime.parse(json['approved_at'] as String)
          : null,
      prayerCount: json['prayer_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'content': content,
      'category': category,
      'is_public': isPublic,
      'is_anonymous': isAnonymous,
      'status': status,
      'is_answered': isAnswered,
      'answered_date': answeredDate?.toIso8601String(),
      'approved_by': approvedBy,
      'approved_at': approvedAt?.toIso8601String(),
      'prayer_count': prayerCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        title,
        content,
        category,
        isPublic,
        isAnonymous,
        status,
        isAnswered,
        answeredDate,
        approvedBy,
        approvedAt,
        prayerCount,
        createdAt,
        updatedAt,
      ];
}

class Testimony extends Equatable {
  final String id;
  final String userId;
  final String title;
  final String content;
  final bool isAnonymous;
  final bool isApproved;
  final String? approvedBy;
  final DateTime? approvedAt;
  final bool isPublished;
  final DateTime? publishedAt;
  final String category;
  final String? imageUrl;
  final int viewCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Testimony({
    required this.id,
    required this.userId,
    required this.title,
    required this.content,
    required this.isAnonymous,
    required this.isApproved,
    this.approvedBy,
    this.approvedAt,
    required this.isPublished,
    this.publishedAt,
    required this.category,
    this.imageUrl,
    required this.viewCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Testimony.fromJson(Map<String, dynamic> json) {
    return Testimony(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      isAnonymous: json['is_anonymous'] as bool? ?? false,
      isApproved: json['is_approved'] as bool? ?? false,
      approvedBy: json['approved_by'] as String?,
      approvedAt: json['approved_at'] != null
          ? DateTime.parse(json['approved_at'] as String)
          : null,
      isPublished: json['is_published'] as bool? ?? false,
      publishedAt: json['published_at'] != null
          ? DateTime.parse(json['published_at'] as String)
          : null,
      category: json['category'] as String? ?? 'HEALING',
      imageUrl: json['image_url'] as String?,
      viewCount: json['view_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'content': content,
      'is_anonymous': isAnonymous,
      'is_approved': isApproved,
      'approved_by': approvedBy,
      'approved_at': approvedAt?.toIso8601String(),
      'is_published': isPublished,
      'published_at': publishedAt?.toIso8601String(),
      'category': category,
      'image_url': imageUrl,
      'view_count': viewCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        title,
        content,
        isAnonymous,
        isApproved,
        approvedBy,
        approvedAt,
        isPublished,
        publishedAt,
        category,
        imageUrl,
        viewCount,
        createdAt,
        updatedAt,
      ];
}
