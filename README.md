![](logo.png)
this is a [(mostly)](https://github.com/sogful/gddemo/tree/main/src/game/DependencySlop.js) complete deobfuscation of the demo from [geometrydash.com](https://geometrydash.com). the code is split up into multiple js files and all other assets are organized.

### running

- clone the repository:
   ```
   git clone https://github.com/sogful/gddemo.git
   cd geometry-dash-web
   ```
- install dependencies:
   ```
   npm install
   ```
- build the project:
   ```
   npm run build
   ```
- run it in your browser:
   ```
   npx serve .
   ```
   (or ``python -m http.server`` / ``npx http-server``)

## key code segments

- `src/game/GameBootstrap.js` - phaser config and bootstrap
- `src/game/BootScene.js` - asset loading and initial setup
- `src/game/GameScene.js` - main game logic

- `src/Globals.js` - game config
- `src/game/Buttons.js` - button actions/links config
