import*as e from"../../../ui/lit-html/lit-html.js";import*as t from"../../../ui/legacy/legacy.js";import*as i from"../../../core/i18n/i18n.js";import*as s from"../../../ui/components/buttons/buttons.js";import*as r from"../../../ui/components/helpers/helpers.js";import*as o from"../../../ui/components/icon_button/icon_button.js";import*as n from"../../../ui/components/input/input.js";import*as a from"../models/models.js";import*as l from"../../../core/host/host.js";import*as d from"../../../core/platform/platform.js";import*as c from"../../../core/sdk/sdk.js";import*as p from"../../../third_party/codemirror.next/codemirror.next.js";import*as h from"../../../ui/components/code_highlighter/code_highlighter.js";import"../../../ui/components/dialogs/dialogs.js";import*as u from"../../../ui/components/menus/menus.js";import*as g from"../../../ui/components/split_view/split_view.js";import*as m from"../../../ui/components/text_editor/text_editor.js";import*as v from"../extensions/extensions.js";import*as b from"../../../ui/components/panel_feedback/panel_feedback.js";import*as f from"../../../ui/components/panel_introduction_steps/panel_introduction_steps.js";import*as y from"../../../ui/components/suggestion_input/suggestion_input.js";import*as w from"../controllers/controllers.js";import*as S from"../util/util.js";const x=new CSSStyleSheet;x.replaceSync('*{margin:0;padding:0;box-sizing:border-box;font-size:inherit}.control{background:none;border:none;display:flex;flex-direction:column;align-items:center}.control[disabled]{filter:grayscale(100%);cursor:auto}.icon{display:flex;width:40px;height:40px;border-radius:50%;background:var(--sys-color-error-bright);margin-bottom:8px;position:relative;transition:background 200ms;justify-content:center;align-content:center;align-items:center}.icon::before{--override-white:#fff;box-sizing:border-box;content:"";display:block;width:14px;height:14px;border:1px solid var(--override-white);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background-color:var(--override-white)}.icon.square::before{border-radius:0}.icon.circle::before{border-radius:50%}.icon:hover{background:color-mix(in sRGB,var(--sys-color-error-bright),var(--sys-color-state-hover-on-prominent) 10%)}.icon:active{background:color-mix(in sRGB,var(--sys-color-error-bright),var(--sys-color-state-ripple-neutral-on-prominent) 16%)}.control[disabled] .icon:hover{background:var(--sys-color-error)}.label{font-size:12px;line-height:16px;text-align:center;letter-spacing:0.02em;color:var(--sys-color-on-surface)}\n/*# sourceURL=controlButton.css */\n');var $=self&&self.__decorate||function(e,t,i,s){var r,o=arguments.length,n=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(n=(o<3?r(n):o>3?r(t,i,n):r(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};const{html:k,Decorators:T,LitElement:E}=e,{customElement:R,property:C}=T;let N=class extends E{static styles=[x];constructor(){super(),this.label="",this.shape="square",this.disabled=!1}#e=e=>{this.disabled&&(e.stopPropagation(),e.preventDefault())};render(){return k`
            <button
                @click=${this.#e}
                .disabled=${this.disabled}
                class="control"
            >
                <div class="icon ${this.shape}"></div>
                <div class="label">${this.label}</div>
            </button>
        `}};$([C()],N.prototype,"label",void 0),$([C()],N.prototype,"shape",void 0),$([C()],N.prototype,"disabled",void 0),N=$([R("devtools-control-button")],N);var I=Object.freeze({__proto__:null,get ControlButton(){return N}});const M=new CSSStyleSheet;M.replaceSync('*{margin:0;padding:0;outline:none;box-sizing:border-box;font-size:inherit}.wrapper{padding:24px;flex:1}h1{font-size:18px;line-height:24px;letter-spacing:0.02em;color:var(--sys-color-on-surface);margin:0;font-weight:normal}.row-label{font-weight:500;font-size:11px;line-height:16px;letter-spacing:0.8px;text-transform:uppercase;color:var(--sys-color-secondary);margin-bottom:8px;margin-top:32px;display:flex;align-items:center;gap:3px}.footer{display:flex;justify-content:center;border-top:1px solid var(--sys-color-divider);padding:12px;background:var(--sys-color-cdt-base-container)}.controls{display:flex}.error{margin:16px 0 0;padding:8px;background:var(--sys-color-error-container);color:var(--sys-color-error)}.row-label .link:focus-visible{outline:var(--sys-color-state-focus-ring) auto 1px}.header-wrapper{display:flex;align-items:baseline;justify-content:space-between}.checkbox-label{display:inline-flex;align-items:center;overflow:hidden;text-overflow:ellipsis;gap:4px;line-height:1.1;padding:4px}.checkbox-container{display:flex;flex-flow:row wrap;gap:10px}input[type="checkbox"]:focus-visible{outline:var(--sys-color-state-focus-ring) auto 1px}devtools-icon[name="help"]{width:16px;height:16px}\n/*# sourceURL=createRecordingView.css */\n');const B={recordingName:"Recording name",startRecording:"Start recording",createRecording:"Create a new recording",recordingNameIsRequired:"Recording name is required",selectorAttribute:"Selector attribute",cancelRecording:"Cancel recording",selectorTypeCSS:"CSS",selectorTypePierce:"Pierce",selectorTypeARIA:"ARIA",selectorTypeText:"Text",selectorTypeXPath:"XPath",selectorTypes:"Selector types to record",includeNecessarySelectors:"You must choose CSS, Pierce, or XPath as one of your options. Only these selectors are guaranteed to be recorded since ARIA and text selectors may not be unique."},A=i.i18n.registerUIStrings("panels/recorder/components/CreateRecordingView.ts",B),P=i.i18n.getLocalizedString.bind(void 0,A);class O extends Event{static eventName="recordingstarted";name;selectorAttribute;selectorTypesToRecord;constructor(e,t,i){super(O.eventName,{}),this.name=e,this.selectorAttribute=i||void 0,this.selectorTypesToRecord=t}}class L extends Event{static eventName="recordingcancelled";constructor(){super(L.eventName)}}class F extends HTMLElement{static litTagName=e.literal`devtools-create-recording-view`;#t=this.attachShadow({mode:"open"});#i="";#s;#r;connectedCallback(){this.#t.adoptedStyleSheets=[M,n.textInputStyles,n.checkboxStyles],this.#o(),this.#t.querySelector("input")?.focus()}set data(e){this.#r=e.recorderSettings,this.#i=this.#r.defaultTitle}#n(e){this.#s&&(this.#s=void 0,this.#o());"Enter"===e.key&&(this.startRecording(),e.stopPropagation(),e.preventDefault())}startRecording(){const e=this.#t.querySelector("#user-flow-name");if(!e)throw new Error("input#user-flow-name not found");if(!this.#r)throw new Error("settings not set");if(!e.value.trim())return this.#s=new Error(P(B.recordingNameIsRequired)),void this.#o();const t=this.#t.querySelectorAll(".selector-type input[type=checkbox]"),i=[];for(const e of t){const t=e,s=t.value;t.checked&&i.push(s)}if(!i.includes(a.Schema.SelectorType.CSS)&&!i.includes(a.Schema.SelectorType.XPath)&&!i.includes(a.Schema.SelectorType.Pierce))return this.#s=new Error(P(B.includeNecessarySelectors)),void this.#o();for(const e of Object.values(a.Schema.SelectorType))this.#r.setSelectorByType(e,i.includes(e));const s=this.#t.querySelector("#selector-attribute").value.trim();this.#r.selectorAttribute=s,this.dispatchEvent(new O(e.value.trim(),i,s))}#a(){this.dispatchEvent(new L)}#l=()=>{this.#t.querySelector("#user-flow-name")?.select()};#o(){const t=new Map([[a.Schema.SelectorType.ARIA,P(B.selectorTypeARIA)],[a.Schema.SelectorType.CSS,P(B.selectorTypeCSS)],[a.Schema.SelectorType.Text,P(B.selectorTypeText)],[a.Schema.SelectorType.XPath,P(B.selectorTypeXPath)],[a.Schema.SelectorType.Pierce,P(B.selectorTypePierce)]]);e.render(e.html`
        <div class="wrapper">
          <div class="header-wrapper">
            <h1>${P(B.createRecording)}</h1>
            <${s.Button.Button.litTagName}
              title=${P(B.cancelRecording)}
              .data=${{variant:"round",size:"SMALL",iconName:"cross"}}
              @click=${this.#a}
            ></${s.Button.Button.litTagName}>
          </div>
          <label class="row-label" for="user-flow-name">${P(B.recordingName)}</label>
          <input
            value=${this.#i}
            @focus=${this.#l}
            @keydown=${this.#n}
            class="devtools-text-input"
            id="user-flow-name"
          />
          <label class="row-label" for="selector-attribute">
            <span>${P(B.selectorAttribute)}</span>
            <x-link class="link" href="https://g.co/devtools/recorder#selector">
              <${o.Icon.Icon.litTagName} name="help">
              </${o.Icon.Icon.litTagName}>
            </x-link>
          </label>
          <input
            value=${this.#r?.selectorAttribute}
            placeholder="data-testid"
            @keydown=${this.#n}
            class="devtools-text-input"
            id="selector-attribute"
          />
          <label class="row-label">
            <span>${P(B.selectorTypes)}</span>
            <x-link class="link" href="https://g.co/devtools/recorder#selector">
              <${o.Icon.Icon.litTagName} name="help">
              </${o.Icon.Icon.litTagName}>
            </x-link>
          </label>
          <div class="checkbox-container">
            ${Object.values(a.Schema.SelectorType).map((i=>{const s=this.#r?.getSelectorByType(i);return e.html`
                  <label class="checkbox-label selector-type">
                    <input
                      @keydown=${this.#n}
                      .value=${i}
                      checked=${e.Directives.ifDefined(s||void 0)}
                      type="checkbox"
                    />
                    ${t.get(i)||i}
                  </label>
                `}))}
          </div>

          ${this.#s&&e.html`
          <div class="error" role="alert">
            ${this.#s.message}
          </div>
        `}
        </div>
        <div class="footer">
          <div class="controls">
            <devtools-control-button
              @click=${this.startRecording}
              .label=${P(B.startRecording)}
              .shape=${"circle"}
              title=${a.Tooltip.getTooltipForActions(P(B.startRecording),"chrome_recorder.start-recording")}
            ></devtools-control-button>
          </div>
        </div>
      `,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-create-recording-view",F);var j=Object.freeze({__proto__:null,RecordingStartedEvent:O,RecordingCancelledEvent:L,CreateRecordingView:F});const D=new CSSStyleSheet;D.replaceSync("*{margin:0;padding:0;box-sizing:border-box;font-size:inherit}*:focus,\n*:focus-visible{outline:none}.wrapper{padding:24px}.header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}h1{font-size:16px;line-height:19px;color:var(--sys-color-on-surface);font-weight:normal}.icon,\n.icon devtools-icon{width:20px;height:20px;color:var(--sys-color-primary)}.table{margin-top:35px}.title{font-size:13px;color:var(--sys-color-on-surface);margin-left:10px;flex:1;overflow-x:hidden;white-space:nowrap;text-overflow:ellipsis}.row{display:flex;align-items:center;padding-right:5px;height:28px;border-bottom:1px solid var(--sys-color-divider)}.row:focus-within,\n.row:hover{background-color:var(--sys-color-state-hover-on-subtle)}.row:last-child{border-bottom:none}.actions{display:flex;align-items:center}.actions button{border:none;background-color:transparent;width:24px;height:24px;border-radius:50%}.actions .divider{width:1px;height:17px;background-color:var(--sys-color-divider);margin:0 6px}\n/*# sourceURL=recordingListView.css */\n");const z={savedRecordings:"Saved recordings",createRecording:"Create a new recording",playRecording:"Play recording",deleteRecording:"Delete recording",openRecording:"Open recording"},_=i.i18n.registerUIStrings("panels/recorder/components/RecordingListView.ts",z),V=i.i18n.getLocalizedString.bind(void 0,_);class U extends Event{static eventName="createrecording";constructor(){super(U.eventName)}}class G extends Event{storageName;static eventName="deleterecording";constructor(e){super(G.eventName),this.storageName=e}}class q extends Event{storageName;static eventName="openrecording";constructor(e){super(q.eventName),this.storageName=e}}class K extends Event{storageName;static eventName="playrecording";constructor(e){super(K.eventName),this.storageName=e}}class H extends HTMLElement{static litTagName=e.literal`devtools-recording-list-view`;#t=this.attachShadow({mode:"open"});#d={recordings:[],replayAllowed:!0};connectedCallback(){this.#t.adoptedStyleSheets=[D],r.ScheduledRender.scheduleRender(this,this.#o)}set recordings(e){this.#d.recordings=e,r.ScheduledRender.scheduleRender(this,this.#o)}set replayAllowed(e){this.#d.replayAllowed=e,r.ScheduledRender.scheduleRender(this,this.#o)}#c(){this.dispatchEvent(new U)}#p(e,t){t.stopPropagation(),this.dispatchEvent(new G(e))}#h(e,t){t.stopPropagation(),this.dispatchEvent(new q(e))}#u(e,t){t.stopPropagation(),this.dispatchEvent(new K(e))}#n(e,t){"Enter"===t.key&&this.#h(e,t)}#g(e){e.stopPropagation()}#o=()=>{e.render(e.html`
        <div class="wrapper">
          <div class="header">
            <h1>${V(z.savedRecordings)}</h1>
            <${s.Button.Button.litTagName}
              .variant=${"primary"}
              @click=${this.#c}
              title=${a.Tooltip.getTooltipForActions(V(z.createRecording),"chrome_recorder.create-recording")}
            >
              ${V(z.createRecording)}
            </${s.Button.Button.litTagName}>
          </div>
          <div class="table">
            ${this.#d.recordings.map((t=>e.html`
                  <div role="button" tabindex="0" aria-label=${V(z.openRecording)} class="row" @keydown=${this.#n.bind(this,t.storageName)} @click=${this.#h.bind(this,t.storageName)}>
                    <div class="icon">
                      <${o.Icon.Icon.litTagName} name="flow">
                      </${o.Icon.Icon.litTagName}>
                    </div>
                    <div class="title">${t.name}</div>
                    <div class="actions">
                      ${this.#d.replayAllowed?e.html`
                              <${s.Button.Button.litTagName}
                                title=${V(z.playRecording)}
                                .data=${{variant:"round",iconName:"play"}}
                                @click=${this.#u.bind(this,t.storageName)}
                                @keydown=${this.#g}
                              ></${s.Button.Button.litTagName}>
                              <div class="divider"></div>`:""}
                      <${s.Button.Button.litTagName}
                        class="delete-recording-button"
                        title=${V(z.deleteRecording)}
                        .data=${{variant:"round",iconName:"bin"}}
                        @click=${this.#p.bind(this,t.storageName)}
                        @keydown=${this.#g}
                      ></${s.Button.Button.litTagName}>
                    </div>
                  </div>
                `))}
          </div>
        </div>
      `,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-recording-list-view",H);var W=Object.freeze({__proto__:null,CreateRecordingEvent:U,DeleteRecordingEvent:G,OpenRecordingEvent:q,PlayRecordingEvent:K,RecordingListView:H});const X=new CSSStyleSheet;X.replaceSync("*{margin:0;padding:0;outline:none;box-sizing:border-box;font-size:inherit}.extension-view{display:flex;flex-direction:column;height:100%}main{flex:1}iframe{border:none;height:100%;width:100%}header{display:flex;padding:3px 8px;justify-content:space-between;border-bottom:1px solid var(--sys-color-divider)}header > div{align-self:center}.icon{display:block;width:16px;height:16px;color:var(--sys-color-secondary)}.title{display:flex;flex-direction:row;gap:6px;color:var(--sys-color-secondary);align-items:center;font-weight:500}\n/*# sourceURL=extensionView.css */\n");const Y={closeView:"Close",extension:"Content provided by a browser extension"},J=i.i18n.registerUIStrings("panels/recorder/components/ExtensionView.ts",Y),Q=i.i18n.getLocalizedString.bind(void 0,J);class Z extends Event{static eventName="recorderextensionviewclosed";constructor(){super(Z.eventName,{bubbles:!0,composed:!0})}}class ee extends HTMLElement{static litTagName=e.literal`devtools-recorder-extension-view`;#t=this.attachShadow({mode:"open"});#m;connectedCallback(){this.#t.adoptedStyleSheets=[X],this.#o()}disconnectedCallback(){this.#m&&v.ExtensionManager.ExtensionManager.instance().getView(this.#m.id).hide()}set descriptor(e){this.#m=e,this.#o(),v.ExtensionManager.ExtensionManager.instance().getView(e.id).show()}#v(){this.dispatchEvent(new Z)}#o(){if(!this.#m)return;const t=v.ExtensionManager.ExtensionManager.instance().getView(this.#m.id).frame();e.render(e.html`
        <div class="extension-view">
          <header>
            <div class="title">
              <${o.Icon.Icon.litTagName}
                class="icon"
                title=${Q(Y.extension)}
                name="extension">
              </${o.Icon.Icon.litTagName}>
              ${this.#m.title}
            </div>
            <${s.Button.Button.litTagName}
              title=${Q(Y.closeView)}
              .data=${{variant:"round",size:"TINY",iconName:"cross"}}
              @click=${this.#v}
            ></${s.Button.Button.litTagName}>
          </header>
          <main>
            ${t}
          <main>
      </div>
    `,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-recorder-extension-view",ee);const te=new CSSStyleSheet;te.replaceSync('*{padding:0;margin:0;box-sizing:border-box;font-size:inherit}.wrapper{display:flex;flex-direction:row;flex:1;height:100%}.main{overflow:hidden;display:flex;flex-direction:column;flex:1}.sections{flex:1;min-height:0;overflow:hidden auto;background-color:var(--sys-color-cdt-base-container);z-index:0;position:relative;container:sections/inline-size}.section{display:flex;padding:0 16px;gap:8px;position:relative}.section::after{content:"";border-bottom:1px solid var(--sys-color-divider);position:absolute;left:0;right:0;bottom:0;z-index:-1}.section:last-child{margin-bottom:70px}.section:last-child::after{content:none}.screenshot-wrapper{flex:0 0 80px;padding-top:32px;z-index:2}@container sections (max-width: 400px){.screenshot-wrapper{display:none}}.screenshot{object-fit:cover;object-position:top center;max-width:100%;width:200px;height:auto;border:1px solid var(--sys-color-divider);border-radius:1px}.content{flex:1;min-width:0}.steps{flex:1;position:relative;align-self:flex-start;overflow:visible}.step{position:relative;padding-left:40px;margin:16px 0}.step .action{font-size:13px;line-height:16px;letter-spacing:0.03em}.recording{color:var(--sys-color-primary);font-style:italic;margin-top:8px;margin-bottom:0}.add-assertion-button{margin-top:8px}.details{max-width:240px;display:flex;flex-direction:column;align-items:flex-end}.url{font-size:12px;line-height:16px;letter-spacing:0.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--sys-color-secondary);max-width:100%;margin-bottom:16px}.header{align-items:center;border-bottom:1px solid var(--sys-color-divider);display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;padding:16px}.header-title-wrapper{max-width:100%}.header-title{align-items:center;display:flex;flex:1;max-width:100%}.header-title::before{content:"";min-width:12px;height:12px;display:inline-block;background:var(--sys-color-primary);border-radius:50%;margin-right:7px}#title-input{box-sizing:content-box;font-family:inherit;font-size:18px;line-height:22px;letter-spacing:0.02em;padding:1px 4px;border:1px solid transparent;border-radius:1px;word-break:break-all}#title-input:hover{border-color:var(--input-outline)}#title-input.has-error{border-color:var(--sys-color-error)}#title-input.disabled{color:var(--sys-color-state-disabled)}.title-input-error-text{margin-top:4px;margin-left:19px;color:var(--sys-color-error)}.title-button-bar{padding-left:2px;display:flex}#title-input:focus + .title-button-bar{display:none}.settings-row{padding:16px 28px;border-bottom:1px solid var(--sys-color-divider);display:flex;flex-flow:row wrap;justify-content:space-between}.settings-title{font-size:14px;line-height:24px;letter-spacing:0.03em;color:var(--sys-color-on-surface);display:flex;align-items:center;align-content:center;gap:5px;width:fit-content}.settings{margin-top:4px;display:flex;font-size:12px;line-height:20px;letter-spacing:0.03em;color:var(--sys-color-on-surface-subtle)}.settings.expanded{gap:10px}.settings .separator{width:1px;height:20px;background-color:var(--sys-color-divider);margin:0 5px}.actions{display:flex;align-items:center;flex-wrap:wrap;gap:12px}.is-recording .header-title::before{background:var(--sys-color-error-bright)}.footer{display:flex;justify-content:center;border-top:1px solid var(--sys-color-divider);padding:12px;background:var(--sys-color-cdt-base-container);z-index:1}.controls{align-items:center;display:flex;justify-content:center;position:relative;width:100%}.chevron{width:14px;height:14px;transform:rotate(-90deg);color:var(--sys-color-on-surface)}.expanded .chevron{transform:rotate(0)}.editable-setting{display:flex;flex-direction:row;gap:12px;align-items:center}.editable-setting devtools-select-menu{height:32px}.editable-setting .devtools-text-input{width:fit-content}.wrapping-label{display:inline-flex;align-items:center;gap:12px}.text-editor{height:100%;overflow:auto}.section-toolbar{display:flex;align-items:center;padding:3px 5px;justify-content:space-between;gap:3px}.section-toolbar > devtools-select-menu{height:24px;min-width:50px}.sections .section-toolbar{justify-content:flex-end}devtools-split-view{flex:1 1 0%;min-height:0}[slot="sidebar"]{display:flex;flex-direction:column;overflow:auto;height:100%;width:100%}[slot="sidebar"] .section-toolbar{border-bottom:1px solid var(--sys-color-divider)}.show-code{margin-right:14px;margin-top:8px}devtools-recorder-extension-view{flex:1}\n/*# sourceURL=recordingView.css */\n');const ie=new CSSStyleSheet;ie.replaceSync('.select-button{display:flex;--override-button-no-right-border-radius:1}.select-button devtools-button{position:relative}.select-menu-item-content-with-icon{display:flex;align-items:center}.select-menu-item-content-with-icon::before{content:"";position:relative;left:0;top:0;background-color:var(--sys-color-on-surface);display:inline-block;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:center;-webkit-mask-position:center;width:24px;height:24px;margin-right:4px;mask-image:var(--item-mask-icon);-webkit-mask-image:var(--item-mask-icon)}devtools-select-menu{height:var(--override-select-menu-height,24px);border-radius:0 4px 4px 0;box-sizing:border-box;--override-select-menu-show-button-outline:var(--sys-color-state-focus-ring);--override-select-menu-label-with-arrow-padding:0;--override-select-menu-border:none;--override-select-menu-show-button-padding:0 6px 0 0}devtools-select-menu.primary{border:none;border-left:1px solid var(--override-icon-and-text-color);--override-icon-and-text-color:var(--sys-color-cdt-base-container);--override-select-menu-arrow-color:var(--override-icon-and-text-color);--override-divider-color:var(--override-icon-and-text-color);--override-select-menu-background-color:var(--sys-color-primary);--override-select-menu-active-background-color:var(\n      --override-select-menu-background-color\n    )}devtools-select-menu.primary:hover{--override-select-menu-background-color:color-mix(in sRGB,var(--sys-color-primary),var(--sys-color-state-hover-on-prominent) 10%)}devtools-select-menu[disabled].primary,\ndevtools-select-menu[disabled].primary:hover{--override-icon-and-text-color:var(--sys-color-state-disabled);--override-select-menu-background-color:var(--sys-color-cdt-base-container-elevation-1)}\n/*# sourceURL=selectButton.css */\n');class se extends Event{value;static eventName="selectbuttonclick";constructor(e){super(se.eventName,{bubbles:!0,composed:!0}),this.value=e}}class re extends HTMLElement{static litTagName=e.literal`devtools-select-button`;#t=this.attachShadow({mode:"open"});#d={disabled:!1,value:"",items:[],groups:[],variant:"primary"};connectedCallback(){this.#t.adoptedStyleSheets=[ie],r.ScheduledRender.scheduleRender(this,this.#o)}get disabled(){return this.#d.disabled}set disabled(e){this.#d.disabled=e,r.ScheduledRender.scheduleRender(this,this.#o)}get items(){return this.#d.items}set items(e){this.#d.items=e,r.ScheduledRender.scheduleRender(this,this.#o)}set groups(e){this.#d.groups=e,r.ScheduledRender.scheduleRender(this,this.#o)}get value(){return this.#d.value}set value(e){this.#d.value=e,r.ScheduledRender.scheduleRender(this,this.#o)}get variant(){return this.#d.variant}set variant(e){this.#d.variant=e,r.ScheduledRender.scheduleRender(this,this.#o)}set action(e){this.#d.action=e,r.ScheduledRender.scheduleRender(this,this.#o)}#b(e){e.stopPropagation(),this.dispatchEvent(new se(this.#d.value))}#f(e){this.dispatchEvent(new se(e.itemValue)),r.ScheduledRender.scheduleRender(this,this.#o)}#y(t,i){return e.html`
      <${u.Menu.MenuItem.litTagName} .value=${t.value} .selected=${t.value===i.value}>
        ${t.label()}
      </${u.Menu.MenuItem.litTagName}>
    `}#w(t,i){return e.html`
      <${u.Menu.MenuGroup.litTagName} .name=${t.name}>
        ${t.items.map((e=>this.#y(e,i)))}
      </${u.Menu.MenuGroup.litTagName}>
    `}#S(e){return this.#d.action?a.Tooltip.getTooltipForActions(e,this.#d.action):""}#o=()=>{const t=Boolean(this.#d.groups.length),i=t?this.#d.groups.flatMap((e=>e.items)):this.#d.items,r=i.find((e=>e.value===this.#d.value))||i[0];if(!r)return;const o={primary:"primary"===this.#d.variant,secondary:"secondary"===this.#d.variant},n="secondary"===this.#d.variant?"secondary":"primary",a=r.buttonLabel?r.buttonLabel():r.label();e.render(e.html`
      <div class="select-button" title=${this.#S(a)||e.nothing}>
        ${r?e.html`
        <${s.Button.Button.litTagName}
            .disabled=${this.#d.disabled}
            .variant=${n}
            .iconName=${r.buttonIconName}
            @click=${this.#b}>
            ${a}
        </${s.Button.Button.litTagName}>`:""}
        <${u.SelectMenu.SelectMenu.litTagName}
          class=${e.Directives.classMap(o)}
          @selectmenuselected=${this.#f}
          ?disabled=${this.#d.disabled}
          .showArrow=${!0}
          .sideButton=${!1}
          .showSelectedItem=${!0}
          .disabled=${this.#d.disabled}
          .buttonTitle=${e.html``}
          .position=${"bottom"}
          .horizontalAlignment=${"right"}
        >
          ${t?this.#d.groups.map((e=>this.#w(e,r))):this.#d.items.map((e=>this.#y(e,r)))}
        </${u.SelectMenu.SelectMenu.litTagName}>
      </div>`,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-select-button",re);var oe=Object.freeze({__proto__:null,SelectButtonClickEvent:se,SelectButton:re});const ne={ReplayNormalButtonLabel:"Replay",ReplayNormalItemLabel:"Normal (Default)",ReplaySlowButtonLabel:"Slow replay",ReplaySlowItemLabel:"Slow",ReplayVerySlowButtonLabel:"Very slow replay",ReplayVerySlowItemLabel:"Very slow",ReplayExtremelySlowButtonLabel:"Extremely slow replay",ReplayExtremelySlowItemLabel:"Extremely slow",speedGroup:"Speed",extensionGroup:"Extensions"},ae=[{value:"normal",buttonIconName:"play",buttonLabel:()=>ce(ne.ReplayNormalButtonLabel),label:()=>ce(ne.ReplayNormalItemLabel)},{value:"slow",buttonIconName:"play",buttonLabel:()=>ce(ne.ReplaySlowButtonLabel),label:()=>ce(ne.ReplaySlowItemLabel)},{value:"very_slow",buttonIconName:"play",buttonLabel:()=>ce(ne.ReplayVerySlowButtonLabel),label:()=>ce(ne.ReplayVerySlowItemLabel)},{value:"extremely_slow",buttonIconName:"play",buttonLabel:()=>ce(ne.ReplayExtremelySlowButtonLabel),label:()=>ce(ne.ReplayExtremelySlowItemLabel)}],le={normal:l.UserMetrics.RecordingReplaySpeed.Normal,slow:l.UserMetrics.RecordingReplaySpeed.Slow,very_slow:l.UserMetrics.RecordingReplaySpeed.VerySlow,extremely_slow:l.UserMetrics.RecordingReplaySpeed.ExtremelySlow},de=i.i18n.registerUIStrings("panels/recorder/components/ReplayButton.ts",ne),ce=i.i18n.getLocalizedString.bind(void 0,de);class pe extends Event{speed;extension;static eventName="startreplay";constructor(e,t){super(pe.eventName,{bubbles:!0,composed:!0}),this.speed=e,this.extension=t}}const he="extension";class ue extends HTMLElement{static litTagName=e.literal`devtools-replay-button`;#t=this.attachShadow({mode:"open"});#x=this.#o.bind(this);#d={disabled:!1};#$;#k=[];set data(e){this.#$=e.settings,this.#k=e.replayExtensions}get disabled(){return this.#d.disabled}set disabled(e){this.#d.disabled=e,r.ScheduledRender.scheduleRender(this,this.#x)}connectedCallback(){r.ScheduledRender.scheduleRender(this,this.#x)}#T(e){if(e.stopPropagation(),e.value.startsWith(he)){this.#$&&(this.#$.replayExtension=e.value);const t=Number(e.value.substring(9));return this.dispatchEvent(new pe("normal",this.#k[t])),void r.ScheduledRender.scheduleRender(this,this.#x)}const t=e.value;this.#$&&(this.#$.speed=t,this.#$.replayExtension=""),l.userMetrics.recordingReplaySpeed(le[t]),this.dispatchEvent(new pe(e.value)),r.ScheduledRender.scheduleRender(this,this.#x)}#o(){const t=[{name:ce(ne.speedGroup),items:ae}];this.#k.length&&t.push({name:ce(ne.extensionGroup),items:this.#k.map(((e,t)=>({value:he+t,buttonIconName:"play",buttonLabel:()=>e.getName(),label:()=>e.getName()})))}),e.render(e.html`
    <${re.litTagName}
      @selectbuttonclick=${this.#T}
      .variant=${"primary"}
      .showItemDivider=${!1}
      .disabled=${this.#d.disabled}
      .action=${"chrome_recorder.replay-recording"}
      .value=${this.#$?.replayExtension||this.#$?.speed}
      .groups=${t}>
    </${re.litTagName}>`,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-replay-button",ue);var ge=Object.freeze({__proto__:null,StartReplayEvent:pe,ReplayButton:ue});const me=new CSSStyleSheet;me.replaceSync("*{margin:0;padding:0;box-sizing:border-box;font-size:inherit}.title-container{max-width:calc(100% - 18px);font-size:13px;line-height:16px;letter-spacing:0.03em;display:flex;flex-direction:row;gap:3px;outline-offset:3px}.action{display:flex;align-items:flex-start}.title{flex:1;min-width:0}.is-start-of-group .title{font-weight:bold}.error-icon{display:none}.breakpoint-icon{visibility:hidden;cursor:pointer;opacity:0%;fill:var(--sys-color-primary);stroke:#1a73e8;transform:translate(-1.92px,-3px)}.circle-icon{fill:var(--sys-color-primary);stroke:var(--sys-color-cdt-base-container);stroke-width:4px;r:5px;cx:8px;cy:8px}.is-start-of-group .circle-icon{r:7px;fill:var(--sys-color-cdt-base-container);stroke:var(--sys-color-primary);stroke-width:2px}.step.is-success .circle-icon{fill:var(--sys-color-primary);stroke:var(--sys-color-primary)}.step.is-current .circle-icon{stroke-dasharray:24 10;animation:rotate 1s linear infinite;fill:var(--sys-color-cdt-base-container);stroke:var(--sys-color-primary);stroke-width:2px}.error{margin:16px 0 0;padding:8px;background:var(--sys-color-error-container);color:var(--sys-color-error);position:relative}@keyframes rotate{0%{transform:translate(8px,8px) rotate(0) translate(-8px,-8px)}100%{transform:translate(8px,8px) rotate(360deg) translate(-8px,-8px)}}.step.is-error .circle-icon{fill:var(--sys-color-error);stroke:var(--sys-color-error)}.step.is-error .error-icon{display:block;transform:translate(4px,4px)}:host-context(.was-successful) .circle-icon{animation:flash-circle 2s}:host-context(.was-successful) .breakpoint-icon{animation:flash-breakpoint-icon 2s}@keyframes flash-circle{25%{fill:var(--override-color-recording-successful-text);stroke:var(--override-color-recording-successful-text)}75%{fill:var(--override-color-recording-successful-text);stroke:var(--override-color-recording-successful-text)}}@keyframes flash-breakpoint-icon{25%{fill:var(--override-color-recording-successful-text);stroke:var(--override-color-recording-successful-text)}75%{fill:var(--override-color-recording-successful-text);stroke:var(--override-color-recording-successful-text)}}.chevron{width:14px;height:14px;transition:200ms;position:absolute;top:18px;left:24px;transform:rotate(-90deg);color:var(--sys-color-on-surface)}.expanded .chevron{transform:rotate(0deg)}.is-start-of-group .chevron{top:34px}.details{display:none;margin-top:8px;position:relative}.expanded .details{display:block}.step-details{overflow:auto}devtools-recorder-step-editor{border:1px solid var(--sys-color-neutral-outline);padding:3px 6px 6px;margin-left:-6px;border-radius:3px}devtools-recorder-step-editor:hover{border:1px solid var(--sys-color-neutral-outline)}devtools-recorder-step-editor.is-selected{background-color:color-mix(in sRGB,var(--sys-color-tonal-container),var(--sys-color-cdt-base-container) 50%);border:1px solid var(--sys-color-tonal-outline)}.summary{display:flex;flex-flow:row nowrap}.filler{flex-grow:1}.subtitle{font-weight:normal;color:var(--sys-color-on-surface-subtle);word-break:break-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.main-title{word-break:break-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.step-actions{border:none;border-radius:0;width:24px;height:24px;--override-select-menu-show-button-border-radius:0;--override-select-menu-show-button-outline:none;--override-select-menu-show-button-padding:0}.step-actions:hover,\n.step-actions:focus-within{background-color:var(--sys-color-state-hover-on-subtle)}.step-actions:active{background-color:var(--sys-color-cdt-base-container)}.step.has-breakpoint .circle-icon{visibility:hidden}.step:not(.is-start-of-group).has-breakpoint .breakpoint-icon{visibility:visible;opacity:100%}.step:not(.is-start-of-group):not(.has-breakpoint) .icon:hover .circle-icon{transition:opacity 0.2s;opacity:0%}.step:not(.is-start-of-group):not(.has-breakpoint) .icon:hover .error-icon{visibility:hidden}.step:not(.is-start-of-group):not(.has-breakpoint) .icon:hover .breakpoint-icon{transition:opacity 0.2s;visibility:visible;opacity:50%}\n/*# sourceURL=stepView.css */\n");const ve=new CSSStyleSheet;ve.replaceSync("*{margin:0;padding:0;box-sizing:border-box;font-size:inherit}.timeline-section{position:relative;padding:16px 0 16px 40px;margin-left:8px;--override-color-recording-successful-text:#36a854;--override-color-recording-successful-background:#e6f4ea}.overlay{position:absolute;width:100vw;height:100%;left:calc(-32px - 80px);top:0;z-index:-1;pointer-events:none}@container (max-width: 400px){.overlay{left:-32px}}:hover .overlay{background:var(--sys-color-state-hover-on-subtle)}.is-selected .overlay{background:var(--sys-color-tonal-container)}:host-context(.is-stopped) .overlay{background:var(--sys-color-state-ripple-primary);outline:1px solid var(--sys-color-state-focus-ring);z-index:4}.is-start-of-group{padding-top:28px}.is-end-of-group{padding-bottom:24px}.icon{position:absolute;left:4px;transform:translateX(-50%);z-index:2}.bar{position:absolute;left:4px;display:block;transform:translateX(-50%);top:18px;height:calc(100% + 8px);z-index:1}.bar .background{fill:var(--sys-color-state-hover-on-subtle)}.bar .line{fill:var(--sys-color-primary)}.is-first-section .bar{top:32px;height:calc(100% - 8px);display:none}.is-first-section:not(.is-last-section) .bar{display:block}.is-last-section .bar .line{display:none}.is-last-section .bar .background{display:none}:host-context(.is-error) .bar .line{fill:var(--sys-color-error)}:host-context(.is-error) .bar .background{fill:var(--sys-color-error-container)}:host-context(.was-successful) .bar .background{animation:flash-background 2s}:host-context(.was-successful) .bar .line{animation:flash-line 2s}@keyframes flash-background{25%{fill:var(--override-color-recording-successful-background)}75%{fill:var(--override-color-recording-successful-background)}}@keyframes flash-line{25%{fill:var(--override-color-recording-successful-text)}75%{fill:var(--override-color-recording-successful-text)}}\n/*# sourceURL=timelineSection.css */\n");class be extends HTMLElement{static litTagName=e.literal`devtools-timeline-section`;#E=!1;#R=!1;#C=!1;#N=!1;#I=!1;constructor(){super();this.attachShadow({mode:"open"}).adoptedStyleSheets=[ve]}set data(e){this.#C=e.isFirstSection,this.#N=e.isLastSection,this.#E=e.isEndOfGroup,this.#R=e.isStartOfGroup,this.#I=e.isSelected,this.#o()}connectedCallback(){this.#o()}#o(){const t={"timeline-section":!0,"is-end-of-group":this.#E,"is-start-of-group":this.#R,"is-first-section":this.#C,"is-last-section":this.#N,"is-selected":this.#I};e.render(e.html`
      <div class=${e.Directives.classMap(t)}>
        <div class="overlay"></div>
        <div class="icon"><slot name="icon"></slot></div>
        <svg width="24" height="100%" class="bar">
          <rect class="line" x="7" y="0" width="2" height="100%" />
        </svg>
        <slot></slot>
      </div>
    `,this.shadowRoot,{host:this})}}r.CustomElements.defineComponent("devtools-timeline-section",be);var fe=Object.freeze({__proto__:null,TimelineSection:be});const ye={setViewportClickTitle:"Set viewport",customStepTitle:"Custom step",clickStepTitle:"Click",doubleClickStepTitle:"Double click",hoverStepTitle:"Hover",emulateNetworkConditionsStepTitle:"Emulate network conditions",changeStepTitle:"Change",closeStepTitle:"Close",scrollStepTitle:"Scroll",keyUpStepTitle:"Key up",navigateStepTitle:"Navigate",keyDownStepTitle:"Key down",waitForElementStepTitle:"Wait for element",waitForExpressionStepTitle:"Wait for expression",elementRoleButton:"Button",elementRoleInput:"Input",elementRoleFallback:"Element",addStepBefore:"Add step before",addStepAfter:"Add step after",removeStep:"Remove step",openStepActions:"Open step actions",addBreakpoint:"Add breakpoint",removeBreakpoint:"Remove breakpoint",copyAs:"Copy as",stepManagement:"Manage steps",breakpoints:"Breakpoints"},we=i.i18n.registerUIStrings("panels/recorder/components/StepView.ts",ye),Se=i.i18n.getLocalizedString.bind(void 0,we);class xe extends Event{static eventName="captureselectors";data;constructor(e){super(xe.eventName,{bubbles:!0,composed:!0}),this.data=e}}class $e extends Event{static eventName="stopselectorscapture";constructor(){super($e.eventName,{bubbles:!0,composed:!0})}}class ke extends Event{static eventName="copystep";step;constructor(e){super(ke.eventName,{bubbles:!0,composed:!0}),this.step=e}}class Te extends Event{static eventName="stepchanged";currentStep;newStep;constructor(e,t){super(Te.eventName,{bubbles:!0,composed:!0}),this.currentStep=e,this.newStep=t}}class Ee extends Event{static eventName="addstep";position;stepOrSection;constructor(e,t){super(Ee.eventName,{bubbles:!0,composed:!0}),this.stepOrSection=e,this.position=t}}class Re extends Event{static eventName="removestep";step;constructor(e){super(Re.eventName,{bubbles:!0,composed:!0}),this.step=e}}class Ce extends Event{static eventName="addbreakpoint";index;constructor(e){super(Ce.eventName,{bubbles:!0,composed:!0}),this.index=e}}class Ne extends Event{static eventName="removebreakpoint";index;constructor(e){super(Ne.eventName,{bubbles:!0,composed:!0}),this.index=e}}const Ie="copy-step-as-";class Me extends HTMLElement{static litTagName=e.literal`devtools-step-view`;#t=this.attachShadow({mode:"open"});#M;#B;#A="default";#s;#P=!1;#E=!1;#R=!1;#O=0;#L=0;#C=!1;#N=!1;#F=!1;#j=!1;#D;#z=!1;#_=!1;#V=new IntersectionObserver((e=>{this.#_=e[0].isIntersecting}));#U=!1;#G=!0;#q;#K;#I=!1;#r;set data(e){const t=this.#A;this.#M=e.step,this.#B=e.section,this.#A=e.state,this.#s=e.error,this.#E=e.isEndOfGroup,this.#R=e.isStartOfGroup,this.#O=e.stepIndex,this.#L=e.sectionIndex,this.#C=e.isFirstSection,this.#N=e.isLastSection,this.#F=e.isRecording,this.#j=e.isPlaying,this.#U=e.hasBreakpoint,this.#G=e.removable,this.#q=e.builtInConverters,this.#K=e.extensionConverters,this.#I=e.isSelected,this.#r=e.recorderSettings,this.#o(),this.#A===t||"current"!==this.#A||this.#_||this.scrollIntoView()}get step(){return this.#M}get section(){return this.#B}connectedCallback(){this.#t.adoptedStyleSheets=[me],this.#V.observe(this),this.#o()}disconnectedCallback(){this.#V.unobserve(this)}#H(){this.#P=!this.#P,this.#o()}#W(e){const t=e;"Enter"!==t.key&&" "!==t.key||(this.#H(),e.stopPropagation(),e.preventDefault())}#X(){if(this.#B)return this.#B.title?this.#B.title:e.html`<span class="fallback">(No Title)</span>`;if(!this.#M)throw new Error("Missing both step and section");switch(this.#M.type){case a.Schema.StepType.CustomStep:return Se(ye.customStepTitle);case a.Schema.StepType.SetViewport:return Se(ye.setViewportClickTitle);case a.Schema.StepType.Click:return Se(ye.clickStepTitle);case a.Schema.StepType.DoubleClick:return Se(ye.doubleClickStepTitle);case a.Schema.StepType.Hover:return Se(ye.hoverStepTitle);case a.Schema.StepType.EmulateNetworkConditions:return Se(ye.emulateNetworkConditionsStepTitle);case a.Schema.StepType.Change:return Se(ye.changeStepTitle);case a.Schema.StepType.Close:return Se(ye.closeStepTitle);case a.Schema.StepType.Scroll:return Se(ye.scrollStepTitle);case a.Schema.StepType.KeyUp:return Se(ye.keyUpStepTitle);case a.Schema.StepType.KeyDown:return Se(ye.keyDownStepTitle);case a.Schema.StepType.WaitForElement:return Se(ye.waitForElementStepTitle);case a.Schema.StepType.WaitForExpression:return Se(ye.waitForExpressionStepTitle);case a.Schema.StepType.Navigate:return Se(ye.navigateStepTitle)}}#Y(e){switch(e){case"button":return Se(ye.elementRoleButton);case"input":return Se(ye.elementRoleInput);default:return Se(ye.elementRoleFallback)}}#J(){if(!this.#M||!("selectors"in this.#M))return"";const e=this.#M.selectors.flat().find((e=>e.startsWith("aria/")));if(!e)return"";const t=e.match(/^aria\/(.+?)(\[role="(.+)"\])?$/);return t?`${this.#Y(t[3])} "${t[1]}"`:""}#Q(){return this.#B?this.#B.url:""}#Z(e){const t=this.#M||this.#B?.causingStep;if(!t)throw new Error("Expected step.");this.dispatchEvent(new Te(t,e.data))}#ee(e){switch(e.itemValue){case"add-step-before":{const e=this.#M||this.#B;if(!e)throw new Error("Expected step or section.");this.dispatchEvent(new Ee(e,"before"));break}case"add-step-after":{const e=this.#M||this.#B;if(!e)throw new Error("Expected step or section.");this.dispatchEvent(new Ee(e,"after"));break}case"remove-step":{const e=this.#B?.causingStep;if(!this.#M&&!e)throw new Error("Expected step.");this.dispatchEvent(new Re(this.#M||e));break}case"add-breakpoint":if(!this.#M)throw new Error("Expected step");this.dispatchEvent(new Ce(this.#O));break;case"remove-breakpoint":if(!this.#M)throw new Error("Expected step");this.dispatchEvent(new Ne(this.#O));break;default:{const t=e.itemValue;if(!t.startsWith(Ie))throw new Error("Unknown step action.");const i=this.#M||this.#B?.causingStep;if(!i)throw new Error("Step not found.");const s=t.substring(13);this.#r&&(this.#r.preferredCopyFormat=s),this.dispatchEvent(new ke(structuredClone(i)))}}}#te(e){e.stopPropagation(),e.preventDefault(),this.#z=!this.#z,this.#o()}#ie(){this.#z=!1,this.#o()}#se(){this.#U?this.dispatchEvent(new Ne(this.#O)):this.dispatchEvent(new Ce(this.#O)),this.#o()}#re(){if(!this.#D)throw new Error("Missing actionsMenuButton");return this.#D}#oe=()=>{const e=[];if(this.#j||(this.#M&&e.push({id:"add-step-before",label:Se(ye.addStepBefore),group:"stepManagement",groupTitle:Se(ye.stepManagement)}),e.push({id:"add-step-after",label:Se(ye.addStepAfter),group:"stepManagement",groupTitle:Se(ye.stepManagement)}),this.#G&&e.push({id:"remove-step",group:"stepManagement",groupTitle:Se(ye.stepManagement),label:Se(ye.removeStep)})),this.#M&&!this.#F&&(this.#U?e.push({id:"remove-breakpoint",label:Se(ye.removeBreakpoint),group:"breakPointManagement",groupTitle:Se(ye.breakpoints)}):e.push({id:"add-breakpoint",label:Se(ye.addBreakpoint),group:"breakPointManagement",groupTitle:Se(ye.breakpoints)})),this.#M){for(const t of this.#q||[])e.push({id:Ie+t.getId(),label:t.getFormatName(),group:"copy",groupTitle:Se(ye.copyAs)});for(const t of this.#K||[])e.push({id:Ie+t.getId(),label:t.getFormatName(),group:"copy",groupTitle:Se(ye.copyAs)})}return e};#ne(){const t=this.#oe(),i=new Map;for(const e of t){const t=i.get(e.group);t?t.push(e):i.set(e.group,[e])}const o=[];for(const[e,t]of i)o.push({group:e,groupTitle:t[0].groupTitle,actions:t});return e.html`
      <${s.Button.Button.litTagName}
        class="step-actions"
        title=${Se(ye.openStepActions)}
        aria-label=${Se(ye.openStepActions)}
        @click=${this.#te}
        @keydown=${e=>{e.stopPropagation()}}
        on-render=${r.Directives.nodeRenderedCallback((e=>{this.#D=e}))}
        .data=${{variant:"toolbar",iconName:"dots-vertical",title:Se(ye.openStepActions)}}
      ></${s.Button.Button.litTagName}>
      <${u.Menu.Menu.litTagName}
        @menucloserequest=${this.#ie}
        @menuitemselected=${this.#ee}
        .origin=${this.#re.bind(this)}
        .showSelectedItem=${!1}
        .showConnector=${!1}
        .open=${this.#z}
      >
        ${e.Directives.repeat(o,(e=>e.group),(t=>e.html`
            <${u.Menu.MenuGroup.litTagName}
              .name=${t.groupTitle}
            >
              ${e.Directives.repeat(t.actions,(e=>e.id),(t=>e.html`<${u.Menu.MenuItem.litTagName}
                      .value=${t.id}
                    >
                      ${t.label}
                    </${u.Menu.MenuItem.litTagName}>
                  `))}
            </${u.Menu.MenuGroup.litTagName}>
          `))}
      </${u.Menu.Menu.litTagName}>
    `}#ae=e=>{if(2!==e.button)return;const i=new t.ContextMenu.ContextMenu(e),s=this.#oe(),r=s.filter((e=>e.id.startsWith(Ie))),o=s.filter((e=>!e.id.startsWith(Ie)));for(const e of o){i.section(e.group).appendItem(e.label,(()=>{this.#ee(new u.Menu.MenuItemSelectedEvent(e.id))}))}const n=r.find((e=>e.id===Ie+this.#r?.preferredCopyFormat));if(n&&i.section("copy").appendItem(n.label,(()=>{this.#ee(new u.Menu.MenuItemSelectedEvent(n.id))})),r.length){const e=i.section("copy").appendSubMenuItem(Se(ye.copyAs));for(const t of r)t!==n&&e.section(t.group).appendItem(t.label,(()=>{this.#ee(new u.Menu.MenuItemSelectedEvent(t.id))}))}i.show()};#o(){if(!this.#M&&!this.#B)return;const t={step:!0,expanded:this.#P,"is-success":"success"===this.#A,"is-current":"current"===this.#A,"is-outstanding":"outstanding"===this.#A,"is-error":"error"===this.#A,"is-stopped":"stopped"===this.#A,"is-start-of-group":this.#R,"is-first-section":this.#C,"has-breakpoint":this.#U},i=Boolean(this.#M),s=this.#X(),r=this.#M?this.#J():this.#Q();e.render(e.html`
      <${be.litTagName} .data=${{isFirstSection:this.#C,isLastSection:this.#N,isStartOfGroup:this.#R,isEndOfGroup:this.#E,isSelected:this.#I}} @contextmenu=${this.#ae} data-step-index=${this.#O} data-section-index=${this.#L} class=${e.Directives.classMap(t)}>
        <svg slot="icon" width="24" height="24" height="100%" class="icon">
          <circle class="circle-icon"/>
          <g class="error-icon">
            <path d="M1.5 1.5L6.5 6.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1.5 6.5L6.5 1.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <path @click=${this.#se.bind(this)} class="breakpoint-icon" d="M2.5 5.5H17.7098L21.4241 12L17.7098 18.5H2.5V5.5Z"/>
        </svg>
        <div class="summary">
          <div class="title-container ${i?"action":""}"
            @click=${i&&this.#H.bind(this)}
            @keydown=${i&&this.#W.bind(this)}
            tabindex="0"
            aria-role=${i?"button":""}
            aria-label=${i?"Show details for step":""}
          >
            ${i?e.html`<${o.Icon.Icon.litTagName}
                    class="chevron"
                    name="triangle-down">
                  </${o.Icon.Icon.litTagName}>`:""}
            <div class="title">
              <div class="main-title" title=${s}>${s}</div>
              <div class="subtitle" title=${r}>${r}</div>
            </div>
          </div>
          <div class="filler"></div>
          ${this.#ne()}
        </div>
        <div class="details">
          ${this.#M&&e.html`<devtools-recorder-step-editor
            class=${this.#I?"is-selected":""}
            .step=${this.#M}
            .disabled=${this.#j}
            @stepedited=${this.#Z}>
          </devtools-recorder-step-editor>`}
          ${this.#B?.causingStep&&e.html`<devtools-recorder-step-editor
            .step=${this.#B.causingStep}
            .isTypeEditable=${!1}
            .disabled=${this.#j}
            @stepedited=${this.#Z}>
          </devtools-recorder-step-editor>`}
        </div>
        ${this.#s&&e.html`
          <div class="error" role="alert">
            ${this.#s.message}
          </div>
        `}
      </${be.litTagName}>
    `,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-step-view",Me);var Be=Object.freeze({__proto__:null,CaptureSelectorsEvent:xe,StopSelectorsCaptureEvent:$e,CopyStepEvent:ke,StepChanged:Te,AddStep:Ee,RemoveStep:Re,AddBreakpointEvent:Ce,RemoveBreakpointEvent:Ne,StepView:Me});const Ae={mobile:"Mobile",desktop:"Desktop",latency:"Latency: {value} ms",upload:"Upload: {value}",download:"Download: {value}",editReplaySettings:"Edit replay settings",replaySettings:"Replay settings",default:"Default",environment:"Environment",screenshotForSection:"Screenshot for this section",editTitle:"Edit title",requiredTitleError:"Title is required",recording:"Recording…",endRecording:"End recording",recordingIsBeingStopped:"Stopping recording…",timeout:"Timeout: {value} ms",network:"Network",timeoutLabel:"Timeout",timeoutExplanation:"The timeout setting (in milliseconds) applies to every action when replaying the recording. For example, if a DOM element identified by a CSS selector does not appear on the page within the specified timeout, the replay fails with an error.",cancelReplay:"Cancel replay",showCode:"Show code",hideCode:"Hide code",addAssertion:"Add assertion",performancePanel:"Performance panel"},Pe=i.i18n.registerUIStrings("panels/recorder/components/RecordingView.ts",Ae),Oe=i.i18n.getLocalizedString.bind(void 0,Pe);class Le extends Event{static eventName="recordingfinished";constructor(){super(Le.eventName)}}class Fe extends Event{static eventName="playrecording";data;constructor(e={targetPanel:"chrome_recorder",speed:"normal"}){super(Fe.eventName),this.data=e}}class je extends Event{static eventName="abortreplay";constructor(){super(je.eventName)}}class De extends Event{static eventName="recordingchanged";data;constructor(e,t){super(De.eventName),this.data={currentStep:e,newStep:t}}}class ze extends Event{static eventName="addassertion";constructor(){super(ze.eventName)}}class _e extends Event{static eventName="recordingtitlechanged";title;constructor(e){super(_e.eventName,{}),this.title=e}}class Ve extends Event{static eventName="networkconditionschanged";data;constructor(e){super(Ve.eventName,{composed:!0,bubbles:!0}),this.data=e}}class Ue extends Event{static eventName="timeoutchanged";data;constructor(e){super(Ue.eventName,{composed:!0,bubbles:!0}),this.data=e}}const Ge=[c.NetworkManager.NoThrottlingConditions,c.NetworkManager.OfflineConditions,c.NetworkManager.Slow3GConditions,c.NetworkManager.Fast3GConditions];class qe extends HTMLElement{static litTagName=e.literal`devtools-recording-view`;#t=this.attachShadow({mode:"open"});#le={isPlaying:!1,isPausedOnBreakpoint:!1};#de=null;#F=!1;#ce=!1;#pe=!1;#he;#ue=[];#ge;#me=[];#$;#r;#ve;#be=new Set;#fe;#ye=!1;#we=!0;#q=[];#K=[];#k;#Se=!1;#xe="";#$e="";#ke;#Te;#Ee;#Re=this.#Ce.bind(this);set data(e){this.#F=e.isRecording,this.#le=e.replayState,this.#ce=e.recordingTogglingInProgress,this.#he=e.currentStep,this.#de=e.recording,this.#ue=this.#de.steps,this.#me=e.sections,this.#$=e.settings,this.#r=e.recorderSettings,this.#ge=e.currentError,this.#ve=e.lastReplayResult,this.#we=e.replayAllowed,this.#pe=!1,this.#be=e.breakpointIndexes,this.#q=e.builtInConverters,this.#K=e.extensionConverters,this.#k=e.replayExtensions,this.#Ee=e.extensionDescriptor,this.#$e=this.#r?.preferredCopyFormat??e.builtInConverters[0]?.getId(),this.#Ne(),this.#o()}connectedCallback(){this.#t.adoptedStyleSheets=[te,n.textInputStyles],document.addEventListener("copy",this.#Re),this.#o()}disconnectedCallback(){document.removeEventListener("copy",this.#Re)}scrollToBottom(){const e=this.shadowRoot?.querySelector(".sections");e&&(e.scrollTop=e.scrollHeight)}#Ie(){this.dispatchEvent(new ze)}#Me(){this.dispatchEvent(new Le)}#Be(){this.dispatchEvent(new je)}#Ae(e){this.dispatchEvent(new Fe({targetPanel:"chrome_recorder",speed:e.speed,extension:e.extension}))}#Pe(e){if(!this.#he)return"default";if(e===this.#he)return this.#ge?"error":this.#le.isPlaying?this.#le.isPausedOnBreakpoint?"stopped":"current":"success";const t=this.#ue.indexOf(this.#he);if(-1===t)return"default";return this.#ue.indexOf(e)<t?"success":"outstanding"}#Oe(e){const t=this.#he;if(!t)return"default";const i=this.#me.find((e=>e.steps.includes(t)));if(!i&&this.#ge)return"error";if(e===i)return"success";return this.#me.indexOf(i)>=this.#me.indexOf(e)?"success":"outstanding"}#Le(t,i,s){const r=this.#ue.indexOf(i);return e.html`
      <${Me.litTagName}
      @click=${this.#Fe}
      @mouseover=${this.#je}
      @copystep=${this.#De}
      .data=${{step:i,state:this.#Pe(i),error:this.#he===i?this.#ge:void 0,isFirstSection:!1,isLastSection:s&&this.#ue[this.#ue.length-1]===i,isStartOfGroup:!1,isEndOfGroup:t.steps[t.steps.length-1]===i,stepIndex:r,hasBreakpoint:this.#be.has(r),sectionIndex:-1,isRecording:this.#F,isPlaying:this.#le.isPlaying,removable:this.#ue.length>1,builtInConverters:this.#q,extensionConverters:this.#K,isSelected:this.#fe===i,recorderSettings:this.#r}}
      ></${Me.litTagName}>
    `}#je=e=>{const t=e.target,i=t.step||t.section?.causingStep;i&&!this.#fe&&this.#ze(i)};#Fe(e){e.stopPropagation();const t=e.target,i=t.step||t.section?.causingStep||null;this.#fe!==i&&(this.#fe=i,this.#o(),i&&this.#ze(i,!0))}#_e(){void 0!==this.#fe&&(this.#fe=void 0,this.#o())}#Ve(e){"Enter"===e.key&&(e.preventDefault(),this.#Ue(e))}#Ue(e){e.stopPropagation(),this.#ye=!this.#ye,this.#o()}#Ge(e){const t=Ge.find((t=>t.i18nTitleKey===e.itemValue));this.dispatchEvent(new Ve(t?.i18nTitleKey===c.NetworkManager.NoThrottlingConditions.i18nTitleKey?void 0:t))}#qe(e){const t=e.target;t.checkValidity()?this.dispatchEvent(new Ue(Number(t.value))):t.reportValidity()}#Ke=e=>{const t=e.target.innerText.trim();if(!t)return this.#pe=!0,void this.#o();this.dispatchEvent(new _e(t))};#He=e=>{switch(e.code){case"Escape":case"Enter":e.target.blur(),e.stopPropagation()}};#We=()=>{const e=this.#t.getElementById("title-input");e.focus();const t=document.createRange();t.selectNodeContents(e),t.collapse(!1);const i=window.getSelection();i?.removeAllRanges(),i?.addRange(t)};#Xe=e=>{const t=e.target;t.matches(".wrapping-label")&&t.querySelector("devtools-select-menu")?.click()};async#Ye(e){let t=[...this.#q,...this.#K].find((e=>e.getId()===this.#r?.preferredCopyFormat));if(t||(t=this.#q[0]),!t)throw new Error("No default converter found");let i="";e?i=await t.stringifyStep(e):this.#de&&([i]=await t.stringify(this.#de)),l.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(i);const s=e?function(e){switch(e){case"puppeteer":return l.UserMetrics.RecordingCopiedToClipboard.CopiedStepWithPuppeteer;case"json":return l.UserMetrics.RecordingCopiedToClipboard.CopiedStepWithJSON;case"@puppeteer/replay":return l.UserMetrics.RecordingCopiedToClipboard.CopiedStepWithReplay;default:return l.UserMetrics.RecordingCopiedToClipboard.CopiedStepWithExtension}}(t.getId()):function(e){switch(e){case"puppeteer":return l.UserMetrics.RecordingCopiedToClipboard.CopiedRecordingWithPuppeteer;case"json":return l.UserMetrics.RecordingCopiedToClipboard.CopiedRecordingWithJSON;case"@puppeteer/replay":return l.UserMetrics.RecordingCopiedToClipboard.CopiedRecordingWithReplay;default:return l.UserMetrics.RecordingCopiedToClipboard.CopiedRecordingWithExtension}}(t.getId());l.userMetrics.recordingCopiedToClipboard(s)}#De(e){e.stopPropagation(),this.#Ye(e.step)}async#Ce(e){e.target===document.body&&(e.preventDefault(),await this.#Ye(this.#fe),l.userMetrics.keyboardShortcutFired("chrome_recorder.copy-recording-or-step"))}#Je(){if(!this.#$)return e.html``;const t=[];this.#$.viewportSettings&&(t.push(e.html`<div>${this.#$.viewportSettings.isMobile?Oe(Ae.mobile):Oe(Ae.desktop)}</div>`),t.push(e.html`<div class="separator"></div>`),t.push(e.html`<div>${this.#$.viewportSettings.width}×${this.#$.viewportSettings.height} px</div>`));const i=[];if(this.#ye){const t=this.#$.networkConditionsSettings?.i18nTitleKey||c.NetworkManager.NoThrottlingConditions.i18nTitleKey,s=Ge.find((e=>e.i18nTitleKey===t));let r="";s&&(r=s.title instanceof Function?s.title():s.title),i.push(e.html`<div class="editable-setting">
        <label class="wrapping-label" @click=${this.#Xe}>
          ${Oe(Ae.network)}
          <${u.SelectMenu.SelectMenu.litTagName}
            @selectmenuselected=${this.#Ge}
            .disabled=${!this.#ue.find((e=>"navigate"===e.type))}
            .showDivider=${!0}
            .showArrow=${!0}
            .sideButton=${!1}
            .showSelectedItem=${!0}
            .showConnector=${!1}
            .position=${"bottom"}
            .buttonTitle=${r}
          >
            ${Ge.map((i=>e.html`<${u.Menu.MenuItem.litTagName}
                .value=${i.i18nTitleKey}
                .selected=${t===i.i18nTitleKey}
              >
                ${i.title instanceof Function?i.title():i.title}
              </${u.Menu.MenuItem.litTagName}>`))}
          </${u.SelectMenu.SelectMenu.litTagName}>
        </label>
      </div>`),i.push(e.html`<div class="editable-setting">
        <label class="wrapping-label" title=${Oe(Ae.timeoutExplanation)}>
          ${Oe(Ae.timeoutLabel)}
          <input
            @input=${this.#qe}
            required
            min=${a.SchemaUtils.minTimeout}
            max=${a.SchemaUtils.maxTimeout}
            value=${this.#$.timeout||a.RecordingPlayer.defaultTimeout}
            class="devtools-text-input"
            type="number">
        </label>
      </div>`)}else this.#$.networkConditionsSettings?this.#$.networkConditionsSettings.title?i.push(e.html`<div>${this.#$.networkConditionsSettings.title}</div>`):i.push(e.html`<div>
            ${Oe(Ae.download,{value:d.NumberUtilities.bytesToString(this.#$.networkConditionsSettings.download)})},
            ${Oe(Ae.upload,{value:d.NumberUtilities.bytesToString(this.#$.networkConditionsSettings.upload)})},
            ${Oe(Ae.latency,{value:this.#$.networkConditionsSettings.latency})}
          </div>`):i.push(e.html`<div>${c.NetworkManager.NoThrottlingConditions.title instanceof Function?c.NetworkManager.NoThrottlingConditions.title():c.NetworkManager.NoThrottlingConditions.title}</div>`),i.push(e.html`<div class="separator"></div>`),i.push(e.html`<div>${Oe(Ae.timeout,{value:this.#$.timeout||a.RecordingPlayer.defaultTimeout})}</div>`);const s=!this.#F&&!this.#le.isPlaying,r={"settings-title":!0,expanded:this.#ye},n={expanded:this.#ye,settings:!0};return e.html`
      <div class="settings-row">
        <div class="settings-container">
          <div
            class=${e.Directives.classMap(r)}
            @keydown=${s&&this.#Ve}
            @click=${s&&this.#Ue}
            tabindex="0"
            role="button"
            aria-label=${Oe(Ae.editReplaySettings)}>
            <span>${Oe(Ae.replaySettings)}</span>
            ${s?e.html`<${o.Icon.Icon.litTagName}
                    class="chevron"
                    name="triangle-down">
                  </${o.Icon.Icon.litTagName}>`:""}
          </div>
          <div class=${e.Directives.classMap(n)}>
            ${i.length?i:e.html`<div>${Oe(Ae.default)}</div>`}
          </div>
        </div>
        <div class="settings-container">
          <div class="settings-title">${Oe(Ae.environment)}</div>
          <div class="settings">
            ${t.length?t:e.html`<div>${Oe(Ae.default)}</div>`}
          </div>
        </div>
      </div>
    `}#Qe(){const e=[...this.#q||[],...this.#K||[]].find((e=>e.getId()===this.#$e));return e||this.#q[0]}#Ze(){if(this.#Ee)return e.html`
        <${ee.litTagName} .descriptor=${this.#Ee}>
        </${ee.litTagName}>
      `;const t=this.#Qe(),i=t?.getFormatName();return this.#Se?e.html`
        <${g.SplitView.SplitView.litTagName}>
          <div slot="main">
            ${this.#et()}
          </div>
          <div slot="sidebar">
            <div class="section-toolbar">
              <${u.SelectMenu.SelectMenu.litTagName}
                @selectmenuselected=${this.#tt}
                .showDivider=${!0}
                .showArrow=${!0}
                .sideButton=${!1}
                .showSelectedItem=${!0}
                .showConnector=${!1}
                .position=${"bottom"}
                .buttonTitle=${i}
              >
                ${this.#q.map((t=>e.html`<${u.Menu.MenuItem.litTagName}
                    .value=${t.getId()}
                    .selected=${this.#$e===t.getId()}
                  >
                    ${t.getFormatName()}
                  </${u.Menu.MenuItem.litTagName}>`))}
                ${this.#K.map((t=>e.html`<${u.Menu.MenuItem.litTagName}
                    .value=${t.getId()}
                    .selected=${this.#$e===t.getId()}
                  >
                    ${t.getFormatName()}
                  </${u.Menu.MenuItem.litTagName}>`))}
              </${u.SelectMenu.SelectMenu.litTagName}>
              <${s.Button.Button.litTagName}
                title=${a.Tooltip.getTooltipForActions(Oe(Ae.hideCode),"chrome_recorder.toggle-code-view")}
                .data=${{variant:"round",size:"SMALL",iconName:"cross"}}
                @click=${this.showCodeToggle}
              ></${s.Button.Button.litTagName}>
            </div>
            <div class="text-editor">
              <${m.TextEditor.TextEditor.litTagName} .state=${this.#ke}></${m.TextEditor.TextEditor.litTagName}>
            </div>
          </div>
        </${g.SplitView.SplitView.litTagName}>
      `:this.#et()}#it(t){return t.screenshot?e.html`
      <img class="screenshot" src=${t.screenshot} alt=${Oe(Ae.screenshotForSection)} />
    `:null}#st(){return this.#le.isPlaying?e.html`
        <${s.Button.Button.litTagName} @click=${this.#Be} .iconName=${"pause"} .variant=${"secondary"}>
          ${Oe(Ae.cancelReplay)}
        </${s.Button.Button.litTagName}>`:e.html`<${ue.litTagName}
        .data=${{settings:this.#r,replayExtensions:this.#k}}
        .disabled=${this.#le.isPlaying}
        @startreplay=${this.#Ae}
        >
      </${ue.litTagName}>`}#rt(e){e.stopPropagation(),this.dispatchEvent(new Fe({targetPanel:"timeline",speed:"normal"}))}showCodeToggle=()=>{this.#Se=!this.#Se,l.userMetrics.recordingCodeToggled(this.#Se?l.UserMetrics.RecordingCodeToggled.CodeShown:l.UserMetrics.RecordingCodeToggled.CodeHidden),this.#Ne()};#Ne=async()=>{if(!this.#de)return;const e=this.#Qe();if(!e)return;const[t,i]=await e.stringify(this.#de);this.#xe=t,this.#Te=i,this.#Te?.shift();const s=e.getMediaType(),r=s?await h.CodeHighlighter.languageFromMIME(s):null;this.#ke=p.EditorState.create({doc:this.#xe,extensions:[m.Config.baseConfiguration(this.#xe),p.EditorState.readOnly.of(!0),p.EditorView.lineWrapping,r||[]]}),this.#o(),this.dispatchEvent(new Event("code-generated"))};#ze=(e,t=!1)=>{if(!this.#Te)return;const i=this.#ue.indexOf(e);if(-1===i)return;const s=this.#t.querySelector("devtools-text-editor");if(!s)return;const r=s.editor;if(!r)return;const o=this.#Te[2*i],n=this.#Te[2*i+1];let a=s.createSelection({lineNumber:o+n,columnNumber:0},{lineNumber:o,columnNumber:0});const l=s.state.doc.lineAt(a.main.anchor);a=s.createSelection({lineNumber:o+n-1,columnNumber:l.length+1},{lineNumber:o,columnNumber:0}),r.dispatch({selection:a,effects:t?[p.EditorView.scrollIntoView(a.main,{y:"nearest"})]:void 0})};#tt=e=>{this.#$e=e.itemValue,this.#r&&(this.#r.preferredCopyFormat=e.itemValue),this.#Ne()};#et(){return e.html`
      <div class="sections">
      ${this.#Se?"":e.html`<div class="section-toolbar">
        <${s.Button.Button.litTagName}
          @click=${this.showCodeToggle}
          class="show-code"
          .data=${{variant:"secondary",title:a.Tooltip.getTooltipForActions(Oe(Ae.showCode),"chrome_recorder.toggle-code-view")}}
        >
          ${Oe(Ae.showCode)}
        </${s.Button.Button.litTagName}>
      </div>`}
      ${this.#me.map(((t,i)=>e.html`
            <div class="section">
              <div class="screenshot-wrapper">
                ${this.#it(t)}
              </div>
              <div class="content">
                <div class="steps">
                  <${Me.litTagName}
                    @click=${this.#Fe}
                    @mouseover=${this.#je}
                    .data=${{section:t,state:this.#Oe(t),isStartOfGroup:!0,isEndOfGroup:0===t.steps.length,isFirstSection:0===i,isLastSection:i===this.#me.length-1&&0===t.steps.length,isSelected:this.#fe===(t.causingStep||null),sectionIndex:i,isRecording:this.#F,isPlaying:this.#le.isPlaying,error:"error"===this.#Oe(t)?this.#ge:void 0,hasBreakpoint:!1,removable:this.#ue.length>1&&t.causingStep}}
                  >
                  </${Me.litTagName}>
                  ${t.steps.map((e=>this.#Le(t,e,i===this.#me.length-1)))}
                  ${!this.#ce&&this.#F&&i===this.#me.length-1?e.html`<devtools-button
                    class="step add-assertion-button"
                    .data=${{variant:"secondary",title:Oe(Ae.addAssertion)}}
                    @click=${this.#Ie}
                  >${Oe(Ae.addAssertion)}</devtools-button>`:void 0}
                  ${this.#F&&i===this.#me.length-1?e.html`<div class="step recording">${Oe(Ae.recording)}</div>`:null}
                </div>
              </div>
            </div>
      `))}
      </div>
    `}#ot(){if(!this.#de)return"";const{title:t}=this.#de,i=!this.#le.isPlaying&&!this.#F;return e.html`
      <div class="header">
        <div class="header-title-wrapper">
          <div class="header-title">
            <span @blur=${this.#Ke}
                  @keydown=${this.#He}
                  id="title-input"
                  .contentEditable=${i?"true":"false"}
                  class=${e.Directives.classMap({"has-error":this.#pe,disabled:!i})}
                  .innerText=${e.Directives.live(t)}></span>
            <div class="title-button-bar">
              <${s.Button.Button.litTagName}
                @click=${this.#We}
                .data=${{disabled:!i,variant:"toolbar",iconName:"edit",title:Oe(Ae.editTitle)}}
              ></${s.Button.Button.litTagName}>
            </div>
          </div>
          ${this.#pe?e.html`<div class="title-input-error-text">
            ${Oe(Ae.requiredTitleError)}
          </div>`:""}
        </div>
        ${!this.#F&&this.#we?e.html`<div class="actions">
                <${s.Button.Button.litTagName}
                  @click=${this.#rt}
                  .data=${{disabled:this.#le.isPlaying,variant:"secondary",iconName:"performance",title:Oe(Ae.performancePanel)}}
                >
                  ${Oe(Ae.performancePanel)}
                </${s.Button.Button.litTagName}>
                ${this.#st()}
              </div>`:""}
      </div>`}#nt(){if(!this.#F)return"";const t=this.#ce?Oe(Ae.recordingIsBeingStopped):Oe(Ae.endRecording);return e.html`
      <div class="footer">
        <div class="controls">
          <devtools-control-button
            @click=${this.#Me}
            .disabled=${this.#ce}
            .shape=${"square"}
            .label=${t}
            title=${a.Tooltip.getTooltipForActions(t,"chrome_recorder.start-recording")}
          >
          </devtools-control-button>
        </div>
      </div>
    `}#o(){const t={wrapper:!0,"is-recording":this.#F,"is-playing":this.#le.isPlaying,"was-successful":"Success"===this.#ve,"was-failure":"Failure"===this.#ve};e.render(e.html`
      <div @click=${this.#_e} class=${e.Directives.classMap(t)}>
        <div class="main">
          ${this.#ot()}
          ${this.#Ee?e.html`
            <${ee.litTagName} .descriptor=${this.#Ee}>
            </${ee.litTagName}>
          `:e.html`
            ${this.#Je()}
            ${this.#Ze()}
          `}
          ${this.#nt()}
        </div>
      </div>
    `,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-recording-view",qe);var Ke=Object.freeze({__proto__:null,RecordingFinishedEvent:Le,PlayRecordingEvent:Fe,AbortReplayEvent:je,RecordingChangedEvent:De,AddAssertionEvent:ze,RecordingTitleChangedEvent:_e,NetworkConditionsChanged:Ve,TimeoutChanged:Ue,RecordingView:qe});const He=new CSSStyleSheet;He.replaceSync("*{margin:0;padding:0;box-sizing:border-box;font-weight:normal;font-size:inherit}:host{flex:1;display:block;overflow:auto}.wrapper{padding:24px;background-color:var(--sys-color-cdt-base-container);height:100%;display:flex;flex-direction:column}.fit-content{width:fit-content}.align-right{width:auto;display:flex;flex-direction:row;justify-content:flex-end}\n/*# sourceURL=startView.css */\n");const We={header:"Measure performance across an entire user journey",step1:"Record a common user journey on your website or app",step2:"Replay the recording to check if the flow is working",step3:"Generate a detailed performance trace or export a Puppeteer script for testing",createRecording:"Create a new recording",quickStart:"Quick start: learn the new Recorder panel in DevTools"},Xe=i.i18n.registerUIStrings("panels/recorder/components/StartView.ts",We),Ye=i.i18n.getLocalizedString.bind(void 0,Xe),Je="https://goo.gle/recorder-feedback";class Qe extends Event{static eventName="createrecording";constructor(){super(Qe.eventName)}}class Ze extends HTMLElement{static litTagName=e.literal`devtools-start-view`;#t=this.attachShadow({mode:"open"});connectedCallback(){this.#t.adoptedStyleSheets=[He],r.ScheduledRender.scheduleRender(this,this.#o)}#at(){this.dispatchEvent(new Qe)}#o=()=>{e.render(e.html`
        <div class="wrapper">
          <${f.PanelIntroductionSteps.PanelIntroductionSteps.litTagName}>
            <span slot="title">${Ye(We.header)}</span>
            <span slot="step-1">${Ye(We.step1)}</span>
            <span slot="step-2">${Ye(We.step2)}</span>
            <span slot="step-3">${Ye(We.step3)}</span>
          </${f.PanelIntroductionSteps.PanelIntroductionSteps.litTagName}>
          <div class="fit-content">
            <${s.Button.Button.litTagName} .variant=${"primary"} @click=${this.#at}>
              ${Ye(We.createRecording)}
            </${s.Button.Button.litTagName}>
          </div>
          <${b.PanelFeedback.PanelFeedback.litTagName} .data=${{feedbackUrl:Je,quickStartUrl:"https://developer.chrome.com/docs/devtools/recorder",quickStartLinkText:Ye(We.quickStart)}}>
          </${b.PanelFeedback.PanelFeedback.litTagName}>
          <div class="align-right">
            <${b.FeedbackButton.FeedbackButton.litTagName} .data=${{feedbackUrl:Je}}>
            </${b.FeedbackButton.FeedbackButton.litTagName}>
          </div>
        </div>
      `,this.#t,{host:this})}}r.CustomElements.defineComponent("devtools-start-view",Ze);var et=Object.freeze({__proto__:null,FEEDBACK_URL:Je,CreateRecordingEvent:Qe,StartView:Ze});const tt=new CSSStyleSheet;tt.replaceSync("*{box-sizing:border-box;padding:0;margin:0;font-size:inherit}:host{display:block}.row{display:flex;flex-direction:row;color:var(--sys-color-token-property-special);font-family:var(--monospace-font-family);font-size:var(--monospace-font-size);align-items:center;line-height:18px;margin-top:3px}.row devtools-button{line-height:1;margin-left:0.5em}.separator{margin-right:0.5em;color:var(--sys-color-on-surface)}.padded{margin-left:2em}.padded.double{margin-left:4em}.selector-picker{width:18px;height:18px}.inline-button{width:18px;height:18px;opacity:0%;visibility:hidden;transition:opacity 200ms;flex-shrink:0}.row:focus-within .inline-button,\n.row:hover .inline-button{opacity:100%;visibility:visible}.wrapped.row{flex-wrap:wrap}.gap.row{gap:5px}.gap.row devtools-button{margin-left:0}.regular-font{font-family:inherit;font-size:inherit}.no-margin{margin:0}.row-buttons{margin-top:3px}.error{margin:3px 0 6px;padding:8px 12px;background:var(--sys-color-error-container);color:var(--sys-color-error)}\n/*# sourceURL=stepEditor.css */\n");function it(e,t="Assertion failed!"){if(!e)throw new Error(t)}const st=e=>{for(const t of Reflect.ownKeys(e)){const i=e[t];(i&&"object"==typeof i||"function"==typeof i)&&st(i)}return Object.freeze(e)};class rt{value;constructor(e){this.value=e}}class ot{value;constructor(e){this.value=e}}const nt=(e,t)=>{if(t instanceof ot){it(Array.isArray(e),`Expected an array. Got ${typeof e}.`);const i=[...e],s=Object.keys(t.value).sort(((e,t)=>Number(t)-Number(e)));for(const e of s){const s=t.value[Number(e)];void 0===s?i.splice(Number(e),1):s instanceof rt?i.splice(Number(e),0,s.value):i[Number(e)]=nt(i[e],s)}return Object.freeze(i)}if("object"==typeof t&&!Array.isArray(t)){it(!Array.isArray(e),"Expected an object. Got an array.");const i={...e},s=Object.keys(t);for(const e of s){const s=t[e];void 0===s?delete i[e]:i[e]=nt(i[e],s)}return Object.freeze(i)}return t};var at=self&&self.__decorate||function(e,t,i,s){var r,o=arguments.length,n=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(n=(o<3?r(n):o>3?r(t,i,n):r(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};const{html:lt,Decorators:dt,Directives:ct,LitElement:pt}=e,{customElement:ht,property:ut,state:gt}=dt,{live:mt}=ct,vt=Object.freeze({string:e=>e.trim(),number:e=>{const t=parseFloat(e);return Number.isNaN(t)?0:t},boolean:e=>"true"===e.toLowerCase()}),bt=Object.freeze({selectors:"string",offsetX:"number",offsetY:"number",target:"string",frame:"number",assertedEvents:"string",value:"string",key:"string",operator:"string",count:"number",expression:"string",x:"number",y:"number",url:"string",type:"string",timeout:"number",duration:"number",button:"string",deviceType:"string",width:"number",height:"number",deviceScaleFactor:"number",isMobile:"boolean",hasTouch:"boolean",isLandscape:"boolean",download:"number",upload:"number",latency:"number",name:"string",parameters:"string",visible:"boolean",properties:"string",attributes:"string"}),ft=st({selectors:[[".cls"]],offsetX:1,offsetY:1,target:"main",frame:[0],assertedEvents:[{type:"navigation",url:"https://example.com",title:"Title"}],value:"Value",key:"Enter",operator:">=",count:1,expression:"true",x:0,y:0,url:"https://example.com",timeout:5e3,duration:50,deviceType:"mouse",button:"primary",type:"click",width:800,height:600,deviceScaleFactor:1,isMobile:!1,hasTouch:!1,isLandscape:!0,download:1e3,upload:1e3,latency:25,name:"customParam",parameters:"{}",properties:"{}",attributes:[{name:"attribute",value:"value"}],visible:!0}),yt=st({[a.Schema.StepType.Click]:{required:["selectors","offsetX","offsetY"],optional:["assertedEvents","button","deviceType","duration","frame","target","timeout"]},[a.Schema.StepType.DoubleClick]:{required:["offsetX","offsetY","selectors"],optional:["assertedEvents","button","deviceType","frame","target","timeout"]},[a.Schema.StepType.Hover]:{required:["selectors"],optional:["assertedEvents","frame","target","timeout"]},[a.Schema.StepType.Change]:{required:["selectors","value"],optional:["assertedEvents","frame","target","timeout"]},[a.Schema.StepType.KeyDown]:{required:["key"],optional:["assertedEvents","target","timeout"]},[a.Schema.StepType.KeyUp]:{required:["key"],optional:["assertedEvents","target","timeout"]},[a.Schema.StepType.Scroll]:{required:[],optional:["assertedEvents","frame","target","timeout","x","y"]},[a.Schema.StepType.Close]:{required:[],optional:["assertedEvents","target","timeout"]},[a.Schema.StepType.Navigate]:{required:["url"],optional:["assertedEvents","target","timeout"]},[a.Schema.StepType.WaitForElement]:{required:["selectors"],optional:["assertedEvents","attributes","count","frame","operator","properties","target","timeout","visible"]},[a.Schema.StepType.WaitForExpression]:{required:["expression"],optional:["assertedEvents","frame","target","timeout"]},[a.Schema.StepType.CustomStep]:{required:["name","parameters"],optional:["assertedEvents","target","timeout"]},[a.Schema.StepType.EmulateNetworkConditions]:{required:["download","latency","upload"],optional:["assertedEvents","target","timeout"]},[a.Schema.StepType.SetViewport]:{required:["deviceScaleFactor","hasTouch","height","isLandscape","isMobile","width"],optional:["assertedEvents","target","timeout"]}}),wt={notSaved:"Not saved: {error}",addAttribute:"Add {attributeName}",deleteRow:"Delete row",selectorPicker:"Select an element in the page to update selectors",addFrameIndex:"Add frame index within the frame tree",removeFrameIndex:"Remove frame index",addSelectorPart:"Add a selector part",removeSelectorPart:"Remove a selector part",addSelector:"Add a selector",removeSelector:"Remove a selector",unknownActionType:"Unknown action type."},St=i.i18n.registerUIStrings("panels/recorder/components/StepEditor.ts",wt),xt=i.i18n.getLocalizedString.bind(void 0,St);class $t extends Event{static eventName="stepedited";data;constructor(e){super($t.eventName,{bubbles:!0,composed:!0}),this.data=e}}class kt{static#lt=new S.SharedObject.SharedObject((()=>a.RecordingPlayer.RecordingPlayer.connectPuppeteer()),(({browser:e})=>a.RecordingPlayer.RecordingPlayer.disconnectPuppeteer(e)));static async default(e){const t={type:e},i=yt[t.type];let s=Promise.resolve();for(const e of i.required)s=Promise.all([s,(async()=>Object.assign(t,{[e]:await this.defaultByAttribute(t,e)}))()]);return await s,Object.freeze(t)}static async defaultByAttribute(e,t){return this.#lt.run((e=>{switch(t){case"assertedEvents":return nt(ft.assertedEvents,new ot({0:{url:e.page.url()||ft.assertedEvents[0].url}}));case"url":return e.page.url()||ft.url;case"height":return e.page.evaluate((()=>visualViewport.height))||ft.height;case"width":return e.page.evaluate((()=>visualViewport.width))||ft.width;default:return ft[t]}}))}static fromStep(e){const t=structuredClone(e);for(const i of["parameters","properties"])i in e&&void 0!==e[i]&&(t[i]=JSON.stringify(e[i]));if("attributes"in e&&e.attributes){t.attributes=[];for(const[i,s]of Object.entries(e.attributes))t.attributes.push({name:i,value:s})}return"selectors"in e&&(t.selectors=e.selectors.map((e=>"string"==typeof e?[e]:[...e]))),st(t)}static toStep(e){const t=structuredClone(e);for(const i of["parameters","properties"]){const s=e[i];s&&Object.assign(t,{[i]:JSON.parse(s)})}if(e.attributes)if(0!==e.attributes.length){const i={};for(const{name:t,value:s}of e.attributes)Object.assign(i,{[t]:s});Object.assign(t,{attributes:i})}else"attributes"in t&&delete t.attributes;if(e.selectors){const i=e.selectors.filter((e=>e.length>0)).map((e=>1===e.length?e[0]:[...e]));0!==i.length?Object.assign(t,{selectors:i}):"selectors"in t&&delete t.selectors}return e.frame&&0===e.frame.length&&"frame"in t&&delete t.frame,i=a.SchemaUtils.parseStep(t),JSON.parse(JSON.stringify(i));var i}}let Tt=class extends pt{static styles=[tt];#dt=new w.SelectorPicker.SelectorPicker(this);constructor(){super(),this.disabled=!1}#e=e=>{e.preventDefault(),e.stopPropagation(),this.#dt.toggle()};disconnectedCallback(){super.disconnectedCallback(),this.#dt.stop()}render(){if(!this.disabled)return lt`<devtools-button
      @click=${this.#e}
      .title=${xt(wt.selectorPicker)}
      class="selector-picker"
      .size=${"SMALL"}
      .iconName=${"select-element"}
      .active=${this.#dt.active}
      .variant=${"secondary"}
    ></devtools-button>`}};at([ut()],Tt.prototype,"disabled",void 0),Tt=at([ht("devtools-recorder-selector-picker-button")],Tt);let Et=class extends pt{static styles=[tt];#ct=new Set;constructor(){super(),this.state={type:a.Schema.StepType.WaitForElement},this.isTypeEditable=!0,this.disabled=!1}createRenderRoot(){const e=super.createRenderRoot();return e.addEventListener("keydown",this.#pt),e}set step(e){this.state=st(kt.fromStep(e)),this.error=void 0}#ht(e){try{this.dispatchEvent(new $t(kt.toStep(e))),this.state=e}catch(e){this.error=e.message}}#ut=e=>{e.preventDefault(),e.stopPropagation(),this.#ht(nt(this.state,{target:e.data.target,frame:e.data.frame,selectors:e.data.selectors.map((e=>"string"==typeof e?[e]:e)),offsetX:e.data.offsetX,offsetY:e.data.offsetY}))};#gt=(e,t,i)=>s=>{s.preventDefault(),s.stopPropagation(),this.#ht(nt(this.state,e)),this.#mt(t),i&&l.userMetrics.recordingEdited(i)};#pt=e=>{if(it(e instanceof KeyboardEvent),e.target instanceof y.SuggestionInput.SuggestionInput&&"Enter"===e.key){e.preventDefault(),e.stopPropagation();const t=this.renderRoot.querySelectorAll("devtools-suggestion-input"),i=[...t].findIndex((t=>t===e.target));i>=0&&i+1<t.length?t[i+1].focus():e.target.blur()}};#vt=e=>t=>{if(it(t.target instanceof y.SuggestionInput.SuggestionInput),t.target.disabled)return;const i=bt[e.attribute],s=vt[i](t.target.value),r=e.from.bind(this)(s);r&&(this.#ht(nt(this.state,r)),e.metric&&l.userMetrics.recordingEdited(e.metric))};#bt=async e=>{if(it(e.target instanceof y.SuggestionInput.SuggestionInput),e.target.disabled)return;const t=e.target.value;t!==this.state.type&&(Object.values(a.Schema.StepType).includes(t)?(this.#ht(await kt.default(t)),l.userMetrics.recordingEdited(l.UserMetrics.RecordingEdited.TypeChanged)):this.error=xt(wt.unknownActionType))};#ft=async e=>{e.preventDefault(),e.stopPropagation();const t=e.target.dataset.attribute;this.#ht(nt(this.state,{[t]:await kt.defaultByAttribute(this.state,t)})),this.#mt(`[data-attribute=${t}].attribute devtools-suggestion-input`)};#yt(e){if(!this.disabled)return lt`
      <devtools-button
        title=${e.title}
        .size=${"SMALL"}
        .iconName=${e.iconName}
        .variant=${"secondary"}
        class="inline-button ${e.class}"
        @click=${e.onClick}
      ></devtools-button>
    `}#wt(e){if(this.disabled)return;return[...yt[this.state.type].optional].includes(e)&&!this.disabled?lt`<devtools-button
      .size=${"SMALL"}
      .iconName=${"bin"}
      .variant=${"secondary"}
      .title=${xt(wt.deleteRow)}
      class="inline-button delete-row"
      data-attribute=${e}
      @click=${t=>{t.preventDefault(),t.stopPropagation(),this.#ht(nt(this.state,{[e]:void 0}))}}
    ></devtools-button>`:void 0}#St(e){return this.#ct.add("type"),lt`<div class="row attribute" data-attribute="type">
      <div>type<span class="separator">:</span></div>
      <devtools-suggestion-input
        .disabled=${!e||this.disabled}
        .options=${Object.values(a.Schema.StepType)}
        .placeholder=${ft.type}
        .value=${mt(this.state.type)}
        @blur=${this.#bt}
      ></devtools-suggestion-input>
    </div>`}#xt(e){this.#ct.add(e);const t=this.state[e]?.toString();if(void 0!==t)return lt`<div class="row attribute" data-attribute=${e}>
      <div>${e}<span class="separator">:</span></div>
      <devtools-suggestion-input
        .disabled=${this.disabled}
        .placeholder=${ft[e].toString()}
        .value=${mt(t)}
        .mimeType=${(()=>{switch(e){case"expression":return"text/javascript";case"properties":return"application/json";default:return""}})()}
        @blur=${this.#vt({attribute:e,from(t){if(void 0!==this.state[e]){if("properties"===e)l.userMetrics.recordingAssertion(l.UserMetrics.RecordingAssertion.PropertyAssertionEdited);return{[e]:t}}},metric:l.UserMetrics.RecordingEdited.OtherEditing})}
      ></devtools-suggestion-input>
      ${this.#wt(e)}
    </div>`}#$t(){if(this.#ct.add("frame"),void 0!==this.state.frame)return lt`
      <div class="attribute" data-attribute="frame">
        <div class="row">
          <div>frame<span class="separator">:</span></div>
          ${this.#wt("frame")}
        </div>
        ${this.state.frame.map(((e,t,i)=>lt`
            <div class="padded row">
              <devtools-suggestion-input
                .disabled=${this.disabled}
                .placeholder=${ft.frame[0].toString()}
                .value=${mt(e.toString())}
                data-path=${`frame.${t}`}
                @blur=${this.#vt({attribute:"frame",from(e){if(void 0!==this.state.frame?.[t])return{frame:new ot({[t]:e})}},metric:l.UserMetrics.RecordingEdited.OtherEditing})}
              ></devtools-suggestion-input>
              ${this.#yt({class:"add-frame",title:xt(wt.addFrameIndex),iconName:"plus",onClick:this.#gt({frame:new ot({[t+1]:new rt(ft.frame[0])})},`devtools-suggestion-input[data-path="frame.${t+1}"]`,l.UserMetrics.RecordingEdited.OtherEditing)})}
              ${this.#yt({class:"remove-frame",title:xt(wt.removeFrameIndex),iconName:"minus",onClick:this.#gt({frame:new ot({[t]:void 0})},`devtools-suggestion-input[data-path="frame.${Math.min(t,i.length-2)}"]`,l.UserMetrics.RecordingEdited.OtherEditing)})}
            </div>
          `))}
      </div>
    `}#kt(){if(this.#ct.add("selectors"),void 0!==this.state.selectors)return lt`<div class="attribute" data-attribute="selectors">
      <div class="row">
        <div>selectors<span class="separator">:</span></div>
        <devtools-recorder-selector-picker-button
          @selectorpicked=${this.#ut}
          .disabled=${this.disabled}
        ></devtools-recorder-selector-picker-button>
        ${this.#wt("selectors")}
      </div>
      ${this.state.selectors.map(((e,t,i)=>lt`<div class="padded row" data-selector-path=${t}>
            <div>selector #${t+1}<span class="separator">:</span></div>
            ${this.#yt({class:"add-selector",title:xt(wt.addSelector),iconName:"plus",onClick:this.#gt({selectors:new ot({[t+1]:new rt(structuredClone(ft.selectors[0]))})},`devtools-suggestion-input[data-path="selectors.${t+1}.0"]`,l.UserMetrics.RecordingEdited.SelectorAdded)})}
            ${this.#yt({class:"remove-selector",title:xt(wt.removeSelector),iconName:"minus",onClick:this.#gt({selectors:new ot({[t]:void 0})},`devtools-suggestion-input[data-path="selectors.${Math.min(t,i.length-2)}.0"]`,l.UserMetrics.RecordingEdited.SelectorRemoved)})}
          </div>
          ${e.map(((e,i,s)=>lt`<div
              class="double padded row"
              data-selector-path="${t}.${i}"
            >
              <devtools-suggestion-input
                .disabled=${this.disabled}
                .placeholder=${ft.selectors[0][0]}
                .value=${mt(e)}
                data-path=${`selectors.${t}.${i}`}
                @blur=${this.#vt({attribute:"selectors",from(e){if(void 0!==this.state.selectors?.[t]?.[i])return{selectors:new ot({[t]:new ot({[i]:e})})}},metric:l.UserMetrics.RecordingEdited.SelectorPartEdited})}
              ></devtools-suggestion-input>
              ${this.#yt({class:"add-selector-part",title:xt(wt.addSelectorPart),iconName:"plus",onClick:this.#gt({selectors:new ot({[t]:new ot({[i+1]:new rt(ft.selectors[0][0])})})},`devtools-suggestion-input[data-path="selectors.${t}.${i+1}"]`,l.UserMetrics.RecordingEdited.SelectorPartAdded)})}
              ${this.#yt({class:"remove-selector-part",title:xt(wt.removeSelectorPart),iconName:"minus",onClick:this.#gt({selectors:new ot({[t]:new ot({[i]:void 0})})},`devtools-suggestion-input[data-path="selectors.${t}.${Math.min(i,s.length-2)}"]`,l.UserMetrics.RecordingEdited.SelectorPartRemoved)})}
            </div>`))}`))}
    </div>`}#Tt(){if(this.#ct.add("assertedEvents"),void 0!==this.state.assertedEvents)return lt`<div class="attribute" data-attribute="assertedEvents">
      <div class="row">
        <div>asserted events<span class="separator">:</span></div>
        ${this.#wt("assertedEvents")}
      </div>
      ${this.state.assertedEvents.map(((e,t)=>lt` <div class="padded row">
            <div>type<span class="separator">:</span></div>
            <div>${e.type}</div>
          </div>
          <div class="padded row">
            <div>title<span class="separator">:</span></div>
            <devtools-suggestion-input
              .disabled=${this.disabled}
              .placeholder=${ft.assertedEvents[0].title}
              .value=${mt(e.title??"")}
              @blur=${this.#vt({attribute:"assertedEvents",from(e){if(void 0!==this.state.assertedEvents?.[t]?.title)return{assertedEvents:new ot({[t]:{title:e}})}},metric:l.UserMetrics.RecordingEdited.OtherEditing})}
            ></devtools-suggestion-input>
          </div>
          <div class="padded row">
            <div>url<span class="separator">:</span></div>
            <devtools-suggestion-input
              .disabled=${this.disabled}
              .placeholder=${ft.assertedEvents[0].url}
              .value=${mt(e.url??"")}
              @blur=${this.#vt({attribute:"url",from(e){if(void 0!==this.state.assertedEvents?.[t]?.url)return{assertedEvents:new ot({[t]:{url:e}})}},metric:l.UserMetrics.RecordingEdited.OtherEditing})}
            ></devtools-suggestion-input>
          </div>`))}
    </div> `}#Et(){if(this.#ct.add("attributes"),void 0!==this.state.attributes)return lt`<div class="attribute" data-attribute="attributes">
      <div class="row">
        <div>attributes<span class="separator">:</span></div>
        ${this.#wt("attributes")}
      </div>
      ${this.state.attributes.map((({name:e,value:t},i,s)=>lt`<div class="padded row">
          <devtools-suggestion-input
            .disabled=${this.disabled}
            .placeholder=${ft.attributes[0].name}
            .value=${mt(e)}
            data-path=${`attributes.${i}.name`}
            @blur=${this.#vt({attribute:"attributes",from(e){if(void 0!==this.state.attributes?.[i]?.name)return l.userMetrics.recordingAssertion(l.UserMetrics.RecordingAssertion.AttributeAssertionEdited),{attributes:new ot({[i]:{name:e}})}},metric:l.UserMetrics.RecordingEdited.OtherEditing})}
          ></devtools-suggestion-input>
          <span class="separator">:</span>
          <devtools-suggestion-input
            .disabled=${this.disabled}
            .placeholder=${ft.attributes[0].value}
            .value=${mt(t)}
            data-path=${`attributes.${i}.value`}
            @blur=${this.#vt({attribute:"attributes",from(e){if(void 0!==this.state.attributes?.[i]?.value)return l.userMetrics.recordingAssertion(l.UserMetrics.RecordingAssertion.AttributeAssertionEdited),{attributes:new ot({[i]:{value:e}})}},metric:l.UserMetrics.RecordingEdited.OtherEditing})}
          ></devtools-suggestion-input>
          ${this.#yt({class:"add-attribute-assertion",title:xt(wt.addSelectorPart),iconName:"plus",onClick:this.#gt({attributes:new ot({[i+1]:new rt((()=>{{const e=new Set(s.map((({name:e})=>e))),t=ft.attributes[0];let i=t.name,r=0;for(;e.has(i);)++r,i=`${t.name}-${r}`;return{...t,name:i}}})())})},`devtools-suggestion-input[data-path="attributes.${i+1}.name"]`,l.UserMetrics.RecordingEdited.OtherEditing)})}
          ${this.#yt({class:"remove-attribute-assertion",title:xt(wt.removeSelectorPart),iconName:"minus",onClick:this.#gt({attributes:new ot({[i]:void 0})},`devtools-suggestion-input[data-path="attributes.${Math.min(i,s.length-2)}.value"]`,l.UserMetrics.RecordingEdited.OtherEditing)})}
        </div>`))}
    </div>`}#Rt(){return[...yt[this.state.type].optional].filter((e=>void 0===this.state[e])).map((e=>lt`<devtools-button
          .variant=${"secondary"}
          class="add-row"
          data-attribute=${e}
          @click=${this.#ft}
        >
          ${xt(wt.addAttribute,{attributeName:e})}
        </devtools-button>`))}#mt=e=>{this.updateComplete.then((()=>{const t=this.renderRoot.querySelector(e);t?.focus()}))};render(){this.#ct=new Set;return lt`
      <div class="wrapper">
        ${this.#St(this.isTypeEditable)} ${this.#xt("target")}
        ${this.#$t()} ${this.#kt()}
        ${this.#xt("deviceType")} ${this.#xt("button")}
        ${this.#xt("url")} ${this.#xt("x")}
        ${this.#xt("y")} ${this.#xt("offsetX")}
        ${this.#xt("offsetY")} ${this.#xt("value")}
        ${this.#xt("key")} ${this.#xt("operator")}
        ${this.#xt("count")} ${this.#xt("expression")}
        ${this.#xt("duration")} ${this.#Tt()}
        ${this.#xt("timeout")} ${this.#xt("width")}
        ${this.#xt("height")} ${this.#xt("deviceScaleFactor")}
        ${this.#xt("isMobile")} ${this.#xt("hasTouch")}
        ${this.#xt("isLandscape")} ${this.#xt("download")}
        ${this.#xt("upload")} ${this.#xt("latency")}
        ${this.#xt("name")} ${this.#xt("parameters")}
        ${this.#xt("visible")} ${this.#xt("properties")}
        ${this.#Et()}
        ${this.error?lt`
              <div class="error">
                ${xt(wt.notSaved,{error:this.error})}
              </div>
            `:void 0}
        ${this.disabled?void 0:lt`<div
              class="row-buttons wrapped gap row regular-font no-margin"
            >
              ${this.#Rt()}
            </div>`}
      </div>
    `}};at([gt()],Et.prototype,"state",void 0),at([gt()],Et.prototype,"error",void 0),at([ut()],Et.prototype,"isTypeEditable",void 0),at([ut()],Et.prototype,"disabled",void 0),Et=at([ht("devtools-recorder-step-editor")],Et);var Rt=Object.freeze({__proto__:null,StepEditedEvent:$t,EditorState:kt,get StepEditor(){return Et}});export{I as ControlButton,j as CreateRecordingView,W as RecordingListView,Ke as RecordingView,ge as ReplayButton,oe as SelectButton,et as StartView,Rt as StepEditor,Be as StepView,fe as TimelineSection};
