/* Motion is progressive enhancement: content is always visible without it. */
(() => {
  const root=document.documentElement;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const running=new Set(), waiting=new Set();
  let lastScene='';
  const allowed=()=>!document.hidden&&(window.matclubSettings?window.matclubSettings.motionAllowed():!reduced?.matches);
  function play(el,frames,options={}){
    if(!el||!allowed()||!el.animate)return;
    const animation=el.animate(frames,{duration:540,easing:'cubic-bezier(.16,1,.3,1)',...options});
    running.add(animation);
    const release=()=>running.delete(animation);
    animation.addEventListener?.('finish',release,{once:true});
    animation.addEventListener?.('cancel',release,{once:true});
  }
  const arrival=[{opacity:0,transform:'translateY(26px) scale(.975)'},{opacity:1,transform:'translateY(0) scale(1)'}];
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
    let i=0;
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      observer.unobserve(entry.target);waiting.delete(entry.target);
      play(entry.target,arrival,{delay:Math.min(i++,4)*45});
    }
  },{threshold:.08}):null;
  function cards(){
    observer?.disconnect();waiting.clear();
    if(!allowed())return;
    const cards=[...document.querySelectorAll('.topic,.task-card')].filter(el=>!el.closest('[hidden]'));
    if(observer){for(const card of cards){waiting.add(card);observer.observe(card)}}
    else cards.slice(0,12).forEach((card,i)=>play(card,arrival,{delay:Math.min(i,4)*40}));
  }
  function scene(key){
    if(key===lastScene)return;lastScene=key;
    for(const animation of [...running])animation.cancel();
    const isComputing=key.startsWith('computing:'),isGraph=key.startsWith('graphs:');
    const targets=isComputing?document.querySelectorAll('.computing-status,#computingTitle,.computing-intro>p,.computing-soon,.computing-terminal,.language-tabs,.language-panel:not([hidden])'):
      isGraph?document.querySelectorAll('.graph-heading,.graph-controls,.graph-canvas-card'):
      key.startsWith('catalog:')?document.querySelectorAll('.hero-copy>.eyebrow,.hero h1,.hero-copy>p,.hero-actions,.hero-foot,.hero-art'):
      document.querySelectorAll('#catalog .section-head,#progress-content');
    [...targets].filter(el=>!el.closest('[hidden]')).forEach((el,i)=>play(el,[{opacity:0,transform:`translateY(${i===1?30:18}px)`},{opacity:1,transform:'translateY(0)'}],{duration:i===1?720:580,delay:Math.min(i,5)*65}));
  }
  function workspace(){
    document.querySelectorAll('.workspace-top,.problem-pane .modal-title,.problem-pane>.question,.work-tabs').forEach((el,i)=>play(el,arrival,{duration:420,delay:i*45}));
  }
  function policy(){
    root.toggleAttribute('data-motion-paused',document.hidden);
    if(!allowed()){
      for(const animation of [...running])animation.cancel();
      observer?.disconnect();waiting.clear();
    }
  }
  document.addEventListener('visibilitychange',policy);
  reduced?.addEventListener?.('change',policy);
  if(typeof MutationObserver==='function')new MutationObserver(policy).observe(root,{attributes:true,attributeFilter:['data-motion']});
  document.addEventListener('click',event=>{
    const button=event.target.closest('.domain-switch>button,.grade-row button,.level-tabs button,.language-tab');
    if(button)play(button,[{transform:'scale(.95)'},{transform:'scale(1.025)',offset:.65},{transform:'scale(1)'}],{duration:320});
  });
  window.matclubMotion={scene,cards,workspace};
  policy();

  const tabs=[...document.querySelectorAll('[data-language]')];
  function selectLanguage(tab){
    for(const item of tabs){
      const selected=item===tab,panel=document.getElementById(item.getAttribute('aria-controls'));
      item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;panel.hidden=!selected;
      if(selected)play(panel,[{opacity:0,transform:'translateX(16px)'},{opacity:1,transform:'translateX(0)'}],{duration:380});
    }
  }
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>selectLanguage(tab));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;
      selectLanguage(tabs[next]);tabs[next].focus();
    });
  });
})();
