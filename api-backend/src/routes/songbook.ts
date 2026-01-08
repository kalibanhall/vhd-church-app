/**
 * =============================================================================
 * ROUTE API: SONGBOOK (Cantiques)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Endpoints:
 * - GET /songbook - Liste des cantiques
 * - GET /songbook/categories - Catégories
 * - GET /songbook/:id - Détail d'un cantique (paroles, accords)
 * - POST /songbook/:id/favorite - Ajouter aux favoris
 * - GET /songbook/favorites - Mes favoris
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET - Liste des cantiques
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    try {
      const songs = await sql`
        SELECT * FROM songbook
        WHERE 1=1
        ${category ? sql`AND category = ${category}` : sql``}
        ${search ? sql`AND (title ILIKE ${'%' + search + '%'} OR author ILIKE ${'%' + search + '%'} OR first_line ILIKE ${'%' + search + '%'})` : sql``}
        ORDER BY number ASC, title ASC
      `;

      res.json({
        success: true,
        songs: songs.map(s => ({
          id: s.id,
          number: s.number,
          title: s.title,
          author: s.author,
          category: s.category,
          firstLine: s.first_line,
          hasChords: s.has_chords,
          hasAudio: s.has_audio,
        })),
      });
    } catch (dbError) {
      res.json({
        success: true,
        songs: getMockSongs(),
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching songbook:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération',
    });
  }
});

// GET - Catégories
router.get('/categories', async (req: Request, res: Response) => {
  res.json({
    success: true,
    categories: [
      { id: 'worship', name: 'Louange & Adoration', count: 85 },
      { id: 'hymns', name: 'Hymnes classiques', count: 120 },
      { id: 'christmas', name: 'Noël', count: 25 },
      { id: 'easter', name: 'Pâques', count: 18 },
      { id: 'communion', name: 'Sainte Cène', count: 15 },
      { id: 'children', name: 'Enfants', count: 30 },
    ],
  });
});

// GET - Détail d'un cantique
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    try {
      const [song] = await sql`
        SELECT * FROM songbook WHERE id = ${id}
      `;

      if (!song) {
        return res.status(404).json({
          success: false,
          error: 'Cantique non trouvé',
        });
      }

      res.json({
        success: true,
        song: {
          id: song.id,
          number: song.number,
          title: song.title,
          author: song.author,
          category: song.category,
          lyrics: song.lyrics,
          chordsLyrics: song.chords_lyrics,
          audioUrl: song.audio_url,
        },
      });
    } catch (dbError) {
      // Return mock song
      res.json({
        success: true,
        song: {
          id,
          number: 1,
          title: 'Cantique de louange',
          author: 'Auteur inconnu',
          category: 'worship',
          lyrics: 'Paroles du cantique...\n\nVerset 1:\nLes paroles ici...\n\nRefrain:\nLe refrain ici...',
          chordsLyrics: null,
          audioUrl: null,
        },
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur',
    });
  }
});

// POST - Ajouter aux favoris
router.post('/:id/favorite', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    try {
      const [existing] = await sql`
        SELECT id FROM songbook_favorites WHERE song_id = ${id} AND user_id = ${userId}
      `;

      if (existing) {
        await sql`DELETE FROM songbook_favorites WHERE song_id = ${id} AND user_id = ${userId}`;
        res.json({ success: true, favorited: false });
      } else {
        await sql`INSERT INTO songbook_favorites (song_id, user_id, created_at) VALUES (${id}, ${userId}, NOW())`;
        res.json({ success: true, favorited: true });
      }
    } catch (dbError) {
      res.json({ success: true, favorited: true, _mock: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur',
    });
  }
});

// GET - Mes favoris
router.get('/favorites/list', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    try {
      const favorites = await sql`
        SELECT s.* FROM songbook s
        JOIN songbook_favorites f ON s.id = f.song_id
        WHERE f.user_id = ${userId}
        ORDER BY s.title ASC
      `;

      res.json({
        success: true,
        songs: favorites,
      });
    } catch (dbError) {
      res.json({
        success: true,
        songs: [],
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur',
    });
  }
});

// Mock data
function getMockSongs() {
  return [
    {
      id: '1',
      number: 1,
      title: 'À toi la gloire',
      author: 'Edmond Budry',
      category: 'hymns',
      firstLine: 'À toi la gloire, ô Ressuscité !',
      hasChords: true,
      hasAudio: true,
    },
    {
      id: '2',
      number: 2,
      title: 'Qu\'il est merveilleux',
      author: 'Charles H. Gabriel',
      category: 'worship',
      firstLine: 'Qu\'il est merveilleux de chanter les louanges...',
      hasChords: true,
      hasAudio: false,
    },
    {
      id: '3',
      number: 3,
      title: 'Jésus le bon berger',
      author: 'Traditionnel',
      category: 'children',
      firstLine: 'Jésus le bon berger veille sur moi',
      hasChords: false,
      hasAudio: true,
    },
  ];
}

export default router;
