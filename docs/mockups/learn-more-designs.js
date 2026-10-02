(function(){
  var root=document.documentElement, bl=document.getElementById("th-light"), bd=document.getElementById("th-dark");
  function set(t){
    if(t){root.setAttribute("data-theme",t);} else {root.removeAttribute("data-theme");}
    var dark = t==="dark" || (!t && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    bl.setAttribute("aria-pressed", dark?"false":"true"); bd.setAttribute("aria-pressed", dark?"true":"false");
    try{ if(t) localStorage.setItem("lm-theme",t); else localStorage.removeItem("lm-theme"); }catch(e){}
  }
  var saved=null; try{ saved=localStorage.getItem("lm-theme"); }catch(e){}
  set(saved==="dark"||saved==="light" ? saved : (root.getAttribute("data-theme")||null));
  bl.addEventListener("click",function(){set("light");});
  bd.addEventListener("click",function(){set("dark");});
})();
