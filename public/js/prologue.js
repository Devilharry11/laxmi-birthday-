// DOS LAXMI - Cinematic Movie Prologue Controller

function initPrologue() {
  const overlay = document.getElementById('prologue-overlay');
  const enterBtn = document.getElementById('btn-enter-film');
  if (!overlay || !enterBtn) return;

  enterBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');

    // Trigger audio play on clean user click
    if (window.ambientAudio) {
      window.ambientAudio.play();
    }

    if (window.playCuteChime) window.playCuteChime();
    if (window.triggerConfetti) window.triggerConfetti();

    setTimeout(() => {
      overlay.style.display = 'none';
    }, 1000);
  });
}

window.initPrologue = initPrologue;
