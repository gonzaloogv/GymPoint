#!/bin/bash

JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJ0ZXN0ZmluYWxAdGVzdC5jb20iLCJyb2xlcyI6WyJVU0VSIl0sImlkX3VzZXJfcHJvZmlsZSI6NiwiaWF0IjoxNzYxOTc4NTc4LCJleHAiOjE3NjE5Nzk0Nzh9.UQ8CZ5Vu6iXG3_rC5qWVrSkNQx3Dvi1zZWE5YdxQvOo"

echo "=========================================="
echo "   USER_ROUTINE COMPLETE TESTS"
echo "=========================================="
echo ""

echo "✅ TEST 1: POST /api/routines - Crear rutina"
ROUTINE_RESP=$(curl -s -X POST http://localhost:3000/api/routines \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"routine_name":"Complete Test","description":"Testing all endpoints","exercises":[{"id_exercise":1,"series":3,"reps":"10","order":1},{"id_exercise":2,"series":4,"reps":"12","order":2}]}')

echo "$ROUTINE_RESP"
ID_ROUTINE=$(echo "$ROUTINE_RESP" | grep -o '"id_routine":[0-9]*' | grep -o '[0-9]*' || echo "15")
echo "ID Routine: $ID_ROUTINE"
echo ""

echo "✅ TEST 2: POST /api/user-routines - Asignar rutina"
curl -s -X POST http://localhost:3000/api/user-routines \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{\"id_routine\":$ID_ROUTINE,\"start_date\":\"2025-10-01\"}"
echo ""
echo ""

echo "✅ TEST 3: GET /api/user-routines/me - Obtener rutina activa"
curl -s -X GET http://localhost:3000/api/user-routines/me \
  -H "Authorization: Bearer $JWT"
echo ""
echo ""

echo "✅ TEST 4: GET /api/user-routines/me/active-routine - Rutina con ejercicios (CRITICAL)"
curl -s -X GET http://localhost:3000/api/user-routines/me/active-routine \
  -H "Authorization: Bearer $JWT"
echo ""
echo ""

echo "✅ TEST 5: PUT /api/user-routines/me/end - Finalizar rutina"
curl -s -X PUT http://localhost:3000/api/user-routines/me/end \
  -H "Authorization: Bearer $JWT"
echo ""
echo ""

echo "✅ TEST 6: GET /api/user-routines/me - Debería dar 404 (no active routine)"
curl -s -X GET http://localhost:3000/api/user-routines/me \
  -H "Authorization: Bearer $JWT"
echo ""
echo ""

echo "=========================================="
echo "   TESTS COMPLETED"
echo "=========================================="
