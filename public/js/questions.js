// DOS LAXMI - Quiz & Interactive Questions Controller

function playCuteChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {}
}

function initQuiz(questions = []) {
  const container = document.getElementById('quiz-container');
  if (!container || !questions || questions.length === 0) return;

  let currentQuestionIdx = 0;
  const total = questions.length;

  function renderCurrent() {
    const q = questions[currentQuestionIdx];
    const progressPct = Math.round(((currentQuestionIdx) / total) * 100);

    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-meter-wrapper">
          <div class="quiz-meter-labels">
            <span>Love & Compatibility Meter</span>
            <strong>${progressPct}%</strong>
          </div>
          <div class="quiz-progress-track">
            <div class="quiz-progress-bar" style="width: ${progressPct}%;"></div>
          </div>
        </div>

        <div class="quiz-prompt-box">
          <span class="quiz-number-tag">Question ${currentQuestionIdx + 1} of ${total}</span>
          <h3 class="quiz-question-text">${q.question}</h3>
        </div>

        <div class="quiz-options-grid">
          ${q.options.map((opt, optIdx) => `
            <button class="quiz-option-btn" data-opt="${optIdx}">
              <span class="quiz-opt-marker">${String.fromCharCode(65 + optIdx)}</span>
              <span>${opt.text}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback Overlay -->
        <div class="quiz-reply-overlay" id="quiz-reply-overlay">
          <div class="quiz-reply-box">
            <div class="quiz-reply-icon">💖</div>
            <p class="quiz-reply-text" id="quiz-reply-text"></p>
            <button class="btn-primary" id="quiz-reply-next-btn">
              ${currentQuestionIdx + 1 < total ? 'Next Question ✨' : 'See Final Score 🏆'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Hook up option buttons
    const overlay = container.querySelector('#quiz-reply-overlay');
    const replyText = container.querySelector('#quiz-reply-text');
    const nextBtn = container.querySelector('#quiz-reply-next-btn');

    container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIdx = parseInt(btn.getAttribute('data-opt'), 10);
        const opt = q.options[optIdx];

        playCuteChime();
        if (window.triggerConfetti) window.triggerConfetti();

        replyText.textContent = opt.response || "Aww! You're the absolute sweetest! ❤️";
        overlay.classList.add('active');

        // Update progress bar
        const updatedPct = Math.round(((currentQuestionIdx + 1) / total) * 100);
        const bar = container.querySelector('.quiz-progress-bar');
        const strong = container.querySelector('.quiz-meter-labels strong');
        if (bar) bar.style.width = `${updatedPct}%`;
        if (strong) strong.textContent = `${updatedPct}%`;
      });
    });

    nextBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      if (currentQuestionIdx + 1 < total) {
        currentQuestionIdx++;
        renderCurrent();
      } else {
        renderQuizComplete();
      }
    });
  }

  function renderQuizComplete() {
    container.innerHTML = `
      <div class="quiz-card text-center" style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">👑</div>
        <span class="quiz-number-tag">Quiz Completed!</span>
        <h3 class="quiz-question-text" style="margin-bottom: 1rem;">
          Compatibility Result: <span style="color: var(--color-primary);">10,000% Eternal Match</span>
        </h3>
        <p style="color: var(--color-text-muted); font-size: 1.15rem; max-width: 500px; margin: 0 auto 2.5rem auto; line-height: 1.6;">
          Science and destiny have confirmed: There is nobody else in this universe made for each other like Laxmi & Aryan. ❤️
        </p>
        <button class="btn-primary" id="quiz-replay-btn">Play Again ↺</button>
      </div>
    `;

    playCuteChime();
    if (window.triggerConfetti) window.triggerConfetti();

    container.querySelector('#quiz-replay-btn').addEventListener('click', () => {
      currentQuestionIdx = 0;
      renderCurrent();
    });
  }

  // Initial render
  renderCurrent();
}

window.initQuiz = initQuiz;
