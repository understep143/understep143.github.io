(() => {
  const ORDER = ['screen-splash', 'screen-1', 'screen-2', 'screen-3', 'screen-4', 'screen-5', 'screen-final'];
  const dots = Array.from(document.querySelectorAll('.dot'));
  const backBtn = document.getElementById('backBtn');

  // ---------- notify: Telegram summary via secure proxy ----------
  const NOTIFY_URL = 'https://loveway-notify.andreystepanyuk06.workers.dev';
  const NOTIFY_SECRET = 'b46b539e7d1cd5aab84ee03f78d0cb4a';

  const GREETING_LABELS = { hug: 'Обнять', handshake: 'Пожать руку', ignore: 'Сделать вид, что не заметили' };
  const DEST_LABELS = { pcclub: '🎮 ПК-клуб', park: '🌳 Парк и озеро', taksofon: '☎️ Taksofon Coffee', nomadbrew: '🏔️ Nomad Brew', photosession: '📸 Фотосессия' };

  const questData = { greeting: null, likedTopics: [], destinations: [], dayPhase: null };

  function sendQuestNotification() {
    if (!NOTIFY_URL.startsWith('http') || NOTIFY_URL.includes('YOUR-WORKER-NAME')) return;
    fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: NOTIFY_SECRET, ...questData })
    }).catch(() => { /* she's not obligated to have perfect wifi */ });
  }

  function updateProgress(id) {
    const idx = ORDER.indexOf(id); // 0 = splash, 1..5 = levels, 6 = final
    dots.forEach((dot, i) => {
      dot.classList.remove('current', 'done');
      const level = i + 1;
      if (level < idx) dot.classList.add('done');
      else if (level === idx) dot.classList.add('current');
    });
  }

  function goTo(id) {
    const current = document.querySelector('.screen.active');
    const next = document.getElementById(id);
    if (!next || current === next) return;

    if (current) {
      current.classList.remove('active', 'enter');
      current.classList.add('exit');
      setTimeout(() => {
        current.classList.remove('exit');
        current.style.display = 'none';
      }, 350);
    }

    next.style.display = 'flex';
    void next.offsetWidth;
    next.classList.add('active', 'enter');
    setTimeout(() => next.classList.remove('enter'), 500);

    window.scrollTo({ top: 0, behavior: 'auto' });
    updateProgress(id);
    backBtn.classList.toggle('hidden', id === 'screen-splash');
  }

  backBtn.addEventListener('click', () => {
    const current = document.querySelector('.screen.active');
    const idx = ORDER.indexOf(current.id);
    if (idx > 0) goTo(ORDER[idx - 1]);
  });

  // ---------- countdown ----------
  const target = new Date('2026-08-31T00:00:00');
  function tickCountdown() {
    const now = new Date();
    let diff = target - now;
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const dd = String(days).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    document.getElementById('cd-days').textContent = dd;
    document.getElementById('cd-hours').textContent = hh;
    document.getElementById('cd-mins').textContent = mm;
    document.getElementById('bcd-days').textContent = dd;
    document.getElementById('bcd-hours').textContent = hh;
    document.getElementById('bcd-mins').textContent = mm;
  }
  tickCountdown();
  setInterval(tickCountdown, 1000 * 30);

  // ---------- splash: dodge cancel / grow accept ----------
  const acceptBtn = document.getElementById('acceptBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  const dodgeTexts = ['Отменить', 'Э, куда?!', 'Ладно, сдаюсь'];
  const dodgeClasses = [null, 'dodge-right', 'dodge-left'];
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  function dodge(e) {
    if (attempts >= MAX_ATTEMPTS) return;
    e.preventDefault();
    attempts++;

    cancelBtn.classList.remove('dodge-right', 'dodge-left');
    if (dodgeClasses[attempts]) cancelBtn.classList.add(dodgeClasses[attempts]);
    cancelBtn.textContent = dodgeTexts[Math.min(attempts, dodgeTexts.length - 1)];

    if (attempts >= MAX_ATTEMPTS) {
      setTimeout(() => {
        cancelBtn.classList.add('gone');
        acceptBtn.classList.add('grown');
        setTimeout(() => { cancelBtn.style.display = 'none'; }, 400);
      }, 250);
    }
  }

  cancelBtn.addEventListener('touchstart', dodge, { passive: false });
  cancelBtn.addEventListener('mouseenter', dodge);
  cancelBtn.addEventListener('click', dodge);

  acceptBtn.addEventListener('click', () => goTo('screen-1'));

  // ---------- level 1: hug choices ----------
  const hugReactions = {
    hug: 'Ты серьёзно выбрал(а) обнять? Смело. Отступать поздно — обниматься придётся оба раза: и при встрече, и на прощание.',
    handshake: 'Пожатие руки. Солидно, по-деловому — прямо как подписание важного контракта. Контракт называется «свидание».',
    ignore: 'Тактика «пройти мимо и сделать вид, что мы тут случайно оба оказались». Классика. Работает примерно никогда.'
  };
  const hugChoicesEl = document.getElementById('hugChoices');
  const hugReactionEl = document.getElementById('hugReaction');
  const next1 = document.getElementById('next1');

  hugChoicesEl.addEventListener('click', (e) => {
    const card = e.target.closest('.choice-card');
    if (!card) return;

    Array.from(hugChoicesEl.children).forEach((c) => {
      c.classList.remove('selected');
      c.classList.toggle('dimmed', c !== card);
    });
    card.classList.add('selected');
    questData.greeting = GREETING_LABELS[card.dataset.choice] || card.dataset.choice;

    hugReactionEl.textContent = hugReactions[card.dataset.choice] || '';
    next1.classList.remove('hidden');
  });

  next1.addEventListener('click', () => goTo('screen-2'));

  // ---------- level 2: swipe deck ----------
  const swipeTopics = [
    'Что бы ты сделала, если бы стала президентом на один день?',
    'Пицца с ананасом — норм или стрём?',
    'Кошка или собака?',
    'Какое аниме нужно посмотреть первым?',
    'Самая смешная ошибка ученика',
    'Ум или красота?'
  ];
  const swipeStage = document.getElementById('swipeStage');
  const swipeDeck = document.getElementById('swipeDeck');
  const swipeDone = document.getElementById('swipeDone');
  const swipeProgress = document.getElementById('swipeProgress');
  const swipeControls = document.getElementById('swipeControls');
  const swipeNoBtn = document.getElementById('swipeNoBtn');
  const swipeYesBtn = document.getElementById('swipeYesBtn');
  const flagNo = swipeStage.querySelector('.flag-no');
  const flagYes = swipeStage.querySelector('.flag-yes');
  const next2 = document.getElementById('next2');

  const SWIPE_STACK_VISIBLE = 3;
  const swipeCards = swipeTopics.map((text, i) => {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.textContent = text;
    card.dataset.index = String(i);
    swipeDeck.appendChild(card);
    return card;
  });
  let swipeCurrent = 0;

  function layoutSwipeStack() {
    swipeCards.forEach((card, i) => {
      if (i < swipeCurrent) { card.style.display = 'none'; return; }
      const pos = i - swipeCurrent;
      if (pos >= SWIPE_STACK_VISIBLE) { card.style.display = 'none'; return; }
      card.style.display = 'flex';
      card.classList.remove('dragging');
      card.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      card.style.transform = `translateY(${pos * 10}px) scale(${1 - pos * 0.05})`;
      card.style.opacity = '1';
      card.style.zIndex = String(100 - pos);
      card.style.pointerEvents = pos === 0 ? 'auto' : 'none';
    });
    flagNo.style.opacity = '0';
    flagYes.style.opacity = '0';

    const done = swipeCurrent >= swipeTopics.length;
    swipeProgress.textContent = `${Math.min(swipeCurrent + 1, swipeTopics.length)} / ${swipeTopics.length}`;
    swipeProgress.classList.toggle('hidden', done);
    swipeControls.classList.toggle('hidden', done);
    swipeDone.classList.toggle('hidden', !done);
    if (done) next2.classList.remove('hidden');
  }

  function commitSwipe(direction) {
    if (swipeCurrent >= swipeTopics.length) return;
    const card = swipeCards[swipeCurrent];
    if (direction > 0) questData.likedTopics.push(swipeTopics[swipeCurrent]);
    card.classList.remove('dragging');
    card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    card.style.transform = `translate(${direction * 420}px, -20px) rotate(${direction * 22}deg)`;
    card.style.opacity = '0';
    swipeCurrent++;
    setTimeout(layoutSwipeStack, 80);
  }

  swipeNoBtn.addEventListener('click', () => commitSwipe(-1));
  swipeYesBtn.addEventListener('click', () => commitSwipe(1));

  let dragState = null;
  swipeDeck.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.swipe-card');
    if (!card || Number(card.dataset.index) !== swipeCurrent) return;
    dragState = { card, startX: e.clientX, startY: e.clientY, dx: 0 };
    card.classList.add('dragging');
    card.style.transition = 'none';
    try { card.setPointerCapture(e.pointerId); } catch (err) { /* no active pointer to capture */ }
  });
  swipeDeck.addEventListener('pointermove', (e) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    dragState.dx = dx;
    dragState.card.style.transform = `translate(${dx}px, ${dy * 0.4}px) rotate(${dx / 18}deg)`;
    const ratio = Math.max(-1, Math.min(1, dx / 100));
    flagYes.style.opacity = String(Math.max(0, ratio));
    flagNo.style.opacity = String(Math.max(0, -ratio));
  });
  function endDrag() {
    if (!dragState) return;
    const { dx } = dragState;
    dragState = null;
    if (Math.abs(dx) > 80) {
      commitSwipe(dx > 0 ? 1 : -1);
    } else {
      layoutSwipeStack();
    }
  }
  swipeDeck.addEventListener('pointerup', endDrag);
  swipeDeck.addEventListener('pointercancel', endDrag);
  swipeDeck.addEventListener('pointerleave', () => { if (dragState) endDrag(); });

  layoutSwipeStack();

  next2.addEventListener('click', () => goTo('screen-3'));

  // ---------- level 3: destination cards (multi-select) ----------
  const destScroll = document.getElementById('destScroll');
  const signEl = document.getElementById('signEl');
  const hollywoodCaption = document.getElementById('hollywoodCaption');
  let signTriggered = false;

  destScroll.addEventListener('click', (e) => {
    const card = e.target.closest('.dest-card');
    if (!card) return;
    card.classList.toggle('selected');

    const label = DEST_LABELS[card.dataset.dest] || card.dataset.dest;
    if (card.classList.contains('selected')) {
      if (!questData.destinations.includes(label)) questData.destinations.push(label);
    } else {
      questData.destinations = questData.destinations.filter((d) => d !== label);
    }

    if (card.dataset.dest === 'park' && card.classList.contains('selected') && !signTriggered) {
      signTriggered = true;
      signEl.classList.add('trigger');
      setTimeout(() => hollywoodCaption.classList.remove('hidden'), 700);
    }
  });

  document.getElementById('next3').addEventListener('click', () => goTo('screen-4'));

  // ---------- level 4: day slider ----------
  const daySlider = document.getElementById('daySlider');
  const sky = document.getElementById('sky');
  const sunEl = document.getElementById('sunEl');
  const dayText = document.getElementById('dayText');

  function updateSky(val) {
    let gradient, icon, text, sunTop, phase;
    if (val < 25) {
      gradient = 'linear-gradient(180deg, #8ea6c9 0%, #ffb27a 100%)';
      icon = '🌅';
      text = 'Раннее утро — я как раз доезжаю на вокзал.';
      phase = 'Раннее утро';
      sunTop = 80 - val * 1.2;
    } else if (val < 70) {
      gradient = 'linear-gradient(180deg, #ffd58a 0%, #ff9d3d 100%)';
      icon = '☀️';
      text = 'День в разгаре — самое время для квеста.';
      phase = 'День в разгаре';
      sunTop = 30;
    } else if (val < 90) {
      gradient = 'linear-gradient(180deg, #ff9d6a 0%, #b5507a 100%)';
      icon = '🌇';
      text = 'Закат. Город становится особенно киношным.';
      phase = 'Закат';
      sunTop = 40 + (val - 70) * 2;
    } else {
      gradient = 'linear-gradient(180deg, #2c2a4a 0%, #16213a 100%)';
      icon = '🌆';
      text = 'Фонари зажглись. Такси уже думает о тебе (см. уровень 5).';
      phase = 'Городские фонари зажглись';
      sunTop = 90;
    }
    sky.style.background = gradient;
    sunEl.textContent = icon;
    sunEl.style.left = val + '%';
    sunEl.style.top = sunTop + '%';
    dayText.textContent = text;
    questData.dayPhase = `${icon} ${phase}`;
  }

  daySlider.addEventListener('input', () => updateSky(Number(daySlider.value)));
  updateSky(Number(daySlider.value));

  document.getElementById('next4').addEventListener('click', () => goTo('screen-5'));

  document.getElementById('next5').addEventListener('click', () => goTo('screen-final'));

  // ---------- final: confetti ----------
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#ffd166', '#ff9d3d', '#8fc45f', '#f6efdc', '#5b8c3e'];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.5,
      size: 4 + Math.random() * 5,
      speedY: 1.5 + Math.random() * 2.5,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    const start = performance.now();
    const duration = 4200;

    function frame(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }
    requestAnimationFrame(frame);
  }

  const finalScreen = document.getElementById('screen-final');
  let confettiFired = false;
  const observer = new MutationObserver(() => {
    if (finalScreen.classList.contains('active') && !confettiFired) {
      confettiFired = true;
      setTimeout(launchConfetti, 150);
      sendQuestNotification();
    }
  });
  observer.observe(finalScreen, { attributes: true, attributeFilter: ['class'] });

  updateProgress('screen-splash');
})();
