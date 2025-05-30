// Window management
function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = "flex";
  win.style.width = `${window.innerWidth / 2}px`;
  bringToFront(win);
}

function closeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = "none";
}

function bringToFront(win) {
  const allWindows = document.querySelectorAll(".window");
  let maxZ = 1000;
  allWindows.forEach((w) => {
    const z = parseInt(window.getComputedStyle(w).zIndex) || 1000;
    if (z > maxZ) maxZ = z;
  });
  win.style.zIndex = maxZ + 1;
}

// Make windows draggable
function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;

  const onDrag = function (e) {
    if (e.target.tagName === "BUTTON") return;

    isDragging = true;
    bringToFront(win);

    initialX = e.clientX - win.offsetLeft;
    initialY = e.clientY - win.offsetTop;

    header.style.cursor = "grabbing";
  };

  header.addEventListener("mousedown", onDrag);
  header.addEventListener("touchstart", onDrag);

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    // Keep window within bounds
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight - 40; // Account for taskbar

    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    win.style.left = currentX + "px";
    win.style.top = currentY + "px";
  });

  document.addEventListener("mouseup", function () {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = "move";
    }
  });

  // Bring window to front when clicked
  win.addEventListener("mousedown", function () {
    bringToFront(win);
  });
}

// Initialize draggable windows
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".window").forEach((win) => {
    makeDraggable(win);
    // Random positioning for variety
    const randomX = Math.random() * (window.innerWidth - 400);
    const randomY = Math.random() * (window.innerHeight - 300) + 50;
    win.style.left = randomX + "px";
    win.style.top = randomY + "px";
  });
});

// Start menu functionality
function toggleStartMenu() {
  const menu = document.getElementById("start-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// Close start menu when clicking elsewhere
document.addEventListener("click", function (event) {
  if (
    !event.target.closest("#start-button") &&
    !event.target.closest("#start-menu")
  ) {
    document.getElementById("start-menu").style.display = "none";
  }
});

// Clock functionality
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  document.getElementById("clock").textContent = `${timeString}\n${dateString}`;
}

// Update clock immediately and then every second
document.addEventListener("DOMContentLoaded", function () {
  updateClock();
  setInterval(updateClock, 1000);
});

// Prevent context menu on desktop
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("desktop")
    .addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
});

// Handle window resize
window.addEventListener("resize", function () {
  const windows = document.querySelectorAll(".window");
  windows.forEach((win) => {
    const rect = win.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      win.style.left = window.innerWidth - win.offsetWidth + "px";
    }
    if (rect.bottom > window.innerHeight - 40) {
      win.style.top = window.innerHeight - win.offsetHeight - 40 + "px";
    }
  });
});

// Click easter egg (if you found this by scraping my script.js then it doesn't count)
let clickCount = 0;
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("desktop").addEventListener("dblclick", function (e) {
    if (e.target === this) {
      clickCount++;
      if (clickCount === 3) {
        alert(
          "🎉 ...Oh? You found the secret desktop message!\n\nThanks for exploring my portfolio!",
        );
        clickCount = 0;
      }
    }
  });
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Alt + Tab to cycle through open windows
  if (e.altKey && e.key === "Tab") {
    e.preventDefault();
    const openWindows = Array.from(document.querySelectorAll(".window")).filter(
      (w) => w.style.display !== "none",
    );
    if (openWindows.length > 0) {
      const currentTop = openWindows.reduce((top, win) => {
        const z = parseInt(window.getComputedStyle(win).zIndex) || 1000;
        return z > (parseInt(window.getComputedStyle(top).zIndex) || 1000)
          ? win
          : top;
      });
      const currentIndex = openWindows.indexOf(currentTop);
      const nextIndex = (currentIndex + 1) % openWindows.length;
      bringToFront(openWindows[nextIndex]);
    }
  }

  // Escape to close all windows
  if (e.key === "Escape") {
    document.querySelectorAll(".window").forEach((win) => {
      win.style.display = "none";
    });
    document.getElementById("start-menu").style.display = "none";
  }
});

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // This makes it AM/PM format
  });

  document.getElementById("clock").textContent = timeString;
}

class Icon {
  constructor(text, onclick, imageSource, location) {
    this.text = text;
    this.onclick = onclick;
    this.imageSource = imageSource;
    this.location = location; // object with x and y, as offset from top left
    this.isBeingDragged = false;
  }
}

const icons = [
  new Icon(
    "About",
    () => openWindow("about-window"),
    "assets/icons/about.png",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "Projects",
    () => openWindow("projects-window"),
    "assets/icons/projects.png",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "Technologies",
    () => openWindow("technologies-window"),
    "assets/icons/technologies.png",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "Experience",
    () => openWindow("experience-window"),
    "assets/icons/experience.png",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "Education",
    () => openWindow("education-window"),
    "assets/icons/education.png",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "GitHub",
    () => window.open("https://github.com/aparkgh"),
    "assets/icons/github.png",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "LinkedIn",
    () => window.open("https://github.com/aparkgh"),
    "assets/icons/linkedin.webp",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "Email",
    () => (window.location.href = "mailto:andrew.park6126@gmail.com"),
    "assets/icons/email.png",
    {
      x: 0,
      y: 0,
    },
  ),
  new Icon(
    "Spotify",
    () =>
      window.open("https://open.spotify.com/user/229ll5brg0pwf57snpkikhd0r"),
    "assets/icons/spotify.png",
    {
      x: 100,
      y: 0,
    },
  ),
  new Icon("Spotify", () => {}, "assets/icons/spotify.png", {
    x: 200,
    y: 0,
  }),
];

icons.forEach((icon, i) => {
  icon.location.x = i * 50;
  icon.location.y = i * 50;
});

const getIconElement = (icon) => {
  // element is the dom element
  // and icon is the actual icon js class
  // look at this:
  //  https://stackoverflow.com/questions/6230834/html5-drag-and-drop-anywhere-on-the-screen

  const element = document.createElement("div");
  element.setAttribute("draggable", "true");
  element.classList.add("icon");
  element.addEventListener("click", icon.onclick);

  const image = document.createElement("img");
  image.setAttribute("alt", icon.text);
  image.setAttribute("src", icon.imageSource);
  element.append(image);

  const text = document.createElement("span");
  text.innerText = icon.text;
  element.append(text);

  element.style.left = `${icon.location.x}px`;
  element.style.top = `${icon.location.y}px`;

  element.addEventListener("mousedown", (e) => {
    icon.isBeingDragged = true;
  });

  element.addEventListener("mouseup", (e) => {
    if (!icon.isBeingDragged) return;

    icon.location.x = e.clientX;
    icon.location.y = e.clientY;
    console.log(`wanting to move to ${e.clientX}`);
    renderAllIcons();
  });

  return element;
};

const renderAllIcons = () => {
  icons.forEach((icon) => desktop.append(getIconElement(icon)));
  document.getElementById("desktop-icons").innerHTML = "";
};

document.addEventListener("DOMContentLoaded", function () {
  updateClock(); // Run once immediately
  setInterval(updateClock, 1000); // Then every second
  const track = document.querySelector(".scrolling-track");
  track.innerHTML += track.innerHTML;

  const desktop = document.getElementById("desktop");

  renderAllIcons();
});
