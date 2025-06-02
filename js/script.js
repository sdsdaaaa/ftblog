// ✅ 전역 변수 (밖에 있어야 함)
let zIndex = 100;
let windowOffsetX = 80;
let windowOffsetY = 200;
const windowOffsetStep = 30;
let openWindows = JSON.parse(localStorage.getItem("openWindows") || "[]");
let suppressClickOnce = false;
let lastAutoMinimizedWindows = [];
let showTimer;
let hideTimer;
let isTaskbarVisible = false;




//openWindow 함수 1.시작
  function openWindow(id) {
      const existing = document.querySelector(`.window[data-id="${id}"]`);
if (existing) {
  existing.classList.remove('hide');
  existing.style.zIndex = ++zIndex;


  const btn = document.querySelector(`.taskbar-btn[data-target="${id}"]`);
  if (btn) btn.classList.remove('hidden');

  return;
}


      if (!openWindows.includes(id)) {
        openWindows.push(id);
        localStorage.setItem("openWindows", JSON.stringify(openWindows));
      }

      const win = document.createElement('div');
win.className = 'window';
win.dataset.id = id;
win.style.zIndex = ++zIndex;



win.style.top = `${windowOffsetY}px`;
win.style.left = `${windowOffsetX}px`;
win.style.width = '800px';
win.style.height = '600px';


windowOffsetX += windowOffsetStep;
windowOffsetY += windowOffsetStep;


if (windowOffsetX > window.innerWidth - 300) windowOffsetX = 80;
if (windowOffsetY > window.innerHeight - 250) windowOffsetY = 200;

      let isMaximized = false;
      let originalSize = {};

 win.innerHTML = `
  <div class="window-wrapper">
    <div class="window-header">
      <div class="window-left">
        <button class="pin-toggle-btn" title="고정">📌</button>
        <button class="window-layout-btn" title="배치">◧</button>
        <span class="window-title">${id}</span>
      </div>
    <div class="window-right">
      <button class="minimize-btn">─</button>
      <button class="toggle-max">🗗</button>
      <button class="close-btn">×</button>
    </div>
  </div>
 <div class="window-content">
        <iframe src="pages/${id}.html" style="width: 100%; height: 80vh; border: none;"></iframe>
      </div>
  <div class="resize-handle resize-br"></div>
  <div class="resize-handle resize-r"></div>
  <div class="resize-handle resize-b"></div>
  <div class="resize-handle resize-l"></div>
  <div class="resize-handle resize-t"></div>
  <div class="resize-handle resize-tl"></div>
  <div class="resize-handle resize-tr"></div>
  <div class="resize-handle resize-bl"></div>
`;


const pinBtn = win.querySelector('.pin-toggle-btn');
win.dataset.pinned = "false";

pinBtn.addEventListener('click', () => {
  const isPinned = win.dataset.pinned === "true";
  const rect = win.getBoundingClientRect();
  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;
  const header = win.querySelector('.window-header');

  win.style.transition = 'none';

  if (!isPinned) {
    // 고정 ON
    const top = rect.top + scrollTop;
    const left = rect.left + scrollLeft;

    win.style.position = "absolute";
    win.style.top = `${top}px`;
    win.style.left = `${left}px`;

    win.dataset.pinned = "true";
    win.classList.add("pinned");
    pinBtn.classList.add("pinned");
    header.style.cursor = "default";

    // 🔒 버튼 비활성화
    minimizeBtn.disabled = true;
    toggleMaxBtn.disabled = true;
  } else {
    // 고정 OFF
    const top = parseFloat(win.style.top) - scrollTop;
    const left = parseFloat(win.style.left) - scrollLeft;

    win.style.position = "fixed";
    win.style.top = `${top}px`;
    win.style.left = `${left}px`;

    win.dataset.pinned = "false";
    win.classList.remove("pinned");
    pinBtn.classList.remove("pinned");
    header.style.cursor = "move";

    // 🔓 버튼 활성화
    minimizeBtn.disabled = false;
    toggleMaxBtn.disabled = false;
  }

  setTimeout(() => {
    win.style.transition = '';
  }, 30);
});





const minimizeBtn = win.querySelector('.minimize-btn');
const toggleMaxBtn = win.querySelector('.toggle-max');
const closeBtn = win.querySelector('.close-btn');

minimizeBtn.onclick = () => {
  if (win.dataset.pinned === "true") return; // 고정 상태일 땐 무시
  unpinWindow(win);
  minimizeWindow(id);
};

toggleMaxBtn.onclick = () => {
  if (win.dataset.pinned === "true") return; // 고정 상태일 땐 무시
  unpinWindow(win);

  if (!isMaximized) {
    originalSize = {
      width: win.style.width || `${win.offsetWidth}px`,
      height: win.style.height || `${win.offsetHeight}px`,
      top: win.style.top || `${win.offsetTop}px`,
      left: win.style.left || `${win.offsetLeft}px`,
      position: win.style.position || 'fixed'
    };
    Object.assign(win.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: ++zIndex
    });
    isMaximized = true;
  } else {
    Object.assign(win.style, originalSize);
    isMaximized = false;
  }
};
closeBtn.onclick = () => {
  unpinWindow(win);           // 📌 고정 해제
  closeWindow(id);            // 닫기
};



const layoutBtn = win.querySelector('.window-layout-btn');
layoutBtn.addEventListener('click', (e) => {
  e.stopPropagation();

  const existingMenu = document.querySelector('.window-layout-menu');
  if (existingMenu) existingMenu.remove();

  const menu = createLayoutMenu(win);
  const rect = layoutBtn.getBoundingClientRect();
  menu.style.left = `${rect.left + 20}px`;
  menu.style.top = `${rect.top + 20}px`;
  document.body.appendChild(menu);
});

document.addEventListener('click', () => {
  const existingMenu = document.querySelector('.window-layout-menu');
  if (existingMenu) existingMenu.remove();
});



      document.body.appendChild(win);

      const btn = document.createElement('div');
      btn.className = 'taskbar-btn';
      btn.textContent = id;
      btn.dataset.target = id;
      btn.onclick = (e) => {
  if (suppressClickOnce) {
    suppressClickOnce = false;
    e.stopPropagation(); //
    return;
  }

  
  const target = document.querySelector(`.window[data-id="${id}"]`);
  if (target.classList.contains('hide')) {
    target.classList.remove('hide');
    btn.classList.remove('hidden');
  } else {
    target.classList.add('hide');
    btn.classList.add('hidden');
  }
  target.style.zIndex = ++zIndex;
};


      document.getElementById('taskbar-icons').appendChild(btn);
temporarilyShowTaskbar();
      const header = win.querySelector('.window-header');
      header.addEventListener('mousedown', function(e) {
  if (isMaximized || win.dataset.pinned === "true" || header.dataset.disableDrag === "true") return;

   win.style.transition = 'none';

  const winX = win.offsetLeft;
  const winY = win.offsetTop;
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const onMouseMove = (moveEvent) => {
    const dx = moveEvent.clientX - mouseX;
    const dy = moveEvent.clientY - mouseY;

    const newLeft = winX + dx;
    const newTop = winY + dy;

    win.style.left = `${Math.min(Math.max(0, newLeft), window.innerWidth - win.offsetWidth)}px`;
    win.style.top = `${Math.min(Math.max(0, newTop), window.innerHeight - win.offsetHeight)}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    win.style.transition = '';
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});




      const br = win.querySelector('.resize-br');
const r = win.querySelector('.resize-r');
const b = win.querySelector('.resize-b');
const l = win.querySelector('.resize-l');
const t = win.querySelector('.resize-t');
const tl = win.querySelector('.resize-tl');
const tr = win.querySelector('.resize-tr');
const bl = win.querySelector('.resize-bl');

br.addEventListener('mousedown', e => resize('br', e));
r.addEventListener('mousedown', e => resize('r', e));
b.addEventListener('mousedown', e => resize('b', e));
l.addEventListener('mousedown', e => resize('l', e));
t.addEventListener('mousedown', e => resize('t', e));
tl.addEventListener('mousedown', e => resize('tl', e));
tr.addEventListener('mousedown', e => resize('tr', e));
bl.addEventListener('mousedown', e => resize('bl', e));

     const resize = (dir, e) => {
  e.preventDefault();
  win.style.transition = 'none';
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = win.offsetWidth;
  const startHeight = win.offsetHeight;
  const startLeft = win.offsetLeft;
  const startTop = win.offsetTop;

     function onMouseMove(e) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (dir.includes('r')) {
      win.style.width = `${Math.max(200, startWidth + dx)}px`;
    }
    if (dir.includes('b')) {
      win.style.height = `${Math.max(100, startHeight + dy)}px`;
    }
    if (dir.includes('l')) {
      const newWidth = startWidth - dx;
      const newLeft = startLeft + dx;
      if (newWidth >= 200) {
        win.style.width = `${newWidth}px`;
        win.style.left = `${newLeft}px`;
      }
    }
    if (dir.includes('t')) {
      const newHeight = startHeight - dy;
      const newTop = startTop + dy;
      if (newHeight >= 100) {
        win.style.height = `${newHeight}px`;
        win.style.top = `${newTop}px`;
      }
    }
  }
       function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    win.style.transition = '';
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp, { once: true });
};

      br.addEventListener('mousedown', e => resize('rb', e));
      r.addEventListener('mousedown', e => resize('r', e));
      b.addEventListener('mousedown', e => resize('b', e));
    }

//openWindow함수 1.끝



//closeWindow 함수 2.시작
function closeWindow(id) {
  const win = document.querySelector(`.window[data-id="${id}"]`);
  const btn = document.querySelector(`.taskbar-btn[data-target="${id}"]`);
  
  if (win) win.remove();

  if (btn) {
    btn.remove();
    temporarilyShowTaskbar();
  }

  openWindows = openWindows.filter(w => w !== id);
  localStorage.setItem("openWindows", JSON.stringify(openWindows));
}
//closeWindow 함수 2.끝



//minimizeWindow 함수 3.시작
function minimizeWindow(id) {
  const win = document.querySelector(`.window[data-id="${id}"]`);
  const btn = document.querySelector(`.taskbar-btn[data-target="${id}"]`);
  if (win) win.classList.add('hide');
  if (btn) btn.classList.add('hidden'); 
}
//minimizeWindow 함수 3.끝



//toggleRightMenu 함수 4.시작
function toggleRightMenu() {
  document.getElementById('right-menu-panel').classList.toggle('active');
}
//toggleRightMenu 함수 4.끝



//handleMenuClick 함수 5.시작
function handleMenuClick(id) {
  openWindow(id); 
  setTimeout(() => {
    document.getElementById('right-menu-panel').classList.remove('active');
  }, 2000); 
}
//handleMenuClick 함수 5.끝

//function unpinWindow 함수 5.5.시작
function unpinWindow(win) {
  if (win.dataset.pinned === "true") {
    win.dataset.pinned = "false";
    win.classList.remove("pinned");
    const pinBtn = win.querySelector(".pin-toggle-btn");
    if (pinBtn) pinBtn.classList.remove("pinned");
    win.style.position = "fixed";
  }
}
//function unpinWindow 함수 5.5끝





//temporarilyShowTaskbar 함수 6.시작
function temporarilyShowTaskbar() {
  const taskbar = document.getElementById('taskbar');
  taskbar.style.left = '0px';

  setTimeout(() => {
    taskbar.style.left = '-60px';
    isTaskbarVisible = false;
  }, 2000); 
}
//temporarilyShowTaskbar 함수 6.끝

//positionWindow 함수 7.시작
function positionWindow(win, pos) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  win.style.position = 'fixed';

  switch (pos) {
    case 'top-left':
      win.style.left = '0px';
      win.style.top = '0px';
      win.style.width = width / 2 + 'px';
      win.style.height = height / 2 + 'px';
      break;
    case 'top-right':
      win.style.left = width / 2 + 'px';
      win.style.top = '0px';
      win.style.width = width / 2 + 'px';
      win.style.height = height / 2 + 'px';
      break;
    case 'bottom-left':
      win.style.left = '0px';
      win.style.top = height / 2 + 'px';
      win.style.width = width / 2 + 'px';
      win.style.height = height / 2 + 'px';
      break;
    case 'bottom-right':
      win.style.left = width / 2 + 'px';
      win.style.top = height / 2 + 'px';
      win.style.width = width / 2 + 'px';
      win.style.height = height / 2 + 'px';
      break;
    case 'left-half':
      win.style.left = '0px';
      win.style.top = '0px';
      win.style.width = width / 2 + 'px';
      win.style.height = height + 'px';
      break;
    case 'right-half':
      win.style.left = width / 2 + 'px';
      win.style.top = '0px';
      win.style.width = width / 2 + 'px';
      win.style.height = height + 'px';
      break;
  }
}
//positionWindow 함수 7.끝

//createLayoutMenu 함수 8.시작
function createLayoutMenu(win) {
  const menu = document.createElement('div');
  menu.className = 'window-layout-menu';
  menu.style.position = 'absolute';
  menu.style.zIndex = '9999';
  menu.style.background = '#fff';
  menu.style.border = '1px solid #aaa';
  menu.style.borderRadius = '6px';
  menu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  menu.style.padding = '8px';
  menu.style.display = 'grid';
  menu.style.gridTemplateColumns = '1fr 1fr';
  menu.style.gap = '6px';
  menu.style.width = '100px';

  const positions = [
    { pos: 'top-left',    style: 'top:0; left:0; width:50%; height:50%;' },
    { pos: 'top-right',   style: 'top:0; right:0; width:50%; height:50%;' },
    { pos: 'bottom-left', style: 'bottom:0; left:0; width:50%; height:50%;' },
    { pos: 'bottom-right',style: 'bottom:0; right:0; width:50%; height:50%;' },
    { pos: 'left-half',   style: 'top:0; bottom:0; left:0; width:50%; height:100%;' },
    { pos: 'right-half',  style: 'top:0; bottom:0; right:0; width:50%; height:100%;' },
  ];

  positions.forEach(({ pos, style }) => {
    const item = document.createElement('div');
    item.dataset.pos = pos;
    item.style.position = 'relative';
    item.style.width = '40px';
    item.style.height = '40px';
    item.style.border = '1px solid #999';
    item.style.borderRadius = '4px';
    item.style.cursor = 'pointer';
    item.style.background = '#f0f0f0';
    item.style.overflow = 'hidden';
    item.style.transition = 'transform 0.2s';

    const blackPart = document.createElement('div');
    blackPart.style.position = 'absolute';
    blackPart.style.background = '#375a7f';
    blackPart.style.cssText += style;

    item.appendChild(blackPart);

    item.onmouseenter = () => item.style.transform = 'scale(1.05)';
    item.onmouseleave = () => item.style.transform = 'scale(1)';

    item.onclick = () => {
      positionWindow(win, pos);
      menu.remove();
    };

    menu.appendChild(item);
  });

  return menu;
}
//createLayoutMenu함수 8.끝







//DOMContentLoaded 이후 실행해야 할 부분 DOM.시작

document.addEventListener("DOMContentLoaded", function () {

// 페이지 로드시 열려 있던 창 복원 9.시작
 openWindows.forEach(id => {
    openWindow(id);
    const win = document.querySelector(`.window[data-id="${id}"]`);
    const btn = document.querySelector(`.taskbar-btn[data-target="${id}"]`);
    if (win) win.classList.add('hide');
    if (btn) btn.classList.add('hidden');
  });
// 페이지 로드시 열려 있던 창 복원 9.끝

// 작업표시줄 홈 버튼 클릭 이벤트 등록 10.시작
document.querySelector('.taskbar-home').addEventListener('click', () => {
  const allWindows = document.querySelectorAll('.window');
  const visibleWindows = [...allWindows].filter(w => !w.classList.contains('hide'));

  if (visibleWindows.length > 0) {
    lastAutoMinimizedWindows = visibleWindows.map(w => w.dataset.id);

    visibleWindows.forEach(win => {
      win.classList.add('hide');
      const id = win.dataset.id;
      const btn = document.querySelector(`.taskbar-btn[data-target="${id}"]`);
      if (btn) btn.classList.add('hidden');  
    });

  } else {
    lastAutoMinimizedWindows.forEach(id => {
      const win = document.querySelector(`.window[data-id="${id}"]`);
      const btn = document.querySelector(`.taskbar-btn[data-target="${id}"]`);
      if (win) {
        win.classList.remove('hide');
        win.style.zIndex = ++zIndex;
      }
      if (btn) btn.classList.remove('hidden');  
    });

    lastAutoMinimizedWindows = [];
  }
});
// 작업표시줄 홈 버튼 클릭 이벤트 등록 10.끝

//우클릭 컨텍스트 메뉴 동작 11.시작
document.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('.taskbar-btn');
  if (!btn) return;


  pressTimer = setTimeout(() => {
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = `${btn.getBoundingClientRect().left}px`;
    menu.style.top = `${btn.getBoundingClientRect().top - 40}px`;
    menu.dataset.target = btn.dataset.target;

suppressClickOnce = true;
  }, 1000); 
});

document.addEventListener('mouseup', () => {
  clearTimeout(pressTimer); 
});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu) return;

  if (suppressClickOnce) {
    suppressClickOnce = false; 
    return;
  }


  if (!menu.contains(e.target)) {
    menu.style.display = 'none';
  }
});
//우클릭 컨텍스트 메뉴 동작 11.끝

// 컨텍스트 메뉴 닫기 버튼 12.시작
const taskbar = document.getElementById('taskbar');
  const sensor = document.getElementById('taskbar-sensor');

  if (taskbar && sensor) {
    sensor.addEventListener('mouseenter', () => {
      showTimer = setTimeout(() => {
        taskbar.style.left = '0px';
        isTaskbarVisible = true;
      }, 300); 
    });

    sensor.addEventListener('mouseleave', () => {
      clearTimeout(showTimer);
    });

    document.body.addEventListener('mousemove', (e) => {
      if (isTaskbarVisible && e.clientX > 80) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          taskbar.style.left = '-60px';
          isTaskbarVisible = false;
        }, 200);
      }
    });
  }
//작업바 센서 자동 열기/닫기 12.끝


const closeBtn = document.getElementById("ctx-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const id = document.getElementById("context-menu").dataset.target;
      closeWindow(id);
      document.getElementById("context-menu").style.display = "none";
    });
  }

});

window.toggleRightMenu = toggleRightMenu;
window.handleMenuClick = handleMenuClick;

