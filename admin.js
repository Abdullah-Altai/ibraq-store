let db=loadStore(), editing={type:null,id:null};const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function toast(s){$("#toast").textContent=s;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1600)}
function login(){const ok=$("#loginUser").value===db.admin.username&&$("#loginPass").value===db.admin.password;if(ok){sessionStorage.setItem("ibraq_admin","1");showApp()}else $("#loginError").textContent="بيانات الدخول غير صحيحة"}
function showApp(){$("#loginView").classList.add("hidden");$("#adminApp").classList.remove("hidden");renderAll()}
$("#loginForm").onsubmit=e=>{e.preventDefault();login()};if(sessionStorage.getItem("ibraq_admin")==="1")showApp();
$("#logoutBtn").onclick=()=>{sessionStorage.removeItem("ibraq_admin");location.reload()};
$$(".nav").forEach(b=>b.onclick=()=>{$$(".nav,.tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.tab).classList.add("active");$("#pageTitle").textContent=b.textContent});
function renderAll(){renderStats();renderProducts();renderCategories();renderAds();fillSettings();fillSecurity();fillHomepage()}
function renderStats(){$("#statProducts").textContent=db.products.length;$("#statAds").textContent=db.ads.length;$("#statCats").textContent=db.categories.length;$("#statStock").textContent=db.products.reduce((s,p)=>s+(+p.stock||0),0)}
function renderProducts(){$("#productsAdmin").innerHTML=db.products.sort((a,b)=>a.sort-b.sort).map(p=>`<div class="admin-card"><img src="${p.images?.[0]||""}"><div><h4>${esc(p.nameAr)}</h4><p>${esc(p.nameEn)}</p><p>${Number(p.price).toLocaleString()} د.ع — المخزون: ${p.stock}</p><p>${p.visible?"ظاهر":"مخفي"} — الترتيب: ${p.sort}</p><div class="card-actions"><button class="edit" data-edit-product="${p.id}">تعديل</button><button class="toggle" data-toggle-product="${p.id}">${p.visible?"إخفاء":"إظهار"}</button><button class="delete" data-delete-product="${p.id}">حذف</button></div></div></div>`).join("");
 $$("[data-edit-product]").forEach(b=>b.onclick=()=>openProduct(b.dataset.editProduct));$$("[data-toggle-product]").forEach(b=>b.onclick=()=>{let p=db.products.find(x=>x.id===b.dataset.toggleProduct);p.visible=!p.visible;commit()});$$("[data-delete-product]").forEach(b=>b.onclick=()=>{if(confirm("حذف المنتج؟")){db.products=db.products.filter(x=>x.id!==b.dataset.deleteProduct);db.ads.forEach(a=>{if(a.productId===b.dataset.deleteProduct)a.productId=""});commit()}});
}
function renderCategories(){$("#categoriesAdmin").innerHTML=db.categories.sort((a,b)=>a.sort-b.sort).map(c=>`<div class="mini-card"><h4>${esc(c.nameAr)} / ${esc(c.nameEn)}</h4><p>المعرّف: ${c.id} — الترتيب: ${c.sort}</p><div class="card-actions"><button class="edit" data-edit-cat="${c.id}">تعديل</button>${c.id!=="all"?`<button class="delete" data-delete-cat="${c.id}">حذف</button>`:""}</div></div>`).join("");
 $$("[data-edit-cat]").forEach(b=>b.onclick=()=>openCategory(b.dataset.editCat));$$("[data-delete-cat]").forEach(b=>b.onclick=()=>{if(confirm("حذف القسم؟")){db.categories=db.categories.filter(x=>x.id!==b.dataset.deleteCat);db.products.filter(p=>p.category===b.dataset.deleteCat).forEach(p=>p.category="all");commit()}});
}
function renderAds(){$("#adsAdmin").innerHTML=db.ads.sort((a,b)=>a.sort-b.sort).map(a=>`<div class="admin-card"><img src="${a.image}"><div><h4>${esc(a.titleAr)}</h4><p>${esc(a.titleEn)}</p><p>${a.visible?"ظاهر":"مخفي"} — الترتيب: ${a.sort}</p><div class="card-actions"><button class="edit" data-edit-ad="${a.id}">تعديل</button><button class="toggle" data-toggle-ad="${a.id}">${a.visible?"إخفاء":"إظهار"}</button><button class="delete" data-delete-ad="${a.id}">حذف</button></div></div></div>`).join("");
 $$("[data-edit-ad]").forEach(b=>b.onclick=()=>openAd(b.dataset.editAd));$$("[data-toggle-ad]").forEach(b=>b.onclick=()=>{let a=db.ads.find(x=>x.id===b.dataset.toggleAd);a.visible=!a.visible;commit()});$$("[data-delete-ad]").forEach(b=>b.onclick=()=>{if(confirm("حذف الإعلان؟")){db.ads=db.ads.filter(x=>x.id!==b.dataset.deleteAd);commit()}});
}
function fillSettings(){let f=$("#settingsForm");Object.entries(db.settings).forEach(([k,v])=>{let el=f.elements[k];if(el)el.type==="checkbox"?el.checked=!!v:el.value=v})}
function fillSecurity(){let f=$("#securityForm");f.username.value=db.admin.username;f.password.value=db.admin.password}
function commit(){saveStore(db);renderAll();toast("تم الحفظ")}
$("#saveAll").onclick=()=>{const f=$("#settingsForm"),s=db.settings;["nameAr","nameEn","taglineAr","taglineEn","aboutAr","aboutEn","whatsapp","logoText","currencyAr","currencyEn","primary","accent","bg"].forEach(k=>s[k]=f.elements[k].value);s.showAds=f.showAds.checked;s.showAbout=f.showAbout.checked;db.admin.username=$("#securityForm").username.value.trim()||"admin";db.admin.password=$("#securityForm").password.value||"admin123";commit()};
function field(label,name,value="",type="text",extra=""){return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`}
function textArea(label,name,value=""){return `<label class="wide">${label}<textarea name="${name}">${esc(value)}</textarea></label>`}
function openModal(title,html,onSubmit){$("#editorTitle").textContent=title;$("#editorForm").innerHTML=html+`<button class="wide save">حفظ</button>`;$("#editorModal").classList.remove("hidden");$("#editorForm").onsubmit=async e=>{e.preventDefault();await onSubmit(new FormData(e.target));$("#editorModal").classList.add("hidden");commit()}}
$("#closeEditor").onclick=()=>$("#editorModal").classList.add("hidden");
async function filesToData(files){return Promise.all([...files].map(file=>new Promise(res=>{let r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file)})))}
function openProduct(id){let p=id?db.products.find(x=>x.id===id):{id:"p"+Date.now(),nameAr:"",nameEn:"",descAr:"",descEn:"",category:"all",price:0,stock:0,badgeAr:"",badgeEn:"",visible:true,featured:false,sort:db.products.length+1,images:[]};let cats=db.categories.filter(c=>c.id!=="all");openModal(id?"تعديل المنتج":"إضافة منتج",
 field("اسم المنتج بالعربي","nameAr",p.nameAr)+field("Product name in English","nameEn",p.nameEn)+textArea("الوصف بالعربي","descAr",p.descAr)+textArea("Description in English","descEn",p.descEn)+
 `<label>القسم<select name="category">${cats.map(c=>`<option value="${c.id}" ${p.category===c.id?"selected":""}>${c.nameAr} / ${c.nameEn}</option>`).join("")}</select></label>`+
 field("السعر","price",p.price,"number",'min="0"')+field("المخزون","stock",p.stock,"number",'min="0"')+field("شارة بالعربي","badgeAr",p.badgeAr)+field("Badge in English","badgeEn",p.badgeEn)+field("الترتيب","sort",p.sort,"number")+
 `<label class="check"><input name="visible" type="checkbox" ${p.visible?"checked":""}> ظاهر</label><label class="check"><input name="featured" type="checkbox" ${p.featured?"checked":""}> مميز</label>
 <label class="wide">صور المنتج (يمكن اختيار عدة صور)<input name="images" type="file" accept="image/*" multiple></label>
 <label class="wide">روابط صور إضافية، كل رابط بسطر<textarea name="imageUrls">${(p.images||[]).filter(x=>!x.startsWith("data:")).join("\n")}</textarea></label>
 <div class="wide image-preview">${(p.images||[]).map(x=>`<img src="${x}">`).join("")}</div>`,
 async fd=>{let uploads=await filesToData(fd.getAll("images").filter(f=>f.size));let urls=String(fd.get("imageUrls")||"").split("\n").map(x=>x.trim()).filter(Boolean);let old=(p.images||[]).filter(x=>x.startsWith("data:"));Object.assign(p,{nameAr:fd.get("nameAr"),nameEn:fd.get("nameEn"),descAr:fd.get("descAr"),descEn:fd.get("descEn"),category:fd.get("category"),price:+fd.get("price"),stock:+fd.get("stock"),badgeAr:fd.get("badgeAr"),badgeEn:fd.get("badgeEn"),sort:+fd.get("sort"),visible:fd.has("visible"),featured:fd.has("featured"),images:uploads.length?[...uploads,...urls]:[...old,...urls]});if(!p.images.length)p.images=[svgImg("PRODUCT","#3b0764","#7c3aed")];if(!id)db.products.push(p)}
 )}
function openCategory(id){let c=id?db.categories.find(x=>x.id===id):{id:"c"+Date.now(),nameAr:"",nameEn:"",visible:true,sort:db.categories.length};openModal(id?"تعديل القسم":"إضافة قسم",field("اسم القسم بالعربي","nameAr",c.nameAr)+field("Category name in English","nameEn",c.nameEn)+field("الترتيب","sort",c.sort,"number")+`<label class="check"><input name="visible" type="checkbox" ${c.visible?"checked":""}> ظاهر</label>`,fd=>{Object.assign(c,{nameAr:fd.get("nameAr"),nameEn:fd.get("nameEn"),sort:+fd.get("sort"),visible:fd.has("visible")});if(!id)db.categories.push(c)})}
function openAd(id){let a=id?db.ads.find(x=>x.id===id):{id:"a"+Date.now(),titleAr:"",titleEn:"",subtitleAr:"",subtitleEn:"",image:"",productId:"",visible:true,sort:db.ads.length+1};openModal(id?"تعديل الإعلان":"إضافة إعلان",field("عنوان الإعلان بالعربي","titleAr",a.titleAr)+field("Ad title in English","titleEn",a.titleEn)+field("النص بالعربي","subtitleAr",a.subtitleAr)+field("Text in English","subtitleEn",a.subtitleEn)+`<label>المنتج المرتبط<select name="productId"><option value="">بدون منتج</option>${db.products.map(p=>`<option value="${p.id}" ${a.productId===p.id?"selected":""}>${p.nameAr}</option>`).join("")}</select></label>`+field("الترتيب","sort",a.sort,"number")+`<label class="check"><input name="visible" type="checkbox" ${a.visible?"checked":""}> ظاهر</label><label class="wide">صورة الإعلان<input name="image" type="file" accept="image/*"></label><div class="wide image-preview">${a.image?`<img src="${a.image}">`:""}</div>`,async fd=>{let files=fd.getAll("image").filter(f=>f.size),im=files.length?(await filesToData(files))[0]:a.image;Object.assign(a,{titleAr:fd.get("titleAr"),titleEn:fd.get("titleEn"),subtitleAr:fd.get("subtitleAr"),subtitleEn:fd.get("subtitleEn"),productId:fd.get("productId"),sort:+fd.get("sort"),visible:fd.has("visible"),image:im||svgImg("ADVERTISEMENT","#3b0764","#f59e0b")});if(!id)db.ads.push(a)})}
$("#addProduct").onclick=()=>openProduct();$("#addCategory").onclick=()=>openCategory();$("#addAd").onclick=()=>openAd();
$("#exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ibraq-backup.json";a.click();URL.revokeObjectURL(a.href)};
$("#importInput").onchange=e=>{let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!d.settings||!d.products)throw 0;db=d;commit()}catch{alert("ملف غير صالح")}};if(e.target.files[0])r.readAsText(e.target.files[0])};
$("#resetBtn").onclick=()=>{if(confirm("استعادة البيانات الافتراضية وحذف التعديلات؟")){localStorage.removeItem(STORE_KEY);db=loadStore();commit()}};


// محرر الصفحة الرئيسية المرئي
function fillHomepage(){
 const f=$("#homepageForm"); if(!f) return;
 const st=db.settings;
 ["showLanguages","showHeader","showWhatsAppTop","showSearch","showCategories","showCart","showAds","showAbout"].forEach(k=>{if(f.elements[k])f.elements[k].checked=st[k]!==false});
 ["offersTitleAr","offersTitleEn","productsTitleAr","productsTitleEn","aboutTitleAr","aboutTitleEn","searchPlaceholderAr","searchPlaceholderEn","whatsappLabelAr","whatsappLabelEn","fontFamily","pageWidth","cardRadius","productColumnsDesktop","productColumnsMobile","heroNameSize","taglineSize","sectionTitleSize","productNameSize","adHeight","sectionGap","backgroundImage","backgroundFit"].forEach(k=>{if(f.elements[k])f.elements[k].value=st[k]??""});
 const order=Array.isArray(st.sectionOrder)?st.sectionOrder:["ads","products","about"];
 [1,2,3].forEach((n,i)=>{if(f.elements["section"+n])f.elements["section"+n].value=order[i]||["ads","products","about"][i]});
}
function readHomepageForm(){
 const f=$("#homepageForm"),st=db.settings;
 ["showLanguages","showHeader","showWhatsAppTop","showSearch","showCategories","showCart","showAds","showAbout"].forEach(k=>st[k]=f.elements[k].checked);
 ["offersTitleAr","offersTitleEn","productsTitleAr","productsTitleEn","aboutTitleAr","aboutTitleEn","searchPlaceholderAr","searchPlaceholderEn","whatsappLabelAr","whatsappLabelEn","fontFamily","backgroundImage","backgroundFit"].forEach(k=>st[k]=f.elements[k].value);
 ["pageWidth","cardRadius","productColumnsDesktop","productColumnsMobile","heroNameSize","taglineSize","sectionTitleSize","productNameSize","adHeight","sectionGap"].forEach(k=>st[k]=+f.elements[k].value||defaultStore.settings[k]);
 const order=[f.section1.value,f.section2.value,f.section3.value];
 st.sectionOrder=[...new Set(order)]; ["ads","products","about"].forEach(x=>{if(!st.sectionOrder.includes(x))st.sectionOrder.push(x)});
}
function refreshHomepagePreview(){const fr=$("#homepagePreview");if(fr)fr.src="index.html?preview="+Date.now()}
const hpSave=$("#saveHomepage"); if(hpSave)hpSave.onclick=()=>{readHomepageForm();saveStore(db);fillSettings();toast("تم حفظ شكل الصفحة الرئيسية");refreshHomepagePreview()};
const hpRefresh=$("#refreshPreview"); if(hpRefresh)hpRefresh.onclick=refreshHomepagePreview;
const hpUpload=$("#homepageBgUpload"); if(hpUpload)hpUpload.onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{$("#homepageForm").backgroundImage.value=r.result;readHomepageForm();saveStore(db);refreshHomepagePreview();toast("تم رفع الخلفية")};r.readAsDataURL(file)};
let hpTimer; const hpForm=$("#homepageForm"); if(hpForm)hpForm.addEventListener("input",()=>{clearTimeout(hpTimer);hpTimer=setTimeout(()=>{readHomepageForm();saveStore(db);refreshHomepagePreview()},500)});
