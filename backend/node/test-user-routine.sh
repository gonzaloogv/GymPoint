#!/bin/bash

JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJmaW5hbEB0ZXN0LmNvbSIsInJvbGVzIjpbIlVTRVIiXSwiaWRfdXNlcl9wcm9maWxlIjo1LCJpYXQiOjE3NjE5NzM5NzQsImV4cCI6MTc2MTk3NDg3NH0.2tf7DjJL8qmu7JF05V8wkpJU3POBLeHIlnB5FEcx4Hc"

echo "=== USER_ROUTINE TESTS ==="
echo ""

echo "✅ TEST 1: POST /api/routines - Crear rutina primero"
ROUTINE=$(curl -s -X POST http://localhost:3000/api/routines \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"routine_name":"Test Routine","description":"Test","exercises":[{"id_exercise":1,"series":3,"reps":"10","order":1},{"id_exercise":2,"series":4,"reps":"8-12","order":2}]}')
ID_ROUTINE=$(echo $ROUTINE | python -c "import sys, json; print(json.load(sys.stdin)['data']['id_routine'])" 2>/dev/null || echo "1")
echo "Routine creada: ID=$ID_ROUTINE"
echo ""

echo "✅ TEST 2: POST /api/user-routines - Asignar rutina"
curl -s -X POST http://localhost:3000/api/user-routines \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{\"id_routine\":$ID_ROUTINE,\"start_date\":\"2025-10-01\"}" | python -m json.tool
echo ""

echo "✅ TEST 3: GET /api/user-routines/me - Rutina activa"
curl -s -X GET http://localhost:3000/api/user-routines/me \
  -H "Authorization: Bearer $JWT" | python -m json.tool
echo ""

echo "✅ TEST 4: GET /api/user-routines/me/active-routine - Con ejercicios"
curl -s -X GET http://localhost:3000/api/user-routines/me/active-routine \
  -H "Authorization: Bearer $JWT" | python -m json.tool
echo ""

echo "✅ TEST 5: PUT /api/user-routines/me/end - Finalizar rutina"
curl -s -X PUT http://localhost:3000/api/user-routines/me/end \
  -H "Authorization: Bearer $JWT" | python -m json.tool
echo ""

echo "✅ TEST 6: GET /api/user-routines/me - Debería devolver 404"
curl -s -X GET http://localhost:3000/api/user-routines/me \
  -H "Authorization: Bearer $JWT" | python -m json.tool
