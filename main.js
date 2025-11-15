
    // 1) Replace with your config
    const firebaseConfig = {
      apiKey: "AIzaSyB0BBzQzGX6MHVSjn09VSD-JGpSwOu8EqQ",
      authDomain: "bixmax-6c24c.firebaseapp.com",
      projectId: "bixmax-6c24c",
      storageBucket: "bixmax-6c24c.appspot.com",
      messagingSenderId: "37740442541",
      appId: "1:37740442541:web:a2e2b9bb81c6a8e76c6724"
    };

    // ✅ Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const auth = firebase.auth();
    const db = firebase.firestore();

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

		var Tawk_API=Tawk_API||{},
		Tawk_LoadStart=new Date();
		(function(){ var s1=document.createElement("script"),
		s0=document.getElementsByTagName("script")[0]; 
		s1.async=true; 
		s1.src='https://embed.tawk.to/69068e6d40b306194f3da129/default'; 
		s1.charset='UTF-8'; 
		s1.setAttribute('crossorigin','*'); 
		s0.parentNode.insertBefore(s1,s0); 
		})();

	
