function getNames() {
  const value = document.querySelector('#in_names').value.trim();
  return value.split(/[,\r\n]/g).map(v => v.trim()).filter(v => !!v);
}

function parseName(nameStr) {
  const weightRegex = /(\/\d+)/;
  const countRegex = /(\*\d+)/;
  const hasWeight = weightRegex.test(nameStr);
  const hasCount = countRegex.test(nameStr);
  const name = /^\s*([^\/*]+)?/.exec(nameStr)[1];
  const weight = hasWeight ? parseInt(weightRegex.exec(nameStr)[1].replace('/', '')) : 1;
  const count = hasCount ? parseInt(countRegex.exec(nameStr)[1].replace('*', '')) : 1;
  return {
    name,
    weight,
    count,
  };
}

function getReady() {
  const names = getNames();
  window.roulette.setMarbles(names);
  ready = names.length > 0;
  localStorage.setItem('mbr_names', names.join(','));
  applyWinnerSetting();
}

// 구슬 수가 바뀔 때마다 다시 호출된다. 범위 클리핑은 roulette이 하고, 잘린 결과를 input에 되돌려 쓴다.
// edited는 사용자가 방금 고친 범위 input('start' | 'end')
function applyWinnerSetting(edited) {
  const rankInput = document.querySelector('#in_winningRank');
  const startInput = document.querySelector('#in_rangeStart');
  const endInput = document.querySelector('#in_rangeEnd');

  let start;
  let end;
  switch (winnerType) {
    case 'first':
      start = end = 1;
      break;
    case 'last':
      start = end = window.roulette.getCount();
      break;
    case 'multi':
      start = parseInt(startInput.value, 10) || 1;
      end = parseInt(endInput.value, 10) || 1;
      // 뒤집힌 범위는 방금 고친 쪽을 존중하고 반대쪽을 따라오게 한다
      if (end < start) {
        if (edited === 'end') {
          start = end;
        } else {
          end = start;
        }
      }
      break;
    default:
      start = end = parseInt(rankInput.value, 10) || 1;
  }

  window.roulette.setWinnerRange(start - 1, end - 1);
  const clipped = window.roulette.getWinnerRange();
  // 범위 input은 여러명 모드일 때만 건드린다. 다른 모드가 덮어쓰면 사용자가 넣어둔 범위가 날아간다
  if (winnerType === 'multi') {
    startInput.value = clipped.start + 1;
    endInput.value = clipped.end + 1;
  } else {
    rankInput.value = clipped.start + 1;
  }

  document.querySelector('.btn-first-winner').classList.toggle('active', winnerType === 'first');
  document.querySelector('.btn-last-winner').classList.toggle('active', winnerType === 'last');
  document.querySelector('.btn-multi-winner').classList.toggle('active', winnerType === 'multi');
  rankInput.classList.toggle('active', winnerType === 'custom');
  document.querySelector('.row-range').classList.toggle('active', winnerType === 'multi');
}

function selectWinnerType(type, edited) {
  winnerType = type;
  applyWinnerSetting(edited);
}


let ready = false;
let winnerType = 'first';

document.addEventListener('DOMContentLoaded', () => {
  initialize();
});

function initialize() {
  if (!window.roulette || !window.roulette.isReady) {
    console.log('does not loaded yet');
    setTimeout(initialize, 100);
    return;
  }
  console.log('initializing start');

  const urlParams = new URLSearchParams(window.location.search);
  const namesFromUrl = urlParams.get('names');

  if (namesFromUrl) {
    document.querySelector('#in_names').value = namesFromUrl.replace(/,/g, '\n');
  } else {
    const savedNames = localStorage.getItem('mbr_names');
    if (savedNames) {
      document.querySelector('#in_names').value = savedNames;
    }
  }
  document.querySelector('#in_names').addEventListener('input', () => {
    getReady();
  });

  document.querySelector('#in_names').addEventListener('blur', () => {
    const nameSource = getNames();
    const nameSet = new Set();
    const nameCounts = Object.create(null);
    nameSource.forEach(nameSrc => {
      const name = parseName(nameSrc);
      const key = name.weight > 1 ? `${name.name}/${name.weight}` : name.name;
      if (!nameSet.has(key)) {
        nameSet.add(key);
        nameCounts[key] = 0;
      }
      nameCounts[key] += name.count;
    });
    const result = [];
    Object.keys(nameCounts).forEach(key => {
      if (nameCounts[key] > 1) {
        result.push(`${key}*${nameCounts[key]}`);
      } else {
        result.push(key);
      }
    });

    const oldValue = document.querySelector('#in_names').value;
    const newValue = result.join(',');

    if (oldValue !== newValue) {
      document.querySelector('#in_names').value = newValue;
      getReady();
    }
  });

  document.querySelector('#btnShuffle').addEventListener('click', () => {
    getReady();
  });

  const tiltControls = document.getElementById('tiltControls');
  const held = new Map();
  const tiltButtons = [...tiltControls.querySelectorAll('button')];

  function syncTilt() {
    const directions = new Set(held.values());
    for (const button of tiltButtons) {
      button.classList.toggle('held', directions.has(Number(button.dataset.dir)));
    }
    window.roulette.tilt(Number(directions.has(1)) - Number(directions.has(-1)));
  }

  function releaseTilt() {
    held.clear();
    syncTilt();
  }

  for (const button of tiltButtons) {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      held.set(event.pointerId, Number(button.dataset.dir));
      syncTilt();
    });
    button.addEventListener('lostpointercapture', (event) => {
      held.delete(event.pointerId);
      syncTilt();
    });
  }
  const keys = { ArrowLeft: -1, ArrowRight: 1 };
  for (const type of ['keydown', 'keyup']) {
    window.addEventListener(type, (event) => {
      if (tiltControls.hidden) return;
      if (type === 'keyup') {
        if (held.delete(event.key)) {
          event.preventDefault();
          syncTilt();
        }
        return;
      }
      const activatesButton = (event.key === ' ' || event.key === 'Enter') && tiltButtons.includes(event.target);
      const direction = activatesButton ? Number(event.target.dataset.dir) : keys[event.key];
      if (direction !== -1 && direction !== 1) return;
      event.preventDefault();
      if (event.repeat) return;
      held.set(event.key, direction);
      syncTilt();
    });
  }
  window.addEventListener('blur', releaseTilt);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseTilt();
  });

  document.querySelector('#btnStart').addEventListener('click', () => {
    if (!ready) return;
    document.querySelector('#settings').classList.add('hide');
    tiltControls.hidden = window.options.raceMode !== 'tilt';
    window.roulette.start();
  });

  document.querySelector('#chkAutoRecording').addEventListener('change', (e) => {
    window.options.autoRecording = e.target.matches(':checked');
    window.roulette.setAutoRecording(window.options.autoRecording);
  });

  const mode = document.querySelector('#sltMode');
  try {
    const saved = localStorage.getItem('pinpin.raceMode');
    if (saved === 'classic' || saved === 'gust' || saved === 'tilt') window.options.raceMode = saved;
  } catch { /* Use the default for this visit. */ }
  mode.value = window.options.raceMode;
  mode.addEventListener('change', () => {
    window.options.raceMode = mode.value;
    try { localStorage.setItem('pinpin.raceMode', mode.value); } catch { /* No storage available. */ }
  });

  const resolutionButtons = document.querySelectorAll('.btn-resolution');
  const syncResolutionButtons = () => {
    const current = window.roulette.getResolution();
    resolutionButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.resolution === current));
  };
  resolutionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      window.roulette.setResolution(btn.dataset.resolution);
      syncResolutionButtons();
    });
  });
  syncResolutionButtons();

  document.querySelector('#chkSkill').addEventListener('change', (e) => {
    window.options.useSkills = e.target.matches(':checked');
  });

  document.querySelector('#in_winningRank').addEventListener('change', () => selectWinnerType('custom'));
  document.querySelector('.btn-last-winner').addEventListener('click', () => selectWinnerType('last'));
  document.querySelector('.btn-first-winner').addEventListener('click', () => selectWinnerType('first'));
  document.querySelector('.btn-multi-winner').addEventListener('click', () => selectWinnerType('multi'));
  document.querySelector('#in_rangeStart').addEventListener('change', () => selectWinnerType('multi', 'start'));
  document.querySelector('#in_rangeEnd').addEventListener('change', () => selectWinnerType('multi', 'end'));

  window.roulette.addEventListener('goal', () => {
    tiltControls.hidden = true;
    releaseTilt();
    ready = false;
    setTimeout(() => {
      document.querySelector('#settings').classList.remove('hide');
    }, 3000);
  });

  window.roulette.addEventListener('message', (e) => {
    simpleToast(e.detail);
  });

  const toggleBtn = document.querySelector('#btnToggleSettings');
  const collapsible = document.querySelector('.collapsible-rows');
  toggleBtn.addEventListener('click', () => {
    const collapsed = collapsible.classList.toggle('collapsed');
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    toggleBtn.querySelector('.toggle-arrow').textContent =
      collapsible.classList.contains('collapsed') ? '▲' : '▼';
  });

  document.querySelector('#btnShuffle').click();

  // 기본 맵 + 맵 공유마당에서 받은 맵. 선택 기억과 ?installMap= 설치도 여기서 한다.
  // 맵을 바꾸면 살아남은 구슬에서 이름을 뽑아 재구성하는데, 골인한 구슬이 사라지고
  // 무게(/n)도 날아가므로 원본인 이름 입력창에서 다시 채운다
  window.initMapSelector(getReady, simpleToast);

  function simpleToast(msg) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = msg;

    if (window.translateElement) {
      console.log('try to translate');
      window.translateElement(toast);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 1200);
  }

}
