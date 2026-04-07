class Player {
  constructor(scene, physicsState, gameLayer) {
    this._scene = scene;
    this.p = physicsState;
    this._gameLayer = gameLayer;
    this._rotation = 0;
    this.rotateActionActive = false;
    this.rotateActionTime = 0;
    this.rotateActionDuration = 0;
    this.rotateActionStart = 0;
    this.rotateActionTotal = 0;
    this._showHitboxes = false;
    this._lastLandObject = null;
    this._lastXOffset = 0;
    this._lastCameraX = 0;
    this._lastCameraY = 0;
    this._createSprites();
    this._initParticles(scene);
    scene.events.on("shutdown", () => this._cleanupExplosion());
  }
  _createSprites() {
    const scene = this._scene;
    const worldY = gameYToWorldY(this.p.y);
    const cx = viewportHalfMinus150;
    this._playerGlowLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "player_01_glow_001.png", 9, false);
    this._playerSpriteLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "player_01_001.png", 10, true);
    this._playerOverlayLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "player_01_2_001.png", 8, true);
    this._playerExtraLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "player_01_extra_001.png", 12, true);
    if (this._playerGlowLayer) {
      this._playerGlowLayer.sprite.setTint(tintWhite);
      this._playerGlowLayer.sprite._glowEnabled = false;
    }
    if (this._playerSpriteLayer) {
      this._playerSpriteLayer.sprite.setTint(tintLimeGreen);
    } else {
      let cubeFallback = scene.add.rectangle(cx, worldY, gridCellPx, gridCellPx, tintLimeGreen);
      cubeFallback.setDepth(10);
      this._playerSpriteLayer = {
        sprite: cubeFallback
      };
    }
    if (this._playerOverlayLayer) {
      this._playerOverlayLayer.sprite.setTint(tintWhite);
    }
    this._shipGlowLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "ship_01_glow_001.png", 9, false);
    this._shipSpriteLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "ship_01_001.png", 10, false);
    this._shipOverlayLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "ship_01_2_001.png", 8, false);
    this._shipExtraLayer = addDepthSpriteFromAtlas(scene, cx, worldY, "ship_01_extra_001.png", 12, false);
    if (this._shipGlowLayer) {
      this._shipGlowLayer.sprite.setTint(tintWhite);
      this._shipGlowLayer.sprite._glowEnabled = false;
    }
    if (this._shipSpriteLayer) {
      this._shipSpriteLayer.sprite.setTint(tintLimeGreen);
    } else {
      let shipFallback = scene.add.polygon(cx, worldY, [{
        x: -72,
        y: 40
      }, {
        x: 72,
        y: 0
      }, {
        x: -72,
        y: -40
      }, {
        x: -40,
        y: 0
      }], tintLimeGreen);
      shipFallback.setDepth(10).setVisible(false);
      this._shipSpriteLayer = {
        sprite: shipFallback
      };
    }
    if (this._shipOverlayLayer) {
      this._shipOverlayLayer.sprite.setTint(tintWhite);
    }
    this.playerSprite = this._playerSpriteLayer.sprite;
    this.shipSprite = this._shipSpriteLayer.sprite;
    this._playerLayers = [this._playerSpriteLayer, this._playerGlowLayer, this._playerOverlayLayer, this._playerExtraLayer];
    this._shipLayers = [this._shipSpriteLayer, this._shipGlowLayer, this._shipOverlayLayer, this._shipExtraLayer];
    this._allLayers = [...this._playerLayers, ...this._shipLayers];
    this._playerLayerBaseDepths = new Map();
    for (const layer of this._playerLayers) {
      if (layer && layer.sprite && layer.sprite.depth !== undefined) {
        this._playerLayerBaseDepths.set(layer.sprite, layer.sprite.depth);
      }
    }
  }
  _initParticles(scene) {
    this._particleEmitter = scene.add.particles(0, 0, "GJ_WebSheet", {
      frame: "square.png",
      speed: {
        min: 110,
        max: 190
      },
      angle: {
        min: 225,
        max: 315
      },
      lifespan: {
        min: 150,
        max: 450
      },
      scale: {
        start: 0.5,
        end: 0
      },
      gravityY: 600,
      frequency: 1000 / 30,
      blendMode: "ADD",
      alpha: {
        start: 1,
        end: 0
      },
      tint: tintLimeGreen
    });
    this._particleEmitter.stop();
    this._particleEmitter.setDepth(9);
    this._gameLayer.container.add(this._particleEmitter);
    this._flyParticleEmitter = scene.add.particles(0, 0, "GJ_WebSheet", {
      frame: "square.png",
      speed: {
        min: 22,
        max: 38
      },
      angle: {
        min: 225,
        max: 315
      },
      lifespan: {
        min: 150,
        max: 450
      },
      scale: {
        start: 0.5,
        end: 0
      },
      gravityY: 600,
      frequency: 1000 / 30,
      blendMode: "ADD",
      tint: {
        start: 16737280,
        end: 16711680
      },
      alpha: {
        start: 1,
        end: 0
      }
    });
    this._flyParticleEmitter.stop();
    this._flyParticleEmitter.setDepth(9);
    this._gameLayer.container.add(this._flyParticleEmitter);
    this._flyParticle2Emitter = scene.add.particles(0, 0, "GJ_WebSheet", {
      frame: "square.png",
      speed: {
        min: 220,
        max: 380
      },
      angle: {
        min: 180,
        max: 360
      },
      lifespan: {
        min: 150,
        max: 450
      },
      scale: {
        start: 0.75,
        end: 0
      },
      gravityY: 600,
      frequency: 1000 / 30,
      blendMode: "ADD",
      tint: {
        start: 16760320,
        end: 16711680
      },
      alpha: {
        start: 1,
        end: 0
      }
    });
    this._flyParticle2Emitter.stop();
    this._flyParticle2Emitter.setDepth(9);
    this._gameLayer.container.add(this._flyParticle2Emitter);
    this._shipDragEmitter = scene.add.particles(0, 0, "GJ_WebSheet", {
      frame: "square.png",
      x: {
        min: -18,
        max: 18
      },
      speed: {
        min: 223.79999999999998,
        max: 343.79999999999995
      },
      angle: {
        min: 205,
        max: 295
      },
      lifespan: {
        min: 80,
        max: 220
      },
      scale: {
        start: 0.375,
        end: 0
      },
      gravityX: -700,
      gravityY: 600,
      frequency: 25,
      blendMode: "ADD",
      alpha: {
        start: 1,
        end: 0
      }
    });
    this._shipDragEmitter.stop();
    this._shipDragEmitter.setDepth(22);
    this._shipDragActive = false;
    this._particleActive = false;
    this._flyParticle2Active = false;
    this._flyParticleActive = false;
    const landBurstConfig = {
      frame: "square.png",
      speed: {
        min: 250,
        max: 350
      },
      angle: {
        min: 210,
        max: 330
      },
      lifespan: {
        min: 50,
        max: 600
      },
      scale: {
        start: 0.625,
        end: 0
      },
      gravityY: 1000,
      blendMode: "ADD",
      alpha: {
        start: 1,
        end: 0
      },
      tint: tintLimeGreen,
      emitting: false
    };
    this._landEmitter1 = scene.add.particles(0, 0, "GJ_WebSheet", {
      ...landBurstConfig
    });
    this._landEmitter2 = scene.add.particles(0, 0, "GJ_WebSheet", {
      ...landBurstConfig
    });
    this._aboveContainer = scene.add.container(0, 0);
    this._aboveContainer.setDepth(13);
    this._aboveContainer.add(this._landEmitter1);
    this._aboveContainer.add(this._landEmitter2);
    this._landIdx = false;
    this._streak = new ShipTrailRibbon(this._scene, "streak_01", 0.231, 10, 8, 100, tintWhite, 0.7);
    this._streak.addToContainer(this._gameLayer.container, 8);
  }

  /*/////////////////////// drag div insert ///////////////////////////////////*/
  detachOwnedFromLevelContainer() {
    const c = this._gameLayer.container;
    if (!c) {
      return;
    }
    const pull = go => {
      if (go && go.parentContainer === c) {
        c.remove(go, false);
      }
    };
    pull(this._particleEmitter);
    pull(this._flyParticleEmitter);
    pull(this._flyParticle2Emitter);
    if (this._streak && this._streak._gfx) {
      pull(this._streak._gfx);
    }
  }
  reattachOwnedToLevelContainer() {
    const c = this._gameLayer.container;
    if (!c) {
      return;
    }
    c.add(this._particleEmitter);
    c.add(this._flyParticleEmitter);
    c.add(this._flyParticle2Emitter);
    if (this._streak && this._streak._gfx) {
      c.add(this._streak._gfx);
      this._streak._gfx.setDepth(8);
    }
  }
  /*/////////////////////// drag div insert ///////////////////////////////////*/
  
  _updateParticles(_cameraX, cameraYOffset, deltaSec) {
    if (this.p.isDead) {
      return;
    }
    const playerWorldX = this._scene._playerWorldX;
    const bodyWorldY = gameYToWorldY(this.p.y);
    this._particleEmitter.particleX = playerWorldX - 20;
    this._particleEmitter.particleY = bodyWorldY + 26;
    const runParticlesOn = this.p.onGround && !this.p.isFlying;
    if (runParticlesOn && !this._particleActive) {
      this._particleEmitter.start();
      this._particleActive = true;
    } else if (!runParticlesOn && this._particleActive) {
      this._particleEmitter.stop();
      this._particleActive = false;
    }
    {
      const cr = Math.cos(this._rotation);
      const sr = Math.sin(this._rotation);
      const backDist = -24;
      const sideDist = 18;
      const fx = playerWorldX + backDist * cr - sideDist * sr;
      const fy = bodyWorldY + backDist * sr + sideDist * cr;
      const jitter = (Math.random() * 2 - 1) * 2 * 2;
      this._flyParticleEmitter.particleX = fx;
      this._flyParticleEmitter.particleY = fy + jitter;
      this._flyParticle2Emitter.particleX = fx;
      this._flyParticle2Emitter.particleY = fy + jitter;
      this._streak.setPosition(fx + 8, fy);
    }
    this._streak.update(deltaSec);
    const flying = this.p.isFlying;
    if (flying && !this._flyParticleActive) {
      this._flyParticleEmitter.start();
      this._flyParticleActive = true;
    } else if (!flying && this._flyParticleActive) {
      this._flyParticleEmitter.stop();
      this._flyParticleActive = false;
    }
    const thrusting = this.p.isFlying && this.p.upKeyDown;
    if (thrusting && !this._flyParticle2Active) {
      this._flyParticle2Emitter.start();
      this._flyParticle2Active = true;
    } else if (!thrusting && this._flyParticle2Active) {
      this._flyParticle2Emitter.stop();
      this._flyParticle2Active = false;
    }
    this._shipDragEmitter.x = viewportHalfMinus150;
    this._shipDragEmitter.particleY = gameYToWorldY(this.p.y) + cameraYOffset + 30;
    const shipGroundDrag = this.p.isFlying && this.p.onGround && !this.p.onCeiling;
    if (shipGroundDrag && !this._shipDragActive) {
      this._shipDragEmitter.start();
      this._shipDragActive = true;
    } else if (!shipGroundDrag && this._shipDragActive) {
      this._shipDragEmitter.stop();
      this._shipDragActive = false;
    }
  }
  setCubeVisible(visible) {
    this._playerSpriteLayer.sprite.setVisible(visible);
    if (this._playerGlowLayer) {
      this._playerGlowLayer.sprite.setVisible(visible && this._playerGlowLayer.sprite._glowEnabled);
    }
    if (this._playerOverlayLayer) {
      this._playerOverlayLayer.sprite.setVisible(visible);
    }
    if (this._playerExtraLayer) {
      this._playerExtraLayer.sprite.setVisible(visible);
    }
  }
  setShipVisible(visible) {
    this._shipSpriteLayer.sprite.setVisible(visible);
    if (this._shipGlowLayer) {
      this._shipGlowLayer.sprite.setVisible(visible && this._shipGlowLayer.sprite._glowEnabled);
    }
    if (this._shipOverlayLayer) {
      this._shipOverlayLayer.sprite.setVisible(visible);
    }
    if (this._shipExtraLayer) {
      this._shipExtraLayer.sprite.setVisible(visible);
    }
  }
  syncSprites(cameraX, cameraYOffset, deltaSec, screenXOverride) {
    if (this._endAnimating) {
      return;
    }
    const screenX = screenXOverride !== undefined ? screenXOverride : viewportHalfMinus150;
    const bodyY = gameYToWorldY(this.p.y) + cameraYOffset;
    const rot = this._rotation;
    this._lastCameraX = cameraX;
    this._lastCameraY = cameraYOffset;
    this._aboveContainer.x = -cameraX;
    this._aboveContainer.y = cameraYOffset;
    if (this.p.isFlying) {
      const shipOffset = 10;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const shipOx = -shipOffset * sr;
      const shipOy = shipOffset * cr;
      const cubeOx = shipOffset * sr;
      const cubeOy = -shipOffset * cr;
      for (const layer of this._shipLayers) {
        if (layer) {
          layer.sprite.x = screenX + shipOx;
          layer.sprite.y = bodyY + shipOy;
          layer.sprite.rotation = rot;
        }
      }
      for (const layer of this._playerLayers) {
        if (layer) {
          layer.sprite.x = screenX + cubeOx;
          layer.sprite.y = bodyY + cubeOy;
          layer.sprite.rotation = rot;
        }
      }
    } else {
      for (const layer of this._allLayers) {
        if (layer) {
          layer.sprite.x = screenX;
          layer.sprite.y = bodyY;
          layer.sprite.rotation = rot;
        }
      }
    }
    this._updateParticles(cameraX, cameraYOffset, deltaSec);
  }
  enterShipMode(portalRect = null) {
    if (this.p.isFlying) {
      return;
    }
    this.p.isFlying = true;
    this._scene.toggleGlitter(true);
    this.p.yVelocity *= 0.5;
    this.p.onGround = false;
    this.p.canJump = false;
    this.p.isJumping = false;
    this.stopRotation();
    this._rotation = 0;
    this._particleEmitter.stop();
    this._flyParticle2Active = false;
    this._streak.reset();
    this._streak.start();
    this.setShipVisible(true);
    for (const layer of this._playerLayers) {
      if (layer && layer.sprite) {
        layer.sprite.setDepth(7);
      }
    }
    for (const layer of this._playerLayers) {
      if (layer) {
        layer.sprite.setScale(0.55);
      }
    }
    let flyAnchorY = this.p.y;
    if (portalRect) {
      flyAnchorY = portalRect.portalY !== undefined ? portalRect.portalY : portalRect.y;
    }
    this._gameLayer.setFlyMode(true, flyAnchorY);
  }
  exitShipMode() {
    if (this.p.isFlying) {
      this.p.isFlying = false;
      this._scene.toggleGlitter(false);
      this.p.yVelocity *= 0.5;
      this.p.onGround = false;
      this.p.canJump = false;
      this.p.isJumping = false;
      this.stopRotation();
      this._rotation = 0;
      this._flyParticleEmitter.stop();
      this._flyParticleActive = false;
      this._flyParticle2Emitter.stop();
      this._flyParticle2Active = false;
      this._shipDragEmitter.stop();
      this._shipDragActive = false;
      this._particleActive = false;
      this._streak.stop();
      this._streak.reset();
      this.setShipVisible(false);
      this.setCubeVisible(true);
      for (const layer of this._playerLayers) {
        if (layer) {
          const baseDepth = this._playerLayerBaseDepths.get(layer.sprite);
          if (baseDepth !== undefined) {
            layer.sprite.setDepth(baseDepth);
          }
          layer.sprite.setScale(1);
        }
      }
      this._gameLayer.setFlyMode(false, 0);
    }
  }
  hitGround() {
    const wasAirborne = !this.p.onGround;
    if (!this.p.isFlying) {
      this.p.lastGroundY = this.p.y;
    }
    this.p.yVelocity = 0;
    this.p.onGround = true;
    this.p.canJump = true;
    this.p.isJumping = false;
    this.stopRotation();
    if (wasAirborne && !this.p.isFlying) {
      this._landIdx = !this._landIdx;
      const emitter = this._landIdx ? this._landEmitter1 : this._landEmitter2;
      const burstX = this._lastCameraX + viewportHalfMinus150;
      const burstY = gameYToWorldY(this.p.y) + 30;
      emitter.explode(10, burstX, burstY);
    }
  }
  killPlayer() {
    if (this.p.isDead) {
      return;
    }
    this.p.isDead = true;
    this._scene.toggleGlitter(false);
    this._particleEmitter.stop();
    this._particleActive = false;
    this._flyParticleEmitter.stop();
    this._flyParticleActive = false;
    this._flyParticle2Emitter.stop();
    this._flyParticle2Active = false;
    this._shipDragEmitter.stop();
    this._shipDragActive = false;
    this._streak.stop();
    this._streak.reset();
    const scene = this._scene;
    const deathX = scene._playerWorldX - scene._cameraX;
    const deathY = gameYToWorldY(this.p.y) + this._lastCameraY;
    const explosionScale = 0.9;
    scene.add.particles(deathX, deathY, "GJ_WebSheet", {
      frame: "square.png",
      speed: {
        min: 200,
        max: 800
      },
      angle: {
        min: 0,
        max: 360
      },
      scale: {
        start: 18 / 32,
        end: 0
      },
      alpha: {
        start: 1,
        end: 0
      },
      lifespan: {
        min: 50,
        max: 800
      },
      quantity: 100,
      stopAfter: 100,
      blendMode: blendAdditive,
      tint: tintLimeGreen,
      x: {
        min: -20,
        max: 20
      },
      y: {
        min: -20,
        max: 20
      }
    }).setScrollFactor(0).setDepth(15);
    const deathFlash = scene.add.graphics().setScrollFactor(0).setDepth(15).setBlendMode(blendAdditive);
    const flashTween = {
      t: 0
    };
    scene.tweens.add({
      targets: flashTween,
      t: 1,
      duration: 500,
      ease: "Quad.Out",
      onUpdate: () => {
        const radius = 18 + flashTween.t * 144;
        const alpha = 1 - flashTween.t;
        deathFlash.clear();
        deathFlash.fillStyle(tintLimeGreen, alpha);
        deathFlash.fillCircle(deathX, deathY, radius);
      },
      onComplete: () => deathFlash.destroy()
    });
    this._createExplosionPieces(deathX, deathY, explosionScale);
    this.setCubeVisible(false);
    this.setShipVisible(false);
  }
  _createExplosionPieces(centerX, centerY, scale) {
    const scene = this._scene;
    const captureSize = Math.round(scale * 40 * 2);
    const rt = scene.make.renderTexture({
      x: 0,
      y: 0,
      width: captureSize,
      height: captureSize,
      add: false
    });
    const spriteLayersForCapture = [this._playerGlowLayer, this._playerOverlayLayer, this._shipGlowLayer, this._shipOverlayLayer, this._playerSpriteLayer, this._playerExtraLayer, this._shipSpriteLayer, this._shipExtraLayer];
    for (const entry of spriteLayersForCapture) {
      if (!entry || !entry.sprite.visible) {
        continue;
      }
      const spr = entry.sprite;
      rt.draw(spr, captureSize / 2 + (spr.x - centerX), captureSize / 2 + (spr.y - centerY));
    }
    const texKey = "__deathRT_" + Date.now();
    rt.saveTexture(texKey);
    const texture = scene.textures.get(texKey);
    let cols = 2 + Math.round(Math.random() * 2);
    let rows = 2 + Math.round(Math.random() * 2);
    const rarityRoll = Math.random();
    if (rarityRoll > 0.95) {
      cols = 1;
    } else if (rarityRoll > 0.9) {
      rows = 1;
    }
    const pieceVelBase = 7.4779225920000005;
    const pieceVelMin = pieceVelBase * 0.5;
    const pieceVelSpread = pieceVelBase * 1;
    const sliceJitter = 0.45;
    const colW = captureSize / cols;
    const rowH = captureSize / rows;
    const colWidths = [];
    const rowHeights = [];
    const colStarts = [0];
    const rowStarts = [0];
    let accW = 0;
    let accH = 0;
    for (let ci = 0; ci < cols - 1; ci++) {
      const w = Math.round(colW * (0.55 + Math.random() * sliceJitter * 2));
      colWidths.push(w);
      accW += w;
      colStarts.push(accW);
    }
    colWidths.push(captureSize - accW);
    for (let ri = 0; ri < rows - 1; ri++) {
      const h = Math.round(rowH * (0.55 + Math.random() * sliceJitter * 2));
      rowHeights.push(h);
      accH += h;
      rowStarts.push(accH);
    }
    rowHeights.push(captureSize - accH);
    this._explosionPieces = [];
    this._explosionContainer = scene.add.container(centerX, centerY).setDepth(16);
    let pieceCount = 0;
    for (let ci = 0; ci < cols; ci++) {
      const cw = colWidths[ci];
      const cx0 = colStarts[ci];
      for (let ri = 0; ri < rows; ri++) {
        const rh = rowHeights[ri];
        const ry0 = rowStarts[ri];
        if (cw <= 0 || rh <= 0) {
          continue;
        }
        pieceCount++;
        const frameName = "piece_" + ci + "_" + ri;
        texture.add(frameName, 0, cx0, ry0, cw, rh);
        const pieceImg = scene.add.image(0, 0, texKey, frameName);
        pieceImg.x = cx0 + cw / 2 - captureSize / 2;
        pieceImg.y = -(ry0 + rh / 2 - captureSize / 2);
        this._explosionContainer.add(pieceImg);
        let trail = null;
        if (pieceCount % 2 == 0) {
          const life = 200 + Math.random() * 200;
          const imgRef = pieceImg;
          trail = scene.add.particles(0, 0, "GJ_WebSheet", {
            frame: "square.png",
            speed: 0,
            scale: {
              start: 0.5,
              end: 0
            },
            alpha: {
              start: 1,
              end: 0
            },
            lifespan: life,
            frequency: 25,
            quantity: 1,
            emitting: true,
            blendMode: blendAdditive,
            tint: tintLimeGreen,
            emitCallback: particle => {
              particle.x = imgRef.x + (Math.random() * 2 - 1) * 3 * 2;
              particle.y = imgRef.y + (Math.random() * 2 - 1) * 3 * 2;
            }
          });
          this._explosionContainer.addAt(trail, 0);
        }
        const piece = {
          spr: pieceImg,
          particle: trail,
          xVel: pieceVelMin + (Math.random() * 2 - 1) * pieceVelSpread,
          yVel: -(12 + (Math.random() * 2 - 1) * 6),
          timer: 1.4,
          fadeTime: 0.5,
          rotDelta: (Math.random() * 2 - 1) * 360 / 60,
          halfSize: Math.min(cw, rh) / 2
        };
        this._explosionPieces.push(piece);
      }
    }
    this._explosionGroundSY = gameYToWorldY(0) + this._lastCameraY;
    this._explosionRT = rt;
    this._explosionTexKey = texKey;
  }
  clearExplosionDebrisOnly() {
    this._cleanupExplosion();
  }
  updateExplosionPieces(deltaMs) {
    if (!this._explosionPieces || this._explosionPieces.length === 0) {
      return;
    }
    const dt = deltaMs / 1000;
    const timeScaled = Math.min(dt * 60 * 0.9, 2);
    const gravityStep = timeScaled * 0.5 * 2;
    const groundLocalY = this._explosionGroundSY - this._explosionContainer.y;
    let i = 0;
    while (i < this._explosionPieces.length) {
      const piece = this._explosionPieces[i];
      piece.timer -= dt;
      if (piece.timer > 0) {
        piece.yVel += gravityStep;
        piece.xVel *= 0.98 + (1 - timeScaled) * 0.02;
        let nx = piece.spr.x + piece.xVel * timeScaled;
        let ny = piece.spr.y + piece.yVel * timeScaled;
        const floorY = groundLocalY - piece.halfSize;
        if (ny > floorY && piece.yVel > 0) {
          ny = floorY;
          piece.yVel *= -0.8;
          if (Math.abs(piece.yVel) < 3) {
            piece.yVel = -3;
          }
        }
        piece.spr.x = nx;
        piece.spr.y = ny;
        piece.spr.angle += piece.rotDelta * timeScaled;
        if (piece.timer < piece.fadeTime) {
          const fadeA = piece.timer / piece.fadeTime;
          piece.spr.setAlpha(fadeA);
          if (piece.particle) {
            piece.particle.setAlpha(fadeA);
          }
        }
        i++;
      } else {
        if (piece.particle) {
          piece.particle.stop();
          piece.particle.destroy();
        }
        piece.spr.destroy();
        this._explosionPieces.splice(i, 1);
      }
    }
    if (this._explosionPieces.length === 0) {
      this._cleanupExplosion();
    }
  }
  _cleanupExplosion() {
    if (this._explosionPieces) {
      for (const piece of this._explosionPieces) {
        if (piece.particle) {
          piece.particle.stop();
          piece.particle.destroy();
        }
        if (piece.spr) {
          piece.spr.destroy();
        }
      }
    }
    if (this._explosionContainer) {
      this._explosionContainer.destroy();
      this._explosionContainer = null;
    }
    if (this._explosionTexKey) {
      this._scene.textures.remove(this._explosionTexKey);
      this._explosionTexKey = null;
    }
    if (this._explosionRT) {
      this._explosionRT.destroy();
      this._explosionRT = null;
    }
    this._explosionPieces = null;
  }
  _playPortalShine(portalRect) {
    const scene = this._scene;
    const px = portalRect.x;
    const py = gameYToWorldY(portalRect.portalY);
    const shineFrames = ["portalshine_02_front_001.png", "portalshine_02_back_001.png"];
    const targetContainers = [this._gameLayer.topContainer, this._gameLayer.container];
    for (let li = 0; li < 2; li++) {
      const resolved = resolveAtlasFrame(scene, shineFrames[li]);
      if (!resolved) {
        continue;
      }
      const img = scene.add.image(px, py, resolved.atlas, resolved.frame);
      img.setBlendMode(blendAdditive);
      img.setAlpha(0);
      targetContainers[li].add(img);
      scene.tweens.add({
        targets: img,
        alpha: {
          from: 0,
          to: 1
        },
        duration: 50,
        onComplete: () => {
          scene.tweens.add({
            targets: img,
            alpha: 0,
            duration: 400,
            onComplete: () => img.destroy()
          });
        }
      });
    }
  }
  _checkSnapJump(landRect) {
    const snapOffsets = [{
      dx: 240,
      dy: 60
    }, {
      dx: 300,
      dy: -60
    }, {
      dx: 180,
      dy: 120
    }];
    const prev = this._lastLandObject;
    if (prev && prev !== landRect && prev.type === collisionSolid) {
      const px = prev.x;
      const py = prev.y;
      const nx = landRect.x;
      const ny = landRect.y;
      const gy = this.p.gravityFlipped ? -1 : 1;
      let matched = false;
      for (const off of snapOffsets) {
        if (Math.abs(nx - (px + off.dx)) <= 2 && Math.abs(ny - (py + off.dy * gy)) <= 2) {
          matched = true;
          break;
        }
      }
      if (matched) {
        const targetX = landRect.x + this._lastXOffset;
        const curX = this._scene._playerWorldX;
        const snapped = Math.abs(targetX - curX) <= 2 ? targetX : targetX > curX ? curX + 2 : curX - 2;
        this._scene._playerWorldX = snapped;
      }
    }
    this._lastLandObject = landRect;
    this._lastXOffset = this._scene._playerWorldX - landRect.x;
  }
  _isFallingPastThreshold() {
    if (this.p.gravityFlipped) {
      return this.p.yVelocity > 0.25;
    } else {
      return this.p.yVelocity < -0.25;
    }
  }
  flipMod() {
    if (this.p.gravityFlipped) {
      return -1;
    } else {
      return 1;
    }
  }
  runRotateAction() {
    this.rotateActionActive = true;
    this.rotateActionTime = 0;
    this.rotateActionDuration = 0.39 / inputSmoothingMul;
    this.rotateActionStart = this._rotation;
    this.rotateActionTotal = Math.PI * this.flipMod();
  }
  stopRotation() {
    this.rotateActionActive = false;
  }
  updateRotateAction(deltaSec) {
    if (!this.rotateActionActive) {
      return;
    }
    this.rotateActionTime += deltaSec;
    if (this.rotateActionTime >= this.rotateActionDuration) {
      this.rotateActionActive = false;
    }
    let t = Math.min(this.rotateActionTime / this.rotateActionDuration, 1);
    this._rotation = this.rotateActionStart + this.rotateActionTotal * t;
  }
  convertToClosestRotation() {
    const quarterTurn = Math.PI / 2;
    return Math.round(this._rotation / quarterTurn) * quarterTurn;
  }
  slerp2D(fromAngle, toAngle, t) {
    let diff = toAngle - fromAngle;
    while (diff > Math.PI) {
      diff -= Math.PI * 2;
    }
    while (diff < -Math.PI) {
      diff += Math.PI * 2;
    }
    return fromAngle + diff * t;
  }
  updateGroundRotation(deltaSec) {
    let target = this.convertToClosestRotation();
    const smooth = 0.47250000000000003;
    let step = Math.min(deltaSec * 1, smooth * deltaSec);
    this._rotation = this.slerp2D(this._rotation, target, step);
  }
  updateShipRotation(deltaSec) {
    let dy = -(this.p.y - this.p.lastY);
    let dx = deltaSec * 10.3860036;
    if (dx * dx + dy * dy >= deltaSec * 0.6) {
      let targetAngle = Math.atan2(dy, dx);
      const smooth = 0.15;
      let step = Math.min(deltaSec * 1, smooth * deltaSec);
      this._rotation = this.slerp2D(this._rotation, targetAngle, step);
    }
  }
  playerIsFalling() {
    if (this.p.gravityFlipped) {
      return this.p.yVelocity > 3.832796;
    } else {
      return this.p.yVelocity < 3.832796;
    }
  }
  updateJump(deltaSec) {
    if (this.p.isFlying) {
      this._updateFlyJump(deltaSec);
    } else if (this.p.upKeyDown && this.p.canJump) {
      this.p.isJumping = true;
      this.p.onGround = false;
      this.p.canJump = false;
      this.p.upKeyPressed = false;
      this.p.yVelocity = this.flipMod() * 22.360064;
      this.runRotateAction();
    } else if (this.p.isJumping) {
      this.p.yVelocity -= gravityMul * deltaSec * this.flipMod();
      if (this.playerIsFalling()) {
        this.p.isJumping = false;
        this.p.onGround = false;
      }
    } else {
      if (this.playerIsFalling()) {
        this.p.canJump = false;
      }
      this.p.yVelocity -= gravityMul * deltaSec * this.flipMod();
      if (this.p.gravityFlipped) {
        this.p.yVelocity = Math.min(this.p.yVelocity, 30);
      } else {
        this.p.yVelocity = Math.max(this.p.yVelocity, -30);
      }
      if (this._isFallingPastThreshold() && !this.rotateActionActive) {
        this.runRotateAction();
      }
      if (this.playerIsFalling()) {
        const fastFall = this.p.gravityFlipped ? this.p.yVelocity > 4 : this.p.yVelocity < -4;
        if (fastFall) {
          this.p.onGround = false;
        }
      }
    }
  }
  _updateFlyJump(deltaSec) {
    let liftMul = 0.8;
    if (this.p.upKeyDown && !this.p.wasBoosted) {
      liftMul = -1;
    }
    if (!this.p.upKeyDown && !this.playerIsFalling()) {
      liftMul = 1.2;
    }
    let gravMul = 0.4;
    if (this.p.upKeyDown && this.playerIsFalling()) {
      gravMul = 0.5;
    }
    this.p.yVelocity -= gravityMul * deltaSec * this.flipMod() * liftMul * gravMul;
    if (this.p.upKeyDown) {
      this.p.onGround = false;
    }
    if (!this.p.wasBoosted) {
      if (this.p.gravityFlipped) {
        this.p.yVelocity = Math.max(this.p.yVelocity, -16);
        this.p.yVelocity = Math.min(this.p.yVelocity, 12.8);
      } else {
        this.p.yVelocity = Math.max(this.p.yVelocity, -12.8);
        this.p.yVelocity = Math.min(this.p.yVelocity, 16);
      }
    }
  }
  checkCollisions(cameraX) {
    const halfW = 30;
    const playerX = cameraX + viewportHalfMinus150;
    const py = this.p.y;
    const lastY = this.p.lastY;
    const hitInset = this.p.isFlying ? 12 : 20;
    this.p.collideTop = 0;
    this.p.collideBottom = 0;
    this.p.onCeiling = false;
    let landedOnSolid = false;
    const nearby = this._gameLayer.getNearbySectionObjects(playerX);
    for (let rect of nearby) {
      let left = rect.x - rect.w / 2;
      let right = rect.x + rect.w / 2;
      let top = rect.y - rect.h / 2;
      let bottom = rect.y + rect.h / 2;
      if (!(playerX + 30 <= left) && !(playerX - 30 >= right) && !(py + halfW <= top) && !(py - halfW >= bottom)) {
        if (rect.type !== objectTypeFlyMode) {
          if (rect.type !== objectTypeCubeMode) {
            if (rect.type === collisionHazard) {
              this.killPlayer();
              return;
            }
            if (rect.type === collisionSolid) {
              let feetPrev = py - halfW + hitInset;
              let feetLast = lastY - halfW + hitInset;
              let headPrev = py + halfW - hitInset;
              let headLast = lastY + halfW - hitInset;
              const crushPad = 9;
              const crushZone = playerX + crushPad > left && playerX - crushPad < right && py + crushPad > top && py - crushPad < bottom;
              const onTop = (this.p.yVelocity <= 0 || this.p.onGround) && (feetPrev >= bottom || feetLast >= bottom);
              if (crushZone && !onTop) {
                this.killPlayer();
                return;
              }
              if (playerX + 30 - 5 > left && playerX - 30 + 5 < right) {
                if ((feetPrev >= bottom || feetLast >= bottom) && (this.p.yVelocity <= 0 || this.p.onGround)) {
                  this.p.y = bottom + halfW;
                  this.hitGround();
                  landedOnSolid = true;
                  this.p.collideBottom = bottom;
                  if (!this.p.isFlying) {
                    this._checkSnapJump(rect);
                  }
                  continue;
                }
                if ((headPrev <= top || headLast <= top) && (this.p.yVelocity >= 0 || this.p.onGround) && this.p.isFlying) {
                  this.p.y = top - halfW;
                  this.hitGround();
                  this.p.onCeiling = true;
                  this.p.collideTop = top;
                  continue;
                }
              }
            }
          } else if (!rect.activated) {
            rect.activated = true;
            this._playPortalShine(rect);
            this.exitShipMode();
          }
        } else if (!rect.activated) {
          rect.activated = true;
          this._playPortalShine(rect);
          this.enterShipMode(rect);
        }
      }
    }
    if (this.p.collideTop !== 0 && this.p.collideBottom !== 0) {
      if (Math.abs(this.p.collideTop - this.p.collideBottom) < 48) {
        this.killPlayer();
        return;
      }
    }
    let floorY = this._gameLayer.getFloorY();
    if (!landedOnSolid) {
      if (this.p.y <= floorY + 30) {
        this.p.y = floorY + 30;
        this.hitGround();
      }
    }
    let ceilingY = this._gameLayer.getCeilingY();
    if (ceilingY !== null && this.p.y >= ceilingY - 30) {
      this.p.y = ceilingY - 30;
      this.hitGround();
      this.p.onCeiling = true;
    }
    if (this.p.isFlying) {
      const onFloor = this.p.y <= floorY + 30;
      const onCeil = ceilingY !== null && this.p.y >= ceilingY - 30;
      if (!landedOnSolid && !onFloor && this.p.collideTop === 0 && !onCeil) {
        this.p.onGround = false;
      }
    }
  }
  drawHitboxes(gfx, cameraX, cameraYOffset) {
    gfx.clear();
    if (!this._showHitboxes) {
      return;
    }
    const half = 30;
    const playerX = cameraX + viewportHalfMinus150;
    const py = this.p.y;
    const hitInset = this.p.isFlying ? 12 : 20;
    const objs = this._gameLayer.getNearbySectionObjects(playerX);
    for (let rect of objs) {
      let rx = rect.x - cameraX;
      let ry = gameYToWorldY(rect.y) + cameraYOffset;
      let color = 65280;
      if (rect.type === collisionHazard) {
        color = 16729156;
      } else if (rect.type === collisionPortalFly || rect.type === collisionPortalCube) {
        color = 4491519;
      }
      gfx.lineStyle(2, color, 0.7);
      gfx.strokeRect(rx - rect.w / 2, ry - rect.h / 2, rect.w, rect.h);
    }
    const cx = viewportHalfMinus150;
    const bodyY = gameYToWorldY(py) + cameraYOffset;
    gfx.lineStyle(2, 65535, 0.8);
    gfx.strokeRect(cx - half, bodyY - half, gridCellPx, gridCellPx);
    gfx.lineStyle(2, 16776960, 0.8);
    gfx.strokeRect(cx - half + 5, bodyY - half, 50, gridCellPx);
    gfx.lineStyle(2, 16711680, 0.8);
    gfx.strokeRect(cx - half, bodyY - half + 5, gridCellPx, 50);
    let topProbeY = gameYToWorldY(py - half + hitInset) + cameraYOffset;
    let botProbeY = gameYToWorldY(py + half - hitInset) + cameraYOffset;
    gfx.lineStyle(2, 16746496, 0.9);
    gfx.lineBetween(cx - half - 8, topProbeY, cx + half + 8, topProbeY);
    gfx.lineBetween(cx - half - 8, botProbeY, cx + half + 8, botProbeY);
    gfx.lineStyle(2, 16777215, 1);
    gfx.strokeRect(cx - 9, bodyY - 9, 36, 18);
  }
  setShowHitboxes(on) {
    this._showHitboxes = on;
  }
  playEndAnimation(targetWorldX, onComplete, portalGameY) {
    this._endAnimating = true;
    const scene = this._scene;
    const endY = portalGameY || 240;
    const startX = scene._playerWorldX;
    const startY = this.p.y;
    const destX = targetWorldX + 100;
    const destY = endY - 40;
    const startXKeep = startX;
    const startYKeep = startY;
    const midX = startX + 80;
    const midY = endY + 300;
    const visibleSprites = [this._playerSpriteLayer, this._playerGlowLayer, this._playerOverlayLayer, this._playerExtraLayer, this._shipSpriteLayer, this._shipGlowLayer, this._shipOverlayLayer, this._shipExtraLayer].filter(L => L && L.sprite.visible).map(L => L.sprite);
    this._particleEmitter.stop();
    this._flyParticleEmitter.stop();
    this._flyParticle2Emitter.stop();
    this._shipDragEmitter.stop();
    const flying = this.p.isFlying;
    const shipLayers = [this._shipSpriteLayer, this._shipGlowLayer, this._shipOverlayLayer, this._shipExtraLayer];
    const cubeLayers = [this._playerSpriteLayer, this._playerGlowLayer, this._playerOverlayLayer, this._playerExtraLayer];
    const tweenSprites = visibleSprites.map(spr => {
      let localY = 0;
      if (flying) {
        const isShip = shipLayers.some(L => L && L.sprite === spr);
        const isCube = cubeLayers.some(L => L && L.sprite === spr);
        if (isShip) {
          localY = 10;
        } else if (isCube) {
          localY = -10;
        }
      }
      return {
        spr,
        localY
      };
    });
    const streak = this._streak;
    const tweenState = {
      val: 0
    };
    scene.tweens.add({
      targets: tweenState,
      val: 1,
      duration: 1000,
      ease: t => Math.pow(t, 1.2),
      onUpdate: () => {
        const u = tweenState.val;
        const wx = (1 - u) ** 3 * startXKeep + (1 - u) ** 2 * 3 * u * startXKeep + (1 - u) * 3 * u ** 2 * midX + u ** 3 * destX;
        const wy = (1 - u) ** 3 * startYKeep + (1 - u) ** 2 * 3 * u * startYKeep + (1 - u) * 3 * u ** 2 * midY + u ** 3 * destY;
        const screenX = wx - scene._cameraX;
        const screenY = gameYToWorldY(wy) + scene._cameraY;
        const alpha = 1 - u * u;
        const baseRot = tweenSprites[0].spr.rotation;
        const cr = Math.cos(baseRot);
        const sr = Math.sin(baseRot);
        for (const entry of tweenSprites) {
          const ox = -entry.localY * sr;
          const oy = entry.localY * cr;
          entry.spr.setPosition(screenX + ox, screenY + oy);
          entry.spr.setAlpha(alpha);
        }
        streak.setPosition(wx, gameYToWorldY(wy));
        streak.update(scene.game.loop.delta / 1000);
      },
      onComplete: () => {
        for (const entry of tweenSprites) {
          entry.spr.setVisible(false);
        }
        streak.stop();
        streak.reset();
        onComplete();
      }
    });
    for (const spr of visibleSprites) {
      scene.tweens.add({
        targets: spr,
        angle: spr.angle + 360,
        duration: 1000,
        ease: t => Math.pow(t, 1.5)
      });
    }
  }
  reset() {
    this._cleanupExplosion();
    this._endAnimating = false;
    this._lastLandObject = null;
    this._lastXOffset = 0;
    this.stopRotation();
    this.rotateActionTime = 0;
    this._rotation = 0;
    this._lastCameraX = 0;
    this._lastCameraY = 0;
    this.setCubeVisible(true);
    this.setShipVisible(false);
    for (const layer of this._allLayers) {
      if (layer) {
        layer.sprite.setAlpha(1);
      }
    }
    for (const layer of this._playerLayers) {
      if (layer) {
        layer.sprite.setScale(1);
      }
    }
    this._particleEmitter.stop();
    this._particleActive = false;
    this._flyParticleEmitter.stop();
    this._flyParticleActive = false;
    this._flyParticle2Emitter.stop();
    this._flyParticle2Active = false;
    this._shipDragEmitter.stop();
    this._shipDragActive = false;
    this._streak.stop();
    this._streak.reset();
  }
}
