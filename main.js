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

// --- WISHLIST SYSTEM (NEW) ---
// 1. Load wishlist from phone
let wishlist = JSON.parse(localStorage.getItem('bixmax_wishlist')) || [];

// 2. Global Toggle Function
window.toggleWishlist = function(event, name, price, image) {
    // Stop the card from clicking (don't open modal)
    event.stopPropagation();
    event.preventDefault();
    
    const btn = event.currentTarget;
    const index = wishlist.findIndex(item => item.name === name);

    if (index === -1) {
        // Add to list
        wishlist.push({ name, price, image });
        btn.classList.add('active');
    } else {
        // Remove from list
        wishlist.splice(index, 1);
        btn.classList.remove('active');
    }

    // Save to local storage
    localStorage.setItem('bixmax_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
};

// 3. Open Wishlist Modal
window.openWishlist = function() {
    const modal = document.getElementById('wishlistModal');
    const container = document.getElementById('wishlist-container');
    
    modal.style.display = "flex";
    container.innerHTML = "";

    if (wishlist.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:gray;'>No saved items.</p>";
        return;
    }

    wishlist.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = "display:flex; gap:15px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; align-items:center;";
        div.innerHTML = `
            <img src="${item.image}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
            <div style="flex:1;">
                <h4 style="margin:0; font-size:14px;">${item.name}</h4>
                <div style="font-weight:bold; font-size:14px;">GH₵${item.price}</div>
            </div>
            <button onclick="removeItemFromWishlist('${item.name}')" style="color:red; background:none; border:none; cursor:pointer; font-size:20px;">&times;</button>
        `;
        container.appendChild(div);
    });
};

// 4. Close Wishlist
window.closeWishlist = function() {
    document.getElementById('wishlistModal').style.display = "none";
};

// 5. Helper to remove inside modal
window.removeItemFromWishlist = function(name) {
    wishlist = wishlist.filter(item => item.name !== name);
    localStorage.setItem('bixmax_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    openWishlist(); // Refresh modal
    
    // If on homepage, update the heart icons real-time
    loadAllProducts(); 
};

function updateWishlistCount() {
    const el = document.getElementById('wishlist-count');
    if(el) el.innerText = wishlist.length;
}
// --- END WISHLIST SYSTEM ---


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

// --- MODIFIED RENDER PRODUCTS (Now includes Hearts) ---
function renderProducts(products, container) {
  container.innerHTML = "";

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "card";

    const discount = product.originalPrice
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : null;

    const priceHTML = product.originalPrice
      ? `<span style="text-decoration: line-through; color: gray; font-size:11px; margin-right:3px;">GH₵${product.originalPrice.toFixed(2)}</span>
         <span style="font-weight:600; color:#222;font-size:14px;">GH₵${product.price.toFixed(2)}</span>`
      : `<span style="font-weight:700; color:#222;font-size:14px;">GH₵${product.price.toFixed(2)}</span>`;

    const imgSrc = product.image?.startsWith("http") ? product.image : "https://via.placeholder.com/150";

    // CHECK IF LIKED
    const isLiked = wishlist.some(item => item.name === product.name);
    const activeClass = isLiked ? "active" : "";

    div.innerHTML = `
      ${discount ? `<span class="badge">🔥${discount}% OFF</span>` : ""}
      <div class="image-wrapper" style="cursor: pointer;">
        
        <button class="wishlist-btn ${activeClass}" onclick="toggleWishlist(event, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${imgSrc}')">
             <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>

        <div class="skeleton-img"></div>
        <img src="${imgSrc}" alt="${product.name}" loading="lazy" class="product-img"/>
      </div>
      <h3>${product.name}</h3>
      <div class="price">${priceHTML}</div>
      <button class="add">Add to Cart</button>
    `;

    const img = div.querySelector("img");
    const skeleton = div.querySelector(".skeleton-img");
    img.onload = () => { skeleton.style.display = 'none'; };
    img.onerror = () => { img.src = "https://via.placeholder.com/150"; };

    img.addEventListener("click", () => {
        openProductModal(product);
    });

    const addBtn = div.querySelector(".add");
    addBtn.onclick = () => addToCart(product);

    container.appendChild(div);
  });
}

async function loadProducts(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return []; // Safety check

  showSkeletons(container);

  const cached = getProductsFromCache(category);
  if (cached) {
    setTimeout(() => renderProducts(cached, container), 500);
    return cached;
  }

  try {
    const q = query(collection(db, "products"), where("category", "==", category));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => doc.data());
    shuffleArray(products);
    saveProductsToCache(category, products);
    renderProducts(products, container);
    return products;
  } catch (err) {
    console.error("Error loading products:", err);
    container.innerHTML = "<p style='color:red;'>Failed to load products.</p>";
    return [];
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
  updateWishlistCount(); // Initial count update
  return allProducts;
}

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

document.addEventListener("DOMContentLoaded", function() {
    loadAllProducts();
    loadTestimonials();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

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

    const menu = document.getElementById('fullMenu');
    const hamburger = document.querySelector('.menu-toggle');

    document.addEventListener('click', (e) => {
        if (menu && hamburger) {
            if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
                menu.classList.remove('active');
                menu.classList.remove('show');
                hamburger.classList.remove('active');
            }
        }
    });
});

// --- GALLERY VARIABLES ---
let currentModalImages = [];
let currentImageIndex = 0;

window.openProductModal = function(product) {
  const modal = document.getElementById("productModal");
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      currentModalImages = product.images;
  } else {
      currentModalImages = [product.image || "https://via.placeholder.com/150"];
  }
  
  currentImageIndex = 0;
  updateMainImage();
  renderThumbnails();

  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalDesc").textContent = product.description || "No description available.";

  const priceEl = document.getElementById("modalPrice");
  if (product.originalPrice) {
      priceEl.innerHTML = `<span style="text-decoration: line-through; color: gray; font-size: 16px; margin-right: 8px;">GH₵${product.originalPrice.toFixed(2)}</span>
                           <span>GH₵${product.price.toFixed(2)}</span>`;
  } else {
      priceEl.textContent = `GH₵${product.price.toFixed(2)}`;
  }

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

function updateMainImage() {
    const img = document.getElementById("modalImg");
    img.src = currentModalImages[currentImageIndex];

    document.querySelectorAll(".thumb-img").forEach((t, i) => {
        if(i === currentImageIndex) t.classList.add("active-thumb");
        else t.classList.remove("active-thumb");
    });
}

function renderThumbnails() {
    const container = document.getElementById("modalThumbnails");
    const prev = document.querySelector(".nav-btn.prev");
    const next = document.querySelector(".nav-btn.next");

    container.innerHTML = "";

    if (currentModalImages.length <= 1) {
        container.style.display = "none";
        if(prev) prev.style.display = "none"; 
        if(next) next.style.display = "none";
    } else {
        container.style.display = "flex";
        if(prev) prev.style.display = "flex"; 
        if(next) next.style.display = "flex";
        
        currentModalImages.forEach((src, idx) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.className = "thumb-img";
            thumb.onclick = () => { currentImageIndex = idx; updateMainImage(); };
            container.appendChild(thumb);
        });
    }
}

window.changeModalImage = function(dir) {
    currentImageIndex += dir;
    if (currentImageIndex >= currentModalImages.length) currentImageIndex = 0;
    else if (currentImageIndex < 0) currentImageIndex = currentModalImages.length - 1;
    updateMainImage();
};

window.closeProductModal = function() {
    document.getElementById("productModal").style.display = "none";
};

window.onclick = function(e) {
    if (e.target === document.getElementById("productModal")) window.closeProductModal();
};

// --- TESTIMONIALS ---
let currentIdx = 0;
let testimonialInterval;

async function loadTestimonials() {
  const card = document.getElementById("testimonialCard");
  if (!card) return; 
  
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
    img.setAttribute('draggable', false);
    img.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  });
});
