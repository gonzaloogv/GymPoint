import os
import requests

BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

# Credenciales validas (escenario exitoso)
EMAIL = os.getenv("TEST_EMAIL", "usuario.valido@example.com")
PASSWORD = os.getenv("TEST_PASSWORD", "Password123!")

# Credenciales invalidas (escenario fallido)
INVALID_EMAIL = os.getenv("TEST_EMAIL_INVALID", "usuario.invalido@example.com")
INVALID_PASSWORD = os.getenv("TEST_PASSWORD_INVALID", "pass-incorrecta")


def login(email, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    r = requests.post(url, json=payload, timeout=10)
    print(f"[login] status={r.status_code} url={url} email={email}")
    print(f"[login] body={r.text[:300]}")
    r.raise_for_status()
    return r.json()


def main():
    # Scenario: Inicio de sesion exitoso
    data = login(EMAIL, PASSWORD)
    access = data.get("tokens", {}).get("accessToken")
    refresh = data.get("tokens", {}).get("refreshToken")
    assert access, "Falta tokens.accessToken"
    assert refresh, "Falta tokens.refreshToken"
    print("[ok] Inicio de sesion exitoso: tokens presentes")

    # Scenario: Inicio de sesion fallido
    try:
        login(INVALID_EMAIL, INVALID_PASSWORD)
        raise AssertionError("Se esperaba 401 pero el login con credenciales invalidas paso")
    except requests.HTTPError as err:
        resp = err.response
        assert resp is not None, "Sin respuesta HTTP en el error"
        assert resp.status_code == 401, f"Codigo esperado 401, recibido {resp.status_code}"
        body = resp.json()
        code = body.get("error", {}).get("code")
        assert code == "LOGIN_FAILED", f"Codigo de error esperado LOGIN_FAILED, recibido {code}"
        print("[ok] Inicio de sesion fallido: 401 y codigo LOGIN_FAILED verificados")


if __name__ == "__main__":
    main()
