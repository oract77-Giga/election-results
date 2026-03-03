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

  // --- MOBILE-FRIENDLY EDITABLE TEXT ---
  function makeEditable(element) {
    // Don't create another input if already editing
    if (element.parentNode.querySelector('.edit-input')) {
      return;
    }
    
    const currentText = element.innerText;
    const fieldType = element.getAttribute('data-field') || 'text';
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    input.setAttribute('data-field', fieldType);
    input.setAttribute('data-original-class', element.className);
    
    // Apply styles for mobile
    input.style.width = '100%';
    input.style.padding = '12px 8px';
    input.style.fontSize = window.getComputedStyle(element).fontSize;
    input.style.fontWeight = '900';
    input.style.color = window.getComputedStyle(element).color;
    input.style.textAlign = 'center';
    input.style.backgroundColor = '#ffffff';
    input.style.border = '2px solid #007aff';
    input.style.borderRadius = '12px';
    input.style.outline = 'none';
    input.style.fontFamily = 'inherit';
    input.style.WebkitAppearance = 'none';
    input.style.appearance = 'none';
    input.style.boxShadow = '0 4px 12px rgba(0,122,255,0.3)';
    input.style.margin = '4px 0';
    input.style.minHeight = '48px';
    input.style.fontSize = '16px'; // Prevents zoom on iOS
    
    // Special handling for votes field
    if (fieldType === 'votes') {
      input.inputMode = 'numeric';
      input.pattern = '[0-9,]*';
    }
    
    // Hide original element
    element.style.display = 'none';
    
    // Insert input after original element
    element.parentNode.insertBefore(input, element.nextSibling);
    
    // Focus input and select text
    input.focus();
    input.select();
    
    // Handle blur (when clicking away)
    input.addEventListener('blur', function() {
      saveEdit(this, element);
    });
    
    // Handle Enter key
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.blur();
      }
    });
    
    // Handle touch events properly
    input.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    });
  }
  
  function saveEdit(input, originalElement) {
    let newValue = input.value.trim();
    
    // If empty, restore original
    if (newValue === '') {
      newValue = originalElement.innerText;
    }
    
    // Format votes with commas
    if (originalElement.classList.contains('votes')) {
      // Remove existing commas and convert to number
      const numStr = newValue.replace(/,/g, '');
      if (!isNaN(numStr) && numStr.length > 0) {
        newValue = Number(numStr).toLocaleString();
      }
    }
    
    // Update original element
    originalElement.innerText = newValue;
    originalElement.style.display = 'flex'; // Restore visibility
    
    // Remove input
    input.remove();
  }
  
  // Add click/touch listeners to all editable text elements
  function initEditableText() {
    const textElements = document.querySelectorAll('.name, .party, .votes');
    
    textElements.forEach(el => {
      // Remove any existing listeners
      el.removeEventListener('click', textClickHandler);
      el.removeEventListener('touchstart', textTouchHandler);
      
      // Add new listeners
      el.addEventListener('click', textClickHandler);
      el.addEventListener('touchstart', textTouchHandler, { passive: false });
      
      // Make sure element is visible and has proper styling
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.minHeight = '44px';
      el.style.padding = '8px 4px';
    });
  }
  
  function textClickHandler(e) {
    e.preventDefault();
    makeEditable(this);
  }
  
  function textTouchHandler(e) {
    e.preventDefault(); // Prevent zoom or default touch behavior
    makeEditable(this);
  }
  
  // Initialize editable text
  initEditableText();
  
  // Re-initialize after any dynamic changes (like image uploads)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        initEditableText();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });

  // --- HIGH QUALITY DOWNLOAD ---
  document.getElementById('downloadBtn').addEventListener('click', function() {
    const element = document.getElementById('captureArea');
    
    // Save original styles
    const cards = document.querySelectorAll('.card');
    const originalShadows = [];
    
    // Enhance for capture
    cards.forEach((card, index) => {
      originalShadows[index] = card.style.boxShadow;
      card.style.boxShadow = '0 20px 35px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1)';
    });
    
    // Ensure all text is visible
    const allText = document.querySelectorAll('.name, .party, .votes');
    allText.forEach(text => {
      text.style.fontWeight = '900';
      text.style.display = 'flex'; // Ensure visible
    });
    
    // Make rings extra thick for download
    const rings = document.querySelectorAll('.story-ring');
    rings.forEach(ring => {
      ring.style.padding = '7px'; // Even thicker for download
    });
    
    // High quality capture settings
    const options = {
      scale: 4.0,
      backgroundColor: '#f2f2f4',
      allowTaint: true,
      useCORS: true,
      logging: false,
      windowWidth: 430,
      windowHeight: element.scrollHeight,
      onclone: function(clonedDoc) {
        // Fix text in cloned document
        const clonedTexts = clonedDoc.querySelectorAll('.name, .party, .votes');
        clonedTexts.forEach(text => {
          text.style.fontWeight = '900';
          text.style.display = 'flex';
        });
        
        // Make rings thick in cloned document
        const clonedRings = clonedDoc.querySelectorAll('.story-ring');
        clonedRings.forEach(ring => {
          ring.style.padding = '7px';
          ring.style.border = '2px solid currentColor';
        });
        
        // Fix map in cloned document
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
      
      allText.forEach(text => {
        text.style.fontWeight = '';
      });
      
      rings.forEach(ring => {
        ring.style.padding = '';
      });
      
      // Create download
      const link = document.createElement('a');
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
      link.download = `election-results-${dateStr}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.98);
      link.click();
      
    }).catch(error => {
      console.warn('Capture error:', error);
      // Restore styles on error
      cards.forEach((card, index) => {
        card.style.boxShadow = originalShadows[index] || '';
      });
      
      rings.forEach(ring => {
        ring.style.padding = '';
      });
      
      alert('Download failed. Please try again.');
    });
  });

  // --- Format vote numbers with commas (initial) ---
  document.querySelectorAll('.votes').forEach(el => {
    const originalText = el.innerText;
    if (originalText) {
      const num = parseInt(originalText.replace(/,/g, ''));
      if (!isNaN(num)) {
        el.innerText = num.toLocaleString();
      }
    }
  });
})();

