// DOS LAXMI - Birthday Letter Controller

function playSealCrackSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'triangle';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
}

function initLetter(letterData = {}) {
  const container = document.getElementById('letter-container');
  if (!container) return;

  const defaultBody = `Happy Birthday, cutuu!

Looking at our pictures, from your goofy "sharmeeli" winks to the way your eyes shine when you smile wearing those jhumkas, I am reminded of how deeply lucky I am to have you in my life.

You bring a warmth into my world that nothing else can match. Your laughter turns ordinary days into memories I want to replay forever. Even when things get busy or crazy, just one thought of you brings peace to my heart.

On your special day, my only wish for you is that you experience as much happiness, peace, and pure joy as you give to everyone around you. Keep dreaming big, keep shining with your fearless spirit, and never stop being the wonderfully kind and cutuu soul that you are.

No matter where life takes us, remember that you will always have someone in your corner, believing in you, cheering for you, and loving you endlessly.

Happy Birthday, Laxmi. Here is to another year of us making unforgettable stories.`;

  const salutation = letterData.salutation || "My Dearest Laxmi,";
  const bodyText = letterData.body || defaultBody;
  const closing = letterData.closing || "Forever & Always Yours,";
  const signature = letterData.signature || "Aryan";
  const dateText = letterData.date || "October 2026";
  const waxSealText = letterData.waxSealText || "L & A";

  container.innerHTML = `
    <div class="letter-envelope-container">
      <!-- Closed Envelope with Wax Seal -->
      <div class="letter-envelope" id="letter-envelope-closed">
        <div class="wax-seal" id="wax-seal-btn" title="Click to break the seal">
          <div class="wax-seal-inner">
            <span class="wax-seal-text">${waxSealText}</span>
          </div>
        </div>
        <div class="envelope-tag">Strictly Confidential & Sealed With Love</div>
        <h3 class="envelope-recipient">For Laxmi's Eyes Only</h3>
        <span class="envelope-prompt">Break Wax Seal & Read Letter 💌</span>
      </div>

      <!-- Unfolded Parchment Letter -->
      <div class="letter-parchment" id="letter-parchment-open">
        <div class="letter-stamp-corner">
          <span>AIR MAIL</span>
          <strong>OCT 24</strong>
        </div>
        <h3 class="letter-salutation">${salutation}</h3>
        <div class="letter-body">${bodyText}</div>
        <div class="letter-signature-block">
          <p class="letter-closing">${closing}</p>
          <div class="letter-signature">${signature}</div>
          <div class="letter-date-stamp">${dateText}</div>
        </div>
        <button class="btn-secondary letter-close-btn" id="letter-fold-btn">Fold Letter & Seal Again ✉️</button>
      </div>
    </div>
  `;

  const closedEnv = container.querySelector('#letter-envelope-closed');
  const openParch = container.querySelector('#letter-parchment-open');
  const foldBtn = container.querySelector('#letter-fold-btn');

  closedEnv.addEventListener('click', () => {
    playSealCrackSound();
    if (window.triggerConfetti) window.triggerConfetti();

    closedEnv.style.display = 'none';
    openParch.classList.add('open');
    openParch.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  foldBtn.addEventListener('click', () => {
    openParch.classList.remove('open');
    closedEnv.style.display = 'block';
    closedEnv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

window.initLetter = initLetter;
