# Developer Prompt: Electron & React Evidence Board

**Role:** You are a Senior Full-Stack Developer specializing in Electron, React, and Canvas-based interactive applications.

**Project Overview:** Build a desktop "Evidence Board" application. The app allows users to create visual connections between different types of data (images, text, people, locations) on an infinite-style canvas.

### 1. Core Architecture & Navigation

- **Tech Stack:** Electron (Main process), React (Renderer)
- **Launch Flow:** \* **Startup Screen:** A simple splash screen with two main buttons: "Open Board" and "Create New Board."
- **Transition:** Upon "Create New," the launcher window closes, and the main Workspace Window opens.

- **The Canvas:** \* A large, pannable workspace.
- **Zoom Control:** A persistent slider in the bottom-right corner to control canvas scale.
- **Right-Click Menu:** Context menu on the canvas to "Add Object" (Image, Text, Person, Location).

### 2. Evidence Objects (Nodes)

Each object must be draggable and include four connection points (dots) on each corner for drawing lines.

1. **Image:** Displays a thumbnail. Clicking opens a full-screen lightbox view with zoom capabilities.
2. **Text Box:** A bordered box for short notes. Clicking opens a modal for easy text selection and copying.
3. **Person (Complex Object):** \* **Card View:** Shows Profile Photo, Name, Age, and Job Title.

- **Detail View (On Click):** A modal showing Name, Age, Marital Status, Gender, Blood Type, Job Title, Height, Weight, and a "Notes" section.

4. **Location:** Displays a text address and a clickable URL link to Google Maps.

### 3. Interaction & Logic

- **Linking:** Users can click and drag from any corner dot to another object's dot to create a connecting line.
- **CRUD Operations:** Right-clicking any object allows the user to "Edit" (open data entry modal) or "Delete."
- **Persistence:**
- **Save:** Implement a "File > Save" menu. The board state (object positions, data, and uploaded images) must be bundled and saved as a **.zip** file.
- **Load:** The app must be able to parse the .zip file to reconstruct the board.

### 4. Design & Aesthetics

- **Theme:** Strict "Cursor-style" minimalist dark mode.
- **UI Colors:** Deep grays (#0B0B0B, #1E1E1E), subtle borders, and high-contrast text.
- **Style:** Clean lines, low border-radius, and professional typography.
