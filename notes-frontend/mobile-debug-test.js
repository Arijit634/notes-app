// Mobile Sidebar Debug Test
// Open this in browser console and run to test mobile sidebar functionality

function testMobileSidebar() {
  console.log('=== Mobile Sidebar Debug Test ===');
  
  // Check if we're in mobile view
  const isMobile = window.innerWidth < 1024;
  console.log('Is Mobile View:', isMobile);
  
  // Check if sidebar overlay exists
  const overlay = document.querySelector('.mobile-overlay');
  console.log('Mobile Overlay Found:', !!overlay);
  
  if (overlay) {
    console.log('Overlay z-index:', window.getComputedStyle(overlay).zIndex);
    console.log('Overlay pointer-events:', window.getComputedStyle(overlay).pointerEvents);
  }
  
  // Check if sidebar exists
  const sidebar = document.querySelector('aside');
  console.log('Sidebar Found:', !!sidebar);
  
  if (sidebar) {
    console.log('Sidebar z-index:', window.getComputedStyle(sidebar).zIndex);
  }
  
  // Check hamburger button
  const hamburger = document.querySelector('button');
  console.log('Hamburger Button Found:', !!hamburger);
  
  // Test Redux state (if available)
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('Redux DevTools available - check mobile menu state');
  }
  
  console.log('=== End Test ===');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  testMobileSidebar();
}
