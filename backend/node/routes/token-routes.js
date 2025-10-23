/**
 * Token Routes - Lote 5
 * Los endpoints de tokens ahora están en user-routes.js bajo /api/users/:userId/tokens/*
 * Este archivo se mantiene para compatibilidad pero no tiene rutas activas
 */

const express = require('express');
const router = express.Router();

// Todas las rutas de tokens fueron movidas a user-routes.js
// Endpoints disponibles:
// - POST /api/users/:userId/tokens/add
// - POST /api/users/:userId/tokens/spend
// - GET /api/users/:userId/tokens/balance
// - GET /api/users/:userId/tokens/ledger
// - GET /api/users/:userId/tokens/stats

module.exports = router;
