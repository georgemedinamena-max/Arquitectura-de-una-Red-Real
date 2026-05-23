'use strict';


/* ── Aside: toggle groups ── */
const toggleG = id => {
  const g = document.getElementById(id);
  const btn = g.querySelector('[role="button"]');
  const isCol = g.classList.contains('collapsed');
  g.classList.toggle('collapsed', !isCol);
  btn.setAttribute('aria-expanded', isCol ? 'true' : 'false');
};

/* ── Filter components ── */
const filterC = (ev) => {
  const btn  = ev.currentTarget || ev.target;
  const type = btn.dataset.f || 'all';
  document.querySelectorAll('.fbtn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  document.querySelectorAll('#compGrid .c-card').forEach(card => {
    const show = type === 'all' || card.dataset.type === type;
    if (show) {
      card.style.display = '';
      card.style.opacity = '0';
      card.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        card.style.transition = 'opacity .3s ease, transform .3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    } else {
      card.style.transition = 'opacity .2s ease';
      card.style.opacity = '0';
      setTimeout(() => { card.style.display = 'none'; }, 200);
    }
  });
};

/* ── Delay calculator ── */
const doCalc = () => {
  const dist = parseFloat(document.getElementById('i-dist').value) || 2200;
  const bw   = parseFloat(document.getElementById('i-bw').value)   || 600;
  const seg  = parseFloat(document.getElementById('i-seg').value)  || 50;
  const util = parseFloat(document.getElementById('i-util').value) / 100 || 0.6;
  const vFiber = 2e5; // km/s
  const dProp  = (dist / vFiber) * 1000;
  const dTrans = (seg / bw) * 1000;
  const dCola  = util < 0.95 ? ((util / (1 - util)) * 1 * 4).toFixed(2) : '>100';
  const rtt    = (2 * dProp + dTrans + (parseFloat(dCola) || 50)).toFixed(1);
  document.getElementById('r-prop').textContent  = dProp.toFixed(2)  + ' ms';
  document.getElementById('r-trans').textContent = dTrans.toFixed(2) + ' ms';
  document.getElementById('r-cola').textContent  = dCola + ' ms';
  document.getElementById('r-rtt').textContent   = rtt + ' ms';
  document.getElementById('r-tp').textContent    = Math.min(bw, 10000) + ' Mbps';
  const b = document.getElementById('btnCalc');
  b.textContent = '✓ CALCULADO';
  b.style.cssText += ';background:rgba(57,255,20,.15);border-color:#39ff14;color:#39ff14';
  setTimeout(() => {
    b.textContent = '▶ CALCULAR';
    b.style.background = b.style.borderColor = b.style.color = '';
  }, 2000);
};

/* ── Scenario loader ── */
const scenarios = {
  netflix: {u:'238 M',p:'1.000+',t:'640 Tbps',pr:'HTTP/3'},
  corp:    {u:'50.000',p:'8 sitios',t:'40 Gbps',pr:'SD-WAN/MPLS'},
  iot:     {u:'5 M devices',p:'Edge local',t:'800 Mbps',pr:'MQTT/CoAP'},
};
const loadScene = key => {
  const s = scenarios[key] || scenarios.netflix;
  const box = document.getElementById('sc-info');
  box.style.opacity = '0';
  setTimeout(() => {
    box.innerHTML = `<div><span class="r-lbl">Usuarios</span><span class="r-val">${s.u}</span></div>
      <div><span class="r-lbl">CDN/PoPs</span><span class="r-val">${s.p}</span></div>
      <div><span class="r-lbl">Tráfico pico</span><span class="r-val r-warn">${s.t}</span></div>
      <div><span class="r-lbl">Protocolo</span><span class="r-val r-good">${s.pr}</span></div>`;
    box.style.transition = 'opacity .3s ease';
    box.style.opacity = '1';
  }, 180);
};

/* ══════════════════════════════════════
   CANVAS 3D DIAGRAM
══════════════════════════════════════ */
const cvs = document.getElementById('dCvs');
const ctx = cvs.getContext('2d');
let gSpd = 1.5, gAng = 18, gLabels = true, gGlow = true, gAF;

const setSpd = v => {
  gSpd = parseFloat(v);
  const vt = v + '×';
  const el1 = document.getElementById('sp-v');
  const el2 = document.getElementById('q-sp-v');
  if(el1) el1.textContent = vt;
  if(el2) el2.textContent = vt;
};
const setAng = v => {
  gAng = parseFloat(v);
  const vt = v + '°';
  const el1 = document.getElementById('ang-v');
  const el2 = document.getElementById('q-ang-v');
  if(el1) el1.textContent = vt;
  if(el2) el2.textContent = vt;
};

const resizeCvs = () => {
  const w = cvs.parentElement;
  cvs.width  = w.clientWidth  || w.offsetWidth  || 600;
  cvs.height = w.clientHeight || w.offsetHeight || 200;
};

/* 3D oblique projection */
const proj = (x, y, z, W, H) => {
  const rad = gAng * Math.PI / 180;
  return {
    x: (x + z * Math.cos(rad) * 0.45) * W,
    y: (y - z * Math.sin(rad) * 0.5)  * H,
  };
};

const NODES = [
  {id:'ph', lbl:'Smartphone', x:.06,y:.28,z:.00,col:'#00e5ff'},
  {id:'tv', lbl:'Smart TV',   x:.06,y:.50,z:.00,col:'#00e5ff'},
  {id:'lp', lbl:'Laptop',     x:.06,y:.72,z:.00,col:'#00e5ff'},
  {id:'rt', lbl:'Router',     x:.18,y:.50,z:.08,col:'#c471f5'},
  {id:'ip', lbl:'ISP PoP',    x:.30,y:.33,z:.12,col:'#c471f5'},
  {id:'dn', lbl:'DNS',        x:.30,y:.67,z:.12,col:'#c471f5'},
  {id:'c1', lbl:'CDN PoP',    x:.46,y:.24,z:.18,col:'#ff6b35'},
  {id:'c2', lbl:'CDN Edge',   x:.46,y:.50,z:.18,col:'#ff6b35'},
  {id:'c3', lbl:'IXP/CDN',    x:.46,y:.76,z:.18,col:'#ff6b35'},
  {id:'bg', lbl:'BGP Core',   x:.62,y:.35,z:.22,col:'#f9d71c'},
  {id:'ix', lbl:'IXP',        x:.62,y:.65,z:.22,col:'#f9d71c'},
  {id:'lb', lbl:'LB',         x:.80,y:.24,z:.28,col:'#39ff14'},
  {id:'ap', lbl:'API',        x:.80,y:.48,z:.28,col:'#39ff14'},
  {id:'s3', lbl:'Storage',    x:.80,y:.68,z:.28,col:'#39ff14'},
  {id:'dr', lbl:'Auth/DRM',   x:.80,y:.88,z:.28,col:'#39ff14'},
];

const EDGES = [
  // Clients → Router
  {a:'ph',b:'rt',m:1,col:'#00e5ff'},{a:'tv',b:'rt',m:1,col:'#00e5ff'},{a:'lp',b:'rt',m:0,col:'#00e5ff'},
  // Router → ISP / DNS
  {a:'rt',b:'ip',m:1,col:'#c471f5'},{a:'rt',b:'dn',m:0,col:'#c471f5'},
  // ISP → CDN PoPs
  {a:'ip',b:'c1',m:1,col:'#ff6b35'},{a:'ip',b:'c2',m:0,col:'#ff6b35'},{a:'ip',b:'c3',m:0,col:'#ff6b35'},
  // DNS → CDN
  {a:'dn',b:'c1',m:0,col:'#ff6b35'},{a:'dn',b:'c2',m:0,col:'#ff6b35'},
  // CDN inter-links
  {a:'c1',b:'c2',m:0,col:'#ff6b35'},{a:'c2',b:'c3',m:0,col:'#ff6b35'},
  // CDN → Core
  {a:'c1',b:'bg',m:1,col:'#f9d71c'},{a:'c2',b:'bg',m:0,col:'#f9d71c'},
  {a:'c3',b:'ix',m:1,col:'#f9d71c'},{a:'c2',b:'ix',m:0,col:'#f9d71c'},
  // Core cross
  {a:'bg',b:'ix',m:0,col:'#f9d71c'},
  // Core → Origin
  {a:'bg',b:'lb',m:1,col:'#39ff14'},{a:'bg',b:'ap',m:1,col:'#39ff14'},
  {a:'ix',b:'lb',m:0,col:'#39ff14'},{a:'ix',b:'s3',m:0,col:'#39ff14'},
  // Origin internal
  {a:'lb',b:'ap',m:1,col:'#39ff14'},{a:'ap',b:'s3',m:0,col:'#39ff14'},
  {a:'ap',b:'dr',m:1,col:'#39ff14'},{a:'lb',b:'dr',m:0,col:'#39ff14'},
];

const PKTS = EDGES.filter(e=>e.m).map(e => ({
  ...e,
  prog: Math.random(),
  spd:  .0025 + Math.random()*.003,
}));

const nPos = (id,W,H) => {
  const n = NODES.find(n=>n.id===id);
  return proj(n.x, n.y, n.z, W, H);
};

const draw = () => {
  const W = cvs.width, H = cvs.height;
  ctx.clearRect(0, 0, W, H);

  /* Grid floor */
  ctx.save();
  ctx.strokeStyle = 'rgba(0,229,255,.055)';
  ctx.lineWidth = .5;
  for (let i=0;i<=10;i++){
    const f = i/10;
    const a = proj(f,.92,.00,W,H), b = proj(f,.92,.32,W,H);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  for (let j=0;j<=8;j++){
    const z = j/8*.32;
    const a = proj(0,.92,z,W,H), b = proj(1,.92,z,W,H);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  ctx.restore();

  /* Edges */
  EDGES.forEach(({a,b,m,col}) => {
    const pa = nPos(a,W,H), pb = nPos(b,W,H);
    const cx = (pa.x+pb.x)/2, cy = (pa.y+pb.y)/2 - (pb.x-pa.x)*.05;
    ctx.save();
    if (m) {
      // Glowing main edge
      const hex = col || '#00e5ff';
      ctx.strokeStyle = hex + '55';
      ctx.lineWidth = 1.8;
      if(gGlow){ ctx.shadowColor=hex; ctx.shadowBlur=6; }
    } else {
      ctx.strokeStyle = (col||'#8888cc') + '28';
      ctx.lineWidth = .7;
      ctx.setLineDash([3,5]);
    }
    ctx.beginPath();
    ctx.moveTo(pa.x,pa.y);
    ctx.quadraticCurveTo(cx,cy,pb.x,pb.y);
    ctx.stroke();
    ctx.restore();
  });

  /* Packets */
  PKTS.forEach(pk => {
    const pa = nPos(pk.a,W,H), pb = nPos(pk.b,W,H);
    const cx = (pa.x+pb.x)/2, cy = (pa.y+pb.y)/2 - (pb.x-pa.x)*.05;
    pk.prog = (pk.prog + pk.spd * gSpd) % 1;
    const t = pk.prog;
    const px = (1-t)*(1-t)*pa.x + 2*(1-t)*t*cx + t*t*pb.x;
    const py = (1-t)*(1-t)*pa.y + 2*(1-t)*t*cy + t*t*pb.y;
    const pCol = pk.col || '#00e5ff';
    ctx.save();
    if (gGlow){ ctx.shadowColor=pCol; ctx.shadowBlur=9; }
    ctx.fillStyle = pCol + 'ee';
    ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fill();
    // tail
    ctx.globalAlpha=.25;
    const tx = px-(pb.x-pa.x)*.018, ty = py-(pb.y-pa.y)*.018;
    ctx.beginPath(); ctx.arc(tx,ty,2,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=.1;
    const tx2 = px-(pb.x-pa.x)*.032, ty2 = py-(pb.y-pa.y)*.032;
    ctx.beginPath(); ctx.arc(tx2,ty2,1.3,0,Math.PI*2); ctx.fill();
    ctx.restore();
  });

  /* Nodes */
  NODES.forEach(nd => {
    const {x:nx,y:ny} = proj(nd.x,nd.y,nd.z,W,H);
    // Smaller nodes on narrow screens so labels have breathing room
    const r = W < 360 ? Math.max(4, W*.009)
            : W < 500 ? Math.max(5, W*.010)
            : Math.max(6, W*.011);
    ctx.save();
    if (gGlow){ ctx.shadowColor=nd.col; ctx.shadowBlur=12; }
    ctx.strokeStyle = nd.col+'99'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(nx,ny,r+2.5,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(8,24,52,.92)';
    ctx.beginPath(); ctx.arc(nx,ny,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=nd.col;
    ctx.beginPath(); ctx.arc(nx,ny,r*.36,0,Math.PI*2); ctx.fill();
    ctx.restore();
    if (gLabels){
      ctx.save();
      // Responsive font: smaller on narrow screens, bigger on wide
      const lblSize = Math.max(6, Math.min(W * 0.012, 13));
      ctx.font=`${lblSize}px 'Courier New',Consolas,monospace`;
      ctx.fillStyle=nd.col+'cc'; ctx.textAlign='center';
      // Offset label below node; tighter gap on small screens
      const lblY = ny + r + (W < 400 ? 7 : 10);
      ctx.fillText(nd.lbl, nx, lblY);
      ctx.restore();
    }
  });

  /* Zone headers */
  if (gLabels && W>280){
    const zones = [
      {lbl:'CLIENTE',  xf:.06, col:'#00e5ff'},
      {lbl:'ISP',      xf:.24, col:'#c471f5'},
      {lbl:'CDN',      xf:.46, col:'#ff6b35'},
      {lbl:'CORE',     xf:.62, col:'#f9d71c'},
      {lbl:'ORIGEN',   xf:.80, col:'#39ff14'},
    ];
    const zoneSize = Math.max(7, Math.min(W * 0.011, 13));
    zones.forEach(({lbl,xf,col}) => {
      const p = proj(xf,.08,.0,W,H);
      ctx.save();
      ctx.font=`700 ${zoneSize}px 'Arial Black','Impact',sans-serif`;
      ctx.fillStyle=col; ctx.globalAlpha=.65; ctx.textAlign='center';
      ctx.fillText(lbl, p.x, p.y);
      ctx.restore();
    });
  }

  gAF = requestAnimationFrame(draw);
};

/* Set throughput bar heights from data-pct — works at any container size */
const initTpBars = () => {
  const wrap = document.getElementById('tpChart');
  if (!wrap) return;
  const maxH = wrap.offsetHeight || 120;
  wrap.querySelectorAll('.tp-b').forEach(bar => {
    const pct = parseFloat(bar.dataset.pct) || 50;
    bar.style.height = Math.round((pct / 100) * (maxH - 20)) + 'px';
  });
};

const initCvs = () => {
  resizeCvs();
  cancelAnimationFrame(gAF);
  draw();
  setTimeout(initTpBars, 50);
};

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initCvs, 80);
});

/* Start after fonts + layout settle */
if (document.readyState === 'complete') {
  setTimeout(initCvs, 100);
} else {
  window.addEventListener('load', () => setTimeout(initCvs, 100));
}