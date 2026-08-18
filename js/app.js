const canvas=document.getElementById("shaderCanvas");
const gl=canvas.getContext("webgl",{antialias:false,powerPreference:"high-performance"});
const warning=document.getElementById("warningScreen");
const denied=document.getElementById("deniedScreen");
const mainUI=document.getElementById("mainUI");
const music=document.getElementById("bgMusic");
const statusText=document.getElementById("statusText");
const liveDot=document.getElementById("liveDot");
const modeText=document.getElementById("modeText");
const fpsEl=document.getElementById("fps");
const frameTimeEl=document.getElementById("frameTime");
const stabilityEl=document.getElementById("stability");
const fpsLive=document.getElementById("fpsLive");
let running=false,currentMode="simple",intensity=.65,lastFrame=performance.now(),frames=0,lastFpsTime=performance.now();

const modes={simple:.65,standard:1.0,advanced:1.6,extreme:2.4};
const vs=`attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fs=`precision highp float;uniform vec2 resolution;uniform float time;uniform float intensity;
mat2 R(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
float scene(vec3 p){p.xz=R(time*.65)*p.xz;p.xy=R(time*.38)*p.xy;vec3 q=p;float d=length(q)-.72;for(int i=0;i<5;i++){q=abs(q)-.22;q.xy=R(.75)*q.xy;q.yz=R(.61)*q.yz;d=max(d,-length(q)+.18);}return d;}
vec3 N(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx)));}
void main(){vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;vec3 ro=vec3(0.,0.,3.0),rd=normalize(vec3(uv,-1.8));float t=0.;float hit=0.;for(int i=0;i<100;i++){vec3 p=ro+rd*t;float d=scene(p);if(d<.003){hit=1.;break;}t+=d*.55/intensity;if(t>6.)break;}vec3 col=vec3(.003,.005,.01);if(hit>0.){vec3 p=ro+rd*t,n=N(p);vec3 l=normalize(vec3(-.4,.7,1.));float dif=max(dot(n,l),0.);float h=.5+.5*sin(p.x*2.5+p.y*3.0+p.z*2.0+time*.4);vec3 c=vec3(.05+.2*h,.12+.65*h,.35+.6*(1.-h));col=c*(.25+1.1*dif);col+=pow(max(dot(reflect(-l,n),-rd),0.),7.)*.8;}gl_FragColor=vec4(col,1.);}`

function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
if(!gl){alert("WebGL is not supported on this Android browser.");throw new Error("WebGL unavailable")}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);gl.useProgram(program);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
const pos=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
const res=gl.getUniformLocation(program,"resolution"),tm=gl.getUniformLocation(program,"time"),ins=gl.getUniformLocation(program,"intensity");

function resize(){const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.floor(innerWidth*d);canvas.height=Math.floor(innerHeight*d);gl.viewport(0,0,canvas.width,canvas.height)}
addEventListener("resize",resize);resize();

function lockZoom(){
  ["gesturestart","gesturechange","gestureend"].forEach(e=>document.addEventListener(e,x=>x.preventDefault(),{passive:false}));
  document.addEventListener("touchmove",e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
}
lockZoom();

async function enterTest(){
  warning.classList.add("hidden");mainUI.classList.remove("hidden");running=true;statusText.textContent="LIVE";
  try{await document.documentElement.requestFullscreen()}catch(e){}
  try{music.currentTime=0;await music.play()}catch(e){}
  modeText.textContent=currentMode.toUpperCase();
}

document.getElementById("understandButton").addEventListener("click",enterTest);

function deny(){
  warning.classList.add("hidden");denied.classList.remove("hidden");
  try{window.close()}catch(e){}
}
document.getElementById("cancelButton").addEventListener("click",deny);
document.getElementById("closeDenied").addEventListener("click",()=>{try{window.close()}catch(e){}denied.querySelector("p").textContent="Access denied. You did not accept the GPU test warning."});

document.querySelectorAll(".btn[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  currentMode=btn.dataset.mode;intensity=modes[currentMode];running=true;
  document.querySelectorAll(".btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
  modeText.textContent=currentMode.toUpperCase();statusText.textContent="LIVE";liveDot.classList.remove("stop");stabilityEl.textContent="RUNNING";
}));

document.getElementById("stopButton").addEventListener("click",()=>{
  running=false;statusText.textContent="STOPPED";liveDot.classList.add("stop");stabilityEl.textContent="STOPPED";music.pause();
});

document.getElementById("fullscreenButton").addEventListener("click",async()=>{
  try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch(e){}
});

document.getElementById("musicButton").addEventListener("click",async()=>{
  if(music.paused){try{await music.play()}catch(e){}}
  else music.pause();
});

function render(now){
  const dt=now-lastFrame;lastFrame=now;
  if(running){
    gl.uniform2f(res,canvas.width,canvas.height);gl.uniform1f(tm,now*.001);gl.uniform1f(ins,intensity);gl.drawArrays(gl.TRIANGLES,0,6);
    frames++;
    if(now-lastFpsTime>=500){const fps=Math.round(frames*1000/(now-lastFpsTime));fpsEl.textContent=fps;fpsLive.textContent=fps;frameTimeEl.textContent=(1000/Math.max(fps,1)).toFixed(1)+" ms";frames=0;lastFpsTime=now;stabilityEl.textContent=fps>=45?"STABLE":"LOW FPS";}
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

