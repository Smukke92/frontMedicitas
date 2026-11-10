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
- El paciente consulta disponibilidad semanal por especialidad/médico, confirma citas, ve próximos periodos e historial, y puede cancelar o reprogramar.
- El médico consulta su agenda del día o de la semana y marca citas como atendidas o inasistencia.
- Las agendas solicitan intervalos de 90 días para pacientes y de 1 o 7 días para médicos, evitando cargar todo el historial.
- Navegación limitada por rol en la interfaz; el backend sigue siendo quien autoriza cada petición protegida.

## Límites actuales del API

- El backend asigna `1 = Administrador`, `2 = Medico`, `3 = Paciente` y no emite un rol de Recepcionista. El frontend no concede acceso a roles desconocidos.
- El directorio por médico expone `idMedico` e `idUsuario`, pero el login solo devuelve `idUsuario`; la agenda médica se vincula consultando el directorio.
- El inicio de sesión no devuelve el `idPaciente` ni existe un endpoint para consultar el perfil del paciente autenticado; no es seguro inferir esos datos desde el `idUsuario`.
- No hay catálogo de especialidades ni estado del médico en el DTO del directorio. Por eso se solicita el ID de especialidad y se pide seleccionar explícitamente el estado a aplicar.
- El registro de pacientes requiere correo y contraseña. El API no tiene una operación específica para el alta asistida por recepción.
- La disponibilidad solo puede consultarse para una fecha. El calendario muestra una semana y consulta hasta siete fechas, con un máximo de tres solicitudes simultáneas.
- Los DTOs de citas no incluyen el lugar de atención; la interfaz lo indica como no informado y no inventa una dirección.
- El servicio convierte errores de unicidad de PostgreSQL en conflictos al agendar/reprogramar, pero en el código inspeccionado no aparece el DDL de los índices/constraints que garantizan la exclusión concurrente. El frontend informa el conflicto si el API responde `409`; la garantía real debe verificarse en el esquema de base de datos.
- `GET /api/medicos/{idMedico}/disponibilidad` aparece mapeado tanto en los endpoints de horarios como en los de citas. Ambas rutas coinciden en método y URL, por lo que la resolución puede ser ambigua en ASP.NET Core.
