(function() {
  // --- live clock ---
  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').innerText = `Updated ${hours}:${minutes}:${seconds}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- profile image uploads ---
  document.querySelectorAll('.imgUpload').forEach(input => {
    input.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const container = this.closest('.story');
          const img = container.querySelector('.preview');
          const plus = container.querySelector('.plus');
          
          img.src = ev.target.result;
          img.style.display = 'block';
          plus.style.display = 'none';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });

  // --- MAP UPLOAD ---
  const mapInput = document.getElementById('mapUpload');
  const mapPreview = document.getElementById('mapPreview');
  const mapPlaceholder = document.querySelector('.map-placeholder');

  if (mapInput) {
    mapInput.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = function() {
            mapPreview.src = ev.target.result;
            mapPreview.style.display = 'block';
            if (mapPlaceholder) {
              mapPlaceholder.style.display = 'none';
            }
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // --- SIMPLE, RELIABLE EDITABLE TEXT (FIXED FOR MOBILE) ---
  function setupEditableText() {
    const textElements = document.querySelectorAll('.name, .party, .votes');
    
    textElements.forEach(element => {
      // Remove any existing listeners by cloning and replacing
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      
      // Add click handler to new element
      newElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        makeEditable(this);
      });
      
      // Add touch handler for mobile
      newElement.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        makeEditable(this);
      }, { passive: false });
      
      // Style the element
      newElement.style.cursor = 'pointer';
      newElement.style.userSelect = 'none';
      newElement.style.webkitTapHighlightColor = 'rgba(0,122,255,0.2)';
    });
  }
  
  function makeEditable(element) {
    // Check if already editing
    if (element.parentNode.querySelector('.edit-input')) {
      return;
    }
    
    const currentText = element.innerText;
    const fieldType = element.getAttribute('data-field') || 'text';
    const originalColor = window.getComputedStyle(element).color;
    
    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    input.setAttribute('data-field', fieldType);
    
    // Special for votes
    if (fieldType === 'votes') {
      input.inputMode = 'numeric';
      input.pattern = '[0-9,]*';
    }
    
    // Style input
    input.style.cssText = `
      width: 100%;
      padding: 14px 8px;
      font-size: 18px;
      font-weight: 900;
      color: #000;
      text-align: center;
      background: white;
      border: 3px solid #007aff;
      border-radius: 18px;
      outline: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 10px 25px rgba(0,122,255,0.3);
      margin: 5px 0;
      min-height: 56px;
      display: block;
      -webkit-appearance: none;
    `;
    
    // Hide original
    element.style.display = 'none';
    
    // Insert input
    element.parentNode.insertBefore(input, element.nextSibling);
    
    // Focus
    setTimeout(() => {
      input.focus();
      input.select();
    }, 50);
    
    // Save on blur
    input.addEventListener('blur', function() {
      saveEdit(this, element);
    });
    
    // Save on Enter
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.blur();
      }
    });
    
    // Prevent touch events from bubbling
    input.addEventListener('touchstart', (e) => e.stopPropagation());
    input.addEventListener('touchend', (e) => e.stopPropagation());
  }
  
  function saveEdit(input, originalElement) {
    let newValue = input.value.trim();
    
    // If empty, restore original
    if (newValue === '') {
      newValue = originalElement.innerText;
    }
    
    // Format votes
    if (originalElement.classList.contains('votes')) {
      const numStr = newValue.replace(/,/g, '');
      if (!isNaN(numStr) && numStr.length > 0) {
        newValue = Number(numStr).toLocaleString();
      }
    }
    
    // Update original
    originalElement.innerText = newValue;
    originalElement.style.display = 'flex';
    
    // Remove input
    input.remove();
  }
  
  // Initialize editable text
  setTimeout(setupEditableText, 100);
  
  // Also run after any dynamic changes
  const observer = new MutationObserver(function(mutations) {
    let shouldUpdate = false;
    mutations.forEach(m => {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        shouldUpdate = true;
      }
    });
    if (shouldUpdate) {
      setTimeout(setupEditableText, 200);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // --- HIGH QUALITY DOWNLOAD WITH RINGS FIXED ---
  document.getElementById('downloadBtn').addEventListener('click', function() {
    const element = document.getElementById('captureArea');
    
    // Save original styles
    const cards = document.querySelectorAll('.card');
    const rings = document.querySelectorAll('.story-ring');
    const originalShadows = [];
    const originalRingStyles = [];
    
    // Enhance cards
    cards.forEach((card, index) => {
      originalShadows[index] = card.style.boxShadow;
      card.style.boxShadow = '0 25px 40px rgba(0,0,0,0.25), 0 10px 20px rgba(0,0,0,0.15)';
    });
    
    // Enhance rings for download (make them super visible)
    rings.forEach((ring, index) => {
      originalRingStyles[index] = {
        padding: ring.style.padding,
        border: ring.style.border,
        background: ring.style.background
      };
      
      // Make rings thicker and more vibrant
      ring.style.padding = '8px';
      ring.style.border = '3px solid';
      ring.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    });
    
    // Ensure all text is visible
    document.querySelectorAll('.name, .party, .votes').forEach(text => {
      text.style.fontWeight = '900';
      text.style.color = text.style.color; // Force color
    });
    
    // High quality capture
    const options = {
      scale: 4.0,
      backgroundColor: '#f2f2f4',
      allowTaint: true,
      useCORS: true,
      logging: false,
      windowWidth: 430,
      windowHeight: element.scrollHeight,
      onclone: function(clonedDoc) {
        // Make rings visible in clone
        const clonedRings = clonedDoc.querySelectorAll('.story-ring');
        clonedRings.forEach(ring => {
          ring.style.padding = '8px';
          ring.style.border = '3px solid';
          ring.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
          ring.style.forcedColorAdjust = 'none';
          ring.style.webkitPrintColorAdjust = 'exact';
        });
        
        // Make text bold in clone
        const clonedTexts = clonedDoc.querySelectorAll('.name, .party, .votes');
        clonedTexts.forEach(text => {
          text.style.fontWeight = '900';
        });
        
        // Fix map
        const clonedMap = clonedDoc.getElementById('mapPreview');
        if (clonedMap && clonedMap.src) {
          clonedMap.style.objectFit = 'cover';
          clonedMap.style.width = '100%';
          clonedMap.style.height = '100%';
        }
      }
    };

    html2canvas(element, options).then(canvas => {
      // Restore original styles
      cards.forEach((card, index) => {
        card.style.boxShadow = originalShadows[index] || '';
      });
      
      rings.forEach((ring, index) => {
        ring.style.padding = originalRingStyles[index]?.padding || '';
        ring.style.border = originalRingStyles[index]?.border || '';
        ring.style.boxShadow = '';
      });
      
      // Download
      const link = document.createElement('a');
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
      link.download = `election-results-${dateStr}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.98);
      link.click();
      
    }).catch(error => {
      console.error('Download error:', error);
      // Restore on error
      cards.forEach((card, index) => {
        card.style.boxShadow = originalShadows[index] || '';
      });
      
      rings.forEach((ring, index) => {
        ring.style.padding = originalRingStyles[index]?.padding || '';
        ring.style.border = originalRingStyles[index]?.border || '';
        ring.style.boxShadow = '';
      });
      
      alert('Download failed. Please try again.');
    });
  });

  // --- Format votes initially ---
  document.querySelectorAll('.votes').forEach(el => {
    const text = el.innerText;
    const num = parseInt(text.replace(/,/g, ''));
    if (!isNaN(num)) {
      el.innerText = num.toLocaleString();
    }
  });

  // --- Prevent default touch behaviors ---
  document.addEventListener('touchmove', function(e) {
    if (e.target.classList.contains('edit-input')) {
      e.stopPropagation();
    }
  }, { passive: false });
})();    


