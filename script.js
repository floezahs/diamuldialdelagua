// ── CURSOR ──
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .drag-item, .quiz-opt, .mem-card, .game-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur.style.transform = 'translate(-50%,-50%) scale(1.8)';
    ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
    ring.style.borderColor = 'var(--accent)';
  });
  el.addEventListener('mouseleave', () => {
    cur.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.borderColor = 'var(--wave)';
  });
});

// ── BUBBLES ──
const bubblesCont = document.getElementById('bubbles');
for (let i = 0; i < 18; i++) {
  const b = document.createElement('div');
  b.className = 'bubble';
  const s = 20 + Math.random() * 80;
  b.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;animation-duration:${8 + Math.random() * 14}s;animation-delay:${Math.random() * 10}s`;
  bubblesCont.appendChild(b);
}

// ── RIPPLE ──
document.querySelectorAll('.ripple').forEach(el => {
  el.addEventListener('click', e => {
    const r = document.createElement('span');
    r.className = 'ripple-circle';
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    el.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });
});

// ── SCROLL ANIMATIONS ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up, .stagger').forEach(el => observer.observe(el));

// ── COUNTER ANIMATION ──
const counters = document.querySelectorAll('[data-target]');
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const step = target / 60;
      const t = setInterval(() => {
        start += step;
        if (start >= target) {
          el.textContent = target.toLocaleString('es') + suffix;
          clearInterval(t);
        } else {
          el.textContent = Math.round(start).toLocaleString('es') + suffix;
        }
      }, 16);
      cObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => cObs.observe(c));

// ── GAME 1: SORT ──
let dragItem = null;

document.querySelectorAll('.drag-item').forEach(item => {
  item.addEventListener('dragstart', e => {
    dragItem = item;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => item.style.opacity = '0.4', 0);
  });
  item.addEventListener('dragend', () => {
    item.style.opacity = '1';
    dragItem = null;
  });
});

document.querySelectorAll('.drop-zone').forEach(zone => {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (dragItem) {
      const placed = document.createElement('span');
      placed.className = 'placed-item';
      placed.textContent = dragItem.textContent;
      placed.dataset.id = dragItem.id;
      placed.dataset.cat = dragItem.dataset.cat;
      zone.appendChild(placed);
      dragItem.classList.add('placed');
    }
  });
});

function checkSort() {
  const zones = document.querySelectorAll('.drop-zone');
  let correct = 0, total = 0;
  zones.forEach(zone => {
    zone.querySelectorAll('.placed-item').forEach(item => {
      total++;
      if (item.dataset.cat === zone.dataset.cat) correct++;
    });
  });
  const fb = document.getElementById('sortFeedback');
  fb.classList.add('show');
  if (correct === total && total > 0) {
    fb.className = 'game-feedback show win';
    fb.textContent = `Perfecto! ${correct}/${total} correctos. ¡Eres un experto del agua!`;
  } else if (total === 0) {
    fb.className = 'game-feedback show lose';
    fb.textContent = 'Arrastra todos los elementos primero.';
  } else {
    fb.className = 'game-feedback show lose';
    fb.textContent = `${correct}/${total} correctos. ¡Inténtalo de nuevo!`;
  }
}

function resetSort() {
  document.querySelectorAll('.drop-zone').forEach(z => {
    z.querySelectorAll('.placed-item').forEach(p => p.remove());
    z.className = 'drop-zone';
  });
  document.querySelectorAll('.drag-item').forEach(i => i.classList.remove('placed'));
  const fb = document.getElementById('sortFeedback');
  fb.className = 'game-feedback';
}

// ── GAME 2: QUIZ ──
const questions = [
  {
    q: "¿Cuántos litros de agua usa un grifo goteando por día?",
    opts: ["5 litros", "30 litros", "100 litros", "200 litros"],
    ans: 1,
    exp: "Un grifo goteando puede desperdiciar entre 20-30 litros diarios, lo que suma casi 10.000 litros al año."
  },
  {
    q: "¿Qué porcentaje del agua dulce se usa en agricultura?",
    opts: ["30%", "50%", "70%", "90%"],
    ans: 2,
    exp: "La agricultura consume aproximadamente el 70% del agua dulce extraída a nivel mundial."
  },
  {
    q: "¿Cuántas personas carecen de acceso a agua potable segura?",
    opts: ["500 millones", "1.000 millones", "2.200 millones", "4.000 millones"],
    ans: 2,
    exp: "Según la OMS y UNICEF, 2.200 millones de personas no tienen acceso a agua gestionada de manera segura."
  },
  {
    q: "¿Qué porcentaje del agua en la Tierra es dulce?",
    opts: ["3%", "10%", "25%", "50%"],
    ans: 0,
    exp: "Solo el 3% del agua en la Tierra es dulce, y de ese 3%, apenas el 0.3% es fácilmente accesible."
  },
  {
    q: "¿Cuándo se estableció el Día Mundial del Agua?",
    opts: ["1972", "1985", "1993", "2000"],
    ans: 2,
    exp: "La ONU estableció el Día Mundial del Agua el 22 de marzo de 1993 mediante la resolución A/RES/47/193."
  },
  {
    q: "¿Cuál es el tema del Día Mundial del Agua 2024?",
    opts: ["Agua y cambio climático", "Agua para la Paz", "Agua y naturaleza", "Aguas subterráneas"],
    ans: 1,
    exp: "El tema 2024 es 'Agua para la Paz', destacando cómo el agua puede ser catalizadora de cooperación entre naciones."
  },
  {
    q: "¿Cuántos litros de agua se necesitan para producir 1 kg de carne de res?",
    opts: ["500 L", "2.000 L", "10.000 L", "15.000 L"],
    ans: 3,
    exp: "Se necesitan aproximadamente 15.000 litros de agua para producir 1 kilogramo de carne de res, incluyendo el agua de alimento del animal."
  },
];

let qIdx = 0, score = 0, answered = false;

function loadQuestion() {
  if (qIdx >= questions.length) { showQuizResult(); return; }
  const q = questions[qIdx];
  document.getElementById('questionText').textContent = q.q;
  document.getElementById('qNum').textContent = qIdx + 1;
  document.getElementById('quizBar').style.width = ((qIdx + 1) / questions.length * 100) + '%';
  document.getElementById('quizExplain').className = 'quiz-explain';
  const opts = document.getElementById('quizOptions');
  opts.innerHTML = '';
  q.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'quiz-opt';
    b.textContent = o;
    b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      if (i === q.ans) {
        b.classList.add('correct');
        score++;
        document.getElementById('quizScore').textContent = score;
      } else {
        b.classList.add('wrong');
        opts.querySelectorAll('.quiz-opt')[q.ans].classList.add('correct');
      }
      opts.querySelectorAll('.quiz-opt').forEach(bt => bt.disabled = true);
      const exp = document.getElementById('quizExplain');
      exp.textContent = q.exp;
      exp.className = 'quiz-explain show';
      setTimeout(() => { qIdx++; answered = false; loadQuestion(); }, 2200);
    });
    opts.appendChild(b);
  });
}

function showQuizResult() {
  const body = document.getElementById('quizBody');
  const pct = Math.round(score / questions.length * 100);
  const msg = pct >= 85 ? '¡Experto del Agua!' : pct >= 57 ? '¡Muy bien!' : '¡Sigue aprendiendo!';
  const trophy =
    pct >= 85
      ? `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 4l4 8h9l-7 6 3 9-9-6-9 6 3-9-7-6h9z" fill="rgba(255,209,102,0.4)" stroke="#FFD166" stroke-width="2" stroke-linejoin="round"/></svg>`
      : pct >= 57
      ? `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 8C24 8 10 20 10 30a14 14 0 0 0 28 0C38 20 24 8 24 8z" fill="rgba(0,180,216,0.3)" stroke="#00B4D8" stroke-width="2"/></svg>`
      : `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="10" y="8" width="28" height="36" rx="3" stroke="#00B4D8" stroke-width="2" fill="rgba(0,180,216,0.1)"/><path d="M17 20h14M17 27h10M17 34h7" stroke="#00F5D4" stroke-width="2" stroke-linecap="round"/></svg>`;
  body.innerHTML = `<div style="text-align:center;padding:1rem 0">
    <div style="margin-bottom:0.5rem;display:flex;justify-content:center">${trophy}</div>
    <p style="font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--wave);font-weight:700;margin-bottom:0.3rem">${score}/${questions.length}</p>
    <p style="font-size:0.85rem;color:rgba(202,240,248,0.6);margin-bottom:1.5rem">${msg}</p>
    <button class="game-btn" onclick="qIdx=0;score=0;answered=false;document.getElementById('quizBody').innerHTML='';initQuiz()">Jugar de nuevo</button>
  </div>`;
}

function initQuiz() {
  document.getElementById('quizBody').innerHTML = `
    <div class="quiz-progress">
      <span class="quiz-score">Puntaje: <span id="quizScore">0</span></span>
      <span class="quiz-num">Pregunta <span id="qNum">1</span>/7</span>
    </div>
    <div class="quiz-bar"><div class="quiz-bar-fill" id="quizBar" style="width:14%"></div></div>
    <div class="question" id="questionText"></div>
    <div class="quiz-options" id="quizOptions"></div>
    <div class="quiz-explain" id="quizExplain"></div>`;
  loadQuestion();
}

initQuiz();

// ── GAME 3: MEMORY ──
const memSvgs = [
  {
    id: 'gota', label: 'Gota',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4C20 4 8 16 8 24a12 12 0 0 0 24 0C32 16 20 4 20 4z" fill="rgba(0,180,216,0.25)" stroke="#00B4D8" stroke-width="2"/><path d="M14 24c0-3 3-7 6-9" stroke="#90E0EF" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 'ola', label: 'Ola',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 22c3-5 6-5 9 0s6 5 9 0 6-5 9 0" stroke="#00B4D8" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M4 28c3-5 6-5 9 0s6 5 9 0 6-5 9 0" stroke="#00F5D4" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/></svg>`
  },
  {
    id: 'pez', label: 'Pez',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="20" rx="10" ry="7" fill="rgba(0,180,216,0.2)" stroke="#00B4D8" stroke-width="2"/><path d="M28 20l6-6v12z" fill="rgba(0,180,216,0.3)" stroke="#00B4D8" stroke-width="1.5" stroke-linejoin="round"/><circle cx="13" cy="18" r="1.5" fill="#00F5D4"/></svg>`
  },
  {
    id: 'planta', label: 'Planta',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 34V18" stroke="#06D6A0" stroke-width="2" stroke-linecap="round"/><path d="M20 24c-4-4-10-4-12-2 2 6 8 6 12 2z" fill="rgba(6,214,160,0.2)" stroke="#06D6A0" stroke-width="1.8"/><path d="M20 20c4-6 10-5 11-3-2 5-8 5-11 3z" fill="rgba(6,214,160,0.2)" stroke="#06D6A0" stroke-width="1.8"/></svg>`
  },
  {
    id: 'nube', label: 'Nube',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 24a6 6 0 0 1 0-12c1 0 2 .3 3 .8a7 7 0 0 1 13 2.2H28a5 5 0 0 1 0 10H10z" fill="rgba(144,224,239,0.2)" stroke="#90E0EF" stroke-width="1.8"/><path d="M14 28l-1 4M20 28v4M26 28l1 4" stroke="#00B4D8" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 'rana', label: 'Rana',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="24" rx="11" ry="8" fill="rgba(6,214,160,0.2)" stroke="#06D6A0" stroke-width="1.8"/><circle cx="14" cy="17" r="3" fill="rgba(6,214,160,0.15)" stroke="#06D6A0" stroke-width="1.5"/><circle cx="26" cy="17" r="3" fill="rgba(6,214,160,0.15)" stroke="#06D6A0" stroke-width="1.5"/><circle cx="14" cy="17" r="1.2" fill="#06D6A0"/><circle cx="26" cy="17" r="1.2" fill="#06D6A0"/><path d="M16 26c1.3 1.5 6.7 1.5 8 0" stroke="#06D6A0" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 'grifo', label: 'Grifo',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="12" width="16" height="8" rx="2" fill="rgba(0,180,216,0.2)" stroke="#00B4D8" stroke-width="1.8"/><rect x="17" y="20" width="6" height="5" fill="rgba(0,180,216,0.15)" stroke="#00B4D8" stroke-width="1.5"/><path d="M20 25v3" stroke="#00B4D8" stroke-width="1.5" stroke-linecap="round"/><path d="M18 30c0 0 .5 2 2 2s2-2 2-2" stroke="#90E0EF" stroke-width="1.5" stroke-linecap="round"/><path d="M16 14v-4h8" stroke="#00B4D8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'tierra', label: 'Tierra',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="14" fill="rgba(0,119,182,0.15)" stroke="#0077B6" stroke-width="1.8"/><path d="M8 18c2-1 4 0 5-2s3-3 5-2 4 2 6 1 4-2 5-1" stroke="#00B4D8" stroke-width="1.4" stroke-linecap="round" fill="none"/><ellipse cx="16" cy="22" rx="4" ry="3" fill="rgba(6,214,160,0.25)" stroke="#06D6A0" stroke-width="1.3"/><ellipse cx="26" cy="24" rx="3" ry="2" fill="rgba(6,214,160,0.2)" stroke="#06D6A0" stroke-width="1.3"/></svg>`
  },
];

let memCards = [], memFlipped = [], memMatched = 0, memMoves = 0, memLocked = false;

function initMemory() {
  const grid = document.getElementById('memGrid');
  grid.innerHTML = '';
  document.getElementById('memFeedback').className = 'game-feedback';
  memFlipped = []; memMatched = 0; memMoves = 0; memLocked = false;
  document.getElementById('memMoves').textContent = '0';
  document.getElementById('memPairs').textContent = '0';
  const deck = [...memSvgs, ...memSvgs].sort(() => Math.random() - 0.5);
  memCards = deck.map((card, i) => {
    const el = document.createElement('div');
    el.className = 'mem-card';
    el.innerHTML = `<div class="mem-inner">
      <div class="mem-front">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6C20 6 10 16 10 24a10 10 0 0 0 20 0C30 16 20 6 20 6z" fill="rgba(0,180,216,0.15)" stroke="rgba(0,180,216,0.4)" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="mem-back">${card.svg}</div>
    </div>`;
    el.dataset.id = card.id;
    el.dataset.idx = i;
    el.addEventListener('click', () => flipCard(el));
    grid.appendChild(el);
    return el;
  });
}

function flipCard(card) {
  if (memLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  memFlipped.push(card);
  if (memFlipped.length === 2) {
    memMoves++;
    document.getElementById('memMoves').textContent = memMoves;
    memLocked = true;
    if (memFlipped[0].dataset.id === memFlipped[1].dataset.id) {
      memFlipped[0].classList.add('matched');
      memFlipped[1].classList.add('matched');
      memMatched++;
      document.getElementById('memPairs').textContent = memMatched;
      memFlipped = [];
      memLocked = false;
      if (memMatched === 8) {
        const fb = document.getElementById('memFeedback');
        fb.className = 'game-feedback show win';
        fb.textContent = `Completado en ${memMoves} movimientos. ¡Excelente memoria!`;
      }
    } else {
      setTimeout(() => {
        memFlipped[0].classList.remove('flipped');
        memFlipped[1].classList.remove('flipped');
        memFlipped = [];
        memLocked = false;
      }, 800);
    }
  }
}

initMemory();
