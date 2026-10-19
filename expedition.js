/* Scroll is the only animation clock: no autoplay loop or animation dependency. */
(() => {
  'use strict';
  const stops = [
  [
    "2000s",
    "Machines + repair",
    "2000s / tech foundations",
    "Early technology work developed a practical instinct for systems, access, and making tools behave."
  ],
  [
    "2014–2017",
    "Sound + people",
    "2014–2017 / multimedia practice",
    "Audio engineering, performance, post-production, and teaching made communication feel physical, social, and alive."
  ],
  [
    "2017–2019",
    "Creative code",
    "2017–2019 / media + systems",
    "Immersive media, AR/VR experimentation, and AI product operations opened a bigger question about how technology changes human interactions."
  ],
  [
    "2020–2024",
    "Making in public",
    "2020–2024 / making in public",
    "Books, podcasts, oracle cards, livestreams, exhibitions, and mentoring turned process itself into material worth sharing."
  ],
  [
    "NOW",
    "Signals between us",
    "2025 → now / research in progress",
    "In Psychology, Media & Technology at Fielding University: building a careful research practice around mediated communication, expression, and listener inference."
  ],
  [
    "FUTURE",
    "An open horizon",
    "Future / a direction to explore",
    "Exploring how observable behavior and careful evidence can inform questions about human–AI communication. A direction for future work, not a completed milestone."
  ]
];
  const positions = [0, .23, .46, .70, .87, 1];
  const modes = ['car', 'boat', 'plane', 'rocket'];
  const labels = ['BY ROAD / THE FOUNDATIONS', 'BY SEA / CROSSING DISCIPLINES', 'BY AIR / MAKING IN PUBLIC', 'IN ORBIT / THE HUMAN SIGNAL'];
  const icons = ['tools', 'sound', 'code', 'book', 'lens', 'star'];
  const bounds = [0, .32, .60, .82, 1];
  const section = document.querySelector('#expedition-scroll');
  const stage = document.querySelector('#expedition-stage');
  const traveler = document.querySelector('#expedition-traveler');
  const routes = [...document.querySelectorAll('.expedition-route')];
  const explored = [...document.querySelectorAll('.explored-route')];
  const scenes = [...document.querySelectorAll('.landscape-scene')];
  const sprites = [...document.querySelectorAll('.vehicle-sprite')];
  const buttons = [...document.querySelectorAll('.waypoint')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = window.matchMedia('(max-height: 600px)');
  const motionToggle = document.querySelector('#journey-motion');
  let still = reduceMotion.matches, progress = 0, active = -1, frame = 0, previousZone = -1;
  const lengths = routes.map(path => path.getTotalLength());
  explored.forEach((path, i) => { path.style.strokeDasharray = String(lengths[i]); path.style.strokeDashoffset = String(lengths[i]); });
  document.documentElement.classList.add('journey-enhanced');
  const clamp = n => Math.min(1, Math.max(0, n));
  function setStory(index) {
    if (index === active) return;
    active = index;
    const item = stops[index];
    document.querySelector('#expedition-date').textContent = item[0];
    document.querySelector('#expedition-title').textContent = item[1];
    document.querySelector('#expedition-copy').textContent = item[3];
    document.querySelector('#expedition-status').textContent = index === 5 ? 'A future direction, still unfolding' : 'A stop along the way';
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    document.querySelector('#discovery-badge use').setAttribute('href', '#discovery-' + icons[index]);
  }
  function render(p) {
    progress = clamp(p);
    const zone = progress < .32 ? 0 : progress < .60 ? 1 : progress < .82 ? 2 : 3;
    const local = clamp((progress - bounds[zone]) / (bounds[zone + 1] - bounds[zone]));
    const path = routes[zone], length = lengths[zone], point = path.getPointAtLength(local * length);
    const before = path.getPointAtLength(Math.max(0, local * length - 2));
    const after = path.getPointAtLength(Math.min(length, local * length + 2));
    let angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    if (zone === 0) angle = Math.max(-35, Math.min(35, angle));
    if (zone === 1) angle = 0;
    traveler.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
    sprites.forEach((sprite, i) => {
      sprite.setAttribute('opacity', String(i === zone ? 1 : 0));
      if (zone !== previousZone) sprite.classList.toggle('arriving', i === zone && previousZone !== -1 && !still);
    });
    previousZone = zone;
    scenes.forEach((scene, i) => {
      let opacity = i === zone ? 1 : 0;
      if (zone > 0 && local < .10) opacity = i === zone ? local / .10 : i === zone - 1 ? 1 - local / .10 : 0;
      scene.setAttribute('opacity', String(opacity));
      explored[i].style.strokeDashoffset = String(lengths[i] * (i < zone ? 0 : i === zone ? 1 - local : 1));
    });
    stage.dataset.mode = modes[zone];
    document.querySelector('#terrain-label').textContent = labels[zone];
    document.querySelector('.expedition-progress span').style.transform = `scaleX(${progress})`;
    const index = positions.reduce((best, stop, i) => Math.abs(stop - progress) < Math.abs(positions[best] - progress) ? i : best, 0);
    setStory(index);
    document.querySelector('#discovery-badge').setAttribute('transform', `translate(${Math.max(70,Math.min(930,point.x + (point.y < 130 ? 110 : 0)))} ${Math.max(55, point.y-110)})`);
  }
  function scrollProgress() {
    frame = 0;
    if (still || shortScreen.matches) return;
    const rect = section.getBoundingClientRect();
    const distance = section.offsetHeight - stage.offsetHeight;
    render(distance > 0 ? (50 - rect.top) / distance : 0);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(scrollProgress); };
  function selectStop(index) {
    const p = positions[index];
    render(p);
    if (!still && !shortScreen.matches) {
      const top = section.getBoundingClientRect().top + window.scrollY - 50;
      window.scrollTo({ top: top + p * (section.offsetHeight - stage.offsetHeight), behavior:'instant' });
    }
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectStop(index));
    button.addEventListener('pointerenter', () => stage.classList.add('discovering'));
    button.addEventListener('pointerleave', () => stage.classList.remove('discovering'));
    button.addEventListener('focus', () => stage.classList.add('discovering'));
    button.addEventListener('blur', () => stage.classList.remove('discovering'));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next !== undefined) { event.preventDefault(); selectStop(next); buttons[next].focus({preventScroll:true}); }
    });
  });
  function applyMotionPreference() {
    document.documentElement.classList.toggle('journey-still', still);
    motionToggle.setAttribute('aria-pressed', String(still));
    motionToggle.textContent = still ? 'Use scroll journey' : 'Use still view';
    render(progress);
  }
  motionToggle.addEventListener('click', () => {
    const wasAtStage = section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 50;
    still = !still;
    applyMotionPreference();
    if (wasAtStage) {
      const top = section.getBoundingClientRect().top + window.scrollY - 50;
      window.scrollTo({top:Math.max(0,top + (still ? 0 : progress * (section.offsetHeight-stage.offsetHeight))),behavior:'instant'});
    }
  });
  reduceMotion.addEventListener('change', () => { still = reduceMotion.matches; applyMotionPreference(); schedule(); });
  shortScreen.addEventListener('change', schedule);
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  applyMotionPreference();
  scrollProgress();
})();
