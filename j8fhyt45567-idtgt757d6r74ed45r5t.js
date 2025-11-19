// Firebase config  
  const firebaseConfig = {
    apiKey: "AIzaSyB0BBzQzGX6MHVSjn09VSD-JGpSwOu8EqQ",
    authDomain: "bixmax-6c24c.firebaseapp.com",
    projectId: "bixmax-6c24c",
    storageBucket: "bixmax-6c24c.appspot.com",
    messagingSenderId: "37740442541",
    appId: "1:37740442541:web:a2e2b9bb81c6a8e76c6724"
  };  
firebase.initializeApp(firebaseConfig);  
const db = firebase.firestore();  
  
// Shop coordinates  
const shopLat = 5.791;  
const shopLng = -0.199;  
const feePerKm = 1.30;  
  
// Helpers  
function getCart(){ return JSON.parse(localStorage.getItem("cart"))||[]; }  
function updateBadge(){  
  // Clean up cart before sending to Firestore
let cart = getCart().map(item => {
  let cleaned = { ...item };
  if (cleaned.selectedVariation) {
    // rename it properly as 'size' or 'selectedSize'
    cleaned.size = cleaned.selectedVariation;
  }
  delete cleaned.sizes; // remove the full list of available sizes
  delete cleaned.selectedVariation;
  return cleaned;
});
  
  let qty=cart.reduce((sum,i)=>sum+(i.qty||1),0);  
  document.getElementById("cartCount").textContent=qty;  
}  
document.getElementById("year").textContent=new Date().getFullYear();  
updateBadge();  
  
// Haversine distance  
function getDistanceKm(lat1, lon1, lat2, lon2){  
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;  
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;  
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));  
}  
  
// Render order summary  
function renderOrderSummary(){  
  const summary = document.getElementById("orderSummary");  
  const cart = getCart();  
  const btn = document.getElementById("placeOrderBtn");  
  
  btn.disabled = true;  
  btn.textContent = "Please wait…";  
  
  if(cart.length===0){  
    summary.innerHTML="<p>Cart is empty.</p>";  
    return;  
  }  
  
  let subtotal = 0;  
  cart.forEach(i => subtotal += i.price * i.qty);  
  
  summary.innerHTML = `  
    <b>Order Summary:</b><br/>  
    ${cart.map(i=>`${i.name} x${i.qty} — GH₵ ${i.price*i.qty}`).join("<br>")}  
    <br><br>Delivery expected within 7 days<br><br>Subtotal: GH₵ ${subtotal}  
    <br>Delivery: <span id="deliveryFee">Calculating…</span>  
    <br><b>Total: <span id="grandTotal">Hang on…</span></b>
  `;  
  
  const lat = parseFloat(document.getElementById("latitude").value);  
  const lng = parseFloat(document.getElementById("longitude").value);  
  
  if(!isNaN(lat)&&!isNaN(lng)){  
    const dist = getDistanceKm(shopLat, shopLng, lat, lng);
    
    // --- 1. CHANGED THIS (Cap fee at 65 for display) ---
    let deliveryFee = Math.round(dist*feePerKm); 
    if (deliveryFee > 65) {
        deliveryFee = 65;
    }
    // ----------------------------------------------------

    const grand = subtotal + deliveryFee;  
  
    document.getElementById("deliveryFee").textContent = "GH₵ " + deliveryFee;  
    document.getElementById("grandTotal").textContent = "GH₵ " + grand.toFixed(2);  
  
    btn.disabled = false;  
    btn.textContent = document.querySelector("input[name='pay']:checked").value==="paystack"   
      ? "Pay Now"   
      : "Place Order";  
  }  
}  
renderOrderSummary();  
  
// Geolocation  
if(navigator.geolocation){  
  navigator.geolocation.getCurrentPosition(pos=>{  
    document.getElementById("latitude").value = pos.coords.latitude;  
    document.getElementById("longitude").value = pos.coords.longitude;  
    renderOrderSummary();  
  }, ()=>{  
    document.getElementById("deliveryFee").textContent = "Enter address to calculate";  
    document.getElementById("grandTotal").textContent = "—";  
  });  
}  
  
// Paystack toggle  
const placeOrderBtn = document.getElementById("placeOrderBtn");  
document.querySelectorAll("input[name='pay']").forEach(radio=>{  
  radio.addEventListener("change",()=>{  
    placeOrderBtn.textContent = radio.value==="paystack" ? "Pay Now" : "Place Order";  
  });  
});  
  
// Wait for auth to initialize  
let currentUser = null;

firebase.auth().onAuthStateChanged(async user => {
  currentUser = user;
  if (user) {
    try {
      // 🔎 Query the users collection where uid == current user's uid
      const q = db.collection("users").where("uid", "==", user.uid);
      const snapshot = await q.get();

      if (!snapshot.empty) {
        // Assuming only one match
        const data = snapshot.docs[0].data();

        if (data.name) document.getElementById("name").value = data.name;
        if (data.phone) document.getElementById("phone").value = data.phone;
        if (data.email) document.getElementById("email").value = data.email;
        if (data.address) document.getElementById("address").value = data.address;
      } else {
        // If no profile doc yet, fill email from auth
        if (user.email) document.getElementById("email").value = user.email;
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      if (user.email) document.getElementById("email").value = user.email;
    }
  }
});


// Submit order  
function submitOrder(e){  
  e.preventDefault();  
  const cart = getCart();  
  if(cart.length===0){alert("Cart is empty."); return false;}  
  
  document.getElementById("loaderOverlay").style.display = "flex";  
  
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);  
  const lat = parseFloat(document.getElementById("latitude").value);  
  const lng = parseFloat(document.getElementById("longitude").value);  
  let deliveryFee = 0;  
  if(!isNaN(lat)&&!isNaN(lng)){  
    const dist = getDistanceKm(shopLat,shopLng,lat,lng); 
    
    // --- 2. CHANGED THIS (Cap fee at 65 for processing) ---
    deliveryFee = Math.round(dist*feePerKm); 
    if (deliveryFee > 65) {
        deliveryFee = 65;
    }
    // ------------------------------------------------------
  }  
  const grand = subtotal + deliveryFee;  
  
  const order = {  
    name:document.getElementById("name").value,  
    phone:document.getElementById("phone").value,  
    email:document.getElementById("email").value,  
    address:document.getElementById("address").value,  
    latitude:lat,  
    longitude:lng,  
    items:cart,  
    subtotal,  
    deliveryFee,  
    total:grand,  
    payMethod:document.querySelector('input[name="pay"]:checked').value,  
    status:"Pending",  
    createdAt:firebase.firestore.FieldValue.serverTimestamp(),  
    
timestamps: {  
  Pending: firebase.firestore.FieldValue.serverTimestamp()  
} 
}; 
  // Attach userId if logged in  
  if(currentUser){  
    order.uid = currentUser.uid;  
    if(!order.email) order.email = currentUser.email;  
  }  
  
// Generate custom order ID: BXM + 7 digits + 1 uppercase letter
function generateCustomOrderId() {
  const numbers = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random A–Z
  return `BXM${numbers}${letter}`;
}

// Save order using custom ID as Firestore doc ID
const saveAndRedirect = async () => {
  try {
    let customId;
    let exists = true;

    // Keep generating until unique
    while (exists) {
      customId = generateCustomOrderId();
      const doc = await db.collection("orders").doc(customId).get();
      exists = doc.exists;
    }

    // Assign orderId
    order.orderId = customId;

    // Save using custom ID as document ID
    await db.collection("orders").doc(customId).set(order);

if (currentUser) {
  const userQuery = await db.collection("users")
    .where("uid", "==", currentUser.uid)
    .limit(1)
    .get();

  let userRef;

  if (!userQuery.empty) {
    // User document found → update it
    userRef = userQuery.docs[0].ref;
  } else {
    // No document found → create one with your own auto ID
    userRef = db.collection("users").doc();
  }

  await userRef.set({
    uid: currentUser.uid,
    name: order.name,
    phone: order.phone,
    email: order.email,
    address: order.address,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}


    // Clear cart and redirect
    localStorage.removeItem("cart");
    updateBadge();
    setTimeout(() => {
      window.location.href = "/thankyou/?orderId=" + customId;
    }, 1000);

  } catch (err) {
    document.getElementById("loaderOverlay").style.display = "none";
    console.error(err);
    alert("Failed to submit order.");
  }
};


  
  if(order.payMethod==="paystack"){  
    let handler = PaystackPop.setup({  
      key:'pk_live_58c854a20089f4810d6cc5c753ebde517bbdcdd7',  
      email:order.email||"customer@example.com",  
      amount:order.total*100,  
      currency:"GHS",  
      onClose:()=>{  
        document.getElementById("loaderOverlay").style.display = "none";  
        alert('Payment cancelled.');  
      },  
      callback:response=>{  
        order.status="Pending";  
        saveAndRedirect();  
      }  
    });  
    handler.openIframe();  
  } else {  
    saveAndRedirect();  
  }  
  
  return false;  
}
