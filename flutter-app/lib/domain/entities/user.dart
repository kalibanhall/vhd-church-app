import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final String role;
  final String status;
  final DateTime? birthDate;
  final String? address;
  final String? profileImageUrl;
  final DateTime membershipDate;
  final String? membershipNumber;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final DateTime? baptismDate;
  final String? maritalStatus;
  final String? profession;
  final DateTime createdAt;
  final DateTime updatedAt;

  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    required this.role,
    required this.status,
    this.birthDate,
    this.address,
    this.profileImageUrl,
    required this.membershipDate,
    this.membershipNumber,
    this.emergencyContactName,
    this.emergencyContactPhone,
    this.baptismDate,
    this.maritalStatus,
    this.profession,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';

  bool get isAdmin => role == 'ADMIN';
  bool get isPastor => role == 'PASTEUR' || role == 'ADMIN';
  bool get isOuvrier => role == 'OUVRIER' || role == 'PASTEUR' || role == 'ADMIN';
  bool get isActive => status == 'ACTIVE';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'FIDELE',
      status: json['status'] as String? ?? 'ACTIVE',
      birthDate: json['birth_date'] != null
          ? DateTime.parse(json['birth_date'] as String)
          : null,
      address: json['address'] as String?,
      profileImageUrl: json['profile_image_url'] as String?,
      membershipDate: DateTime.parse(json['membership_date'] as String),
      membershipNumber: json['membership_number'] as String?,
      emergencyContactName: json['emergency_contact_name'] as String?,
      emergencyContactPhone: json['emergency_contact_phone'] as String?,
      baptismDate: json['baptism_date'] != null
          ? DateTime.parse(json['baptism_date'] as String)
          : null,
      maritalStatus: json['marital_status'] as String?,
      profession: json['profession'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'phone': phone,
      'role': role,
      'status': status,
      'birth_date': birthDate?.toIso8601String(),
      'address': address,
      'profile_image_url': profileImageUrl,
      'membership_date': membershipDate.toIso8601String(),
      'membership_number': membershipNumber,
      'emergency_contact_name': emergencyContactName,
      'emergency_contact_phone': emergencyContactPhone,
      'baptism_date': baptismDate?.toIso8601String(),
      'marital_status': maritalStatus,
      'profession': profession,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? role,
    String? status,
    DateTime? birthDate,
    String? address,
    String? profileImageUrl,
    DateTime? membershipDate,
    String? membershipNumber,
    String? emergencyContactName,
    String? emergencyContactPhone,
    DateTime? baptismDate,
    String? maritalStatus,
    String? profession,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      status: status ?? this.status,
      birthDate: birthDate ?? this.birthDate,
      address: address ?? this.address,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      membershipDate: membershipDate ?? this.membershipDate,
      membershipNumber: membershipNumber ?? this.membershipNumber,
      emergencyContactName: emergencyContactName ?? this.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone ?? this.emergencyContactPhone,
      baptismDate: baptismDate ?? this.baptismDate,
      maritalStatus: maritalStatus ?? this.maritalStatus,
      profession: profession ?? this.profession,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        firstName,
        lastName,
        email,
        phone,
        role,
        status,
        birthDate,
        address,
        profileImageUrl,
        membershipDate,
        membershipNumber,
        emergencyContactName,
        emergencyContactPhone,
        baptismDate,
        maritalStatus,
        profession,
        createdAt,
        updatedAt,
      ];
}
