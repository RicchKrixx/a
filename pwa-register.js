// pwa-register.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // The path must correctly point to the sw.js file
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('PWA ServiceWorker registered successfully!');
      })
      .catch(err => {
        console.error('PWA ServiceWorker registration failed:', err);
      });
  });
} else {
    console.warn('Service Workers are not supported in this browser.');
}
