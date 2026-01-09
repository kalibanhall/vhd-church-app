/**
 * =============================================================================
 * SERVICE DE PRÉDICATIONS ET MÉDIAS - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Gestion des prédications (sermons)
 * - Séries de prédications
 * - Notes et timestamps
 * - Favoris et historique
 * - Streaming et téléchargement
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface Sermon {
  id: string;
  title: string;
  description?: string;
  preacher: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  date: Date;
  duration: number; // secondes
  seriesId?: string;
  seriesOrder?: number;
  scripture?: {
    book: string;
    chapter: number;
    verses: string;
  }[];
  tags: string[];
  media: {
    videoUrl?: string;
    audioUrl?: string;
    thumbnailUrl?: string;
    quality?: 'sd' | 'hd' | '4k';
    fileSize?: number;
  };
  transcript?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  stats: {
    views: number;
    downloads: number;
    favorites: number;
    averageWatchTime: number;
  };
  status: 'draft' | 'processing' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SermonSeries {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  preacher?: {
    id: string;
    name: string;
  };
  startDate?: Date;
  endDate?: Date;
  sermonCount: number;
  totalDuration: number;
  tags: string[];
  status: 'ongoing' | 'completed';
  createdAt: Date;
}

export interface SermonNote {
  id: string;
  sermonId: string;
  memberId: string;
  content: string;
  timestamps: {
    time: number; // secondes
    note: string;
  }[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SermonFavorite {
  id: string;
  sermonId: string;
  memberId: string;
  savedAt: Date;
  lastWatchedAt?: Date;
  watchProgress?: number; // pourcentage
  notes?: string;
}

export interface WatchHistory {
  id: string;
  sermonId: string;
  memberId: string;
  watchedAt: Date;
  duration: number; // temps regardé
  progress: number; // pourcentage de progression
  completed: boolean;
  device?: string;
}

// ============================================================================
// SERVICE SERMONS
// ============================================================================

export class SermonService {
  
  /**
   * Formater la durée en texte lisible
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    if (minutes > 0) {
      return `${minutes}min ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Calculer le temps de lecture restant
   */
  static getRemainingTime(totalDuration: number, progress: number): number {
    return Math.round(totalDuration * (1 - progress / 100));
  }

  /**
   * Générer les chapitres/sections automatiques
   */
  static generateChapters(duration: number, count: number = 4): { time: number; label: string }[] {
    const chapterDuration = Math.floor(duration / count);
    return Array.from({ length: count }, (_, i) => ({
      time: i * chapterDuration,
      label: `Partie ${i + 1}`
    }));
  }

  /**
   * Recherche avancée dans les prédications
   */
  static searchSermons(
    sermons: Sermon[],
    query: string,
    filters?: {
      preacherId?: string;
      seriesId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      tags?: string[];
      hasVideo?: boolean;
      hasAudio?: boolean;
    }
  ): Sermon[] {
    let results = [...sermons];
    const lowerQuery = query.toLowerCase();

    // Recherche textuelle
    if (query) {
      results = results.filter(s => 
        s.title.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery) ||
        s.preacher.name.toLowerCase().includes(lowerQuery) ||
        s.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        s.scripture?.some(sc => 
          sc.book.toLowerCase().includes(lowerQuery) ||
          `${sc.book} ${sc.chapter}`.toLowerCase().includes(lowerQuery)
        )
      );
    }

    // Filtres
    if (filters) {
      if (filters.preacherId) {
        results = results.filter(s => s.preacher.id === filters.preacherId);
      }
      if (filters.seriesId) {
        results = results.filter(s => s.seriesId === filters.seriesId);
      }
      if (filters.dateFrom) {
        results = results.filter(s => new Date(s.date) >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        results = results.filter(s => new Date(s.date) <= filters.dateTo!);
      }
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(s => 
          filters.tags!.some(tag => s.tags.includes(tag))
        );
      }
      if (filters.hasVideo) {
        results = results.filter(s => !!s.media.videoUrl);
      }
      if (filters.hasAudio) {
        results = results.filter(s => !!s.media.audioUrl);
      }
    }

    return results;
  }

  /**
   * Suggestions de prédications basées sur l'historique
   */
  static getRecommendations(
    sermons: Sermon[],
    watchHistory: WatchHistory[],
    favorites: SermonFavorite[],
    limit: number = 5
  ): Sermon[] {
    // Identifier les préférences
    const watchedIds = new Set(watchHistory.map(w => w.sermonId));
    const favoriteIds = new Set(favorites.map(f => f.sermonId));
    
    // Tags des favoris et sermons complétés
    const preferredTags = new Map<string, number>();
    const completedHistory = watchHistory.filter(w => w.completed);
    
    for (const h of completedHistory) {
      const sermon = sermons.find(s => s.id === h.sermonId);
      if (sermon) {
        sermon.tags.forEach(tag => {
          preferredTags.set(tag, (preferredTags.get(tag) || 0) + 1);
        });
      }
    }

    // Scorer les sermons non vus
    const candidates = sermons
      .filter(s => !watchedIds.has(s.id) && s.status === 'published')
      .map(sermon => {
        let score = 0;
        
        // Points pour les tags correspondants
        sermon.tags.forEach(tag => {
          score += (preferredTags.get(tag) || 0) * 2;
        });
        
        // Points pour les sermons récents
        const daysSincePublish = Math.floor(
          (Date.now() - new Date(sermon.publishedAt || sermon.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSincePublish < 7) score += 3;
        else if (daysSincePublish < 30) score += 1;
        
        // Points pour les sermons populaires
        score += Math.log(sermon.stats.views + 1);
        score += sermon.stats.favorites * 0.5;
        
        return { sermon, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(c => c.sermon);

    return candidates;
  }

  /**
   * Statistiques de la bibliothèque de prédications
   */
  static getLibraryStats(sermons: Sermon[]): {
    totalSermons: number;
    totalDuration: number;
    totalViews: number;
    topPreachers: { id: string; name: string; count: number }[];
    topTags: { tag: string; count: number }[];
    byMonth: { month: string; count: number }[];
  } {
    // Comptage par prédicateur
    const preacherCounts = new Map<string, { name: string; count: number }>();
    sermons.forEach(s => {
      const existing = preacherCounts.get(s.preacher.id) || { name: s.preacher.name, count: 0 };
      preacherCounts.set(s.preacher.id, { ...existing, count: existing.count + 1 });
    });

    // Comptage par tag
    const tagCounts = new Map<string, number>();
    sermons.forEach(s => {
      s.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Par mois
    const monthCounts = new Map<string, number>();
    sermons.forEach(s => {
      const month = new Date(s.date).toISOString().substring(0, 7);
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    });

    return {
      totalSermons: sermons.length,
      totalDuration: sermons.reduce((acc, s) => acc + s.duration, 0),
      totalViews: sermons.reduce((acc, s) => acc + s.stats.views, 0),
      topPreachers: Array.from(preacherCounts.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topTags: Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      byMonth: Array.from(monthCounts.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12)
    };
  }
}

// ============================================================================
// SERVICE SÉRIES
// ============================================================================

export class SeriesService {
  
  /**
   * Obtenir les prédications d'une série dans l'ordre
   */
  static getSeriesSermons(sermons: Sermon[], seriesId: string): Sermon[] {
    return sermons
      .filter(s => s.seriesId === seriesId)
      .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
  }

  /**
   * Calculer la progression d'une série pour un membre
   */
  static getSeriesProgress(
    sermons: Sermon[],
    seriesId: string,
    watchHistory: WatchHistory[]
  ): {
    total: number;
    watched: number;
    completed: number;
    progress: number;
    nextSermon?: Sermon;
  } {
    const seriesSermons = this.getSeriesSermons(sermons, seriesId);
    const watchedIds = new Set(watchHistory.filter(w => w.completed).map(w => w.sermonId));
    
    const watched = seriesSermons.filter(s => watchHistory.some(w => w.sermonId === s.id)).length;
    const completed = seriesSermons.filter(s => watchedIds.has(s.id)).length;
    
    // Prochaine prédication non terminée
    const nextSermon = seriesSermons.find(s => !watchedIds.has(s.id));

    return {
      total: seriesSermons.length,
      watched,
      completed,
      progress: seriesSermons.length > 0 ? Math.round((completed / seriesSermons.length) * 100) : 0,
      nextSermon
    };
  }
}

// ============================================================================
// SERVICE NOTES
// ============================================================================

export class NoteService {
  
  /**
   * Exporter les notes en Markdown
   */
  static exportToMarkdown(note: SermonNote, sermon: Sermon): string {
    let markdown = `# Notes: ${sermon.title}\n\n`;
    markdown += `**Prédicateur:** ${sermon.preacher.name}\n`;
    markdown += `**Date:** ${new Date(sermon.date).toLocaleDateString('fr-FR')}\n\n`;
    
    if (sermon.scripture && sermon.scripture.length > 0) {
      markdown += `**Passages:** ${sermon.scripture.map(s => `${s.book} ${s.chapter}:${s.verses}`).join(', ')}\n\n`;
    }
    
    markdown += `---\n\n`;
    markdown += note.content + '\n\n';
    
    if (note.timestamps.length > 0) {
      markdown += `## Notes temporisées\n\n`;
      note.timestamps
        .sort((a, b) => a.time - b.time)
        .forEach(ts => {
          markdown += `- **${SermonService.formatDuration(ts.time)}**: ${ts.note}\n`;
        });
    }
    
    return markdown;
  }

  /**
   * Rechercher dans les notes
   */
  static searchNotes(notes: SermonNote[], query: string): SermonNote[] {
    const lowerQuery = query.toLowerCase();
    return notes.filter(n => 
      n.content.toLowerCase().includes(lowerQuery) ||
      n.timestamps.some(ts => ts.note.toLowerCase().includes(lowerQuery))
    );
  }
}

// ============================================================================
// SERVICE STREAMING
// ============================================================================

export class StreamingService {
  
  /**
   * Générer une URL de streaming signée (simulation)
   */
  static generateStreamingUrl(
    mediaUrl: string,
    memberId: string,
    expiresIn: number = 3600
  ): string {
    const expires = Date.now() + expiresIn * 1000;
    const token = Buffer.from(`${memberId}:${expires}`).toString('base64');
    
    // Dans un vrai scénario, on signerait cryptographiquement
    return `${mediaUrl}?token=${token}&expires=${expires}`;
  }

  /**
   * Qualités disponibles pour le streaming
   */
  static getAvailableQualities(): { quality: string; label: string; bitrate: number }[] {
    return [
      { quality: 'auto', label: 'Auto', bitrate: 0 },
      { quality: '360p', label: '360p', bitrate: 800 },
      { quality: '480p', label: '480p', bitrate: 1200 },
      { quality: '720p', label: '720p HD', bitrate: 2500 },
      { quality: '1080p', label: '1080p Full HD', bitrate: 5000 },
      { quality: '4k', label: '4K Ultra HD', bitrate: 15000 }
    ];
  }

  /**
   * Estimer la bande passante nécessaire
   */
  static estimateDownloadSize(duration: number, quality: string): number {
    const bitrates: Record<string, number> = {
      '360p': 800,
      '480p': 1200,
      '720p': 2500,
      '1080p': 5000,
      '4k': 15000
    };
    
    const bitrate = bitrates[quality] || 2500;
    // Taille en Mo = (bitrate en kbps * durée en secondes) / 8 / 1024
    return Math.round((bitrate * duration) / 8 / 1024);
  }
}

const sermonsExports = {
  SermonService,
  SeriesService,
  NoteService,
  StreamingService
};

export default sermonsExports;
