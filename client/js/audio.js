/**
 * Audio manager for the game
 */

class AudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundSound = null;
    this.volume = 0.5;
    this.muted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    // Create sound objects
    this.sounds = {
      background: new Audio('/client/audio/nature_ambient.mp3'),
      bump: new Audio('/client/audio/bump.mp3')
    };

    // Configure background sound
    this.backgroundSound = this.sounds.background;
    this.backgroundSound.loop = true;
    this.backgroundSound.volume = this.volume * 0.3; // Background sound slightly quieter
    
    // Configure effect sounds
    this.sounds.bump.volume = this.volume * 0.7;
    
    this.initialized = true;
  }

  playBackground() {
    if (!this.initialized) this.init();
    
    // Only try to play if not muted
    if (this.muted) return;
    
    // Some browsers block autoplay, so we use this pattern
    const playPromise = this.backgroundSound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Background audio playback prevented. Click to enable audio.');
        
        // Add a click handler to start audio
        const clickHandler = () => {
          this.backgroundSound.play()
            .then(() => {
              console.log('Background audio enabled by user interaction');
            })
            .catch(e => {
              console.error('Failed to play background audio:', e);
            });
          document.removeEventListener('click', clickHandler);
        };
        
        document.addEventListener('click', clickHandler);
      });
    }
  }
  
  playSound(name) {
    if (!this.initialized) this.init();
    if (this.muted) return;
    
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound "${name}" not found`);
      return;
    }
    
    // Clone and play sound to allow overlapping sounds
    if (name !== 'background') {
      try {
        const soundClone = sound.cloneNode();
        soundClone.volume = sound.volume;
        soundClone.play().catch(e => {
          console.log(`Failed to play ${name} sound:`, e);
        });
      } catch(e) {
        console.log(`Error playing ${name} sound:`, e);
      }
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update all sound volumes
    Object.values(this.sounds).forEach(sound => {
      if (sound === this.backgroundSound) {
        sound.volume = this.volume * 0.3;
      } else {
        sound.volume = this.volume * 0.7;
      }
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    
    if (this.muted) {
      this.backgroundSound.pause();
    } else {
      this.backgroundSound.play().catch(e => {
        console.log('Failed to unmute background audio:', e);
      });
    }
    
    return this.muted;
  }
}

export const audioManager = new AudioManager();
