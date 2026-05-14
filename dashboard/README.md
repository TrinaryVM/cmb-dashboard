# CMB Dashboard

A React-based web dashboard for Cosmic Microwave Background (CMB) monitoring, radio astronomy calculators, and physics simulations. Built with Vite, React, and Recharts.

## Features

- **Physics & Astronomy Calculators**: Includes tools like the Friis Transmission Calculator and Radiometer Sensitivity Calculator.
- **Simulators**: Interactive modules such as the Muon Simulator, Signal Simulator, and Von Neumann Simulator.
- **Monitoring & Visualization**: Real-time mock data visualization with the Entropy Pool Monitor, SK Monitor, and Sky Dip Interactive tools.
- **Documentation View**: Integrated markdown support for reading documentation directly within the dashboard.

## Tech Stack

- **Framework**: React 19 + Vite
- **Charting**: Recharts for data visualization
- **Markdown Rendering**: `react-markdown` with `remark-gfm`
- **Styling**: Vanilla CSS with custom animations and layouts

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TrinaryVM/cmb-dashboard.git
   cd cmb-dashboard/dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

This will launch the Vite development server. Open the local URL provided in your terminal to view the dashboard in your browser.

### Building for Production

To create a production build, run:

```bash
npm run build
```

This generates optimized static files in the `dist` directory, which can be deployed to any static web host.

## Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Lints the source code using ESLint.
- `npm run preview`: Previews the production build locally.
