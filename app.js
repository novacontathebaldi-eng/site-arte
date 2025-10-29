// Data
const paintings = [
  {
    id: 1,
    title: "Aurora Abstrata",
    artist: "Autor: Galeria de Arte",
    category: "abstract",
    price: 1200.00,
    dimensions: "80x60cm",
    technique: "Acrílica sobre tela",
    description: "Pintura abstrata vibrante com cores quentes que evocam um amanhecer",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
  },
  {
    id: 2,
    title: "Montanhas Serenas",
    artist: "Autor: Galeria de Arte",
    category: "landscape",
    price: 1500.00,
    dimensions: "100x70cm",
    technique: "Óleo sobre tela",
    description: "Paisagem montanhosa tranquila com tons suaves de azul e verde",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800"
  },
  {
    id: 3,
    title: "Retrato Moderno",
    artist: "Autor: Galeria de Arte",
    category: "portrait",
    price: 2000.00,
    dimensions: "90x70cm",
    technique: "Mista sobre tela",
    description: "Retrato contemporâneo com técnica mista e expressão marcante",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800"
  },
  {
    id: 4,
    title: "Geometria Urbana",
    artist: "Autor: Galeria de Arte",
    category: "modern",
    price: 1800.00,
    dimensions: "120x80cm",
    technique: "Acrílica sobre tela",
    description: "Composição moderna com formas geométricas e cores vibrantes",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800"
  },
  {
    id: 5,
    title: "Flores Selvagens",
    artist: "Autor: Galeria de Arte",
    category: "landscape",
    price: 1100.00,
    dimensions: "70x50cm",
    technique: "Aquarela",
    description: "Campo de flores silvestres em aquarela delicada",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800"
  },
  {
    id: 6,
    title: "Noite Estrelada Contemporânea",
    artist: "Autor: Galeria de Arte",
    category: "abstract",
    price: 1700.00,
    dimensions: "100x100cm",
    technique: "Acrílica sobre tela",
    description: "Interpretação moderna do céu noturno com técnica abstrata",
    image: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800"
  },
  {
    id: 7,
    title: "Portal Dourado",
    artist: "Autor: Galeria de Arte",
    category: "modern",
    price: 2200.00,
    dimensions: "90x90cm",
    technique: "Folha de ouro e acrílica",
    description: "Obra sofisticada com aplicação de folha de ouro",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800"
  },
  {
    id: 8,
    title: "Serenidade Azul",
    artist: "Autor: Galeria de Arte",
    category: "abstract",
    price: 1400.00,
    dimensions: "80x80cm",
    technique: "Acrílica sobre tela",
    description: "Pintura minimalista em tons de azul transmitindo calma",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800"
  }
];

// State Management
let cart = [];
let currentPage = 'home';
let currentFilters = {
  category: 'all',
  price: 'all',
  search: ''
};

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueShopping = document.getElementById('continueShopping');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const resetFilters = document.getElementById('resetFilters');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');
const notification = document.getElementById('notification');

// Initialize App
function init() {
  renderFeaturedPaintings();
  renderGallery();
  setupEventListeners();
  updateCartUI();
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Mobile Menu
  mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Cart Modal
  cartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
    renderCart();
  });

  closeCart.addEventListener('click', () => {
    cartModal.classList.remove('active');
  });

  continueShopping.addEventListener('click', () => {
    cartModal.classList.remove('active');
  });

  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove('active');
    }
  });

  // Checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showNotification('Seu carrinho está vazio!', 'error');
      return;
    }
    handleCheckout();
  });

  // Filters
  categoryFilter.addEventListener('change', (e) => {
    currentFilters.category = e.target.value;
    renderGallery();
  });

  priceFilter.addEventListener('change', (e) => {
    currentFilters.price = e.target.value;
    renderGallery();
  });

  resetFilters.addEventListener('click', () => {
    currentFilters = { category: 'all', price: 'all', search: '' };
    categoryFilter.value = 'all';
    priceFilter.value = 'all';
    searchInput.value = '';
    renderGallery();
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    currentFilters.search = e.target.value.toLowerCase();
    if (currentPage === 'gallery') {
      renderGallery();
    }
  });

  // Lightbox
  closeLightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });

  // Forms
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Obrigado por se inscrever!');
    newsletterForm.reset();
  });

  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Mensagem enviada com sucesso!');
    contactForm.reset();
  });
}

// Navigation
function navigateTo(page) {
  currentPage = page;
  
  // Update pages
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(`${page}Page`).classList.add('active');
  
  // Update nav links
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });

  // Close mobile menu
  navMenu.classList.remove('active');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Featured Paintings
function renderFeaturedPaintings() {
  const featuredGrid = document.getElementById('featuredGrid');
  const featured = paintings.slice(0, 4);
  
  featuredGrid.innerHTML = featured.map(painting => createPaintingCard(painting)).join('');
}

// Render Gallery
function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  const noResults = document.getElementById('noResults');
  
  let filtered = paintings.filter(painting => {
    // Category filter
    if (currentFilters.category !== 'all' && painting.category !== currentFilters.category) {
      return false;
    }
    
    // Price filter
    if (currentFilters.price !== 'all') {
      if (currentFilters.price === 'under_1500' && painting.price > 1500) return false;
      if (currentFilters.price === '1500_2000' && (painting.price < 1500 || painting.price > 2000)) return false;
      if (currentFilters.price === 'over_2000' && painting.price <= 2000) return false;
    }
    
    // Search filter
    if (currentFilters.search && !painting.title.toLowerCase().includes(currentFilters.search)) {
      return false;
    }
    
    return true;
  });
  
  if (filtered.length === 0) {
    galleryGrid.innerHTML = '';
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
    galleryGrid.innerHTML = filtered.map(painting => createPaintingCard(painting)).join('');
  }
}

// Create Painting Card
function createPaintingCard(painting) {
  return `
    <div class="painting-card" data-id="${painting.id}">
      <img src="${painting.image}" alt="${painting.title}" class="painting-card-image">
      <div class="painting-card-content">
        <h3 class="painting-card-title">${painting.title}</h3>
        <p class="painting-card-artist">${painting.artist}</p>
        <p class="painting-card-price">R$ ${painting.price.toFixed(2).replace('.', ',')}</p>
        <button class="btn btn-primary painting-card-btn" onclick="viewPaintingDetail(${painting.id})">
          Ver Detalhes
        </button>
      </div>
    </div>
  `;
}

// View Painting Detail
function viewPaintingDetail(id) {
  const painting = paintings.find(p => p.id === id);
  if (!painting) return;
  
  const detailContent = document.getElementById('detailContent');
  detailContent.innerHTML = `
    <div class="detail-image" onclick="openLightbox('${painting.image}')">
      <img src="${painting.image}" alt="${painting.title}">
    </div>
    <div class="detail-info">
      <h1>${painting.title}</h1>
      <p class="detail-artist">${painting.artist}</p>
      <p class="detail-price">R$ ${painting.price.toFixed(2).replace('.', ',')}</p>
      <div class="detail-specs">
        <p><strong>Dimensões:</strong> ${painting.dimensions}</p>
        <p><strong>Técnica:</strong> ${painting.technique}</p>
      </div>
      <p class="detail-description">${painting.description}</p>
      <div class="detail-actions">
        <button class="btn btn-primary" onclick="addToCart(${painting.id})">
          <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
        </button>
        <button class="btn btn-outline" onclick="shareWhatsApp(${painting.id})">
          <i class="fab fa-whatsapp"></i> Compartilhar
        </button>
      </div>
      <div class="share-buttons">
        <button class="share-btn" onclick="shareOnFacebook(${painting.id})">
          <i class="fab fa-facebook"></i> Facebook
        </button>
        <button class="share-btn" onclick="shareOnTwitter(${painting.id})">
          <i class="fab fa-twitter"></i> Twitter
        </button>
      </div>
    </div>
  `;
  
  // Render related paintings
  renderRelatedPaintings(painting.category, painting.id);
  
  navigateTo('detail');
}

// Render Related Paintings
function renderRelatedPaintings(category, currentId) {
  const relatedGrid = document.getElementById('relatedGrid');
  const related = paintings
    .filter(p => p.category === category && p.id !== currentId)
    .slice(0, 3);
  
  relatedGrid.innerHTML = related.map(painting => createPaintingCard(painting)).join('');
}

// Cart Functions
function addToCart(id) {
  const painting = paintings.find(p => p.id === id);
  if (!painting) return;
  
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    showNotification('Este item já está no carrinho!', 'error');
    return;
  }
  
  cart.push({ ...painting });
  updateCartUI();
  showNotification('Item adicionado ao carrinho!');
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
  renderCart();
  showNotification('Item removido do carrinho!');
}

function updateCartUI() {
  cartCount.textContent = cart.length;
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>Seu carrinho está vazio</p>
      </div>
    `;
    cartTotal.textContent = 'R$ 0,00';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" class="cart-item-image">
      <div class="cart-item-info">
        <h3 class="cart-item-title">${item.title}</h3>
        <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
        <div class="cart-item-actions">
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
            <i class="fas fa-trash"></i> Remover
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Checkout via WhatsApp
function handleCheckout() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const items = cart.map(item => `${item.title} - R$ ${item.price.toFixed(2).replace('.', ',')}`).join('%0A');
  
  const message = `Olá! Gostaria de comprar:%0A%0A${items}%0A%0ATotal: R$ ${total.toFixed(2).replace('.', ',')}%0A%0AAguardo retorno. Obrigado!`;
  
  window.open(`https://wa.me/5527999999999?text=${message}`, '_blank');
}

// Share Functions
function shareWhatsApp(id) {
  const painting = paintings.find(p => p.id === id);
  const message = `Confira esta obra: ${painting.title} - R$ ${painting.price.toFixed(2).replace('.', ',')}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

function shareOnFacebook(id) {
  const url = window.location.href;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnTwitter(id) {
  const painting = paintings.find(p => p.id === id);
  const text = `Confira esta obra: ${painting.title}`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

// Lightbox
function openLightbox(imageSrc) {
  lightboxImage.src = imageSrc;
  lightbox.classList.add('active');
}

// Notification
function showNotification(message, type = 'success') {
  notification.textContent = message;
  notification.classList.remove('error');
  if (type === 'error') {
    notification.classList.add('error');
  }
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Back Button
const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', () => {
  navigateTo('gallery');
});

// Fade-in on Scroll
function handleScrollAnimation() {
  const elements = document.querySelectorAll('.painting-card, .about-preview, .featured-section');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementTop < windowHeight - 100) {
      element.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', handleScrollAnimation);

// Initialize
init();