var soundAudio;

function setupAudio() {
    // background music
    const musicAudio = new Howl({
    src: ['./resources/space.mp3'],
    
    autoplay: true,
    loop: true,
    
  });

  const musicId = musicAudio.play();
  musicAudio.fade(0, 1, 2000, musicId);

  // sound effects
  // (8 sounds for bonus collection + 1 "crash" sound, each 1 second)
  const sounds = {};

  for (let i = 0; i <= 7; i++) {
    sounds[`bonus-${i}`] = [i * 1000, 1000];
  }

  sounds.crash = [8000, 1000];
  soundAudio = new Howl({
    src: ['./resources/sounds.mp3'],
    volume: 1.0,
    sprite: sounds,
  });
}