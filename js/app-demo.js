/* ═══════════════════════════════════════════════
   TheraMood — interactive phone screenshots

   Every screenshot in a .phone__screen gets a layer of invisible
   hotspots positioned over the real UI elements. Tapping one either
   navigates the app tour to another screen or slides up an in-phone
   bottom sheet explaining what that control does.

   Coordinates are percentages of the 1080x2340 screenshot.
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  /* Tour screen order — must match the .tour-shot order in index.html */
  const TOUR_ORDER = ['home', 'checkin', 'vitals', 'sleep', 'music', 'breathing', 'insights', 'recommend'];

  const SCREEN_NAMES = {
    home: 'Home', checkin: 'Daily check-in', vitals: 'Predicted state', sleep: 'Sleep check',
    music: 'Music', breathing: 'Exercises', insights: 'Insights', recommend: 'Recommended for you',
  };

  /* The shared bottom tab bar, identical on every top-level screen */
  const NAV = [
    { x: 4,    y: 88.5, w: 15, h: 6.5, label: 'Home tab',      go: 'home' },
    { x: 27,   y: 88.5, w: 15, h: 6.5, label: 'Music tab',     go: 'music' },
    { x: 51.5, y: 88.5, w: 15, h: 6.5, label: 'Insights tab',  go: 'insights' },
    { x: 78,   y: 88.5, w: 15, h: 6.5, label: 'Exercises tab', go: 'breathing' },
  ];

  /* Hotspot fields:
       x, y, w, h  — position as % of the screenshot
       label       — accessible name
       go          — switch the tour to another screen
       round       — circular highlight
       emoji/title/body — bottom-sheet content
       full        — append "Download the app to view in its entirety."
       cta         — { label, href } or { label, go }                        */
  const SCREENS = {
    'Screenshot_20260731-181605.jpg': { key: 'home', spots: [
      { x: 5.1, y: 8.25, w: 10.8, h: 5, round: true, label: 'Your profile',
        emoji: '🌊', title: 'Your profile',
        body: 'Your avatar, level and streak live here. Onboarding picks your ocean theme, and every background, emoji and animation in the app follows it.', full: true },
      { x: 72.8, y: 8.85, w: 8.2, h: 3.8, round: true, label: 'Pair the wristband',
        emoji: '📡', title: 'Pair the wristband',
        body: 'One tap connects the TheraMood band over Bluetooth LE. Heart rate, HRV and SpO₂ start streaming within seconds.',
        cta: { label: 'See the hardware', href: '#inside' } },
      { x: 85.8, y: 8.85, w: 8.2, h: 3.8, round: true, label: 'Settings',
        emoji: '⚙️', title: 'Settings',
        body: 'Theme and avatar, notification timing, sensor pairing, data export and privacy controls.', full: true },
      { x: 5.1, y: 19.65, w: 90, h: 16.85, label: 'Quote of the day',
        emoji: '💭', title: 'Quote of the day',
        body: 'A fresh line every morning, chosen to match the mood you have been trending toward that week.' },
      { x: 5.1, y: 39.65, w: 90, h: 8.75, label: 'Recommended for you', go: 'recommend' },
      { x: 6.2, y: 52.5, w: 43.9, h: 3.6, label: 'Vitals View', go: 'vitals' },
      { x: 50.9, y: 52.5, w: 43.6, h: 3.6, label: 'Mindful View',
        emoji: '🌿', title: 'Mindful View',
        body: 'Swaps live numbers for gentle language, for days when data feels like pressure. Same signals underneath, softer framing on top.', full: true },
      { x: 5.1, y: 60.25, w: 90, h: 24.75, label: 'Predicted state card', go: 'vitals' },
      ...NAV,
    ]},

    'Screenshot_20260731-181017.jpg': { key: 'checkin', spots: [
      { x: 10.2, y: 13.6, w: 17.4, h: 9.9, label: 'Joyful', emoji: '😊', title: 'Joyful',
        body: 'Logged as today\'s mood. TheraMood weighs every check-in against your live vitals — when the two disagree, it says so.' },
      { x: 30.9, y: 13.6, w: 17.6, h: 9.9, label: 'Calm', emoji: '😌', title: 'Calm',
        body: 'Logged as today\'s mood. Calm days become the baseline the model measures your harder days against.' },
      { x: 51.7, y: 13.6, w: 17.4, h: 9.9, label: 'Stressed', emoji: '😫', title: 'Stressed',
        body: 'Logged as today\'s mood. A stressed check-in paired with an elevated pulse triggers a breathing suggestion.' },
      { x: 72.4, y: 13.6, w: 17.6, h: 9.9, label: 'Low', emoji: '😔', title: 'Low',
        body: 'Logged as today\'s mood. Low mood plus poor sleep steers the app toward restorative routines instead of energising ones.' },
      { x: 10.2, y: 25.9, w: 17.4, h: 9.9, label: 'Energized', emoji: '🔥', title: 'Energized',
        body: 'Logged as today\'s mood. High energy unlocks the more active recovery routines.' },
      { x: 30.9, y: 25.9, w: 17.6, h: 9.9, label: 'Tired', emoji: '😴', title: 'Tired',
        body: 'Logged as today\'s mood. Tired check-ins are cross-referenced with last night\'s sleep score.' },
      { x: 51.7, y: 25.9, w: 17.4, h: 9.9, label: 'Anxious', emoji: '😰', title: 'Anxious',
        body: 'Logged as today\'s mood. Anxiety is the state 4-7-8 breathing was added for — the app offers it straight away.',
        cta: { label: 'Try the breathing reset', href: '#reset' } },
      { x: 72.4, y: 25.9, w: 17.6, h: 9.9, label: 'Inspired', emoji: '🌟', title: 'Inspired',
        body: 'Logged as today\'s mood. Inspired days feed the recommendation engine the genres and topics you gravitate to.' },
      { x: 10.2, y: 48.15, w: 13.2, h: 5.25, label: 'Energy level 1', emoji: '🪫', title: 'Energy: 1 of 5',
        body: 'Drained. The app drops the intensity of everything it suggests for the rest of the day.' },
      { x: 26.7, y: 48.15, w: 13.2, h: 5.25, label: 'Energy level 2', emoji: '⚡', title: 'Energy: 2 of 5',
        body: 'Running low. Expect shorter exercises and calmer music.' },
      { x: 43.2, y: 48.15, w: 13.2, h: 5.25, label: 'Energy level 3', emoji: '⚡', title: 'Energy: 3 of 5',
        body: 'Steady. Your energy rating scales how demanding the recovery routines get.' },
      { x: 59.8, y: 48.15, w: 13.2, h: 5.25, label: 'Energy level 4', emoji: '⚡', title: 'Energy: 4 of 5',
        body: 'Good reserves. The app will happily suggest a longer session.' },
      { x: 76.4, y: 48.15, w: 13.2, h: 5.25, label: 'Energy level 5', emoji: '⚡', title: 'Energy: 5 of 5',
        body: 'Energised. Paired with a high pulse this reads as excitement rather than stress.' },
      { x: 10.2, y: 68.5, w: 79.7, h: 6.5, label: 'Gratitude note', emoji: '📝', title: 'One thing I\'m grateful for',
        body: 'A single private line, saved with the check-in. Gratitude entries are the one thing the app never analyses — they are just for you.' },
      { x: 5.1, y: 82.5, w: 90, h: 4.25, label: 'Log check-in',
        emoji: '✅', title: 'Check-in logged',
        body: 'That is +25 XP toward Mood Logger. Your check-in is now part of the baseline the prediction model reads from.',
        cta: { label: 'See your insights', go: 'insights' } },
      ...NAV,
    ]},

    'Screenshot_20260807-171636.jpg': { key: 'vitals', spots: [
      { x: 60.7, y: 6.1, w: 29.3, h: 2.8, label: 'Matches vitals', emoji: '✅', title: 'Matches vitals',
        body: 'Your check-in and your body agree. When they disagree the badge flips, and the app tells you which signal it trusts more and why.' },
      { x: 5.1, y: 10, w: 90, h: 26, label: 'Predicted state', emoji: '🧭', title: 'Predicted state',
        body: 'The model blends last night\'s sleep, today\'s pulse variability and your check-in into one plain-English read on how you are doing.' },
      { x: 5.1, y: 38.4, w: 90, h: 21, label: 'Live heart rate',
        emoji: '❤️', title: 'Live heart rate',
        body: '125 bpm, streaming from the MAX30102 optical sensor on the band. The trace redraws continuously while the band is connected.', full: true },
      { x: 71.5, y: 59, w: 18.4, h: 2.5, label: 'See more heart rate detail',
        emoji: '📈', title: 'Heart-rate history',
        body: 'Opens the full trace — resting rate, daily range and how today compares with your seven-day average.', full: true },
      { x: 5.1, y: 65.5, w: 43.9, h: 13, label: 'HRV reading', emoji: '〰️', title: 'HRV — 137 ms',
        body: 'Heart-rate variability is the gap between beats. Higher generally means a more relaxed nervous system, which is why it carries so much weight in the prediction.' },
      { x: 51.5, y: 65.5, w: 43.6, h: 13, label: 'SpO2 reading', emoji: '💧', title: 'SpO₂ — 90%',
        body: 'Blood-oxygen saturation, read optically from the wrist. Sustained dips overnight are one of the signals the sleep score watches.' },
      { x: 5.1, y: 80, w: 90, h: 7, label: 'Sleep summary', go: 'sleep' },
      ...NAV,
    ]},

    'Screenshot_20260807-171803.jpg': { key: 'sleep', spots: [
      { x: 8.1, y: 6.75, w: 5.1, h: 2.25, round: true, label: 'Back', go: 'vitals' },
      { x: 85, y: 6, w: 9.2, h: 4.25, round: true, label: 'Sleep theme', emoji: '🌙', title: 'Night mode',
        body: 'The whole app shifts to its night palette once a sleep check is running, so the screen never jolts you awake.' },
      { x: 6.2, y: 14.25, w: 88, h: 13.15, label: 'Sleep score',
        emoji: '😴', title: 'Sleep score — 47 / 100',
        body: 'Scored from time asleep against your goal, restlessness and how often you stirred. It updates live while the check runs.', full: true },
      { x: 6.2, y: 29.85, w: 88, h: 17.65, label: 'Live movement', emoji: '📶', title: 'Live movement',
        body: 'The LSM6DSOX motion sensor keeps counting movement bursts with no finger on the heart-rate reader, so the band can run all night on very little power.' },
      { x: 4.9, y: 50.75, w: 90.5, h: 5.25, label: 'Finish sleep check',
        emoji: '☀️', title: 'Sleep check finished',
        body: 'The night is scored and filed under Recent nights, and this morning\'s emotional prediction is re-weighted around it.',
        cta: { label: 'See your insights', go: 'insights' } },
      { x: 76.9, y: 60.5, w: 15.2, h: 2.25, label: 'Clear history', emoji: '🗑️', title: 'Clear history',
        body: 'Wipes every stored night from the device. Sleep data never leaves your phone unless you turn on cloud sync yourself.' },
      { x: 6.2, y: 65.5, w: 88, h: 7, label: 'Night of 8/4, score 49', emoji: '🌙', title: '8/4 · Restless — 49',
        body: '1m of a 6h goal, 2 movement bursts. Tapping a night in the app opens its full hypnogram.', full: true },
      { x: 6.2, y: 74.75, w: 88, h: 8.25, label: 'Night of 8/4, score 31', emoji: '🌙', title: '8/4 · Restless — 31',
        body: 'Tagged Screen time and Stress. The app looks for the factors that keep showing up on your worst nights.', full: true },
      { x: 6.2, y: 86.25, w: 88, h: 8.25, label: 'Night of 8/4, score 29', emoji: '🌙', title: '8/4 · Restless — 29',
        body: '7 movement bursts against an 8h goal. Three restless nights in a row is what shifts the next day\'s prediction toward Low.', full: true },
    ]},

    'Screenshot_20260731-181329.jpg': { key: 'music', spots: [
      { x: 61.4, y: 4.65, w: 8.7, h: 4, round: true, label: 'Favourite this track',
        emoji: '💙', title: 'Saved to favourites',
        body: 'Favourites teach the generator which textures settle you, and they seed the playlists on your Recommended screen.' },
      { x: 73.9, y: 4.65, w: 8.7, h: 4, round: true, label: 'Generative engine',
        emoji: '🎛️', title: 'Generated, not streamed',
        body: 'Weightless is not a file. It is built in real time from your current state, which is why the waveform never repeats.', full: true },
      { x: 86.5, y: 4.65, w: 8.7, h: 4, round: true, label: 'Share', emoji: '📤', title: 'Share this track',
        body: 'Exports the seed that produced this piece so a friend can regenerate the same one.', full: true },
      { x: 22, y: 13.75, w: 56.3, h: 26, round: true, label: 'Album art', emoji: '🌌', title: 'Weightless',
        body: 'TheraMood Generative. Artwork is generated alongside the audio from the same emotional seed.' },
      { x: 8.7, y: 62.25, w: 82.9, h: 2, label: 'Scrub', emoji: '⏱️', title: 'Scrub the track',
        body: '0:09 in, 3 seconds left of this movement. Generative tracks stretch to fill whatever session length you set.' },
      { x: 7.6, y: 71.25, w: 6, h: 3, round: true, label: 'Like', emoji: '💙', title: 'Liked',
        body: 'A quieter signal than a favourite — it nudges the generator without pinning the track to your library.' },
      { x: 26.5, y: 71.25, w: 6, h: 3, round: true, label: 'Previous track', emoji: '⏮️', title: 'Previous',
        body: 'Steps back through the pieces generated this session.' },
      { x: 43.9, y: 69.5, w: 14.1, h: 6.5, round: true, label: 'Pause',
        emoji: '⏸️', title: 'Paused',
        body: 'Playback is generated on the fly, so pausing holds the current state rather than stopping a stream. Resuming picks the thread back up.', full: true },
      { x: 68, y: 71.25, w: 5.9, h: 3, round: true, label: 'Next track', emoji: '⏭️', title: 'Next',
        body: 'Generates a fresh piece from your current vitals rather than pulling the next file in a queue.' },
      { x: 86.7, y: 71.25, w: 6, h: 3, round: true, label: 'Repeat', emoji: '🔁', title: 'Loop',
        body: 'Loops this seed indefinitely — the usual choice for falling asleep to.' },
      { x: 15.2, y: 78.5, w: 76.9, h: 2, label: 'Volume', emoji: '🔊', title: 'Volume',
        body: 'Independent of system volume, so a calming track never gets drowned out by a notification.' },
      { x: 5.1, y: 84, w: 90, h: 3.25, label: 'Rate this track', emoji: '⭐', title: 'Rate this track',
        body: 'Your rating is the strongest signal the recommendation engine gets. A few ratings visibly change what it generates.', full: true },
      ...NAV,
    ]},

    'Screenshot_20260731-181401.jpg': { key: 'breathing', spots: [
      { x: 28.9, y: 28.9, w: 42, h: 19.35, round: true, label: 'Breathing circle',
        emoji: '🫧', title: '4-7-8 breathing',
        body: 'The circle expands for 4 counts, holds for 7 and releases for 8. There is a working version of this exact exercise on this page.',
        cta: { label: 'Try it here', href: '#reset' } },
      { x: 10.1, y: 52.1, w: 65.4, h: 3.8, label: 'Start breathing',
        emoji: '▶️', title: 'Round 1 of 4',
        body: 'Four rounds, about a minute. The band keeps reading your pulse throughout so you can see the exercise working.',
        cta: { label: 'Try it here', href: '#reset' } },
      { x: 81.3, y: 52.6, w: 6, h: 2.8, round: true, label: 'Reset rounds', emoji: '🔄', title: 'Start over',
        body: 'Resets to round 1. There is no penalty for restarting — the app never counts a missed session against you.' },
      { x: 6.2, y: 62.5, w: 88, h: 7.5, label: 'Safety note', emoji: '⚠️', title: 'Go gently',
        body: 'Stop if you feel lightheaded and breathe normally between rounds. TheraMood is a companion for everyday awareness, not a medical device.' },
      ...NAV,
    ]},

    'Screenshot_20260731-181355.jpg': { key: 'insights', spots: [
      { x: 5.1, y: 4.4, w: 90, h: 15.1, label: 'Wellness score', emoji: '🌿', title: 'Wellness score — 63',
        body: 'Built only from the check-ins and sensor readings you have actually supplied. It stays deliberately cautious until it has enough days to mean something.' },
      { x: 86.9, y: 22.35, w: 8.2, h: 3.8, round: true, label: 'All achievements',
        emoji: '🏆', title: 'All achievements',
        body: 'Dozens more across daily streaks, breathing, sleep and reflection.', full: true },
      { x: 5.1, y: 27.9, w: 27.6, h: 18.7, label: 'Mood Logger achievement', emoji: '📝', title: 'Mood Logger · +25 XP',
        body: 'Log your first check-in. The early achievements are deliberately easy — the point is to get you through day one.' },
      { x: 36.1, y: 27.9, w: 27.6, h: 18.7, label: 'Daily Breather achievement', emoji: '🫁', title: 'Daily Breather · +30 XP',
        body: 'Complete one guided breathing session.' },
      { x: 67.2, y: 27.9, w: 27.6, h: 18.7, label: 'Sound Bath achievement', emoji: '🎧', title: 'Sound Bath · +30 XP',
        body: 'Listen to a full generated track from start to finish.' },
      { x: 5.1, y: 48.75, w: 27.6, h: 20.75, label: 'Thoughtful Listener achievement', emoji: '🙂', title: 'Thoughtful Listener · +25 XP',
        body: 'Rate a track so the recommendation engine has something to learn from.' },
      { x: 36.1, y: 48.75, w: 27.6, h: 20.75, label: 'First Reflection achievement', emoji: '🌱', title: 'First Reflection · +50 XP',
        body: 'Write your first gratitude note.' },
      { x: 67.2, y: 48.75, w: 27.6, h: 20.75, label: 'Breath Builder achievement', emoji: '🧘', title: 'Breath Builder · +150 XP',
        body: 'Five breathing sessions. The long-run achievements are what keep the habit going once the novelty wears off.' },
      { x: 5.1, y: 73.25, w: 90, h: 12.5, label: 'Level progress',
        emoji: '🌱', title: 'Level 0 · Tiny Seedling',
        body: '50 of 100 XP toward Little Sprout. Levels are cosmetic on purpose — they unlock avatars and themes, never features.', full: true },
      ...NAV,
    ]},

    'Screenshot_20260731-181506.jpg': { key: 'recommend', spots: [
      { x: 6, y: 6.25, w: 4.3, h: 2, round: true, label: 'Back', go: 'home' },
      { x: 74.2, y: 6.25, w: 4.9, h: 2, round: true, label: 'API key', emoji: '🔑', title: 'Bring your own key',
        body: 'Optional. Add an OpenAI key and the picks get sharper. Leave it empty and everything still runs locally on your phone.' },
      { x: 86.7, y: 6, w: 4.9, h: 2.25, round: true, label: 'Saved picks', emoji: '❤️', title: 'Saved picks',
        body: 'Everything you have hearted, in one place.', full: true },
      { x: 10.1, y: 31.1, w: 79.8, h: 4.15, label: 'Add API key',
        emoji: '✨', title: 'Make these picks more personal',
        body: 'Your key is stored on the device and used only for your own requests. The local picks below never call out to anything.' },
      { x: 5.1, y: 47.9, w: 90, h: 9.35, label: 'Lo-fi Beats to Unwind playlist', emoji: '🎧', title: 'Lo-fi Beats to Unwind',
        body: 'Mellow, dusty beats for a calm mind — picked because you tagged lo-fi during onboarding.', full: true },
      { x: 5.1, y: 59.25, w: 90, h: 9.25, label: 'Calm Classical playlist', emoji: '🎻', title: 'Calm Classical',
        body: 'Piano and strings to settle the nervous system.', full: true },
      { x: 5.1, y: 70.75, w: 90, h: 9.25, label: 'Smooth R&B Evening playlist', emoji: '🎤', title: 'Smooth R&B Evening',
        body: 'Velvet vocals to ease into the night.', full: true },
      { x: 5.1, y: 84.5, w: 90, h: 5, label: 'Watch and unwind', emoji: '📺', title: 'Watch & unwind',
        body: 'Videos and recipes tuned to the passions you picked during onboarding, not to a generic trending feed.', full: true },
    ]},
  };

  const FULL_NOTE = 'Download the app to view in its entirety.';

  /* ── Helpers ─────────────────────────────── */
  const fileOf = src => (src || '').split('/').pop().split('?')[0];
  const tourItem = key => {
    const i = TOUR_ORDER.indexOf(key);
    return i < 0 ? null : document.querySelector(`.tour__item[data-index="${i}"]`);
  };

  /* ── Build one phone ─────────────────────── */
  const setup = screenEl => {
    const imgs = [...screenEl.querySelectorAll('img')];
    const defs = imgs.map(img => SCREENS[fileOf(img.getAttribute('src'))]).filter(Boolean);
    if (!defs.length) return;

    const isTour = screenEl.id === 'tourScreen';
    screenEl.classList.add('is-interactive');

    /* one sheet per phone */
    const sheet = document.createElement('div');
    sheet.className = 'app-sheet';
    sheet.innerHTML =
      '<div class="app-sheet__scrim"></div>' +
      '<div class="app-sheet__card" role="dialog" aria-modal="true" aria-label="App detail">' +
        '<span class="app-sheet__grab" aria-hidden="true"></span>' +
        '<span class="app-sheet__emoji" aria-hidden="true"></span>' +
        '<strong class="app-sheet__title"></strong>' +
        '<p class="app-sheet__body"></p>' +
        '<p class="app-sheet__full">' + FULL_NOTE + '</p>' +
        '<a class="app-sheet__cta" href="#"></a>' +
        '<button class="app-sheet__close" type="button">Close</button>' +
      '</div>';
    screenEl.appendChild(sheet);

    const card  = sheet.querySelector('.app-sheet__card');
    const elEmo = sheet.querySelector('.app-sheet__emoji');
    const elTit = sheet.querySelector('.app-sheet__title');
    const elBod = sheet.querySelector('.app-sheet__body');
    const elFul = sheet.querySelector('.app-sheet__full');
    const elCta = sheet.querySelector('.app-sheet__cta');
    const elCls = sheet.querySelector('.app-sheet__close');

    let lastFocus = null;

    const closeSheet = () => {
      if (!sheet.classList.contains('is-open')) return;
      sheet.classList.remove('is-open');
      document.documentElement.classList.remove('app-sheet-open');
      document.dispatchEvent(new CustomEvent('tour:resume'));
      if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    };

    const openSheet = (spot, origin) => {
      lastFocus = origin || null;
      elEmo.textContent = spot.emoji || '💧';
      elTit.textContent = spot.title || spot.label || '';
      elBod.textContent = spot.body || '';
      elBod.hidden = !spot.body;
      elFul.hidden = !spot.full;

      if (spot.cta) {
        elCta.hidden = false;
        elCta.textContent = spot.cta.label;
        if (spot.cta.go) {
          elCta.href = '#';
          elCta.dataset.go = spot.cta.go;
        } else {
          elCta.href = spot.cta.href;
          delete elCta.dataset.go;
        }
      } else if (spot.full) {
        elCta.hidden = false;
        elCta.textContent = 'Get the app';
        elCta.href = 'download.html';
        delete elCta.dataset.go;
      } else {
        elCta.hidden = true;
      }

      card.scrollTop = 0;
      sheet.classList.add('is-open');
      document.documentElement.classList.add('app-sheet-open');
      document.dispatchEvent(new CustomEvent('tour:pause'));
      elCls.focus({ preventScroll: true });
    };

    /* navigate the tour, or explain where the screen lives */
    const goTo = key => {
      const item = tourItem(key);
      if (item) {
        closeSheet();
        item.click();
        if (!isTour) {
          const sec = document.getElementById('tour');
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      openSheet({
        emoji: '📱', title: SCREEN_NAMES[key] || 'That screen',
        body: 'This screen lives in the interactive app tour.',
        cta: { label: 'Open the app tour', href: 'index.html#tour' },
      });
    };

    /* hotspot layer per screenshot */
    imgs.forEach(img => {
      const def = SCREENS[fileOf(img.getAttribute('src'))];
      if (!def) return;

      const layer = document.createElement('div');
      layer.className = 'hotspots';
      if (img.classList.contains('is-active') || imgs.length === 1) layer.classList.add('is-active');

      def.spots.forEach(spot => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hotspot' + (spot.round ? ' hotspot--round' : '');
        b.style.cssText = `left:${spot.x}%;top:${spot.y}%;width:${spot.w}%;height:${spot.h}%`;
        b.setAttribute('aria-label', spot.label || spot.title || 'App control');
        b.addEventListener('click', () => {
          if (spot.go) goTo(spot.go);
          else openSheet(spot, b);
        });
        layer.appendChild(b);
      });

      screenEl.insertBefore(layer, sheet);

      /* keep the overlay in step with the tour's active screenshot */
      if (imgs.length > 1) {
        new MutationObserver(() => {
          const on = img.classList.contains('is-active');
          layer.classList.toggle('is-active', on);
          if (!on) closeSheet();
        }).observe(img, { attributes: true, attributeFilter: ['class'] });
      }
    });

    /* sheet wiring */
    elCls.addEventListener('click', closeSheet);
    sheet.querySelector('.app-sheet__scrim').addEventListener('click', closeSheet);
    elCta.addEventListener('click', e => {
      const key = elCta.dataset.go;
      if (key) { e.preventDefault(); goTo(key); return; }
      const href = elCta.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) { e.preventDefault(); closeSheet(); target.scrollIntoView({ behavior: 'smooth' }); }
        else { elCta.href = 'index.html' + href; }
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSheet();
    });
  };

  document.querySelectorAll('.phone__screen').forEach(setup);
})();
