import 'package:flutter/material.dart';
import 'package:vhd_church_app/core/theme/app_theme.dart';
import 'package:vhd_church_app/core/config/supabase_config.dart';
import 'package:vhd_church_app/domain/entities/event.dart';

class SermonsTab extends StatefulWidget {
  const SermonsTab({super.key});

  @override
  State<SermonsTab> createState() => _SermonsTabState();
}

class _SermonsTabState extends State<SermonsTab> {
  List<Sermon> _sermons = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSermons();
  }

  Future<void> _loadSermons() async {
    setState(() => _isLoading = true);
    try {
      final response = await SupabaseConfig.client
          .from('sermons')
          .select()
          .eq('is_published', true)
          .order('sermon_date', ascending: false)
          .limit(50);

      if (mounted) {
        setState(() {
          _sermons = (response as List).map((e) => Sermon.fromJson(e)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Erreur chargement sermons: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sermons & Prédications'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadSermons,
              child: _sermons.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.play_circle_outline, size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text(
                            'Aucun sermon disponible',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _sermons.length,
                      itemBuilder: (context, index) {
                        return _buildSermonCard(_sermons[index]);
                      },
                    ),
            ),
    );
  }

  Widget _buildSermonCard(Sermon sermon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          // TODO: Ouvrir le lecteur de sermon
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image miniature
            if (sermon.thumbnailUrl != null)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: Image.network(
                  sermon.thumbnailUrl!,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 180,
                    color: Colors.grey[300],
                    child: const Icon(Icons.image_not_supported, size: 48),
                  ),
                ),
              )
            else
              Container(
                height: 180,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: const Center(
                  child: Icon(Icons.play_circle, size: 64, color: AppTheme.primaryColor),
                ),
              ),
            // Informations
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    sermon.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  if (sermon.description != null)
                    Text(
                      sermon.description!,
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.visibility, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${sermon.viewCount} vues',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      if (sermon.durationMinutes != null) ...[
                        const SizedBox(width: 16),
                        Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          '${sermon.durationMinutes} min',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
