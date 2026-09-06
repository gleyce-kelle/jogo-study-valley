const Timer = {
    interval: null,
    endTime: 0,
    totalDuration: 0,
    timeRemaining: 0,
    isPaused: false,
    
    onTickCallback: null,
    onCompleteCallback: null,

    start: function(minutes, onTick, onComplete) {
        this.stop();
        this.totalDuration = minutes * 60;
        this.timeRemaining = this.totalDuration;
        this.endTime = Date.now() + (this.timeRemaining * 1000);
        this.isPaused = false;
        
        this.onTickCallback = onTick;
        this.onCompleteCallback = onComplete;
        
        this.resume();
    },

    pause: function() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isPaused = true;
            const remainingMs = this.endTime - Date.now();
            this.timeRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
        }
    },

    resume: function() {
        if (this.timeRemaining > 0) {
            this.isPaused = false;
            this.endTime = Date.now() + (this.timeRemaining * 1000);
            if (this.onTickCallback) this.onTickCallback(this.timeRemaining);
            this.interval = setInterval(() => this.tick(), 250);
        }
    },

    tick: function() {
        const remainingMs = this.endTime - Date.now();
        this.timeRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
        
        if (this.onTickCallback) {
            this.onTickCallback(this.timeRemaining);
        }

        if (this.timeRemaining <= 0) {
            this.stop();
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
        }
    },

    stop: function() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isPaused = false;
    },

    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};