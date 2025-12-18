// =========================
// PROTEÇÃO DE LOGIN (OBRIGATÓRIA)
// =========================
const token = localStorage.getItem('auth_token');
const email = localStorage.getItem('auth_email');

if (!token || !email) {
  localStorage.clear();
  window.location.replace('/gerenciamento');
}


document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     ELEMENTOS
  ========================= */
  const dailyTarget = document.getElementById('dailyTarget')
  const dailyStop = document.getElementById('dailyStop')
  const initialRisk = document.getElementById('initialRisk')
  const maxRisk = document.getElementById('maxRisk')
  const payoutInput = document.getElementById('payout')

  const currentPnL = document.getElementById('currentPnL')
  const remainingTarget = document.getElementById('remainingTarget')
  const remainingStopEl = document.getElementById('remainingStop')
  const nextRiskEl = document.getElementById('nextRisk')
  const tradeStatus = document.getElementById('tradeStatus')

  const btnWin = document.getElementById('btnWin')
  const btnLoss = document.getElementById('btnLoss')
  const btnReset = document.getElementById('btnReset')

  /* =========================
     CONSTANTES
  ========================= */
  const WIN_FACTOR = 0.7
  const LOSS_FACTOR = 1.4
  const STORAGE_KEY = 'tradewr-risk-manager'

  /* =========================
     ESTADO
  ========================= */
  let state = {
    dailyTarget: 0,
    dailyStop: 0,
    initialRisk: 0,
    maxRisk: 0,
    payout: 0.8,

    result: 0,
    currentRisk: 0,
    dayClosed: false
  }

  loadState()
  bind()
  updateUI()

  /* =========================
     EVENTOS
  ========================= */
  function bind() {
    btnWin.addEventListener('click', () => trade('win'))
    btnLoss.addEventListener('click', () => trade('loss'))
    btnReset.addEventListener('click', resetDay)

    ;[dailyTarget, dailyStop, initialRisk, maxRisk, payoutInput]
      .forEach(i => i.addEventListener('input', configChanged))
  }

  /* =========================
     CONFIGURAÇÕES
  ========================= */
  function configChanged() {
    if (state.result !== 0) return

    state.dailyTarget = Number(dailyTarget.value) || 0
    state.dailyStop = Number(dailyStop.value) || 0
    state.initialRisk = Number(initialRisk.value) || 0
    state.maxRisk = Number(maxRisk.value) || 0
    state.payout = (Number(payoutInput.value) || 0) / 100

    state.currentRisk = state.initialRisk
    state.dayClosed = false

    saveState()
    updateUI()
  }

  /* =========================
     OPERAÇÕES
  ========================= */
  function trade(result) {
    if (state.dayClosed) return
    if (state.payout <= 0) return

    if (result === 'win') {
      state.result += state.currentRisk * state.payout
      state.currentRisk *= WIN_FACTOR
    } else {
      state.result -= state.currentRisk
      state.currentRisk *= LOSS_FACTOR
    }

    state.result = round(state.result)

    checkStops()
    recalcRisk()
    saveState()
    updateUI()
  }

  /* =========================
     REGRAS DE STOP
  ========================= */
  function checkStops() {
    const remainingStop = state.dailyStop + state.result

    if (state.dailyTarget > 0 && state.result >= state.dailyTarget) {
      closeDay('STOP GAIN BATIDO')
    }

    if (remainingStop <= 0) {
      closeDay('STOP LOSS BATIDO')
    }

    if (remainingStop < state.initialRisk) {
      closeDay('STOP LOSS (RISCO MÍNIMO)')
    }
  }

  function closeDay(message) {
    state.dayClosed = true
    tradeStatus.textContent = message
    tradeStatus.className = 'status-closed'

    btnWin.disabled = true
    btnLoss.disabled = true
    nextRiskEl.textContent = '—'
  }

  /* =========================
     CÁLCULO DE RISCO
  ========================= */
  function recalcRisk() {
    if (state.dayClosed) {
      state.currentRisk = 0
      return
    }

    const remainingToTarget = state.dailyTarget - state.result
    let neededRisk = remainingToTarget / state.payout

    let next = Math.min(state.currentRisk, neededRisk)

    if (next < state.initialRisk) next = state.initialRisk
    if (next > state.maxRisk) next = state.maxRisk

    const remainingStop = state.dailyStop + state.result
    if (next > remainingStop) next = remainingStop

    state.currentRisk = round(next)
  }

  /* =========================
     UI
  ========================= */
  function updateUI() {
    const remainingStop = state.dailyStop + state.result

    dailyTarget.value = state.dailyTarget || ''
    dailyStop.value = state.dailyStop || ''
    initialRisk.value = state.initialRisk || ''
    maxRisk.value = state.maxRisk || ''
    payoutInput.value = state.payout ? state.payout * 100 : ''

    currentPnL.textContent = money(state.result)
    remainingTarget.textContent = money(state.dailyTarget - state.result)
    remainingStopEl.textContent = money(remainingStop)

    nextRiskEl.textContent = state.dayClosed ? '—' : money(state.currentRisk)

    if (!state.dayClosed) {
      tradeStatus.textContent = 'OPERANDO'
      tradeStatus.className = 'status-running'
    }
  }

  /* =========================
     RESET
  ========================= */
  function resetDay() {
    state.result = 0
    state.currentRisk = state.initialRisk
    state.dayClosed = false

    btnWin.disabled = false
    btnLoss.disabled = false

    saveState()
    updateUI()
  }

  /* =========================
     STORAGE
  ========================= */
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      state = JSON.parse(saved)
    }
  }

  /* =========================
     HELPERS
  ========================= */
  function round(v) {
    return Number(v.toFixed(2))
  }

  function money(v) {
    return `R$ ${Number(v).toFixed(2)}`
  }

})
