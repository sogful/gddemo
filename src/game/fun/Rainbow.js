class TasteTheRainbow {

  /*//////////////////////////////////////////////////////////////////////*/
  static RainbowEnabled = false;
  /*//////////////////////////////////////////////////////////////////////*/
  
  constructor() {
    this.enabled = TasteTheRainbow.RainbowEnabled;
    this._t = 0;
    this._periodSeconds = 5;
  }
  _hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = v;
    let g = t;
    let b = p;
    switch (i % 6) {
      case 0:
        r = v; g = t; b = p;
        break;
      case 1:
        r = q; g = v; b = p;
        break;
      case 2:
        r = p; g = v; b = t;
        break;
      case 3:
        r = p; g = q; b = v;
        break;
      case 4:
        r = t; g = p; b = v;
        break;
      case 5:
        r = v; g = p; b = q;
        break;
    }
    return Phaser.Display.Color.GetColor(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  }
  apply(scene, deltaSec) {
    if (!this.enabled) {
      return;
    }
    this._t += deltaSec;
    const hue = (this._t % this._periodSeconds) / this._periodSeconds;
    const tint = this._hsvToRgb(hue, 1, 1);
    const applyTint = obj => {
      if (!obj) {
        return;
      }
      const isAttemptLabel = obj === scene._attemptsLabel;
      const isTextLike = obj.type === "Text" || obj.type === "BitmapText";
      if (!isAttemptLabel && !isTextLike && obj.setTint) {
        obj.setTint(tint);
      }
      if (obj.list) {
        for (let i = 0; i < obj.list.length; i++) {
          applyTint(obj.list[i]);
        }
      }
    };
    applyTint(scene._level && scene._level.container);
    applyTint(scene._level && scene._level.additiveContainer);
    applyTint(scene._level && scene._level.topContainer);
  }
}
