# Kerala EG Studio — Engineering Graphics Solver & Tutor

An interactive web application and descriptive geometry solver designed specifically for engineering students under **APJ Abdul Kalam Technological University (KTU 2024 & 2019 schemes)**, **University of Kerala**, and autonomous engineering colleges across Kerala.

---

## 🌟 Key Features

1. **Deterministic Technical Drawing Engine:**
   - 100% mathematically correct SVG constructions (no AI drawing hallucinations).
   - Compliant with **Bureau of Indian Standards (BIS SP 46:2003 & IS 962)**.
   - First-Angle projection convention (Elevation above XY, Plan below XY).

2. **Manual Hand-Drawing & Sheet Mode:**
   - Realistic ivory cartridge drawing sheet background (`#FBF9F4`) with 20mm left margin (for binding) and 10mm borders.
   - Standard Kerala Engineering Title Block with First-Angle Projection symbol.
   - **Pencil Grade Guidance (4H / 2H / HB):**
     - **4H / 3H:** Light needle-point lines for construction, loci, and inter-view projectors (< 0.2 mm).
     - **2H:** Sharp chisel-point lines for XY reference line, centerlines, section hatching, and dimensioning (~0.35 mm).
     - **HB:** Smooth dark lines for visible object boundaries and final solid views (~0.7 mm).
   - **Mini-Drafter Technique & Alignment Guide:** Step-by-step physical manual instructions for drawing board work.

3. **Inter-View Projection Lines:**
   - Prominent, distinct projection lines connecting Front View, Top View, and Profile View.
   - Independent one-click toggle for projectors, construction lines, and dimensions.
   - Visual guidance showing how points transfer across views and 45° miter lines.

4. **Comprehensive Geometry Solvers:**
   - **Projection of Points:** All 4 quadrants & reference planes.
   - **Projection of Straight Lines:** Rotating-line method, apparent lengths ($\alpha, \beta$), true lengths ($\theta, \phi$), and traces (HT & VT).
   - **Projection of Planes:** Triangles, squares, pentagons, hexagons, and circles inclined to HP and VP.
   - **Projection of Solids (Simple & 3-Stage):**
     - Prisms, Pyramids, Cylinders, Cones.
     - **3-Stage Projection:** Simple position $\to$ Inclined to HP $\to$ Inclined to VP, rendered side-by-side along an extended XY line.
   - **3-View Orthographic Projection:** Front View, Top View, and Side/Profile View with vertical $X_1Y_1$ reference line and 45° miter line.
   - **Sections of Solids & True Shape:** Section plane cutting solids with 45° BIS hatching and true shape construction.
   - **Development of Surfaces:** Parallel-line and radial stretch-out development with fold lines.
   - **Isometric Views & Projections:** 1:1 isometric views and 0.816 isometric scale projections.
   - **Perspective Projection:** Visual-ray method with Picture Plane (PP), Ground Line (GL), Horizon Line (HL), and Station Point (SP).
   - **Engineering Curves:** Involute of a circle and Cycloid with exact normals and tangents.

5. **Interactive 2D CAD Drafting Workbench:**
   - 2D drafting with grid snap, ortho locking, line, circle, rect, dimension, and DXF export.

6. **Interactive Step-by-Step Player:**
   - Play/pause timeline, scrubber, speed control (0.5x–2x), keyboard shortcuts (`Space`, `←`, `→`, `R`), Web Audio chime feedback.
   - Teaching mode with "What to draw", "How to draw", "Why needed", and "What to check".

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Development
```bash
# Clone the repository
git clone <your-repo-url>
cd kerala-eg-studio

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Run Unit Tests
```bash
npx vitest run
```
All 18 comprehensive geometry solver verification tests will run and validate trigonometric constraints, point coordinates, and BIS conventions.

### Production Build
```bash
npm run build
```

---

## 🛠️ Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **State Management:** Zustand with LocalStorage persistence
- **CAD & Export:** jspdf, html2canvas, custom DXF generator
- **Testing:** Vitest

---

## 📜 License
MIT License. Built for engineering students and educators.
