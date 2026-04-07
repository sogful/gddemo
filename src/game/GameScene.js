class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene"
    });
  }
  preload() {
    if (typeof window !== "undefined") {
    }
    if (this.cache.audio.exists("stereo_madness")) {
      this.cache.audio.remove("stereo_madness");
    }
    this.load.audio("stereo_madness", "assets/audio/StereoMadness.mp3");
  }
  create() {
    setSceneRenderZoom(this);
    this._bgSpeedX = 0.1;
    this._bgSpeedY = 0.1;
    this._menuCameraX = -viewportHalfMinus150;
    this._prevCameraX = -viewportHalfMinus150;
    this._bg = this.add.tileSprite(0, 0, gameWidth, gameHeight, "game_bg_01").setOrigin(0, 0).setScrollFactor(0).setDepth(-10);
    const bgTextureHeight = this.textures.get("game_bg_01").source[0].height;
    this._bgInitY = bgTextureHeight - gameHeight - bgParallaxDrop;
    this._cameraX = -viewportHalfMinus150;
    this._cameraY = 0;
    this._cameraXRef = {
      get value() {
        return this._v;
      },
      _v: -viewportHalfMinus150
    };
    this._state = new PlayerPhysicsState();
    this._rawinbow = new TasteTheRainbow();
    this._platformer = new PlatformerTest(this._state);
    this._platformer.reset();
    this._level = new GameLevel(this, this._cameraXRef);
    this._player = new Player(this, this._state, this._level, this._platformer);
    this._noclip = new Noclip(this._state);
    this._noclip.bindPlayer(this._player);
    this._colorManager = new ColorManager();
    this._audio = new AudioManager(this);
    let levelText = this.cache.text.get("level_1");
    if (levelText) {
      this._level.loadLevel(levelText);
    }
    this._level.createEndPortal(this);
    this._glitterCenterX = 0;
    this._glitterCenterY = groundBaselineY;
    this._glitterEmitter = this.add.particles(0, 0, "GJ_WebSheet", {
      frame: "square.png",
      speed: 0,
      scale: {
        start: 0.375,
        end: 0
      },
      alpha: {
        start: 1,
        end: 0
      },
      lifespan: {
        min: 200,
        max: 1800
      },
      frequency: 60,
      blendMode: blendAdditive,
      tint: tintLimeGreen,
      emitting: false,
      emitCallback: particle => {
        particle.x = this._glitterCenterX + (Math.random() * 2 - 1) * (gameWidth / 1.8);
        particle.y = this._glitterCenterY + (Math.random() * 2 - 1) * 320;
      }
    });
    this._level.additiveContainer.add(this._glitterEmitter);
    this._bg.setTint(this._colorManager.getHex(COLOR_ID_BACKGROUND));
    this._level.setGroundColor(this._colorManager.getHex(COLOR_ID_GROUND));
    this._level.additiveContainer.setVisible(false);
    this._level.container.setVisible(false);
    this._level.topContainer.setVisible(false);
    this._attempts = 1;
    this._pauseLevelTitle = "Stereo Madness";
    this._pauseTitleText = null;
    this._bestPercent = 0;
    this._lastPercent = 0;
    this._endPortalGameY = 240;
    this._resetGameplayState();
    this._totalJumps = 0;
    this._playTime = 0;
    this._menuActive = true;
    this._slideIn = false;
    this._slideGroundX = null;
    this._firstPlay = true;
    this._player.setCubeVisible(false);
    this._player.setShipVisible(false);
    this._logo = this.add.image(0, 100, "GJ_WebSheet", "GJ_logo_001.png").setScrollFactor(0).setDepth(30);
    this._robLogo = this.add.image(160, 555, "GJ_WebSheet", "RobTopLogoBig_001.png").setScrollFactor(0).setDepth(30).setScale(0.9);
    this._copyrightText = this.add.text(0, 625, "© 2026 RobTop Games · geometrydash.com", {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "Arial"
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(30).setAlpha(0.3);
    this._tryMeImg = this.add.image(0, 182.5, "GJ_WebSheet", "tryMe_001.png").setScrollFactor(0).setDepth(30);
    this._downloadBtns = [];
    for (let i = 0; i < MenuLinks.length; i++) {
      const store = MenuLinks[i];
      const btnScale = 1 / 1.5;
      const img = this.add.image(0, 0, "GJ_WebSheet", store.key + ".png").setScrollFactor(0).setDepth(30).setScale(btnScale).setInteractive();
      this._makeBouncyButton(img, btnScale, () => window.open(store.url, "_blank"), () => this._menuActive);
      this._downloadBtns.push(img);
    }
    const fullscreenOn = this.scale.isFullscreen;
    this._menuFsBtn = this.add.image(33, 33, "GJ_WebSheet", fullscreenOn ? "toggleFullscreenOff_001.png" : "toggleFullscreenOn_001.png").setScrollFactor(0).setDepth(30).setScale(0.64).setAlpha(0.8).setTint(Phaser.Display.Color.GetColor(0, Math.round(102), 255)).setInteractive();
    this._expandHitArea(this._menuFsBtn, 1.5);
    this._makeBouncyButton(this._menuFsBtn, 0.64, () => {
      const willBeFullscreen = !this.scale.isFullscreen;
      this._menuFsBtn.setTexture("GJ_WebSheet", willBeFullscreen ? "toggleFullscreenOff_001.png" : "toggleFullscreenOn_001.png");
      this._expandHitArea(this._menuFsBtn, 1.5);
      this._toggleFullscreen();
    }, () => this._menuActive);
    this._menuInfoBtn = this.add.image(gameWidth - 30 - 3, 33, "GJ_WebSheet", "GJ_infoIcon_001.png").setScrollFactor(0).setDepth(30).setScale(0.64).setAlpha(0.8).setTint(Phaser.Display.Color.GetColor(0, Math.round(102), 255)).setInteractive();
    this._expandHitArea(this._menuInfoBtn, 1.5);
    this._makeBouncyButton(this._menuInfoBtn, 0.64, () => {
      this._buildInfoPopup();
    }, () => this._menuActive && !this._infoPopup);
    this._menuGlitter = this.add.particles(0, 0, "GJ_WebSheet", {
      frame: "square.png",
      speed: 0,
      scale: {
        start: 0.5,
        end: 0
      },
      alpha: {
        start: 0.6,
        end: 0.2
      },
      lifespan: {
        min: 1000,
        max: 2000
      },
      frequency: 35,
      blendMode: blendAdditive,
      tint: 20670,
      x: {
        min: -130,
        max: 130
      },
      y: {
        min: -100,
        max: 100
      }
    }).setScrollFactor(0).setDepth(29);
    this._playBtn = this.add.image(0, 0, "GJ_WebSheet", "GJ_playBtn_001.png").setScrollFactor(0).setDepth(30).setInteractive();
    this._playBtnPressed = false;
    this._makeBouncyButton(this._playBtn, 1, () => {
      this._audio.playEffect("playSound_01", {
        volume: 1
      });
      this._startGame();
    }, () => this._menuActive && !this._playBtnPressed);
    this._positionMenuItems();
    this._spaceWasDown = false;
    this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this._upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this._leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this._rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this._aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this._dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this._pauseBtn = this.add.image(gameWidth - 30, 30, "GJ_WebSheet", "GJ_pauseBtn_clean_001.png").setScrollFactor(0).setDepth(30).setAlpha(75 / 255).setVisible(false);
    this._pauseBtn.setInteractive();
    this._expandHitArea(this._pauseBtn, 2);
    this._pauseBtn.on("pointerdown", () => this._pauseGame());
    this._rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this._rKey.on("down", () => {
      if (this._menuActive || this._slideIn || this._paused || this._levelWon) {
        return;
      }
      if (this._state.isDead) {
        this._player.clearExplosionDebrisOnly();
        if (this._hadNewBest) {
          return;
        }
        this._restartLevel();
        return;
      }
      this._restartLevel();
    });
    this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this._escKey.on("down", () => {
      if (this._paused) {
        this._resumeGame();
      } else if (!this._menuActive && !this._slideIn && !this._state.isDead && !this._levelWon) {
        this._pauseGame();
      }
    });
    this._paused = false;
    this._pauseContainer = null;
    this._sfxVolume = this.game.registry.get("userSfxVol") ?? 1;
    this.input.on("pointerdown", () => {
      if (!this._menuActive && !this._paused) {
        this._pushButton();
      }
    });
    this.input.on("pointerup", () => {
      if (!this._menuActive && !this._paused) {
        this._releaseButton();
      }
    });
    window.addEventListener("pointerup", () => this._releaseButton());
    window.addEventListener("touchend", () => this._releaseButton());
    this.scale.on("enterfullscreen", () => this._onFullscreenChange(true));
    this.scale.on("leavefullscreen", () => this._onFullscreenChange(false));
    this._buildHUD();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this._audio.pauseMusic();
      } else if (!this._menuActive && !this._paused && !this._state.isDead && !this._levelWon) {
        this._audio.resumeMusic();
      }
    });
    window.addEventListener("orientationchange", () => {
      this.time.delayedCall(100, () => this.scale.refresh());
    });
    window.addEventListener("resize", () => {
      this.scale.refresh();
    });
    if (this.game.registry.get(GDRegistry.PauseReturnFadeIn)) {
      this.game.registry.remove(GDRegistry.PauseReturnFadeIn);
      this.cameras.main.fadeIn(SceneFadeMs.PauseMenuIn, 0, 0, 0);
    } else if (this.game.registry.get(GDRegistry.FadeInFromBlack)) {
      this.game.registry.remove(GDRegistry.FadeInFromBlack);
      this.cameras.main.fadeIn(SceneFadeMs.EndMenuIn, 0, 0, 0);
    }
    this.game.events.emit("gd:gamescene-ready");
  }
  _pauseRowButtonAction(kind) {
    switch (kind) {
      case PauseKind.REPLAY:
        return () => {
          this._resumeGame();
          this._restartLevel();
        };
      case PauseKind.RESUME:
        return () => this._resumeGame();
      case PauseKind.MENU:
        return () => {
          this._audio.playEffect("quitSound_01");
          this._audio.stopMusic();
          this.game.registry.set(GDRegistry.PauseReturnFadeIn, true);
          this.cameras.main.fadeOut(SceneFadeMs.PauseMenuOut, 0, 0, 0, (_cam, progress) => {
            if (progress >= 1) {
              this.scene.restart();
            }
          });
        };
      default:
        return () => {};
    }
  }
  _endScreenButtonAction(kind) {
    switch (kind) {
      case EndKind.REPLAY:
        return () => this._hideEndLayer(() => this._restartLevel());
      case EndKind.MENU:
        return () => {
          this._audio.playEffect("quitSound_01");
          this._audio.stopMusic();
          this.game.registry.set(GDRegistry.FadeInFromBlack, true);
          this.cameras.main.fadeOut(SceneFadeMs.EndMenuOut, 0, 0, 0, (_camera, progress) => {
            if (progress >= 1) {
              this.scene.restart();
            }
          });
        };
      default:
        return () => {};
    }
  }
  _buildHUD() {
    this._attemptsLabel = this.add.bitmapText(0, 0, "bigFont", "Attempt 1", 65).setOrigin(0.5, 0.5).setVisible(false);
    this._level.topContainer.add(this._attemptsLabel);
    this._positionAttemptsLabel();
    this._fpsText = this.add.text(gameWidth - 20, 10, "", {
      fontSize: "28px",
      fill: "#ff0000",
      fontFamily: "Arial"
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(999).setVisible(false);
    this._fpsAccum = 0;
    this._fpsFrames = 0;
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H).on("down", () => {
      this._fpsText.setVisible(!this._fpsText.visible);
    });
  }
  toggleGlitter(enabled) {
    const g = this._glitterEmitter;
    if (!g || !g.scene) {
      return;
    }
    if (enabled) {
      g.start();
    } else {
      g.stop();
    }
  }
  _setParticleTimeScale(timeScale) {
    const visitEmitters = obj => {
      if (obj && obj.type === "ParticleEmitter") {
        obj.timeScale = timeScale;
      }
      if (obj && obj.list) {
        obj.list.forEach(visitEmitters);
      }
    };
    visitEmitters(this._level.container);
    visitEmitters(this._level.topContainer);
    if (this._glitterEmitter && this._glitterEmitter.scene) {
      this._glitterEmitter.timeScale = timeScale;
    }
  }
  _pauseGame() {
    if (!this._paused && !this._menuActive && !this._slideIn && !this._state.isDead && !this._levelWon) {
      this._paused = true;
      this._pauseBtn.setVisible(false);
      this._audio.pauseMusic();
      this._setParticleTimeScale(0);
      this._buildPauseOverlay();
    }
  }
  _resumeGame() {
    if (this._paused) {
      this._setParticleTimeScale(1);
      this._paused = false;
      this._pauseBtn.setVisible(true).setAlpha(75 / 255);
      this._audio.resumeMusic();
      if (this._pauseContainer) {
        this._pauseContainer.destroy();
        this._pauseContainer = null;
        this._pauseTitleText = null;
      }
    }
  }
  _buildPauseOverlay() {
    const screenCenterX = gameWidth / 2;
    const pauseCenterY = 320;
    const panelWidth = gameWidth - 40;
    this._pauseContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    const dimBackdrop = this.add.rectangle(screenCenterX, pauseCenterY, gameWidth, gameHeight, 0, 75 / 255);
    dimBackdrop.setInteractive();
    this._pauseContainer.add(dimBackdrop);
    const pauseSlice = this.textures.get("square04_001").source[0].width * 0.325;
    const pausePanel = this._drawScale9(screenCenterX, pauseCenterY, panelWidth, 600, "square04_001", pauseSlice, 0, 150 / 255);
    this._pauseContainer.add(pausePanel);
    const fullscreenActive = this.scale.isFullscreen;
    const pauseFsBtn = this.add.image(screenCenterX - panelWidth / 2 + 40, 60, "GJ_WebSheet", fullscreenActive ? "toggleFullscreenOff_001.png" : "toggleFullscreenOn_001.png").setScale(0.64).setInteractive();
    this._expandHitArea(pauseFsBtn, 2.5);
    this._pauseContainer.add(pauseFsBtn);
    this._makeBouncyButton(pauseFsBtn, 0.64, () => {
      const willBeFullscreen = !this.scale.isFullscreen;
      pauseFsBtn.setTexture("GJ_WebSheet", willBeFullscreen ? "toggleFullscreenOff_001.png" : "toggleFullscreenOn_001.png");
      this._expandHitArea(pauseFsBtn, 2.5);
      this._toggleFullscreen();
    });
    this._pauseTitleText = this.add.bitmapText(screenCenterX, 65, "bigFont", this._pauseLevelTitle, 40).setOrigin(0.5, 0.5);
    this._pauseContainer.add(this._pauseTitleText);
    const progressRowY = 170;
    const bestPct = this._bestPercent || 0;
    const progressBarBg = this.add.image(screenCenterX, progressRowY, "GJ_WebSheet", "GJ_progressBar_001.png").setTint(0).setAlpha(125 / 255);
    this._pauseContainer.add(progressBarBg);
    const barFrame = this.textures.getFrame("GJ_WebSheet", "GJ_progressBar_001.png");
    const barFullW = barFrame ? barFrame.width : 680;
    const barFullH = barFrame ? barFrame.height : 40;
    const fillW = Math.max(1, Math.floor(barFullW * (bestPct / 100)));
    const progressBarFill = this.add.image(0, 0, "GJ_WebSheet", "GJ_progressBar_001.png").setTint(65280).setScale(0.992, 0.86).setOrigin(0, 0.5).setCrop(0, 0, fillW, barFullH);
    progressBarFill.setPosition(screenCenterX - barFullW * 0.992 / 2, progressRowY);
    this._pauseContainer.add(progressBarFill);
    this._pauseContainer.add(this.add.bitmapText(screenCenterX, progressRowY, "bigFont", bestPct + "%", 30).setOrigin(0.5, 0.5).setScale(0.7));
    this._pauseContainer.add(this.add.bitmapText(screenCenterX, 130, "bigFont", "Normal Mode", 30).setOrigin(0.5, 0.5).setScale(0.78));
    const pauseBtnWidths = PauseButtons.map(btn => {
      const fr = this.textures.getFrame("GJ_WebSheet", btn.frame);
      return fr ? fr.width : 246;
    });
    let rowLeft = screenCenterX - (pauseBtnWidths.reduce((sum, w) => sum + w, 0) + (PauseButtons.length - 1) * 40) / 2;
    for (let i = 0; i < PauseButtons.length; i++) {
      const spec = PauseButtons[i];
      const w = pauseBtnWidths[i];
      const img = this.add.image(rowLeft + w / 2, 330, "GJ_WebSheet", spec.frame).setInteractive();
      this._pauseContainer.add(img);
      this._makeBouncyButton(img, 1, this._pauseRowButtonAction(spec.kind));
      rowLeft += w + 40;
    }
    const sliderRowY = 500;
    const sliderScale = 0.7;
    const grooveFrame = this.textures.getFrame("GJ_WebSheet", "slidergroove.png");
    const grooveWidth = grooveFrame ? grooveFrame.width : 420;
    const addVolumeSlider = (centerX, iconFrame, volume, onVolumeChange) => {
      this._pauseContainer.add(this.add.image(centerX - 180 - 5, sliderRowY, "GJ_WebSheet", iconFrame).setScale(1.2));
      const trackW = (grooveWidth - 8) * sliderScale;
      const trackLeft = centerX - grooveWidth * sliderScale / 2 + 2.8;
      const fillW0 = volume * trackW;
      const fillSprite = this.add.tileSprite(trackLeft, sliderRowY, fillW0 > 0 ? fillW0 : 1, 11.2, "sliderBar").setOrigin(0, 0.5).setVisible(fillW0 > 0);
      this._pauseContainer.add(fillSprite);
      const grooveImg = this.add.image(centerX, sliderRowY, "GJ_WebSheet", "slidergroove.png").setScale(sliderScale);
      this._pauseContainer.add(grooveImg);
      const thumbX = trackLeft + volume * trackW;
      const thumb = this.add.image(thumbX, sliderRowY, "GJ_WebSheet", "sliderthumb.png").setScale(sliderScale).setInteractive({
        draggable: true,
        useHandCursor: true
      });
      this._pauseContainer.add(thumb);
      thumb.on("pointerdown", () => thumb.setTexture("GJ_WebSheet", "sliderthumbsel.png"));
      thumb.on("pointerup", () => thumb.setTexture("GJ_WebSheet", "sliderthumb.png"));
      thumb.on("pointerout", () => thumb.setTexture("GJ_WebSheet", "sliderthumb.png"));
      thumb.on("drag", (_pointer, dragX) => {
        thumb.x = Math.max(trackLeft, Math.min(trackLeft + trackW, dragX));
        const ratio = (thumb.x - trackLeft) / trackW;
        const clamped = ratio < 0.03 ? 0 : ratio;
        fillSprite.width = Math.max(1, clamped * trackW);
        fillSprite.setVisible(clamped > 0);
        onVolumeChange(clamped);
      });
    };
    addVolumeSlider(screenCenterX - 200, "gj_songIcon_001.png", this._audio.getUserMusicVolume(), vol => this._audio.setUserMusicVolume(vol));
    addVolumeSlider(screenCenterX + 200, "GJ_sfxIcon_001.png", this._sfxVolume, vol => {
      this._sfxVolume = vol;
      this.game.registry.set("userSfxVol", vol);
    });
  }
  _buildInfoPopup() {
    if (this._infoPopup) {
      return;
    }
    const centerX = gameWidth / 2;
    const centerY = 320;
    const panelH = 336;
    this._infoPopup = this.add.container(0, 0).setScrollFactor(0).setDepth(200);
    const backdrop = this.add.rectangle(centerX, centerY, gameWidth, gameHeight, 0, 100 / 255);
    backdrop.setInteractive();
    this._infoPopup.add(backdrop);
    const infoSlice = this.textures.get("GJ_square02").source[0].width * 0.325;
    const infoPanel = this._drawScale9(centerX, centerY, 480, panelH, "GJ_square02", infoSlice, 16777215, 1);
    this._infoPopup.add(infoPanel);
    const closeBtn = this.add.image(centerX - 240 + 20, 172, "GJ_WebSheet", "GJ_closeBtn_001.png").setScale(0.8).setInteractive();
    this._infoPopup.add(closeBtn);
    this._expandHitArea(closeBtn, 2);
    this._makeBouncyButton(closeBtn, 0.8, () => this._closeInfoPopup());
    let lineY = 206;
    const creditsTitle = this.add.bitmapText(centerX, lineY, "bigFont", "Credits", 40).setOrigin(0.5, 0.5);
    this._infoPopup.add(creditsTitle);
    lineY += 70;
    const creditLine1 = this.add.bitmapText(centerX, lineY, "goldFont", "Made by RobTop Games", 40).setOrigin(0.5, 0.5).setScale(0.6);
    this._infoPopup.add(creditLine1);
    lineY += 60;
    const creditLine2 = this.add.bitmapText(centerX, lineY, "goldFont", "Song: Stereo Madness", 40).setOrigin(0.5, 0.5).setScale(0.6);
    this._infoPopup.add(creditLine2);
    lineY += 30;
    const artistLine = this.add.bitmapText(centerX - 20, lineY, "goldFont", "by ForeverBound", 40).setOrigin(0.5, 0.5).setScale(0.6);
    this._infoPopup.add(artistLine);
    const ytIconX = centerX - 10 + artistLine.width * 0.6 / 2;
    const ytBtn = this.add.image(ytIconX + 20 + 50 - 10, lineY + 2, "GJ_WebSheet", "gj_ytIcon_001.png").setScale(0.5).setInteractive();
    this._infoPopup.add(ytBtn);
    this._expandHitArea(ytBtn, 2);
    this._makeBouncyButton(ytBtn, 0.5, () => {
      window.open(CreditsLink, "_blank");
    });
    const legal1 = this.add.text(centerX, 446, "© 2026 RobTop Games. All rights reserved.", {
      fontSize: "12px",
      color: "#000000",
      fontFamily: "Arial"
    }).setOrigin(0.5, 0.5).setAlpha(0.7).setResolution(2);
    this._infoPopup.add(legal1);
    const legal2 = this.add.text(centerX, 463, "There was also some other text but it isn't really important.", {
      fontSize: "12px",
      color: "#000000",
      fontFamily: "Arial"
    }).setOrigin(0.5, 0.5).setAlpha(0.7).setResolution(2);
    this._infoPopup.add(legal2);
  }
  _closeInfoPopup() {
    if (this._infoPopup) {
      this._infoPopup.destroy();
      this._infoPopup = null;
    }
  }
  _expandHitArea(gameObject, paddingFactor) {
    const w = gameObject.width;
    const h = gameObject.height;
    const padX = w * (paddingFactor - 1) / 2;
    const padY = h * (paddingFactor - 1) / 2;
    gameObject.input.hitArea.setTo(-padX, -padY, w + padX * 2, h + padY * 2);
  }
  _makeBouncyButton(gameObject, baseScale, onClick, canInteract) {
    const bounceScale = baseScale * 1.26;
    gameObject.on("pointerdown", () => {
      if (!canInteract || !!canInteract()) {
        gameObject._pressed = true;
        this.tweens.killTweensOf(gameObject, "scale");
        this.tweens.add({
          targets: gameObject,
          scale: bounceScale,
          duration: 300,
          ease: "Bounce.Out"
        });
      }
    });
    gameObject.on("pointerout", () => {
      if (gameObject._pressed) {
        gameObject._pressed = false;
        this.tweens.killTweensOf(gameObject, "scale");
        this.tweens.add({
          targets: gameObject,
          scale: baseScale,
          duration: 400,
          ease: "Bounce.Out"
        });
      }
    });
    gameObject.on("pointerup", () => {
      if (gameObject._pressed) {
        gameObject._pressed = false;
        this.tweens.killTweensOf(gameObject, "scale");
        gameObject.setScale(baseScale);
        onClick();
      }
    });
    return gameObject;
  }
  _toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
      try {
        screen.orientation.lock("landscape").catch(() => {});
      } catch (e18) {}
    }
  }
  _drawScale9(centerX, centerY, panelWidth, panelHeight, textureKey, sliceSize, tintColor, alpha) {
    const root = this.add.container(centerX, centerY);
    const tex = this.textures.get(textureKey);
    const src = tex.source[0];
    const texW = src.width;
    const texH = src.height;
    const innerWidth = panelWidth - sliceSize * 2;
    const innerHeight = panelHeight - sliceSize * 2;
    const nineSlices = [{
      sx: 0,
      sy: 0,
      sw: sliceSize,
      sh: sliceSize,
      dx: -panelWidth / 2,
      dy: -panelHeight / 2,
      dw: sliceSize,
      dh: sliceSize
    }, {
      sx: sliceSize,
      sy: 0,
      sw: texW - sliceSize * 2,
      sh: sliceSize,
      dx: -panelWidth / 2 + sliceSize,
      dy: -panelHeight / 2,
      dw: innerWidth,
      dh: sliceSize
    }, {
      sx: texW - sliceSize,
      sy: 0,
      sw: sliceSize,
      sh: sliceSize,
      dx: panelWidth / 2 - sliceSize,
      dy: -panelHeight / 2,
      dw: sliceSize,
      dh: sliceSize
    }, {
      sx: 0,
      sy: sliceSize,
      sw: sliceSize,
      sh: texH - sliceSize * 2,
      dx: -panelWidth / 2,
      dy: -panelHeight / 2 + sliceSize,
      dw: sliceSize,
      dh: innerHeight
    }, {
      sx: sliceSize,
      sy: sliceSize,
      sw: texW - sliceSize * 2,
      sh: texH - sliceSize * 2,
      dx: -panelWidth / 2 + sliceSize,
      dy: -panelHeight / 2 + sliceSize,
      dw: innerWidth,
      dh: innerHeight
    }, {
      sx: texW - sliceSize,
      sy: sliceSize,
      sw: sliceSize,
      sh: texH - sliceSize * 2,
      dx: panelWidth / 2 - sliceSize,
      dy: -panelHeight / 2 + sliceSize,
      dw: sliceSize,
      dh: innerHeight
    }, {
      sx: 0,
      sy: texH - sliceSize,
      sw: sliceSize,
      sh: sliceSize,
      dx: -panelWidth / 2,
      dy: panelHeight / 2 - sliceSize,
      dw: sliceSize,
      dh: sliceSize
    }, {
      sx: sliceSize,
      sy: texH - sliceSize,
      sw: texW - sliceSize * 2,
      sh: sliceSize,
      dx: -panelWidth / 2 + sliceSize,
      dy: panelHeight / 2 - sliceSize,
      dw: innerWidth,
      dh: sliceSize
    }, {
      sx: texW - sliceSize,
      sy: texH - sliceSize,
      sw: sliceSize,
      sh: sliceSize,
      dx: panelWidth / 2 - sliceSize,
      dy: panelHeight / 2 - sliceSize,
      dw: sliceSize,
      dh: sliceSize
    }];
    for (let i = 0; i < nineSlices.length; i++) {
      const slice = nineSlices[i];
      const frameKey = "_s9_" + i;
      if (!tex.has(frameKey)) {
        tex.add(frameKey, 0, slice.sx, slice.sy, slice.sw, slice.sh);
      }
      const piece = this.add.image(slice.dx, slice.dy, textureKey, frameKey).setOrigin(0, 0).setDisplaySize(slice.dw, slice.dh);
      if (tintColor !== undefined) {
        piece.setTint(tintColor);
      }
      if (alpha !== undefined) {
        piece.setAlpha(alpha);
      }
      root.add(piece);
    }
    return root;
  }

  /*/////////////////////// drag div insert ///////////////////////////////////*/
  _consumePendingLevelB64() {
    if (typeof window === "undefined") {
      return null;
    }
    const pending = window.__customlevel;
    if (pending) {
      window.__customlevel = null;
      window.__gdAppliedLevelB64 = pending;
      return pending;
    }
    return window.__gdAppliedLevelB64 || null;
  }
  _consumePendingMusicObjectUrl() {
    if (typeof window === "undefined") {
      return null;
    }
    const pending = window.__custommusic;
    if (pending) {
      window.__custommusic = null;
      return pending;
    }
    return window.__gdAppliedMusicObjectUrl || null;
  }
  _applyPendingLevelReload() {
    const b64 = this._consumePendingLevelB64();
    if (!b64) {
      return;
    }
    this._player.detachOwnedFromLevelContainer();
    const ac = this._level.additiveContainer;
    let hadGlitter = false;
    if (this._glitterEmitter && this._glitterEmitter.parentContainer === ac) {
      ac.remove(this._glitterEmitter, false);
      hadGlitter = true;
    }
    try {
      this._level.reloadLevelFromData(b64, this._attemptsLabel);
      this._pauseLevelTitle = "Custom Level";
      if (this._pauseTitleText && this._pauseTitleText.scene) {
        this._pauseTitleText.setText("Custom Level");
      }
    } finally {
      this._player.reattachOwnedToLevelContainer();
      if (hadGlitter && this._glitterEmitter && this._glitterEmitter.scene) {
        ac.add(this._glitterEmitter);
      }
    }
  }
  _startLevelMusicWithOptionalPendingMp3() {
    const url = this._consumePendingMusicObjectUrl();
    this._audio.reset();
    if (!url) {
      this._audio.startMusic();
      return;
    }
    if (typeof window !== "undefined" && window.__gdAppliedMusicObjectUrl) {
      URL.revokeObjectURL(window.__gdAppliedMusicObjectUrl);
      window.__gdAppliedMusicObjectUrl = null;
    }
    if (typeof window !== "undefined") {
      window.__gdAppliedMusicObjectUrl = url;
    }
    if (this.cache.audio.exists("stereo_madness")) {
      this.cache.audio.remove("stereo_madness");
    }
    if (this.load.isLoading()) {
      this.load.reset();
    }
    this.load.audio("stereo_madness", [url]);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this._audio.startMusic();
    });
    this.load.start();
  }
  /*/////////////////////// drag div insert ///////////////////////////////////*/
  
  _startGame() {
    if (!this._menuActive) {
      return;
    }
    this._applyPendingLevelReload();
    this._menuActive = false;
    this._slideIn = true;
    if (this._menuGlitter) {
      this._menuGlitter.destroy();
      this._menuGlitter = null;
    }
    if (this._playBtn) {
      this.tweens.killTweensOf(this._playBtn);
      this.tweens.add({
        targets: this._playBtn,
        scale: 0.01,
        duration: 200,
        ease: "Quad.In",
        onComplete: () => {
          this._playBtn.destroy();
          this._playBtn = null;
        }
      });
    }
    if (this._robLogo) {
      this.tweens.add({
        targets: this._robLogo,
        y: gameHeight + this._robLogo.height,
        duration: 300,
        ease: "Quad.In",
        onComplete: () => {
          this._robLogo.destroy();
          this._robLogo = null;
        }
      });
    }
    if (this._copyrightText) {
      this.tweens.add({
        targets: this._copyrightText,
        y: 680,
        duration: 300,
        ease: "Quad.In",
        onComplete: () => {
          this._copyrightText.destroy();
          this._copyrightText = null;
        }
      });
    }
    if (this._menuFsBtn) {
      this.tweens.add({
        targets: this._menuFsBtn,
        y: -this._menuFsBtn.height,
        duration: 300,
        ease: "Quad.In",
        onComplete: () => {
          this._menuFsBtn.destroy();
          this._menuFsBtn = null;
        }
      });
    }
    if (this._menuInfoBtn) {
      this.tweens.add({
        targets: this._menuInfoBtn,
        y: -this._menuInfoBtn.height,
        duration: 300,
        ease: "Quad.In",
        onComplete: () => {
          this._menuInfoBtn.destroy();
          this._menuInfoBtn = null;
        }
      });
    }
    this._closeInfoPopup();
    if (this._tryMeImg) {
      this.tweens.add({
        targets: this._tryMeImg,
        y: -this._tryMeImg.height,
        duration: 300,
        ease: "Quad.In",
        onComplete: () => {
          this._tryMeImg.destroy();
          this._tryMeImg = null;
        }
      });
    }
    if (this._downloadBtns) {
      for (const downloadBtn of this._downloadBtns) {
        this.tweens.killTweensOf(downloadBtn);
        this.tweens.add({
          targets: downloadBtn,
          y: gameHeight + downloadBtn.height,
          duration: 300,
          ease: "Quad.In",
          onComplete: () => downloadBtn.destroy()
        });
      }
      this._downloadBtns = null;
    }
    if (this._logo) {
      this.tweens.add({
        targets: this._logo,
        y: -this._logo.height,
        duration: 300,
        ease: "Quad.In",
        onComplete: () => {
          this._logo.destroy();
          this._logo = null;
        }
      });
    }
    this._cameraX = -viewportHalfMinus150;
    this._cameraY = 0;
    this._cameraXRef._v = this._cameraX;
    this._prevCameraX = this._cameraX;
    const menuCameraShift = this._cameraX - (this._menuCameraX || 0);
    this._level.shiftGroundTiles(menuCameraShift);
    this._playerWorldX = this._cameraX;
    this._state.y = 30;
    this._state.onGround = true;
    this._level.additiveContainer.setVisible(true);
    this._level.container.setVisible(true);
    this._level.topContainer.setVisible(true);
    this._player.setCubeVisible(true);
    this._player.reset();
    this._attemptsLabel.setVisible(this._attempts > 1);
    this._positionAttemptsLabel();
  }
  _pushButton() {
    if (this._menuActive) {
      this._audio.playEffect("playSound_01", {
        volume: 1
      });
      this._startGame();
      return;
    }
    if (!this._slideIn && !this._state.isDead) {
      this._state.upKeyDown = true;
      this._state.upKeyPressed = true;
      if (!this._state.isFlying && this._state.canJump) {
        this._player.updateJump(0);
        this._totalJumps++;
      }
    }
  }
  _releaseButton() {
    this._state.upKeyDown = false;
    this._state.upKeyPressed = false;
  }
  _positionMenuItems() {
    const screenCenterX = gameWidth / 2;
    if (this._logo) {
      this._logo.x = screenCenterX;
    }
    if (this._menuInfoBtn) {
      this._menuInfoBtn.x = gameWidth - 30 - 3;
    }
    if (this._copyrightText) {
      this._copyrightText.x = gameWidth - 20;
    }
    if (this._tryMeImg) {
      this._tryMeImg.x = screenCenterX + 175;
    }
    if (this._menuGlitter) {
      this._menuGlitter.x = screenCenterX;
      this._menuGlitter.y = 320;
    }
    if (this._playBtn) {
      this._playBtn.x = screenCenterX;
      this.tweens.killTweensOf(this._playBtn, "y");
      this._playBtn.y = 320;
      this.tweens.add({
        targets: this._playBtn,
        y: 324,
        duration: 750,
        ease: "Quad.InOut",
        yoyo: true,
        repeat: -1
      });
    }
    if (this._downloadBtns) {
      const rightAnchorX = gameWidth - 130;
      const rowY = 555;
      const colSpacing = 210;
      for (let i = 0; i < this._downloadBtns.length; i++) {
        this._downloadBtns[i].setPosition(rightAnchorX - i * colSpacing, rowY);
      }
    }
  }
  _positionAttemptsLabel() {
    let labelX = this._cameraX + gameWidth / 2;
    if (this._attempts > 1) {
      labelX += 100;
    }
    this._attemptsLabel.setPosition(labelX, 150);
  }
  _resetGameplayState() {
    this._cameraX = -viewportHalfMinus150;
    this._cameraY = 0;
    this._cameraXRef._v = -viewportHalfMinus150;
    this._prevCameraX = -viewportHalfMinus150;
    this._playerWorldX = 0;
    this._state.lastX = this._playerWorldX;
    this._deltaBuffer = 0;
    this._deathTimer = 0;
    this._deathSoundPlayed = false;
    this._newBestShown = false;
    this._hadNewBest = false;
    this._levelWon = false;
    this._endCameraOverride = false;
    this._endCamTween = null;
    this._spaceWasDown = false;
    this._state.leftKeyDown = false;
    this._state.rightKeyDown = false;
  }
  _restartLevel() {
    this._attempts++;
    this._applyPendingLevelReload();
    const cameraXBefore = this._cameraX;
    this._resetGameplayState();
    this._state.reset();
    this._platformer.reset();
    this._player.reset();
    if (this._glitterEmitter && this._glitterEmitter.scene) {
      this._glitterEmitter.stop();
    }
    this._level.resetObjects();
    this._level.shiftGroundTiles(this._cameraX - cameraXBefore);
    this._level.resetGroundState();
    this._level.resetColorTriggers();
    this._level.resetEnterEffectTriggers();
    this._level.resetVisibility();
    this._colorManager.reset();
    this._startLevelMusicWithOptionalPendingMp3();
    this._paused = false;
    if (this._pauseContainer) {
      this._pauseContainer.destroy();
      this._pauseContainer = null;
      this._pauseTitleText = null;
    }
    this._pauseBtn.setVisible(true).setAlpha(75 / 255);
    this._attemptsLabel.setText("Attempt " + this._attempts);
    this._attemptsLabel.setVisible(true);
    this._positionAttemptsLabel();
  }
  _onFullscreenChange(isFullscreen) {
    if (!isFullscreen) {
      setGameWidthFromMinHeight(1138);
    }
    this.time.delayedCall(200, () => this._applyScreenResize());
  }
  _applyScreenResize() {
    if (this.scale.isFullscreen) {
      const windowAspect = window.innerWidth / window.innerHeight;
      setGameWidthFromMinHeight(Math.round(gameHeight * windowAspect));
    }
    this.scale.setGameSize(gameWidth * renderScale, gameHeight * renderScale);
    this.scale.refresh();
    setSceneRenderZoom(this);
    this._bg.setSize(gameWidth, gameHeight);
    this._pauseBtn.x = gameWidth - 30;
    if (this._menuActive) {
      this._positionMenuItems();
    }
    if (this._paused && this._pauseContainer) {
      this._pauseContainer.destroy();
      this._pauseContainer = null;
      this._pauseTitleText = null;
      this._buildPauseOverlay();
    }
    this._level.resizeScreen();
    if (!this._menuActive) {
      const prevCamX = this._cameraX;
      this._cameraX = this._playerWorldX - viewportHalfMinus150;
      this._cameraXRef._v = this._cameraX;
      this._level.additiveContainer.x = -this._cameraX;
      this._level.additiveContainer.y = this._cameraY;
      this._level.container.x = -this._cameraX;
      this._level.container.y = this._cameraY;
      this._level.topContainer.x = -this._cameraX;
      this._level.topContainer.y = this._cameraY;
      this._level.shiftGroundTiles(this._cameraX - prevCamX);
      this._level.updateGroundTiles(this._cameraY);
      this._level.updateVisibility(this._cameraX);
      this._level.applyEnterEffects(this._cameraX);
      const playerScreenX = this._playerWorldX - this._cameraX;
      this._player.syncSprites(this._cameraX, this._cameraY, 0, playerScreenX);
    }
  }
  _updateBackground() {
    this._bg.tilePositionX += (this._cameraX - this._prevCameraX) * this._bgSpeedX;
    this._prevCameraX = this._cameraX;
    this._bg.tilePositionY = this._bgInitY - this._cameraY * this._bgSpeedY;
  }
  _updateCameraY(smoothedStep) {
    let camY = this._cameraY;
    let targetY = camY;
    if (this._level.flyCameraTarget !== null) {
      targetY = this._level.flyCameraTarget;
    } else {
      const playerY = this._state.y;
      const marginAbove = 140;
      const marginBelow = 80;
      const anchorY = camY - bgParallaxDrop + 320;
      if (playerY > anchorY + marginAbove) {
        targetY = playerY - 320 - marginAbove + bgParallaxDrop;
      } else if (playerY < anchorY - marginBelow) {
        targetY = playerY - 320 + marginBelow + bgParallaxDrop;
      }
    }
    if (targetY < 0) {
      targetY = 0;
    }
    if (smoothedStep !== 0) {
      camY += (targetY - camY) / (10 / smoothedStep);
      if (camY < 0) {
        camY = 0;
      }
      this._cameraY = camY;
    }
  }
  _quantizeDelta(rawDeltaMs) {
    let rawSeconds = rawDeltaMs / 1000 + this._deltaBuffer;
    let fixedSteps = Math.round(rawSeconds / physicsFixedDt);
    if (fixedSteps < 0) {
      fixedSteps = 0;
    }
    if (fixedSteps > 60) {
      fixedSteps = 60;
    }
    let quantizedSeconds = fixedSteps * physicsFixedDt;
    this._deltaBuffer = rawSeconds - quantizedSeconds;
    return quantizedSeconds * 60;
  }
  update(_time, delta) {
    this._fpsAccum += delta;
    this._fpsFrames++;
    if (this._fpsAccum >= 250) {
      this._fpsText.setText(Math.round(this._fpsFrames * 1000 / this._fpsAccum));
      this._fpsAccum = 0;
      this._fpsFrames = 0;
    }
    if (this._paused) {
      const pauseResumeHeld = this._spaceKey.isDown || this._upKey.isDown;
      if (pauseResumeHeld && !this._spaceWasDown) {
        this._resumeGame();
      }
      this._spaceWasDown = pauseResumeHeld;
      this._deltaBuffer = 0;
      return;
    }
    if (this._menuActive) {
      if ((this._spaceKey.isDown || this._upKey.isDown) && !this._spaceWasDown) {
        this._spaceWasDown = true;
        this._audio.playEffect("playSound_01", {
          volume: 1
        });
        this._startGame();
        return;
      }
      this._spaceWasDown = this._spaceKey.isDown || this._upKey.isDown;
      const menuScrollDelta = Math.min(delta / 1000 * 60, 2);
      const menuScrollEase = 0.25;
      this._menuCameraX = (this._menuCameraX || 0) + menuScrollDelta * scrollVelocityMul * inputSmoothingMul * menuScrollEase;
      const savedGameplayCamX = this._cameraX;
      this._cameraX = this._menuCameraX;
      this._updateBackground();
      this._cameraX = savedGameplayCamX;
      this._prevCameraX = this._menuCameraX;
      this._cameraXRef._v = this._menuCameraX;
      this._level.stepGroundAnimation(delta / 1000);
      this._level.updateGroundTiles(this._cameraY);
      return;
    }
    if (this._slideIn) {
      const slideStep = this._quantizeDelta(delta);
      this._playerWorldX += slideStep * scrollVelocityMul * inputSmoothingMul;
      const slideEase = 0.25;
      this._slideGroundX = (this._slideGroundX || this._cameraX) + slideStep * scrollVelocityMul * inputSmoothingMul * slideEase;
      this._cameraXRef._v = this._slideGroundX;
      const slidePlayerRelX = this._playerWorldX - this._cameraX;
      this._player.updateGroundRotation(slideStep * inputSmoothingMul);
      this._player.syncSprites(this._cameraX, this._cameraY, delta / 1000, slidePlayerRelX);
      this._level.additiveContainer.x = -this._cameraX;
      this._level.additiveContainer.y = this._cameraY;
      this._level.container.x = -this._cameraX;
      this._level.container.y = this._cameraY;
      this._level.topContainer.x = -this._cameraX;
      this._level.topContainer.y = this._cameraY;
      this._level.updateVisibility(this._cameraX);
      this._updateBackground();
      this._level.stepGroundAnimation(delta / 1000);
      this._level.updateGroundTiles(this._cameraY);
      if (this._playerWorldX >= 0) {
        this._slideIn = false;
        this._deltaBuffer = 0;
        this._playerWorldX = 0;
        this._cameraX = this._playerWorldX - viewportHalfMinus150;
        this._cameraXRef._v = this._cameraX;
        const slideGroundShift = this._cameraX - this._slideGroundX;
        this._level.shiftGroundTiles(slideGroundShift);
        if (this._firstPlay) {
          this._firstPlay = false;
          this._startLevelMusicWithOptionalPendingMp3();
        }
        this._pauseBtn.setVisible(true).setAlpha(0);
        this.tweens.add({
          targets: this._pauseBtn,
          alpha: 75 / 255,
          duration: 500
        });
      }
      return;
    }
    let jumpHeld = this._spaceKey.isDown || this._upKey.isDown;
    const moveLeft = this._leftKey.isDown || this._aKey.isDown;
    const moveRight = this._rightKey.isDown || this._dKey.isDown;
    this._state.leftKeyDown = moveLeft;
    this._state.rightKeyDown = moveRight;
    if (jumpHeld && !this._spaceWasDown) {
      this._pushButton();
    } else if (!jumpHeld && this._spaceWasDown) {
      this._releaseButton();
    }
    this._spaceWasDown = jumpHeld;
    if (!!this.input.activePointer.isDown && !this._state.upKeyDown && !this._state.isDead) {
      this._state.upKeyDown = true;
    }
    this._level.updateEndPortalY(this._cameraY, this._state.isFlying);
    this._noclip.apply();
    if (!this._levelWon && !this._state.isDead && this._level.endXPos > 0) {
      const endPortalLead = 600;
      if (this._playerWorldX >= this._level.endXPos - endPortalLead) {
        this._levelWon = true;
        this._endPortalGameY = this._level._endPortalGameY || 240;
        this._triggerEndPortal();
      }
    }
    if (this._levelWon) {
      this._deltaBuffer = 0;
      if (this._endCamTween) {
        const ect = this._endCamTween;
        this._cameraX = ect.fromX + (ect.toX - ect.fromX) * ect.p;
        this._cameraY = ect.fromY + (ect.toY - ect.fromY) * ect.p;
      }
      this._cameraXRef._v = this._cameraX;
      this._level.additiveContainer.x = -this._cameraX;
      this._level.additiveContainer.y = this._cameraY;
      this._level.container.x = -this._cameraX;
      this._level.container.y = this._cameraY;
      this._level.topContainer.x = -this._cameraX;
      this._level.topContainer.y = this._cameraY;
      this._updateBackground();
      this._level.stepGroundAnimation(delta / 1000);
      this._level.updateGroundTiles(this._cameraY);
      return;
    }
    if (this._state.isDead) {
      if (!this._deathSoundPlayed) {
        this._audio.stopMusic();
        this._audio.playEffect("explode_11", {
          volume: 0.65
        });
        this._deathSoundPlayed = true;
      }
      if (!this._newBestShown) {
        this._newBestShown = true;
        let levelLen = this._level.endXPos || 6000;
        let atX = this._playerWorldX;
        this._lastPercent = Math.min(99, Math.max(0, Math.floor(atX / levelLen * 100)));
        if (this._lastPercent > this._bestPercent) {
          this._bestPercent = this._lastPercent;
          this._hadNewBest = true;
          this._showNewBest();
        }
      }
      this._player.updateExplosionPieces(delta);
      this._deathTimer += delta;
      let respawnDelayMs = this._hadNewBest ? 1400 : 1000;
      if (this._deathTimer > respawnDelayMs) {
        this._restartLevel();
      }
      return;
    }
    this._playTime += delta / 1000;
    this._audio.update(delta / 1000);
    this._level.updateAudioScale(this._audio.getMeteringValue());
    let smoothedStep = this._quantizeDelta(delta);
    let physicsSubsteps = smoothedStep > 0 ? Math.max(1, Math.round(smoothedStep * 4)) : 0;
    if (physicsSubsteps > 60) {
      physicsSubsteps = 60;
    }
    let subStepSize = physicsSubsteps > 0 ? smoothedStep / physicsSubsteps : 0;
    let jumpDt = subStepSize * inputSmoothingMul;
    const savedY = this._state.y;
    for (let s = 0; s < physicsSubsteps; s++) {
      this._state.lastY = this._state.y;
      this._state.lastX = this._playerWorldX;
      this._player.updateJump(jumpDt);
      this._state.y += this._state.yVelocity * jumpDt;
      this._playerWorldX += this._platformer.getPreCollisionHorizontalDelta(subStepSize);
      this._player.checkCollisions(this._playerWorldX - viewportHalfMinus150);
      this._playerWorldX += this._platformer.getPostCollisionHorizontalDelta(subStepSize);
      if (!this._state.isFlying) {
        if (this._state.onGround) {
          this._player.updateGroundRotation(jumpDt);
        } else if (this._player.rotateActionActive) {
          this._player.updateRotateAction(physicsFixedDt);
        }
      }
    }
    this._state.lastY = savedY;
    if (!this._endCameraOverride) {
      const camFollowX = this._playerWorldX - viewportHalfMinus150;
      if (this._level.endXPos > 0) {
        const endStopX = this._level.endXPos - gameWidth;
        if (camFollowX >= endStopX - 200) {
          this._endCameraOverride = true;
          this._cameraX = camFollowX;
          const endCamTargetY = -140 + (this._level._endPortalGameY || 240);
          const easePow = 1.8;
          const easeEndCam = t => t < 0.5 ? Math.pow(t * 2, easePow) / 2 : 1 - Math.pow((1 - t) * 2, easePow) / 2;
          this._endCamTween = {
            p: 0,
            fromX: this._cameraX,
            toX: endStopX,
            fromY: this._cameraY,
            toY: endCamTargetY
          };
          this.tweens.add({
            targets: this._endCamTween,
            p: 1,
            duration: 1200,
            ease: easeEndCam
          });
        } else {
          this._cameraX = camFollowX;
        }
      } else {
        this._cameraX = camFollowX;
      }
    }
    if (this._endCameraOverride && this._endCamTween) {
      const ect = this._endCamTween;
      this._cameraX = ect.fromX + (ect.toX - ect.fromX) * ect.p;
      this._cameraY = ect.fromY + (ect.toY - ect.fromY) * ect.p;
    }
    this._cameraXRef._v = this._cameraX;
    if (!this._endCameraOverride) {
      this._updateCameraY(smoothedStep);
    }
    this._level.additiveContainer.x = -this._cameraX;
    this._level.additiveContainer.y = this._cameraY;
    this._level.container.x = -this._cameraX;
    this._level.container.y = this._cameraY;
    this._level.topContainer.x = -this._cameraX;
    this._level.topContainer.y = this._cameraY;
    let playerXForTriggers = this._playerWorldX;
    for (let trig of this._level.checkColorTriggers(playerXForTriggers)) {
      this._colorManager.triggerColor(trig.index, trig.color, trig.duration);
      if (trig.tintGround) {
        this._colorManager.triggerColor(COLOR_ID_GROUND, trig.color, trig.duration);
      }
    }
    this._colorManager.step(delta / 1000);
    this._bg.setTint(this._colorManager.getHex(COLOR_ID_BACKGROUND));
    this._level.setGroundColor(this._colorManager.getHex(COLOR_ID_GROUND));
    this._level.updateVisibility(this._cameraX);
    this._level.checkEnterEffectTriggers(playerXForTriggers);
    this._level.applyEnterEffects(this._cameraX);
    this._glitterCenterX = this._cameraX + gameWidth / 2;
    this._glitterCenterY = groundBaselineY - this._cameraY;
    this._rawinbow.apply(this, delta / 1000);
    this._updateBackground();
    this._level.stepGroundAnimation(delta / 1000);
    this._level.updateGroundTiles(this._cameraY);
    if (this._state.isFlying) {
      this._player.updateShipRotation(smoothedStep);
    }
    const playerRelX = this._playerWorldX - this._cameraX;
    this._player.syncSprites(this._cameraX, this._cameraY, delta / 1000, playerRelX);
  }
  _showNewBest() {
    const centerX = gameWidth / 2;
    const badge = this.add.image(0, 0, "GJ_WebSheet", "GJ_newBest_001.png").setOrigin(0.5, 1);
    const pctText = this.add.bitmapText(0, 2, "bigFont", this._lastPercent + "%", 65).setOrigin(0.5, 0).setScale(1.1);
    const group = this.add.container(centerX, 300, [badge, pctText]).setScrollFactor(0).setDepth(60).setScale(0.01);
    this.tweens.add({
      targets: group,
      scale: 1,
      duration: 400,
      ease: "Elastic.Out",
      easeParams: [1, 0.6],
      onComplete: () => {
        this.tweens.add({
          targets: group,
          scale: 0.01,
          duration: 200,
          delay: 700,
          ease: "Quad.In",
          onComplete: () => {
            group.setVisible(false);
            group.destroy();
          }
        });
      }
    });
  }
  _triggerEndPortal() {
    this._player.playEndAnimation(this._level.endXPos, () => this._levelComplete(), this._endPortalGameY);
  }
  _levelComplete() {
    const burstX = this._level.endXPos - this._cameraX;
    const burstY = gameYToWorldY(this._endPortalGameY) + this._cameraY;
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 50, () => tweenRadialGraphic(this, burstX, burstY, 10, gameWidth, 500, false, true, tintLimeGreen));
    }
    tweenRadialGraphic(this, burstX, burstY, 10, 1000, 500, true, false, tintLimeGreen);
    this._showCompleteEffect();
  }
  _showCompleteEffect() {
    this._audio.fadeOutMusic(1500);
    this.sound.play("endStart_02", {
      volume: 0.8
    });
    (function (scene, beamOriginX, beamOriginY, fillColor) {
      const scale = 2;
      const beamCount = 8;
      const baseW = scale * 1;
      const wMid = scale * 30;
      const wJitter = scale * 20;
      const maxBeamH = Math.round(Math.sqrt(gameWidth ** 2 + 102400)) + scale * 32.5;
      const durBase = 180;
      const durJitter = 40;
      const staggerStep = 195;
      const staggerBase = 40;
      const staggerRand = 40;
      const alphaBase = 155 / 255;
      const alphaJitter = 100 / 255;
      const fadeDelayAfter = 400;
      const angleStart = -135;
      const angleStep = 90 / beamCount;
      const angles = Array.from({
        length: beamCount
      }, (_unused, index) => angleStart + index * angleStep);
      for (let i = angles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [angles[i], angles[j]] = [angles[j], angles[i]];
      }
      let maxStartDelay = 0;
      const beamGraphics = [];
      for (let b = 0; b < beamCount; b++) {
        const startDelay = b * staggerStep + staggerBase + staggerRand * (Math.random() * 2 - 1);
        const targetW = wMid + wJitter * (Math.random() * 2 - 1);
        const tweenDur = durBase + durJitter * (Math.random() * 2 - 1);
        const startAlpha = Math.min(1, Math.max(0, alphaBase + alphaJitter * (Math.random() * 2 - 1)));
        const angle = angles[b] + angleStep * Math.random() + 180;
        const g = scene.add.graphics().setScrollFactor(0).setDepth(-1).setBlendMode(blendAdditive).setPosition(beamOriginX, beamOriginY).setAngle(angle).setAlpha(startAlpha).setVisible(false);
        const poly = {
          h: 1,
          w: baseW
        };
        scene.time.delayedCall(Math.max(0, startDelay), () => {
          g.setVisible(true);
          scene.tweens.add({
            targets: poly,
            h: maxBeamH,
            w: targetW,
            duration: tweenDur,
            ease: "Quad.Out",
            onUpdate: () => {
              const topW = baseW + (poly.w - baseW) / 4;
              g.clear();
              g.fillStyle(fillColor, 1);
              g.beginPath();
              g.moveTo(-topW / 2, 0);
              g.lineTo(topW / 2, 0);
              g.lineTo(poly.w / 2, poly.h);
              g.lineTo(-poly.w / 2, poly.h);
              g.closePath();
              g.fillPath();
            }
          });
        });
        if (startDelay > maxStartDelay) {
          maxStartDelay = startDelay;
        }
        beamGraphics.push(g);
      }
      scene.time.delayedCall(maxStartDelay + fadeDelayAfter, () => {
        for (const g of beamGraphics) {
          const fadeDelay = Math.random() * 200;
          const fadeDur = 400 + (Math.random() * 2 - 1) * 100;
          scene.tweens.add({
            targets: g,
            alpha: 0,
            delay: fadeDelay,
            duration: fadeDur,
            onComplete: () => g.destroy()
          });
        }
      });
    })(this, this._level.endXPos - this._cameraX + 60, gameYToWorldY(this._endPortalGameY) + this._cameraY, tintLimeGreen);
    this.cameras.main.shake(1950, 0.004);
    this.time.delayedCall(1950, () => this._showCompleteText());
  }
  _showCompleteText() {
    const centerX = gameWidth / 2;
    const titleImg = this.add.image(centerX, 250, "GJ_WebSheet", "GJ_levelComplete_001.png").setScrollFactor(0).setDepth(60).setScale(0.01);
    this.tweens.add({
      targets: titleImg,
      scale: 1.1,
      duration: 660,
      ease: "Elastic.Out",
      easeParams: [1, 0.6],
      onComplete: () => {
        this.tweens.add({
          targets: titleImg,
          scale: 0.01,
          duration: 220,
          delay: 880,
          ease: "Quad.In",
          onComplete: () => {
            titleImg.setVisible(false);
            titleImg.destroy();
          }
        });
      }
    });
    const completeTints = [tintLimeGreen, 16777215];
    for (let t = 0; t < 2; t++) {
      this.add.particles(centerX, 250, "GJ_WebSheet", {
        frame: "square.png",
        speed: {
          min: 300,
          max: 700
        },
        angle: {
          min: 0,
          max: 360
        },
        scale: {
          start: 0.4,
          end: 0.13
        },
        lifespan: {
          min: 0,
          max: 1000
        },
        quantity: 50,
        stopAfter: 200,
        blendMode: blendAdditive,
        tint: completeTints[t],
        x: {
          min: -800,
          max: 800
        },
        y: {
          min: -80,
          max: 80
        }
      }).setScrollFactor(0).setDepth(59);
    }
    const fxX = this._level.endXPos - this._cameraX;
    const fxY = gameYToWorldY(this._endPortalGameY) + this._cameraY;
    tweenRadialGraphic(this, fxX, fxY, 10, gameWidth, 800, true, false, tintLimeGreen);
    tweenRadialGraphic(this, centerX, 250, 10, 1000, 800, true, false, tintLimeGreen);
    for (let j = 0; j < 5; j++) {
      this.time.delayedCall(j * 50, () => tweenRadialGraphic(this, fxX, fxY, 10, gameWidth, 500, false, true, tintLimeGreen));
    }
    for (let k = 0; k < 10; k++) {
      const sparkleDelay = k * 150 + (Math.random() * 160 - 80);
      this.time.delayedCall(Math.max(0, sparkleDelay), () => spawnSparkleBurst(this, tintLimeGreen, tintWhite));
    }
    this.time.delayedCall(1500, () => this._showEndLayer());
  }
  _showEndLayer() {
    if (this._pauseBtn) {
      this.tweens.add({
        targets: this._pauseBtn,
        alpha: 0,
        duration: 300
      });
    }
    const cx = gameWidth / 2;
    const layerY = 320;
    this._endLayerOverlay = this.add.rectangle(cx, layerY, gameWidth, gameHeight, 0, 0).setScrollFactor(0).setDepth(200).setInteractive();
    this._endLayerInternal = this.add.container(0, -640).setScrollFactor(0).setDepth(201);
    this.tweens.add({
      targets: this._endLayerOverlay,
      alpha: 100 / 255,
      duration: 1000
    });
    const slideProgress = {
      p: 0
    };
    this.tweens.add({
      targets: slideProgress,
      p: 1,
      duration: 1000,
      ease: "Bounce.Out",
      onUpdate: () => {
        this._endLayerInternal.y = slideProgress.p * 650 - 640;
      },
      onComplete: () => this._playStarAward()
    });
    const tableW = 712;
    const tableH = 460;
    const tableLeftX = (gameWidth - tableW) / 2;
    this._endLayerInternal.add(this.add.rectangle(tableLeftX + 356, 310, tableW, tableH, 0, 180 / 255));
    const sideFrame = this.textures.getFrame("GJ_WebSheet", "GJ_table_side_001.png");
    const sideStretch = sideFrame ? tableH / sideFrame.height : 1;
    this._endLayerInternal.add(this.add.image(tableLeftX - 40, 80, "GJ_WebSheet", "GJ_table_side_001.png").setOrigin(0, 0).setScale(1, sideStretch));
    this._endLayerInternal.add(this.add.image(tableLeftX + tableW + 40, 80, "GJ_WebSheet", "GJ_table_side_001.png").setOrigin(1, 0).setFlipX(true).setScale(1, sideStretch));
    const tableTop = this.add.image(tableLeftX + 356, 70, "GJ_WebSheet", "GJ_table_top_001.png");
    this._endLayerInternal.add(tableTop);
    this._endLayerInternal.add(this.add.image(tableLeftX + 356, 560, "GJ_WebSheet", "GJ_table_bottom_001.png"));
    const chainY = tableTop.y - 65;
    this._endLayerInternal.add(this.add.image(cx - 312, chainY, "GJ_WebSheet", "chain_01_001.png").setOrigin(0.5, 1));
    this._endLayerInternal.add(this.add.image(cx + 312, chainY, "GJ_WebSheet", "chain_01_001.png").setOrigin(0.5, 1));
    this._endLayerInternal.add(this.add.image(cx, 170, "GJ_WebSheet", "GJ_levelComplete_001.png").setScale(0.8));
    const statsScale = 0.8;
    let statsY = 250;
    const attemptsLine = this.add.bitmapText(cx, statsY, "goldFont", "Attempts: " + this._attempts, 40).setOrigin(0.5, 0.5).setScale(statsScale);
    this._endLayerInternal.add(attemptsLine);
    statsY += 48;
    this._endLayerInternal.add(this.add.bitmapText(cx, statsY, "goldFont", "Jumps: " + this._totalJumps, 40).setOrigin(0.5, 0.5).setScale(statsScale));
    statsY += 48;
    const totalSecs = Math.floor(this._playTime);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor(totalSecs % 3600 / 60);
    const secs = totalSecs % 60;
    const timeStr = hours > 0 ? String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0") : String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    const statsRowForPraiseY = statsY;
    this._endLayerInternal.add(this.add.bitmapText(cx, statsY, "goldFont", "Time: " + timeStr, 40).setOrigin(0.5, 0.5).setScale(statsScale));
    const praiseLines = ["Awesome!", "Good\nJob!", "Well\nDone!", "Impressive!", "Amazing!", "Incredible!", "Skillful!", "Brilliant!", "Not\nbad!", "Warp\nSpeed!", "Challenge\nBreaker!", "Reflex\nMaster!", "I am\nspeechless...", "You are...\nThe One!", "How is this\npossible!?", "You beat\nme..."];
    const praise = praiseLines[Math.floor(Math.random() * praiseLines.length)];
    const praiseOffsetX = 225;
    this._endLayerInternal.add(this.add.bitmapText(cx + praiseOffsetX, statsRowForPraiseY, "bigFont", praise, 40).setOrigin(0.5, 0.5).setScale(0.8).setCenterAlign());
    this._endLayerInternal.add(this.add.image(cx - praiseOffsetX, 352.5, "GJ_WebSheet", "getIt_001.png").setScale(1 / 1.5));
    for (let d = 0; d < EndScreenLinks.length; d++) {
      const row = EndScreenLinks[d];
      const dx = (d - 1) * praiseOffsetX;
      const dlScale = 1 / 1.5;
      const dlImg = this.add.image(cx + dx, 437.5, "GJ_WebSheet", row.key + ".png").setScale(dlScale).setInteractive();
      this._endLayerInternal.add(dlImg);
      this._makeBouncyButton(dlImg, dlScale, () => window.open(row.url, "_blank"));
    }
    this._endStarX = cx + praiseOffsetX;
    this._endStarY = statsRowForPraiseY - 77.5;
    for (const spec of EndScreenButtons) {
      const btn = this.add.image(cx + spec.dx, 555, "GJ_WebSheet", spec.frame).setInteractive();
      this._endLayerInternal.add(btn);
      this._makeBouncyButton(btn, 1, this._endScreenButtonAction(spec.kind));
    }
  }
  _playStarAward() {
    if (!this._endLayerInternal) {
      return;
    }
    const starX = this._endStarX;
    const starY = this._endStarY;
    const starImg = this.add.image(starX, starY, "GJ_WebSheet", "GJ_bigStar_001.png").setScale(3).setAlpha(0);
    this._endLayerInternal.add(starImg);
    this.tweens.add({
      targets: starImg,
      scale: 0.8,
      alpha: 1,
      duration: 300,
      delay: 0,
      ease: "Bounce.Out"
    });
    this.time.delayedCall(100, () => {
      this._audio.playEffect("highscoreGet02");
      const burstY = starY + this._endLayerInternal.y;
      this.add.particles(starX, burstY, "GJ_WebSheet", {
        frame: "square.png",
        speed: {
          min: 200,
          max: 600
        },
        angle: {
          min: 0,
          max: 360
        },
        scale: {
          start: 0.5,
          end: 0
        },
        alpha: {
          start: 1,
          end: 0
        },
        lifespan: {
          min: 200,
          max: 600
        },
        quantity: 30,
        stopAfter: 30,
        blendMode: blendAdditive,
        tint: 16776960
      }).setScrollFactor(0).setDepth(202);
      const glow = this.add.graphics().setScrollFactor(0).setDepth(202).setBlendMode(blendAdditive);
      const glowTween = {
        t: 0
      };
      this.tweens.add({
        targets: glowTween,
        t: 1,
        duration: 400,
        ease: "Quad.Out",
        onUpdate: () => {
          glow.clear();
          glow.fillStyle(16776960, 1 - glowTween.t);
          glow.fillCircle(starX, burstY, 20 + glowTween.t * 200);
        },
        onComplete: () => glow.destroy()
      });
    });
  }
  _hideEndLayer(onDone) {
    if (!this._endLayerInternal) {
      if (onDone) {
        onDone();
      }
      return;
    }
    const hideSlide = {
      p: 0
    };
    this.tweens.add({
      targets: hideSlide,
      p: 1,
      duration: 500,
      ease: t => t < 0.5 ? Math.pow(t * 2, 2) / 2 : 1 - Math.pow((1 - t) * 2, 2) / 2,
      onUpdate: () => {
        this._endLayerInternal.y = hideSlide.p * -640;
      },
      onComplete: () => {
        this._endLayerInternal.destroy();
        this._endLayerInternal = null;
        if (this._endLayerOverlay) {
          this._endLayerOverlay.destroy();
          this._endLayerOverlay = null;
        }
        if (onDone) {
          onDone();
        }
      }
    });
    this.tweens.add({
      targets: this._endLayerOverlay,
      alpha: 0,
      duration: 500
    });
  }
}
