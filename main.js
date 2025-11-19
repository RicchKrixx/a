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
      track.innerHTML = `<p>...</p>`;
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
    track.innerHTML = `<p style="color:red;">...</p>`;
  }
}

loadTestimonials();
