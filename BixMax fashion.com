	<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8"/>
    <title>BizMAX</title>

	
	<style>	
    /* Basic Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow-x: hidden; font-family: Arial, sans-serif; }

    body.noscroll {
      position: fixed !important;
      overflow: hidden !important;
      height: 100vh !important;
      width: 100% !important;
    }

    .container {
      padding-top: 0px; /* Allow space for top menu */
      padding-bottom: 80px; /* Allow space for bottom bar */
      min-height: 100vh;
      background-color: lightblue;
      text-align: center;
    }


    /* Menu Toggle Icon */
    .menu-toggle {
      position: fixed;
      top: 15px;
      left: 15px;
      font-size: 30px;
      cursor: pointer;
      z-index: 2000;
      color: white;
      border-radius: 6px;
      padding: 5px 10px;
    }

    /* Full-screen Sliding Menu */
    .menu-overlay {
      position: fixed;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: #2d2d2d;
      color: white;
      z-index: 1500;
      display: flex;
      flex-direction: column;
      padding: 20px;
      transition: left 0.3s ease-in-out;
    }
    .menu-overlay.show { left: 0; }

    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .menu-header h2 {
      font-size: 26px;
      color: white;
    }
    .menu-overlay .close {
      font-size: 28px;
      cursor: pointer;
      background: none;
      color: white;
      border: none;
    position: absolute;
	top: 10px;
	right: 10px;
	text-decoration: none;
	z-index: 1001;
	font-size: 25px;
    }

    .menu-overlay ul {
      list-style: none;
      margin-top: 30px;
      text-align: left;
    color: white;
    }

		
@keyframes animatedBackground {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

header {

	width:100%;
	padding:24px;
	border-radius:16px;
    backdrop-filter: blur(25px);
	color: white;
	display: flex;
	flex-direction: column;
	align-items:center;
	font-weight: bold;
	background-size: cover;
        margin-bottom: 10px;
}
.fashion {

   	width: 100%;
	padding: 24px;
	border-radius: 30px;
	border: solid 5px rgb(255, 255, 255, 0.1);
    backdrop-filter: blur(25px);
	box-shadow: 0px 0px 30px 20px rgb(0,0,0,0.1);
	color: white;
	display: flex;
	flex-direction: column;
	align-items:center;
}

.fashion-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    margin-top: 20px;

}


.item {
	background-color: lightgrey;
	border-radius: 20px;
	overflow: hidden;
    gap: 10px;
    justify-content: center;
    margin-top: 10px;
	color: black;

}
.item img {
	max-width: 100%;
	background-color: #666;
	display: flex;
    border-radius: 20px;
    margin-bottom: 10px;
	flex-shrink: 0;
    border-radius: 20px; 
}

.quantity {
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.quantity button {
  width: 30px;
  height: 30px;
  font-size: 18px;
  border: none;
  background: #1976d2;
  color: black;
  border-radius: 6px;
  cursor: pointer;
}

.quantity span {
  font-size: 18px;
  color: black;
}

/* ========== BOTTOM BAR ========== */
#bottomBar {
  position: fixed;
  bottom: 0px;
  left: 0px;
  width:100%;
  display:flex;
  border: solid 5px rgb(255, 255, 255, 0.1);
  backdrop-filter: blur(25px);
  box-shadow: 0px 0px 30px 20px rgb(0,0,0,0.1);
  justify-content:space-between;
  align-items:center;
  padding: 8px;
  border-radius:30px;
  z-index: 9999;
}
.bottom-bar span {
	position: fixed;
  color:#000;
  font-weight:bold;
  font-size:18px;
  border: solid 5px rgb(255, 255, 255, 0.1);
  backdrop-filter: blur(25px);
  box-shadow: 0px 0px 30px 20px rgb(0,0,0,0.1);

}
.checkout-btn {
  color: black;
  border: solid 5px rgb(255, 255, 255, 0.1);
  backdrop-filter: blur(25px);
  box-shadow: 0px 0px 30px 20px rgb(0,0,0,0.1);
  padding:10px 20px;
  border-radius:25px;
  font-weight:bold;
  text-decoration:none;
}
#bottomBar {
	transition: all 0.3s ease-in-out;
}
/* ========== FOOTER ========== */
footer {
        color:#fff;
        text-align:center;
        padding:15px;
        border: solid 5px rgb(255, 255, 255, 0.1);
        backdrop-filter: blur(25px);
	box-shadow: 0px 0px 30px 20px rgb(0,0,0,0.1);
      	color: white;
        margin:20px;
        border-radius:16px;}

/* ========== RESPONSIVE ========== */
@media(max-width:768px){
  .menu-icon{display:block;}
  nav ul {
    display:none;
    flex-direction:column;
    gap:10px;
    background:#2d2d2d;
    border-radius:12px;
    padding:10px;}
  nav ul.show{
    display:flex;}
}
@media(max-width:480px){.item{width:90%;}}


/* Responsive */
@media (max-width: 480px) {
    nav ul {
        flex-direction: column;
        gap: 10px;
    }

    .search-container input {
        width: 90%;
    }

    .fashion-grid {
        flex-direction: column;
        align-items: center;
    }
	header {
	width: 100%;
	height: auto;
	}
}

h1, h2, h3 {
    margin-bottom: 10px;
}
		h3 {
			color: black;
		}


/*mobile Responsive*/
@media (max-width: 480px) {
	.item {
		width: 90%;
	}
	.payment-method {
		flex-direction: column;
		align-items: center;
	}
	.button {
		flex-direction: column;
	}
	.bottom-bar {
		bottom: 0px;
		font-size: 16px;
		padding: 6px 12px;
	}
}
.menu-overlay ul li {
  margin: 20px 0;
  opacity: 0;
  transform: translateX(-30px);
	color: white;
}

.menu-overlay.show.animate ul li {
  animation: slideIn 0.5s forwards;
}

.menu-overlay.show.animate ul li:nth-child(1) { animation-delay: 0.1s; }
.menu-overlay.show.animate ul li:nth-child(2) { animation-delay: 0.2s; }
.menu-overlay.show.animate ul li:nth-child(3) { animation-delay: 0.3s; }
.menu-overlay.show.animate ul li:nth-child(4) { animation-delay: 0.4s; }
.menu-overlay.show.animate ul li:nth-child(5) { animation-delay: 0.5s; }
.menu-overlay.show.animate ul li:nth-child(6) { animation-delay: 0.6s; }
.menu-overlay.show.animate ul li:nth-child(7) { animation-delay: 0.7s; }
.menu-overlay.show.animate ul li:nth-child(8) { animation-delay: 0.8s; }
@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
		

.menu-overlay ul li:last-child {
	border-top: 1px solid rgba(255, 255, 255, 0.3);
}		


.menu-overlay ul li a {
  color: white;
  font-size: 18px;
  text-decoration: none;
}		
		
		@keyframes backgroundShift {
  0% { background-color: #add8e6; }    /* light blue */
  25% { background-color: #00ced1; }   /* dark cyan */
  50% { background-color: #87cefa; }   /* sky blue */
  75% { background-color: #00ced1; }   /* dark cyan */
  100% { background-color: #add8e6; }  /* back to light blue */
}

body {
  animation: backgroundShift 20s infinite linear;
  transition: background-color 1s ease;
}
.home {
	margin-top: 10px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}	
	
	
	
	</style>
</head>
<body id="pageBody" class="container">

  <div class="menu-toggle" onclick="toggleMenu()">☰</div>

  <div id="fullMenu" class="menu-overlay">
    <div class="menu-header">
     <h2>BixMAX</h2>
 <button class="close" onclick="toggleMenu()">✖️</button>
    </div>
    <ul>
      <li><a class="home" href="BixMax home.html">🏠HOME</a></li>
	    <br>
	    <br>
      <li><a href="BixMax grocery.html">🍎Groceries</a></li>
      <li><a href="BixMax electronics.html">📱Electronics</a></li>
      <li><a href="BixMax food menu.html">🍔Food Menu</a></li>
      <li><a href="BixMax home essential.html">🏠Home Essentials</a></li>
	    <br>
		    <br>
      <li><a href="tel:0536345825">☎️Contact</a></li>
	
    </ul>
</div>



	  <header>
		  <h1>BixMAX</h1>
        <h3>All-in-One Online Shop</h3>
		

		
    </header>

	<section class="fashion">
      <b><h1>👗Fashion</h1></b>
    <div class="fashion-grid">
      <div align="center" class="item" data-Price="20">
      <img src="pp.jpeg" alt="l">
      <h3>Labubu</h3>
      <p>$20</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div>
	        <div align="center" class="item" data-Price="20">
      <img src="pp.jpeg" alt="p">
      <h3>Purse</h3>
      <p>$20</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div>
        <div align="center" class="item" data-Price="15">
      <img src="pp.jpeg" alt="bag">
      <h3>Tote bags</h3>
      <p>$15</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div>
        <div align="center" class="item" data-Price="30">
      <img src="pp.jpeg" alt="shirts">
      <h3>Shirts</h3>
      <p>$30</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div>
        <div align="center" class="item" data-Price="20">
      <img src="pp.jpeg" alt="sd">
      <h3>Summer dresses</h3>
      <p>$20</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div>
        <div align="center" class="item" data-Price="20">
      <img src="pp.jpeg" alt="cc">
      <h3>Cuba style men chain</h3>
      <p>$20</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div>
        <div align="center" class="item" data-Price="50">
      <img src="pp.jpeg" alt="sneakers">
      <h3>Sneakers</h3>
      <p>$50</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div>
        <div align="center" class="item" data-Price="25">
      <img src="pp.jpeg" alt="wg">
      <h3>Women glasses</h3>
      <p>$25</p>
      <div class="quantity">
        <button onclick="updateQuantity(this, -1)">−</button>
        <span class="count">0</span>
        <button onclick="updateQuantity(this, 1)">+</button>
		</div>
		</div> 
	

  </div>
</section>
  <div id="bottomBar">
	         <div class="grand-total">
    <span>Total: $<span id="grand-total">0.00</span></span>
 </div>
<button id="checkoutBtn" class="checkout-btn">CHECKOUT</button>
  
     </div>

 <footer>&copy; BixMAX 2025. All rights reserved.</footer>
<script>
/* ─── 1.  Quantity buttons ─── */
function updateQuantity(btn, delta) {
  const item   = btn.closest('.item');
  const count  = item.querySelector('.count');
  count.textContent = Math.max(0, +count.textContent + delta);
  updateGrandTotal();              // recalc + save every change
}

/* ─── 2.  Re-calculate total & store it ─── */
function updateGrandTotal() {
  let total = 0;
  const items = document.querySelectorAll('.item');

  items.forEach(it => {
    const qty   = +it.querySelector('.count').textContent || 0;
    const price = +it.dataset.price;
    total += qty * price;
  });

  document.getElementById('grand-total').textContent = total.toFixed(2);
  localStorage.setItem('grandTotal', total.toFixed(2));      // 🔥 keep in storage
}
</script>
	<script>
document.getElementById('checkoutBtn').addEventListener('click', function (event) {
  event.preventDefault(); // Stop all default behavior

  const total = parseFloat(document.getElementById('grand-total').textContent || '0');

  if (total > 0) {
    localStorage.setItem("grandTotal", total.toFixed(2));
    window.location.href = "checkout.html";
  } else {
    alert("🛒 Your cart is empty!");
    // Do nothing else — stay on the page
  }
});
</script>
<script>
function toggleMenu() {
  const menu = document.getElementById('fullMenu');
  const toggle = document.querySelector('.menu-toggle');
  const bottomBar = document.getElementById('bottomBar');

  if (menu.classList.contains('show')) {
    menu.classList.remove('show', 'animate');
    toggle.style.display = 'block';
    bottomBar.style.display = 'flex';
    document.body.style.overflow = ''; // Enable scroll
  } else {
    menu.classList.add('show');
    setTimeout(() => menu.classList.add('animate'), 50);
    toggle.style.display = 'none';
    bottomBar.style.display = 'none';
    document.body.style.overflow = 'hidden'; // Disable scroll
  }
}
</script>
<script>
function checkGrandTotal() {
  const total = parseFloat(document.getElementById('grand-total').textContent || '0');

  if (total > 0) {
    // Save grand total to localStorage
    localStorage.setItem("grandTotal", total.toFixed(2));
    
    // Redirect to checkout page
    window.location.href = "checkout.html";
  } else {
    alert("🛒 Your cart is empty!");
  }
}
</script>
</body>
	 
</html>
