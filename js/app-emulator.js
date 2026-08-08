/* ═══════════════════════════════════════════════
   TheraMood — browser replica of the app

   A real DOM app, not screenshots: moods toggle, energy selects,
   the breathing timer runs, music plays, and logging a check-in
   awards XP that shows up on the Insights screen.

   Screen order mirrors main.dart's flow and the tour tab list.
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  const root = document.getElementById('tmApp');
  if (!root) return;

  const ORDER = ['home', 'checkin', 'vitals', 'sleep', 'music', 'breathing', 'insights', 'recommend'];
  /* screens pushed on top of a tab (no bottom nav), mirroring the real app */
  const PUSHED = { sleep: 'vitals', recommend: 'home' };
  const TAB_OF = { home: 'home', checkin: 'home', vitals: 'home', sleep: 'home',
                   music: 'music', breathing: 'breathing', insights: 'insights', recommend: 'home' };

  const MOODS = [
    ['joyful', '😊', 'Joyful'], ['calm', '😌', 'Calm'], ['stressed', '😫', 'Stressed'], ['low', '😔', 'Low'],
    ['energized', '🔥', 'Energized'], ['tired', '😴', 'Tired'], ['anxious', '😰', 'Anxious'], ['inspired', '🌟', 'Inspired'],
  ];

  const TRACKS = [
    { title: 'Weightless',   artist: 'TheraMood Generative', art: '🌊', len: 12 },
    { title: 'Tidepool',     artist: 'TheraMood Generative', art: '🐚', len: 14 },
    { title: 'Slow Harbour', artist: 'TheraMood Generative', art: '⛵', len: 11 },
  ];

  const PLAYLISTS = [
    ['Lo-fi Beats to Unwind', 'Mellow, dusty beats for a calm mind', '🎧', true],
    ['Calm Classical', 'Piano and strings to settle the nervous system', '🎻', false],
    ['Smooth R&B Evening', 'Velvet vocals to ease into the night', '🎤', true],
  ];

  const ACH = [
    { id: 'mood',    ic: '📝', name: 'Mood Logger',        goal: 1, xp: 25 },
    { id: 'breathe', ic: '💨', name: 'Daily Breather',     goal: 1, xp: 30 },
    { id: 'sound',   ic: '🎧', name: 'Sound Bath',         goal: 1, xp: 30 },
    { id: 'rate',    ic: '🙂', name: 'Thoughtful Listener', goal: 1, xp: 25 },
    { id: 'reflect', ic: '🌱', name: 'First Reflection',   goal: 1, xp: 50 },
    { id: 'builder', ic: '🧘', name: 'Breath Builder',     goal: 5, xp: 150 },
  ];

  /* ── state (mirrors the app's stores, in memory only) ── */
  const S = {
    screen: 'home',
    name: 'Friend',
    tint: 0,                   // bumps on every tap, nudging the background
    moods: new Set(),
    energy: 0,
    gratitude: '',
    view: 'vitals',            // Vitals View / Mindful View
    xp: 50,
    wellness: 63,
    checkins: 0,
    counts: { mood: 0, breathe: 0, sound: 0, rate: 0, reflect: 0, builder: 0 },
    favs: new Set(PLAYLISTS.filter(p => p[3]).map(p => p[0])),
    track: 0,
    playing: false,
    pos: 0,
    volume: 0.7,
    rated: false,
    breathOn: false,
    breathRound: 1,
    breathPhase: 0,            // 0 in, 1 hold, 2 out
    breathCount: 4,
    nights: [
      ['8/4', 'Restless', 49, '1m of 6h goal · 2 bursts', ''],
      ['8/4', 'Restless', 31, '1m of 8h goal · 6 bursts', 'Screen time · Stress'],
      ['8/4', 'Restless', 29, '1m of 8h goal · 7 bursts', 'Screen time · Stress'],
    ],
    sleepRunning: true,
    bursts: 3,
  };

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const level = () => Math.floor(S.xp / 100);
  const levelName = () => ['Tiny Seedling', 'Little Sprout', 'Young Fern', 'Steady Palm'][Math.min(level(), 3)];
  const nextName = () => ['Little Sprout', 'Young Fern', 'Steady Palm', 'Deep Reef'][Math.min(level(), 3)];

  /* ── screen templates ─────────────────────── */
  const V = {
    home: () => `
      <p class="tm-banner">You made it this far; now trade hustle for a kinder rhythm.</p>
      <div class="tm-top">
        <div class="tm-avatar">🌊</div>
        <div>
          <input class="tm-name" data-name value="${esc(S.name)}" placeholder="Friend"
                 aria-label="Your name" maxlength="18" spellcheck="false">
          <div class="tm-top__lvl">🌿 Lvl ${level()} · ${levelName()}</div>
        </div>
        <div class="tm-top__actions">
          <button class="tm-icon-btn" data-act="bt" aria-label="Pair wristband">📶</button>
          <button class="tm-icon-btn" data-act="settings" aria-label="Settings">⚙️</button>
        </div>
      </div>

      <div class="tm-card">
        <div class="tm-eyebrow">💭 Quote of the day</div>
        <p class="tm-quote">“Happiness is not out there. It is in you.”</p>
        <div class="tm-quote__by">— Unknown</div>
      </div>

      <div class="tm-card tm-rec" data-go="checkin" role="button" tabindex="0">
        <div class="tm-rec__ic">😊</div>
        <div>
          <div class="tm-h3">${S.checkins ? 'Check in again' : 'How are you feeling?'}</div>
          <div class="tm-tiny">${S.checkins ? `${S.checkins} logged today` : "Log today's check-in · +25 XP"}</div>
        </div>
        <div class="tm-rec__arrow">→</div>
      </div>

      <div class="tm-card tm-rec" data-go="recommend" role="button" tabindex="0">
        <div class="tm-rec__ic">✨</div>
        <div>
          <div class="tm-h3">Recommended for you</div>
          <div class="tm-tiny">Music, videos &amp; recipes for your vibe</div>
        </div>
        <div class="tm-rec__arrow">→</div>
      </div>

      <div class="tm-seg">
        <button data-view="vitals" class="${S.view === 'vitals' ? 'is-on' : ''}">❤️ Vitals View</button>
        <button data-view="mindful" class="${S.view === 'mindful' ? 'is-on' : ''}">🌿 Mindful View</button>
      </div>

      <div class="tm-card tm-card--peach" data-go="vitals" role="button" tabindex="0">
        <div class="tm-row"><span>🧭</span><span class="tm-h3">Predicted State</span></div>
        <div class="tm-row" style="margin:12px 0 6px">
          <span style="font-size:38px">${S.view === 'vitals' ? '😣' : '🌿'}</span>
          <div>
            <div class="tm-h1" style="font-size:24px">${S.view === 'vitals' ? 'Tense' : 'Unsettled'}</div>
            <div class="tm-tiny">${S.checkins ? 'from your latest check-in' : 'from your onboarding check-in'}</div>
          </div>
        </div>
        <p class="tm-sub">${S.view === 'vitals'
          ? 'Your latest check-in suggests some tension. Connect your TheraMood sensor for more context.'
          : 'Today feels a little heavy. Nothing to fix — just something to notice, gently.'}</p>
      </div>`,

    checkin: () => `
      <div class="tm-h2" style="margin-bottom:2px">How are you feeling?</div>
      <p class="tm-sub" style="margin-bottom:14px">Select all that resonate</p>
      <div class="tm-card">
        <div class="tm-grid4">
          ${MOODS.map(([id, e, n]) => `
            <button class="tm-mood ${S.moods.has(id) ? 'is-on' : ''}" data-mood="${id}" aria-pressed="${S.moods.has(id)}">
              <span>${e}</span><small>${n}</small>
            </button>`).join('')}
        </div>
      </div>

      <div class="tm-card">
        <div class="tm-h3">Energy Level</div>
        <div class="tm-energy">
          ${[1, 2, 3, 4, 5].map(n => `<button data-energy="${n}" class="${S.energy === n ? 'is-on' : ''}">${n}</button>`).join('')}
        </div>
        <div class="tm-energy-legend"><span>Drained</span><span>Energized</span></div>
      </div>

      <div class="tm-card">
        <div class="tm-h3">One thing I'm grateful for</div>
        <textarea class="tm-input" rows="2" data-gratitude placeholder="Today I appreciate…">${esc(S.gratitude)}</textarea>
      </div>

      <button class="tm-btn" data-act="log">Log Check-in 🌿</button>`,

    vitals: () => `
      <div class="tm-card tm-card--peach">
        <div class="tm-row">
          <span>🧭</span><span class="tm-h3">Predicted State</span>
          <span class="tm-chip" style="margin-left:auto">✅ Matches vitals</span>
        </div>
        <div class="tm-row" style="margin:12px 0 8px">
          <span style="font-size:38px">😣</span>
          <div>
            <div class="tm-h1" style="font-size:24px">Tense</div>
            <div class="tm-tiny">from your onboarding check-in</div>
          </div>
        </div>
        <p class="tm-sub">You checked in feeling tense, and a resting heart rate of 125 bpm, an HRV of 139 ms and blood-oxygen at 90% back that up. A short breathing exercise could bring both down together.</p>
      </div>

      <div class="tm-card">
        <div class="tm-row">
          <span>❤️</span><span class="tm-h3">Heart Rate</span>
          <span class="tm-tiny" style="margin-left:auto">Live</span>
        </div>
        <div class="tm-row" style="align-items:flex-end;margin-top:8px">
          <span class="tm-big">125</span><span class="tm-unit">bpm</span>
        </div>
        <svg class="tm-spark" viewBox="0 0 300 44" preserveAspectRatio="none" aria-hidden="true">
          <polyline id="tmSpark" fill="none" stroke="#e08a7d" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" points="0,30 30,28 45,14 60,34 80,26 110,29 140,27 155,12 170,33 200,28 230,29 250,18 265,31 300,28"/>
        </svg>
        <div class="tm-row">
          <span class="tm-tiny">MindSync sensor · BTConnection</span>
          <span class="tm-link" style="margin-left:auto" data-act="seemore">See more →</span>
        </div>
      </div>

      <div class="tm-half" style="margin-bottom:14px">
        <div class="tm-card">
          <div style="font-size:19px">〰️</div>
          <div class="tm-tiny" style="margin-top:6px">HRV</div>
          <div><span class="tm-h2">137</span><span class="tm-unit">ms</span></div>
        </div>
        <div class="tm-card">
          <div style="font-size:19px">💧</div>
          <div class="tm-tiny" style="margin-top:6px">SpO2</div>
          <div><span class="tm-h2">90</span><span class="tm-unit">%</span></div>
        </div>
      </div>

      <div class="tm-card tm-rec" data-go="sleep" role="button" tabindex="0">
        <div class="tm-rec__ic">😴</div>
        <div>
          <div class="tm-h3">Restless</div>
          <div class="tm-tiny">${S.nights[0][2]}/100 · ${S.nights[0][3].split('·')[1] || '2 bursts'}</div>
        </div>
        <div class="tm-rec__arrow">›</div>
      </div>`,

    sleep: () => `
      <div class="tm-head">
        <div class="tm-back" data-back role="button" tabindex="0" aria-label="Back">‹</div>
        <div>
          <div class="tm-tiny">Rest, reflected gently</div>
          <div class="tm-h2">Sleep Check</div>
        </div>
        <div class="tm-avatar" style="margin-left:auto;width:38px;height:38px;font-size:19px">🌙</div>
      </div>

      <div class="tm-card tm-card--solid">
        <div class="tm-row">
          ${ring(47)}
          <div>
            <div class="tm-h3">${S.sleepRunning ? 'Checking quietly…' : 'Night logged'}</div>
            <div style="color:var(--blue-d);font-weight:700;font-size:13px;margin-top:2px">0m of 8h goal</div>
            <div class="tm-tiny">7% restless · ${S.bursts} movement bursts</div>
          </div>
        </div>
      </div>

      <div class="tm-card">
        <div class="tm-row">
          <span style="color:var(--blue-d)">((•))</span>
          <span class="tm-h3">Live movement</span>
          <span class="tm-chip" style="margin-left:auto">● Light</span>
        </div>
        <p style="color:var(--orange);font-weight:700;font-size:13px;margin:10px 0 8px">${S.bursts} movement bursts detected</p>
        <div class="tm-bar"><i style="width:${Math.min(S.bursts * 8, 100)}%"></i></div>
        <p class="tm-sub" style="margin-top:9px">The sensor can stay active without your finger on the heart-rate reader.</p>
      </div>

      <button class="tm-btn tm-btn--orange" data-act="finish-sleep" style="margin-bottom:16px">
        ${S.sleepRunning ? '☀️ Finish sleep check' : '🌙 Start a new check'}
      </button>

      <div class="tm-row" style="margin-bottom:10px">
        <span class="tm-h2">Recent nights</span>
        <span class="tm-link" style="margin-left:auto;color:#d4707a" data-act="clear-nights">🗑 Clear</span>
      </div>
      ${S.nights.length ? S.nights.map(n => `
        <div class="tm-night">
          <span style="font-size:20px">🌙</span>
          <div>
            <div class="tm-h3" style="font-size:13.5px">${n[0]} · ${n[1]}</div>
            <div class="tm-tiny">${n[3]}</div>
            ${n[4] ? `<div class="tm-tiny">${n[4]}</div>` : ''}
          </div>
          <span class="tm-night__score">${n[2]}</span>
        </div>`).join('') : '<p class="tm-sub">No nights recorded yet.</p>'}`,

    music: () => {
      const t = TRACKS[S.track];
      const pct = (S.pos / t.len) * 100;
      const left = Math.max(0, t.len - S.pos);
      return `
      <div class="tm-row" style="margin-bottom:10px">
        <div>
          <div class="tm-h2">Now Playing</div>
          <div class="tm-tiny">Music</div>
        </div>
        <div class="tm-top__actions" style="margin-left:auto">
          <button class="tm-icon-btn ${S.favs.has(t.title) ? 'is-on' : ''}" data-act="fav" aria-label="Favourite">${S.favs.has(t.title) ? '♥' : '♡'}</button>
          <button class="tm-icon-btn" data-act="engine" aria-label="Generative engine">◉</button>
          <button class="tm-icon-btn" data-act="share" aria-label="Share">↗</button>
        </div>
      </div>

      <div class="tm-art ${S.playing ? 'is-playing' : ''}">${t.art}</div>
      <div style="text-align:center;margin-bottom:12px">
        <div class="tm-h2">${t.title}</div>
        <div class="tm-tiny">${t.artist}</div>
      </div>

      <div class="tm-wave" id="tmWave">${Array.from({ length: 42 }, () => '<i style="height:6px"></i>').join('')}</div>

      <div class="tm-scrub" data-act="scrub">
        <i style="width:${pct}%"></i><b style="left:${pct}%"></b>
      </div>
      <div class="tm-times"><span>0:${String(S.pos).padStart(2, '0')}</span><span>-0:${String(left).padStart(2, '0')}</span></div>

      <div class="tm-controls">
        <span class="tm-heart" data-act="like" role="button" tabindex="0" aria-label="Like">${S.favs.has(t.title) ? '♥' : '♡'}</span>
        <span class="tm-heart" data-act="prev" role="button" tabindex="0" aria-label="Previous">◀◀</span>
        <button class="tm-play" data-act="play" aria-label="${S.playing ? 'Pause' : 'Play'}">${S.playing ? '❚❚' : '▶'}</button>
        <span class="tm-heart" data-act="next" role="button" tabindex="0" aria-label="Next">▶▶</span>
        <span class="tm-heart" data-act="repeat" role="button" tabindex="0" aria-label="Repeat">↻</span>
      </div>

      <div class="tm-row" style="margin-bottom:14px">
        <span>🔊</span>
        <div class="tm-bar" style="flex:1" data-act="vol"><i style="width:${S.volume * 100}%"></i></div>
      </div>

      <div class="tm-card" style="cursor:pointer" data-act="rate">
        <div class="tm-row">
          <span>⭐</span>
          <span class="tm-h3">${S.rated ? 'Thanks — rated!' : 'Rate this track &amp; get better picks'}</span>
        </div>
      </div>`;
    },

    breathing: () => `
      <div class="tm-h1">Exercises</div>
      <p class="tm-sub" style="margin-bottom:14px">A guided reset you can use right now.</p>
      <div class="tm-card tm-card--solid" style="text-align:center">
        <div class="tm-h2">4-7-8 Breathing</div>
        <div class="tm-sub">Round ${S.breathRound} of 4</div>
        <div class="tm-breath" id="tmBreath">
          <div style="font-size:15px;color:var(--blue-d)">${['↓', '•', '↑'][S.breathPhase]}</div>
          <div class="tm-breath__n" id="tmBreathN">${S.breathCount}</div>
          <div class="tm-breath__l" id="tmBreathL">${['Breathe in', 'Hold', 'Breathe out'][S.breathPhase]}</div>
        </div>
        <div class="tm-row" style="gap:10px">
          <button class="tm-btn" data-act="breath" style="flex:1">${S.breathOn ? '⏸ Pause' : '▶ Start'}</button>
          <button class="tm-icon-btn" data-act="breath-reset" aria-label="Reset">🔄</button>
        </div>
      </div>
      <div class="tm-card">
        <p class="tm-sub">Stop if you feel lightheaded. Breathe normally between rounds whenever you need to.</p>
      </div>`,

    insights: () => `
      <div class="tm-card tm-card--solid">
        <div class="tm-row">
          <div class="tm-avatar" style="width:40px;height:40px;font-size:18px">🌿</div>
          <div class="tm-h3">Latest recorded wellness: ${S.wellness}</div>
        </div>
        <p class="tm-sub" style="margin-top:9px">This score uses only the check-in and sensor values you supplied. Keep recording on different days to reveal a meaningful trend.</p>
      </div>

      <div class="tm-row" style="margin-bottom:12px">
        <span style="font-size:19px">🏆</span>
        <span class="tm-h2">Almost there</span>
        <button class="tm-icon-btn" style="margin-left:auto" data-act="all-ach" aria-label="All achievements">→</button>
      </div>

      <div class="tm-grid3">
        ${ACH.map(a => {
          const c = Math.min(S.counts[a.id], a.goal);
          return `<div class="tm-ach ${c >= a.goal ? 'is-done' : ''}">
            <div class="tm-ach__ic">${a.ic}</div>
            <div class="tm-ach__n">${a.name}</div>
            <div class="tm-bar"><i style="width:${(c / a.goal) * 100}%"></i></div>
            <div class="tm-tiny" style="margin-top:5px">${c}/${a.goal}</div>
            <div class="tm-ach__xp">+${a.xp} XP</div>
          </div>`;
        }).join('')}
      </div>

      <div class="tm-card tm-card--peach">
        <div class="tm-row">
          <span style="font-size:19px">🌱</span>
          <span class="tm-h3">Level ${level()} · ${levelName()}</span>
          <span class="tm-link" style="margin-left:auto">${S.xp} XP ›</span>
        </div>
        <div class="tm-bar" style="margin:11px 0 8px"><i style="width:${S.xp % 100}%"></i></div>
        <div class="tm-row">
          <span class="tm-tiny">${S.xp % 100} / 100 XP</span>
          <span class="tm-tiny" style="margin-left:auto">Next: ${nextName()}</span>
        </div>
      </div>`,

    recommend: () => `
      <div class="tm-head">
        <div class="tm-back" data-back role="button" tabindex="0" aria-label="Back">‹</div>
        <div>
          <div class="tm-h2">Recommended for you ✨</div>
          <div class="tm-tiny">Handpicked for ${esc(S.name || 'Friend')} from your setup</div>
        </div>
        <div class="tm-top__actions" style="margin-left:auto">
          <button class="tm-icon-btn" data-act="key" aria-label="API key">🔑</button>
        </div>
      </div>

      <div class="tm-card tm-card--solid">
        <div class="tm-row"><span>✨</span><span class="tm-h3">Make these picks more personal</span></div>
        <p class="tm-sub" style="margin:8px 0 12px">Add your OpenAI API key, or keep using the local picks below.</p>
        <button class="tm-btn" data-act="key">🔑 Add API key</button>
      </div>

      <div class="tm-row" style="margin-bottom:4px"><span>🎵</span><span class="tm-h2">Music for your vibe</span></div>
      <p class="tm-sub" style="margin-bottom:12px">Picked from the genres you love</p>

      ${PLAYLISTS.map(([name, sub, ic]) => `
        <div class="tm-play-row">
          <div class="tm-play-row__ic">${ic}</div>
          <div style="flex:1">
            <div class="tm-h3" style="font-size:13.5px">${name}</div>
            <div class="tm-tiny">${sub}</div>
          </div>
          <div style="text-align:right">
            <div class="tm-tag">Playlist</div>
            <div class="tm-heart" data-fav="${esc(name)}" style="margin-top:7px" role="button" tabindex="0"
                 aria-label="Favourite ${esc(name)}">${S.favs.has(name) ? '❤️' : '🤍'}</div>
          </div>
        </div>`).join('')}

      <div class="tm-row" style="margin:16px 0 4px"><span>🎬</span><span class="tm-h2">Watch &amp; unwind</span></div>
      <p class="tm-sub">Tuned to your passions</p>`,
  };

  function ring(v) {
    const r = 24, c = 2 * Math.PI * r;
    return `<svg class="tm-ring" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="${r}" fill="rgba(255,255,255,.6)" stroke="rgba(160,195,220,.4)" stroke-width="6"/>
      <circle cx="30" cy="30" r="${r}" fill="none" stroke="#5b93c9" stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v / 100)}" transform="rotate(-90 30 30)"/>
      <text x="30" y="36" text-anchor="middle" font-size="19">${v}</text>
    </svg>`;
  }

  /* ── shell ────────────────────────────────── */
  root.innerHTML = `
    <div class="tm__deco" aria-hidden="true">
      <span style="top:6%;left:70%">🌊</span><span style="top:16%;left:12%">🐚</span>
      <span style="top:34%;left:78%">🐋</span><span style="top:52%;left:8%">⛵</span>
      <span style="top:68%;left:72%">🌴</span><span style="top:84%;left:16%">🐠</span>
    </div>
    <div class="tm__status">
      <span>6:00</span>
      <span class="tm__status-right">
        <span class="tm__bars"><i></i><i></i><i></i><i></i></span>
        <span>80%</span><span class="tm__batt"></span>
      </span>
    </div>
    <div class="tm__views" id="tmViews">
      ${ORDER.map(k => `<section class="tm__view" data-screen="${k}"></section>`).join('')}
    </div>
    <nav class="tm__nav" id="tmNav">
      <button data-tab="home"><i>🏠</i>Home</button>
      <button data-tab="music"><i>🎵</i>Music</button>
      <button data-tab="insights"><i>📊</i>Insights</button>
      <button data-tab="breathing"><i>⚡</i>Exercises</button>
    </nav>`;

  const views = {};
  root.querySelectorAll('.tm__view').forEach(v => (views[v.dataset.screen] = v));
  const nav = root.querySelector('#tmNav');

  /* ── callout, rendered outside the phone so it isn't clipped ── */
  const phoneEl = root.closest('.phone') || root.parentElement;
  const host = root.closest('.tour__stage') || phoneEl.parentElement || document.body;
  host.classList.add('tm-callout-host');

  const callout = document.createElement('div');
  callout.className = 'tm-callout';
  callout.setAttribute('role', 'status');
  host.appendChild(callout);

  let anchorEl = null, calloutTimer;

  const hideCallout = () => callout.classList.remove('is-on');

  const toast = (msg, el = anchorEl) => {
    callout.innerHTML = msg;
    callout.style.visibility = 'hidden';
    callout.classList.add('is-on');       // measure at full size

    const hr = host.getBoundingClientRect();
    const pr = phoneEl.getBoundingClientRect();
    const br = (el && el.isConnected) ? el.getBoundingClientRect() : pr;
    const cw = callout.offsetWidth, ch = callout.offsetHeight;
    const gap = 16;

    let side = 'right';
    if (pr.right + gap + cw > window.innerWidth - 8) side = 'left';
    if (side === 'left' && pr.left - gap - cw < 8) side = 'below';

    let left, top;
    if (side === 'below') {
      left = pr.left - hr.left + (pr.width - cw) / 2;
      top = pr.bottom - hr.top + gap;
    } else {
      left = side === 'right' ? pr.right - hr.left + gap : pr.left - hr.left - cw - gap;
      top = br.top + br.height / 2 - hr.top - ch / 2;
      // keep it alongside the phone rather than drifting off its ends
      top = Math.max(pr.top - hr.top - 12, Math.min(pr.bottom - hr.top - ch + 12, top));
    }

    callout.dataset.side = side;
    callout.style.left = Math.round(left) + 'px';
    callout.style.top = Math.round(top) + 'px';
    if (side !== 'below') {
      const y = br.top + br.height / 2 - hr.top - top;
      callout.style.setProperty('--arrow-y', Math.max(16, Math.min(ch - 16, y)) + 'px');
    }
    callout.style.visibility = '';

    clearTimeout(calloutTimer);
    calloutTimer = setTimeout(hideCallout, 3400);
  };

  /* it lives in page flow, so it scrolls with the phone — only resize invalidates it */
  addEventListener('resize', hideCallout);

  const paint = key => {
    views[key].innerHTML = V[key]();
    if (key === 'music') drawWave();
  };

  const show = (key, { silent } = {}) => {
    if (!V[key]) return;
    S.screen = key;
    paint(key);
    Object.entries(views).forEach(([k, el]) => el.classList.toggle('is-active', k === key));
    views[key].scrollTop = 0;
    nav.classList.toggle('is-hidden', key in PUSHED);
    nav.querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b.dataset.tab === TAB_OF[key]));
    if (!silent) syncTabs(key);
  };

  /* keep the tour tab list in step with the app */
  const tabs = [...document.querySelectorAll('.tour__item')];
  const syncTabs = key => {
    const i = ORDER.indexOf(key);
    tabs.forEach((t, n) => {
      t.classList.toggle('is-active', n === i);
      t.setAttribute('aria-selected', String(n === i));
    });
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => show(ORDER[i])));
  document.querySelector('.tour')?.classList.add('tour--live');

  /* ── music engine ─────────────────────────── */
  let waveTimer, posTimer;
  function drawWave() {
    const w = root.querySelector('#tmWave');
    if (!w) return;
    [...w.children].forEach((bar, i) => {
      const base = S.playing ? 6 + Math.abs(Math.sin(i * 0.7 + S.pos * 1.4)) * 30 * S.volume : 6;
      bar.style.height = base.toFixed(1) + 'px';
    });
  }
  const startMusic = () => {
    clearInterval(waveTimer); clearInterval(posTimer);
    waveTimer = setInterval(drawWave, 180);
    posTimer = setInterval(() => {
      S.pos++;
      if (S.pos >= TRACKS[S.track].len) { S.pos = 0; bump('sound'); }
      if (S.screen === 'music') paint('music');
    }, 1000);
  };
  const stopMusic = () => { clearInterval(waveTimer); clearInterval(posTimer); drawWave(); };

  /* ── breathing engine ─────────────────────── */
  const PHASES = [4, 7, 8];
  let breathTimer;
  const tickBreath = () => {
    S.breathCount--;
    if (S.breathCount <= 0) {
      S.breathPhase = (S.breathPhase + 1) % 3;
      S.breathCount = PHASES[S.breathPhase];
      if (S.breathPhase === 0) {
        S.breathRound++;
        bump('breathe'); bump('builder');
        if (S.breathRound > 4) { stopBreath(); S.breathRound = 1; toast('Four rounds done. Notice how that landed. 🌿'); }
      }
    }
    if (S.screen === 'breathing') {
      paint('breathing');
      const c = root.querySelector('#tmBreath');
      if (c) c.style.transform = `scale(${S.breathPhase === 0 ? 1.14 : S.breathPhase === 1 ? 1.14 : 0.86})`;
    }
  };
  const startBreath = () => { S.breathOn = true; clearInterval(breathTimer); breathTimer = setInterval(tickBreath, 1000); };
  const stopBreath = () => { S.breathOn = false; clearInterval(breathTimer); };

  /* ── progression ──────────────────────────── */
  function bump(id) {
    const a = ACH.find(x => x.id === id);
    if (!a) return;
    const was = S.counts[id] >= a.goal;
    S.counts[id]++;
    if (!was && S.counts[id] >= a.goal) {
      S.xp += a.xp;
      toast(`🏆 ${a.name} unlocked — +${a.xp} XP`);
    }
  }

  /* ── interactions ─────────────────────────── */
  /* every tap nudges the gradient a few degrees around its base hues */
  const applyTint = () => {
    const d = Math.sin(S.tint * 0.8) * 13;
    root.style.setProperty('--bg-top', `hsl(${193 + d} 55% ${89 + Math.cos(S.tint * .6) * 2}%)`);
    root.style.setProperty('--bg-mid', `hsl(${165 + d * 0.6} 30% 92%)`);
    root.style.setProperty('--bg-bot', `hsl(${21 + d * 0.9} 79% ${91 + Math.sin(S.tint * .5) * 2}%)`);
  };

  root.addEventListener('click', e => {
    const t = e.target;
    const hit = sel => t.closest(sel);

    /* anchor callouts to whatever was tapped, and shift the background */
    const tapped = t.closest('button, [role="button"], [data-act], [data-go], [data-fav], [data-back]');
    if (tapped && !t.closest('[data-name]')) {
      anchorEl = tapped;
      S.tint++;
      applyTint();
    }

    const goEl = hit('[data-go]');
    if (goEl) return show(goEl.dataset.go);
    if (hit('[data-back]')) return show(PUSHED[S.screen] || 'home');

    const tab = hit('[data-tab]');
    if (tab) return show(tab.dataset.tab);

    const mood = hit('[data-mood]');
    if (mood) {
      const id = mood.dataset.mood;
      S.moods.has(id) ? S.moods.delete(id) : S.moods.add(id);
      return paint('checkin');
    }

    const en = hit('[data-energy]');
    if (en) { S.energy = +en.dataset.energy; return paint('checkin'); }

    const seg = hit('[data-view]');
    if (seg) { S.view = seg.dataset.view; return paint('home'); }

    const fav = hit('[data-fav]');
    if (fav) {
      const n = fav.dataset.fav;
      S.favs.has(n) ? S.favs.delete(n) : S.favs.add(n);
      return paint('recommend');
    }

    const act = hit('[data-act]');
    if (!act) return;
    switch (act.dataset.act) {
      case 'log': {
        if (!S.moods.size && !S.energy) return toast('Pick a mood or an energy level first.');
        S.checkins++;
        bump('mood');
        if (S.gratitude.trim()) bump('reflect');
        S.wellness = Math.min(99, S.wellness + 3);
        const n = S.moods.size;
        S.moods.clear(); S.energy = 0; S.gratitude = '';
        toast(`Check-in logged${n ? ` · ${n} mood${n > 1 ? 's' : ''}` : ''}. Wellness now ${S.wellness}.`);
        return show('insights');
      }
      case 'play':
        S.playing = !S.playing;
        S.playing ? startMusic() : stopMusic();
        return paint('music');
      case 'next':
        S.track = (S.track + 1) % TRACKS.length; S.pos = 0; return paint('music');
      case 'prev':
        S.track = (S.track - 1 + TRACKS.length) % TRACKS.length; S.pos = 0; return paint('music');
      case 'repeat': return toast('<strong>↻ Loop</strong>Loops this seed indefinitely — the usual choice for falling asleep to.');
      case 'fav': case 'like': {
        const title = TRACKS[S.track].title;
        S.favs.has(title) ? S.favs.delete(title) : S.favs.add(title);
        return paint('music');
      }
      case 'rate':
        if (!S.rated) { S.rated = true; bump('rate'); toast('Rated. That is the strongest signal the picker gets.'); }
        return paint('music');
      case 'engine': return toast('<strong>◉ Generated, not streamed</strong>Built in real time from your current state, which is why the waveform never repeats.');
      case 'share':  return toast('<strong>↗ Share</strong>Exports the seed that produced this piece so a friend can regenerate the same one.');
      case 'breath':
        S.breathOn ? stopBreath() : startBreath();
        return paint('breathing');
      case 'breath-reset':
        stopBreath(); S.breathRound = 1; S.breathPhase = 0; S.breathCount = 4;
        return paint('breathing');
      case 'finish-sleep':
        if (S.sleepRunning) {
          const score = 40 + Math.floor(S.bursts * 2.5);
          S.nights.unshift(['8/5', score > 55 ? 'Settled' : 'Restless', score, `0m of 8h goal · ${S.bursts} bursts`, '']);
          S.sleepRunning = false;
          toast(`Night scored ${score}/100 and filed under Recent nights.`);
        } else {
          S.sleepRunning = true; S.bursts = 3;
          toast('Sleep check running. Leave the band on overnight.');
        }
        return paint('sleep');
      case 'clear-nights':
        S.nights = [];
        toast('History cleared. Sleep data never leaves your phone.');
        return paint('sleep');
      case 'bt':       return toast('<strong>📡 Pairing…</strong>Bluetooth LE connects the band — heart rate, HRV and SpO₂ start streaming in seconds.');
      case 'settings': return toast('<strong>⚙️ Settings</strong>Theme, notification timing, sensor pairing and privacy controls.');
      case 'seemore':  return toast('<strong>📈 Heart-rate history</strong>The full trace, your resting rate and how today compares with your 7-day average.');
      case 'key':      return toast('<strong>🔑 Your own key</strong>Stored on-device and used only for your own requests. The local picks never call out.');
      case 'all-ach':  return toast('<strong>🏆 All achievements</strong>Dozens more across daily streaks, breathing, sleep and reflection.');
    }
  });

  /* scrub + volume dragging */
  root.addEventListener('pointerdown', e => {
    const bar = e.target.closest('[data-act="scrub"], [data-act="vol"]');
    if (!bar) return;
    const isVol = bar.dataset.act === 'vol';
    const set = ev => {
      const r = bar.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
      if (isVol) S.volume = p; else S.pos = Math.round(p * TRACKS[S.track].len);
      paint('music');
    };
    set(e);
    const move = ev => set(ev);
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });

  /* typed fields update state without repainting, so focus and caret survive */
  root.addEventListener('input', e => {
    if (e.target.matches('[data-gratitude]')) S.gratitude = e.target.value;
    if (e.target.matches('[data-name]')) S.name = e.target.value;
  });
  root.addEventListener('blur', e => {
    if (e.target.matches('[data-name]') && !e.target.value.trim()) {
      S.name = 'Friend';
      e.target.value = 'Friend';
    }
  }, true);

  root.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-go],[data-back],[data-fav]')) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* ── scale to the phone frame ─────────────── */
  /* Width drives the scale; height is derived from the frame's real aspect.
     The phone's uniform 9px padding makes the screen a touch taller than the
     1080x2340 source ratio, so a fixed 844 would leave a gap at the bottom. */
  const screenEl = root.parentElement;
  const fit = () => {
    const w = screenEl.clientWidth, h = screenEl.clientHeight;
    if (!w || !h) return;
    const s = w / 390;
    screenEl.style.setProperty('--tm-scale', s);
    root.style.height = (h / s) + 'px';
  };
  new ResizeObserver(fit).observe(screenEl);
  fit();

  show('home');
})();
