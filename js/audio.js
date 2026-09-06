const AudioFX = {
    ctx: null,
    
    init: function() {
        if (!this.ctx) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    },

    playTone: function(freq, type, duration, volConfig) {
        if (!Game.state.settings.soundEnabled) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        const volume = Game.state.settings.volume * volConfig;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    click: function() { this.playTone(400, 'square', 0.1, 0.5); },
    start: function() { this.playTone(600, 'sine', 0.3, 0.5); },
    finish: function() {
        this.playTone(400, 'square', 0.1, 0.5);
        setTimeout(() => this.playTone(600, 'square', 0.2, 0.5), 100);
        setTimeout(() => this.playTone(800, 'square', 0.4, 0.5), 300);
    },
    coin: function() { this.playTone(1200, 'sine', 0.3, 0.3); },
    levelUp: function() {
        [300, 400, 500, 600, 800].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'square', 0.15, 0.4), i * 100);
        });
    }
};