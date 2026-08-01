/* ═══════════════════════════════════════════════
   TheraMood — contact page: form + admin inbox
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─────────────────────────────────────────────
     ADMIN KEY — change the password right here.

     Heads-up: this is a static site, so this file
     (and anything typed into it) is visible to
     anyone who reads the page source. The key
     keeps casual visitors out of the inbox — do
     NOT reuse a password you use anywhere else.
     ───────────────────────────────────────────── */
  const ADMIN_KEY = 'theramood7';

  const STORE_KEY = 'theramood_messages';
  const SESSION_KEY = 'tm_admin_unlocked';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /* ── Storage helpers ─────────────────────── */
  const loadMessages = () => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const saveMessages = messages => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(messages));
      return true;
    } catch {
      return false;
    }
  };

  const newId = () =>
    (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  /* ── Contact form ────────────────────────── */
  const form = $('#contactForm');
  const nameInput = $('#cfName');
  const emailInput = $('#cfEmail');
  const messageInput = $('#cfMessage');
  const formError = $('#formError');
  const successPanel = $('#contactSuccess');
  const sendAnother = $('#sendAnother');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const valid =
        nameInput.value.trim() &&
        emailInput.checkValidity() &&
        emailInput.value.trim() &&
        messageInput.value.trim();

      if (!valid) {
        formError.hidden = false;
        return;
      }
      formError.hidden = true;

      const messages = loadMessages();
      messages.push({
        id: newId(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
        ts: Date.now(),
      });
      saveMessages(messages);

      form.hidden = true;
      successPanel.hidden = false;
      renderInbox(); // keep the inbox fresh if the owner has it open
    });

    sendAnother.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      successPanel.hidden = true;
      nameInput.focus();
    });
  }

  /* ── Admin modal ─────────────────────────── */
  const adminModal = $('#adminModal');
  const adminCard = $('#adminCard');
  const adminForm = $('#adminForm');
  const adminInput = $('#adminInput');
  const adminError = $('#adminError');
  const adminClose = $('#adminClose');
  const adminDot = $('#adminDot');

  const openAdminModal = () => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      showInbox(true);
      return;
    }
    adminModal.hidden = false;
    adminError.hidden = true;
    adminInput.value = '';
    adminInput.focus();
  };

  const closeAdminModal = () => { adminModal.hidden = true; };

  adminDot.addEventListener('click', openAdminModal);
  adminClose.addEventListener('click', closeAdminModal);
  adminModal.addEventListener('click', e => {
    if (e.target === adminModal) closeAdminModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !adminModal.hidden) closeAdminModal();
  });

  /* hidden trigger #2: just type "admin" anywhere on the page */
  let typedBuffer = '';
  document.addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key.length !== 1) return;
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-5);
    if (typedBuffer === 'admin') {
      typedBuffer = '';
      openAdminModal();
    }
  });

  adminForm.addEventListener('submit', e => {
    e.preventDefault();
    if (adminInput.value === ADMIN_KEY) {
      sessionStorage.setItem(SESSION_KEY, '1');
      closeAdminModal();
      showInbox(true);
    } else {
      adminError.hidden = false;
      adminInput.value = '';
      adminCard.classList.remove('shake');
      void adminCard.offsetWidth;
      adminCard.classList.add('shake');
    }
  });

  /* ── Inbox ───────────────────────────────── */
  const inboxSection = $('#inboxSection');
  const inboxList = $('#inboxList');
  const inboxCount = $('#inboxCount');
  const inboxExport = $('#inboxExport');
  const inboxClear = $('#inboxClear');
  const inboxLock = $('#inboxLock');

  const showInbox = scroll => {
    inboxSection.hidden = false;
    renderInbox();
    if (scroll) inboxSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hideInbox = () => {
    sessionStorage.removeItem(SESSION_KEY);
    inboxSection.hidden = true;
  };

  function renderInbox() {
    if (inboxSection.hidden) return;

    const messages = loadMessages().slice().sort((a, b) => b.ts - a.ts);
    inboxCount.textContent = messages.length;
    inboxList.textContent = '';

    if (!messages.length) {
      const empty = document.createElement('p');
      empty.className = 'inbox__empty';
      empty.textContent = 'No messages yet — they’ll appear here as soon as someone writes to you. 🌱';
      inboxList.appendChild(empty);
      return;
    }

    messages.forEach(msg => {
      const card = document.createElement('article');
      card.className = 'inbox-card';

      const head = document.createElement('div');
      head.className = 'inbox-card__head';

      const who = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = msg.name;
      const email = document.createElement('a');
      email.className = 'inbox-card__email';
      email.textContent = msg.email;
      email.href = 'mailto:' + msg.email;
      who.appendChild(name);
      who.appendChild(email);

      const meta = document.createElement('div');
      meta.className = 'inbox-card__meta';
      const time = document.createElement('time');
      time.textContent = new Date(msg.ts).toLocaleString();
      const del = document.createElement('button');
      del.className = 'inbox-card__delete';
      del.setAttribute('aria-label', 'Delete message');
      del.textContent = '🗑';
      del.addEventListener('click', () => {
        saveMessages(loadMessages().filter(m => m.id !== msg.id));
        renderInbox();
      });
      meta.appendChild(time);
      meta.appendChild(del);

      head.appendChild(who);
      head.appendChild(meta);

      const body = document.createElement('p');
      body.className = 'inbox-card__body';
      body.textContent = msg.message;

      card.appendChild(head);
      card.appendChild(body);
      inboxList.appendChild(card);
    });
  }

  inboxLock.addEventListener('click', hideInbox);

  inboxClear.addEventListener('click', () => {
    if (confirm('Delete ALL messages? This cannot be undone.')) {
      saveMessages([]);
      renderInbox();
    }
  });

  inboxExport.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(loadMessages(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theramood-messages.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  /* stay unlocked for the rest of the browser session */
  if (sessionStorage.getItem(SESSION_KEY) === '1') showInbox(false);
})();
