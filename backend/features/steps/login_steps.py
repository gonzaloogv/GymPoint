import os
import requests
from behave import given, when, then


def get_by_path(data, path):
    """Acceso seguro a rutas tipo 'a.b.c' en un dict anidado."""
    cur = data
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur


@given('que la API está disponible en "{base_url}"')
def step_set_base_url(context, base_url):
    # Permite sobreescribir via env si se quiere evitar editar el feature
    context.base_url = os.getenv("BASE_URL", base_url)


@when('ingreso con el email "{email}" y la contraseña "{password}"')
def step_login(context, email, password):
    url = f"{context.base_url}/api/auth/login"
    context.response = requests.post(
        url, json={"email": email, "password": password}, timeout=10
    )


@then('la respuesta debe ser exitosa (código {status:d})')
def step_status_ok(context, status):
    assert context.response.status_code == status, (
        f"Esperado {status}, recibido {context.response.status_code}"
    )


@then('la respuesta debe contener un token de autenticación en "{path}"')
def step_has_access_token(context, path):
    data = context.response.json()
    value = get_by_path(data, path)
    assert value, f"No se encontró valor en {path}"


@then('la respuesta debe contener un token de refresco en "{path}"')
def step_has_refresh_token(context, path):
    data = context.response.json()
    value = get_by_path(data, path)
    assert value, f"No se encontró valor en {path}"


@then('la respuesta debe ser un error de cliente (código {status:d})')
def step_status_error(context, status):
    assert context.response.status_code == status, (
        f"Esperado {status}, recibido {context.response.status_code}"
    )


@then('el cuerpo debe incluir el código de error "{code}"')
def step_error_code(context, code):
    data = context.response.json()
    found = data.get("error", {}).get("code")
    assert found == code, f"Esperado error {code}, recibido {found}"
