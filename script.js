(function() {
  // --- live clock with high precision ---
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
          const ring = container.querySelector('.story-ring');
          
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

  // --- MAKE TEXTS EDITABLE ON CLICK ---
  function makeEditable(element) {
    const currentText = element.innerText;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = element.className + ' edit-input';
    input.style.cssText = `
      width: 100%;
      padding: 4px;
      font-size: ${window.getComputedStyle(element).fontSize};
      font-weight: ${window.getComputedStyle(element).fontWeight};
      color: ${window.getComputedStyle(element).color};
      text-align: center;
      background: transparent;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 8px;
      outline: none;
      font-family: inherit;
    `;
    
    element.style.display = 'none';
    element.parentNode.insertBefore(input, element.nextSibling);
    
    input.focus();
    
    input.addEventListener('blur', function() {
      element.innerText = this.value;
      element.style.display = 'block';
      this.remove();
    });
    
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        element.innerText = this.value;
        element.style.display = 'block';
        this.remove();
      }
    });
  }

  // Add click listeners to text elements
  document.querySelectorAll('.name, .party, .votes').forEach(el => {
    el.addEventListener('click', function() {
      makeEditable(this);
    });
    el.style.cursor = 'pointer';
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
    
    // Ensure all text is visible and sharp
    const allText = document.querySelectorAll('.name, .party, .votes');
    const originalWeights = [];
    allText.forEach((text, index) => {
      originalWeights[index] = text.style.fontWeight;
      text.style.fontWeight = '900';
      text.style.webkitFontSmoothing = 'antialiased';
      text.style.textRendering = 'optimizeLegibility';
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
          text.style.webkitFontSmoothing = 'antialiased';
          text.style.textRendering = 'optimizeLegibility';
          text.style.color = text.style.color; // Force color
        });
        
        // Fix rings in cloned document
        const clonedRings = clonedDoc.querySelectorAll('.story-ring');
        clonedRings.forEach(ring => {
          ring.style.opacity = '1';
          ring.style.visibility = 'visible';
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
      
      allText.forEach((text, index) => {
        text.style.fontWeight = originalWeights[index] || '';
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
      
      allText.forEach((text, index) => {
        text.style.fontWeight = originalWeights[index] || '';
      });
      
      alert('Download failed. Please try again.');
    });
  });

  // --- Format vote numbers with commas (for editing) ---
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
