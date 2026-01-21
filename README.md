🎬 Netflix-Inspired Frontend

A premium, high-performance streaming interface clone built with modern web standards. This project focuses on professional UI/UX design, fluid animations, and a mobile-first responsive architecture using Tailwind CSS and Vanilla JavaScript.

View Demo • Report Bug • Request Feature

✨ Key Features

Premium Netflix Aesthetic: signature dark theme with high-contrast red branding and glassmorphism effects.

Interactive Row Sliders: Smooth horizontal scrolling with hover-to-expand card animations.

Dynamic Detail Modals: Rich content previews featuring "Play," "My List," and rating interactions.

Mobile-First Responsive Design: Optimized for everything from ultra-wide monitors to mobile handhelds.

Performance Optimized:

Lazy-loading for off-screen movie posters.

Zero dependency framework overhead—compiled for speed.

Full Accessibility: Semantic HTML5 markup and ARIA labels for screen-reader compatibility.

📂 Project Structure

netflix-frontend/
├── index.html           # Main entry point (Semantic SEO optimized)
├── css/
│   └── styles.css       # Tailwind directives & custom Netflix animations
├── js/
│   └── main.js          # Core logic: Intersectional observers & Modal UI
├── data/
│   └── content.json     # Mock database for movies and TV shows
├── assets/
│   ├── images/          # High-res posters and backdrops
│   └── icons/           # Optimized SVG icons
└── README.md            # Project documentation


🚀 Getting Started

Prerequisites

A modern web browser (Chrome, Safari, Edge, or Firefox).

A local server environment (recommended for JSON fetching).

Installation

Clone the repository:

git clone [https://github.com/guruvardhan-tech-village/netflix-frontend.git](https://github.com/guruvardhan-tech-village/netflix-frontend.git)
cd netflix-frontend


Launch via Local Server:

Using VS Code: Right-click index.html and select "Open with Live Server".

Using Python: python -m http.server 8000

Using Node: npx http-server

🛠 Technical Stack

Category

Technology

Core

HTML5, CSS3 (Flexbox/Grid), ES6+ JavaScript

Styling

Tailwind CSS

Icons

Custom SVGs / Lucide Icons

Data Handling

Fetch API & JSON Serialization

🎨 Customization

Theming & Variables

Modify the core branding in your CSS variables found in css/styles.css:

:root {
  --netflix-red: #E50914;
  --netflix-dark: #141414;
  --card-transition: all 450ms cubic-bezier(0.4, 0, 0.2, 1);
}


Content Updates

To add your own titles, simply update the data/content.json file. The frontend logic will dynamically generate the UI rows based on your JSON structure.

📜 License

Distributed under the MIT License.

Copyright (c) 2026 Guru Vardhan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


🤝 Contact

Guru Vardhan - GitHub Profile

Disclaimer: This project is for educational purposes only. Netflix is a registered trademark of Netflix, Inc.
