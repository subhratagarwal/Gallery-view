// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
if (hamburger && sidebar) {
  hamburger.onclick = () => sidebar.classList.toggle('open');
}

// Active link highlighting
const links = document.querySelectorAll('#sidebar ul li a');
links.forEach(link => {
  if (window.location.pathname.endsWith(link.getAttribute('href'))) {
    link.classList.add('active');
  }
});

// Logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  if (localStorage.getItem('token')) {
    logoutBtn.style.display = 'block';
    logoutBtn.onclick = () => {
      localStorage.removeItem('token');
      window.location = 'login.html';
    };
  }
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm));
    const res = await fetch('http://192.168.29.50:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.token) {
      localStorage.setItem('token', result.token);
      alert('Login successful!');
      window.location = 'gallery.html';
    } else {
      alert(result.error || 'Login failed');
    }
  };
}

// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(registerForm));
    const res = await fetch('http://192.168.29.50:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      alert('Registration successful!');
      window.location = 'login.html';
    } else {
      const result = await res.json();
      alert(result.error || 'Registration failed');
    }
  };
}

// Gallery with Delete Option and Click-to-View
const galleryDiv = document.getElementById('gallery');
if (galleryDiv) {
  loadGallery();

  // Upload
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(uploadForm);
      const token = localStorage.getItem('token');
      const res = await fetch('http://192.168.29.50:5000/api/images/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      });
      if (res.ok) {
        alert('Image uploaded!');
        window.location.reload();
      } else {
        const result = await res.json();
        alert(result.error || 'Upload failed');
      }
    };
  }

  // Image preview before upload
  const imgInput = document.getElementById('imgInput');
  const imgPreview = document.getElementById('imgPreview');
  if (imgInput && imgPreview) {
    imgInput.onchange = function(e) {
      const [file] = e.target.files;
      if (file) {
        imgPreview.src = URL.createObjectURL(file);
        imgPreview.style.display = 'block';
      }
    };
  }
}

function loadGallery() {
  fetch('http://192.168.29.50:5000/api/images')
    .then(res => res.json())
    .then(images => {
      const galleryDiv = document.getElementById('gallery');
      if (!galleryDiv) return;
      galleryDiv.innerHTML = '';
      images.forEach(img => {
        const imgBox = document.createElement('div');
        imgBox.className = 'gallery-item';
        imgBox.innerHTML = `
          <a href="http://192.168.29.50:5000${img.url}" target="_blank" rel="noopener noreferrer">
            <img src="http://192.168.29.50:5000${img.url}" alt="${img.filename}">
          </a>
          <button class="delete-btn" data-id="${img._id}" title="Delete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        `;
        galleryDiv.appendChild(imgBox);
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          const imageId = this.getAttribute('data-id');
          deleteImage(imageId);
        });
      });
    });
}

function deleteImage(imageId) {
  const token = localStorage.getItem('token');
  fetch(`http://192.168.29.50:5000/api/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
    .then(res => {
      if (res.ok) {
        alert('Image deleted!');
        loadGallery();
      } else {
        res.json().then(result => {
          alert(result.error || 'Failed to delete image');
        });
      }
    });
}

// Feedback
const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(feedbackForm));
    const res = await fetch('http://192.168.29.50:5000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      document.getElementById('feedbackMsg').textContent = 'Thank you for your feedback!';
      feedbackForm.reset();
    } else {
      const result = await res.json();
      alert(result.error || 'Submission failed');
    }
  };
}
