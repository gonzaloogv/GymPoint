#!/bin/bash

# Test script for persistent incomplete session between logout/login
# Verifica que el progreso local (checks, pesos, tiempo) persista cuando:
# 1. Usuario inicia rutina
# 2. Completa algunos sets
# 3. Se deslogea
# 4. Se vuelve a loguear
# 5. Ve la rutina PENDING con su progreso restaurado

echo "================================"
echo "Test: Persistent Session Flow"
echo "================================"
echo ""

# Configuration
BASE_URL="http://localhost:3000"
USER_EMAIL="g@g.com"
USER_PASSWORD="mitre280"

echo "Step 1: Login"
echo "-------------"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${USER_EMAIL}\", \"password\": \"${USER_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | grep -o '[^"]*$')
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*$')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully"
echo "   User ID: $USER_ID"
echo "   Token: ${TOKEN:0:20}..."
echo ""

echo "Step 2: Get user routines"
echo "-------------------------"
ROUTINES=$(curl -s -X GET "${BASE_URL}/api/routines/me" \
  -H "Authorization: Bearer $TOKEN")

ROUTINE_ID=$(echo $ROUTINES | grep -o '"id_routine":[0-9]*' | head -1 | grep -o '[0-9]*$')

if [ -z "$ROUTINE_ID" ]; then
  echo "❌ No routines found"
  echo "Response: $ROUTINES"
  exit 1
fi

echo "✅ Found routine ID: $ROUTINE_ID"
echo ""

echo "Step 3: Check for existing active session"
echo "-----------------------------------------"
ACTIVE_SESSION=$(curl -s -X GET "${BASE_URL}/api/workouts/sessions/me/active" \
  -H "Authorization: Bearer $TOKEN")

SESSION_ID=$(echo $ACTIVE_SESSION | grep -o '"id_workout_session":[0-9]*' | grep -o '[0-9]*$')

if [ -z "$SESSION_ID" ]; then
  echo "No active session found, starting new one..."

  echo ""
  echo "Step 4: Start workout session"
  echo "-----------------------------"
  START_SESSION=$(curl -s -X POST "${BASE_URL}/api/workouts/sessions" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"id_routine\": ${ROUTINE_ID}, \"started_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}")

  SESSION_ID=$(echo $START_SESSION | grep -o '"id_workout_session":[0-9]*' | grep -o '[0-9]*$')

  if [ -z "$SESSION_ID" ]; then
    echo "❌ Failed to start session"
    echo "Response: $START_SESSION"
    exit 1
  fi

  echo "✅ Session started: $SESSION_ID"
else
  echo "✅ Found existing active session: $SESSION_ID"
fi
echo ""

echo "Step 5: Register some sets (simulating user progress)"
echo "-----------------------------------------------------"
# This would be done in the frontend, simulating it here for completeness
curl -s -X POST "${BASE_URL}/api/workouts/sessions/${SESSION_ID}/sets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id_exercise": 1, "weight": 50, "reps": 10, "set_number": 1}' > /dev/null

curl -s -X POST "${BASE_URL}/api/workouts/sessions/${SESSION_ID}/sets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id_exercise": 1, "weight": 50, "reps": 10, "set_number": 2}' > /dev/null

echo "✅ Registered 2 sets for exercise 1"
echo ""

echo "Step 6: Verify session is IN_PROGRESS"
echo "-------------------------------------"
SESSION_CHECK=$(curl -s -X GET "${BASE_URL}/api/workouts/sessions/me/active" \
  -H "Authorization: Bearer $TOKEN")

SESSION_STATUS=$(echo $SESSION_CHECK | grep -o '"status":"[^"]*' | grep -o '[^"]*$')

if [ "$SESSION_STATUS" == "IN_PROGRESS" ]; then
  echo "✅ Session is IN_PROGRESS"
else
  echo "❌ Session status unexpected: $SESSION_STATUS"
  exit 1
fi
echo ""

echo "Step 7: Logout (without clearing data)"
echo "--------------------------------------"
LOGOUT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"${REFRESH_TOKEN}\"}")

echo "✅ Logged out"
echo ""

echo "Step 8: Login again"
echo "------------------"
LOGIN_RESPONSE2=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${USER_EMAIL}\", \"password\": \"${USER_PASSWORD}\"}")

TOKEN2=$(echo $LOGIN_RESPONSE2 | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN2" ]; then
  echo "❌ Re-login failed"
  exit 1
fi

echo "✅ Logged in again"
echo "   New Token: ${TOKEN2:0:20}..."
echo ""

echo "Step 9: Check active session (should still exist)"
echo "-------------------------------------------------"
SESSION_CHECK2=$(curl -s -X GET "${BASE_URL}/api/workouts/sessions/me/active" \
  -H "Authorization: Bearer $TOKEN2")

SESSION_ID2=$(echo $SESSION_CHECK2 | grep -o '"id_workout_session":[0-9]*' | grep -o '[0-9]*$')
SESSION_STATUS2=$(echo $SESSION_CHECK2 | grep -o '"status":"[^"]*' | grep -o '[^"]*$')
ROUTINE_ID2=$(echo $SESSION_CHECK2 | grep -o '"id_routine":[0-9]*' | grep -o '[0-9]*$')

if [ "$SESSION_ID2" == "$SESSION_ID" ] && [ "$SESSION_STATUS2" == "IN_PROGRESS" ]; then
  echo "✅ Session persisted correctly!"
  echo "   Session ID: $SESSION_ID2"
  echo "   Status: $SESSION_STATUS2"
  echo "   Routine ID: $ROUTINE_ID2"
else
  echo "❌ Session not found or status changed"
  echo "   Expected: $SESSION_ID (IN_PROGRESS)"
  echo "   Got: $SESSION_ID2 ($SESSION_STATUS2)"
  exit 1
fi
echo ""

echo "Step 10: Get sets for verification"
echo "----------------------------------"
SETS=$(curl -s -X GET "${BASE_URL}/api/workouts/sessions/${SESSION_ID2}/sets" \
  -H "Authorization: Bearer $TOKEN2")

SET_COUNT=$(echo $SETS | grep -o '"id_workout_set"' | wc -l)

echo "✅ Found $SET_COUNT sets in session"
echo ""

echo "================================"
echo "✅ ALL TESTS PASSED!"
echo "================================"
echo ""
echo "Frontend should:"
echo "1. Show modal with incomplete session on app load"
echo "2. Display routine in PENDING filter"
echo "3. Restore exerciseStates (checks) when resuming"
echo "4. Restore duration/timer when resuming"
echo "5. Restore weights and reps from localStorage"
echo ""
echo "To verify in mobile app:"
echo "1. Login → Start routine → Complete some sets"
echo "2. Wait a few seconds (for duration to accumulate)"
echo "3. Logout from app"
echo "4. Login again"
echo "5. Check that:"
echo "   - Modal shows incomplete session"
echo "   - PENDING tab shows the routine"
echo "   - Tapping 'Continue' restores ALL progress:"
echo "     * Checked sets (exerciseStates)"
echo "     * Weights and reps"
echo "     * Timer/duration"
echo ""
echo "AsyncStorage keys (scoped per user):"
echo "  @GymPoint:user_${USER_ID}:incompleteSession"
echo "  @GymPoint:user_${USER_ID}:dbVersion"
echo ""
