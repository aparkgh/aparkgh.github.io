function openWindow(id) {
  console.log(id);
  const win = document.getElementById(id);
  if (!win) return; // Safety check
  
  if (win.style.display === "block" || win.style.display === "flex") {
    return; // Window is already open, don't open again
  }

  // Initialize tracking variables if not present
  if (!window.windowStates) {
    window.windowStates = {};
  }
  
  // Initialize window state if not present
  if (!window.windowStates[id]) {
    window.windowStates[id] = {
      hasBeenInteracted: false,
      savedPosition: null,
      savedSize: null
    };
  }
  
  // Show window initially
  win.style.display = "block";
  win.style.visibility = "visible";
  
  const windowState = window.windowStates[id];
  console.log(`Window ${id} has been interacted: ${windowState.hasBeenInteracted}`);
  
  // Set window size and position
  if (windowState.hasBeenInteracted && windowState.savedPosition && windowState.savedSize) {
    // Window has been interacted with - restore saved size and position
    console.log(`Restoring saved position and size for ${id}`);
    win.style.width = windowState.savedSize.width;
    win.style.height = windowState.savedSize.height;
    win.style.left = windowState.savedPosition.left;
    win.style.top = windowState.savedPosition.top;
    win.style.maxWidth = "none";
  } else {
    // Window hasn't been interacted with or no saved data - use random size and position
    console.log(`Setting random position and size for ${id}`);
    let minWidth, maxWidth;
    
    if (id === 'about-window') {
      minWidth = 400;
      maxWidth = 800;
    } else if (id === 'contact-window' || id === 'projects-window' || 
               id === 'education-window' || id === 'experience-window' || 
               id === 'technologies-window' || id === 'confirm-window') {
      minWidth = 350;
      maxWidth = 650;
    } else {
      minWidth = 300;
      maxWidth = 600;
    }
    
    // Ensure we don't exceed screen size
    maxWidth = Math.min(maxWidth, window.innerWidth * 0.9);
    minWidth = Math.min(minWidth, maxWidth);
    
    // Set random width within constraints
    if (id !== 'confirm-window') {
      const randomWidth = minWidth + Math.random() * (maxWidth - minWidth);
      win.style.width = `${Math.floor(randomWidth)}px`;
    }
    
    // Remove any height constraints to let content determine height
    win.style.height = 'auto';
    win.style.maxWidth = "none";
    
    // Force a reflow to get accurate dimensions
    win.offsetHeight;
    
    // Get actual dimensions after sizing
    const winWidth = win.offsetWidth;
    const winHeight = win.offsetHeight;
    
    // Calculate random position
    const centerX = (window.innerWidth - winWidth) / 2;
    const centerY = (window.innerHeight - winHeight) / 2;
    if (id === 'confirm-window') {
      win.style.left = `${Math.max(0, centerX)}px`;
      win.style.top = `${Math.max(0, centerY)}px`;
    } else {
      const maxX = Math.max(0, window.innerWidth - winWidth);
      const maxY = Math.max(0, window.innerHeight - winHeight - 40); // Leave room for taskbar
      
      const offsetX = (Math.random() - 0.5) * Math.min(1000, maxX);
      const offsetY = (Math.random() - 0.5) * Math.min(400, maxY);
      
      const targetX = Math.floor(centerX + offsetX);
      const targetY = Math.floor(centerY + offsetY);
      
      // Clamp position to screen bounds
      const clampedX = Math.max(0, Math.min(targetX, maxX));
      const clampedY = Math.max(0, Math.min(targetY, maxY));
      
      win.style.left = `${clampedX}px`;
      win.style.top = `${clampedY}px`;
    }
  }
  
  // Set final display properties
  win.style.display = "flex";
  win.style.visibility = "visible";
  
  // Set up content-based height constraints
  setupContentHeightConstraints(win, id);
  
  // Add resize observer for future resizing detection
  if (!win.resizeObserver) {
    setupResizeObserver(win, id);
  }
  
  // Bring window to front
  if (typeof bringToFront === 'function') {
    bringToFront(win);
  }
}

function setupContentHeightConstraints(win, id) {
  const windowHeader = win.querySelector('.window-header');
  const windowBody = win.querySelector('.window-body');
  
  if (!windowHeader || !windowBody) return;
  
  // For confirm windows, only set height constraints once to prevent shrinking
  if (id === 'confirm-window' && win.dataset.heightSet === 'true') {
    return;
  }
  
  // Get header height
  const headerHeight = windowHeader.offsetHeight;
  
  // Temporarily allow body to expand to measure natural content height
  const originalHeight = windowBody.style.height;
  const originalMaxHeight = windowBody.style.maxHeight;
  const originalOverflow = windowBody.style.overflowY;
  
  windowBody.style.height = 'auto';
  windowBody.style.maxHeight = 'none';
  windowBody.style.overflowY = 'visible';
  
  // Force reflow and measure
  windowBody.offsetHeight;
  const contentHeight = windowBody.scrollHeight;
  
  // Calculate total minimum height
  const totalMinHeight = headerHeight + contentHeight + 20; // Add some padding
  
  // Set minimum height on the window
  win.style.minHeight = `${totalMinHeight}px`;
  
  // For confirm windows, also set a fixed height to prevent shrinking
  if (id === 'confirm-window') {
    win.style.height = `${totalMinHeight}px`;
    win.dataset.heightSet = 'true'; // Mark as set to prevent future changes
  }
  
  // Restore original body styles
  windowBody.style.height = originalHeight;
  windowBody.style.maxHeight = originalMaxHeight;
  windowBody.style.overflowY = originalOverflow;
  
  console.log(`Set minimum height for ${id}: ${totalMinHeight}px (header: ${headerHeight}px, content: ${contentHeight}px)`);
}

function setupResizeObserver(win, id) {
  let isUserResizing = false;
  
  // Track when user starts resizing (mouse down on resize handles)
  win.addEventListener('mousedown', (e) => {
    // Check if clicking near edges (resize handles)
    const rect = win.getBoundingClientRect();
    const edgeThreshold = 10;
    const isNearRightEdge = e.clientX > rect.right - edgeThreshold;
    const isNearBottomEdge = e.clientY > rect.bottom - edgeThreshold;
    const isNearLeftEdge = e.clientX < rect.left + edgeThreshold;
    const isNearTopEdge = e.clientY < rect.top + edgeThreshold;
    
    if (isNearRightEdge || isNearBottomEdge || isNearLeftEdge || isNearTopEdge) {
      isUserResizing = true;
      console.log(`User started resizing window ${id}`);
    }
  });
  
  // Reset resize flag when mouse is released
  document.addEventListener('mouseup', () => {
    if (isUserResizing) {
      isUserResizing = false;
      console.log(`User stopped resizing window ${id}`);
      // Mark as interacted when user finishes resizing
      markWindowAsInteracted(id);
    }
  });
  
  win.resizeObserver = new ResizeObserver(() => {
    // Update content-based height constraints whenever window is resized
    // Skip for confirm windows to prevent shrinking
    if (id !== 'confirm-window') {
      setupContentHeightConstraints(win, id);
    }
    
    // Update max dimensions based on current position
    const currentX = parseInt(win.style.left) || 0;
    const currentY = parseInt(win.style.top) || 0;
    
    // Set max-width based on position
    const maxAllowedWidth = window.innerWidth - currentX;
    win.style.maxWidth = `${maxAllowedWidth}px`;
    
    // Set max-height based on position and taskbar
    const taskbarHeight = 40;
    const maxAllowedHeight = window.innerHeight - currentY - taskbarHeight;
    win.style.maxHeight = `${maxAllowedHeight}px`;
  });
  
  win.resizeObserver.observe(win);
}

// Helper function to mark a window as interacted with
function markWindowAsInteracted(windowId) {
  if (!window.windowStates) {
    window.windowStates = {};
  }
  if (!window.windowStates[windowId]) {
    window.windowStates[windowId] = {
      hasBeenInteracted: false,
      savedPosition: null,
      savedSize: null
    };
  }
  window.windowStates[windowId].hasBeenInteracted = true;
}

// Helper function to save window state
function saveWindowState(windowId) {
  const win = document.getElementById(windowId);
  if (win && window.windowStates && window.windowStates[windowId]) {
    window.windowStates[windowId].savedPosition = {
      left: win.style.left,
      top: win.style.top
    };
    window.windowStates[windowId].savedSize = {
      width: win.style.width,
      height: win.style.height
    };
    console.log(`Saved state for window ${windowId}:`, window.windowStates[windowId]);
  }
}

// Helper function to randomize window position
function randomizeWindowPosition(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;
  
  console.log(`Randomizing position for window ${windowId}`);
  
  // Get current dimensions
  const winWidth = win.offsetWidth || 400;
  const winHeight = win.offsetHeight || 300;
  
  // Calculate random position
  const maxX = Math.max(0, window.innerWidth - winWidth);
  const maxY = Math.max(0, window.innerHeight - winHeight - 40); // Leave room for taskbar
  
  const centerX = (window.innerWidth - winWidth) / 2;
  const centerY = (window.innerHeight - winHeight) / 2;
  
  const offsetX = (Math.random() - 0.5) * Math.min(1000, maxX);
  const offsetY = (Math.random() - 0.5) * Math.min(400, maxY);
  
  const targetX = Math.floor(centerX + offsetX);
  const targetY = Math.floor(centerY + offsetY);
  
  // Clamp position to screen bounds
  const clampedX = Math.max(0, Math.min(targetX, maxX));
  const clampedY = Math.max(0, Math.min(targetY, maxY));
  
  // Store the randomized position
  if (!window.windowStates) {
    window.windowStates = {};
  }
  if (!window.windowStates[windowId]) {
    window.windowStates[windowId] = {
      hasBeenInteracted: false,
      savedPosition: null,
      savedSize: null
    };
  }
  
  window.windowStates[windowId].savedPosition = {
    left: `${clampedX}px`,
    top: `${clampedY}px`
  };
  
  console.log(`Randomized position for ${windowId}: ${clampedX}px, ${clampedY}px`);
}

// Close window function - now handles interaction tracking and position saving/randomizing
function closeWindow(id, isManualClose = false) {
  console.log(`Closing window ${id}, manual: ${isManualClose}`);
  const win = document.getElementById(id);
  if (!win) return;
  
  // Check if window has been interacted with (dragged or resized)
  const windowState = window.windowStates && window.windowStates[id];
  const hasBeenInteracted = windowState && windowState.hasBeenInteracted;
  
  console.log(`Window ${id} interaction status: ${hasBeenInteracted}`);
  
  if (hasBeenInteracted) {
    // Window has been dragged or resized - save its current position and size
    console.log(`Window ${id} has been interacted with - saving position and size`);
    saveWindowState(id);
  } else {
    // Window hasn't been dragged or resized - randomize its position for next time
    console.log(`Window ${id} has NOT been interacted with - randomizing position`);
    randomizeWindowPosition(id);
  }
  
  win.style.display = "none";
}

// Enhanced escape key handler
function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    // Find the top-most window
    const allWindows = document.querySelectorAll(".window");
    let topWindow = null;
    let maxZ = -1;
    
    allWindows.forEach((win) => {
      if (win.style.display !== "none") {
        const z = parseInt(window.getComputedStyle(win).zIndex) || 1000;
        if (z > maxZ) {
          maxZ = z;
          topWindow = win;
        }
      }
    });
    
    if (topWindow) {
      // Close without marking as manual close
      closeWindow(topWindow.id, false);
    }
  }
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

function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;
  let hasMoved = false;

  function getEventCoordinates(e) {
    if (e.type.startsWith("touch")) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }

  function startDrag(e) {
    console.log("[startDrag] Start Dragging")
    if (e.target.tagName === "BUTTON") return;

    isDragging = true;
    hasMoved = false;
    bringToFront(win);
    const coords = getEventCoordinates(e);
    initialX = coords.x - win.offsetLeft;
    initialY = coords.y - win.offsetTop;

    header.style.cursor = "grabbing";
    
    // Mark as interacted immediately when drag starts (i.e., when header is clicked)
    const windowId = win.id;
    if (windowId) {
      console.log(`Window ${windowId} header clicked - marking as interacted`);
      markWindowAsInteracted(windowId);
    }
    
    e.preventDefault();
  }

  function duringDrag(e) {
    if (!isDragging) return;
    
    const coords = getEventCoordinates(e);
    currentX = coords.x - initialX;
    currentY = coords.y - initialY;

    // Mark as moved if position changes at all
    if (!hasMoved && (currentX !== win.offsetLeft || currentY !== win.offsetTop)) {
      hasMoved = true;
      console.log(`Window ${win.id} movement detected - marking as moved`);
    }

    // Clamps window to desktop so they stay within viewport
    const winWidth = win.offsetWidth;
    const winHeight = win.offsetHeight;
    const taskbarHeight = 40;

    const maxX = window.innerWidth - winWidth;
    const maxY = window.innerHeight - winHeight - taskbarHeight;

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
      
      // We've already marked as interacted in startDrag, so no need to do it again here
      if (hasMoved) {
        console.log(`Window ${win.id} was actually dragged (moved)`);
      }
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

// Function to setup close buttons with manual close tracking
function setupCloseButtons() {
  document.querySelectorAll(".window").forEach((win) => {
    const closeButton = win.querySelector(".window-header button, .close-btn, .window-close, [data-close]");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        closeWindow(win.id, true); // Mark as manual close
      });
    }
  });
}

// Helper function to clear stored data for testing
function clearWindowMemory(windowId) {
  if (window.windowStates && window.windowStates[windowId]) {
    delete window.windowStates[windowId];
  }
  console.log(`Cleared memory for window ${windowId}`);
}

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

document.addEventListener("DOMContentLoaded", function () {
  // Make all windows draggable
  document.querySelectorAll(".window").forEach((win) => {
    makeDraggable(win);
  });
  
  // Setup close buttons
  setupCloseButtons();
  
  // Add escape key handler
  document.addEventListener("keydown", handleEscapeKey);
});

window.addEventListener('resize', () => {
  // Re-clamp all open windows when viewport resizes
  document.querySelectorAll('[id$="-window"]').forEach(window => {
    if (window.style.display === 'block' || window.style.display === 'flex') {
      const winWidth = window.offsetWidth;
      const winHeight = window.offsetHeight;
      const taskbarHeight = 40;
      
      let currentX = parseInt(window.style.left) || 0;
      let currentY = parseInt(window.style.top) || 0;
      
      const maxX = window.innerWidth - winWidth;
      const maxY = window.innerHeight - winHeight - taskbarHeight;
      
      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));
      
      window.style.left = currentX + "px";
      window.style.top = currentY + "px";
    }
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
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key; // lowercase letters, keep arrows

    userInput.push(key);
    if (userInput.length > konamiCode.length) {
      userInput.shift(); // keep only the last N keys
    }

    const normalizedKonami = konamiCode.map(k =>
      k.length === 1 ? k.toLowerCase() : k
    );

    if (userInput.join("") === normalizedKonami.join("")) {
      alert(
        "✨ EASTER EGG DISCOVERED ✨\n\n\n" +
        "A secret has been revealed somewhere..."
      );
      
      // Reveal the TEST icon after the secret is found
      revealTestIcon();
      
      userInput = [];
    }
  });
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
  constructor(text, onclick, imageSource, location, desktopPosition, hidden = false) {
    this.text = text;
    this.onclick = onclick;
    this.imageSource = imageSource;
    this.location = location; // object with x and y, as offset from top left
    this.desktopPosition = desktopPosition; // custom desktop positioning
    this.isBeingDragged = false;
    this.dragOffset = { x: 0, y: 0 }; // Store offset from mouse to icon position
    this.hidden = hidden; // New property to control visibility
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
    "Zerowire",
    () => {
      pendingLink = "https://github.com/aparkgh/zerowire";
      document.getElementById('confirm-window').classList.remove('rainbow-window');
      openWindow("confirm-window");
    },
    "assets/icons/zerowire.png",
    { x: 0, y: 0 },
    { top: 120, left: 350 }
  ),
  new Icon(
    "Tech Stack",
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
    "Snake",
    () => {
      pendingLink = "https://github.com/aparkgh/snake";
      document.getElementById('confirm-window').classList.remove('rainbow-window');
      openWindow("confirm-window");
    },
    "assets/icons/snake.png",
    { x: 0, y: 0 },
    { top: 250, left: 400 }
  ),
  new Icon(
    "Folder Nuker",
    () => {
      pendingLink = "https://github.com/aparkgh/foldernuker";
      document.getElementById('confirm-window').classList.remove('rainbow-window');
      openWindow("confirm-window");
    },
    "assets/icons/foldernuker.png",
    { x: 0, y: 0 },
    { top: 150, left: 200 }
  ),
  new Icon(
    "Day Counter",
    () => {
      pendingLink = "https://github.com/aparkgh/daycounter";
      document.getElementById('confirm-window').classList.remove('rainbow-window');
      openWindow("confirm-window");
    },
    "assets/icons/daycounter.png",
    { x: 0, y: 0 },
    { top: 350, right: 150 }
  ),
  new Icon(
    "Spotify",
    () => {
      pendingLink = "https://open.spotify.com/user/229ll5brg0pwf57snpkikhd0r";
      document.getElementById('confirm-window').classList.remove('rainbow-window');
      openWindow("confirm-window");
    },
    "assets/icons/spotify.png",
    { x: 0, y: 0 },
    { top: 450, right: 320 }
  ),
  new Icon(
    "W95TEST",
    () => {
      pendingLink = "https://aparkgh.github.io/assets/buttoncatch";
      // Add rainbow class before opening window
      document.getElementById('confirm-window').classList.add('rainbow-window');
      openWindow("confirm-window");
    },
    "assets/icons/windows.png",
    { x: 0, y: 0 },
    { top: 500, right: 1000 },
    true
  ),
];

// Function to find the TEST icon and reveal it
function revealTestIcon() {
  const testIcon = icons.find(icon => icon.text === "W95TEST");
  if (testIcon) {
    testIcon.hidden = false;
    // You'll need to call your render/display function here to update the UI
    renderAllIcons(); // Replace with your actual render function name
  }
}

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
    if (!icon.hidden) {
      desktop.appendChild(getIconElement(icon));
    }
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
  // Initialize clock if updateClock function exists
  if (typeof updateClock === 'function') {
    updateClock(); // Run once immediately
    setInterval(updateClock, 1000); // Then every second
  }
  
  // Initialize scrolling track if it exists
  const track = document.querySelector(".scrolling-track");
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  // Render icons
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

// Helper function to check if an element overlaps with selection rectangle
const isElementInSelection = (element, selectionBounds) => {
    const elementRect = element.getBoundingClientRect();
    
    return !(elementRect.right < selectionBounds.left || 
             elementRect.left > selectionBounds.right || 
             elementRect.bottom < selectionBounds.top || 
             elementRect.top > selectionBounds.bottom);
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
    
    // Update icon selection highlighting
    const selectionBounds = {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height
    };
    
    // Get all icons and update their selection state
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
        if (isElementInSelection(icon, selectionBounds)) {
            icon.classList.add('selecting');
        } else {
            icon.classList.remove('selecting');
        }
    });
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
    
    // Update icon selection highlighting
    const selectionBounds = {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height
    };
    
    // Get all icons and update their selection state
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
        if (isElementInSelection(icon, selectionBounds)) {
            icon.classList.add('selecting');
        } else {
            icon.classList.remove('selecting');
        }
    });
    
    e.preventDefault(); // Prevent scrolling
};

// End selection
const endSelection = () => {
    if (isSelecting) {
        isSelecting = false;
        selectionRect.style.display = 'none';
        
        // Remove selecting class from all icons
        const icons = document.querySelectorAll('.icon');
        icons.forEach(icon => {
            icon.classList.remove('selecting');
        });
        
        // Add your selection logic here (e.g., keep selected icons marked with 'selected' class)
        // Example: icons with 'selecting' class could be converted to 'selected' class
    }
};

// Event listeners for both desktop and mobile
document.addEventListener('mousedown', handleDesktopMouseDown);
document.addEventListener('mousemove', handleSelectionMove);
document.addEventListener('mouseup', endSelection);

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', endSelection);

function openEmail() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // On mobile, open default mail client with mailto
    window.location.href = "mailto:andrew.park6126@gmail.com";
  } else {
    // On desktop, open Gmail compose in new tab
    try {
      window.open("https://mail.google.com/mail/?view=cm&fs=1&to=andrew.park6126@gmail.com", "_blank");
    } catch (error) {
      // fallback to mailto if pop-up blocked or error
      window.location.href = "mailto:andrew.park6126@gmail.com";
    }
  }
}

let pendingLink = null;

function confirmLeave() {
  if (pendingLink) {
    window.open(pendingLink, '_blank');
    pendingLink = null;
  }
  closeWindow('confirm-window');
}