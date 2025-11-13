const express = require('express');
const router = express.Router();
const controller = require('../controllers/media-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/media/{entity_type}/{entity_id}:
 *   get:
 *     summary: Obtener media de una entidad específica
 *     description: Lista todos los archivos multimedia asociados a una entidad (usuario, gimnasio, ejercicio, progreso)
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: entity_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [USER_PROFILE, GYM, EXERCISE, PROGRESS]
 *         description: Tipo de entidad
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entidad
 *     responses:
 *       200:
 *         description: Lista de archivos multimedia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_media:
 *                     type: integer
 *                   entity_type:
 *                     type: string
 *                   entity_id:
 *                     type: integer
 *                   media_type:
 *                     type: string
 *                     enum: [IMAGE, VIDEO]
 *                   url:
 *                     type: string
 *                   thumbnail_url:
 *                     type: string
 *                   file_size:
 *                     type: integer
 *                   mime_type:
 *                     type: string
 *                   width:
 *                     type: integer
 *                   height:
 *                     type: integer
 *                   is_primary:
 *                     type: boolean
 *                   display_order:
 *                     type: integer
 *                   uploaded_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Entidad no encontrada
 */
router.get('/:entity_type/:entity_id', controller.listarMedia);

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Listar todo el media del usuario autenticado
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de archivos multimedia del usuario
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Subir un nuevo archivo multimedia
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - entity_type
 *               - entity_id
 *               - file
 *             properties:
 *               entity_type:
 *                 type: string
 *                 enum: [USER_PROFILE, GYM, EXERCISE, PROGRESS]
 *                 description: Tipo de entidad a la que pertenece el archivo
 *               entity_id:
 *                 type: integer
 *                 description: ID de la entidad
 *               media_type:
 *                 type: string
 *                 enum: [IMAGE, VIDEO]
 *                 default: IMAGE
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir
 *               is_primary:
 *                 type: boolean
 *                 default: false
 *                 description: Si es la imagen principal
 *               display_order:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_media:
 *                   type: integer
 *                 url:
 *                   type: string
 *                 thumbnail_url:
 *                   type: string
 *                 file_size:
 *                   type: integer
 *       400:
 *         description: Datos inválidos o tipo de archivo no permitido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/', verificarToken, verificarUsuarioApp, controller.listarMedia);
router.post('/', verificarToken, verificarUsuarioApp, controller.crearMedia);

/**
 * @swagger
 * /api/media/{id_media}/primary:
 *   post:
 *     summary: Establecer un archivo como principal
 *     description: Marca un archivo multimedia como principal para una entidad
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_media
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo multimedia
 *     responses:
 *       200:
 *         description: Archivo marcado como principal exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app o no es el propietario
 *       404:
 *         description: Archivo no encontrado
 */
router.post('/:id_media/primary', verificarToken, verificarUsuarioApp, controller.establecerPrincipal);

/**
 * @swagger
 * /api/media/{id_media}:
 *   delete:
 *     summary: Eliminar un archivo multimedia
 *     description: Elimina un archivo multimedia del sistema y del almacenamiento
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_media
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo multimedia
 *     responses:
 *       204:
 *         description: Archivo eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app o no es el propietario
 *       404:
 *         description: Archivo no encontrado
 */
router.delete('/:id_media', verificarToken, verificarUsuarioApp, controller.eliminarMedia);

module.exports = router;
