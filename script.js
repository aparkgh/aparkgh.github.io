function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'block';
}

function closeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
}

function makeDraggable(win) {
  const header = win.querySelector('.window-header');
  header.onmousedown = function (e) {
    let shiftX = e.clientX - win.getBoundingClientRect().left;
    let shiftY = e.clientY - win.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      win.style.left = pageX - shiftX + 'px';
      win.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);
    header.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);
      header.onmouseup = null;
    };
  };
}

document.querySelectorAll('.window').forEach(win => makeDraggable(win));


function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

document.addEventListener('click', function(event) {
  if (!event.target.closest('#start-button') && !event.target.closest('#start-menu')) {
    document.getElementById('start-menu').style.display = 'none';
  }
});
