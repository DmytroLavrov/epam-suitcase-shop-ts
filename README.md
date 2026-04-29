# 🛒 BEST SHOP – E-Commerce Project

## 📊 Evaluation & Deployment

* **Implementation Score:** **64 / 64**
* **Live Demo:** [View Demo](epam-suitcase-shop-ts.vercel.app)

---

## 📖 About the Project

This is a responsive e-commerce front-end application built as part of a fundamentals project template. It includes a fully functional catalog, product details, shopping cart, and contact pages.

The project is developed using **TypeScript** and styled with **SCSS** following the **BEM methodology**.

---

## 🚀 Features

* ✅ **TypeScript Integration** – Strong typing for better reliability and maintainability
* 🎨 **SCSS & BEM** – Scalable and modular styling architecture
* 📱 **Responsive Design** – Works on mobile, tablet, and desktop
* 🔄 **Dynamic Content** – Data loaded from local JSON
* 🛍️ **Core Functionality:**

  * Home page slider
  * Product filtering & sorting
  * Shopping cart management
  * Form validation

---

## 📋 Prerequisites

Make sure you have installed:

* **Node.js** (v14 or higher)
* **npm** (comes with Node.js)

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd fundamentals-project-ts-template
```

### 2. Install dependencies

```bash
npm install
```

---

## 💻 Running the Project (Development)

Start the development server with live reload:

```bash
npm run dev
```

This will:

* Compile TypeScript and SCSS
* Start a local server
* Open the app in your browser automatically

---

## 🏗️ Building for Production

Create a production-ready build:

```bash
npm run build
```

Output files will be generated in the `dist/` folder.

---

## 🌐 Deployment

This project can be easily deployed using:

* Vercel
* GitHub Pages

---

## 📂 Project Structure

```plaintext
fundamentals-project-ts-template/
├── src/
│   ├── assets/           # Images, icons, data.json
│   ├── html/             # Pages (catalog, cart, contact, etc.)
│   ├── scss/             # SCSS (7-1 architecture)
│   ├── ts/               # TypeScript logic
│   └── index.html        # Main entry point
├── dist/                 # Production build
├── .eslintrc.json        # ESLint config
├── .stylelintrc.json     # Stylelint config
├── tsconfig.json         # TypeScript config
├── vercel.json           # Deployment config
└── package.json          # Dependencies & scripts
```

---

## 🧹 Linting & Code Formatting

### Check TypeScript

```bash
npm run lint:ts
```

### Check SCSS

```bash
npm run lint:scss
```

### Fix all lint issues

```bash
npm run lint:fix
```
