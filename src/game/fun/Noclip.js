class Noclip {
  
  /*//////////////////////////////////////////////////////////////////////*/
  static NoclipEnabled = true;
  /*//////////////////////////////////////////////////////////////////////*/

  constructor(physicsState) {
    this.p = physicsState;
    this.enabled = Noclip.NoclipEnabled;
    this._boundPlayer = null;
  }
  bindPlayer(player) {
    if (!this.enabled || !player || this._boundPlayer === player) {
      return;
    }
    this._boundPlayer = player;
    player.killPlayer = () => {};
  }
  apply() {
    this.p.noclipEnabled = this.enabled;
    if (this.enabled) {
      this.p.isDead = false;
    }
  }
}
