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
- El paciente consulta disponibilidad semanal por especialidad/médico mediante el endpoint por rango, confirma citas enviando su `idUsuario` como `idPaciente` y `idSede` 1, ve próximos periodos e historial, y puede cancelar o reprogramar.
- El médico consulta su agenda del día o de la semana y marca citas como atendidas o inasistencia.
- Las agendas solicitan intervalos de 90 días para pacientes y de 1 o 7 días para médicos, evitando cargar todo el historial.
- Navegación limitada por rol en la interfaz; el backend sigue siendo quien autoriza cada petición protegida.

## Límites actuales del API

- El backend asigna `1 = Administrador`, `2 = Medico`, `3 = Paciente` y no emite un rol de Recepcionista. El frontend no concede acceso a roles desconocidos.
- El directorio por médico expone `idMedico` e `idUsuario`, pero el login solo devuelve `idUsuario`; la agenda médica se vincula consultando el directorio.
- El login incluye `IdPaciente` en el JWT, pero el endpoint de agendamiento usa el `NameIdentifier` (`idUsuario`) cuando `idPaciente` no viene en el body. El frontend envía `idUsuario` explícitamente para que la cita quede asociada con el usuario autenticado.
- No hay catálogo de especialidades ni estado del médico en el DTO del directorio. Por eso se solicita el ID de especialidad y se pide seleccionar explícitamente el estado a aplicar.
- El registro de pacientes requiere correo y contraseña. El API no tiene una operación específica para el alta asistida por recepción.
- La disponibilidad devuelve un diccionario por fecha al consultar `fechaInicio` y `fechaFin`; el calendario solicita una semana por petición.
- La lista de citas incluye el lugar (`Lugar`), pero el endpoint de creación solo devuelve el ID y un mensaje. El resumen de reserva indica Sede 1 según el valor definido en el DTO, sin inventar una dirección.
- El servicio convierte errores de unicidad de PostgreSQL en conflictos al agendar/reprogramar, pero en el código inspeccionado no aparece el DDL de los índices/constraints que garantizan la exclusión concurrente. El frontend informa el conflicto si el API responde `409`; la garantía real debe verificarse en el esquema de base de datos.
