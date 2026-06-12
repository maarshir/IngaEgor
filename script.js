/* Reveal on scroll */
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  var io=new IntersectionObserver(function(en){
    en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});
  },{threshold:.16,rootMargin:'0px 0px -8% 0px'});
  els.forEach(e=>io.observe(e));
})();

/* Countdown to 16 Aug 2026, 16:00 (Europe/Moscow ~ UTC+3) */
(function(){
  var target=new Date('2026-08-16T16:00:00+03:00').getTime();
  var d=document.getElementById('cd-d'),h=document.getElementById('cd-h'),
      m=document.getElementById('cd-m'),s=document.getElementById('cd-s');
  function p(n){return String(n).padStart(2,'0');}
  function tick(){
    var diff=target-Date.now();
    if(diff<0)diff=0;
    var dd=Math.floor(diff/86400000),
        hh=Math.floor(diff%86400000/3600000),
        mm=Math.floor(diff%3600000/60000),
        ss=Math.floor(diff%60000/1000);
    d.textContent=p(dd);h.textContent=p(hh);m.textContent=p(mm);s.textContent=p(ss);
  }
  tick();setInterval(tick,1000);
})();

/* Continuous red line: built from the real page height so it never leaves
   the screen and stays unbroken on any device (rebuilt on resize / load). */
(function(){
  var wrap=document.querySelector('.red-line-wrap');
  if(!wrap)return;
  var svg=wrap.querySelector('svg');
  var path=document.getElementById('redline');
  if(!svg||!path)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var len=0;

  function build(){
    var H=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,window.innerHeight);
    var W=Math.max(window.innerWidth,document.documentElement.clientWidth)||360;
    var mobile=W<760;
    var xL=W*(mobile?0.11:0.07);          // left bound, stays on-screen
    var xR=W*(mobile?0.89:0.93);          // right bound, stays on-screen
    var mid=(xL+xR)/2, amp=(xR-xL)/2;
    var wave=mobile?340:480;              // vertical distance per half-swing
    var seg=Math.max(5,Math.round(H/wave));

    var pts=[];
    for(var i=0;i<=seg;i++){
      // deterministic gentle variation -> organic, not mechanical
      var k=0.74+0.26*Math.abs(Math.sin(i*1.37+0.6));
      var x=mid+(i%2===0?-1:1)*amp*k;
      if(x<xL)x=xL; if(x>xR)x=xR;
      pts.push([x,H*i/seg]);
    }

    var d='M '+pts[0][0].toFixed(1)+' -24 L '+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);
    for(var i=1;i<pts.length;i++){
      var x0=pts[i-1][0],y0=pts[i-1][1],x1=pts[i][0],y1=pts[i][1],cy=(y0+y1)/2;
      d+=' C '+x0.toFixed(1)+' '+cy.toFixed(1)+' '+x1.toFixed(1)+' '+cy.toFixed(1)+' '+x1.toFixed(1)+' '+y1.toFixed(1);
    }

    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    svg.setAttribute('preserveAspectRatio','none');
    path.setAttribute('d',d);

    len=path.getTotalLength();
    if(reduce){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';}
    else{path.style.strokeDasharray=len;draw();}
  }

  function draw(){
    if(reduce)return;
    var sc=document.documentElement;
    var max=sc.scrollHeight-sc.clientHeight;
    var prog=max>0?Math.min(1,window.scrollY/max):1;
    path.style.strokeDashoffset=len*(1-Math.min(1,prog*1.06));
  }

  var rt;
  function rebuild(){clearTimeout(rt);rt=setTimeout(build,150);}

  build();
  window.addEventListener('scroll',draw,{passive:true});
  window.addEventListener('resize',rebuild);
  window.addEventListener('orientationchange',rebuild);
  window.addEventListener('load',build);
  setTimeout(build,600);setTimeout(build,1600);
  if('ResizeObserver' in window){try{new ResizeObserver(rebuild).observe(document.body);}catch(e){}}
})();

/* Guest form reveal + submit */
(function(){
  var btn=document.getElementById('openForm'),
      panel=document.getElementById('formPanel'),
      form=document.getElementById('rsvpForm'),
      thanks=document.getElementById('formThanks');
  if(btn){btn.addEventListener('click',function(){
    panel.classList.add('open');
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  });}
  if(form){form.addEventListener('submit',function(){
    setTimeout(function(){
      panel.style.display='none';
      thanks.classList.add('show');
      thanks.scrollIntoView({behavior:'smooth',block:'center'});
    },600);
  });}
})();

/* Background music: optimistic autoplay, fallback to first user gesture */
(function(){
  var audio=document.getElementById('bgm'),btn=document.getElementById('bgmBtn');
  if(!audio||!btn)return;
  var playing=false,userToggled=false,autoStarted=false;
  function play(){var p=audio.play();if(p&&p.then){p.then(function(){playing=true;btn.classList.add('playing');btn.setAttribute('aria-pressed','true');}).catch(function(){});}}
  function pause(){audio.pause();playing=false;btn.classList.remove('playing');btn.setAttribute('aria-pressed','false');}
  btn.addEventListener('click',function(){userToggled=true;playing?pause():play();});
  var evs=['pointerdown','touchstart','keydown','scroll'];
  function autoStart(e){
    if(autoStarted||userToggled){removeAuto();return;}
    if(e&&e.target&&btn.contains(e.target))return; /* let the button handle itself */
    autoStarted=true;play();removeAuto();
  }
  function removeAuto(){evs.forEach(function(e){document.removeEventListener(e,autoStart);});}
  evs.forEach(function(e){document.addEventListener(e,autoStart,{passive:true});});
  play(); /* usually blocked until a gesture, that's fine */
})();
