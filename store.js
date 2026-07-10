const STORE_KEY = "ibraq_store_v2";
const CART_KEY = "ibraq_cart_v2";

const svgImg = (text, c1, c2) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="720" cy="110" r="160" fill="white" opacity=".12"/><circle cx="150" cy="610" r="230" fill="white" opacity=".08"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial" font-size="76" font-weight="700">${text}</text></svg>`)}`;

const defaultStore = {
  settings:{
    nameAr:"إبراق", nameEn:"IBRAQ",
    taglineAr:"منتجات مختارة بعناية", taglineEn:"Carefully selected products",
    aboutAr:"متجر إبراق يوفر مجموعة مختارة من المنتجات مع طلب سريع وسهل عبر واتساب.",
    aboutEn:"IBRAQ offers a curated collection of products with fast and easy WhatsApp contact.",
    whatsapp:"9647515298061", currencyAr:"د.ع", currencyEn:"IQD",
    primary:"#6b3f23", accent:"#d6a06a", bg:"#f7f3ee",
    logoText:"إ", showAds:true, showAbout:true,
    showLanguages:true, showHeader:true, showWhatsAppTop:true, showSearch:true, showCategories:true, showCart:true,
    offersTitleAr:"عروض مميزة", offersTitleEn:"Featured Offers",
    productsTitleAr:"المنتجات", productsTitleEn:"Products", aboutTitleAr:"من نحن", aboutTitleEn:"About Us",
    searchPlaceholderAr:"ابحث عن منتج", searchPlaceholderEn:"Search products",
    whatsappLabelAr:"واتساب", whatsappLabelEn:"WhatsApp",
    fontFamily:"Tahoma", pageWidth:1120, cardRadius:22, productColumnsDesktop:4, productColumnsMobile:2,
    heroNameSize:34, taglineSize:16, sectionTitleSize:22, productNameSize:16,
    adHeight:230, sectionGap:32, backgroundImage:"", backgroundFit:"cover",
    sectionOrder:["ads","products","about"]
  },
  categories:[
    {id:"all",nameAr:"الكل",nameEn:"All",visible:true,sort:0},
    {id:"perfume",nameAr:"عطور",nameEn:"Perfumes",visible:true,sort:1},
    {id:"care",nameAr:"عناية",nameEn:"Care",visible:true,sort:2},
    {id:"gifts",nameAr:"هدايا",nameEn:"Gifts",visible:true,sort:3}
  ],
  products:[
    {id:"p1",nameAr:"عطر إبراق الذهبي",nameEn:"IBRAQ Gold Perfume",descAr:"رائحة فاخرة وثبات طويل.",descEn:"Luxurious scent with long-lasting performance.",category:"perfume",price:45000,stock:20,badgeAr:"الأكثر طلباً",badgeEn:"Best seller",visible:true,featured:true,sort:1,images:[svgImg("IBRAQ GOLD","#4b126d","#d79b24"),svgImg("GOLD 2","#8b5a12","#2c123d"),svgImg("GOLD 3","#16101e","#7c3aed")]},
    {id:"p2",nameAr:"عطر ليلي",nameEn:"Night Perfume",descAr:"نفحات هادئة مناسبة للمساء.",descEn:"Smooth notes made for evenings.",category:"perfume",price:38000,stock:14,badgeAr:"جديد",badgeEn:"New",visible:true,featured:false,sort:2,images:[svgImg("NIGHT","#071a38","#6d28d9"),svgImg("NIGHT 2","#100b22","#0ea5e9")]},
    {id:"p3",nameAr:"مجموعة العناية",nameEn:"Care Set",descAr:"مجموعة يومية أنيقة ومتكاملة.",descEn:"An elegant complete daily care set.",category:"care",price:29000,stock:8,badgeAr:"عرض",badgeEn:"Offer",visible:true,featured:false,sort:3,images:[svgImg("CARE SET","#064e3b","#14b8a6"),svgImg("CARE 2","#022c22","#22c55e")]},
    {id:"p4",nameAr:"صندوق هدية",nameEn:"Gift Box",descAr:"تغليف أنيق مناسب للمناسبات.",descEn:"Elegant packaging for special occasions.",category:"gifts",price:25000,stock:12,badgeAr:"",badgeEn:"",visible:true,featured:false,sort:4,images:[svgImg("GIFT BOX","#7f1d1d","#f59e0b"),svgImg("GIFT 2","#4c0519","#fb7185")]}
  ],
  ads:[
    {id:"a1",titleAr:"عرض العطر الذهبي",titleEn:"Gold Perfume Offer",subtitleAr:"اضغط لإضافته إلى السلة",subtitleEn:"Tap to add it to cart",image:svgImg("GOLD OFFER","#3b0764","#f59e0b"),productId:"p1",visible:true,sort:1},
    {id:"a2",titleAr:"وصل حديثاً",titleEn:"Just Arrived",subtitleAr:"عطر ليلي بإصدار جديد",subtitleEn:"A new edition of Night Perfume",image:svgImg("NEW ARRIVAL","#0f172a","#7c3aed"),productId:"p2",visible:true,sort:2},
    {id:"a3",titleAr:"هدية مميزة",titleEn:"Special Gift",subtitleAr:"اختر صندوقك الآن",subtitleEn:"Choose your box now",image:svgImg("SPECIAL GIFT","#7c2d12","#ef4444"),productId:"p4",visible:true,sort:3}
  ],
  admin:{username:"admin",password:"admin123"}
};

function loadStore(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORE_KEY));
    if(saved && saved.settings && saved.products) {
      if (saved.settings.primary === "#7c3aed" && saved.settings.bg === "#0d0718") {
        saved.settings.primary = "#6b3f23";
        saved.settings.accent = "#d6a06a";
        saved.settings.bg = "#f7f3ee";
      }
      saved.settings = Object.assign({}, defaultStore.settings, saved.settings || {});
      if (!Array.isArray(saved.settings.sectionOrder)) saved.settings.sectionOrder=["ads","products","about"];
      localStorage.setItem(STORE_KEY, JSON.stringify(saved));
      return saved;
    }
  }catch(e){}
  localStorage.setItem(STORE_KEY,JSON.stringify(defaultStore));
  return JSON.parse(JSON.stringify(defaultStore));
}
function saveStore(data){ localStorage.setItem(STORE_KEY,JSON.stringify(data)); }
function loadCart(){ try{return JSON.parse(localStorage.getItem(CART_KEY))||[]}catch(e){return[]} }
function saveCart(data){localStorage.setItem(CART_KEY,JSON.stringify(data))}
