import*as e from"../../core/common/common.js";import*as t from"../../core/i18n/i18n.js";import*as i from"../../core/sdk/sdk.js";import*as l from"../../models/autofill_manager/autofill_manager.js";import*as s from"../../ui/components/adorners/adorners.js";import*as o from"../../ui/components/data_grid/data_grid.js";import*as d from"../../ui/components/helpers/helpers.js";import*as n from"../../ui/components/input/input.js";import*as a from"../../ui/components/legacy_wrapper/legacy_wrapper.js";import*as r from"../../ui/lit-html/lit-html.js";import*as h from"../../ui/visual_logging/visual_logging.js";const c=new CSSStyleSheet;c.replaceSync(".placeholder-container{height:calc(100% - 29px);display:flex;justify-content:center;align-items:center}.placeholder{font-size:15px}.address{padding:10px;margin-right:auto}.filled-fields-grid{border-top:1px solid var(--sys-color-divider);box-sizing:border-box}.content-container{display:flex;flex-flow:column;height:100%}.grid-wrapper{flex-grow:1}.checkbox-label{display:flex;align-items:center}.right-to-left{display:flex;flex-flow:row-reverse wrap;justify-content:flex-end}.label-container{padding:5px 5px 0}.top-right-corner{display:flex;justify-content:flex-end;padding:5px}.matches-filled-field{background-color:var(--sys-color-tonal-container)}.highlighted{background-color:var(--sys-color-state-focus-select)}\n/*# sourceURL=autofillView.css */\n");const u={noDataAvailable:"No Autofill event detected",value:"Value",predictedAutofillValue:"Predicted autofill value",formField:"Form field",autocompleteAttribute:"Autocomplete attribute",attr:"attr",inferredByHeuristics:"Inferred by heuristics",heur:"heur",autoShow:"Automatically open tab on autofill"},g=t.i18n.registerUIStrings("panels/autofill/AutofillView.ts",u),f=t.i18n.getLocalizedString.bind(void 0,g);class p extends a.LegacyWrapper.WrappableComponent{static litTagName=r.literal`devtools-autofill-view`;#e=this.attachShadow({mode:"open"});#t=this.#i.bind(this);#l;#s="";#o=[];#d=[];#n=[];#a=null;connectedCallback(){this.#e.adoptedStyleSheets=[n.checkboxStyles,c];const t=l.AutofillManager.AutofillManager.instance(),s=t.getLastFilledAddressForm();s&&({address:this.#s,filledFields:this.#o,matches:this.#d,autofillModel:this.#a}=s),t.addEventListener(l.AutofillManager.Events.AddressFormFilled,this.#r,this),i.TargetManager.TargetManager.instance().addModelListener(i.ResourceTreeModel.ResourceTreeModel,i.ResourceTreeModel.Events.PrimaryPageChanged,this.#h,this),this.#l=e.Settings.Settings.instance().createSetting("autoOpenAutofillViewOnEvent",!0),d.ScheduledRender.scheduleRender(this,this.#t)}#h(){this.#s="",this.#o=[],this.#d=[],this.#n=[],this.#a=null,d.ScheduledRender.scheduleRender(this,this.#t)}#r({data:e}){({address:this.#s,filledFields:this.#o,matches:this.#d,autofillModel:this.#a}=e),this.#n=[],d.ScheduledRender.scheduleRender(this,this.#t)}async#i(){if(!d.ScheduledRender.isScheduledRender(this))throw new Error("AutofillView render was not scheduled");this.#s||this.#o.length?r.render(r.html`
      <div class="content-container" jslog=${h.pane().context("autofill")}>
        <div class="right-to-left">
          <div class="label-container">
            <label class="checkbox-label">
              <input type="checkbox" tabindex=-1 ?checked=${this.#l?.get()} @change=${this.#c.bind(this)} jslog=${h.toggle().track({change:!0}).context("auto-open")}>
              <span>${f(u.autoShow)}</span>
            </label>
          </div>
          ${this.#u()}
        </div>
        ${this.#g()}
      </div>
    `,this.#e,{host:this}):r.render(r.html`
        <div class="top-right-corner">
          <label class="checkbox-label">
            <input type="checkbox" tabindex=-1 ?checked=${this.#l?.get()} @change=${this.#c.bind(this)} jslog=${h.toggle().track({change:!0}).context("auto-open")}>
            <span>${f(u.autoShow)}</span>
          </label>
        </div>
        <div class="placeholder-container" jslog=${h.pane().context("autofill-empty")}>
          <div class="placeholder">${f(u.noDataAvailable)}</h1>
        </div>
      `,this.#e,{host:this})}#c(e){const{checked:t}=e.target;this.#l?.set(t)}#u(){if(!this.#s)return r.nothing;const e=(e,t)=>{const i=this.#s.substring(e,t).split("\n"),l=i.map(((e,t)=>t===i.length-1?e:r.html`${e}<br>`)),s=r.Directives.classMap({"matches-filled-field":this.#d.filter((t=>t.startIndex<=e&&t.endIndex>e)).length>0,highlighted:this.#n.filter((t=>t.startIndex<=e&&t.endIndex>e)).length>0});return r.html`
        <span
          class=${s}
          @mouseenter=${()=>this.#f(e)}
          @mouseleave=${this.#p}
        >${l}</span>`},t=[],i=new Set([0,this.#s.length]);for(const e of this.#d)i.add(e.startIndex),i.add(e.endIndex);const l=Array.from(i).sort(((e,t)=>e-t));for(let i=0;i<l.length-1;i++)t.push(e(l[i],l[i+1]));return r.html`
      <div class="address">
        ${t}
      </div>
    `}#f(e){this.#n=this.#d.filter((t=>t.startIndex<=e&&t.endIndex>e)),d.ScheduledRender.scheduleRender(this,this.#t)}#p(){this.#n=[],d.ScheduledRender.scheduleRender(this,this.#t)}#g(){if(!this.#o.length)return r.nothing;const e={columns:[{id:"name",title:f(u.formField),widthWeighting:50,hideable:!1,visible:!0,sortable:!0},{id:"autofillType",title:f(u.predictedAutofillValue),widthWeighting:50,hideable:!1,visible:!0,sortable:!0},{id:"value",title:f(u.value),widthWeighting:50,hideable:!1,visible:!0,sortable:!0},{id:"filledFieldIndex",title:"filledFieldIndex",widthWeighting:50,hideable:!0,visible:!1}],rows:this.#m(),striped:!0};return r.html`
      <div class="grid-wrapper">
        <${o.DataGridController.DataGridController.litTagName}
          @rowmouseenter=${this.#v}
          @rowmouseleave=${this.#b}
          class="filled-fields-grid"
          .data=${e}
        >
        </${o.DataGridController.DataGridController.litTagName}>
      </div>
    `}#v(e){const t=e.data.row.cells[3].value;if("number"!=typeof t)return;this.#n=this.#d.filter((e=>e.filledFieldIndex===t)),d.ScheduledRender.scheduleRender(this,this.#t);const l=this.#o[t].fieldId;if(!this.#a)return;const s=this.#a.target().model(i.DOMModel.DOMModel);if(!s)return;const o=new i.DOMModel.DeferredDOMNode(this.#a.target(),l);o&&s.overlayModel().highlightInOverlay({deferredNode:o},"all")}#b(){this.#n=[],d.ScheduledRender.scheduleRender(this,this.#t),i.OverlayModel.OverlayModel.hideDOMNodeHighlight()}#m(){const e=new Set(this.#n.map((e=>e.filledFieldIndex)));return this.#o.map(((t,i)=>({cells:[{columnId:"name",value:`${t.name||`#${t.id}`} (${t.htmlType})`},{columnId:"autofillType",value:t.autofillType,renderer:()=>this.#w(t.autofillType,t.fillingStrategy)},{columnId:"value",value:`"${t.value}"`},{columnId:"filledFieldIndex",value:i}],styles:{"font-family":"var(--monospace-font-family)","font-size":"var(--monospace-font-size)",...e.has(i)&&{"background-color":"var(--sys-color-state-hover-on-subtle)"}}})))}#w(e,t){const i=document.createElement("span");let l="";switch(t){case"autocompleteAttribute":i.textContent=f(u.attr),l=f(u.autocompleteAttribute);break;case"autofillInferred":i.textContent=f(u.heur),l=f(u.inferredByHeuristics)}return r.html`
      ${e}
      ${i.textContent?r.html`
          <${s.Adorner.Adorner.litTagName} title=${l} .data=${{name:t,content:i}}>
        `:r.nothing}
    `}}d.CustomElements.defineComponent("devtools-autofill-view",p);var m=Object.freeze({__proto__:null,i18nString:f,AutofillView:p});export{m as AutofillView};
