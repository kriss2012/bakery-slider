# DvBakes - Interactive 3D Bakery Slider & Lab

An immersive, full-stack interactive bakery product slider and toppings customizer built with Vite React, Framer Motion, and Express.js.

Live Demo (Frontend Baseline): [https://kriss2012.github.io/bakery-slider/](https://kriss2012.github.io/bakery-slider/)

## ✨ Key Features

- **3D Tilted Product Portal**: A mouse-parallax-guided product display utilizing Framer Motion springs for deep perspective and tilt transitions.
- **Bakery Lab Customizer**: An interactive widget allowing users to toggle toppings (sprinkles, choco chips, mint, marshmallows) that dynamically fall in a physics simulation over the current product.
- **5-Second Particle decay**: Smart timer management automatically decays particle streams and untoggles toppings after 5 seconds to keep screen clutter to a minimum.
- **21 Premium Products**: Catalog containing 21 handcrafted desserts served dynamically via the Express API backend, complete with customizable specs, ingredients, and nutrition details.
- **Full Shopping Cart**: A glassmorphic side-out drawer syncing quantities, selected toppings, and item removals with the backend in real-time, featuring estimated taxes, shipping thresholds, and interactive checkout screens.
- **Responsive Layout**: Fluid layouts switching between vertical columns and horizontal scrollable lists for smooth mobile navigation.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Framer Motion, React Icons, Vanilla CSS
- **Backend**: Node.js, Express, CORS
- **APIs**: Restful Cart & Product endpoints

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kriss2012/bakery-slider.git
   ```

2. Install dependencies for both the frontend and backend:
   ```bash
   # Install Frontend packages
   cd vite-project
   npm install

   # Install Backend packages
   cd ../backend
   npm install
   ```

### Running the Application

To run the application locally, you will need to start both servers:

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   The backend server runs on `http://localhost:5000`.

2. **Start the Frontend Dev Server**:
   ```bash
   cd vite-project
   npm run dev
   ```
   The frontend server starts on `http://localhost:5173`. The Vite server is configured to proxy all `/api` requests to the backend server automatically.

