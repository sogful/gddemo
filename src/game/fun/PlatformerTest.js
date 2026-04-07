class PlatformerTest {

  /*//////////////////////////////////////////////////////////////////////*/
  static PlatformerEnabled = true;
  /*//////////////////////////////////////////////////////////////////////*/

  constructor(physicsState) {
    this.p = physicsState;
    this.enabled = PlatformerTest.PlatformerEnabled;
    this._horizontalVelocity = 0;
    this._releaseSmoothSeconds = 0.05;
  }
  reset() {
    this._horizontalVelocity = 0;
    this._facingCurrent = 1;
    this._facingFrom = 1;
    this._facingTo = 1;
    this._facingElapsed = 0;
    this._facingDuration = 0.1;
    this.p.platformerMode = this.enabled;
    this.p.leftKeyDown = false;
    this.p.rightKeyDown = false;
  }
  getDirection() {
    if (!this.enabled) {
      return 1;
    }
    const left = !!this.p.leftKeyDown;
    const right = !!this.p.rightKeyDown;
    if (left === right) {
      return 0;
    }
    return right ? 1 : -1;
  }
  getHorizontalDelta(stepUnits) {
    if (!this.enabled) {
      return stepUnits * scrollVelocityMul * inputSmoothingMul;
    }
    const dir = this.getDirection();
    const targetVelocity = dir * scrollVelocityMul * inputSmoothingMul;
    const stepSeconds = stepUnits / 60;
    const blend = Math.min(1, stepSeconds / this._releaseSmoothSeconds);
    this._horizontalVelocity += (targetVelocity - this._horizontalVelocity) * blend;
    return this._horizontalVelocity * stepUnits;
  }
  getPreCollisionHorizontalDelta(stepUnits) {
    if (!this.enabled) {
      return 0;
    }
    return this.getHorizontalDelta(stepUnits);
  }
  getPostCollisionHorizontalDelta(stepUnits) {
    if (this.enabled) {
      return 0;
    }
    return this.getHorizontalDelta(stepUnits);
  }
  shouldRotateOnJump() {
    if (!this.enabled) {
      return true;
    }
    return this.getDirection() !== 0;
  }
  getRotateDirection() {
    if (!this.enabled) {
      return 1;
    }
    return this.getDirection();
  }
  shouldTriggerJumpSquish() {
    return this.enabled && this.getDirection() === 0;
  }
  getSquishScaleForRotation(rotationRad, baseX, baseY) {
    if (!this.enabled) {
      return {
        x: baseX,
        y: baseY
      };
    }
    const sideways = Math.abs(Math.sin(rotationRad)) > Math.abs(Math.cos(rotationRad));
    if (sideways) {
      return {
        x: baseY,
        y: baseX
      };
    }
    return {
      x: baseX,
      y: baseY
    };
  }
  resolveSolidSideCollision(prevX, playerX, left, right, halfW) {
    if (!this.enabled) {
      return null;
    }
    const dx = playerX - prevX;
    const sideEpsilon = 0.01;
    if (dx > sideEpsilon && playerX + halfW > left && prevX + halfW <= left) {
      return left - halfW - sideEpsilon;
    }
    if (dx < -sideEpsilon && playerX - halfW < right && prevX - halfW >= right) {
      return right + halfW + sideEpsilon;
    }
    return null;
  }
  shouldBonkUnderSolid() {
    return this.enabled;
  }
  getFacingScaleX(deltaSec, currentScaleX) {
    if (!this.enabled) {
      return 1;
    }
    if (this._facingCurrent === undefined) {
      this._facingCurrent = currentScaleX || 1;
      this._facingFrom = this._facingCurrent;
      this._facingTo = this._facingCurrent;
      this._facingElapsed = this._facingDuration;
    }
    const dir = this.getDirection();
    const desiredTarget = dir === 0 ? this._facingTo : dir > 0 ? 1 : -1;
    if (desiredTarget !== this._facingTo) {
      this._facingFrom = this._facingCurrent;
      this._facingTo = desiredTarget;
      this._facingElapsed = 0;
    }
    if (this._facingFrom === this._facingTo) {
      this._facingCurrent = this._facingTo;
      return this._facingCurrent;
    }
    this._facingElapsed = Math.min(this._facingDuration, this._facingElapsed + deltaSec);
    const t = this._facingDuration > 0 ? this._facingElapsed / this._facingDuration : 1;
    this._facingCurrent = this._facingFrom + (this._facingTo - this._facingFrom) * t;
    return this._facingCurrent;
  }
  shouldUseGroundParticles(onGround) {
    if (!this.enabled) {
      return onGround;
    }
    return onGround && Math.abs(this._horizontalVelocity) > 0.08;
  }
  shouldUseShipGroundDrag(onGround, onCeiling) {
    if (!onGround || onCeiling) {
      return false;
    }
    if (!this.enabled) {
      return true;
    }
    return Math.abs(this._horizontalVelocity) > 0.08;
  }
}
