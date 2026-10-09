const CATEGORIES = [
    "דברים עגולים","דברים שיש במקרר","דברים שיש בתיק בית ספר","דברים שיש בים",
    "דברים שאפשר לשבור","דברים שיש בחדר שינה","דברים שקשורים לחתונה","דברים שיש בקופסת עזרה ראשונה",
    "דברים שיש בגן ילדים","דברים ורודים","דברים שיש במטבח","דברים שיש בבריכה",
    "דברים שצריך סוללות","בעלי חיים עם זנב","דברים מפחידים בלילה","דברים מתוקים",
    "דברים שיש בחדר אמבטיה","דברים שיש במשרד","כלי עבודה בארגז כלים","דברים שקשורים לחורף",
    "דברים שקשורים לקיץ","דברים שעפים באוויר","דברים שיש בארון בגדים","דברים חלקים למגע",
    "דברים שיש ברכב","דברים שיש בפיקניק","דברים שאפשר למצוא בשמיים","מאכלים חריפים",
    "דברים שיש בתחפושת פורים","דברים שיש בגינה","דברים שקשורים ליום הולדת","דברים שיש בתא טייס",
    "דברים שיש בתיק איפור","דברים שיש במחסן","דברים שיש בתא מטען","דברים שיש במסיבה",
    "דברים שיש בקאנטרי קלאב","דברים שיש בארון תרופות","דברים שיש בתיבת דואר","דברים שיש בסטודיו לצילום",
    "דברים שיש בעליית גג","דברים שיש בארון כלים"
  ];

  const state = { mode:'random', category:'', target:4, matched:[], rejected:[], peeking:false };
  let currentScreen = 'screen-home';

  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    currentScreen = id;
    window.scrollTo(0,0);
  }

  function setHeader(visible, slotHtml=''){
    document.getElementById('page-header').style.display = visible ? 'flex' : 'none';
    document.getElementById('header-slot').innerHTML = slotHtml;
    document.getElementById('home-help-btn').style.display = visible ? 'none' : 'flex';
  }
  function helpBtn(){
    return `<button class="header-btn" onclick="openInfo('rules')">
      <iconify-icon icon="mdi:help-circle-outline"></iconify-icon> כללים</button>`;
  }

  function goToSettings(){
    setHeader(true, helpBtn());
    showScreen('screen-settings');
  }

  function goHome(){
    if (!confirm('לחזור לדף הבית? המשחק הנוכחי יאופס.')) return;
    setHeader(false);
    showScreen('screen-home');
  }

  function toggleSettings(){
    document.getElementById('settingsBlock').classList.toggle('open');
    document.getElementById('settingsChevron').classList.toggle('open');
  }
  function toggleGuessPanel(){
    document.getElementById('guessBlock').classList.toggle('open');
    document.getElementById('guessChevron').classList.toggle('open');
  }

  function setCategoryMode(mode){
    state.mode = mode;
    document.getElementById('segRandom').classList.toggle('active', mode==='random');
    document.getElementById('segCustom').classList.toggle('active', mode==='custom');
    document.getElementById('randomBlock').style.display = mode==='random' ? 'block' : 'none';
    document.getElementById('customBlock').style.display = mode==='custom' ? 'block' : 'none';
  }

  function changeTarget(delta){
    state.target = Math.min(6, Math.max(3, state.target + delta));
    document.getElementById('targetCount').textContent = state.target;
  }

  function confirmSetup(){
    if(state.mode === 'custom'){
      const val = document.getElementById('customCatInput').value.trim();
      if(!val){ document.getElementById('customCatInput').focus(); return; }
      state.category = val;
    } else {
      state.category = pickRandom(CATEGORIES);
    }
    document.getElementById('revealCatName').textContent = state.category;
    showScreen('screen-warning');
  }

  function startGame(){
    state.matched = []; state.rejected = []; state.peeking = false;
    document.getElementById('gameCatValue').textContent = state.category;
    document.getElementById('gameCatValue').classList.add('blurred');
    document.getElementById('peekIcon').setAttribute('icon','mdi:eye-outline');
    document.getElementById('targetLabel').textContent = state.target;
    document.getElementById('wordInput').value = '';
    document.getElementById('guessBlock').classList.remove('open');
    document.getElementById('guessChevron').classList.remove('open');
    renderDots(); renderWordList();
    showScreen('screen-game');
    document.getElementById('wordInput').focus();
  }

  function togglePeek(){
    state.peeking = !state.peeking;
    document.getElementById('gameCatValue').classList.toggle('blurred', !state.peeking);
    document.getElementById('peekIcon').setAttribute('icon', state.peeking ? 'mdi:eye-off-outline' : 'mdi:eye-outline');
  }

  function renderDots(){
    const row = document.getElementById('dotsRow');
    row.innerHTML = '';
    for(let i=0;i<state.target;i++){
      const d = document.createElement('div');
      d.className = 'dot' + (i < state.matched.length ? ' filled' : '');
      row.appendChild(d);
    }
    document.getElementById('matchedCount').textContent = state.matched.length;
  }

  function renderWordList(){
    const list = document.getElementById('wordList');
    const all = [...state.matched.map(w=>({w, fit:true})), ...state.rejected.map(w=>({w, fit:false}))];
    if(all.length === 0){
      list.innerHTML = '<div class="empty-note">עוד לא נאמרו מילים בסבב הזה</div>';
      return;
    }
    list.innerHTML = '';
    for(let i = all.length - 1; i >= 0; i--){
      const item = all[i];
      const div = document.createElement('div');
      div.className = 'word-item ' + (item.fit ? 'fit' : 'no-fit');
      div.innerHTML = '<iconify-icon icon="' + (item.fit ? 'mdi:check-circle' : 'mdi:close-circle') + '"></iconify-icon><span>' + escapeHtml(item.w) + '</span>';
      list.appendChild(div);
    }
  }

  function escapeHtml(str){
    return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function submitWord(fits){
    const input = document.getElementById('wordInput');
    const val = input.value.trim();
    if(!val){ input.focus(); return; }
    if(fits){ state.matched.push(val); vibrate([40,20,40]); } else { state.rejected.push(val); vibrate([80,30,80]); }
    input.value = ''; input.focus();
    renderDots(); renderWordList();
    if(state.matched.length >= state.target){ endGame(false); }
  }

  function judgeVerdict(correct){
    if(correct){ endGame(true); }
    else {
      vibrate(30);
      document.getElementById('guessBlock').classList.remove('open');
      document.getElementById('guessChevron').classList.remove('open');
    }
  }

  function endGame(guessersWon){
    setHeader(true, helpBtn());
    document.getElementById('endCatName').textContent = state.category;
    const screen = document.getElementById('screen-end');
    const icon = document.getElementById('endIcon');

    if(guessersWon){
      screen.className = 'screen has-header guessers-win';
      document.getElementById('endTitle').textContent = 'כל הכבוד, ניחשתם נכון!';
      document.getElementById('endSub').textContent = 'המנחשים ניצחו את הסבב הזה 🎉';
      icon.setAttribute('icon','mdi:trophy'); icon.style.color = 'var(--green)';
      launchConfetti();
      vibrate([200,100,200,100,400]);
    } else {
      screen.className = 'screen has-header judge-wins';
      document.getElementById('endTitle').textContent = 'השופט/ת ניצח/ה!';
      document.getElementById('endSub').textContent = 'נכנסו ' + state.target + ' מילים מתאימות לפני שניחשתם נכון';
      icon.setAttribute('icon','mdi:tag-outline'); icon.style.color = 'var(--accent)';
      vibrate([500]);
    }

    const list = document.getElementById('endWordList');
    const all = [...state.matched.map(w=>({w, fit:true})), ...state.rejected.map(w=>({w, fit:false}))];
    if(all.length === 0){
      list.innerHTML = '<div class="empty-note">לא נאמרו מילים בסבב הזה</div>';
    } else {
      list.innerHTML = '';
      all.forEach(item=>{
        const div = document.createElement('div');
        div.className = 'word-item ' + (item.fit ? 'fit' : 'no-fit');
        div.innerHTML = '<iconify-icon icon="' + (item.fit ? 'mdi:check-circle' : 'mdi:close-circle') + '"></iconify-icon><span>' + escapeHtml(item.w) + '</span>';
        list.appendChild(div);
      });
    }
    showScreen('screen-end');
  }

  function playAgainSameSetup(){
    setHeader(true, helpBtn());
    showScreen('screen-settings');
  }

  function launchConfetti(){
    const area = document.getElementById('confetti-area');
    area.innerHTML = '';
    const colors = ['#facc15','#22c55e','#38bdf8','#f97316','#a855f7','#ec4899','#fff'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = [
        'left:' + (Math.random()*100) + '%',
        'background:' + colors[~~(Math.random()*colors.length)],
        'width:' + (6+Math.random()*10) + 'px',
        'height:' + (6+Math.random()*10) + 'px',
        'border-radius:' + (Math.random()>.5?'50%':'2px'),
        'animation-duration:' + (2+Math.random()*3) + 's',
        'animation-delay:' + (Math.random()*1.5) + 's',
      ].join(';');
      area.appendChild(p);
    }
  }

  function pickRandom(arr){ return arr[~~(Math.random() * arr.length)]; }
  function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch(e) {} }

  // ===== INFO BOTTOM SHEET =====
  const INFO_CONTENT = {
    rules: '<div class="rules-section">' +
      '<h3><iconify-icon icon="mdi:cellphone-arrow-down-variant"></iconify-icon> Pass &amp; Play</h3>' +
      '<p>משחק מסיבה עם טלפון אחד. שופט/ת אחת רואה קטגוריה סודית, וכל השאר מנסים לפצח אותה.</p>' +
      '</div>' +
      '<div class="rules-section">' +
      '<h3><iconify-icon icon="mdi:tag-outline"></iconify-icon> הגדרות</h3>' +
      '<p>שחקן/ית אחת נבחרת להיות <strong>השופט/ת</strong> ורואה קטגוריה סודית (למשל: "דברים עגולים"). שאר השחקנים לא רואים אותה.</p>' +
      '</div>' +
      '<div class="rules-section">' +
      '<h3><iconify-icon icon="mdi:play-circle-outline"></iconify-icon> מהלך המשחק</h3>' +
      '<div class="rules-item"><span class="ri-icon"><iconify-icon icon="mdi:numeric-1-circle-outline"></iconify-icon></span>' +
      '<span class="ri-text">שחקנים קוראים בקול, אחד בכל פעם, <strong>מילה כלשהי</strong> שלדעתם עשויה להתאים לקטגוריה.</span></div>' +
      '<div class="rules-item"><span class="ri-icon"><iconify-icon icon="mdi:numeric-2-circle-outline"></iconify-icon></span>' +
      '<span class="ri-text">השופט/ת מקליד/ה כל מילה ומסמנ/ת אם היא <strong style="color:var(--green)">מתאימה</strong> או <strong style="color:var(--red)">לא מתאימה</strong>.</span></div>' +
      '<div class="rules-item"><span class="ri-icon"><iconify-icon icon="mdi:lightbulb-on-outline"></iconify-icon></span>' +
      '<span class="ri-text">בכל שלב אפשר לנסות <strong>לנחש</strong> את הקטגוריה בקול רם.</span></div>' +
      '</div>' +
      '<div class="rules-section">' +
      '<h3><iconify-icon icon="mdi:trophy-outline"></iconify-icon> תנאי ניצחון</h3>' +
      '<div class="rules-item"><span class="ri-icon"><iconify-icon icon="mdi:check-circle-outline" style="color:var(--green)"></iconify-icon></span>' +
      '<span class="ri-text"><strong>המנחשים מנצחים:</strong> ניחוש נכון של הקטגוריה, בכל שלב במשחק.</span></div>' +
      '<div class="rules-item"><span class="ri-icon"><iconify-icon icon="mdi:close-circle-outline" style="color:var(--red)"></iconify-icon></span>' +
      '<span class="ri-text"><strong>השופט/ת מנצח/ת:</strong> נכנסו מספיק מילים מתאימות (ברירת מחדל 4) לפני שניחשו נכון.</span></div>' +
      '</div>',
    about: '<div class="rules-section">' +
      '<h3><iconify-icon icon="mdi:star-outline"></iconify-icon> משחקים נבחרים</h3>' +
      '<div class="game-tiles">' +
      '<a class="game-tile tile-imposter" href="https://imposter.loteman.com/" target="_blank" rel="noopener">' +
      '<span class="tile-emoji">🕵️</span><span class="tile-name">המתחזה</span></a>' +
      '<a class="game-tile tile-alias" href="https://guessword.loteman.com/" target="_blank" rel="noopener">' +
      '<span class="tile-emoji">🗣️</span><span class="tile-name">נחש ת׳מילה</span></a>' +
      '<a class="game-tile tile-category" href="https://categories.loteman.com/" target="_blank" rel="noopener">' +
      '<span class="tile-emoji">🏷️</span><span class="tile-name">מה בקטגוריה?</span></a>' +
      '<a class="game-tile tile-hirtotim" href="https://opposites.loteman.com/" target="_blank" rel="noopener">' +
      '<span class="tile-emoji">🤥</span><span class="tile-name">חירטוטים</span></a>' +
      '</div></div>' +
      '<div class="rules-section">' +
      '<h3><iconify-icon icon="mdi:view-grid-outline"></iconify-icon> לכל המשחקים</h3>' +
      '<a class="about-link" href="https://games.loteman.com/games" target="_blank" rel="noopener">' +
      '<div><div class="about-link-label"><iconify-icon icon="mdi:gamepad-variant-outline"></iconify-icon> כל המשחקים</div>' +
      '<div class="about-link-sub">לרשימה המלאה — לחץ לביקור באתר</div></div>' +
      '<iconify-icon icon="mdi:open-in-new" style="font-size:1rem;color:var(--text-dim)"></iconify-icon></a>' +
      '</div>' +
      '<div class="rules-section">' +
      '<h3><iconify-icon icon="mdi:information-outline"></iconify-icon> אודות</h3>' +
      '<a class="about-link" href="https://games.loteman.com/" target="_blank" rel="noopener">' +
      '<div><div class="about-link-label"><iconify-icon icon="mdi:gamepad-variant-outline"></iconify-icon> Loteman Games</div>' +
      '<div class="about-link-sub">למשחקים נוספים — לחץ לביקור באתר</div></div>' +
      '<iconify-icon icon="mdi:open-in-new" style="font-size:1rem;color:var(--text-dim)"></iconify-icon></a>' +
      '<div class="about-tm">מה בקטגוריה? © ' + new Date().getFullYear() + '<br>כל הזכויות שמורות ל-Loteman Games</div>' +
      '</div>'
  };

  function openInfo(type){
    document.getElementById('tab-rules').classList.toggle('active', type === 'rules');
    document.getElementById('tab-about').classList.toggle('active', type === 'about');
    document.getElementById('info-content').innerHTML = INFO_CONTENT[type];
    document.getElementById('info-backdrop').classList.add('open');
    document.getElementById('info-sheet').classList.add('open');
  }
  function switchInfoTab(type){ openInfo(type); }
  function closeInfo(){
    document.getElementById('info-backdrop').classList.remove('open');
    document.getElementById('info-sheet').classList.remove('open');
  }

  // init
  setCategoryMode('random');
