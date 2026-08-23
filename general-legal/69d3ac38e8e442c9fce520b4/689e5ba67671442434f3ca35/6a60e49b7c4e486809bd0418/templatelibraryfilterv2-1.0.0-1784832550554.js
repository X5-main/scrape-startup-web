(function(){
  function init(){
    var section=document.querySelector('[data-related-section]');
    var grid=document.querySelector('[data-related-grid]');
    var catEl=document.querySelector('[data-current-category]');
    if(!section||!grid||!catEl) return;
    var cat=catEl.textContent.trim();
    var parts=window.location.pathname.replace(/\/$/,'').split('/');
    var currentSlug=parts[parts.length-1];
    var items=grid.querySelectorAll('.w-dyn-item');
    var shown=0;
    items.forEach(function(it){
      var c=it.querySelector('.template-list-card__cat');
      var a=it.querySelector('a[href]');
      var itemCat=c?c.textContent.trim():'';
      var slug=a?a.id:'';
      if(a && slug){ a.setAttribute('href','/library/'+slug); }
      if(itemCat===cat && slug && slug!==currentSlug && shown<3){
        it.style.display='';
        shown++;
      } else {
        it.style.display='none';
      }
    });
    if(shown===0){ section.style.display='none'; }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();