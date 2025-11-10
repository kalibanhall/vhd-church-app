import 'package:flutter/material.dart';
import 'package:vhd_church_app/core/theme/app_theme.dart';
import 'package:vhd_church_app/core/config/supabase_config.dart';
import 'package:vhd_church_app/domain/entities/user.dart';
import 'package:vhd_church_app/presentation/screens/auth/login_screen.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  User? _user;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    setState(() => _isLoading = true);
    try {
      final userId = SupabaseConfig.client.auth.currentUser?.id;
      if (userId != null) {
        final response = await SupabaseConfig.client
            .from('users')
            .select()
            .eq('id', userId)
            .single();

        if (mounted) {
          setState(() {
            _user = User.fromJson(response);
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Erreur chargement profil: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _logout() async {
    try {
      await SupabaseConfig.client.auth.signOut();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur de déconnexion: $e'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadUserProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    // En-tête du profil
                    _buildProfileHeader(),
                    const SizedBox(height: 24),
                    // Options du menu
                    _buildMenuSection(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          // Photo de profil
          CircleAvatar(
            radius: 50,
            backgroundColor: Colors.white,
            backgroundImage: _user?.profileImageUrl != null
                ? NetworkImage(_user!.profileImageUrl!)
                : null,
            child: _user?.profileImageUrl == null
                ? Text(
                    _user != null
                        ? '${_user!.firstName[0]}${_user!.lastName[0]}'
                        : 'U',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  )
                : null,
          ),
          const SizedBox(height: 16),
          // Nom
          Text(
            _user?.fullName ?? 'Chargement...',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          // Email
          Text(
            _user?.email ?? '',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
          // Badge de rôle
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _user?.role ?? '',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          _buildMenuItem(
            icon: Icons.person_outline,
            title: 'Informations personnelles',
            onTap: () {
              // TODO: Ouvrir la page d'édition du profil
            },
          ),
          _buildMenuItem(
            icon: Icons.volunteer_activism,
            title: 'Mes dons',
            onTap: () {
              // TODO: Ouvrir l'historique des dons
            },
          ),
          _buildMenuItem(
            icon: Icons.event_available,
            title: 'Mes rendez-vous',
            onTap: () {
              // TODO: Ouvrir les rendez-vous
            },
          ),
          _buildMenuItem(
            icon: Icons.prayer_times,
            title: 'Mes prières',
            onTap: () {
              // TODO: Ouvrir les demandes de prière
            },
          ),
          _buildMenuItem(
            icon: Icons.celebration,
            title: 'Mes témoignages',
            onTap: () {
              // TODO: Ouvrir les témoignages
            },
          ),
          _buildMenuItem(
            icon: Icons.settings,
            title: 'Paramètres',
            onTap: () {
              // TODO: Ouvrir les paramètres
            },
          ),
          _buildMenuItem(
            icon: Icons.help_outline,
            title: 'Aide & Support',
            onTap: () {
              // TODO: Ouvrir l'aide
            },
          ),
          _buildMenuItem(
            icon: Icons.info_outline,
            title: 'À propos',
            onTap: () {
              // TODO: Ouvrir à propos
            },
          ),
          const SizedBox(height: 16),
          // Version
          Text(
            'Version 1.0.0',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'CHRIS NGOZULU KASONGO (KalibanHall)',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryColor),
        title: Text(title),
        trailing: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
        onTap: onTap,
      ),
    );
  }
}
