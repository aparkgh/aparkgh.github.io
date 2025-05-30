// Window management
function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = "flex";
  win.style.width = `${window.innerWidth / 2}px`;

  // Temporarily show it to get size
  win.style.visibility = "hidden";
  win.style.display = "block";

  const winWidth = win.offsetWidth;
  const winHeight = win.offsetHeight;

  const maxX = window.innerWidth - winWidth;
  const maxY = window.innerHeight - winHeight - 40; // Leave room for taskbar

  // Clamp current position or re-center
  const currentLeft = parseInt(win.style.left) || 0;
  const currentTop = parseInt(win.style.top) || 0;

  const clampedX = Math.max(0, Math.min(currentLeft, maxX));
  const clampedY = Math.max(0, Math.min(currentTop, maxY));

  win.style.left = `${clampedX}px`;
  win.style.top = `${clampedY}px`;

  // Show it for real
  win.style.visibility = "visible";
  win.style.display = "flex";

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

  function getEventCoordinates(e) {
    if (e.type.startsWith("touch")) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }

  function startDrag(e) {
    if (e.target.tagName === "BUTTON") return;

    isDragging = true;
    bringToFront(win);
    const coords = getEventCoordinates(e);
    initialX = coords.x - win.offsetLeft;
    initialY = coords.y - win.offsetTop;

    header.style.cursor = "grabbing";
    e.preventDefault();
  }

  function duringDrag(e) {
    if (!isDragging) return;
    const coords = getEventCoordinates(e);
    currentX = coords.x - initialX;
    currentY = coords.y - initialY;

    // clamps window to desktop so they stop opening outside of the viewport
    const winWidth = win.offsetWidth || 400;
    const winHeight = win.offsetHeight || 300;
    const taskbarHeight = 40;

    const maxX = window.innerWidth - winWidth;
    const maxY = window.innerHeight - winHeight - taskbarHeight;

    const randomX = Math.random() * Math.max(0, maxX);
    const randomY = Math.random() * Math.max(0, maxY);

    win.style.left = `${randomX}px`;
    win.style.top = `${randomY}px`;

    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    win.style.left = currentX + "px";
    win.style.top = currentY + "px";
    e.preventDefault();
  }

  function endDrag() {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = "move";
    }
  }

  // Mouse events
  header.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", duringDrag);
  document.addEventListener("mouseup", endDrag);

  // Touch events
  header.addEventListener("touchstart", startDrag, { passive: false });
  document.addEventListener("touchmove", duringDrag, { passive: false });
  document.addEventListener("touchend", endDrag);

  // Bring window to front on interaction
  win.addEventListener("mousedown", () => bringToFront(win));
  win.addEventListener("touchstart", () => bringToFront(win));
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
document.addEventListener("DOMContentLoaded", function () {
  const konamiCode = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "ArrowLeft", "ArrowRight",
    "b", "a"
  ];

  let userInput = [];

  document.addEventListener("keydown", function (e) {
    userInput.push(e.key);
    if (userInput.length > konamiCode.length) {
      userInput.shift(); // keep only the last N keys
    }

    if (userInput.join("") === konamiCode.join("")) {
      alert(
        "🎉 ...Oh? You found the secret desktop message!\n\nThanks for exploring my portfolio!"
      );
      userInput = [];
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
    { top: 450, right: 320 }
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
let currentDragState = {
  icon: null,
  element: null,
  isDragging: false,
  startTime: 0,
  startPos: { x: 0, y: 0 },
  hasMoved: false
};

const getIconElement = (icon) => {
  const element = document.createElement("div");
  element.classList.add("icon");
  element.style.position = "absolute";
  element.style.cursor = "pointer";
  element.style.userSelect = "none";
  element.style.touchAction = "none";

  const image = document.createElement("img");
  image.setAttribute("alt", icon.text);
  image.setAttribute("src", icon.imageSource);
  image.style.pointerEvents = "none";
  element.append(image);

  const text = document.createElement("span");
  text.innerText = icon.text;
  text.style.display = "block";
  text.style.textAlign = "center";
  text.style.pointerEvents = "none";
  element.append(text);

  element.style.left = `${icon.location.x}px`;
  element.style.top = `${icon.location.y}px`;

  // Unified pointer event handling
  const startInteraction = (e) => {
    e.preventDefault();
    
    // Get coordinates (works for both mouse and touch)
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Set up drag state
    currentDragState.icon = icon;
    currentDragState.element = element;
    currentDragState.isDragging = false;
    currentDragState.hasMoved = false;
    currentDragState.startTime = Date.now();
    currentDragState.startPos = { x: clientX, y: clientY };
    
    // Calculate offset from pointer to icon position
    const rect = element.getBoundingClientRect();
    icon.dragOffset.x = clientX - rect.left;
    icon.dragOffset.y = clientY - rect.top;
    
    icon.isBeingDragged = true;
    element.style.zIndex = "1000";
  };
  
  const moveInteraction = (e) => {
    if (!currentDragState.icon || currentDragState.icon !== icon) return;
    
    e.preventDefault();
    
    // Get coordinates
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Calculate movement distance
    const moveDistance = Math.sqrt(
      Math.pow(clientX - currentDragState.startPos.x, 2) + 
      Math.pow(clientY - currentDragState.startPos.y, 2)
    );
    
    // Start dragging if moved more than threshold
    if (moveDistance > 8) {
      currentDragState.isDragging = true;
      currentDragState.hasMoved = true;
    }
    
    if (currentDragState.isDragging) {
      // Update icon position
      icon.location.x = clientX - icon.dragOffset.x;
      icon.location.y = clientY - icon.dragOffset.y;
      
      // Keep within bounds
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      icon.location.x = Math.max(0, Math.min(maxX, icon.location.x));
      icon.location.y = Math.max(0, Math.min(maxY, icon.location.y));
      
      // Update position immediately
      element.style.left = `${icon.location.x}px`;
      element.style.top = `${icon.location.y}px`;
    }
  };
  
  const endInteraction = (e) => {
    if (!currentDragState.icon || currentDragState.icon !== icon) return;
    
    e.preventDefault();
    
    const wasClick = !currentDragState.hasMoved && (Date.now() - currentDragState.startTime < 300);
    
    // Clean up
    icon.isBeingDragged = false;
    element.style.zIndex = "auto";
    
    // Reset drag state
    currentDragState.icon = null;
    currentDragState.element = null;
    currentDragState.isDragging = false;
    currentDragState.hasMoved = false;
    
    // Handle click
    if (wasClick) {
      setTimeout(() => {
        icon.onclick();
      }, 10);
    }
  };

  // Mouse events
  element.addEventListener("mousedown", startInteraction);
  element.addEventListener("mousemove", moveInteraction);
  element.addEventListener("mouseup", endInteraction);
  
  // Touch events
  element.addEventListener("touchstart", startInteraction, { passive: false });
  element.addEventListener("touchmove", moveInteraction, { passive: false });
  element.addEventListener("touchend", endInteraction, { passive: false });
  
  // Prevent context menu
  element.addEventListener("contextmenu", (e) => e.preventDefault());

  return element;
};

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
  if (track) {
    track.innerHTML += track.innerHTML;
  }

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

// Helper function to check if target should prevent selection
const shouldPreventSelection = (target) => {
    const isIcon = target.closest('.icon');
    const isInteractive = target.closest('.start-menu, button, input, select, textarea, a');
    const isTaskbar = target.closest('#taskbar, .taskbar');
    
    // Add window detection - adjust these selectors to match your window structure
    const isWindow = target.closest('.window, .window-container, [class*="window"], [id*="window"]');
    const isWindowTitlebar = target.closest('.titlebar, .window-header, .window-title, [class*="titlebar"], [class*="header"]');
    const isWindowContent = target.closest('.window-content, .window-body, [class*="content"]');
    const isWindowBorder = target.closest('.window-border, .resize-handle, [class*="resize"], [class*="border"]');
    
    return isIcon || isInteractive || isTaskbar || isWindow || isWindowTitlebar || isWindowContent || isWindowBorder;
};

// Start selection on desktop mousedown (but not on icons or windows)
const handleDesktopMouseDown = (e) => {
    if (!shouldPreventSelection(e.target)) {
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

// Start selection on mobile touchstart
const handleTouchStart = (e) => {
    // Only handle single finger touches
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    
    if (!shouldPreventSelection(e.target)) {
        isSelecting = true;
        selectionStart.x = touch.clientX;
        selectionStart.y = touch.clientY;
        
        // Show the selection rectangle
        selectionRect.style.display = 'block';
        selectionRect.style.left = touch.clientX + 'px';
        selectionRect.style.top = touch.clientY + 'px';
        selectionRect.style.width = '0px';
        selectionRect.style.height = '0px';
        
        e.preventDefault(); // Prevent scrolling and other touch behaviors
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

// Update selection rectangle during touch move
const handleTouchMove = (e) => {
    if (!isSelecting || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
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
    
    e.preventDefault(); // Prevent scrolling
};

// End selection
const endSelection = () => {
    if (isSelecting) {
        isSelecting = false;
        selectionRect.style.display = 'none';
        // Add your selection logic here (e.g., select icons within rectangle)
    }
};

// Event listeners for both desktop and mobile
document.addEventListener('mousedown', handleDesktopMouseDown);
document.addEventListener('mousemove', handleSelectionMove);
document.addEventListener('mouseup', endSelection);

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', endSelection);