# 2048 Clone (Vanilla JS)

A portfolio-ready clone of the classic **2048** game built with plain **HTML, CSS, and JavaScript**.

This project includes:
- 4x4 board rendering and tile updates
- Arrow-key and swipe controls
- Tile merge rules and score tracking
- Random tile spawning (2/4)
- Best score persistence with `localStorage`
- Game-over detection and restart flow

## Project Structure

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/2048_Game.git
cd 2048_Game
```

2. Run locally (any one option):

```bash
# Option A: open directly
open index.html

# Option B: serve with a local static server
python3 -m http.server 5500
# then visit http://localhost:5500
```

## Usage

- Use `Arrow Up`, `Arrow Down`, `Arrow Left`, `Arrow Right` to move tiles.
- On mobile, swipe in any direction.
- Merge matching values to increase your score.
- Click `New Game` or `Play Again` to restart.

## Screenshots / Demo

Add your own captures before publishing:

```md
![Gameplay Screenshot](./assets/screenshot-1.png)
![Demo GIF](./assets/demo.gif)
```

Suggested assets folder:

```text
assets/
├── screenshot-1.png
└── demo.gif
```

## Tech Stack / Why I Built This

### Tech Stack
- HTML5 (semantic structure)
- CSS3 (responsive layout, modern styling, tile animations)
- Vanilla JavaScript (game logic + DOM rendering)

### Why I Built This
I built this project to demonstrate strong fundamentals in front-end development without frameworks:
- translating product behavior into data structures and algorithms
- writing maintainable, testable JavaScript logic
- designing clean UI and interaction states for desktop and mobile

## Testing Notes

Phase-wise checks performed:
- file structure and resource link validation
- JavaScript syntax validation (`node --check js/script.js`)
- core logic assertions for merging, spawning, movement, and game-over detection

## License

This project is available under the [MIT License](./LICENSE).
