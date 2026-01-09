/**
 * API Routes - Sermon Notes
 * 
 * GET    /api/sermons/notes - Récupérer les notes d'un membre
 * POST   /api/sermons/notes - Créer/Mettre à jour des notes
 * DELETE /api/sermons/notes - Supprimer des notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { NoteService, SermonNote } from '@/lib/services/sermons-service';

// Stockage temporaire
let notes: SermonNote[] = [];
let noteIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const sermonId = searchParams.get('sermonId');
    const noteId = searchParams.get('noteId');
    const action = searchParams.get('action');

    // Recherche dans les notes
    if (action === 'search') {
      const query = searchParams.get('q') || '';
      const memberNotes = memberId ? notes.filter(n => n.memberId === memberId) : notes;
      const results = NoteService.searchNotes(memberNotes, query);
      
      return NextResponse.json({
        success: true,
        data: results,
        total: results.length
      });
    }

    // Notes publiques d'une prédication
    if (action === 'public' && sermonId) {
      const publicNotes = notes.filter(n => n.sermonId === sermonId && n.isPublic);
      
      return NextResponse.json({
        success: true,
        data: publicNotes,
        total: publicNotes.length
      });
    }

    // Note spécifique
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        return NextResponse.json(
          { success: false, error: 'Note non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: note });
    }

    // Notes d'un membre pour une prédication
    if (memberId && sermonId) {
      const memberNote = notes.find(n => n.memberId === memberId && n.sermonId === sermonId);
      return NextResponse.json({
        success: true,
        data: memberNote || null
      });
    }

    // Toutes les notes d'un membre
    if (memberId) {
      const memberNotes = notes
        .filter(n => n.memberId === memberId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      return NextResponse.json({
        success: true,
        data: memberNotes,
        total: memberNotes.length
      });
    }

    return NextResponse.json(
      { success: false, error: 'memberId ou sermonId requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Notes GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sermonId, memberId, content, timestamps, isPublic, action } = body;

    // Exporter en Markdown
    if (action === 'export') {
      const { noteId, sermon } = body;
      const note = notes.find(n => n.id === noteId);
      
      if (!note || !sermon) {
        return NextResponse.json(
          { success: false, error: 'Note ou sermon non trouvé' },
          { status: 404 }
        );
      }

      const markdown = NoteService.exportToMarkdown(note, sermon);
      
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="notes-${sermonId}.md"`
        }
      });
    }

    // Ajouter un timestamp
    if (action === 'addTimestamp') {
      const { noteId, time, note: timestampNote } = body;
      const noteIndex = notes.findIndex(n => n.id === noteId);
      
      if (noteIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Note non trouvée' },
          { status: 404 }
        );
      }

      notes[noteIndex].timestamps.push({ time, note: timestampNote });
      notes[noteIndex].updatedAt = new Date();

      return NextResponse.json({
        success: true,
        message: 'Timestamp ajouté',
        data: notes[noteIndex]
      });
    }

    // Créer ou mettre à jour une note
    if (!sermonId || !memberId) {
      return NextResponse.json(
        { success: false, error: 'sermonId et memberId sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si une note existe déjà
    const existingIndex = notes.findIndex(n => n.sermonId === sermonId && n.memberId === memberId);

    if (existingIndex !== -1) {
      // Mettre à jour
      if (content !== undefined) notes[existingIndex].content = content;
      if (timestamps !== undefined) notes[existingIndex].timestamps = timestamps;
      if (isPublic !== undefined) notes[existingIndex].isPublic = isPublic;
      notes[existingIndex].updatedAt = new Date();

      return NextResponse.json({
        success: true,
        message: 'Note mise à jour',
        data: notes[existingIndex]
      });
    }

    // Créer une nouvelle note
    const newNote: SermonNote = {
      id: `note_${noteIdCounter++}`,
      sermonId,
      memberId,
      content: content || '',
      timestamps: timestamps || [],
      isPublic: isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notes.push(newNote);

    return NextResponse.json({
      success: true,
      message: 'Note créée',
      data: newNote
    }, { status: 201 });
  } catch (error) {
    console.error('[Notes POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'opération' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'noteId est requis' },
        { status: 400 }
      );
    }

    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Note non trouvée' },
        { status: 404 }
      );
    }

    const deleted = notes.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Note supprimée',
      data: { id: deleted.id }
    });
  } catch (error) {
    console.error('[Notes DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
