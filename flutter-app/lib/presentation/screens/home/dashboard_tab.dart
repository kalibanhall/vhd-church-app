import 'package:flutter/material.dart';
import 'package:vhd_church_app/core/theme/app_theme.dart';
import 'package:vhd_church_app/core/config/supabase_config.dart';

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  String _userName = '';
  int _totalMembers = 0;
  int _upcomingEvents = 0;
  double _totalDonations = 0;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    try {
      final userId = SupabaseConfig.client.auth.currentUser?.id;
      if (userId != null) {
        // Charger les infos utilisateur
        final userData = await SupabaseConfig.client
            .from('users')
            .select()
            .eq('id', userId)
            .single();
        
        // Charger les statistiques
        final membersCount = await SupabaseConfig.client
            .from('users')
            .select()
            .count();
        
        final eventsCount = await SupabaseConfig.client
            .from('events')
            .select()
            .gte('event_date', DateTime.now().toIso8601String())
            .count();
        
        final donationsSum = await SupabaseConfig.client
            .from('donations')
            .select('amount')
            .eq('user_id', userId);

        double totalDonations = 0;
        for (var donation in donationsSum) {
          totalDonations += (donation['amount'] as num).toDouble();
        }

        if (mounted) {
          setState(() {
            _userName = '${userData['first_name']} ${userData['last_name']}';
            _totalMembers = membersCount.count;
            _upcomingEvents = eventsCount.count;
            _totalDonations = totalDonations;
          });
        }
      }
    } catch (e) {
      debugPrint('Erreur lors du chargement du dashboard: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Ouvrir les notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Carte de bienvenue
              _buildWelcomeCard(),
              const SizedBox(height: 24),
              // Statistiques
              const Text(
                'Statistiques',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildStatsGrid(),
              const SizedBox(height: 24),
              // Actions rapides
              const Text(
                'Actions rapides',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildQuickActions(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Bienvenue',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _userName.isEmpty ? 'Chargement...' : _userName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Que Dieu vous bénisse aujourd\'hui !',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          icon: Icons.people,
          title: 'Membres',
          value: _totalMembers.toString(),
          color: AppTheme.primaryColor,
        ),
        _buildStatCard(
          icon: Icons.event,
          title: 'Événements',
          value: _upcomingEvents.toString(),
          color: AppTheme.successColor,
        ),
        _buildStatCard(
          icon: Icons.volunteer_activism,
          title: 'Mes dons',
          value: '${_totalDonations.toStringAsFixed(0)} \$',
          color: AppTheme.accentColor,
        ),
        _buildStatCard(
          icon: Icons.play_circle,
          title: 'Sermons',
          value: 'Nouveau',
          color: AppTheme.infoColor,
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      children: [
        _buildActionButton(
          icon: Icons.volunteer_activism,
          title: 'Faire un don',
          onTap: () {
            // TODO: Ouvrir la page des dons
          },
        ),
        const SizedBox(height: 12),
        _buildActionButton(
          icon: Icons.calendar_today,
          title: 'Prendre un rendez-vous',
          onTap: () {
            // TODO: Ouvrir la page des rendez-vous
          },
        ),
        const SizedBox(height: 12),
        _buildActionButton(
          icon: Icons.prayer_times,
          title: 'Demande de prière',
          onTap: () {
            // TODO: Ouvrir la page des prières
          },
        ),
        const SizedBox(height: 12),
        _buildActionButton(
          icon: Icons.celebration,
          title: 'Partager un témoignage',
          onTap: () {
            // TODO: Ouvrir la page des témoignages
          },
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppTheme.primaryColor),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
