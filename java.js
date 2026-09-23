/* =========================================================
   CALL OUR HERO (COH) — MAIN JAVASCRIPT ENGINE
   Advanced Enterprise Dark System & Real-Time Logic
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  
  // ================= STATE =================
  const state = {
    currentUser: null, // { role: 'citizen' | 'worker', name: '', mahallaKey: '' }
    soundEnabled: true,
    userPoints: 1250,
    currentMahallaKey: 'navroz',
    mahallas: {
      navroz: {
        id: 'navroz',
        name: '"Navro\'z" MFY (Toshkent)',
        shortName: 'Navro\'z',
        count: 38,
        goal: 50,
        points: 4850,
        status: 'waiting'
      },
      chilonzor9: {
        id: 'chilonzor9',
        name: '"Chilonzor-9" MFY',
        shortName: 'Chilonzor-9',
        count: 52,
        goal: 50,
        points: 4120,
        status: 'ready'
      },
      yunusobod14: {
        id: 'yunusobod14',
        name: '"Yunusobod-14" MFY',
        shortName: 'Yunusobod-14',
        count: 47,
        goal: 50,
        points: 3980,
        status: 'waiting'
      },
      mirobod4: {
        id: 'mirobod4',
        name: '"Mirobod-4" MFY',
        shortName: 'Mirobod-4',
        count: 29,
        goal: 50,
        points: 2750,
        status: 'waiting'
      },
      buyukipak: {
        id: 'buyukipak',
        name: '"Buyuk Ipak Yo\'li" MFY',
        shortName: 'Buyuk Ipak Yo\'li',
        count: 18,
        goal: 50,
        points: 1900,
        status: 'waiting'
      }
    },
    fleet: [
      { id: 1, name: 'Hero Truck #01 (Elektro)', driver: 'A. Karimov', status: 'mission', capacity: '85%' },
      { id: 2, name: 'Hero Truck #02 (Gibrid)', driver: 'O. Yo\'ldoshev', status: 'ready', capacity: '10%' },
      { id: 3, name: 'Hero Truck #03 (Kompaktor)', driver: 'D. Rahimov', status: 'ready', capacity: '0%' }
    ],
    reports: [
      { date: '27.08.2026', area: 'Chilonzor-9', kg: 640, time: '35 daq', households: 52, status: 'Yakunlandi' },
      { date: '26.08.2026', area: 'Yunusobod-14', kg: 580, time: '40 daq', households: 50, status: 'Yakunlandi' },
      { date: '25.08.2026', area: 'Navro\'z MFY', kg: 710, time: '45 daq', households: 51, status: 'Yakunlandi' }
    ]
  };

  // ================= AUDIO SYNTHESIZER (WEB AUDIO API) =================
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type = 'click') {
    if (!state.soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.07);
        osc.frequency.setValueAtTime(783.99, now + 0.14);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'hero_fanfare') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + i * 0.09);
          noteGain.gain.setValueAtTime(0.2, now + i * 0.09);
          noteGain.gain.linearRampToValueAtTime(0.01, now + i * 0.09 + 0.22);
          noteOsc.start(now + i * 0.09);
          noteOsc.stop(now + i * 0.09 + 0.22);
        });
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.09);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Audio fallback
    }
  }

  // ================= TOAST NOTIFICATIONS =================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = '✅';
    if (type === 'alert') icon = '🚨';
    if (type === 'info') icon = '💡';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3600);
  }

  // ================= DOM REFERENCES =================
  const loginScreen = document.getElementById('loginScreen');
  const mainAppWrap = document.getElementById('mainAppWrap');
  const citizenLoginForm = document.getElementById('citizenLoginForm');
  const workerLoginForm = document.getElementById('workerLoginForm');
  const citizenSubmitBtn = document.getElementById('citizenSubmitBtn');
  const workerSubmitBtn = document.getElementById('workerSubmitBtn');

  const tabCitizenBtn = document.getElementById('tabCitizenBtn');
  const tabWorkerBtn = document.getElementById('tabWorkerBtn');
  const tabOneIdBtn = document.getElementById('tabOneIdBtn');
  const citizenAuthCard = document.getElementById('citizenAuthCard');
  const workerAuthCard = document.getElementById('workerAuthCard');

  const quickDemoCitizenBtn = document.getElementById('quickDemoCitizenBtn');
  const quickDemoDispatchBtn = document.getElementById('quickDemoDispatchBtn');
  const citizenQuickFill = document.getElementById('citizenQuickFill');
  const workerQuickFill = document.getElementById('workerQuickFill');

  const requestOtpLink = document.getElementById('requestOtpLink');
  const otpModal = document.getElementById('otpModal');
  const closeOtpModalBtn = document.getElementById('closeOtpModalBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const togglePassVisibility = document.getElementById('togglePassVisibility');
  const workerPassInput = document.getElementById('workerPassInput');

  const navUserName = document.getElementById('navUserName');
  const logoutBtn = document.getElementById('logoutBtn');
  const citizenPortalBtn = document.getElementById('citizenPortalBtn');
  const logisticsPortalBtn = document.getElementById('logisticsPortalBtn');
  const citizenView = document.getElementById('citizen-view');
  const logisticsView = document.getElementById('logistics-view');

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  const mahallaSelector = document.getElementById('mahallaSelector');
  const currentRegisteredCountEl = document.getElementById('currentRegisteredCount');
  const progressPercentageEl = document.getElementById('progressPercentage');
  const progressBarFillEl = document.getElementById('progressBarFill');
  const trackerRemainingTextEl = document.getElementById('trackerRemainingText');
  const heroStatusPillEl = document.getElementById('heroStatusPill');
  const callHeroActionBtn = document.getElementById('callHeroActionBtn');
  const joinRequestBtn = document.getElementById('joinRequestBtn');
  const scrollTrackerBtn = document.getElementById('scrollTrackerBtn');

  const aiClassifierForm = document.getElementById('aiClassifierForm');
  const wasteSearchInput = document.getElementById('wasteSearchInput');
  const classifierResultBox = document.getElementById('classifierResultBox');

  const citizenChatForm = document.getElementById('citizenChatForm');
  const citizenChatInput = document.getElementById('citizenChatInput');
  const citizenChatBody = document.getElementById('citizenChatBody');
  const clearChatBtn = document.getElementById('clearChatBtn');

  const logisticsChatForm = document.getElementById('logisticsChatForm');
  const logisticsChatInput = document.getElementById('logisticsChatInput');
  const logisticsChatBody = document.getElementById('logisticsChatBody');

  const redStatusBanner = document.getElementById('redStatusBanner');
  const redStatusAlertTitle = document.getElementById('redStatusAlertTitle');
  const redStatusAlertDesc = document.getElementById('redStatusAlertDesc');
  const instantDispatchBtn = document.getElementById('instantDispatchBtn');
  const reportsTableBody = document.getElementById('reportsTableBody');
  const exportReportBtn = document.getElementById('exportReportBtn');

  const shareModal = document.getElementById('shareModal');
  const openShareModalBtn = document.getElementById('openShareModalBtn');
  const closeShareModalBtn = document.getElementById('closeShareModalBtn');
  const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
  const shareLinkInput = document.getElementById('shareLinkInput');

  const newReportModal = document.getElementById('newReportModal');
  const openNewReportModalBtn = document.getElementById('openNewReportModalBtn');
  const closeNewReportModalBtn = document.getElementById('closeNewReportModalBtn');
  const newReportForm = document.getElementById('newReportForm');

  // ================= 1. AUTHENTICATION & LOGIN TABS =================

  // Switch Auth Tabs
  function setAuthTab(activeTab) {
    playSound('click');
    [tabCitizenBtn, tabWorkerBtn, tabOneIdBtn].forEach(b => b?.classList.remove('active'));
    
    if (activeTab === 'citizen') {
      tabCitizenBtn?.classList.add('active');
      if (citizenAuthCard) citizenAuthCard.style.opacity = '1';
      if (workerAuthCard) workerAuthCard.style.opacity = '0.7';
      citizenAuthCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (activeTab === 'worker') {
      tabWorkerBtn?.classList.add('active');
      if (workerAuthCard) workerAuthCard.style.opacity = '1';
      if (citizenAuthCard) citizenAuthCard.style.opacity = '0.7';
      workerAuthCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (activeTab === 'oneid') {
      tabOneIdBtn?.classList.add('active');
      showToast('🏛️ OneID E-Gov avtorizatsiya tizimiga yo\'naltirilmoqda...', 'info');
      setTimeout(() => {
        loginAsCitizen('Azizbek Rahmatov (OneID)', 'navroz');
      }, 700);
    }
  }

  tabCitizenBtn?.addEventListener('click', () => setAuthTab('citizen'));
  tabWorkerBtn?.addEventListener('click', () => setAuthTab('worker'));
  tabOneIdBtn?.addEventListener('click', () => setAuthTab('oneid'));

  // Password Visibility Toggle
  togglePassVisibility?.addEventListener('click', () => {
    if (workerPassInput) {
      const isPass = workerPassInput.type === 'password';
      workerPassInput.type = isPass ? 'text' : 'password';
      togglePassVisibility.textContent = isPass ? 'Yashirish' : 'Ko\'rsatish';
    }
  });

  // Login as Citizen helper
  function loginAsCitizen(name, mahallaKey) {
    const finalName = name || 'Sardor Aliyev';
    const finalMahalla = mahallaKey || 'navroz';

    state.currentUser = {
      role: 'citizen',
      name: finalName,
      mahallaKey: finalMahalla
    };
    state.currentMahallaKey = finalMahalla;
    if (mahallaSelector) mahallaSelector.value = finalMahalla;

    if (navUserName) {
      navUserName.textContent = `${finalName} (${state.mahallas[finalMahalla].shortName})`;
    }

    playSound('success');
    loginScreen?.classList.add('hidden');
    mainAppWrap?.classList.add('active');
    switchPortal('citizen');
    updateMahallaTrackerUI();
    showToast(`Xush kelibsiz, ${finalName}! 🌱`, 'success');
  }

  // Login as Worker helper
  function loginAsWorker(workerId, role) {
    const finalId = workerId || 'HERO-DISPATCH-01';
    state.currentUser = {
      role: 'worker',
      name: finalId,
      subRole: role || 'dispatcher'
    };

    if (navUserName) {
      navUserName.textContent = `⚡ ${finalId}`;
    }

    playSound('success');
    loginScreen?.classList.add('hidden');
    mainAppWrap?.classList.add('active');
    switchPortal('logistics');
    showToast(`Dispetcher tizimi faollashdi. ID: ${finalId}`, 'info');
  }

  // Submit Citizen Form
  citizenLoginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('citizenNameInput')?.value.trim() || 'Aholi vakili';
    const mahallaKey = document.getElementById('citizenMahallaSelect')?.value || 'navroz';

    if (citizenSubmitBtn) {
      citizenSubmitBtn.innerHTML = '<span>⏳</span> Tekshirilmoqda...';
      citizenSubmitBtn.disabled = true;
    }

    setTimeout(() => {
      if (citizenSubmitBtn) {
        citizenSubmitBtn.innerHTML = '<span>🌱</span> Aholi Sifatida Tizimga Kirish';
        citizenSubmitBtn.disabled = false;
      }
      loginAsCitizen(name, mahallaKey);
    }, 400);
  });

  // Submit Worker Form
  workerLoginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const workerId = document.getElementById('workerIdInput')?.value.trim() || 'HERO-DISPATCH-01';
    const workerRole = document.getElementById('workerRoleSelect')?.value || 'dispatcher';

    if (workerSubmitBtn) {
      workerSubmitBtn.innerHTML = '<span>⏳</span> Autentifikatsiya...';
      workerSubmitBtn.disabled = true;
    }

    setTimeout(() => {
      if (workerSubmitBtn) {
        workerSubmitBtn.innerHTML = '<span>⚡</span> Dispetcher Hub-ga Kirish';
        workerSubmitBtn.disabled = false;
      }
      loginAsWorker(workerId, workerRole);
    }, 400);
  });

  // Quick Demo Buttons
  quickDemoCitizenBtn?.addEventListener('click', () => loginAsCitizen('Sardor Aliyev', 'navroz'));
  quickDemoDispatchBtn?.addEventListener('click', () => loginAsWorker('HERO-DISPATCH-01', 'dispatcher'));
  citizenQuickFill?.addEventListener('click', () => {
    playSound('click');
    const nameIn = document.getElementById('citizenNameInput');
    if (nameIn) nameIn.value = 'Malika Karimova';
    showToast('Namuna ma\'lumotlari kiritildi', 'info');
  });
  workerQuickFill?.addEventListener('click', () => {
    playSound('click');
    loginAsWorker('HERO-LEAD-CHIEF', 'lead');
  });

  // OTP Modal
  requestOtpLink?.addEventListener('click', () => {
    playSound('click');
    otpModal?.classList.add('active');
  });

  closeOtpModalBtn?.addEventListener('click', () => {
    otpModal?.classList.remove('active');
  });

  otpModal?.addEventListener('click', (e) => {
    if (e.target === otpModal) otpModal.classList.remove('active');
  });

  verifyOtpBtn?.addEventListener('click', () => {
    otpModal?.classList.remove('active');
    loginAsCitizen('Tasdiqlangan Foydalanuvchi', 'navroz');
  });

  // Logout / Switch Role
  logoutBtn?.addEventListener('click', () => {
    playSound('click');
    state.currentUser = null;
    mainAppWrap?.classList.remove('active');
    loginScreen?.classList.remove('hidden');
    showToast('Tizimdan chiqildi. Qaytadan kirishingiz mumkin.', 'info');
  });

  // Portal Switcher
  function switchPortal(target) {
    playSound('click');
    if (target === 'citizen') {
      citizenPortalBtn?.classList.add('active');
      logisticsPortalBtn?.classList.remove('active');
      citizenView?.classList.add('active');
      logisticsView?.classList.remove('active');
    } else {
      logisticsPortalBtn?.classList.add('active');
      citizenPortalBtn?.classList.remove('active');
      logisticsView?.classList.add('active');
      citizenView?.classList.remove('active');
      updateLogisticsHUD();
    }
  }

  citizenPortalBtn?.addEventListener('click', () => switchPortal('citizen'));
  logisticsPortalBtn?.addEventListener('click', () => switchPortal('logistics'));

  // Sound Toggle
  soundToggleBtn?.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    if (soundIcon) soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    showToast(state.soundEnabled ? 'Ovoz effektlari yoqildi' : 'Ovoz effektlari o\'chirildi', 'info');
  });

  // Scroll to tracker
  scrollTrackerBtn?.addEventListener('click', () => {
    playSound('click');
    document.getElementById('tracker-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ================= 2. MAHALLA TRACKER (50-PERSON GOAL) =================
  function updateMahallaTrackerUI() {
    const current = state.mahallas[state.currentMahallaKey];
    if (!current) return;

    const count = current.count;
    const goal = current.goal;
    const pct = Math.min(100, Math.round((count / goal) * 100));
    const remaining = Math.max(0, goal - count);

    if (currentRegisteredCountEl) currentRegisteredCountEl.textContent = count;
    if (progressPercentageEl) progressPercentageEl.textContent = `${pct}%`;
    if (progressBarFillEl) progressBarFillEl.style.width = `${pct}%`;

    if (count >= goal) {
      if (trackerRemainingTextEl) {
        trackerRemainingTextEl.innerHTML = `🎉 <strong>Tabriklaymiz!</strong> Sizning mahallangizda <strong>${count}/${goal} kishi (${pct}%)</strong> to'plandi. "Call Our Hero" signali aktivlashgan! 🦸‍♂️`;
      }
      if (heroStatusPillEl) {
        heroStatusPillEl.className = 'hero-action-status-pill ready';
        heroStatusPillEl.innerHTML = '🚨 Qahramon Chaqiruvi Faol!';
      }
      callHeroActionBtn?.classList.add('urgent');
    } else {
      if (trackerRemainingTextEl) {
        trackerRemainingTextEl.innerHTML = `Sizning mahallangizda hozircha <strong>${count}/${goal} kishi (${pct}%)</strong> to'plandi. Qahramonlar kelishi uchun yana <strong>${remaining} kishi</strong> qoldi! 🚀`;
      }
      if (heroStatusPillEl) {
        heroStatusPillEl.className = 'hero-action-status-pill waiting';
        heroStatusPillEl.innerHTML = `⏳ ${remaining} Ariza Qoldi`;
      }
      callHeroActionBtn?.classList.remove('urgent');
    }

    if (shareLinkInput) {
      shareLinkInput.value = `https://callourhero.eco/join/${current.id}`;
    }

    updateLogisticsHUD();
  }

  mahallaSelector?.addEventListener('change', (e) => {
    state.currentMahallaKey = e.target.value;
    if (state.currentUser && state.currentUser.role === 'citizen') {
      if (navUserName) {
        navUserName.textContent = `${state.currentUser.name} (${state.mahallas[state.currentMahallaKey].shortName})`;
      }
    }
    playSound('click');
    updateMahallaTrackerUI();
  });

  // Add Request (+1)
  joinRequestBtn?.addEventListener('click', () => {
    const current = state.mahallas[state.currentMahallaKey];
    current.count += 1;
    state.userPoints += 50;

    playSound('success');
    showToast(`Arizangiz qabul qilindi! +50 Eko-Ball qo'shildi 🌱`, 'success');
    updateMahallaTrackerUI();

    if (current.count === 50) {
      playSound('hero_fanfare');
      triggerConfetti();
      showToast(`🏆 50 KISHILIK MARRA ZABT ETILDI! "Call Our Hero" signali yoqildi!`, 'alert');
    }
  });

  // Call Hero Mega Action
  callHeroActionBtn?.addEventListener('click', () => {
    const current = state.mahallas[state.currentMahallaKey];
    if (current.count >= current.goal) {
      playSound('hero_fanfare');
      triggerConfetti();
      showToast(`🚛 Qahramonlarimiz (Maxsus Eko-xizmat) ${current.shortName} ga yo'lga chiqdi!`, 'success');
      if (state.fleet[1]) {
        state.fleet[1].status = 'mission';
        const truck2 = document.getElementById('truckCard2');
        if (truck2) {
          const pill = truck2.querySelector('.status-pill');
          if (pill) {
            pill.className = 'status-pill mission';
            pill.textContent = 'Yo\'lda';
          }
        }
      }
    } else {
      playSound('alert');
      const remaining = current.goal - current.count;
      showToast(`Qahramonlarni chaqirish uchun yana ${remaining} ta ariza kerak. Qo'shnilarni taklif qiling! 📢`, 'info');
      openShareModal();
    }
  });

  // ================= 3. AI WASTE CLASSIFIER =================
  const wasteKnowledge = [
    {
      keywords: ['baklashka', 'butilka', 'plastik', 'flakon', 'kanistra', 'salafan', 'paket', 'shampun', 'qopqoq', 'kolbasa', 'idish', 'bir martalik', 'plastmassa', 'skotch'],
      category: 'Plastik (Plastic)',
      icon: '🔵',
      color: '#0ea5e9',
      advice: 'Idish ichini suvda chayqang, siqib hajmini kichraytiring va plastik qutisiga tashlang.'
    },
    {
      keywords: ['qogoz', 'qog\'oz', 'karton', 'korobka', 'daftar', 'kitob', 'jurnal', 'gazeta', 'quti', 'tuxum qutisi', 'qog\'oz paket', 'bloknot', 'etiketka'],
      category: 'Qog\'oz & Karton (Paper)',
      icon: '📦',
      color: '#f59e0b',
      advice: 'Quruq saqlang, tekis qilib taxlang. Yog\'li va nam qog\'ozlarni aralashtirmang.'
    },
    {
      keywords: ['banan', 'olma', 'sabzi', 'po\'st', 'po\'stloq', 'ovqat', 'meva', 'sabzavot', 'non', 'qahva', 'choy', 'barg', 'go\'sht', 'tuxum po\'chog\'i', 'suyak', 'oziq'],
      category: 'Organik Chiqindi (Organic)',
      icon: '🍏',
      color: '#10b981',
      advice: 'Maxsus kompost yoki organik idishga soling. Quruq qayta ishlanadigan chiqindilarga aralashtirmang.'
    },
    {
      keywords: ['batareyka', 'batareya', 'akkumulyator', 'telefon', 'lampochka', 'sim', 'elektronika', 'dori', 'zaryadchik', 'termometr', 'simkarta', 'planshet', 'lampa'],
      category: 'Maxsus & Xavfli Chiqindi (E-Waste)',
      icon: '🔋',
      color: '#8b5cf6',
      advice: 'Alohida qutiga soling. Hech qachon oddiy axlatga tashlamang! Xodimlarga topshiriladi.'
    },
    {
      keywords: ['shisha', 'banka', 'oyna', 'grafin', 'shisha butilka', 'bakal'],
      category: 'Shisha Idishlar (Glass)',
      icon: '🍾',
      color: '#38bdf8',
      advice: 'Chayqab tozalang, sinmagan holda shisha bo\'limiga joylashtiring.'
    },
    {
      keywords: ['konserva', 'metall', 'alyumin', 'temir', 'bonka', 'alyuminiy'],
      category: 'Metall & Konserva (Metal)',
      icon: '🥫',
      color: '#94a3b8',
      advice: 'Konserva bonkalarini suvda tozalab, quruq holda topshiring.'
    }
  ];

  aiClassifierForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = wasteSearchInput?.value.trim().toLowerCase();
    if (!query) return;

    playSound('click');
    let matched = null;

    for (const item of wasteKnowledge) {
      if (item.keywords.some(k => query.includes(k))) {
        matched = item;
        break;
      }
    }

    if (classifierResultBox) {
      classifierResultBox.style.display = 'block';
      if (matched) {
        playSound('success');
        classifierResultBox.style.borderColor = matched.color;
        classifierResultBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span style="font-size:20px;">${matched.icon}</span>
            <strong style="color: ${matched.color}; font-size:15px;">${matched.category}</strong>
          </div>
          <p style="font-size:13px; color:#e2e8f0;">💡 <strong>Tavsiya:</strong> ${matched.advice}</p>
        `;
      } else {
        playSound('info');
        classifierResultBox.style.borderColor = 'rgba(255,255,255,0.2)';
        classifierResultBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span style="font-size:18px;">♻️</span>
            <strong>Aralash / Qayta Ishlanadigan Chiqindi</strong>
          </div>
          <p style="font-size:12.5px; color:#94a3b8;">Ushbu chiqindini quruq va toza holda saqlang hamda qahramonlarimizga topshiring.</p>
        `;
      }
    }
  });

  document.querySelectorAll('.sort-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      playSound('click');
      if (wasteSearchInput) {
        if (cat === 'plastic') wasteSearchInput.value = 'Plastik butilka';
        if (cat === 'paper') wasteSearchInput.value = 'Karton quti';
        if (cat === 'organic') wasteSearchInput.value = 'Banan po\'stlog\'i';
        if (cat === 'ewaste') wasteSearchInput.value = 'Batareyka';
      }
      aiClassifierForm?.dispatchEvent(new Event('submit'));
    });
  });

  // ================= 4. CITIZEN AI CHATBOT =================
  function appendChatMessage(container, sender, text) {
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = `chat-bubble-wrap ${sender}`;
    wrap.innerHTML = `<div class="bubble">${text}</div>`;
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  }

  function simulateTypingResponse(container, fullText) {
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'chat-bubble-wrap ai';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = '<span style="opacity:0.6;">Yozmoqda... ✍️</span>';
    wrap.appendChild(bubble);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      bubble.innerHTML = fullText;
      container.scrollTop = container.scrollHeight;
      playSound('click');
    }, 400);
  }

  function getCitizenAiResponse(userText) {
    const text = userText.toLowerCase();
    const current = state.mahallas[state.currentMahallaKey];
    const count = current.count;
    const remaining = Math.max(0, current.goal - count);
    const pct = Math.min(100, Math.round((count / current.goal) * 100));

    if (text.includes('nechta') || text.includes('holat') || text.includes('odam') || text.includes('qancha') || text.includes('mahalladagi')) {
      return `Assalomu alaykum! 🌱 Sizning <strong>"${current.shortName}"</strong> mahallangizda hozircha <strong>${count}/50 kishi (${pct}%)</strong> ro'yxatdan o'tdi. <br><br>Qahramonlarimiz yetib kelishi uchun yana <strong>${remaining} nafar</strong> qo'shnimiz qo'shilishi kerak! 🦸‍♂️<br><br>📲 <em>Mahalla guruhiga xabar yuborib, 50 kishilik marrani tezroq zabt etaylik!</em>`;
    }

    if (text.includes('plastik') || text.includes('butilka')) {
      return `Plastik idishlarni topshirish bo'yicha maslahat: 🔵 <br>1. Idish ichini chayqab tozalang;<br>2. Uni siqib, hajmini iloji boricha kichraytiring;<br>3. Qopqog'ini alohida ajratib qo'ying.<br><br>Toza plastiklar 100% qayta ishlanadi! ♻️`;
    }

    if (text.includes('qachon') || text.includes('keladi') || text.includes('mashina') || text.includes('xizmat')) {
      if (count >= 50) {
        return `Xushxabar! 🚀 Sizning mahallangizda 50 kishilik talab bajarilgan (${count} ta ariza). Maxsus ekologik transportimiz yo'lda! Chiqindilaringizni tayyorlab turing.`;
      } else {
        return `Tizim qoidasiga ko'ra, har bir hududda kamida <strong>50 kishi</strong> to'plangandagina maxsus xizmat xodimlari zudlik bilan yetib keladi. Sizning mahallangizda yana <strong>${remaining} kishi</strong> qoldi. Qo'shnilarni taklif qiling! 🤝`;
      }
    }

    if (text.includes('qo\'shni') || text.includes('taklif') || text.includes('birlik') || text.includes('chorla')) {
      return `Qo'shnilar bilan birdamlik — eng katta kuchimiz! 🌟 <br>Mahallangiz Telegram guruhiga "Call Our Hero" havolasini yuboring. Birgalikda 50 kishini to'plab, toza mahallaga erishamiz!`;
    }

    return `Savolingiz uchun rahmat! 🌱 "Call Our Hero" tizimida har bir xonadon — tozalik qahramonidir. Chiqindilarni saralab topshirayotganingiz uchun minnatdormiz. Qo'shimcha savollaringiz bo'lsa, bemalol so'rang! ✨`;
  }

  citizenChatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = citizenChatInput?.value.trim();
    if (!text) return;

    appendChatMessage(citizenChatBody, 'user', text);
    if (citizenChatInput) citizenChatInput.value = '';
    playSound('click');

    const reply = getCitizenAiResponse(text);
    simulateTypingResponse(citizenChatBody, reply);
  });

  document.querySelectorAll('.chat-quick-prompts .quick-chip[data-query]').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (citizenChatInput) citizenChatInput.value = q;
      citizenChatForm?.dispatchEvent(new Event('submit'));
    });
  });

  clearChatBtn?.addEventListener('click', () => {
    playSound('click');
    if (citizenChatBody) {
      citizenChatBody.innerHTML = `
        <div class="chat-bubble-wrap ai">
          <div class="bubble">Chat tozalandi. Sizga qanday yordam bera olaman? 🌱</div>
        </div>
      `;
    }
  });

  // ================= 5. LOGISTICS & DISPATCH PORTAL =================
  function updateLogisticsHUD() {
    const redAreas = Object.values(state.mahallas).filter(m => m.count >= 50);
    if (redStatusAlertTitle && redStatusAlertDesc) {
      if (redAreas.length > 0) {
        const topRed = redAreas[0];
        redStatusAlertTitle.textContent = `QIZIL STATUS: "${topRed.shortName}" da ${topRed.count} nafar aholi to'plandi!`;
        redStatusAlertDesc.textContent = `Chiqindilarni olib chiqish uchun zudlik bilan Qahramonlar brigadasini yo'lga chiqaring.`;
        if (redStatusBanner) redStatusBanner.style.display = 'flex';
      } else {
        redStatusAlertTitle.textContent = `Barcha hududlar barqaror holatda.`;
        redStatusAlertDesc.textContent = `Hozirda 50+ to'plangan Qizil Statusdagi hududlar mavjud emas.`;
      }
    }
  }

  instantDispatchBtn?.addEventListener('click', () => {
    playSound('hero_fanfare');
    triggerConfetti();
    showToast(`🚛 Hero Truck #02 Chilonzor-9 ga zudlik bilan yo'naltirildi!`, 'alert');
    
    const truck2Card = document.getElementById('truckCard2');
    if (truck2Card) {
      const pill = truck2Card.querySelector('.status-pill');
      if (pill) {
        pill.className = 'status-pill mission';
        pill.textContent = 'Yo\'lda';
      }
    }

    appendChatMessage(logisticsChatBody, 'ai', `🚨 <strong>DISPETCHER XABARI:</strong> Chilonzor-9 ga 2-sonli brigada yo'naltirildi. Masofa: 3.4 km | Vaqt: ~11 daqiqa.`);
  });

  // Interactive Radar Map Pins
  document.querySelectorAll('.map-node').forEach(node => {
    node.addEventListener('click', () => {
      const name = node.getAttribute('data-name');
      playSound('click');
      showToast(`📍 Tanlangan hudud: ${name}`, 'info');
      if (logisticsChatInput) {
        logisticsChatInput.value = `${name} bo'yicha ma'lumot`;
      }
    });
  });

  function getLogisticsAiResponse(cmd) {
    const text = cmd.toLowerCase();

    if (text.includes('qizil') || text.includes('status') || text.includes('hudud')) {
      const redList = Object.values(state.mahallas).filter(m => m.count >= 50);
      let res = `🚨 <strong>QIZIL STATUS (50+) HUDUDLAR:</strong><br>`;
      if (redList.length === 0) {
        res += `Hozirda 50+ to'plangan hudud mavjud emas.`;
      } else {
        redList.forEach(m => {
          res += `• <strong>${m.shortName}</strong>: ${m.count} ta ariza (Zudlik bilan borish kerak)<br>`;
        });
      }
      return res;
    }

    if (text.includes('marshrut') || text.includes('optimal') || text.includes('yo\'l')) {
      return `🗺️ <strong>OPTIMAL MARSHRUT:</strong><br>
      1-manzil: <strong>Chilonzor-9</strong> (52 ta ariza — Qizil status | 3.4 km)<br>
      2-manzil: <strong>Yunusobod-14</strong> (47 ta ariza | 4.1 km)<br>
      Tejalgan vaqt: ~22 daqiqa.`;
    }

    if (text.includes('hisobot') || text.includes('safar')) {
      return `📋 <strong>SAFAR HISOBOTI:</strong><br>
      • Hudud: Chilonzor-9<br>
      • Chiqindi: 640 kg (Plastik: 240kg, Qog'oz: 210kg, Organik: 190kg)<br>
      • Vaqt: 35 daqiqa | Xonadonlar: 52 ta<br>
      • Status: Yakunlandi ✅`;
    }

    return `Ko'rsatma qabul qilindi. 50+ arizali hududlar 1-o'ringa qo'yiladi. Aniq buyruq bering (masalan: "Qizil hududlar", "Optimal yo'l", "Safar hisoboti").`;
  }

  logisticsChatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = logisticsChatInput?.value.trim();
    if (!text) return;

    appendChatMessage(logisticsChatBody, 'user', text);
    if (logisticsChatInput) logisticsChatInput.value = '';
    playSound('click');

    const reply = getLogisticsAiResponse(text);
    simulateTypingResponse(logisticsChatBody, reply);
  });

  document.querySelectorAll('.chat-quick-prompts .quick-chip[data-logistics]').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-logistics');
      if (logisticsChatInput) logisticsChatInput.value = q;
      logisticsChatForm?.dispatchEvent(new Event('submit'));
    });
  });

  // CSV Export
  exportReportBtn?.addEventListener('click', () => {
    playSound('click');
    let csvContent = "data:text/csv;charset=utf-8,Sana,Hudud,Chiqindi (kg),Vaqt,Xonadonlar,Status\n";
    state.reports.forEach(r => {
      csvContent += `${r.date},${r.area},${r.kg},${r.time},${r.households},${r.status}\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "COH_Reports.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Hisobot CSV formatida yuklab olindi 📥', 'success');
  });

  // ================= 6. MODALS =================
  function openShareModal() {
    playSound('click');
    shareModal?.classList.add('active');
  }

  function closeShareModal() {
    shareModal?.classList.remove('active');
  }

  openShareModalBtn?.addEventListener('click', openShareModal);
  closeShareModalBtn?.addEventListener('click', closeShareModal);
  shareModal?.addEventListener('click', (e) => {
    if (e.target === shareModal) closeShareModal();
  });

  copyShareLinkBtn?.addEventListener('click', () => {
    if (shareLinkInput) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
          playSound('success');
          showToast('Havola nusxalandi! 📋', 'success');
        }).catch(() => {
          shareLinkInput.select();
          document.execCommand('copy');
          playSound('success');
          showToast('Havola nusxalandi! 📋', 'success');
        });
      } else {
        shareLinkInput.select();
        document.execCommand('copy');
        playSound('success');
        showToast('Havola nusxalandi! 📋', 'success');
      }
    }
  });

  openNewReportModalBtn?.addEventListener('click', () => {
    playSound('click');
    newReportModal?.classList.add('active');
  });

  closeNewReportModalBtn?.addEventListener('click', () => {
    newReportModal?.classList.remove('active');
  });

  newReportModal?.addEventListener('click', (e) => {
    if (e.target === newReportModal) newReportModal?.classList.remove('active');
  });

  newReportForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const area = document.getElementById('reportAreaInput')?.value.trim();
    const kg = parseInt(document.getElementById('reportKgInput')?.value.trim(), 10);
    const time = parseInt(document.getElementById('reportTimeInput')?.value.trim(), 10);
    const households = parseInt(document.getElementById('reportHouseholdsInput')?.value.trim(), 10);

    if (!area || isNaN(kg) || isNaN(time)) return;

    const newReport = {
      date: new Date().toLocaleDateString('uz-UZ'),
      area,
      kg,
      time: `${time} daq`,
      households: households || 50,
      status: 'Yakunlandi'
    };

    state.reports.unshift(newReport);

    if (reportsTableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${newReport.date}</td>
        <td><strong>${newReport.area}</strong></td>
        <td>${newReport.kg} kg</td>
        <td>${newReport.time}</td>
        <td>${newReport.households} ta</td>
        <td><span class="status-pill ready">Yakunlandi</span></td>
      `;
      reportsTableBody.prepend(tr);
    }

    newReportModal?.classList.remove('active');
    newReportForm?.reset();
    playSound('success');
    showToast(`"${area}" safar hisoboti saqlandi ✅`, 'success');
  });

  // ================= 7. CONFETTI ENGINE =================
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#10b981', '#0ea5e9', '#ef4444', '#f59e0b', '#8b5cf6', '#34d399', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 160,
        y: canvas.height / 2 + 80,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 16 - 6,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.rotation += p.rSpeed;
        p.opacity -= 0.01;

        if (p.opacity > 0 && p.y < canvas.height) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    render();
  }

  // Initial setup
  updateMahallaTrackerUI();
});
