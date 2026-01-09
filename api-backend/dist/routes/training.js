"use strict";
/**
 * =============================================================================
 * ROUTE API: TRAINING (Formations/Cours)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /training/courses - Liste des cours
 * - GET /training/courses/:id - Détail d'un cours avec leçons
 * - POST /training/courses - Créer un cours (admin)
 * - PUT /training/courses/:id - Modifier un cours (admin)
 * - DELETE /training/courses/:id - Supprimer un cours (admin)
 * - POST /training/courses/:id/enroll - S'inscrire à un cours
 * - POST /training/lessons/:id/complete - Marquer une leçon comme terminée
 * - GET /training/my-enrollments - Mes inscriptions
 *
 * =============================================================================
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET - Liste des cours
router.get('/courses', async (req, res) => {
    try {
        const category = req.query.category;
        const level = req.query.level;
        const active_only = req.query.active_only || 'true';
        const courses = await (0, database_1.default) `
      SELECT 
        c.*,
        u.name as instructor_display_name,
        (SELECT COUNT(*) FROM course_lessons cl WHERE cl.course_id = c.id) as lesson_count,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as enrollment_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE 1=1
      ${active_only === 'true' ? (0, database_1.default) `AND c.is_active = true` : (0, database_1.default) ``}
      ${category ? (0, database_1.default) `AND c.category = ${category}` : (0, database_1.default) ``}
      ${level ? (0, database_1.default) `AND c.level = ${level}` : (0, database_1.default) ``}
      ORDER BY c.created_at DESC
    `;
        res.json({
            success: true,
            data: courses,
            count: courses.length
        });
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des cours'
        });
    }
});
// GET - Détail d'un cours avec leçons
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [course] = await (0, database_1.default) `
      SELECT 
        c.*,
        u.name as instructor_display_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ${id}
    `;
        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Cours non trouvé'
            });
        }
        // Récupérer les leçons
        const lessons = await (0, database_1.default) `
      SELECT * FROM course_lessons
      WHERE course_id = ${id}
      ORDER BY order_index ASC
    `;
        res.json({
            success: true,
            data: {
                ...course,
                lessons
            }
        });
    }
    catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du cours'
        });
    }
});
// POST - Créer un cours (admin)
router.post('/courses', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { title, description, category, level = 'beginner', duration, image_url, instructor_id, instructor_name, max_students, start_date, end_date, is_online = false, prerequisites, lessons = [] } = req.body;
        if (!title || !category) {
            return res.status(400).json({
                success: false,
                error: 'Le titre et la catégorie sont requis'
            });
        }
        // Créer le cours
        const [newCourse] = await (0, database_1.default) `
      INSERT INTO courses (
        title, description, category, level, duration, image_url,
        instructor_id, instructor_name, max_students, start_date,
        end_date, is_online, prerequisites
      ) VALUES (
        ${title}, ${description}, ${category}, ${level}, ${duration}, ${image_url},
        ${instructor_id}, ${instructor_name}, ${max_students}, ${start_date},
        ${end_date}, ${is_online}, ${prerequisites}
      )
      RETURNING *
    `;
        // Créer les leçons si fournies
        if (lessons.length > 0) {
            for (let i = 0; i < lessons.length; i++) {
                const lesson = lessons[i];
                await (0, database_1.default) `
          INSERT INTO course_lessons (
            course_id, title, description, content, video_url,
            document_url, order_index, duration_minutes
          ) VALUES (
            ${newCourse.id}, ${lesson.title}, ${lesson.description}, ${lesson.content},
            ${lesson.video_url}, ${lesson.document_url}, ${i + 1}, ${lesson.duration_minutes}
          )
        `;
            }
        }
        res.status(201).json({
            success: true,
            data: newCourse,
            message: 'Cours créé avec succès'
        });
    }
    catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création du cours'
        });
    }
});
// PUT - Modifier un cours (admin)
router.put('/courses/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, level, duration, image_url, instructor_id, instructor_name, max_students, start_date, end_date, is_online, is_active, prerequisites } = req.body;
        const [updated] = await (0, database_1.default) `
      UPDATE courses SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        category = COALESCE(${category}, category),
        level = COALESCE(${level}, level),
        duration = COALESCE(${duration}, duration),
        image_url = COALESCE(${image_url}, image_url),
        instructor_id = COALESCE(${instructor_id}, instructor_id),
        instructor_name = COALESCE(${instructor_name}, instructor_name),
        max_students = COALESCE(${max_students}, max_students),
        start_date = COALESCE(${start_date}, start_date),
        end_date = COALESCE(${end_date}, end_date),
        is_online = COALESCE(${is_online}, is_online),
        is_active = COALESCE(${is_active}, is_active),
        prerequisites = COALESCE(${prerequisites}, prerequisites),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Cours non trouvé'
            });
        }
        res.json({
            success: true,
            data: updated,
            message: 'Cours modifié avec succès'
        });
    }
    catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification du cours'
        });
    }
});
// DELETE - Supprimer un cours (admin)
router.delete('/courses/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        const [deleted] = await (0, database_1.default) `
      UPDATE courses SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Cours non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Cours supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du cours'
        });
    }
});
// POST - S'inscrire à un cours
router.post('/courses/:id/enroll', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Vérifier si le cours existe
        const [course] = await (0, database_1.default) `SELECT * FROM courses WHERE id = ${id} AND is_active = true`;
        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Cours non trouvé'
            });
        }
        // Vérifier le nombre max d'étudiants
        if (course.max_students) {
            const [{ count }] = await (0, database_1.default) `
        SELECT COUNT(*) as count FROM course_enrollments WHERE course_id = ${id}
      `;
            if (count >= course.max_students) {
                return res.status(400).json({
                    success: false,
                    error: 'Ce cours est complet'
                });
            }
        }
        // Créer l'inscription
        const [enrollment] = await (0, database_1.default) `
      INSERT INTO course_enrollments (course_id, user_id, status)
      VALUES (${id}, ${userId}, 'enrolled')
      ON CONFLICT (course_id, user_id) DO NOTHING
      RETURNING *
    `;
        if (!enrollment) {
            return res.status(400).json({
                success: false,
                error: 'Vous êtes déjà inscrit à ce cours'
            });
        }
        // Mettre à jour le compteur
        await (0, database_1.default) `
      UPDATE courses SET current_students = (
        SELECT COUNT(*) FROM course_enrollments WHERE course_id = ${id}
      ) WHERE id = ${id}
    `;
        res.status(201).json({
            success: true,
            data: enrollment,
            message: 'Inscription réussie'
        });
    }
    catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'inscription'
        });
    }
});
// POST - Marquer une leçon comme terminée
router.post('/lessons/:lessonId/complete', auth_1.authenticate, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user?.id;
        // Trouver l'inscription correspondante
        const [lesson] = await (0, database_1.default) `SELECT * FROM course_lessons WHERE id = ${lessonId}`;
        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Leçon non trouvée'
            });
        }
        const [enrollment] = await (0, database_1.default) `
      SELECT * FROM course_enrollments 
      WHERE course_id = ${lesson.course_id} AND user_id = ${userId}
    `;
        if (!enrollment) {
            return res.status(400).json({
                success: false,
                error: 'Vous n\'êtes pas inscrit à ce cours'
            });
        }
        // Marquer la leçon comme terminée
        await (0, database_1.default) `
      INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completed_at)
      VALUES (${enrollment.id}, ${lessonId}, true, NOW())
      ON CONFLICT (enrollment_id, lesson_id) 
      DO UPDATE SET completed = true, completed_at = NOW()
    `;
        // Calculer le nouveau pourcentage de progression
        const [{ total }] = await (0, database_1.default) `
      SELECT COUNT(*) as total FROM course_lessons WHERE course_id = ${lesson.course_id}
    `;
        const [{ completed }] = await (0, database_1.default) `
      SELECT COUNT(*) as completed FROM lesson_progress lp
      JOIN course_lessons cl ON lp.lesson_id = cl.id
      WHERE lp.enrollment_id = ${enrollment.id} AND lp.completed = true
    `;
        const progress = Math.round((completed / total) * 100);
        // Mettre à jour l'inscription
        await (0, database_1.default) `
      UPDATE course_enrollments SET
        progress_percentage = ${progress},
        status = ${progress === 100 ? 'completed' : 'in_progress'},
        started_at = COALESCE(started_at, NOW()),
        completed_at = ${progress === 100 ? (0, database_1.default) `NOW()` : (0, database_1.default) `NULL`}
      WHERE id = ${enrollment.id}
    `;
        res.json({
            success: true,
            data: { progress },
            message: progress === 100 ? 'Félicitations ! Cours terminé !' : 'Leçon terminée'
        });
    }
    catch (error) {
        console.error('Error completing lesson:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la validation de la leçon'
        });
    }
});
// GET - Mes inscriptions aux cours
router.get('/my-enrollments', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const enrollments = await (0, database_1.default) `
      SELECT 
        ce.*,
        c.title as course_title,
        c.description as course_description,
        c.category,
        c.level,
        c.duration,
        c.image_url,
        c.instructor_name,
        (SELECT COUNT(*) FROM course_lessons cl WHERE cl.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp 
         JOIN course_lessons cl ON lp.lesson_id = cl.id 
         WHERE lp.enrollment_id = ce.id AND lp.completed = true) as completed_lessons
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.user_id = ${userId}
      ORDER BY ce.enrolled_at DESC
    `;
        res.json({
            success: true,
            data: enrollments
        });
    }
    catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de vos inscriptions'
        });
    }
});
// GET - Statistiques des inscriptions (admin)
router.get('/stats', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const [stats] = await (0, database_1.default) `
      SELECT 
        (SELECT COUNT(*) FROM courses WHERE is_active = true) as total_courses,
        (SELECT COUNT(*) FROM course_enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM course_enrollments WHERE status = 'completed') as completed_enrollments,
        (SELECT COUNT(DISTINCT user_id) FROM course_enrollments) as unique_students
    `;
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});
exports.default = router;
//# sourceMappingURL=training.js.map