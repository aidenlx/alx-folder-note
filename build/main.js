/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source visit the plugins github repository
*/

"use strict";var Oe=Object.create;var L=Object.defineProperty;var Ve=Object.getOwnPropertyDescriptor;var He=Object.getOwnPropertyNames;var _e=Object.getPrototypeOf,Re=Object.prototype.hasOwnProperty;var W=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports),We=(r,e)=>{for(var t in e)L(r,t,{get:e[t],enumerable:!0})},J=(r,e,t,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of He(e))!Re.call(r,n)&&n!==t&&L(r,n,{get:()=>e[n],enumerable:!(o=Ve(e,n))||o.enumerable});return r};var I=(r,e,t)=>(t=r!=null?Oe(_e(r)):{},J(e||!r||!r.__esModule?L(t,"default",{value:r,enumerable:!0}):t,r)),qe=r=>J(L({},"__esModule",{value:!0}),r);var q=W(re=>{var Ye=Object.create,S=Object.defineProperty,je=Object.getOwnPropertyDescriptor,ze=Object.getOwnPropertyNames,Be=Object.getPrototypeOf,Ke=Object.prototype.hasOwnProperty,ee=r=>S(r,"__esModule",{value:!0}),Xe=(r,e)=>{ee(r);for(var t in e)S(r,t,{get:e[t],enumerable:!0})},Ue=(r,e,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of ze(e))!Ke.call(r,o)&&o!=="default"&&S(r,o,{get:()=>e[o],enumerable:!(t=je(e,o))||t.enumerable});return r},Ge=r=>Ue(ee(S(r!=null?Ye(Be(r)):{},"default",r&&r.__esModule&&"default"in r?{get:()=>r.default,enumerable:!0}:{value:r,enumerable:!0})),r);Xe(re,{getApi:()=>te,isPluginEnabled:()=>$e});var kt=Ge(require("obsidian")),te=r=>{var e;return r?(e=r.app.plugins.plugins["obsidian-icon-shortcodes"])==null?void 0:e.api:window.IconSCAPIv0},$e=r=>te(r)!==void 0});var Y=W((St,ie)=>{"use strict";function m(r){if(typeof r!="string")throw new TypeError("Path must be a string. Received "+JSON.stringify(r))}function ne(r,e){for(var t="",o=0,n=-1,s=0,i,l=0;l<=r.length;++l){if(l<r.length)i=r.charCodeAt(l);else{if(i===47)break;i=47}if(i===47){if(!(n===l-1||s===1))if(n!==l-1&&s===2){if(t.length<2||o!==2||t.charCodeAt(t.length-1)!==46||t.charCodeAt(t.length-2)!==46){if(t.length>2){var a=t.lastIndexOf("/");if(a!==t.length-1){a===-1?(t="",o=0):(t=t.slice(0,a),o=t.length-1-t.lastIndexOf("/")),n=l,s=0;continue}}else if(t.length===2||t.length===1){t="",o=0,n=l,s=0;continue}}e&&(t.length>0?t+="/..":t="..",o=2)}else t.length>0?t+="/"+r.slice(n+1,l):t=r.slice(n+1,l),o=l-n-1;n=l,s=0}else i===46&&s!==-1?++s:s=-1}return t}function rt(r,e){var t=e.dir||e.root,o=e.base||(e.name||"")+(e.ext||"");return t?t===e.root?t+o:t+r+o:o}var w={resolve:function(){for(var e="",t=!1,o,n=arguments.length-1;n>=-1&&!t;n--){var s;n>=0?s=arguments[n]:(o===void 0&&(o=process.cwd()),s=o),m(s),s.length!==0&&(e=s+"/"+e,t=s.charCodeAt(0)===47)}return e=ne(e,!t),t?e.length>0?"/"+e:"/":e.length>0?e:"."},normalize:function(e){if(m(e),e.length===0)return".";var t=e.charCodeAt(0)===47,o=e.charCodeAt(e.length-1)===47;return e=ne(e,!t),e.length===0&&!t&&(e="."),e.length>0&&o&&(e+="/"),t?"/"+e:e},isAbsolute:function(e){return m(e),e.length>0&&e.charCodeAt(0)===47},join:function(){if(arguments.length===0)return".";for(var e,t=0;t<arguments.length;++t){var o=arguments[t];m(o),o.length>0&&(e===void 0?e=o:e+="/"+o)}return e===void 0?".":w.normalize(e)},relative:function(e,t){if(m(e),m(t),e===t||(e=w.resolve(e),t=w.resolve(t),e===t))return"";for(var o=1;o<e.length&&e.charCodeAt(o)===47;++o);for(var n=e.length,s=n-o,i=1;i<t.length&&t.charCodeAt(i)===47;++i);for(var l=t.length,a=l-i,d=s<a?s:a,c=-1,f=0;f<=d;++f){if(f===d){if(a>d){if(t.charCodeAt(i+f)===47)return t.slice(i+f+1);if(f===0)return t.slice(i+f)}else s>d&&(e.charCodeAt(o+f)===47?c=f:f===0&&(c=0));break}var p=e.charCodeAt(o+f),g=t.charCodeAt(i+f);if(p!==g)break;p===47&&(c=f)}var E="";for(f=o+c+1;f<=n;++f)(f===n||e.charCodeAt(f)===47)&&(E.length===0?E+="..":E+="/..");return E.length>0?E+t.slice(i+c):(i+=c,t.charCodeAt(i)===47&&++i,t.slice(i))},_makeLong:function(e){return e},dirname:function(e){if(m(e),e.length===0)return".";for(var t=e.charCodeAt(0),o=t===47,n=-1,s=!0,i=e.length-1;i>=1;--i)if(t=e.charCodeAt(i),t===47){if(!s){n=i;break}}else s=!1;return n===-1?o?"/":".":o&&n===1?"//":e.slice(0,n)},basename:function(e,t){if(t!==void 0&&typeof t!="string")throw new TypeError('"ext" argument must be a string');m(e);var o=0,n=-1,s=!0,i;if(t!==void 0&&t.length>0&&t.length<=e.length){if(t.length===e.length&&t===e)return"";var l=t.length-1,a=-1;for(i=e.length-1;i>=0;--i){var d=e.charCodeAt(i);if(d===47){if(!s){o=i+1;break}}else a===-1&&(s=!1,a=i+1),l>=0&&(d===t.charCodeAt(l)?--l===-1&&(n=i):(l=-1,n=a))}return o===n?n=a:n===-1&&(n=e.length),e.slice(o,n)}else{for(i=e.length-1;i>=0;--i)if(e.charCodeAt(i)===47){if(!s){o=i+1;break}}else n===-1&&(s=!1,n=i+1);return n===-1?"":e.slice(o,n)}},extname:function(e){m(e);for(var t=-1,o=0,n=-1,s=!0,i=0,l=e.length-1;l>=0;--l){var a=e.charCodeAt(l);if(a===47){if(!s){o=l+1;break}continue}n===-1&&(s=!1,n=l+1),a===46?t===-1?t=l:i!==1&&(i=1):t!==-1&&(i=-1)}return t===-1||n===-1||i===0||i===1&&t===n-1&&t===o+1?"":e.slice(t,n)},format:function(e){if(e===null||typeof e!="object")throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof e);return rt("/",e)},parse:function(e){m(e);var t={root:"",dir:"",base:"",ext:"",name:""};if(e.length===0)return t;var o=e.charCodeAt(0),n=o===47,s;n?(t.root="/",s=1):s=0;for(var i=-1,l=0,a=-1,d=!0,c=e.length-1,f=0;c>=s;--c){if(o=e.charCodeAt(c),o===47){if(!d){l=c+1;break}continue}a===-1&&(d=!1,a=c+1),o===46?i===-1?i=c:f!==1&&(f=1):i!==-1&&(f=-1)}return i===-1||a===-1||f===0||f===1&&i===a-1&&i===l+1?a!==-1&&(l===0&&n?t.base=t.name=e.slice(1,a):t.base=t.name=e.slice(l,a)):(l===0&&n?(t.name=e.slice(1,i),t.base=e.slice(1,a)):(t.name=e.slice(l,i),t.base=e.slice(l,a)),t.ext=e.slice(i,a)),l>0?t.dir=e.slice(0,l-1):n&&(t.dir="/"),t},sep:"/",delimiter:":",win32:null,posix:null};w.posix=w;ie.exports=w});var le=W(O=>{"use strict";Object.defineProperty(O,"__esModule",{value:!0});function se(r,e){if(e)return r;throw new Error("Unhandled discriminated union member: "+JSON.stringify(r))}O.assertNever=se;O.default=se});var yt={};We(yt,{default:()=>_});module.exports=qe(yt);var Et=require("obsidian");var Z;(function(r){r[r.Index=0]="Index",r[r.Inside=1]="Inside",r[r.Outside=2]="Outside"})(Z||(Z={}));var D=r=>{var e;return r?(e=r.app.plugins.plugins["folder-note-core"])===null||e===void 0?void 0:e.api:window.FolderNoteAPIv0};var Se=I(q()),R=require("obsidian");function y(r,e){let t=Object.keys(e).map(o=>Qe(r,o,e[o]));return t.length===1?t[0]:function(){t.forEach(o=>o())}}function Qe(r,e,t){let o=r[e],n=r.hasOwnProperty(e),s=t(o);return o&&Object.setPrototypeOf(s,o),Object.setPrototypeOf(i,s),r[e]=i,l;function i(...a){return s===o&&r[e]===i&&l(),s.apply(this,a)}function l(){r[e]===i&&(n?r[e]=o:delete r[e]),s!==o&&(s=o,Object.setPrototypeOf(i,o||Function))}}var A=require("obsidian"),Je={none:[],copy:["copy"],copyLink:["copy","link"],copyMove:["copy","move"],link:["link"],linkMove:["link","move"],move:["move"],all:["copy","link","move"],uninitialized:[]};function Ze(r,e){e&&function(t,o){if(o==="none")return!0;let n=Je[t.dataTransfer.effectAllowed];return!!n&&n.contains(o)}(r,e)&&(r.dataTransfer.dropEffect=e)}var et=()=>{let r=app.workspace.getLeavesOfType("markdown");return r.length>0?r[0].view:null},tt=r=>{let{getFolderNote:e}=r.CoreApi,t=()=>{let o=et();if(!o)return!1;let n=o.editMode??o.sourceMode;if(!n)throw new Error("Failed to patch clipboard manager: no edit view found");return r.register(y(n.clipboardManager.constructor.prototype,{handleDragOver:s=>function(i,...l){let{draggable:a}=this.app.dragManager;a&&!(A.Platform.isMacOS?i.shiftKey:i.altKey)&&a.file instanceof A.TFolder&&e(a.file)?(Ze(i,"link"),this.app.dragManager.setAction(i18next.t("interface.drag-and-drop.insert-link-here"))):s.call(this,i,...l)},handleDrop:s=>function(i,...l){let a=()=>s.call(this,i,...l),{draggable:d}=r.app.dragManager,c;return d?.type==="folder"&&d.file instanceof A.TFolder&&(c=e(d.file))&&(d.file=c,d.type="file"),a()}})),console.log("alx-folder-note: clipboard manager patched"),!0};r.app.workspace.onLayoutReady(()=>{if(!t()){let o=app.workspace.on("layout-change",()=>{t()&&app.workspace.offref(o)});r.registerEvent(o)}}),r.register(y(app.dragManager.constructor.prototype,{dragFolder:o=>function(n,s,i,...l){let a;if(a=e(s)){let d=app.getObsidianUrl(a);n.dataTransfer.setData("text/plain",d),n.dataTransfer.setData("text/uri-list",d)}return o.call(this,n,s,i,...l)}}))},oe=tt;var P=require("obsidian");var ue=require("obsidian");var j=I(Y()),ae=I(le()),v=require("obsidian"),de=(r,e)=>{let t=e.viewRegistry.getViewCreatorByType(r);return t?t(new v.WorkspaceLeaf(e)):null},z=r=>r.file instanceof v.TFolder;var ce=(r,e)=>{let{altKey:t,metaKey:o,ctrlKey:n,shiftKey:s}=r;switch(e){case"Mod":return v.Platform.isMacOS?o:n;case"Ctrl":return n;case"Meta":return o;case"Shift":return s;case"Alt":return t;default:(0,ae.default)(e)}};var N=class extends v.Notice{constructor(e,t,o){if(super(typeof e=="string"?e:"",o),this.noticeEl.addEventListener("click",t),typeof e=="function"){this.noticeEl.empty();let n=new DocumentFragment;e(n),this.noticeEl.append(n)}}};function fe(r){return r.titleEl??r.selfEl}function B(r){return r.titleInnerEl??r.innerEl}var pe=r=>{let{getFolderNote:e,getFolderNotePath:t,getNewFolderNote:o}=r.CoreApi;return async(n,s)=>{if(!n||ue.Platform.isMobile&&!r.settings.mobileClickToOpen||s.shiftKey||!(B(n)===s.target||B(n).contains(s.target))||n.view.fileBeingRenamed===n.file||s.type==="auxclick"&&s.button!==1)return!1;let i=n.file,l=s.type==="click"&&ce(s,r.settings.modifierForNewNote)||s.type==="auxclick"&&s.button===1;try{let a=e(i),d;return l&&!a&&(d=t(i))&&(a=await r.app.vault.create(d.path,o(i))),a?(await r.app.workspace.openLinkText(a.path,"",l||s.type==="auxclick",{active:!0}),r.settings.expandFolderOnClick&&n.collapsed&&await n.setCollapsed(!1),!0):!1}catch(a){return console.error(a),!1}}},ge=(r,e)=>{if(!r||r.view.fileBeingRenamed===r.file)return!1;let t=r.file;return r.view.folderNoteUtils?.folderFocus.toggleFocusFolder(t),!0};var he=require("obsidian");var me=require("obsidian"),h=class{constructor(e,t){this.plugin=e;this.fileExplorer=t}longPressRegistered=new WeakSet;get fncApi(){return this.plugin.CoreApi}get app(){return this.plugin.app}get files(){return this.fileExplorer.files}getAfItem=e=>this.fileExplorer.fileItems[e]??null;iterateItems=e=>Object.values(this.fileExplorer.fileItems).forEach(e);debouncers={};_execQueue(e){let{action:t,queue:o}=this.queues[e];o.size<=0||(o instanceof Set?o.forEach(n=>t(n)):o.forEach((n,s)=>t(s,...n)),o.clear())}execQueue(e){if(!Object.keys(this.queues).includes(e))return;(this.debouncers[e]??(this.debouncers[e]=(0,me.debounce)(()=>this._execQueue(e),200,!0)))()}};var K="is-active",k=class extends h{queues={};constructor(e,t){super(e,t);let{workspace:o}=e.app;this.handleActiveLeafChange(o.activeLeaf),e.registerEvent(o.on("active-leaf-change",this.handleActiveLeafChange.bind(this))),this.plugin.register(()=>this.activeFolder=null)}_activeFolder=null;set activeFolder(e){let t=o=>o&&this.fileExplorer.fileItems[o.path]?fe(this.fileExplorer.fileItems[o.path]):void 0;e?e!==this._activeFolder&&(t(this._activeFolder)?.removeClass(K),t(e)?.addClass(K)):t(this._activeFolder)?.removeClass(K),this._activeFolder=e}get activeFolder(){return this._activeFolder}handleActiveLeafChange(e){let t;e&&e.view instanceof he.MarkdownView&&(t=this.fncApi.getFolderFromNote(e.view.file))?this.activeFolder=t:this.activeFolder=null}};var Fe=require("obsidian");var ot="alx-focused-folder",nt="alx-folder-focus",T=class extends h{queues={};constructor(e,t){super(e,t);let{workspace:o}=e.app;this.plugin.register(()=>this.focusedFolder&&this.toggleFocusFolder(null)),[o.on("file-menu",(n,s)=>{!(s instanceof Fe.TFolder)||s.isRoot()||n.addItem(i=>i.setTitle("Toggle Focus").setIcon("crossed-star").onClick(()=>this.toggleFocusFolder(s)))})].forEach(this.plugin.registerEvent.bind(this.plugin))}_focusedFolder=null;get focusedFolder(){return this._focusedFolder?.folder??null}set focusedFolder(e){if(this._focusedFolder){let{folder:t,collapsedCache:o}=this._focusedFolder;t.collapsed!==o&&t.setCollapsed(o)}this._focusedFolder=e?{folder:e,collapsedCache:e.collapsed}:null,e&&e.collapsed&&(e.setCollapsed(!1),this.plugin.app.nextFrame(()=>{this.fileExplorer.tree.infinityScroll.compute(),this.fileExplorer.tree.infinityScroll.scrollIntoView(e)})),console.log("\xA72\xA7"),this.fileExplorer.navFileContainerEl.toggleClass(nt,!!e)}toggleFocusFolder(e){let t=e?this.getAfItem(e.path):null;this.focusedFolder&&this._focusFolder(this.focusedFolder,!0),t&&t.file.path===this.focusedFolder?.file.path?this.focusedFolder=null:(t&&this._focusFolder(t,!1),this.focusedFolder=t)}_focusFolder(e,t=!1){if(e.file.isRoot())throw new Error("Cannot focus on root dir");e.el.toggleClass(ot,!t)}};var X=I(Y()),b=require("obsidian");var U="alx-folder-icons",it="alx-folder-note",st="alx-folder-with-note",ve="alx-empty-folder",M=class extends h{constructor(e,t){super(e,t),this.initFolderMark(),this.plugin.settings.folderIcon&&this.initFolderIcon(),this.plugin.settings.hideCollapseIndicator&&this.initHideCollapseIndicator()}queues={mark:{queue:new Map,action:(e,t)=>{let o=this.getAfItem(e);if(!o){console.warn("no afitem found for path %s, escaping...",e);return}z(o)?(t===!!o.isFolderWithNote&&(o.el.toggleClass(st,!t),o.isFolderWithNote=t?void 0:!0,this.plugin.settings.hideCollapseIndicator&&o.el.toggleClass(ve,t?!1:o.file.children.length===1)),this._updateIcon(e,t,o)):t===!!o.isFolderNote&&(o.el.toggleClass(it,!t),o.isFolderNote=t?void 0:!0)}},changedFolder:{queue:new Set,action:e=>{let t=this.fncApi.getFolderNote(e);t&&this.getAfItem(e)?.el.toggleClass(ve,t.parent.children.length===1)}}};initFolderMark(){let{vault:e,metadataCache:t}=this.app;this.markAll(),[e.on("folder-note:create",(o,n)=>{this.setMark(o),this.setMark(n)}),e.on("folder-note:delete",(o,n)=>{this.setMark(o,!0),this.setMark(n,!0)}),e.on("folder-note:rename",()=>{}),e.on("folder-note:cfg-changed",()=>{this.markAll(!0),window.setTimeout(this.markAll,200)}),t.on("changed",o=>{let n;(n=this.fncApi.getFolderFromNote(o))&&this.setMark(n)})].forEach(this.plugin.registerEvent.bind(this.plugin))}setMark=(e,t=!1)=>{if(!e)return;let{queue:o}=this.queues.mark,n;e instanceof b.TAbstractFile?n=e.path:typeof e=="string"?n=e:n=e.file.path,o.set(n,[t]),this.execQueue("mark")};markAll=(e=!1)=>{this.iterateItems(t=>{z(t)&&!e?this.markFolderNote(t.file):e&&this.setMark(t,!0)})};markFolderNote=e=>{if(e instanceof b.TFolder&&e.isRoot())return!1;let{getFolderNote:t,getFolderFromNote:o}=this.fncApi,n=null;return e instanceof b.TFile?n=o(e):e instanceof b.TFolder&&(n=t(e)),n?(this.setMark(n),this.setMark(e)):this.setMark(e,!0),!!n};initFolderIcon(){document.body.toggleClass(U,this.plugin.settings.folderIcon);let{vault:e}=this.app,t=()=>{for(let o of this.foldersWithIcon)this.setMark(o)};[e.on("iconsc:initialized",t),e.on("iconsc:changed",t)].forEach(this.plugin.registerEvent.bind(this.plugin))}foldersWithIcon=new Set;_updateIcon(e,t,o){let n=this.plugin.IconSCAPI;if(!n)return;let s,i,l=()=>{delete o.el.dataset.icon,delete o.el.dataset["icon-type"],this.foldersWithIcon.delete(e),o.el.style.removeProperty("--alx-folder-icon-txt"),o.el.style.removeProperty("--alx-folder-icon-url")};if(t)l();else if((s=this.fncApi.getFolderNotePath(e)?.path)&&(i=this.plugin.app.metadataCache.getCache(s))){let a=i.frontmatter?.icon,d;a&&typeof a=="string"&&(d=n.getIcon(a,!0))?(this.foldersWithIcon.add(e),o.el.dataset.icon=a.replace(/^:|:$/g,""),n.isEmoji(a)?(o.el.dataset.iconType="emoji",o.el.style.setProperty("--alx-folder-icon-url",'""'),o.el.style.setProperty("--alx-folder-icon-txt",`"${d}"`)):(o.el.dataset.iconType="svg",o.el.style.setProperty("--alx-folder-icon-url",`url("${d}")`),o.el.style.setProperty("--alx-folder-icon-txt",'"  "'))):o.el.dataset.icon&&l()}}initHideCollapseIndicator(){if(!this.plugin.settings.hideCollapseIndicator)return;let{vault:e}=this.app;[e.on("create",t=>this.setChangedFolder(t.parent.path)),e.on("delete",t=>{let o=(0,X.dirname)(t.path);this.setChangedFolder(o==="."?"/":o)}),e.on("rename",(t,o)=>{this.setChangedFolder(t.parent.path);let n=(0,X.dirname)(o);this.setChangedFolder(n==="."?"/":n)})].forEach(this.plugin.registerEvent.bind(this.plugin))}setChangedFolder=e=>{!e||e==="/"||(this.queues.changedFolder.queue.add(e),this.execQueue("changedFolder"))}};var lt=(r,e)=>({plugin:r,folderFocus:new T(r,e),folderMark:new M(r,e),activeFolder:new k(r,e)}),ye=lt;var we=require("obsidian");var G=null,at=0,dt=0;var ct=(r,e)=>{let t=new Date().getTime(),o={},n=()=>{new Date().getTime()-t>=e?r():o.value=requestAnimationFrame(n)};return o.value=requestAnimationFrame(n),o},ft=r=>{r&&cancelAnimationFrame(r.value)},F=()=>{ft(G),G=null},ut=r=>{if(F(),!r.target?.dispatchEvent(new CustomEvent("long-press",{bubbles:!0,cancelable:!0,detail:{clientX:r.clientX,clientY:r.clientY},clientX:r.clientX,clientY:r.clientY,offsetX:r.offsetX,offsetY:r.offsetY,pageX:r.pageX,pageY:r.pageY,screenX:r.screenX,screenY:r.screenY}))){let t=o=>{x?.removeEventListener("click",t,!0),gt(o)};x?.addEventListener("click",t,!0)}},pt=r=>{F();let e=r.target,t=parseInt(mt(e,"data-long-press-delay","800"),10);G=ct(ut.bind(e,r),t)},gt=r=>{r.stopImmediatePropagation(),r.preventDefault(),r.stopPropagation()},xe=r=>{at=r.clientX,dt=r.clientY,pt(r)},Ce=r=>{F()},mt=(r,e,t)=>{for(;r instanceof Element&&r!==document.documentElement;){let o=r.getAttribute(e);if(o)return o;r=r.parentNode}return t},x,be=r=>{x=null,r.removeEventListener("pointerup",F,!0),r.removeEventListener("drag",Ce,!0),r.removeEventListener("wheel",F,!0),r.removeEventListener("scroll",F,!0),r.removeEventListener("pointerdown",xe,!0)},ht=(r,e)=>{!r.settings.longPressFocus||we.Platform.isMobile||(x&&be(x),x=e,e.addEventListener("pointerup",F,!0),e.addEventListener("drag",Ce,!0),e.addEventListener("wheel",F,!0),e.addEventListener("scroll",F,!0),e.addEventListener("pointerdown",xe,!0),r.register(()=>be(e)))},Ee=ht;var Ie=(r,e)=>{let t=e.files.get(r);return t instanceof P.TFolder?e.fileItems[t.path]:null},Ae=(r,e)=>{let t=r.relatedTarget;return!(t instanceof Node&&e.contains(t))},Ne=async r=>{for(let e of r.app.workspace.getLeavesOfType("file-explorer")){let t=e.getViewState();await e.setViewState({type:"empty"}),e.setViewState(t)}},Ft=r=>{let{getFolderFromNote:e}=r.CoreApi,t=pe(r),o=de("file-explorer",r.app),n=r.app.internalPlugins.plugins["file-explorer"]?.instance;if(!o||!n)return;let s=o.constructor,i=n.constructor,l=o.createFolderDom(r.app.vault.getRoot()).constructor;o=null;let a=[y(s.prototype,{load:d=>function(){let c=this;d.call(c),c.folderNoteUtils=ye(r,c),Ee(r,c.navFileContainerEl),c.containerEl.on("auxclick",".nav-folder",(f,p)=>{let g=Ie(p,c);g&&t(g,f)}),c.containerEl.on("long-press",".nav-folder",(f,p)=>{let g=Ie(p,c);g&&ge(g,f)})},onFileMouseover:d=>function(c,f){if(d.call(this,c,f),!Ae(c,f))return;let p=this.currentHoverFile;if(!p||this._AFN_HOVER&&this._AFN_HOVER===p||!(p instanceof P.TFolder))return;let g=r.CoreApi.getFolderNote(p);g&&this.app.workspace.trigger("hover-link",{event:c,source:"file-explorer",hoverParent:this,targetEl:f,linktext:g.path}),this._AFN_HOVER=p},onFileMouseout:d=>function(c,f){d.call(this,c,f),Ae(c,f)&&delete this._AFN_HOVER}}),y(i.prototype,{revealInFolder:d=>function(c){if(c instanceof P.TFile&&r.settings.hideNoteInExplorer){let f=e(c);f&&(c=f)}return d.call(this,c)}}),y(l.prototype,{onTitleElClick:d=>async function(c){await t(this,c)||d.call(this,c)},onSelfClick:d=>async function(c){await t(this,c)||d.call(this,c)}})];Ne(r),r.register(()=>{a.forEach(d=>d()),Ne(r)})},ke=Ft;var C=require("obsidian"),vt=r=>{let{workspace:e,vault:t,fileManager:o}=r.app,n=async(s,i)=>{s&&await o.processFrontMatter(i,l=>{l.icon=s.id})};r.addCommand({id:"set-folder-icon",name:"Set Folder Icon",checkCallback:s=>{let i=r.IconSCAPI;if(!i)return!1;let l=e.getActiveViewOfType(C.MarkdownView);if(!l||!r.CoreApi.getFolderFromNote(l.file))return!1;if(s)return!0;i.getIconFromUser().then(d=>n(d,l.file))}}),r.registerEvent(e.on("file-menu",(s,i,l)=>{let a=r.IconSCAPI;if(!a)return;let d;if(i instanceof C.TFolder&&(d=r.CoreApi.getFolderNote(i))||i instanceof C.TFile&&(d=i,r.CoreApi.getFolderFromNote(i))){let c=d;s.addItem(f=>f.setIcon("image-glyph").setTitle("Set Folder Icon").onClick(async()=>n(await a.getIconFromUser(),c)))}}))},Te=vt;var Me=I(q()),u=require("obsidian");var $="alx-no-hide-note",Q="alx-no-click-on-mobile",Pe={modifierForNewNote:"Mod",hideNoteInExplorer:!0,hideCollapseIndicator:!1,longPressFocus:!1,folderIcon:!0,folderNotePref:null,deleteOutsideNoteWithFolder:null,indexName:null,autoRename:null,folderNoteTemplate:null,mobileClickToOpen:!0,longPressDelay:800,expandFolderOnClick:!1},V=["folderNotePref","deleteOutsideNoteWithFolder","indexName","autoRename","folderNoteTemplate"],H=class extends u.PluginSettingTab{plugin;constructor(e,t){super(e,t),this.plugin=t}checkMigrated(){return V.every(e=>this.plugin.settings[e]===null)}getInitGuide(e,t,o){return new u.Setting(o).setDesc(e+"use the buttons to install & enable it then reload alx-folder-note to take effects").addButton(n=>n.setIcon("down-arrow-with-tail").setTooltip("Go to Plugin Page").onClick(()=>window.open(`obsidian://show-plugin?id=${t}`))).addButton(n=>n.setIcon("reset").setTooltip("Reload alx-folder-note").onClick(async()=>{await this.app.plugins.disablePlugin(this.plugin.manifest.id),await this.app.plugins.enablePlugin(this.plugin.manifest.id),this.app.setting.openTabById(this.plugin.manifest.id)}))}display(){let{containerEl:e}=this;e.empty(),new u.Setting(e).setHeading().setName("Core");try{this.plugin.CoreApi,this.checkMigrated()?this.plugin.CoreApi.renderCoreSettings(e):this.setMigrate()}catch{this.getInitGuide("Seems like Folder Note Core is not enabled, ","folder-note-core",e);return}this.setFolderIcon(),this.setModifier(),this.setHide(),this.addToggle(this.containerEl,"expandFolderOnClick").setName("Expand Folder on Click").setDesc("Expand collapsed folders with note while opening them by clicking on folder title"),this.setMobile(),this.setFocus(),new u.Setting(e).setHeading().setName("Folder Overview");let t=this.app.plugins.plugins["alx-folder-note-folderv"];t?.renderFoldervSettings?t.renderFoldervSettings(e):this.getInitGuide("Folder Overview (folderv) is now an optional component, ","alx-folder-note-folderv",e),new u.Setting(e).setHeading().setName("Debug"),this.plugin.CoreApi.renderLogLevel(e)}setMigrate(){new u.Setting(this.containerEl).setName("Migrate settings to Folder Note Core").setDesc("Some settings has not been migrated to Folder Note Core, click Migrate to migrate old config or Cancel to use config in Folder Note Core in favor of old config").addButton(e=>e.setButtonText("Migrate").onClick(async()=>{let t=V.reduce((o,n)=>(o[n]=this.plugin.settings[n]??void 0,o),{});this.plugin.CoreApi.importSettings(t),V.forEach(o=>this.plugin.settings[o]=null),await this.plugin.saveSettings(),this.display()})).addButton(e=>e.setButtonText("Cancel").onClick(async()=>{V.forEach(t=>this.plugin.settings[t]=null),await this.plugin.saveSettings(),this.display()}))}setMobile(){u.Platform.isMobile&&this.addToggle(this.containerEl,"mobileClickToOpen",e=>document.body.toggleClass(Q,!e)).setName("Click folder title to open folder note on mobile").setDesc("Disable this if you want to the default action. You can still use context menu to open folder note")}setModifier=()=>{new u.Setting(this.containerEl).setName("Modifier for New Note").setDesc("Choose a modifier to click folders with to create folder notes").addDropdown(e=>{let t={Mod:"Ctrl (Cmd in macOS)",Ctrl:"Ctrl (Ctrl in macOS)",Meta:"\u229E Win",Alt:"Alt"},o={Mod:"\u2318 Cmd (Ctrl in Windows)",Ctrl:"\u2303 Control",Meta:"\u2318 Cmd (Win in Windows)",Alt:"\u2325 Option"},n=u.Platform.isMacOS?o:t;e.addOptions(n).setValue(this.plugin.settings.modifierForNewNote).onChange(async s=>{this.plugin.settings.modifierForNewNote=s,await this.plugin.saveSettings()})})};setHide(){this.addToggle(this.containerEl,"hideNoteInExplorer",e=>document.body.toggleClass($,!e)).setName("Hide Folder Note").setDesc("Hide folder note files from file explorer"),this.addToggle(this.containerEl,"hideCollapseIndicator").setName("Hide Collapse Indicator").setDesc("Hide collapse indicator when folder contains only folder note, reload obsidian to take effects")}setFolderIcon(){this.addToggle(this.containerEl,"folderIcon",e=>document.body.toggleClass(U,e)).setName("Set Folder Icon in Folder Notes").setDesc(createFragment(e=>{e.appendText("Set `icon` field with icon shortcode in frontmatter of foler note to specify linked folder's icon"),e.createEl("br"),e.createEl("a",{href:"https://github.com/aidenlx/obsidian-icon-shortcodes",text:"Icon Shortcodes v0.5.1+"}),e.appendText(" Required. "),(0,Me.getApi)(this.plugin)||e.appendText("(Currently not enabled)"),e.createEl("br"),e.appendText("Restart obsidian to take effects")}))}setFocus(){new u.Setting(this.containerEl).setHeading().setName("Focus").setDesc(`You can use "Toggle Focus" option in folder context menu${u.Platform.isMobile?"":" or long press on folder title"} to focus on a specific folder`),u.Platform.isMobile||this.addToggle(this.containerEl,"longPressFocus").setName("Long Press on Folder to Focus").setDesc("Long press with mouse on folder name inside file explorer to focus the folder. Only work on Desktop, reload obsidian to take effects"),new u.Setting(this.containerEl).addText(e=>{Object.assign(e.inputEl,{type:"number",min:"0.2",step:"0.1",required:!0}),e.inputEl.addClass("input-short"),e.inputEl.insertAdjacentElement("afterend",createSpan({cls:["validity","unit"],text:"second(s)"})),e.setValue(`${this.plugin.longPressDelay/1e3}`).onChange(async t=>{let o=+t*1e3;this.plugin.longPressDelay=o,await this.plugin.saveSettings()})}).setName("Long Press Delay")}addToggle(e,t,o){return new u.Setting(e).addToggle(n=>{n.setValue(this.plugin.settings[t]).onChange(s=>(this.plugin.settings[t]=s,o&&o(s),this.plugin.saveSettings()))})}};var Le="foldervNotified",_=class extends R.Plugin{settings=Pe;get CoreApi(){let e,t=D(this)||D();if(t)return t;throw e="Failed to initialize alx-folder-note",new N(e+": Click here for more details",()=>this.app.setting.openTabById(this.manifest.id)),new Error(e+": folder-note-core not available")}get IconSCAPI(){return this.settings.folderIcon?(0,Se.getApi)(this):null}noticeFoldervChange(){!this.app.plugins.plugins["alx-folder-note-folderv"]&&!Number(localStorage.getItem(Le))&&new N(e=>{e.appendText("Since v0.13.0, folder overview (folderv) has become an optional component that requires a dedicated plugin, "),e.createEl("button",{text:"Go to Folder Overview Section of the Setting Tab to Install"}).addEventListener("click",()=>this.app.setting.openTabById(this.manifest.id)),e.createEl("button",{text:"Don't show this again"})},()=>localStorage.setItem(Le,"1"),5e3)}initialized=!1;initialize(){this.initialized||(ke(this),document.body.toggleClass(Q,!this.settings.mobileClickToOpen),document.body.toggleClass($,!this.settings.hideNoteInExplorer),this.initialized=!0)}async onload(){console.log("loading alx-folder-note"),await this.loadSettings();let e=new H(this.app,this);e.checkMigrated()||new R.Notice(`Old config not yet migrated, 
Open Settings Tab of ALx Folder Note for details`),this.addSettingTab(e);let t=!1,o=()=>{t=!0,Te(this),this.app.workspace.onLayoutReady(this.initialize.bind(this)),oe(this),this.noticeFoldervChange()};if(D(this))o();else if(this.app.plugins.enabledPlugins.has("folder-note-core")){let n=window.setTimeout(()=>{if(!t)throw this.app.vault.offref(s),new Error("folder-note-core enabled but fail to load within 5s")},5e3),s=this.app.vault.on("folder-note:api-ready",()=>{o(),n&&window.clearTimeout(n),this.app.vault.offref(s)})}else this.CoreApi}async loadSettings(){this.settings={...this.settings,...await this.loadData()},this.setupLongPressDelay()}async saveSettings(){await this.saveData(this.settings)}get longPressDelay(){return this.settings.longPressDelay}set longPressDelay(e){this.settings.longPressDelay=e,document.body.dataset[De]=`${e}`}setupLongPressDelay(){this.longPressDelay=this.longPressDelay,this.register(()=>delete document.body.dataset[De])}},De="longPressDelay";
/*!
 * long-press-event
 * Pure JavaScript long-press-event
 * https://github.com/john-doherty/long-press-event
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */