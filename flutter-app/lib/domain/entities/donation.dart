import 'package:equatable/equatable.dart';

class Donation extends Equatable {
  final String id;
  final String userId;
  final double amount;
  final String donationType;
  final String paymentMethod;
  final String? paymentReference;
  final DateTime donationDate;
  final String status;
  final String? projectId;
  final String? notes;
  final String? receiptNumber;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Donation({
    required this.id,
    required this.userId,
    required this.amount,
    required this.donationType,
    required this.paymentMethod,
    this.paymentReference,
    required this.donationDate,
    required this.status,
    this.projectId,
    this.notes,
    this.receiptNumber,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Donation.fromJson(Map<String, dynamic> json) {
    return Donation(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      donationType: json['donation_type'] as String,
      paymentMethod: json['payment_method'] as String,
      paymentReference: json['payment_reference'] as String?,
      donationDate: DateTime.parse(json['donation_date'] as String),
      status: json['status'] as String? ?? 'COMPLETED',
      projectId: json['project_id'] as String?,
      notes: json['notes'] as String?,
      receiptNumber: json['receipt_number'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'amount': amount,
      'donation_type': donationType,
      'payment_method': paymentMethod,
      'payment_reference': paymentReference,
      'donation_date': donationDate.toIso8601String(),
      'status': status,
      'project_id': projectId,
      'notes': notes,
      'receipt_number': receiptNumber,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        amount,
        donationType,
        paymentMethod,
        paymentReference,
        donationDate,
        status,
        projectId,
        notes,
        receiptNumber,
        createdAt,
        updatedAt,
      ];
}

class DonationProject extends Equatable {
  final String id;
  final String projectName;
  final String? description;
  final double targetAmount;
  final double currentAmount;
  final DateTime? startDate;
  final DateTime? endDate;
  final String status;
  final String? projectImageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  const DonationProject({
    required this.id,
    required this.projectName,
    this.description,
    required this.targetAmount,
    required this.currentAmount,
    this.startDate,
    this.endDate,
    required this.status,
    this.projectImageUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  double get progressPercentage {
    if (targetAmount == 0) return 0;
    return (currentAmount / targetAmount * 100).clamp(0, 100);
  }

  bool get isActive => status == 'ACTIVE';
  bool get isCompleted => status == 'COMPLETED';

  factory DonationProject.fromJson(Map<String, dynamic> json) {
    return DonationProject(
      id: json['id'] as String,
      projectName: json['project_name'] as String,
      description: json['description'] as String?,
      targetAmount: (json['target_amount'] as num).toDouble(),
      currentAmount: (json['current_amount'] as num?)?.toDouble() ?? 0,
      startDate: json['start_date'] != null
          ? DateTime.parse(json['start_date'] as String)
          : null,
      endDate: json['end_date'] != null
          ? DateTime.parse(json['end_date'] as String)
          : null,
      status: json['status'] as String? ?? 'ACTIVE',
      projectImageUrl: json['project_image_url'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project_name': projectName,
      'description': description,
      'target_amount': targetAmount,
      'current_amount': currentAmount,
      'start_date': startDate?.toIso8601String(),
      'end_date': endDate?.toIso8601String(),
      'status': status,
      'project_image_url': projectImageUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        projectName,
        description,
        targetAmount,
        currentAmount,
        startDate,
        endDate,
        status,
        projectImageUrl,
        createdAt,
        updatedAt,
      ];
}
