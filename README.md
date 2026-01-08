# 🕯️ AcolitApp - Programador de Acólitos

Aplicación web para gestionar y programar acólitos de manera equitativa y eficiente para las misas dominicales.

## ✨ Características

- ✅ Gestión de acólitos (mayores y menores)
- 📊 Distribución equitativa automática
- 📁 Importación/Exportación CSV
- 💾 Almacenamiento automático en el navegador (localStorage)
- 📈 Estadísticas de participación en tiempo real
- 📄 Exportación a PDF y Excel
- 🎲 Algoritmo inteligente con balanceo aleatorio

## 🚀 Instalación

```bash
npm install
npm run dev
```

## 📋 Importación de Acólitos desde CSV

### Formato del archivo CSV

El archivo debe tener 3 columnas: **Nombre**, **Apellido**, **Clasificación**

```csv
Nombre,Apellido,Clasificación
Juan,Pérez,Mayor
María,González,Menor
Pedro,Martínez,Mayor
```

### Clasificaciones aceptadas:
- **Para mayores**: Mayor, Adulto, M, A
- **Para menores**: Menor, Niño, N

### Ejemplo incluido
En la raíz del proyecto encontrarás el archivo [`ejemplo_acolitos.csv`](./ejemplo_acolitos.csv) con 17 acólitos de ejemplo que puedes importar para probar la aplicación.

## 💾 Almacenamiento Local

Los datos se guardan automáticamente en el navegador:
- ✅ Lista de acólitos
- ✅ Historial de participaciones
- ✅ Los datos persisten aunque cierres el navegador

**Importante**: Los datos se guardan solo en este navegador. Si cambias de dispositivo o navegador, necesitarás exportar/importar los datos.

## 📊 Cómo funciona el algoritmo

1. **Distribución equitativa**: Selecciona primero a los acólitos con menos participaciones
2. **Aleatoriedad balanceada**: Entre acólitos con participaciones similares, selecciona al azar
3. **Cálculo automático**: Determina cuántas veces debe acolitar cada persona según:
   - Cantidad de acólitos registrados
   - Duración del período (meses)
   - Configuración de mayores/menores por misa

## 🛠️ Tecnologías

- React 18
- Vite
- TailwindCSS
- jsPDF + xlsx (exportación)

## 👨‍💻 Desarrollado por

Mateo Elías

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
