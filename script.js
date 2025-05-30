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
  constructor(text, onclick, imageSource, location, desktopPosition) {
    this.text = text;
    this.onclick = onclick;
    this.imageSource = imageSource;
    this.location = location; // object with x and y, as offset from top left
    this.desktopPosition = desktopPosition; // custom desktop positioning
    this.isBeingDragged = false;
    this.dragOffset = { x: 0, y: 0 }; // Store offset from mouse to icon position
  }
}

const icons = [
  new Icon(
    "About Me",
    () => openWindow("about-window"),
    "assets/icons/about.png",
    { x: 0, y: 0 },
    { top: 50, left: 50 }
  ),
  new Icon(
    "Projects",
    () => openWindow("projects-window"),
    "assets/icons/projects.png",
    { x: 0, y: 0 },
    { top: 150, left: 200 }
  ),
  new Icon(
    "Technologies",
    () => openWindow("technologies-window"),
    "assets/icons/technologies.png",
    { x: 0, y: 0 },
    { top: 80, right: 100 }
  ),
  new Icon(
    "Experience",
    () => openWindow("experience-window"),
    "assets/icons/experience.png",
    { x: 0, y: 0 },
    { top: 200, right: 250 }
  ),
  new Icon(
    "Education",
    () => openWindow("education-window"),
    "assets/icons/education.png",
    { x: 0, y: 0 },
    { top: 300, left: 100 }
  ),
  new Icon(
    "GitHub",
    () => window.open("https://github.com/aparkgh"),
    "assets/icons/github.png",
    { x: 0, y: 0 },
    { top: 250, left: 400 }
  ),
  new Icon(
    "LinkedIn",
    () => window.open("https://www.linkedin.com/in/andrewpark-/"),
    "assets/icons/linkedin.webp",
    { x: 0, y: 0 },
    { top: 120, left: 350 }
  ),
  new Icon(
    "Email",
    () => (window.location.href = "mailto:andrew.park6126@gmail.com"),
    "assets/icons/email.png",
    { x: 0, y: 0 },
    { top: 350, right: 150 }
  ),
  new Icon(
    "Spotify",
    () =>
      window.open("https://open.spotify.com/user/229ll5brg0pwf57snpkikhd0r"),
    "assets/icons/spotify.png",
    { x: 0, y: 0 },
    { top: 450, right: 320 } // Added desktop position for Spotify
  ),
];

// Function to check if device is mobile
const isMobile = () => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Set initial positions based on device type
const setInitialPositions = () => {
  if (isMobile()) {
    // Grid layout for mobile
    icons.forEach((icon, i) => {
      icon.location.x = (i % 3) * 100 + 50; // 3 columns
      icon.location.y = Math.floor(i / 3) * 100 + 50;
    });
  } else {
    // Custom positioning for desktop
    icons.forEach((icon) => {
      const pos = icon.desktopPosition;
      
      if (pos.left !== undefined) {
        icon.location.x = pos.left;
      } else if (pos.right !== undefined) {
        icon.location.x = window.innerWidth - pos.right - 80; // 80px for icon width
      }
      
      icon.location.y = pos.top;
    });
  }
};

// Global variables for drag state
let draggedIcon = null;
let isDragging = false;

const getIconElement = (icon) => {
  const element = document.createElement("div");
  element.classList.add("icon");
  element.style.position = "absolute";
  element.style.cursor = "pointer";
  element.style.userSelect = "none";
  element.style.touchAction = "none"; // Prevent scrolling on touch

  const image = document.createElement("img");
  image.setAttribute("alt", icon.text);
  image.setAttribute("src", icon.imageSource);
  image.style.pointerEvents = "none"; // Prevent image from interfering with events
  element.append(image);

  const text = document.createElement("span");
  text.innerText = icon.text;
  text.style.display = "block";
  text.style.textAlign = "center";
  text.style.pointerEvents = "none";
  element.append(text);

  element.style.left = `${icon.location.x}px`;
  element.style.top = `${icon.location.y}px`;

  // Mouse events
  element.addEventListener("mousedown", (e) => startDrag(e, icon, element));
  
  // Touch events for mobile
  element.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent default touch behavior
    const touch = e.touches[0];
    startDrag(touch, icon, element);
  });

  // Click handler (only if not dragged)
  element.addEventListener("click", (e) => {
    if (!isDragging) {
      icon.onclick();
    }
  });

  return element;
};

const startDrag = (e, icon, element) => {
  draggedIcon = icon;
  isDragging = false; // Reset at start
  
  // Calculate offset from mouse/touch to icon position
  const rect = element.getBoundingClientRect();
  icon.dragOffset.x = e.clientX - rect.left;
  icon.dragOffset.y = e.clientY - rect.top;
  
  icon.isBeingDragged = true;
  element.style.zIndex = "1000"; // Bring to front while dragging
};

// Global mouse/touch move handler
const handleMove = (e) => {
  if (!draggedIcon || !draggedIcon.isBeingDragged) return;
  
  e.preventDefault();
  isDragging = true; // Mark as dragging to prevent click
  
  // Get client coordinates (works for both mouse and touch)
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
  // Update icon position accounting for offset
  draggedIcon.location.x = clientX - draggedIcon.dragOffset.x;
  draggedIcon.location.y = clientY - draggedIcon.dragOffset.y;
  
  // Keep icon within viewport bounds
  const maxX = window.innerWidth - 80; // Assuming icon width ~80px
  const maxY = window.innerHeight - 80; // Assuming icon height ~80px
  
  draggedIcon.location.x = Math.max(0, Math.min(maxX, draggedIcon.location.x));
  draggedIcon.location.y = Math.max(0, Math.min(maxY, draggedIcon.location.y));
  
  renderAllIcons();
};

// Global mouse/touch end handler
const handleEnd = (e) => {
  if (draggedIcon) {
    draggedIcon.isBeingDragged = false;
    
    // Find and reset z-index
    const element = document.querySelector(`.icon:nth-child(${icons.indexOf(draggedIcon) + 1})`);
    if (element) {
      element.style.zIndex = "auto";
    }
    
    draggedIcon = null;
    
    // Reset isDragging after a short delay to prevent click from firing
    setTimeout(() => {
      isDragging = false;
    }, 100);
  }
};

// Add global event listeners
document.addEventListener("mousemove", handleMove);
document.addEventListener("mouseup", handleEnd);
document.addEventListener("touchmove", handleMove, { passive: false });
document.addEventListener("touchend", handleEnd);

const renderAllIcons = () => {
  const desktop = document.getElementById("desktop-icons");
  if (!desktop) {
    console.error("Desktop container not found! Make sure you have an element with id 'desktop-icons'");
    return;
  }
  
  // Clear existing icons
  desktop.innerHTML = "";
  
  // Render all icons
  icons.forEach((icon) => {
    desktop.appendChild(getIconElement(icon));
  });
};

// Handle window resize to reposition icons
window.addEventListener('resize', () => {
  setInitialPositions();
  renderAllIcons();
});

// Initialize
setInitialPositions();
renderAllIcons();

document.addEventListener("DOMContentLoaded", function () {
  updateClock(); // Run once immediately
  setInterval(updateClock, 1000); // Then every second
  const track = document.querySelector(".scrolling-track");
  track.innerHTML += track.innerHTML;

  const desktop = document.getElementById("desktop");

  renderAllIcons();
});

// Selection rectangle variables
let isSelecting = false;
let selectionStart = { x: 0, y: 0 };
let selectionRect = null;

// Create selection rectangle element
const createSelectionRect = () => {
  const rect = document.createElement('div');
  rect.id = 'selection-rectangle';
  rect.style.position = 'fixed';
  rect.style.border = '1px solid #0078d4';
  rect.style.backgroundColor = 'rgba(0, 120, 212, 0.1)';
  rect.style.pointerEvents = 'none';
  rect.style.zIndex = '999';
  rect.style.display = 'none';
  document.body.appendChild(rect);
  return rect;
};

// Initialize selection rectangle
selectionRect = createSelectionRect();

// Start selection on desktop mousedown (but not on icons)
const handleDesktopMouseDown = (e) => {
  // Check if we're NOT clicking on an icon or other interactive element
  const isIcon = e.target.closest('.icon');
  const isInteractive = e.target.closest('.start-menu, button, input, select, textarea, a');
  const isTaskbar = e.target.closest('#taskbar, .taskbar');
  
  if (!isIcon && !isInteractive && !isTaskbar) {
    isSelecting = true;
    selectionStart.x = e.clientX;
    selectionStart.y = e.clientY;
    
    // Show the selection rectangle
    selectionRect.style.display = 'block';
    selectionRect.style.left = e.clientX + 'px';
    selectionRect.style.top = e.clientY + 'px';
    selectionRect.style.width = '0px';
    selectionRect.style.height = '0px';
    
    e.preventDefault(); // Prevent text selection
  }
};

// Update selection rectangle during mouse move
const handleSelectionMove = (e) => {
  if (!isSelecting) return;
  
  const currentX = e.clientX;
  const currentY = e.clientY;
  
  // Calculate rectangle dimensions
  const left = Math.min(selectionStart.x, currentX);
  const top = Math.min(selectionStart.y, currentY);
  const width = Math.abs(currentX - selectionStart.x);
  const height = Math.abs(currentY - selectionStart.y);
  
  // Update rectangle position and size
  selectionRect.style.left = left + 'px';
  selectionRect.style.top = top + 'px';
  selectionRect.style.width = width + 'px';
  selectionRect.style.height = height + 'px';
};

// End selection on mouseup
const handleSelectionEnd = (e) => {
  if (isSelecting) {
    isSelecting = false;
    selectionRect.style.display = 'none';
    
    // Here you could add logic to select icons that are within the rectangle
    // For now, we'll just hide the rectangle
  }
};

// Add event listeners for selection
document.addEventListener('mousedown', handleDesktopMouseDown, true); // Use capture phase
document.addEventListener('mousemove', (e) => {
  handleSelectionMove(e);
  // Also call the existing handleMove for icon dragging
  if (typeof handleMove === 'function') {
    handleMove(e);
  }
});
document.addEventListener('mouseup', (e) => {
  handleSelectionEnd(e);
  // Also call the existing handleEnd for icon dragging
  if (typeof handleEnd === 'function') {
    handleEnd(e);
  }
});

// Stop selection if clicking and dragging an icon
document.addEventListener('mousedown', (e) => {
  if (e.target.closest('.icon')) {
    isSelecting = false;
    if (selectionRect) {
      selectionRect.style.display = 'none';
    }
  }
}, true);

// Optional: Add keyboard support to clear selection with Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isSelecting) {
    isSelecting = false;
    selectionRect.style.display = 'none';
  }
});