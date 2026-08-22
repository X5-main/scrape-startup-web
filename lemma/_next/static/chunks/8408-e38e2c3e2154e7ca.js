"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8408],{2795:(e,t,i)=>{i.d(t,{f:()=>s});var o=i(94065),r=i(32906),a=i(82901);async function n(e){let t={},i=[];return Object.entries(e).forEach(e=>{let[o,r]=e;if("string"==typeof r){if(!r){t[o]=function(){if("undefined"==typeof window)return void console.warn("Paper Shaders: can’t create an image on the server");let e=new Image;return e.src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",e}();return}if(!(e=>{try{if(e.startsWith("/"))return!0;return new URL(e),!0}catch(e){return!1}})(r))return void console.warn('Uniform "'.concat(o,'" has invalid URL "').concat(r,'". Skipping image loading.'));let e=new Promise((e,i)=>{let a=new Image;(e=>{try{if(e.startsWith("/"))return!1;return new URL(e,window.location.origin).origin!==window.location.origin}catch(e){return!1}})(r)&&(a.crossOrigin="anonymous"),a.onload=()=>{t[o]=a,e()},a.onerror=()=>{console.error("Could not set uniforms. Failed to load image at ".concat(r)),i()},a.src=r});i.push(e)}else t[o]=r}),await Promise.all(i),t}let s=(0,o.forwardRef)(function(e,t){let{fragmentShader:i,uniforms:s,webGlContextAttributes:l,speed:u=0,frame:c=0,width:f,height:p,minPixelRatio:h,maxPixelCount:x,style:g,...v}=e,[d,m]=(0,o.useState)(!1),_=(0,o.useRef)(null),S=(0,o.useRef)(null);(0,o.useEffect)(()=>((async()=>{let e=await n(s);_.current&&!S.current&&(S.current=new r.f(_.current,i,e,l,u,c,h,x),m(!0))})(),()=>{var e;null==(e=S.current)||e.dispose(),S.current=null}),[i,l]),(0,o.useEffect)(()=>{let e=!1;return(async()=>{let t=await n(s);if(!e){var i;null==(i=S.current)||i.setUniforms(t)}})(),()=>{e=!0}},[s,d]),(0,o.useEffect)(()=>{var e;null==(e=S.current)||e.setSpeed(u)},[u,d]),(0,o.useEffect)(()=>{var e;null==(e=S.current)||e.setMaxPixelCount(x)},[x,d]),(0,o.useEffect)(()=>{var e;null==(e=S.current)||e.setMinPixelRatio(h)},[h,d]),(0,o.useEffect)(()=>{var e;null==(e=S.current)||e.setFrame(c)},[c,d]);let b=function(e){let t=o.useRef(void 0),i=o.useCallback(t=>{let i=e.map(e=>{if(null!=e){if("function"==typeof e){let i=e(t);return"function"==typeof i?i:()=>{e(null)}}return e.current=t,()=>{e.current=null}}});return()=>{i.forEach(e=>e?.())}},e);return o.useMemo(()=>e.every(e=>null==e)?null:e=>{t.current&&(t.current(),t.current=void 0),null!=e&&(t.current=i(e))},e)}([_,t]);return(0,a.jsx)("div",{ref:b,style:void 0!==f||void 0!==p?{width:f,height:p,...g}:g,...v})});s.displayName="ShaderMount"},21239:(e,t,i)=>{i.d(t,{CJ:()=>l,ES:()=>o,Km:()=>u,V2:()=>c,ZB:()=>r,hq:()=>f,m0:()=>a,nI:()=>s,tZ:()=>n});let o=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,r=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,a=`
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`,n=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`,s=`
  float randomR(vec2 p) {
    vec2 uv = floor(p) / 100. + .5;
    return texture(u_noiseTexture, fract(uv)).r;
  }
`,l=`
  vec2 randomGB(vec2 p) {
    vec2 uv = floor(p) / 100. + .5;
    return texture(u_noiseTexture, fract(uv)).gb;
  }
`,u=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,c=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,f=`
float fiberRandom(vec2 p) {
  vec2 uv = floor(p) / 100.;
  return texture(u_noiseTexture, fract(uv)).b;
}

float fiberValueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = fiberRandom(i);
  float b = fiberRandom(i + vec2(1.0, 0.0));
  float c = fiberRandom(i + vec2(0.0, 1.0));
  float d = fiberRandom(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float fiberNoiseFbm(in vec2 n, vec2 seedOffset) {
  float total = 0.0, amplitude = 1.;
  for (int i = 0; i < 4; i++) {
    n = rotate(n, .7);
    total += fiberValueNoise(n + seedOffset) * amplitude;
    n *= 2.;
    amplitude *= 0.6;
  }
  return total;
}

float fiberNoise(vec2 uv, vec2 seedOffset) {
  float epsilon = 0.001;
  float n1 = fiberNoiseFbm(uv + vec2(epsilon, 0.0), seedOffset);
  float n2 = fiberNoiseFbm(uv - vec2(epsilon, 0.0), seedOffset);
  float n3 = fiberNoiseFbm(uv + vec2(0.0, epsilon), seedOffset);
  float n4 = fiberNoiseFbm(uv - vec2(0.0, epsilon), seedOffset);
  return length(vec2(n1 - n2, n3 - n4)) / (2.0 * epsilon);
}
`},32906:(e,t,i)=>{i.d(t,{f:()=>a,c:()=>l});let o=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;

uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform float u_pxSize;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_objectHelperBox;

out vec2 v_responsiveUV;
out vec2 v_responsiveBoxSize;
out vec2 v_responsiveHelperBox;
out vec2 v_responsiveBoxGivenSize;

out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_patternHelperBox;

out vec2 v_imageUV;

// #define ADD_HELPERS

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================
  // Sizing api for graphic objects with fixed ratio
  // (currently supports only ratio = 1)

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  #ifdef ADD_HELPERS
  v_objectHelperBox = uv;
  v_objectHelperBox *= objectWorldScale;
  v_objectHelperBox += boxOrigin * (objectWorldScale - 1.);
  #endif

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;


  // ===================================================


  // ===================================================
  // Sizing api for graphic objects with either givenBoxSize ratio or canvas ratio.
  // Full-screen mode available with u_worldWidth = u_worldHeight = 0

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  v_responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / v_responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================


  // ===================================================
  // Sizing api for patterns
  // (treating graphics as a image u_worldWidth x u_worldHeight size)

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  #ifdef ADD_HELPERS
  v_patternHelperBox = uv;
  v_patternHelperBox *= patternBoxScale;
  v_patternHelperBox += boxOrigin * (patternBoxScale - 1.);
  #endif

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================


  // ===================================================
  // Sizing api for images

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  #ifdef ADD_HELPERS
  vec2 imageHelperBox = uv;
  imageHelperBox *= imageBoxScale;
  imageHelperBox += boxOrigin * (imageBoxScale - 1.);
  #endif

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;

  // ===================================================

}`,r=8294400;class a{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;providedUniforms;hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=(function(){let e=navigator.userAgent.toLowerCase();return e.includes("safari")&&!e.includes("chrome")&&!e.includes("android")})();uniformCache={};textureUnitMap=new Map;constructor(e,t,i,o,a=0,n=0,l=2,u=r){if(e instanceof HTMLElement)this.parentElement=e;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(!document.querySelector("style[data-paper-shader]")){let e=document.createElement("style");e.innerHTML=s,e.setAttribute("data-paper-shader",""),document.head.prepend(e)}let c=document.createElement("canvas");this.canvasElement=c,this.parentElement.prepend(c),this.fragmentShader=t,this.providedUniforms=i,this.currentFrame=n,this.minPixelRatio=l,this.maxPixelCount=u;let f=c.getContext("webgl2",o);if(!f)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=f,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setSpeed(a),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this}initProgram=()=>{let e=function(e,t,i){let o=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT),r=o?o.precision:null;r&&r<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),i=i.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let a=n(e,e.VERTEX_SHADER,t),s=n(e,e.FRAGMENT_SHADER,i);if(!a||!s)return null;let l=e.createProgram();return l?(e.attachShader(l,a),e.attachShader(l,s),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS))?(e.detachShader(l,a),e.detachShader(l,s),e.deleteShader(a),e.deleteShader(s),l):(console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(l)),e.deleteProgram(l),e.deleteShader(a),e.deleteShader(s),null):null}(this.gl,o,this.fragmentShader);e&&(this.program=e)};setupPositionAttribute=()=>{let e=this.gl.getAttribLocation(this.program,"a_position"),t=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let e={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([t,i])=>{if(e[t]=this.gl.getUniformLocation(this.program,t),i instanceof HTMLImageElement){let i=`${t}AspectRatio`;e[i]=this.gl.getUniformLocation(this.program,i)}}),this.uniformLocations=e};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([e])=>{if(e?.borderBoxSize[0]){let t=e.devicePixelContentBoxSize?.[0];void 0!==t&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=t.inlineSize,this.parentDevicePixelHeight=t.blockSize),this.parentWidth=e.borderBoxSize[0].inlineSize,this.parentHeight=e.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let e=0,t=0,i=Math.max(1,window.devicePixelRatio),o=visualViewport?.scale??1;if(this.devicePixelsSupported){let r=Math.max(1,this.minPixelRatio/i);e=this.parentDevicePixelWidth*r*o,t=this.parentDevicePixelHeight*r*o}else{let r=Math.max(i,this.minPixelRatio)*o;this.isSafari&&(r*=Math.max(1,function(){let e=visualViewport?.scale??1,t=visualViewport?.width??window.innerWidth,i=outerWidth/(e*t+(window.innerWidth-document.documentElement.clientWidth)),o=Math.round(100*i);return o%5==0?o/100:33===o?1/3:67===o?2/3:133===o?4/3:i}())),e=Math.round(this.parentWidth)*r,t=Math.round(this.parentHeight)*r}let r=Math.min(1,Math.sqrt(this.maxPixelCount)/Math.sqrt(e*t)),a=Math.round(e*r),n=Math.round(t*r),s=a/Math.round(this.parentWidth);(this.canvasElement.width!==a||this.canvasElement.height!==n||this.renderScale!==s)&&(this.renderScale=s,this.canvasElement.width=a,this.canvasElement.height=n,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=e=>{if(this.hasBeenDisposed)return;if(null===this.program)return void console.warn("Tried to render before program or gl was initialized");let t=e-this.lastRenderTime;this.lastRenderTime=e,0!==this.speed&&(this.currentFrame+=t*this.speed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,.001*this.currentFrame),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),0!==this.speed?this.requestRender():this.rafId=null};requestRender=()=>{null!==this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(e,t)=>{if(!t.complete||0===t.naturalWidth)throw Error(`Paper Shaders: image for uniform ${e} must be fully loaded`);let i=this.textures.get(e);i&&this.gl.deleteTexture(i),this.textureUnitMap.has(e)||this.textureUnitMap.set(e,this.textureUnitMap.size);let o=this.textureUnitMap.get(e);this.gl.activeTexture(this.gl.TEXTURE0+o);let r=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,r),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t);let a=this.gl.getError();if(a!==this.gl.NO_ERROR||null===r)return void console.error("Paper Shaders: WebGL error when uploading texture:",a);this.textures.set(e,r);let n=this.uniformLocations[e];if(n){this.gl.uniform1i(n,o);let i=`${e}AspectRatio`,r=this.uniformLocations[i];if(r){let e=t.naturalWidth/t.naturalHeight;this.gl.uniform1f(r,e)}}};areUniformValuesEqual=(e,t)=>e===t||!!(Array.isArray(e)&&Array.isArray(t))&&e.length===t.length&&e.every((e,i)=>this.areUniformValuesEqual(e,t[i]));setUniformValues=e=>{this.gl.useProgram(this.program),Object.entries(e).forEach(([e,t])=>{let i=t;if(t instanceof HTMLImageElement&&(i=`${t.src.slice(0,200)}|${t.naturalWidth}x${t.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[e],i))return;this.uniformCache[e]=i;let o=this.uniformLocations[e];if(!o)return void console.warn(`Uniform location for ${e} not found`);if(t instanceof HTMLImageElement)this.setTextureUniform(e,t);else if(Array.isArray(t)){let i=null,r=null;if(void 0!==t[0]&&Array.isArray(t[0])){let o=t[0].length;if(!t.every(e=>e.length===o))return void console.warn(`All child arrays must be the same length for ${e}`);i=t.flat(),r=o}else r=(i=t).length;switch(r){case 2:this.gl.uniform2fv(o,i);break;case 3:this.gl.uniform3fv(o,i);break;case 4:this.gl.uniform4fv(o,i);break;case 9:this.gl.uniformMatrix3fv(o,!1,i);break;case 16:this.gl.uniformMatrix4fv(o,!1,i);break;default:console.warn(`Unsupported uniform array length: ${r}`)}}else"number"==typeof t?this.gl.uniform1f(o,t):"boolean"==typeof t?this.gl.uniform1i(o,+!!t):console.warn(`Unsupported uniform type for ${e}: ${typeof t}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=e=>{this.currentFrame=e,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(e=1)=>{this.speed=e,null===this.rafId&&0!==e&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),null!==this.rafId&&0===e&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(e=r)=>{this.maxPixelCount=e,this.handleResize()};setMinPixelRatio=(e=2)=>{this.minPixelRatio=e,this.handleResize()};setUniforms=e=>{this.setUniformValues(e),this.providedUniforms={...this.providedUniforms,...e},this.render(performance.now())};dispose=()=>{this.hasBeenDisposed=!0,null!==this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(e=>{this.gl.deleteTexture(e)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.uniformLocations={},this.parentElement.paperShaderMount=void 0}}function n(e,t,i){let o=e.createShader(t);return o?(e.shaderSource(o,i),e.compileShader(o),e.getShaderParameter(o,e.COMPILE_STATUS))?o:(console.error("An error occurred compiling the shaders: "+e.getShaderInfoLog(o)),e.deleteShader(o),null):null}let s=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function l(e){return"paperShaderMount"in e}},45495:(e,t,i)=>{i.d(t,{b:()=>n,d:()=>a});var o=i(92204),r=i(21239);let a={maxColorCount:10},n=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${a.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;

${o.O_}
${o.DF}
${o.sy}

out vec4 fragColor;

${r.ES}
${r.ZB}
${r.tZ}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + mod(float(i), 3.) * .3;
  float c = .8 + mod(float(i + 1), 4.) * 0.25;

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 shape_uv = v_objectUV;
  shape_uv += .5;

  vec2 grainUV = v_objectUV;
  // apply inverse transform to grain_uv so it respects the originXY
  float grainUVRot = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(grainUVRot), sin(grainUVRot), -sin(grainUVRot), cos(grainUVRot));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
  grainUV = transpose(graphicRotation) * grainUV;
  grainUV *= u_scale;
  grainUV *= .7;
  grainUV -= graphicOffset;
  grainUV *= v_objectBoxSize;
  
  float grain = noise(grainUV, vec2(0.));
  float mixerGrain = .4 * u_grainMixer * (grain - .5);

  const float firstFrameOffset = 41.5;
  float t = .5 * (u_time + firstFrameOffset);

  float radius = smoothstep(0., 1., length(shape_uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    shape_uv.x += u_distortion * center / i * sin(t + i * .4 * smoothstep(.0, 1., shape_uv.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., shape_uv.y));
    shape_uv.y += u_distortion * center / i * cos(t + i * 2. * smoothstep(.0, 1., shape_uv.x));
  }

  vec2 uvRotated = shape_uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  for (int i = 0; i < ${a.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, t) + mixerGrain;
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= totalWeight;
  opacity /= totalWeight;

  float rr = noise(rotate(grainUV, 1.), vec2(3.));
  float gg = noise(rotate(grainUV, 2.) + 10., vec2(-1.));
  float bb = noise(grainUV - 2., vec2(5.));
  vec3 grainColor = vec3(rr, gg, bb);
  color = mix(color, grainColor, .01 + .3 * u_grainOverlay);
  
  fragColor = vec4(color, opacity);
}
`},68305:(e,t,i)=>{function o(e){if(Array.isArray(e))return 4===e.length?e:3===e.length?[...e,1]:a;if("string"!=typeof e)return a;let t,i,o,n=1;if(e.startsWith("#"))[t,i,o,n]=function(e){3===(e=e.replace(/^#/,"")).length&&(e=e.split("").map(e=>e+e).join("")),6===e.length&&(e+="ff");let t=parseInt(e.slice(0,2),16)/255,i=parseInt(e.slice(2,4),16)/255;return[t,i,parseInt(e.slice(4,6),16)/255,parseInt(e.slice(6,8),16)/255]}(e);else if(e.startsWith("rgb"))[t,i,o,n]=function(e){let t=e.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??"0")/255,parseInt(t[2]??"0")/255,parseInt(t[3]??"0")/255,void 0===t[4]?1:parseFloat(t[4])]:[0,0,0,1]}(e);else{if(!e.startsWith("hsl"))return console.error("Unsupported color format",e),a;[t,i,o,n]=function(e){let t,i,o,[r,a,n,s]=e,l=r/360,u=a/100,c=n/100;if(0===a)t=i=o=c;else{let e=(e,t,i)=>(i<0&&(i+=1),i>1&&(i-=1),i<1/6)?e+(t-e)*6*i:i<.5?t:i<2/3?e+(t-e)*(2/3-i)*6:e,r=c<.5?c*(1+u):c+u-c*u,a=2*c-r;t=e(a,r,l+1/3),i=e(a,r,l),o=e(a,r,l-1/3)}return[t,i,o,s]}(function(e){let t=e.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??"0"),parseInt(t[2]??"0"),parseInt(t[3]??"0"),void 0===t[4]?1:parseFloat(t[4])]:[0,0,0,1]}(e))}return[r(t,0,1),r(i,0,1),r(o,0,1),r(n,0,1)]}i.d(t,{G:()=>o});let r=(e,t,i)=>Math.min(Math.max(e,t),i),a=[0,0,0,1]},75435:(e,t,i)=>{i.d(t,{q:()=>o});function o(e,t){for(let i in e){if("colors"===i){let i=Array.isArray(e.colors),o=Array.isArray(t.colors);if(!i||!o){if(!1===Object.is(e.colors,t.colors))return!1;continue}if(e.colors?.length!==t.colors?.length||!e.colors?.every((e,i)=>e===t.colors?.[i]))return!1;continue}if(!1===Object.is(e[i],t[i]))return!1}return!0}},78408:(e,t,i)=>{i.d(t,{Cs:()=>h,Sy:()=>x});var o=i(94065),r=i(2795),a=i(75435),n=i(92204),s=i(68305),l=i(45495),u=i(82901);let c={name:"Default",params:{...n.J7,speed:1,frame:0,colors:["#e0eaff","#241d9a","#f75092","#9f50d3"],distortion:.8,swirl:.1,grainMixer:0,grainOverlay:0}},f={name:"Purple",params:{...n.J7,speed:.6,frame:0,colors:["#aaa7d7","#3c2b8e"],distortion:1,swirl:1,grainMixer:0,grainOverlay:0}},p={name:"Beach",params:{...n.J7,speed:.1,frame:0,colors:["#bcecf6","#00aaff","#00f7ff","#ffd447"],distortion:.8,swirl:.35,grainMixer:0,grainOverlay:0}},h=[c,{name:"Ink",params:{...n.J7,speed:1,frame:0,colors:["#ffffff","#000000"],distortion:1,swirl:.2,rotation:90,grainMixer:0,grainOverlay:0}},f,p],x=(0,o.memo)(function({speed:e=c.params.speed,frame:t=c.params.frame,colors:i=c.params.colors,distortion:o=c.params.distortion,swirl:a=c.params.swirl,grainMixer:f=c.params.grainMixer,grainOverlay:p=c.params.grainOverlay,fit:h=c.params.fit,rotation:x=c.params.rotation,scale:g=c.params.scale,originX:v=c.params.originX,originY:d=c.params.originY,offsetX:m=c.params.offsetX,offsetY:_=c.params.offsetY,worldWidth:S=c.params.worldWidth,worldHeight:b=c.params.worldHeight,...B}){let R={u_colors:i.map(s.G),u_colorsCount:i.length,u_distortion:o,u_swirl:a,u_grainMixer:f,u_grainOverlay:p,u_fit:n.Tk[h],u_rotation:x,u_scale:g,u_offsetX:m,u_offsetY:_,u_originX:v,u_originY:d,u_worldWidth:S,u_worldHeight:b};return(0,u.jsx)(r.f,{...B,speed:e,frame:t,fragmentShader:l.b,uniforms:R})},a.q)},92204:(e,t,i)=>{i.d(t,{A1:()=>n,DF:()=>r,J7:()=>l,OZ:()=>u,O_:()=>o,SJ:()=>s,Tk:()=>c,sy:()=>a});let o=`
in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_patternUV;
in vec2 v_imageUV;`,r=`
in vec2 v_objectBoxSize;
in vec2 v_objectHelperBox;
in vec2 v_responsiveBoxSize;
in vec2 v_responsiveHelperBox;
in vec2 v_patternBoxSize;
in vec2 v_patternHelperBox;`,a=`
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;`,n=`

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  #ifdef USE_PIXELIZATION
    float pxSize = u_pxSize * u_pixelRatio;
    vec2 pxSizeUv = gl_FragCoord.xy;
    pxSizeUv -= .5 * u_resolution;
    pxSizeUv /= pxSize;
    uv = floor(pxSizeUv) * pxSize / u_resolution.xy;    
    uv += .5;
  #endif
  uv -= .5;

  
  // ===================================================
  // sizing params shared between objects and patterns
  
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  
  // ===================================================
  // Sizing api for objects (graphics with fixed ratio)

  #ifdef USE_OBJECT_SIZING
    float fixedRatio = 1.;
    vec2 fixedRatioBoxGivenSize = vec2(
      (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
      (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
    );
    vec2 objectBoxSize = vec2(0.);
    // fit = none
    objectBoxSize.x = fixedRatio * min(fixedRatioBoxGivenSize.x / fixedRatio, fixedRatioBoxGivenSize.y);
    if (u_fit == 1.) { // fit = contain
      objectBoxSize.x = fixedRatio * min(u_resolution.x / fixedRatio, u_resolution.y);
    } else if (u_fit == 2.) {  // fit = cover
      objectBoxSize.x = fixedRatio * max(u_resolution.x / fixedRatio, u_resolution.y);
    }
    objectBoxSize.y = objectBoxSize.x / fixedRatio;
    vec2 objectWorldScale = u_resolution.xy / objectBoxSize;
  
    #ifdef ADD_HELPERS
      vec2 objectHelperBox = gl_FragCoord.xy / u_resolution.xy;
      objectHelperBox -= .5;
      objectHelperBox *= objectWorldScale;
      objectHelperBox += boxOrigin * (objectWorldScale - 1.);  
    #endif
  
    vec2 objectUV = uv;
    objectUV *= objectWorldScale;
    objectUV += boxOrigin * (objectWorldScale - 1.);
    objectUV += vec2(-u_offsetX, u_offsetY);
    objectUV /= u_scale;
    objectUV = graphicRotation * objectUV;
  #endif
  
  // ===================================================
 
  // ===================================================
  // Sizing api for patterns (graphics respecting u_worldWidth / u_worldHeight ratio)
  
  #ifdef USE_PATTERN_SIZING
    float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
    vec2 patternBoxGivenSize = vec2(
      (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
      (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
    );
    vec2 patternBoxSize = vec2(0.);
    // fit = none
    patternBoxSize.x = patternBoxRatio * min(patternBoxGivenSize.x / patternBoxRatio, patternBoxGivenSize.y);
    float patternWorldNoFitBoxWidth = patternBoxSize.x;
    if (u_fit == 1.) {  // fit = contain
      patternBoxSize.x = patternBoxRatio * min(u_resolution.x / patternBoxRatio, u_resolution.y);
    } else if (u_fit == 2.) {  // fit = cover
      patternBoxSize.x = patternBoxRatio * max(u_resolution.x / patternBoxRatio, u_resolution.y);
    }
    patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
    vec2 patternWorldScale = u_resolution.xy / patternBoxSize;
  
    #ifdef ADD_HELPERS  
      vec2 patternHelperBox = gl_FragCoord.xy / u_resolution.xy;
      patternHelperBox -= .5;
      patternHelperBox *= patternWorldScale;
      patternHelperBox += boxOrigin * (patternWorldScale - 1.);  
    #endif
  
    vec2 patternUV = uv;
    patternUV += vec2(-u_offsetX, u_offsetY) / patternWorldScale;
    patternUV += boxOrigin;
    patternUV -= boxOrigin / patternWorldScale;
    patternUV *= u_resolution.xy;
    patternUV /= u_pixelRatio;
    if (u_fit > 0.) {
      patternUV *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
    }
    patternUV /= u_scale;
    patternUV = graphicRotation * patternUV;
    patternUV += boxOrigin / patternWorldScale;
    patternUV -= boxOrigin;
    patternUV += .5;
  #endif
    
  // ===================================================
 
  // ===================================================
  // Sizing api for image filters
  
  #ifdef USE_IMAGE_SIZING

    vec2 imageBoxSize;
    if (u_fit == 1.) { // contain
      imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
    } else if (u_fit == 2.) { // cover
      imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
    } else {
      imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
    }
    imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
    vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

    #ifdef ADD_HELPERS
      vec2 imageHelperBox = uv;
      imageHelperBox *= imageBoxScale;
      imageHelperBox += boxOrigin * (imageBoxScale - 1.);
    #endif

    vec2 imageUV = uv;
    imageUV *= imageBoxScale;
    imageUV += boxOrigin * (imageBoxScale - 1.);
    imageUV += graphicOffset;
    imageUV /= u_scale;
    imageUV.x *= u_imageAspectRatio;
    imageUV = graphicRotation * imageUV;
    imageUV.x /= u_imageAspectRatio;
    
    imageUV += .5;
    imageUV.y = 1. - imageUV.y;
  #endif
`,s=`
  vec2 worldBoxDist = abs(helperBox);
  float boxStroke = (step(max(worldBoxDist.x, worldBoxDist.y), .5) - step(max(worldBoxDist.x, worldBoxDist.y), .495));
  color.rgb = mix(color.rgb, vec3(1., 0., 0.), boxStroke);
  opacity += boxStroke;

  vec2 boxOriginCopy = vec2(.5 - u_originX, u_originY - .5);
  vec2 boxOriginDist = helperBox + boxOriginCopy;
  boxOriginDist.x *= (boxSize.x / boxSize.y);
  float boxOriginPoint = 1. - smoothstep(0., .05, length(boxOriginDist));
  
  vec2 graphicOriginPointDist = helperBox + vec2(-u_offsetX, u_offsetY);
  graphicOriginPointDist.x *= (boxSize.x / boxSize.y);
  float graphicOriginPoint = 1. - smoothstep(0., .05, length(graphicOriginPointDist));
  
  color.rgb = mix(color.rgb, vec3(0., 1., 0.), boxOriginPoint);
  opacity += boxOriginPoint;
  color.rgb = mix(color.rgb, vec3(0., 0., 1.), graphicOriginPoint);
  opacity += graphicOriginPoint;
`,l={fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},u={fit:"none",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},c={none:0,contain:1,cover:2}}}]);