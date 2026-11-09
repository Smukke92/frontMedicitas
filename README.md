# MediCitas — frontend

Interfaz web para el sistema de citas médicas, construida con React, Vite y Tailwind CSS.

## Desarrollo

```sh
npm install
npm run dev
```

El cliente usa `https://backend-medicitas-legacy.onrender.com/api` por defecto. Para apuntar a otra instancia, define `VITE_API_URL` con la URL base que incluya `/api`.

## Verificación

```sh
npm run lint
npm run build
```

## Funcionalidades conectadas

- Inicio/cierre de sesión, registro público de pacientes y mensajes de validación.
- Directorio público de médicos.
- Administración de médicos, horarios y disponibilidad según los endpoints existentes.
- Búsqueda de pacientes por documento o nombre y actualización administrativa de sus datos.
- Navegación limitada por rol en la interfaz; el backend sigue siendo quien autoriza cada petición protegida.

## Límites actuales del API

- El backend asigna `1 = Administrador`, `2 = Medico`, `3 = Paciente` y no emite un rol de Recepcionista. El frontend no concede acceso a roles desconocidos.
- El inicio de sesión no devuelve el `idPaciente` ni existe un endpoint para consultar el perfil del paciente autenticado; no es seguro inferir esos datos desde el `idUsuario`.
- No hay catálogo de especialidades ni estado del médico en el DTO del directorio. Por eso se solicita el ID de especialidad y se pide seleccionar explícitamente el estado a aplicar.
- El registro de pacientes requiere correo y contraseña. El API no tiene una operación específica para el alta asistida por recepción.
