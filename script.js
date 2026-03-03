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

  // --- profile image uploads (high quality preview) ---
  document.querySelectorAll('.imgUpload').forEach(input => {
    input.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const container = this.closest('.story');
          const img = container.querySelector('.preview');
          const plus = container.querySelector('.plus');
          
          // Create a new image to ensure high quality rendering
          const tempImg = new Image();
          tempImg.onload = function() {
            img.src = ev.target.result;
            img.style.display = 'block';
            img.style.opacity = '1';
            plus.style.display = 'none';
          };
          tempImg.src = ev.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });

  // --- map image upload with high quality ---
  const mapInput = document.getElementById('mapUpload');
  const mapPreview = document.getElementById('mapPreview');
  const mapPlus = document.querySelector('.map-placeholder .plus');

  if (mapInput) {
    mapInput.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const tempImg = new Image();
          tempImg.onload = function() {
            mapPreview.src = ev.target.result;
            mapPreview.style.display = 'block';
            mapPreview.style.opacity = '1';
            if (mapPlus) mapPlus.style.display = 'none';
          };
          tempImg.src = ev.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // --- high quality JPG download (button NOT included in image) ---
  document.getElementById('downloadBtn').addEventListener('click', function() {
    const element = document.getElementById('captureArea');
    
    // Temporarily enhance rendering for capture
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
    });
    
    // High quality settings for html2canvas
    const options = {
      scale: 3.0,                  // Ultra high resolution
      backgroundColor: '#f2f2f4',
      allowTaint: false,
      useCORS: true,
      logging: false,
      windowWidth: 430,
      windowHeight: element.scrollHeight,
      onclone: function(clonedDoc) {
        // Ensure all text is sharp in the clone
        const clonedEl = clonedDoc.getElementById('captureArea');
        if (clonedEl) {
          clonedEl.style.transform = 'none';
        }
      }
    };

    html2canvas(element, options).then(canvas => {
      // Restore original shadows
      cards.forEach(card => {
        card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.05)';
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `election-results-${new Date().toISOString().slice(0,10)}.jpg`;
      
      // Convert to high quality JPEG (0.95 = excellent quality, smaller file)
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      
      // Trigger download directly - no preview, no popup
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);
    }).catch(error => {
      console.warn('Capture error:', error);
      // Restore shadows even on error
      cards.forEach(card => {
        card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.05)';
      });
    });
  });

  // --- Format vote numbers with commas as user types ---
  document.querySelectorAll('.votes').forEach(input => {
    input.addEventListener('input', function(e) {
      // Only format if it's a text input (we changed to text for commas)
      if (this.type === 'text') {
        let value = this.value.replace(/,/g, '');
        if (!isNaN(value) && value.length > 0) {
          this.value = Number(value).toLocaleString();
        }
      }
    });
  });

  // Convert number inputs to text for comma formatting
  document.querySelectorAll('.votes[type="number"]').forEach(input => {
    input.type = 'text';
    if (input.value) {
      const num = parseInt(input.value.replace(/,/g, ''));
      if (!isNaN(num)) {
        input.value = num.toLocaleString();
      }
    }
  });
})();