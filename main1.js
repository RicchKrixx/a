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

function showSkeletons(container, count = 6) {
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

    const priceHTML = product.originalPrice
      ? `<span style="text-decoration: line-through; color: gray; font-size:11px; margin-right:3px;">GH₵${product.originalPrice.toFixed(2)}</span>
         <span style="font-weight:600; color:#222;font-size:14px;">GH₵${product.price.toFixed(2)}</span>`
      : `<span style="font-weight:700; color:#222;font-size:14px;">GH₵${product.price.toFixed(2)}</span>`;

    const imgSrc = product.image?.startsWith("http") ? product.image : "https://via.placeholder.com/150";

    // Create the product cardw
    div.innerHTML = `
      ${discount ? `<span class="badge">🔥${discount}% OFF</span>` : ""}
      <div class="image-wrapper">
        <div class="skeleton-img"></div> <!-- Skeleton for the image -->
        <img src="${imgSrc}" alt="${product.name}" loading="lazy" class="product-img"/>
      </div>
      <h3>${product.name}</h3>
      <div class="price">${priceHTML}</div>
     <button class="add" onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
    `;

    const img = div.querySelector("img");
    const skeleton = div.querySelector(".skeleton-img");

    // Hide skeleton when image is loaded
    img.onload = () => {
      skeleton.style.display = 'none'; // Hide skeleton after image load
    };

    // Fallback in case the image fails to load
    img.onerror = () => {
      img.src = "https://via.placeholder.com/150"; // Fallback image if error occurs
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



onAuthStateChanged(auth, async user => {
  const profileImg = document.getElementById('menuProfileImg');
  const userName = document.getElementById('menuUserName');
  const userEmail = document.getElementById('menuUserEmail');
  const authBtn = document.getElementById('authBtn');
  const dashboardLink = document.getElementById('dashboardLink');

  const defaultImg = "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg";

  if (user) {
    try {
      // 🔎 Query the users collection where uid == current user's uid
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      let data = {};
      if (!querySnapshot.empty) {
        // Assuming only one document matches
        data = querySnapshot.docs[0].data();
      }

      const finalImg = data.photoURL || user.photoURL || defaultImg;

      profileImg.style.backgroundImage = `url('${finalImg}')`;
      userName.textContent = data.displayName || user.displayName || user.email.split("@")[0];
      userEmail.textContent = user.email;
      authBtn.textContent = "🚪 Logout";
      dashboardLink.style.display = "block";
      authBtn.onclick = () => signOut(auth);
    } catch (err) {
      console.error("Failed to load profile:", err);
      profileImg.style.backgroundImage = `url('${defaultImg}')`;
      userName.textContent = user.email.split("@")[0];
      userEmail.textContent = user.email;
    }
  } else {
    profileImg.style.backgroundImage = `url('${defaultImg}')`;
    userName.textContent = "Guest";
    userEmail.textContent = "";
    authBtn.textContent = "🔐 Sign In";
    dashboardLink.style.display = "none";
    authBtn.onclick = () => window.location.href = "/auth/";
  }
});


  window.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('bixmax_has_visited')) {
      localStorage.setItem('bixmax_has_visited', 'true');
      if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification("👋 Welcome to BixMAX!", {
              body: "Thanks for visiting us!",
              icon: "Bixmaxlogo.png"
            });
          }
        });
      }
    }

 loadAllProducts();
});

	
      // Update year
      document.getElementById("year").textContent = new Date().getFullYear();
	document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

// Open preview when any product image is clicked
document.addEventListener("click", function(e) {
  if (e.target.tagName === "IMG" && e.target.closest(".card")) {
    const modal = document.getElementById("imgPreview");
    const modalImg = document.getElementById("previewImg");
    modal.style.display = "flex";
    modalImg.src = e.target.src;
  }
});

// Close preview
document.querySelector("#imgPreview .close").onclick = function() {
  document.getElementById("imgPreview").style.display = "none";
};

// Close if clicked outside image
document.getElementById("imgPreview").onclick = function(e) {
  if (e.target === this) this.style.display = "none";
};
		



async function loadTestimonials() {
  const track = document.getElementById("testimonialTrack");

  try {
    const snapshot = await getDocs(collection(db, "testimonials"));
    const testimonials = [];

    snapshot.forEach(doc => testimonials.push(doc.data()));

    if (testimonials.length === 0) {
      track.innerHTML = `<p>No testimonials yet.</p>`;
      return;
    }

    // Generate the items twice to create seamless infinite loop
    const doubled = [...testimonials, ...testimonials];

    doubled.forEach(t => {
      const item = document.createElement("div");
      item.className = "testimonial-item";

      item.innerHTML = `
        <div class="testimonial-header">
          <img src="${t.photoURL || 'https://i.postimg.cc/XYNFYy52/A1BCF7DE-62DD-4F55-8613-FAA324A9AD70.jpg'}">
          <span class="testimonial-name">${t.name || 'User'}</span>
        </div>
        <p>“${t.text || ''}”</p>
        <div class="stars">${"⭐".repeat(t.rating || 0)}</div>
      `;

      track.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    track.innerHTML = `<p style="color:red;">Error loading testimonials</p>`;
  }
}

loadTestimonials();
    function toggleMenu() {
      const menu = document.getElementById('fullMenu');
      const toggle = document.querySelector('.menu-toggle');
      const bottomBar = document.getElementById('bottomBar');

      if (menu.classList.contains('show')) {
        menu.classList.remove('show', 'animate');
        toggle.style.display = 'block';
        if (bottomBar) bottomBar.style.display = 'flex';
        document.body.style.overflow = '';
      } else {
        menu.classList.add('show');
        setTimeout(() => menu.classList.add('animate'), 50);
        toggle.style.display = 'none';
        if (bottomBar) bottomBar.style.display = 'none';
        document.body.style.overflow = 'hidden';
      }
    }

const scrollBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});
scrollBtn.onclick = () => window.scrollTo({top:0, behavior:'smooth'});
	
function addToCart(product) {
  if (!product || !product.name) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Look for existing product in cart by name (or you could use id)
  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartDisplay();

  // Small bounce animation
  const cartIcon = document.getElementById('cartIcon');
  cartIcon.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' }
    ],
    { duration: 300, iterations: 1 }
  );
}

function updateCartDisplay() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartIcon = document.getElementById('cartIcon');
  if (cart.length > 0) cartIcon.classList.add('show');
  else cartIcon.classList.remove('show');
}

const searchInput = document.querySelector('.input__search');
const searchButton = document.querySelector('.input__button__shadow');
const closeButton = document.querySelector('.input__close__button');
const noResults = document.getElementById('searchNoResults');
const categoriesSection = document.querySelector('.categories');
const sectionTitles = document.querySelectorAll('.sections h2');
const productSections = document.querySelectorAll('.section');

// 🔍 When search button is clicked
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  const allProducts = document.querySelectorAll('.card');

  if (!query) {
    resetSearch();
    return;
  }

  // Hide search button, show close button
  searchButton.style.display = 'none';
  closeButton.style.display = 'flex';

  categoriesSection.style.display = 'none';
  sectionTitles.forEach(h2 => h2.style.display = 'none');

  let found = 0;

  allProducts.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(query)) {
      card.style.display = 'block';
      found++;
    } else {
      card.style.display = 'none';
    }
  });

  productSections.forEach(section => {
    const visible = section.querySelectorAll('.card[style*="display: block"]').length;
    section.style.display = visible ? 'block' : 'none';
  });

  noResults.style.display = found === 0 ? 'flex' : 'none';
});

// ✕ When close button is clicked
closeButton.addEventListener('click', () => {
  searchInput.value = '';
  resetSearch();
  closeButton.style.display = 'none';
  searchButton.style.display = 'flex';
});

searchInput.addEventListener('input', () => {
  const hasText = searchInput.value.trim().length > 0;

  if (hasText) {
    // User is editing → show search button again
    searchButton.style.display = 'flex';
    closeButton.style.display = 'none';
  } else {
    // Input is empty → reset everything
    resetSearch();
    searchButton.style.display = 'flex';
    closeButton.style.display = 'none';
  }
});


// 🔁 Restore everything
function resetSearch() {
  const allProducts = document.querySelectorAll('.card');
  categoriesSection.style.display = 'block';
  sectionTitles.forEach(h2 => h2.style.display = 'block');
  productSections.forEach(section => (section.style.display = 'block'));
  allProducts.forEach(card => (card.style.display = 'block'));
  noResults.style.display = 'none';
}
</script>
 <script>
    const notifBtn = document.getElementById("notifBtn");
    const notifCount = document.getElementById("notifCount");
    const notifModal = document.getElementById("notifModal");
    const notifList = document.getElementById("notifList");

    // Toggle modal
    notifBtn.addEventListener("click", () => {
      const open = notifModal.style.display === "block";
      notifModal.style.display = open ? "none" : "block";
    });

    let unsubscribe = null;

    auth.onAuthStateChanged(user => {
      console.log("Auth state:", user ? user.uid : "no user");

      // Clean up any previous listener
      if (unsubscribe) { unsubscribe(); unsubscribe = null; }

      if (!user) {
        notifBtn.style.display = "none";
        notifModal.style.display = "none";
        notifList.innerHTML = "";
        notifCount.style.display = "none";
        return;
      }

      try {
        // Query notifications by uid
        const queryRef = db.collection("notifications").where("uid", "==", user.uid);

        unsubscribe = queryRef.onSnapshot(
          (snapshot) => {
            const notifications = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            console.log("Notif docs:", notifications);
            renderNotifications(notifications);
          },
          (err) => {
            console.error("onSnapshot error:", err);
            notifBtn.style.display = "none";
            notifModal.style.display = "none";
            notifCount.style.display = "none";
          }
        );
      } catch (err) {
        console.error("Failed to attach listener:", err);
      }
    });

    function renderNotifications(notifications) {
      notifList.innerHTML = "";
      if (!notifications.length) {
        notifList.innerHTML = `<p style="color:#555;">No notifications at the moment.</p>`;
        notifBtn.style.display = "none";
        notifCount.style.display = "none";
        notifModal.style.display = "none";
        return;
      }

      // Sort newest first safely
      notifications.sort((a, b) => {
        const ta = a.timestamp && a.timestamp.toMillis ? a.timestamp.toMillis() : 0;
        const tb = b.timestamp && b.timestamp.toMillis ? b.timestamp.toMillis() : 0;
        return tb - ta;
      });

      let unreadCount = 0;

      notifications.forEach(notif => {
        const div = document.createElement("div");
        div.style.padding = "8px";
        div.style.borderBottom = "1px solid #eee";
        div.style.cursor = "pointer";
        div.style.borderRadius = "20px";
        // Treat missing read as unread
        const isUnread = notif.read !== true;
        if (isUnread) {
          div.style.background = "#e6f0ff";
          div.style.fontWeight = "bold";
          unreadCount++;
        } else {
          div.style.background = "#fff";
          div.style.color = "#555";
		  
        }

        div.innerHTML = `
          <strong>${notif.orderId || ""}</strong>
          <p style="margin:4px 0;">${notif.message || ""}</p>
        `;

        div.onclick = async () => {
          try {
            await db.collection("notifications").doc(notif.id).update({ read: !notif.read });
          } catch (err) {
            console.error("Failed to toggle read:", err);
          }
        };

        notifList.appendChild(div);
      });

      // Show button if any unread
      if (unreadCount > 0) {
        notifBtn.style.display = "inline-block";
        notifCount.textContent = unreadCount;
        notifCount.style.display = "block";
      } else {
        notifBtn.style.display = "none";
        notifModal.style.display = "none";
        notifCount.style.display = "none";
      }
    }

	
