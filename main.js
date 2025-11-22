 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
  import { getFirestore, collection, query, where, getDoc, getDocs, orderBy, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyB0BBzQzGX6MHVSjn09VSD-JGpSwOu8EqQ",
    authDomain: "bixmax-6c24c.firebaseapp.com",
    projectId: "bixmax-6c24c",
    storageBucket: "bixmax-6c24c.appspot.com",
    messagingSenderId: "37740442541",
    appId: "1:37740442541:web:a2e2b9bb81c6a8e76c6724"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

function showSkeletons(container, count = 12) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-text" style="width: 80%;"></div>
      <div class="skeleton-text" style="width: 60%;"></div>
      <div class="skeleton-btn"></div>
    `;
    container.appendChild(skeleton);
  }
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
	
  function saveProductsToCache(category, products) {
    localStorage.setItem("products_" + category, JSON.stringify({
      products,
      timestamp: Date.now()
    }));
  }

  function getProductsFromCache(category, maxAge = 1000) {
    const cache = localStorage.getItem("products_" + category);
    if (!cache) return null;
    const parsed = JSON.parse(cache);
    return (Date.now() - parsed.timestamp > maxAge) ? null : parsed.products;
  }

function renderProducts(products, container) {
  container.innerHTML = "";

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "card";

    const discount = product.originalPrice
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : null;

    // Logic for price display
    const priceHTML = product.originalPrice
      ? `<span style="text-decoration: line-through; color: gray; font-size:11px; margin-right:3px;">GH₵${product.originalPrice.toFixed(2)}</span>
         <span style="font-weight:600; color:#222;font-size:14px;">GH₵${product.price.toFixed(2)}</span>`
      : `<span style="font-weight:700; color:#222;font-size:14px;">GH₵${product.price.toFixed(2)}</span>`;

    const imgSrc = product.image?.startsWith("http") ? product.image : "https://via.placeholder.com/150";

    // --- UPDATED HTML TO INCLUDE SHARE BUTTON ---
    div.innerHTML = `
      ${discount ? `<span class="badge">🔥${discount}% OFF</span>` : ""}
      
      <div class="image-wrapper" style="cursor: pointer;">
        <button class="share-btn" aria-label="Share product">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        </button>

        <div class="skeleton-img"></div>
        <img src="${imgSrc}" alt="${product.name}" loading="lazy" class="product-img lazy-fade"/>
      </div>

      <h3>${product.name}</h3>
      <div class="price">${priceHTML}</div>
      <button class="add">Add to Cart</button>
    `;

    // 1. Handle Image Loading
    const img = div.querySelector("img");
    const skeleton = div.querySelector(".skeleton-img");
    img.onload = () => { 
        skeleton.style.display = 'none'; 
        img.style.opacity = 1; // Ensure fade-in works
    };
    img.onerror = () => { img.src = "https://via.placeholder.com/150"; };

    // 2. ADD CLICK EVENT TO IMAGE (Opens the Modal)
    img.addEventListener("click", () => {
        openProductModal(product);
    });

    // 3. Handle "Add to Cart" button
    const addBtn = div.querySelector(".add");
    addBtn.onclick = () => addToCart(product);

    // --- 4. HANDLE SHARE BUTTON CLICK ---
    const shareBtn = div.querySelector(".share-btn");
    shareBtn.onclick = (e) => {
        e.stopPropagation(); // STOP the click from opening the modal
        shareProduct(product); // Trigger the share
    };

    container.appendChild(div);
  });
}
async function loadProducts(category, containerId) {
  const container = document.getElementById(containerId);
  showSkeletons(container);

  const cached = getProductsFromCache(category);
  if (cached) {
    setTimeout(() => renderProducts(cached, container), 1000);
    return cached; // ✅ return cached products
  }

  try {
    const q = query(collection(db, "products"), where("category", "==", category));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => doc.data());
    shuffleArray(products);
    saveProductsToCache(category, products);
    renderProducts(products, container);
    return products; // ✅ return products
  } catch (err) {
    console.error("Error loading products:", err);
    container.innerHTML = "<p style='color:red;'>Failed to load products.</p>";
    return []; // ✅ return empty array on error
  }
}


  async function loadAllProducts() {
    const categories = [
      { name: "Electronics", id: "grid-electronics" },
      { name: "Fashion", id: "grid-fashion" },
      { name: "Groceries", id: "grid-groceries" },
      { name: "Essentials", id: "grid-essentials" },
      { name: "Health", id: "grid-health" },
      { name: "Care", id: "grid-care" }
    ];
    let allProducts = [];
    await Promise.all(categories.map(async cat => {
      const products = await loadProducts(cat.name, cat.id);
      allProducts = allProducts.concat(products);
    }));
    return allProducts;
  }

// ------------------------------------------------------------------
// 1. AUTHENTICATION LISTENER
// ------------------------------------------------------------------
onAuthStateChanged(auth, async user => {
  const profileImg = document.getElementById('menuProfileImg');
  const userName = document.getElementById('menuUserName');
  const userEmail = document.getElementById('menuUserEmail');
  const authBtn = document.getElementById('authBtn');
  const dashboardLink = document.getElementById('dashboardLink');

  const defaultImg = "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg";

  if (user) {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      let data = {};
      if (!querySnapshot.empty) data = querySnapshot.docs[0].data();

      const finalImg = data.photoURL || user.photoURL || defaultImg;

      if(profileImg) profileImg.style.backgroundImage = `url('${finalImg}')`;
      if(userName) userName.textContent = data.displayName || user.displayName || user.email.split("@")[0];
      if(userEmail) userEmail.textContent = user.email;
      
      if(authBtn) {
          authBtn.textContent = "🚪 Logout";
          authBtn.onclick = () => signOut(auth);
      }
      if(dashboardLink) dashboardLink.style.display = "block";

    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  } else {
    if(profileImg) profileImg.style.backgroundImage = `url('${defaultImg}')`;
    if(userName) userName.textContent = "Guest";
    if(userEmail) userEmail.textContent = "";
    if(authBtn) {
        authBtn.textContent = "🔐 Sign In";
        authBtn.onclick = () => window.location.href = "/auth/";
    }
    if(dashboardLink) dashboardLink.style.display = "none";
  }
});

// ------------------------------------------------------------------
// 2. MAIN PAGE INITIALIZATION (Consolidated)
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    
    // A. Load Content
    loadAllProducts();
    loadTestimonials(); // Moved inside for safety

    // B. Update Copyright Year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // C. Browser Notification Logic
    const hasBeenWelcomed = localStorage.getItem("browserWelcomeShown");

    if (!hasBeenWelcomed) {
        document.addEventListener("click", askForNotificationPermission, { once: true });
    }

    function askForNotificationPermission() {
        if (!("Notification" in window)) return;

        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                showWelcomeNotification();
            }
        });
    }

    function showWelcomeNotification() {
        const notification = new Notification("Welcome to BixMAX! 🛍️", {
            body: "Your all-in-one online shopping store. Check out our hot sales!",
            icon: "https://i.postimg.cc/fbMdWcc6/shop-logo-removebg-preview.png", 
            vibrate: [200, 100, 200]
        });

        notification.onclick = function() {
            window.focus();
            window.location.href = "https://bixmax.store/#fashion";
            notification.close();
        };

        localStorage.setItem("browserWelcomeShown", "true");
    }

    // D. Menu Close Logic (Fixed missing variables)
    const menu = document.getElementById('fullMenu');
    const hamburger = document.querySelector('.menu-toggle');

    document.addEventListener('click', (e) => {
        // Only run if menu and hamburger exist
        if (menu && hamburger) {
            if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
                menu.classList.remove('active');
                menu.classList.remove('show'); // Added 'show' based on your HTML
                hamburger.classList.remove('active');
            }
        }
    });
});

// --- GALLERY VARIABLES ---
let currentModalImages = [];
let currentImageIndex = 0;

// 1. OPEN MODAL
window.openProductModal = function(product) {
  const modal = document.getElementById("productModal");
  
  // Setup Images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      currentModalImages = product.images;
  } else {
      currentModalImages = [product.image || "https://via.placeholder.com/150"];
  }
  
  currentImageIndex = 0;
  updateMainImage();
  renderThumbnails();

  // Setup Text
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalDesc").textContent = product.description || "No description available.";

  const priceEl = document.getElementById("modalPrice");
  if (product.originalPrice) {
      priceEl.innerHTML = `<span style="text-decoration: line-through; color: gray; font-size: 16px; margin-right: 8px;">GH₵${product.originalPrice.toFixed(2)}</span>
                           <span>GH₵${product.price.toFixed(2)}</span>`;
  } else {
      priceEl.textContent = `GH₵${product.price.toFixed(2)}`;
  }

  // Setup Buttons
  document.getElementById("modalAddToCartBtn").onclick = () => {
      window.addToCart(product);
      window.closeProductModal();
  };

  document.getElementById("modalBuyNowBtn").onclick = () => {
      window.addToCart(product);
      window.location.href = "/Cart/";
  };

  modal.style.display = "flex";
};

// 2. UPDATE IMAGE
function updateMainImage() {
    const img = document.getElementById("modalImg");
    img.src = currentModalImages[currentImageIndex];

    // Highlight thumbnail
    document.querySelectorAll(".thumb-img").forEach((t, i) => {
        if(i === currentImageIndex) t.classList.add("active-thumb");
        else t.classList.remove("active-thumb");
    });
}

// 3. RENDER THUMBNAILS
function renderThumbnails() {
    const container = document.getElementById("modalThumbnails");
    const prev = document.querySelector(".nav-btn.prev");
    const next = document.querySelector(".nav-btn.next");

    container.innerHTML = "";

    if (currentModalImages.length <= 1) {
        container.style.display = "none";
        prev.style.display = "none"; 
        next.style.display = "none";
    } else {
        container.style.display = "flex";
        prev.style.display = "flex"; 
        next.style.display = "flex";
        
        currentModalImages.forEach((src, idx) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.className = "thumb-img";
            thumb.onclick = () => { currentImageIndex = idx; updateMainImage(); };
            container.appendChild(thumb);
        });
    }
}

// 4. ARROWS
window.changeModalImage = function(dir) {
    currentImageIndex += dir;
    if (currentImageIndex >= currentModalImages.length) currentImageIndex = 0;
    else if (currentImageIndex < 0) currentImageIndex = currentModalImages.length - 1;
    updateMainImage();
};

// 5. CLOSE
window.closeProductModal = function() {
    document.getElementById("productModal").style.display = "none";
};

window.onclick = function(e) {
    if (e.target === document.getElementById("productModal")) closeProductModal();
};
// ------------------------------------------------------------------
// 4. TESTIMONIALS LOGIC
// ------------------------------------------------------------------
let currentIdx = 0;
let testimonialInterval;

async function loadTestimonials() {
  const card = document.getElementById("testimonialCard");
  if (!card) return; // Safety check
  
  try {
    const snapshot = await getDocs(collection(db, "testimonials"));
    const testimonials = [];
    snapshot.forEach(doc => testimonials.push(doc.data()));

    if (testimonials.length === 0) {
      card.innerHTML = `<p>No reviews yet.</p>`;
      card.classList.add("visible");
      return;
    }

    const showTestimonial = (index) => {
      const t = testimonials[index];
      card.classList.remove("visible");
      setTimeout(() => {
        card.innerHTML = `
            <div class="testimonial-header">
              <img src="${t.photoURL || 'https://i.postimg.cc/XYNFYy52/A1BCF7DE-62DD-4F55-8613-FAA324A9AD70.jpg'}" alt="User">
              <div>
                <div class="testimonial-name" style="font-weight:bold; color:#333;">${t.name || 'User'}</div>
                <div class="stars">${"⭐".repeat(t.rating || 5)}</div>
              </div>
            </div>
            <p>“${t.text || ''}”</p>
        `;
        card.classList.add("visible");
      }, 800);
    };

    showTestimonial(0);

    if (testimonials.length > 1) {
      testimonialInterval = setInterval(() => {
        currentIdx++;
        if (currentIdx >= testimonials.length) currentIdx = 0;
        showTestimonial(currentIdx);
      }, 6000);
    }

  } catch (err) {
    console.error(err);
    card.innerHTML = `<p>No reviews yet</p>`;
    card.classList.add("visible");
  }
}
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');

  images.forEach(img => {
    // 1. Prevent image drag (desktop)
    img.setAttribute('draggable', false);

    // 2. Prevent right-click/context menu (desktop/mobile long press)
    img.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      // Optional: Show a message like "Content is protected"
    });
  });
});

