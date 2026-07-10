let db=loadStore(), cart=loadCart(), lang=localStorage.getItem("ibraq_lang")||"ar";
let activeCategory="all", selectedProduct=null, gallery={images:[],index:0};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const T={
 ar:{offers:"عروض مميزة",products:"المنتجات",about:"من نحن",cart:"سلة المشتريات",clearCart:"تفريغ السلة",whatsapp:"فتح واتساب",waNote:"عند الضغط يُفتح واتساب مع وصل الطلب جاهزاً للإرسال.",quantity:"العدد",addToCart:"إضافة إلى السلة",search:"ابحث عن منتج",empty:"لا توجد منتجات حالياً",added:"تمت الإضافة إلى السلة",total:"المجموع",items:"عدد القطع",out:"غير متوفر"},
 en:{offers:"Featured Offers",products:"Products",about:"About Us",cart:"Shopping Cart",clearCart:"Clear Cart",whatsapp:"Open WhatsApp",waNote:"WhatsApp opens with the order receipt ready to send.",quantity:"Quantity",addToCart:"Add to Cart",search:"Search products",empty:"No products available",added:"Added to cart",total:"Total",items:"Items",out:"Out of stock"}
};
function tx(k){return T[lang][k]||k}
function loc(obj,key){return obj[key+(lang==="ar"?"Ar":"En")]||obj[key+"Ar"]||""}
function currency(){return lang==="ar"?db.settings.currencyAr:db.settings.currencyEn}
function applySettings(){
 const st=db.settings;
 document.documentElement.style.setProperty("--primary",st.primary);
 document.documentElement.style.setProperty("--accent",st.accent);
 document.documentElement.style.setProperty("--bg",st.bg);
 document.documentElement.style.setProperty("--site-width",`${st.pageWidth||1120}px`);
 document.documentElement.style.setProperty("--card-radius",`${st.cardRadius||22}px`);
 document.documentElement.style.setProperty("--desktop-columns",st.productColumnsDesktop||4);
 document.documentElement.style.setProperty("--mobile-columns",st.productColumnsMobile||2);
 document.documentElement.style.setProperty("--hero-name-size",`${st.heroNameSize||34}px`);
 document.documentElement.style.setProperty("--tagline-size",`${st.taglineSize||16}px`);
 document.documentElement.style.setProperty("--section-title-size",`${st.sectionTitleSize||22}px`);
 document.documentElement.style.setProperty("--product-name-size",`${st.productNameSize||16}px`);
 document.documentElement.style.setProperty("--ad-height",`${st.adHeight||230}px`);
 document.documentElement.style.setProperty("--section-gap",`${st.sectionGap||32}px`);
 document.body.style.fontFamily=`${st.fontFamily||"Tahoma"},Arial,sans-serif`;
 document.body.style.backgroundImage=st.backgroundImage?`linear-gradient(rgba(247,243,238,.88),rgba(247,243,238,.88)),url("${st.backgroundImage}")`:"";
 document.body.style.backgroundSize=st.backgroundFit||"cover";
 document.body.style.backgroundAttachment=st.backgroundImage?"fixed":"";
 document.documentElement.dir=lang==="ar"?"rtl":"ltr";
 document.documentElement.lang=lang;
 $("#brandName").textContent=lang==="ar"?st.nameAr:st.nameEn;
 $("#brandTagline").textContent=lang==="ar"?st.taglineAr:st.taglineEn;
 $("#brandLogo").textContent=st.logoText||"إ";
 $("#aboutText").textContent=lang==="ar"?st.aboutAr:st.aboutEn;
 $("#offersTitle").textContent=lang==="ar"?(st.offersTitleAr||tx("offers")):(st.offersTitleEn||tx("offers"));
 $("#productsTitle").textContent=lang==="ar"?(st.productsTitleAr||tx("products")):(st.productsTitleEn||tx("products"));
 $("#aboutTitle").textContent=lang==="ar"?(st.aboutTitleAr||tx("about")):(st.aboutTitleEn||tx("about"));
 $("#languageRow").classList.toggle("hidden",st.showLanguages===false);
 $("#heroSection").classList.toggle("hidden",st.showHeader===false);
 $("#whatsappTop").classList.toggle("hidden",st.showWhatsAppTop===false);
 $("#searchInput").classList.toggle("hidden",st.showSearch===false);
 $("#categoryFilters").classList.toggle("hidden",st.showCategories===false);
 $("#cartFab").classList.toggle("hidden",st.showCart===false);
 $("#aboutSection").classList.toggle("hidden",!st.showAbout);
 $("#adsSection").classList.toggle("hidden",!st.showAds);
 const wa=`https://wa.me/${String(st.whatsapp).replace(/\D/g,"")}`;
 $("#whatsappTop").href=wa;$("#whatsappOrder").href=wa;
 $("#whatsappTop").textContent=lang==="ar"?(st.whatsappLabelAr||"واتساب"):(st.whatsappLabelEn||"WhatsApp");
 $$('[data-i18n]').forEach(el=>{if(!["offers","products","about"].includes(el.dataset.i18n))el.textContent=tx(el.dataset.i18n)});
 $("#searchInput").placeholder=lang==="ar"?(st.searchPlaceholderAr||tx("search")):(st.searchPlaceholderEn||tx("search"));
 $("#emptyState").textContent=tx("empty");
 $$(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
 const sectionMap={ads:$("#adsSection"),products:$("#productsSection"),about:$("#aboutSection")};
 (st.sectionOrder||["ads","products","about"]).forEach(k=>{if(sectionMap[k])document.querySelector("main").appendChild(sectionMap[k])});
}
function renderCategories(){
 const cats=db.categories.filter(c=>c.visible).sort((a,b)=>a.sort-b.sort);
 $("#categoryFilters").innerHTML=cats.map(c=>`<button class="chip ${c.id===activeCategory?"active":""}" data-cat="${c.id}">${loc(c,"name")}</button>`).join("");
 $$(".chip").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderCategories();renderProducts()});
}

function stabilizeImages(root=document){
  root.querySelectorAll("img").forEach(img=>{
    const done=()=>img.classList.remove("image-loading");
    if(img.complete && img.naturalWidth>0) done();
    else img.addEventListener("load",done,{once:true});
    img.addEventListener("error",()=>{
      img.classList.remove("image-loading");
      img.classList.add("image-error");
      if(!img.dataset.fallback){
        img.dataset.fallback="1";
        img.src=svgImg("IBRAQ","#f4ede5","#c9a36a");
      }
    },{once:true});
  });
}

function renderProducts(){
 const q=$("#searchInput").value.trim().toLowerCase();
 const list=db.products.filter(p=>p.visible&&(activeCategory==="all"||p.category===activeCategory)&&(!q||loc(p,"name").toLowerCase().includes(q)||loc(p,"desc").toLowerCase().includes(q))).sort((a,b)=>a.sort-b.sort);
 $("#emptyState").classList.toggle("hidden",list.length>0);
 $("#productsGrid").innerHTML=list.map((p,i)=>`<article class="product-card">
   <div class="product-image-wrap">
    <img class="product-image image-loading" data-open="${p.id}" id="main-${p.id}" src="${p.images?.[0]||""}" alt="${loc(p,"name")}" loading="${i<4?"eager":"lazy"}" decoding="async">
    ${loc(p,"badge")?`<span class="badge">${loc(p,"badge")}</span>`:""}
    ${p.images?.length>1?`<div class="thumbs">${p.images.slice(0,4).map((im,x)=>`<img class="thumb ${x===0?"active":""}" data-product="${p.id}" data-index="${x}" src="${im}" loading="lazy" decoding="async">`).join("")}</div>`:""}
   </div>
   <div class="product-info"><h3>${loc(p,"name")}</h3><p>${loc(p,"desc")}</p>
    <div class="price-row"><span class="price">${Number(p.price).toLocaleString()} ${currency()}</span>
    <button class="add-btn" data-add="${p.id}">${tx("addToCart")}</button></div>
   </div></article>`).join("");
 stabilizeImages($("#productsGrid"));
 $$("[data-add]").forEach(b=>b.onclick=()=>openQty(b.dataset.add));
 $$("[data-open]").forEach(im=>im.onclick=()=>openGallery(im.dataset.open,0));
 $$(".thumb").forEach(t=>t.onclick=e=>{e.stopPropagation();const p=db.products.find(x=>x.id===t.dataset.product);$("#main-"+p.id).src=p.images[+t.dataset.index];t.parentElement.querySelectorAll(".thumb").forEach(x=>x.classList.remove("active"));t.classList.add("active")});
}
let sliderTimer;
function renderAds(){
 const ads=db.ads.filter(a=>a.visible).sort((a,b)=>a.sort-b.sort);
 $("#adsSlider").innerHTML=ads.map(a=>`<div class="ad-card" data-ad="${a.id}"><img src="${a.image}" loading="eager" decoding="async"><div class="ad-overlay"><h3>${loc(a,"title")}</h3><p>${loc(a,"subtitle")}</p></div></div>`).join("");
 $("#sliderDots").innerHTML=ads.map((_,i)=>`<span class="dot ${i===0?"active":""}"></span>`).join("");
 stabilizeImages($("#adsSlider"));
 $$("[data-ad]").forEach(a=>a.onclick=()=>{const ad=db.ads.find(x=>x.id===a.dataset.ad);if(ad?.productId)openQty(ad.productId)});
 clearInterval(sliderTimer);let i=0;
 if(ads.length>1)sliderTimer=setInterval(()=>{i=(i+1)%ads.length;$("#adsSlider").scrollTo({left:$("#adsSlider").clientWidth*i,behavior:"smooth"});$$(".dot").forEach((d,x)=>d.classList.toggle("active",x===i))},4200);
}
function openQty(id){
 selectedProduct=db.products.find(p=>p.id===id);if(!selectedProduct)return;
 $("#qtyImage").src=selectedProduct.images?.[0]||"";
 $("#qtyTitle").textContent=loc(selectedProduct,"name");
 const input=$("#qtyInput"); input.value=1; input.removeAttribute("max");
 document.body.classList.add("qty-open");
 $("#qtyModal").classList.remove("hidden");
 setTimeout(()=>{try{input.focus({preventScroll:true});input.select()}catch(e){}},120);
}
let addBusy=false;
function closeAllOverlays(){
  const input=$("#qtyInput");
  try{input.blur()}catch(e){}
  $("#qtyModal").classList.add("hidden");
  $("#galleryModal").classList.add("hidden");
  document.body.classList.remove("qty-open");
  document.body.classList.add("overlay-reset");
  requestAnimationFrame(()=>document.body.classList.remove("overlay-reset"));
}
function addSelected(){
  if(addBusy||!selectedProduct)return;
  addBusy=true;
  const q=Math.max(1,Math.floor(+( $("#qtyInput").value )||1));
  const found=cart.find(x=>x.id===selectedProduct.id);
  if(found) found.qty+=q;
  else cart.push({id:selectedProduct.id,qty:q});
  saveCart(cart);
  closeAllOverlays();
  renderCart();
  toast(tx("added"));
  setTimeout(()=>{addBusy=false},120);
}
function renderCart(){
 cart=cart.filter(c=>db.products.some(p=>p.id===c.id));saveCart(cart);
 $("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
 $("#cartItems").innerHTML=cart.map(c=>{let p=db.products.find(x=>x.id===c.id);return `<div class="cart-item"><img src="${p.images[0]}"><div><h4>${loc(p,"name")}</h4><small>${Number(p.price).toLocaleString()} ${currency()}</small></div><div class="cart-controls"><button data-minus="${p.id}">−</button><b>${c.qty}</b><button data-plus="${p.id}">+</button><button class="remove" data-remove="${p.id}">×</button></div></div>`}).join("")||`<div class="empty">${tx("empty")}</div>`;
 const count=cart.reduce((s,x)=>s+x.qty,0), total=cart.reduce((s,c)=>{let p=db.products.find(x=>x.id===c.id);return s+(p?.price||0)*c.qty},0);
 $("#receipt").innerHTML=`<div class="receipt-row"><span>${tx("items")}</span><b>${count}</b></div><div class="receipt-row total"><span>${tx("total")}</span><b>${total.toLocaleString()} ${currency()}</b></div>`;
 const receiptLines=cart.map((c,i)=>{const p=db.products.find(x=>x.id===c.id);const lineTotal=(p?.price||0)*c.qty;return `${i+1}. ${loc(p,"name")}\n${lang==="ar"?"العدد":"Qty"}: ${c.qty} × ${Number(p?.price||0).toLocaleString()} ${currency()} = ${lineTotal.toLocaleString()} ${currency()}`;});
 const receiptText=lang==="ar"
   ? `وصل طلب من متجر ${db.settings.nameAr||"إبراق"}\n\n${receiptLines.join("\n\n")}\n\nعدد القطع: ${count}\nالمجموع: ${total.toLocaleString()} ${currency()}`
   : `Order receipt from ${db.settings.nameEn||"IBRAQ"}\n\n${receiptLines.join("\n\n")}\n\nItems: ${count}\nTotal: ${total.toLocaleString()} ${currency()}`;
 const phone=String(db.settings.whatsapp||"").replace(/\D/g,"");
 $("#whatsappOrder").href=`https://wa.me/${phone}?text=${encodeURIComponent(receiptText)}`;
 stabilizeImages($("#cartItems"));
 $$("[data-minus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));$$("[data-plus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));$$("[data-remove]").forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.id!==b.dataset.remove);saveCart(cart);renderCart()});
}
function changeQty(id,d){let c=cart.find(x=>x.id===id);if(!c)return;c.qty=Math.max(1,c.qty+d);saveCart(cart);renderCart()}
function openGallery(id,index){let p=db.products.find(x=>x.id===id);gallery={images:p.images||[],index};showGallery();$("#galleryModal").classList.remove("hidden")}
function showGallery(){if(!gallery.images.length)return;$("#galleryImage").src=gallery.images[gallery.index];$("#galleryCounter").textContent=`${gallery.index+1} / ${gallery.images.length}`}
function toast(msg){$("#toast").textContent=msg;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1800)}
$(".language-row").onclick=e=>{if(e.target.dataset.lang){lang=e.target.dataset.lang;localStorage.setItem("ibraq_lang",lang);applySettings();renderCategories();renderProducts();renderAds();renderCart()}};
$("#searchInput").oninput=renderProducts;$("#cartFab").onclick=()=>$("#cartDrawer").classList.add("open");$("#closeCart").onclick=()=>$("#cartDrawer").classList.remove("open");$("#cartDrawer").onclick=e=>{if(e.target.id==="cartDrawer")e.currentTarget.classList.remove("open")};
$("#clearCart").onclick=()=>{cart=[];saveCart(cart);renderCart()};$("#qtyMinus").onclick=()=>$("#qtyInput").value=Math.max(1,+$("#qtyInput").value-1);$("#qtyPlus").onclick=()=>$("#qtyInput").value=Math.max(1,+$("#qtyInput").value+1);$("#confirmAdd").onpointerdown=e=>{
 e.preventDefault();
 const btn=e.currentTarget;
 if(addBusy||!selectedProduct)return;
 btn.disabled=true;
 const q=Math.max(1,Math.floor(+( $("#qtyInput").value )||1));
 const productId=selectedProduct.id;
 closeAllOverlays();
 requestAnimationFrame(()=>{
   const found=cart.find(x=>x.id===productId);
   if(found)found.qty+=q;else cart.push({id:productId,qty:q});
   saveCart(cart);renderCart();toast(tx("added"));
   btn.disabled=false;addBusy=false;
 });
};
$("#confirmAdd").onclick=e=>e.preventDefault();
$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.add("hidden"));$("#galleryPrev").onclick=()=>{gallery.index=(gallery.index-1+gallery.images.length)%gallery.images.length;showGallery()};$("#galleryNext").onclick=()=>{gallery.index=(gallery.index+1)%gallery.images.length;showGallery()};
$("#qtyModal").addEventListener("pointerdown",e=>{if(e.target.id==="qtyModal")closeAllOverlays()});
window.addEventListener("pageshow",()=>{if($("#qtyModal").classList.contains("hidden"))document.body.classList.remove("qty-open")});
window.addEventListener("storage",()=>{db=loadStore();applySettings();renderCategories();renderProducts();renderAds();renderCart()});
closeAllOverlays();$("#cartDrawer").classList.remove("open");applySettings();renderCategories();renderProducts();renderAds();renderCart();

// Hide branded opening screen after the store is ready.
window.addEventListener("load",()=>{
  const splash=document.getElementById("splashScreen");
  if(!splash)return;
  setTimeout(()=>splash.classList.add("hide"),1400);
  setTimeout(()=>splash.remove(),2200);
});
