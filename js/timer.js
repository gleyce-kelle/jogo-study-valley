const Timer = {
    intervalId: null,
    timeRemaining: 0,
    totalDuration: 0,
    isStudying: true,
    
    start: function(minutes, onTick, onComplete) {
        this.stop(); // Garante que não há múltiplos timers
        this.totalDuration = minutes * 60;
        this.timeRemaining = this.totalDuration;
        
        onTick(this.timeRemaining); // Atualiza UI inicial

        this.intervalId = setInterval(() => {
            this.timeRemaining--;
            onTick(this.timeRemaining);

            if (this.timeRemaining <= 0) {
                this.stop();
                onComplete();
            }
        }, 1000); // 1 segundo
    },

    stop: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    formatTime: function(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
};