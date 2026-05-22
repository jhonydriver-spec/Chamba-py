# ChambaPy 🔧

Una plataforma web para conectar trabajadores verificados con clientes en Paraguay.

## ✨ Características

- 🔍 **Buscar trabajadores** por oficio y zona
- 👤 **Crear perfil gratis** con foto/video de trabajos
- ⭐ **Sistema de reseñas** y calificaciones
- 💬 **Contacto directo** por WhatsApp
- 📸 **Galería de trabajos** con fotos y videos
- 🛡️ **Verificación** de perfiles
- ⭐ **Destacados** para mayor visibilidad (Gs 5.000/mes)
- 📱 **Diseño responsive** optimizado para móviles
- 💾 **Almacenamiento local** (sin servidor necesario)

## 🚀 Inicio rápido

### Opción 1: GitHub Pages

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jhonydriver-spec/chamba-py.git
   cd chamba-py
   ```

2. **Habilitar GitHub Pages:**
   - Ir a `Settings` → `Pages`
   - Seleccionar `main` branch como source
   - Guardar

3. **Acceder:**
   - La app estará disponible en: `https://jhonydriver-spec.github.io/chamba-py`

### Opción 2: Localmente

```bash
# Abrir index.html en un navegador
open index.html
# o
start index.html
```

## 📖 Cómo usar

### Para Trabajadores

1. **Registrarse:**
   - Click en "👤 Perfil"
   - Ingresar teléfono y PIN (4 dígitos)
   - Completar información del perfil
   - Click en "Crear perfil"

2. **Subir trabajos:**
   - Seleccionar fotos/videos de tus trabajos
   - Click en "Subir archivo"
   - Los clientes verán tu portafolio

3. **Recibir clientes:**
   - Los clientes te contactarán por WhatsApp
   - Verán tu calificación y reseñas

### Para Clientes

1. **Buscar trabajadores:**
   - Click en "🔍 Buscar"
   - Escribir oficio (ej: electricista, plomero)
   - Seleccionar zona
   - Ver resultados ordenados por rating

2. **Ver trabajos:**
   - Click en fotos para ver galería completa
   - Ver reseñas de otros clientes
   - Verificado = trabajador confiable

3. **Contactar:**
   - Click en "💬 Contactar por WhatsApp"
   - Se abre WhatsApp con el trabajador
   - Dejar reseña después del trabajo

## 🔧 Tecnología

- **Frontend:** HTML5 + CSS3 + JavaScript vanilla
- **Almacenamiento:** LocalStorage del navegador
- **Hospedaje:** GitHub Pages (gratis)
- **No requiere:** Backend, base de datos, servidor

## 📱 Navegación

La app tiene 3 pestañas principales:

| Pestaña | Descripción |
|---------|-------------|
| 🔍 Buscar | Ver todos los trabajadores disponibles |
| 👤 Perfil | Tu perfil y tus trabajos (requiere login) |
| ⚙️ Admin | Panel de verificación (PIN: 1234) |

## 🔐 Seguridad

- Cada trabajador usa PIN de 4 dígitos personal
- Panel admin protegido con PIN (1234 para demo)
- Los datos se guardan en LocalStorage (solo en el dispositivo)

## 💾 Datos

Los datos se guardan automáticamente en:
- `champa_trabajadores` - Lista de todos los trabajadores
- `champa_usuario` - Perfil del usuario actual
- `champa_autenticado` - Estado de autenticación

### Exportar/Importar datos

```javascript
// En la consola del navegador (F12)

// Exportar
copy(JSON.stringify(localStorage))

// Importar (después de JSON.parse)
localStorage.setItem('champa_trabajadores', data)
```

## 🎨 Personalización

Puedes editar:
- Colores: Variables en `<style>` (índice.html)
- Zonas: Opciones en `<select id="filtro-zona">`
- Oficios: Opciones en `<select id="oficio">`
- Mensajes: Textos en HTML
- Precio destacado: Cambiar "Gs 5.000/mes"

## 📞 WhatsApp Integration

Los enlaces de WhatsApp se generan automáticamente:
```
https://wa.me/595{NUMERO}&text={MENSAJE}
```

Nota: Usar formato 595 (código país Paraguay) sin 0 inicial

## 🐛 Troubleshooting

**P: ¿Se pierden los datos?**
R: Los datos se guardan en LocalStorage. Se pierden si:
- Limpias el caché del navegador
- Cierras sesión de incógnito
- Cambia de dispositivo

**P: ¿Puedo expandir a múltiples países?**
R: Sí, solo cambia los prefijos telefónicos y zonas.

**P: ¿Cuál es el límite de fotos?**
R: LocalStorage permite ~5-10MB por dominio. Máx ~50-100 fotos según tamaño.

## 📈 Mejoras futuras

- [ ] Backend con base de datos
- [ ] Hosting en servidor (Heroku, Railway, etc)
- [ ] Almacenamiento de imágenes (Firebase, Cloudinary)
- [ ] Validación y verificación de teléfono
- [ ] Pagos integrados
- [ ] App móvil nativa
- [ ] Chat integrado
- [ ] Geolocalización

## 📄 Licencia

MIT - Libre para usar y modificar

## 👨‍💻 Autor

**jhonydriver-spec** - [GitHub](https://github.com/jhonydriver-spec)

---

¿Preguntas? Crea un [issue](https://github.com/jhonydriver-spec/chamba-py/issues) 😊
