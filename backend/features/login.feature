Feature: Autenticación de Login
  Como usuario final
  Quiero iniciar sesión con credenciales válidas
  Para poder acceder a mi cuenta.

  Background:
    Given que la API está disponible en "http://localhost:3000"

  Scenario: Inicio de sesión exitoso
    When ingreso con el email "usuario.valido@example.com" y la contraseña "Password123!"
    Then la respuesta debe ser exitosa (código 200)
    And la respuesta debe contener un token de autenticación en "tokens.accessToken"
    And la respuesta debe contener un token de refresco en "tokens.refreshToken"

  Scenario: Inicio de sesión fallido
    When ingreso con el email "usuario.invalido@example.com" y la contraseña "pass-incorrecta"
    Then la respuesta debe ser un error de cliente (código 401)
    And el cuerpo debe incluir el código de error "LOGIN_FAILED"
