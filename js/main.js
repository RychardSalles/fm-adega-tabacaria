document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------- verificação de idade (18+) ---------------- */

const AGE_GATE_KEY = "fmAgeConfirmed";
const ageGate = document.getElementById("ageGate");

if (ageGate) {
  if (sessionStorage.getItem(AGE_GATE_KEY) === "1") {
    ageGate.hidden = true;
  } else {
    document.body.style.overflow = "hidden";
  }

  document.getElementById("ageConfirmYes")?.addEventListener("click", () => {
    try { sessionStorage.setItem(AGE_GATE_KEY, "1"); } catch (e) {}
    ageGate.hidden = true;
    document.body.style.overflow = "";
  });

  document.getElementById("ageConfirmNo")?.addEventListener("click", () => {
    window.location.href = "https://www.google.com";
  });
}

const whatsBase = `https://wa.me/${STORE_CONFIG.whatsappNumber}`;
document.getElementById("whatsLink").href = `${whatsBase}?text=${encodeURIComponent("Olá! Vim pelo site da FM Adega e Tabacaria.")}`;
document.getElementById("whatsCta").href = document.getElementById("whatsLink").href;
document.getElementById("floatWhats").href = document.getElementById("whatsLink").href;
document.getElementById("instaLink").href = STORE_CONFIG.instagramUrl;
document.getElementById("instaCta").href = STORE_CONFIG.instagramUrl;

document.getElementById("navToggle").addEventListener("click", () => {
  document.getElementById("siteHeader").classList.toggle("open");
});

document.querySelectorAll(".nav-links > li > a").forEach((link) => {
  link.addEventListener("click", () => document.getElementById("siteHeader").classList.remove("open"));
});

function productMedia(product) {
  if (product.image) {
    return `<img src="${product.image}" alt="${product.name}" />`;
  }
  return `<div class="product-placeholder">${categoryIllustration()}</div>`;
}

function buildWhatsAppLink(product) {
  const message = `Olá! Tenho interesse no item *${product.name}* (${formatPrice(product.price)}) da FM Adega e Tabacaria.`;
  return `${whatsBase}?text=${encodeURIComponent(message)}`;
}

function priceRowHtml(product) {
  const hasDiscount = product.originalPrice > product.price;
  if (!hasDiscount) {
    return `<div class="price-row"><span class="price-current">${formatPrice(product.price)}</span></div>`;
  }
  const percent = Math.round((1 - product.price / product.originalPrice) * 100);
  return `
    <div class="price-row">
      <span class="price-original">${formatPrice(product.originalPrice)}</span>
      <span class="price-current">${formatPrice(product.price)}</span>
      <span class="discount-badge">-${percent}%</span>
    </div>`;
}

function productCardHtml(product) {
  return `
    <div class="product-card">
      <div class="product-media">
        ${productMedia(product)}
        ${!product.available ? `<span class="badge-sold">Esgotado</span>` : ""}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        ${priceRowHtml(product)}
        <button type="button" class="product-buy ${!product.available ? "is-disabled" : ""}" ${product.available ? `data-add-to-cart="${product.id}"` : `disabled tabindex="-1"`}>
          ${product.available ? "Adicionar à sacola" : "Indisponível"}
        </button>
      </div>
    </div>`;
}

let activeCategory = "Todos";
let currentProducts = [];

/* ---------------- categorias / dropdown ---------------- */

function renderCategories(products) {
  const categories = [...new Set(products.map((p) => p.category))];
  const gridEl = document.getElementById("categoriesGrid");

  gridEl.innerHTML = categories
    .map((cat) => {
      const count = products.filter((p) => p.category === cat).length;
      const media = categoryIllustration();
      return `
        <button class="category-card" data-category="${cat}">
          <div class="category-media">${media}</div>
          <div class="category-name">${cat}</div>
          <div class="category-count">${count} ite${count === 1 ? "m" : "ns"}</div>
        </button>`;
    })
    .join("");

  gridEl.querySelectorAll(".category-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderFilters(products, activeCategory);
      renderGrid(products, activeCategory);
      document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
    });
  });

  renderCollectionDropdown(products, categories);
}

function renderCollectionDropdown(products, categories) {
  const dropdown = document.getElementById("collectionDropdown");
  const items = ["Todos", ...categories]
    .map((cat) => {
      const count = cat === "Todos" ? products.length : products.filter((p) => p.category === cat).length;
      return `<a href="#produtos" data-category="${cat}">${cat} <span>${count}</span></a>`;
    })
    .join("");
  dropdown.innerHTML = items;

  dropdown.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      activeCategory = link.dataset.category;
      renderFilters(products, activeCategory);
      renderGrid(products, activeCategory);
      document.getElementById("siteHeader").classList.remove("open");
    });
  });
}

function renderFilters(products, active) {
  const categories = ["Todos", ...new Set(products.map((p) => p.category))];
  const filtersEl = document.getElementById("filters");
  filtersEl.innerHTML = categories
    .map(
      (cat) =>
        `<button class="filter-btn ${cat === active ? "active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");

  filtersEl.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderFilters(products, activeCategory);
      renderGrid(products, activeCategory);
    });
  });
}

function renderGrid(products, active) {
  const visible = active === "Todos" ? products : products.filter((p) => p.category === active);
  const gridEl = document.getElementById("productGrid");

  if (visible.length === 0) {
    gridEl.innerHTML = `<div class="empty-state">Nenhum item encontrado nessa categoria.</div>`;
    return;
  }

  gridEl.innerHTML = visible.map((product) => productCardHtml(product)).join("");
  bindAddToCartButtons(gridEl);
}

/* ---------------- carrossel de destaques ---------------- */

function renderCarousel(products) {
  const onSale = products.filter((p) => p.available && p.originalPrice > p.price);
  const featured = (onSale.length > 0 ? onSale : products.filter((p) => p.available)).slice(0, 8);

  const section = document.getElementById("destaques");
  const track = document.getElementById("carouselTrack");
  const dotsEl = document.getElementById("carouselDots");

  if (featured.length === 0) {
    section.style.display = "none";
    return;
  }
  section.style.display = "";

  track.innerHTML = featured
    .map(
      (product) => `
      <div class="carousel-slide">
        <div class="product-media">
          ${productMedia(product)}
        </div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-name">${product.name}</h3>
          ${priceRowHtml(product)}
          <button type="button" class="product-buy" data-add-to-cart="${product.id}">Adicionar à sacola</button>
        </div>
      </div>`
    )
    .join("");
  bindAddToCartButtons(track);

  dotsEl.innerHTML = featured.map((_, i) => `<button type="button" class="carousel-dot ${i === 0 ? "active" : ""}" data-index="${i}"></button>`).join("");

  // Usar a posição real (offsetLeft) de cada slide em vez de "índice × largura estimada":
  // com scroll-snap-type mandatory, mirar num valor aproximado que não é exatamente
  // o ponto de snap de um slide faz o navegador "puxar de volta" o scroll, e por isso
  // o botão "próximo" nunca conseguia chegar no último produto.
  let carouselIndex = 0;

  function goTo(index) {
    carouselIndex = Math.max(0, Math.min(index, featured.length - 1));
    const targetSlide = track.children[carouselIndex];
    track.scrollTo({ left: targetSlide ? targetSlide.offsetLeft : 0, behavior: "smooth" });
    dotsEl.querySelectorAll(".carousel-dot").forEach((dot, i) => dot.classList.toggle("active", i === carouselIndex));
  }

  dotsEl.querySelectorAll(".carousel-dot").forEach((dot) => {
    dot.addEventListener("click", () => goTo(Number(dot.dataset.index)));
  });

  document.getElementById("carouselPrev").onclick = () => goTo(carouselIndex - 1);
  document.getElementById("carouselNext").onclick = () => goTo(carouselIndex + 1);

  track.onscroll = () => {
    let nearest = 0;
    let nearestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const dist = Math.abs(el.offsetLeft - track.scrollLeft);
      if (dist < nearestDist) { nearestDist = dist; nearest = i; }
    });
    carouselIndex = nearest;
    dotsEl.querySelectorAll(".carousel-dot").forEach((dot, i) => dot.classList.toggle("active", i === nearest));
  };

  clearInterval(window._carouselAuto);
  if (featured.length > 1) {
    window._carouselAuto = setInterval(() => {
      goTo(carouselIndex >= featured.length - 1 ? 0 : carouselIndex + 1);
    }, 5000);
  }
}

/* ---------------- carrinho ---------------- */

const CART_STORAGE_KEY = "fmAdegaCart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Não foi possível salvar a sacola:", e);
  }
}

function cartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
}

function setCartQty(id, qty) {
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function bindAddToCartButtons(scope) {
  scope.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.addToCart);
      pulseCartIcon();
    });
  });
}

function pulseCartIcon() {
  const btn = document.getElementById("cartToggle");
  btn.classList.remove("bump");
  void btn.offsetWidth;
  btn.classList.add("bump");
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

function renderCart() {
  const badge = document.getElementById("cartBadge");
  const count = cartCount();
  badge.textContent = count;
  badge.hidden = count === 0;

  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");
  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ product: currentProducts.find((p) => p.id === id), qty }))
    .filter((entry) => entry.product);

  if (entries.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">Sua sacola está vazia.<br />Adicione itens do catálogo.</div>`;
    footerEl.style.display = "none";
    return;
  }

  footerEl.style.display = "";
  itemsEl.innerHTML = entries
    .map(({ product, qty }) => `
      <div class="cart-item">
        <div class="cart-item-thumb">${productMedia(product)}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatPrice(product.price)}</div>
          <div class="cart-qty">
            <button type="button" data-qty-down="${product.id}">&minus;</button>
            <span>${qty}</span>
            <button type="button" data-qty-up="${product.id}">+</button>
          </div>
        </div>
        <button type="button" class="cart-item-remove" data-remove="${product.id}" aria-label="Remover">&times;</button>
      </div>`)
    .join("");

  itemsEl.querySelectorAll("[data-qty-up]").forEach((btn) => {
    btn.addEventListener("click", () => setCartQty(btn.dataset.qtyUp, (cart[btn.dataset.qtyUp] || 0) + 1));
  });
  itemsEl.querySelectorAll("[data-qty-down]").forEach((btn) => {
    btn.addEventListener("click", () => setCartQty(btn.dataset.qtyDown, (cart[btn.dataset.qtyDown] || 0) - 1));
  });
  itemsEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => setCartQty(btn.dataset.remove, 0));
  });

  const total = entries.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  document.getElementById("cartTotal").textContent = formatPrice(total);

  const lines = entries.map(({ product, qty }) => `• ${qty}x ${product.name} (${formatPrice(product.price)} cada)`);
  const message = `Olá! Quero fechar este pedido da FM Adega e Tabacaria:\n\n${lines.join("\n")}\n\nTotal: ${formatPrice(total)}\n\nSou maior de 18 anos.`;
  document.getElementById("cartCheckout").href = `${whatsBase}?text=${encodeURIComponent(message)}`;
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);
document.getElementById("cartClear").addEventListener("click", () => {
  if (confirm("Esvaziar sua sacola?")) clearCart();
});

/* ---------------- init ---------------- */

function renderAll(products) {
  currentProducts = products;
  renderCategories(products);
  renderFilters(products, activeCategory);
  renderGrid(products, activeCategory);
  renderCarousel(products);
  renderCart();
}

subscribeProducts((products) => renderAll(products));
