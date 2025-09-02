# API de Contactos - Capibet CRM

Este documento describe las rutas de API disponibles para la gestión de contactos en el sistema Capibet CRM.

## Estructura de la API

```
src/app/api/contactos/
├── importar/
│   └── route.ts               # POST /api/contactos/importar
├── exportar/
│   └── route.ts               # GET /api/contactos/exportar
```

## Endpoints Disponibles
### 6. Importar Contactos desde CSV

**POST** `/api/contactos/importar`

Importa contactos desde un archivo CSV con formato Google Contacts.

#### Form Data:
- `file`: Archivo CSV (requerido)

#### Formato CSV Soportado:
El sistema acepta archivos CSV exportados desde Google Contacts con las siguientes columnas:
- Name (nombre completo)
- Given Name (nombre)
- Family Name (apellido)
- Birthday (cumpleaños)
- Notes (notas)
- E-mail 1 - Value (correo)
- Phone 1 - Value (teléfono)
- Address 1 - Formatted (dirección)
- Website 1 - Value (sitio web)

**Nota**: Los campos empresa, cargo y etiqueta se asignan con valores por defecto durante la importación.

#### Ejemplo de Response:
```json
{
  "message": "Importación completada: 25 exitosos, 2 fallidos",
  "errores": [
    "Lote 1: Error de validación en línea 15",
    "Lote 2: Email duplicado en línea 23"
  ]
}
```

### 7. Exportar Contactos a CSV

**GET** `/api/contactos/exportar`

Exporta todos los contactos a un archivo CSV.

#### Ejemplo de Request:
```bash
GET /api/contactos/exportar
```

#### Response:
Retorna un archivo CSV descargable con todos los contactos en formato completo.

**Formato de Exportación:**
- Incluye todas las columnas: ID, Nombre, Apellido, Nombre Completo, Correo, Teléfono, Empresa, Empresa ID, Cargo, Etiqueta, Notas, Dirección, Cumpleaños, Sitio Web, Creado Por, Creado En, Actualizado En
- Archivo: `contactos_YYYY-MM-DD.csv`

1. **Base de Datos**: Todas las operaciones se realizan directamente contra Supabase usando la REST API.

2. **Validación**: Los contactos requieren al menos nombre, correo electrónico y teléfono para ser creados en nuestra base de datos.

4. **Exportación**: Se generan archivos CSV con formato Google Calendar.