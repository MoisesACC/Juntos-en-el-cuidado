<div align="center">
  <img src="https://ibb.co/MDCcBm9R" alt="Juntos en el Cuidado" />
  <h1>Juntos en el Cuidado</h1>
  <p><i>Gestión de información médica de emergencia para adultos mayores</i></p>
</div>

---

## 🌟 Descripción

**Juntos en el Cuidado** es una aplicación diseñada para gestionar información médica de emergencia, enfocada en adultos mayores. Permite a los usuarios registrar y mantener actualizada su información médica crítica, generar códigos QR dinámicos y compartir su perfil médico en situaciones de emergencia.

---

## 🚀 Características Principales

- **Gestión de Perfiles Médicos:**
  - Registro de alergias, condiciones médicas, medicamentos y notas importantes.
  - Agregar contactos de emergencia con relación y número telefónico.

- **Códigos QR Dinámicos:**
  - Generación de un código QR único para cada usuario.
  - Acceso público al perfil médico mediante el código QR.

- **Integración con IA:**
  - Uso de la API de Gemini para limpiar y mejorar notas médicas.

- **Seguridad:**
  - Uso de Supabase con políticas de seguridad a nivel de filas (RLS) para proteger los datos.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - React con TypeScript.
  - TailwindCSS para diseño responsivo.

- **Backend:**
  - Supabase para autenticación y base de datos.

- **Integraciones:**
  - `qrcode.react` para generación de códigos QR.
  - `@google/genai` para limpieza de notas médicas con IA.

---

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior).

### Pasos

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/MoisesACC/Juntos-en-el-cuidado.git
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   - Crea un archivo `.env.local` en la raíz del proyecto.
   - Agrega las siguientes variables:
     ```env
     SUPABASE_URL=tu_url_de_supabase
     SUPABASE_KEY=tu_clave_de_supabase
     GEMINI_API_KEY=tu_clave_de_gemini
     ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Accede a la aplicación:**
   ```
   http://localhost:3000
   ```

---

## 🗂️ Estructura del Proyecto

```plaintext
📦 Juntos-en-el-Cuidado
├── 📂 components
│   └── Button.tsx
├── 📂 pages
│   ├── Dashboard.tsx
│   ├── Editor.tsx
│   ├── EmergencyPublic.tsx
│   ├── Login.tsx
│   └── QRView.tsx
├── 📂 services
│   ├── geminiService.ts
│   ├── storage.ts
│   └── supabaseClient.ts
├── App.tsx
├── index.html
├── index.tsx
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto, por favor abre un issue o envía un pull request.


<div align="center">
  <p>Hecho por "Moises" para - <b>Juntos en el Cuidado</b></p>
</div>
