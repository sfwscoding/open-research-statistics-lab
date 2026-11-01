/* Presentation-only theme preference. Does not touch lab calculations or data. */
(function () {
  "use strict";
  const KEY="open-research-statistics-lab-theme-v1";
  const nav=document.querySelector(".unified-nav");
  const root=document.documentElement;
  const modes=[["system","ระบบ"],["light","สว่าง"],["dark","มืด"]];
  function apply(value){
    if(value==="light"||value==="dark")root.setAttribute("data-theme",value);
    else root.removeAttribute("data-theme");
    const selected=value==="light"||value==="dark"?value:"system";
    if(nav)nav.querySelectorAll(".theme-control button").forEach(button=>
      button.setAttribute("aria-pressed",String(button.dataset.theme===selected)));
  }
  let preferred="system";
  try {
    const saved=localStorage.getItem(KEY);
    if(modes.some(([mode])=>mode===saved))preferred=saved;
  }catch(_) {}
  if(nav){
    const control=document.createElement("div");
    control.className="theme-control";
    control.setAttribute("role","group");
    control.setAttribute("aria-label","เลือกธีมการแสดงผล");
    for(const [mode,label] of modes){
      const button=document.createElement("button");
      button.type="button";
      button.dataset.theme=mode;
      button.textContent=label;
      button.title="ธีม"+label;
      button.addEventListener("click",()=>{
        preferred=mode;
        try{localStorage.setItem(KEY,preferred)}catch(_){}
        apply(preferred);
      });
      control.appendChild(button);
    }
    nav.appendChild(control);
  }
  apply(preferred);
})();
