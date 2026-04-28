import*as e from"../helpers/helpers.js";import*as t from"../../lit-html/lit-html.js";import*as i from"../../visual_logging/visual_logging.js";const o=new CSSStyleSheet;o.replaceSync(":host{overflow:hidden}div{line-height:1.7em}.arrow-icon-button{cursor:pointer;padding:1px 0;border:none;background:none;margin-right:2px}.arrow-icon{display:inline-block;-webkit-mask-image:var(--image-file-triangle-right);background-color:var(--icon-default);margin-top:2px;height:14px;width:14px;transition:transform 200ms}.arrow-icon.expanded{transform:rotate(90deg)}.expandable-list-container{display:flex;margin-top:4px}.expandable-list-items{overflow:hidden}.link,\n.devtools-link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px}button.link{border:none;background:none;font-family:inherit;font-size:inherit}.text-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n/*# sourceURL=expandableList.css */\n");class n extends HTMLElement{static litTagName=t.literal`devtools-expandable-list`;#e=this.attachShadow({mode:"open"});#t=!1;#i=[];set data(e){this.#i=e.rows,this.#o()}#n(){this.#t=!this.#t,this.#o()}connectedCallback(){this.#e.adoptedStyleSheets=[o]}#o(){this.#i.length<1||t.render(t.html`
      <div class="expandable-list-container">
        <div>
          ${this.#i.length>1?t.html`
              <button @click=${()=>this.#n()} class="arrow-icon-button">
                <span class="arrow-icon ${this.#t?"expanded":""}"
                jslog=${i.treeItemExpand().track({click:!0})}></span>
              </button>
            `:t.nothing}
        </div>
        <div class="expandable-list-items">
          ${this.#i.filter(((e,t)=>this.#t||0===t)).map((e=>t.html`
            ${e}
          `))}
        </div>
      </div>
    `,this.#e,{host:this})}}e.CustomElements.defineComponent("devtools-expandable-list",n);var s=Object.freeze({__proto__:null,ExpandableList:n});export{s as ExpandableList};
