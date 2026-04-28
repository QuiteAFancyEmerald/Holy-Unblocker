import*as e from"../../../core/common/common.js";import*as t from"../../../core/i18n/i18n.js";import*as a from"../../../core/sdk/sdk.js";import*as r from"../../../ui/components/buttons/buttons.js";import*as o from"../../../ui/components/chrome_link/chrome_link.js";import*as i from"../../../ui/components/expandable_list/expandable_list.js";import*as n from"../../../ui/components/helpers/helpers.js";import*as s from"../../../ui/components/icon_button/icon_button.js";import*as l from"../../../ui/components/legacy_wrapper/legacy_wrapper.js";import*as c from"../../../ui/components/render_coordinator/render_coordinator.js";import*as d from"../../../ui/components/report_view/report_view.js";import*as h from"../../../ui/components/tree_outline/tree_outline.js";import*as u from"../../../ui/legacy/components/utils/utils.js";import*as m from"../../../ui/lit-html/lit-html.js";import*as g from"../../../ui/visual_logging/visual_logging.js";import*as p from"../../../ui/components/data_grid/data_grid.js";import*as b from"../../../core/platform/platform.js";import*as w from"../../../core/root/root.js";import*as f from"../../../models/bindings/bindings.js";import*as v from"../../../models/workspace/workspace.js";import*as k from"../../network/forward/forward.js";import*as y from"../../../third_party/csp_evaluator/csp_evaluator.js";import*as T from"../../../ui/components/adorners/adorners.js";import*as S from"../../../core/host/host.js";import*as R from"../../../ui/components/input/input.js";import*as $ from"../../../ui/legacy/legacy.js";const x={notMainFrame:"Navigation happened in a frame other than the main frame.",backForwardCacheDisabled:"Back/forward cache is disabled by flags. Visit chrome://flags/#back-forward-cache to enable it locally on this device.",relatedActiveContentsExist:"The page was opened using '`window.open()`' and another tab has a reference to it, or the page opened a window.",HTTPStatusNotOK:"Only pages with a status code of 2XX can be cached.",schemeNotHTTPOrHTTPS:"Only pages whose URL scheme is HTTP / HTTPS can be cached.",loading:"The page did not finish loading before navigating away.",wasGrantedMediaAccess:"Pages that have granted access to record video or audio are not currently eligible for back/forward cache.",HTTPMethodNotGET:"Only pages loaded via a GET request are eligible for back/forward cache.",subframeIsNavigating:"An iframe on the page started a navigation that did not complete.",timeout:"The page exceeded the maximum time in back/forward cache and was expired.",cacheLimit:"The page was evicted from the cache to allow another page to be cached.",JavaScriptExecution:"Chrome detected an attempt to execute JavaScript while in the cache.",rendererProcessKilled:"The renderer process for the page in back/forward cache was killed.",rendererProcessCrashed:"The renderer process for the page in back/forward cache crashed.",grantedMediaStreamAccess:"Pages that have granted media stream access are not currently eligible for back/forward cache.",cacheFlushed:"The cache was intentionally cleared.",serviceWorkerVersionActivation:"The page was evicted from back/forward cache due to a service worker activation.",sessionRestored:"Chrome restarted and cleared the back/forward cache entries.",serviceWorkerPostMessage:"A service worker attempted to send the page in back/forward cache a `MessageEvent`.",enteredBackForwardCacheBeforeServiceWorkerHostAdded:"A service worker was activated while the page was in back/forward cache.",serviceWorkerClaim:"The page was claimed by a service worker while it is in back/forward cache.",haveInnerContents:"Pages that use portals are not currently eligible for back/forward cache.",timeoutPuttingInCache:"The page timed out entering back/forward cache (likely due to long-running pagehide handlers).",backForwardCacheDisabledByLowMemory:"Back/forward cache is disabled due to insufficient memory.",backForwardCacheDisabledByCommandLine:"Back/forward cache is disabled by the command line.",networkRequestDatapipeDrainedAsBytesConsumer:"Pages that have inflight fetch() or XHR are not currently eligible for back/forward cache.",networkRequestRedirected:"The page was evicted from back/forward cache because an active network request involved a redirect.",networkRequestTimeout:"The page was evicted from the cache because a network connection was open too long. Chrome limits the amount of time that a page may receive data while cached.",networkExceedsBufferLimit:"The page was evicted from the cache because an active network connection received too much data. Chrome limits the amount of data that a page may receive while cached.",navigationCancelledWhileRestoring:"Navigation was cancelled before the page could be restored from back/forward cache.",backForwardCacheDisabledForPrerender:"Back/forward cache is disabled for prerenderer.",userAgentOverrideDiffers:"Browser has changed the user agent override header.",foregroundCacheLimit:"The page was evicted from the cache to allow another page to be cached.",backForwardCacheDisabledForDelegate:"Back/forward cache is not supported by delegate.",unloadHandlerExistsInMainFrame:"The page has an unload handler in the main frame.",unloadHandlerExistsInSubFrame:"The page has an unload handler in a sub frame.",serviceWorkerUnregistration:"ServiceWorker was unregistered while a page was in back/forward cache.",noResponseHead:"Pages that do not have a valid response head cannot enter back/forward cache.",cacheControlNoStore:"Pages with cache-control:no-store header cannot enter back/forward cache.",ineligibleAPI:"Ineligible APIs were used.",internalError:"Internal error.",webSocket:"Pages with WebSocket cannot enter back/forward cache.",webTransport:"Pages with WebTransport cannot enter back/forward cache.",webRTC:"Pages with WebRTC cannot enter back/forward cache.",mainResourceHasCacheControlNoStore:"Pages whose main resource has cache-control:no-store cannot enter back/forward cache.",mainResourceHasCacheControlNoCache:"Pages whose main resource has cache-control:no-cache cannot enter back/forward cache.",subresourceHasCacheControlNoStore:"Pages whose subresource has cache-control:no-store cannot enter back/forward cache.",subresourceHasCacheControlNoCache:"Pages whose subresource has cache-control:no-cache cannot enter back/forward cache.",containsPlugins:"Pages containing plugins are not currently eligible for back/forward cache.",documentLoaded:"The document did not finish loading before navigating away.",dedicatedWorkerOrWorklet:"Pages that use a dedicated worker or worklet are not currently eligible for back/forward cache.",outstandingNetworkRequestOthers:"Pages with an in-flight network request are not currently eligible for back/forward cache.",outstandingIndexedDBTransaction:"Page with ongoing indexed DB transactions are not currently eligible for back/forward cache.",requestedNotificationsPermission:"Pages that have requested notifications permissions are not currently eligible for back/forward cache.",requestedMIDIPermission:"Pages that have requested MIDI permissions are not currently eligible for back/forward cache.",requestedAudioCapturePermission:"Pages that have requested audio capture permissions are not currently eligible for back/forward cache.",requestedVideoCapturePermission:"Pages that have requested video capture permissions are not currently eligible for back/forward cache.",requestedBackForwardCacheBlockedSensors:"Pages that have requested sensor permissions are not currently eligible for back/forward cache.",requestedBackgroundWorkPermission:"Pages that have requested background sync or fetch permissions are not currently eligible for back/forward cache.",broadcastChannel:"The page cannot be cached because it has a BroadcastChannel instance with registered listeners.",indexedDBConnection:"Pages that have an open IndexedDB connection are not currently eligible for back/forward cache.",webXR:"Pages that use WebXR are not currently eligible for back/forward cache.",sharedWorker:"Pages that use SharedWorker are not currently eligible for back/forward cache.",webLocks:"Pages that use WebLocks are not currently eligible for back/forward cache.",webHID:"Pages that use WebHID are not currently eligible for back/forward cache.",webShare:"Pages that use WebShare are not currently eligible for back/forwad cache.",requestedStorageAccessGrant:"Pages that have requested storage access are not currently eligible for back/forward cache.",webNfc:"Pages that use WebNfc are not currently eligible for back/forwad cache.",outstandingNetworkRequestFetch:"Pages with an in-flight fetch network request are not currently eligible for back/forward cache.",outstandingNetworkRequestXHR:"Pages with an in-flight XHR network request are not currently eligible for back/forward cache.",appBanner:"Pages that requested an AppBanner are not currently eligible for back/forward cache.",printing:"Pages that show Printing UI are not currently eligible for back/forward cache.",webDatabase:"Pages that use WebDatabase are not currently eligible for back/forward cache.",pictureInPicture:"Pages that use Picture-in-Picture are not currently eligible for back/forward cache.",portal:"Pages that use portals are not currently eligible for back/forward cache.",speechRecognizer:"Pages that use SpeechRecognizer are not currently eligible for back/forward cache.",idleManager:"Pages that use IdleManager are not currently eligible for back/forward cache.",paymentManager:"Pages that use PaymentManager are not currently eligible for back/forward cache.",speechSynthesis:"Pages that use SpeechSynthesis are not currently eligible for back/forward cache.",keyboardLock:"Pages that use Keyboard lock are not currently eligible for back/forward cache.",webOTPService:"Pages that use WebOTPService are not currently eligible for bfcache.",outstandingNetworkRequestDirectSocket:"Pages with an in-flight network request are not currently eligible for back/forward cache.",injectedJavascript:"Pages that `JavaScript` is injected into by extensions are not currently eligible for back/forward cache.",injectedStyleSheet:"Pages that a `StyleSheet` is injected into by extensions are not currently eligible for back/forward cache.",contentSecurityHandler:"Pages that use SecurityHandler are not eligible for back/forward cache.",contentWebAuthenticationAPI:"Pages that use WebAuthetication API are not eligible for back/forward cache.",contentFileChooser:"Pages that use FileChooser API are not eligible for back/forward cache.",contentSerial:"Pages that use Serial API are not eligible for back/forward cache.",contentFileSystemAccess:"Pages that use File System Access API are not eligible for back/forward cache.",contentMediaDevicesDispatcherHost:"Pages that use Media Device Dispatcher are not eligible for back/forward cache.",contentWebBluetooth:"Pages that use WebBluetooth API are not eligible for back/forward cache.",contentWebUSB:"Pages that use WebUSB API are not eligible for back/forward cache.",contentMediaSession:"Pages that use MediaSession API and set a playback state are not eligible for back/forward cache.",contentMediaSessionService:"Pages that use MediaSession API and set action handlers are not eligible for back/forward cache.",contentMediaPlay:"A media player was playing upon navigating away.",contentScreenReader:"Back/forward cache is disabled due to screen reader.",embedderPopupBlockerTabHelper:"Popup blocker was present upon navigating away.",embedderSafeBrowsingTriggeredPopupBlocker:"Safe Browsing considered this page to be abusive and blocked popup.",embedderSafeBrowsingThreatDetails:"Safe Browsing details were shown upon navigating away.",embedderAppBannerManager:"App Banner was present upon navigating away.",embedderDomDistillerViewerSource:"DOM Distiller Viewer was present upon navigating away.",embedderDomDistillerSelfDeletingRequestDelegate:"DOM distillation was in progress upon navigating away.",embedderOomInterventionTabHelper:"Out-Of-Memory Intervention bar was present upon navigating away.",embedderOfflinePage:"The offline page was shown upon navigating away.",embedderChromePasswordManagerClientBindCredentialManager:"Chrome Password Manager was present upon navigating away.",embedderPermissionRequestManager:"There were permission requests upon navigating away.",embedderModalDialog:"Modal dialog such as form resubmission or http password dialog was shown for the page upon navigating away.",embedderExtensions:"Back/forward cache is disabled due to extensions.",embedderExtensionMessaging:"Back/forward cache is disabled due to extensions using messaging API.",embedderExtensionMessagingForOpenPort:"Extensions with long-lived connection should close the connection before entering back/forward cache.",embedderExtensionSentMessageToCachedFrame:"Extensions with long-lived connection attempted to send messages to frames in back/forward cache.",errorDocument:"Back/forward cache is disabled due to a document error.",fencedFramesEmbedder:"Pages using FencedFrames cannot be stored in bfcache.",keepaliveRequest:"Back/forward cache is disabled due to a keepalive request.",jsNetworkRequestReceivedCacheControlNoStoreResource:"Back/forward cache is disabled because some JavaScript network request received resource with `Cache-Control: no-store` header.",indexedDBEvent:"Back/forward cache is disabled due to an IndexedDB event.",cookieDisabled:"Back/forward cache is disabled because cookies are disabled on a page that uses `Cache-Control: no-store`.",webRTCSticky:"Back/forward cache is disabled because WebRTC has been used.",webTransportSticky:"Back/forward cache is disabled because WebTransport has been used.",webSocketSticky:"Back/forward cache is disabled because WebSocket has been used.",HTTPAuthRequired:"Undefined",CookieFlushed:"Undefined"},C=t.i18n.registerUIStrings("panels/application/components/BackForwardCacheStrings.ts",x),N=t.i18n.getLazilyComputedLocalizedString.bind(void 0,C),I={NotPrimaryMainFrame:{name:N(x.notMainFrame)},BackForwardCacheDisabled:{name:N(x.backForwardCacheDisabled)},RelatedActiveContentsExist:{name:N(x.relatedActiveContentsExist)},HTTPStatusNotOK:{name:N(x.HTTPStatusNotOK)},SchemeNotHTTPOrHTTPS:{name:N(x.schemeNotHTTPOrHTTPS)},Loading:{name:N(x.loading)},WasGrantedMediaAccess:{name:N(x.wasGrantedMediaAccess)},HTTPMethodNotGET:{name:N(x.HTTPMethodNotGET)},SubframeIsNavigating:{name:N(x.subframeIsNavigating)},Timeout:{name:N(x.timeout)},CacheLimit:{name:N(x.cacheLimit)},JavaScriptExecution:{name:N(x.JavaScriptExecution)},RendererProcessKilled:{name:N(x.rendererProcessKilled)},RendererProcessCrashed:{name:N(x.rendererProcessCrashed)},GrantedMediaStreamAccess:{name:N(x.grantedMediaStreamAccess)},CacheFlushed:{name:N(x.cacheFlushed)},ServiceWorkerVersionActivation:{name:N(x.serviceWorkerVersionActivation)},SessionRestored:{name:N(x.sessionRestored)},ServiceWorkerPostMessage:{name:N(x.serviceWorkerPostMessage)},EnteredBackForwardCacheBeforeServiceWorkerHostAdded:{name:N(x.enteredBackForwardCacheBeforeServiceWorkerHostAdded)},ServiceWorkerClaim:{name:N(x.serviceWorkerClaim)},HaveInnerContents:{name:N(x.haveInnerContents)},TimeoutPuttingInCache:{name:N(x.timeoutPuttingInCache)},BackForwardCacheDisabledByLowMemory:{name:N(x.backForwardCacheDisabledByLowMemory)},BackForwardCacheDisabledByCommandLine:{name:N(x.backForwardCacheDisabledByCommandLine)},NetworkRequestDatapipeDrainedAsBytesConsumer:{name:N(x.networkRequestDatapipeDrainedAsBytesConsumer)},NetworkRequestRedirected:{name:N(x.networkRequestRedirected)},NetworkRequestTimeout:{name:N(x.networkRequestTimeout)},NetworkExceedsBufferLimit:{name:N(x.networkExceedsBufferLimit)},NavigationCancelledWhileRestoring:{name:N(x.navigationCancelledWhileRestoring)},BackForwardCacheDisabledForPrerender:{name:N(x.backForwardCacheDisabledForPrerender)},UserAgentOverrideDiffers:{name:N(x.userAgentOverrideDiffers)},ForegroundCacheLimit:{name:N(x.foregroundCacheLimit)},BackForwardCacheDisabledForDelegate:{name:N(x.backForwardCacheDisabledForDelegate)},UnloadHandlerExistsInMainFrame:{name:N(x.unloadHandlerExistsInMainFrame)},UnloadHandlerExistsInSubFrame:{name:N(x.unloadHandlerExistsInSubFrame)},ServiceWorkerUnregistration:{name:N(x.serviceWorkerUnregistration)},NoResponseHead:{name:N(x.noResponseHead)},CacheControlNoStore:{name:N(x.cacheControlNoStore)},CacheControlNoStoreCookieModified:{name:N(x.cacheControlNoStore)},CacheControlNoStoreHTTPOnlyCookieModified:{name:N(x.cacheControlNoStore)},DisableForRenderFrameHostCalled:{name:N(x.ineligibleAPI)},BlocklistedFeatures:{name:N(x.ineligibleAPI)},SchedulerTrackedFeatureUsed:{name:N(x.ineligibleAPI)},DomainNotAllowed:{name:N(x.internalError)},ConflictingBrowsingInstance:{name:N(x.internalError)},NotMostRecentNavigationEntry:{name:N(x.internalError)},IgnoreEventAndEvict:{name:N(x.internalError)},BrowsingInstanceNotSwapped:{name:N(x.internalError)},ActivationNavigationsDisallowedForBug1234857:{name:N(x.internalError)},Unknown:{name:N(x.internalError)},RenderFrameHostReused_SameSite:{name:N(x.internalError)},RenderFrameHostReused_CrossSite:{name:N(x.internalError)},WebSocket:{name:N(x.webSocket)},WebTransport:{name:N(x.webTransport)},WebRTC:{name:N(x.webRTC)},MainResourceHasCacheControlNoStore:{name:N(x.mainResourceHasCacheControlNoStore)},MainResourceHasCacheControlNoCache:{name:N(x.mainResourceHasCacheControlNoCache)},SubresourceHasCacheControlNoStore:{name:N(x.subresourceHasCacheControlNoStore)},SubresourceHasCacheControlNoCache:{name:N(x.subresourceHasCacheControlNoCache)},ContainsPlugins:{name:N(x.containsPlugins)},DocumentLoaded:{name:N(x.documentLoaded)},DedicatedWorkerOrWorklet:{name:N(x.dedicatedWorkerOrWorklet)},OutstandingNetworkRequestOthers:{name:N(x.outstandingNetworkRequestOthers)},OutstandingIndexedDBTransaction:{name:N(x.outstandingIndexedDBTransaction)},RequestedNotificationsPermission:{name:N(x.requestedNotificationsPermission)},RequestedMIDIPermission:{name:N(x.requestedMIDIPermission)},RequestedAudioCapturePermission:{name:N(x.requestedAudioCapturePermission)},RequestedVideoCapturePermission:{name:N(x.requestedVideoCapturePermission)},RequestedBackForwardCacheBlockedSensors:{name:N(x.requestedBackForwardCacheBlockedSensors)},RequestedBackgroundWorkPermission:{name:N(x.requestedBackgroundWorkPermission)},BroadcastChannel:{name:N(x.broadcastChannel)},IndexedDBConnection:{name:N(x.indexedDBConnection)},WebXR:{name:N(x.webXR)},SharedWorker:{name:N(x.sharedWorker)},WebLocks:{name:N(x.webLocks)},WebHID:{name:N(x.webHID)},WebShare:{name:N(x.webShare)},RequestedStorageAccessGrant:{name:N(x.requestedStorageAccessGrant)},WebNfc:{name:N(x.webNfc)},OutstandingNetworkRequestFetch:{name:N(x.outstandingNetworkRequestFetch)},OutstandingNetworkRequestXHR:{name:N(x.outstandingNetworkRequestXHR)},AppBanner:{name:N(x.appBanner)},Printing:{name:N(x.printing)},WebDatabase:{name:N(x.webDatabase)},PictureInPicture:{name:N(x.pictureInPicture)},Portal:{name:N(x.portal)},SpeechRecognizer:{name:N(x.speechRecognizer)},IdleManager:{name:N(x.idleManager)},PaymentManager:{name:N(x.paymentManager)},SpeechSynthesis:{name:N(x.speechSynthesis)},KeyboardLock:{name:N(x.keyboardLock)},WebOTPService:{name:N(x.webOTPService)},OutstandingNetworkRequestDirectSocket:{name:N(x.outstandingNetworkRequestDirectSocket)},InjectedJavascript:{name:N(x.injectedJavascript)},InjectedStyleSheet:{name:N(x.injectedStyleSheet)},Dummy:{name:N(x.internalError)},ContentSecurityHandler:{name:N(x.contentSecurityHandler)},ContentWebAuthenticationAPI:{name:N(x.contentWebAuthenticationAPI)},ContentFileChooser:{name:N(x.contentFileChooser)},ContentSerial:{name:N(x.contentSerial)},ContentFileSystemAccess:{name:N(x.contentFileSystemAccess)},ContentMediaDevicesDispatcherHost:{name:N(x.contentMediaDevicesDispatcherHost)},ContentWebBluetooth:{name:N(x.contentWebBluetooth)},ContentWebUSB:{name:N(x.contentWebUSB)},ContentMediaSession:{name:N(x.contentMediaSession)},ContentMediaSessionService:{name:N(x.contentMediaSessionService)},ContentMediaPlay:{name:N(x.contentMediaPlay)},ContentScreenReader:{name:N(x.contentScreenReader)},EmbedderPopupBlockerTabHelper:{name:N(x.embedderPopupBlockerTabHelper)},EmbedderSafeBrowsingTriggeredPopupBlocker:{name:N(x.embedderSafeBrowsingTriggeredPopupBlocker)},EmbedderSafeBrowsingThreatDetails:{name:N(x.embedderSafeBrowsingThreatDetails)},EmbedderAppBannerManager:{name:N(x.embedderAppBannerManager)},EmbedderDomDistillerViewerSource:{name:N(x.embedderDomDistillerViewerSource)},EmbedderDomDistillerSelfDeletingRequestDelegate:{name:N(x.embedderDomDistillerSelfDeletingRequestDelegate)},EmbedderOomInterventionTabHelper:{name:N(x.embedderOomInterventionTabHelper)},EmbedderOfflinePage:{name:N(x.embedderOfflinePage)},EmbedderChromePasswordManagerClientBindCredentialManager:{name:N(x.embedderChromePasswordManagerClientBindCredentialManager)},EmbedderPermissionRequestManager:{name:N(x.embedderPermissionRequestManager)},EmbedderModalDialog:{name:N(x.embedderModalDialog)},EmbedderExtensions:{name:N(x.embedderExtensions)},EmbedderExtensionMessaging:{name:N(x.embedderExtensionMessaging)},EmbedderExtensionMessagingForOpenPort:{name:N(x.embedderExtensionMessagingForOpenPort)},EmbedderExtensionSentMessageToCachedFrame:{name:N(x.embedderExtensionSentMessageToCachedFrame)},ErrorDocument:{name:N(x.errorDocument)},FencedFramesEmbedder:{name:N(x.fencedFramesEmbedder)},KeepaliveRequest:{name:N(x.keepaliveRequest)},JsNetworkRequestReceivedCacheControlNoStoreResource:{name:N(x.jsNetworkRequestReceivedCacheControlNoStoreResource)},IndexedDBEvent:{name:N(x.indexedDBEvent)},CookieDisabled:{name:N(x.cookieDisabled)},WebRTCSticky:{name:N(x.webRTCSticky)},WebTransportSticky:{name:N(x.webTransportSticky)},WebSocketSticky:{name:N(x.webSocketSticky)},HTTPAuthRequired:{name:N(x.HTTPAuthRequired)},CookieFlushed:{name:N(x.CookieFlushed)}},P=new CSSStyleSheet;P.replaceSync(".inline-icon{vertical-align:sub}.gray-text{color:var(--sys-color-token-subtle);margin:0 0 5px 56px;display:flex;flex-direction:row;align-items:center;flex:auto;overflow-wrap:break-word;overflow:hidden}.details-list{margin-left:56px;grid-column-start:span 2}.help-outline-icon{margin:0 2px}.circled-exclamation-icon{margin-right:10px;flex-shrink:0}.status{margin-right:11px;flex-shrink:0}.report-line{grid-column-start:span 2;display:flex;align-items:center;margin:0 30px;line-height:26px}.report-key{color:var(--sys-color-token-subtle);min-width:auto;overflow-wrap:break-word;align-self:start}.report-value{padding:0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.link,\n.devtools-link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px}.tree-outline li .selection{margin-left:-5px}@media (forced-colors: active){.link,\n  .devtools-link{color:linktext;text-decoration-color:linktext}}\n/*# sourceURL=backForwardCacheView.css */\n");const D={mainFrame:"Main Frame",backForwardCacheTitle:"Back/forward cache",unavailable:"unavailable",url:"URL:",unknown:"Unknown Status",normalNavigation:"Not served from back/forward cache: to trigger back/forward cache, use Chrome's back/forward buttons, or use the test button below to automatically navigate away and back.",restoredFromBFCache:"Successfully served from back/forward cache.",pageSupportNeeded:"Actionable",pageSupportNeededExplanation:"These reasons are actionable i.e. they can be cleaned up to make the page eligible for back/forward cache.",circumstantial:"Not Actionable",circumstantialExplanation:"These reasons are not actionable i.e. caching was prevented by something outside of the direct control of the page.",supportPending:"Pending Support",runTest:"Test back/forward cache",runningTest:"Running test",learnMore:"Learn more: back/forward cache eligibility",neverUseUnload:"Learn more: Never use unload handler",supportPendingExplanation:"Chrome support for these reasons is pending i.e. they will not prevent the page from being eligible for back/forward cache in a future version of Chrome.",blockingExtensionId:"Extension id: ",framesTitle:"Frames",issuesInSingleFrame:"{n, plural, =1 {# issue found in 1 frame.} other {# issues found in 1 frame.}}",issuesInMultipleFrames:"{n, plural, =1 {# issue found in {m} frames.} other {# issues found in {m} frames.}}",framesPerIssue:"{n, plural, =1 {# frame} other {# frames}}",blankURLTitle:"Blank URL [{PH1}]",filesPerIssue:"{n, plural, =1 {# file} other {# files}}"},M=t.i18n.registerUIStrings("panels/application/components/BackForwardCacheView.ts",D),B=t.i18n.getLocalizedString.bind(void 0,M),V=c.RenderCoordinator.RenderCoordinator.instance();class F extends l.LegacyWrapper.WrappableComponent{static litTagName=m.literal`devtools-resources-back-forward-cache-view`;#e=this.attachShadow({mode:"open"});#t="Result";#a=0;#r=0;constructor(){super(),this.#o()?.addEventListener(a.ResourceTreeModel.Events.PrimaryPageChanged,this.render,this),this.#o()?.addEventListener(a.ResourceTreeModel.Events.BackForwardCacheDetailsUpdated,this.render,this)}#o(){const e=a.TargetManager.TargetManager.instance().primaryPageTarget();return e?.model(a.ResourceTreeModel.ResourceTreeModel)||null}#i(){return this.#o()?.mainFrame||null}connectedCallback(){this.parentElement?.classList.add("overflow-auto"),this.#e.adoptedStyleSheets=[P]}async render(){await V.write("BackForwardCacheView render",(()=>{m.render(m.html`
        <${d.ReportView.Report.litTagName} .data=${{reportTitle:B(D.backForwardCacheTitle)}} jslog=${g.pane().context("back-forward-cache")}>

          ${this.#n()}
        </${d.ReportView.Report.litTagName}>
      `,this.#e,{host:this})}))}#s(){a.TargetManager.TargetManager.instance().removeModelListener(a.ResourceTreeModel.ResourceTreeModel,a.ResourceTreeModel.Events.FrameNavigated,this.#s,this),this.#t="Result",this.render()}async#l(){a.TargetManager.TargetManager.instance().removeModelListener(a.ResourceTreeModel.ResourceTreeModel,a.ResourceTreeModel.Events.FrameNavigated,this.#l,this),await this.#c(50)}async#c(e){const t=a.TargetManager.TargetManager.instance().primaryPageTarget(),r=t?.model(a.ResourceTreeModel.ResourceTreeModel),o=await(r?.navigationHistory());r&&o&&(o.currentIndex===this.#r?window.setTimeout(this.#c.bind(this,2*e),e):(a.TargetManager.TargetManager.instance().addModelListener(a.ResourceTreeModel.ResourceTreeModel,a.ResourceTreeModel.Events.FrameNavigated,this.#s,this),r.navigateToHistoryEntry(o.entries[o.currentIndex-1])))}async#d(){const e=a.TargetManager.TargetManager.instance().primaryPageTarget(),t=e?.model(a.ResourceTreeModel.ResourceTreeModel),r=await(t?.navigationHistory());t&&r&&(this.#r=r.currentIndex,this.#t="Running",this.render(),a.TargetManager.TargetManager.instance().addModelListener(a.ResourceTreeModel.ResourceTreeModel,a.ResourceTreeModel.Events.FrameNavigated,this.#l,this),t.navigate("chrome://terms"))}#n(){const t=this.#i();if(!t)return m.html`
        <${d.ReportView.ReportKey.litTagName}>
          ${B(D.mainFrame)}
        </${d.ReportView.ReportKey.litTagName}>
        <${d.ReportView.ReportValue.litTagName}>
          ${B(D.unavailable)}
        </${d.ReportView.ReportValue.litTagName}>
      `;const a="Running"===this.#t,o=e.ParsedURL.schemeIs(t.url,"devtools:");return m.html`
      ${this.#h(t.backForwardCacheDetails.restoredFromCache)}
      <div class="report-line">
        <div class="report-key">
          ${B(D.url)}
        </div>
        <div class="report-value" title=${t.url}>
          ${t.url}
        </div>
      </div>
      ${this.#u(t.backForwardCacheDetails.explanationsTree)}
      <${d.ReportView.ReportSection.litTagName}>
        <${r.Button.Button.litTagName}
          aria-label=${B(D.runTest)}
          .disabled=${a||o}
          .spinner=${a}
          .variant=${"primary"}
          @click=${this.#d}
          jslog=${g.action().track({click:!0}).context("back-forward-cache.run-test")}>
          ${a?m.html`
            ${B(D.runningTest)}`:`\n            ${B(D.runTest)}\n          `}
        </${r.Button.Button.litTagName}>
      </${d.ReportView.ReportSection.litTagName}>
      <${d.ReportView.ReportSectionDivider.litTagName}>
      </${d.ReportView.ReportSectionDivider.litTagName}>
      ${this.#m(t.backForwardCacheDetails.explanations,t.backForwardCacheDetails.explanationsTree)}
      <${d.ReportView.ReportSection.litTagName}>
        <x-link href="https://web.dev/bfcache/" class="link"
        jslog=${g.action().track({click:!0}).context("learn-more.eligibility")}>
          ${B(D.learnMore)}
        </x-link>
      </${d.ReportView.ReportSection.litTagName}>
    `}#u(e){if(!e||0===e.explanations.length&&0===e.children.length)return m.nothing;const t=this.#g(e,{blankCount:1});t.node.treeNodeData.iconName="frame";let a="";a=1===t.frameCount?B(D.issuesInSingleFrame,{n:t.issueCount}):B(D.issuesInMultipleFrames,{n:t.issueCount,m:t.frameCount});const r={treeNodeData:{text:a},id:"root",children:()=>Promise.resolve([t.node])};return m.html`
      <div class="report-line"
      jslog=${g.section().context("frames")}>
        <div class="report-key">
          ${B(D.framesTitle)}
        </div>
        <div class="report-value">
          <${h.TreeOutline.TreeOutline.litTagName} .data=${{tree:[r],defaultRenderer:function(e){return m.html`
        <div class="text-ellipsis">
          ${e.treeNodeData.iconName?m.html`
            <${s.Icon.Icon.litTagName} class="inline-icon" style="margin-bottom: -3px;" .data=${{iconName:e.treeNodeData.iconName,color:"var(--icon-default)",width:"20px",height:"20px"}}>
            </${s.Icon.Icon.litTagName}>
          `:m.nothing}
          ${e.treeNodeData.text}
        </div>
      `},compact:!0}}>
          </${h.TreeOutline.TreeOutline.litTagName}>
        </div>
      </div>
    `}#g(e,t){let a=1,r=0;const o=[];let i="";e.url.length?i=e.url:(i=B(D.blankURLTitle,{PH1:t.blankCount}),t.blankCount+=1);for(const t of e.explanations){const e={treeNodeData:{text:t.reason},id:String(this.#a++)};r+=1,o.push(e)}for(const i of e.children){const e=this.#g(i,t);e.issueCount>0&&(o.push(e.node),r+=e.issueCount,a+=e.frameCount)}let n={treeNodeData:{text:`(${r}) ${i}`},id:String(this.#a++)};return o.length?(n={...n,children:()=>Promise.resolve(o)},n.treeNodeData.iconName="iframe"):e.url.length||(t.blankCount-=1),{node:n,frameCount:a,issueCount:r}}#h(e){switch(e){case!0:return m.html`
          <${d.ReportView.ReportSection.litTagName}>
            <div class="status">
              <${s.Icon.Icon.litTagName} class="inline-icon" .data=${{iconName:"check-circle",color:"var(--icon-checkmark-green)",width:"20px",height:"20px"}}>
              </${s.Icon.Icon.litTagName}>
            </div>
            ${B(D.restoredFromBFCache)}
          </${d.ReportView.ReportSection.litTagName}>
        `;case!1:return m.html`
          <${d.ReportView.ReportSection.litTagName}>
            <div class="status">
              <${s.Icon.Icon.litTagName} class="inline-icon" .data=${{iconName:"clear",color:"var(--icon-default)",width:"20px",height:"20px"}}>
              </${s.Icon.Icon.litTagName}>
            </div>
            ${B(D.normalNavigation)}
          </${d.ReportView.ReportSection.litTagName}>
        `}return m.html`
    <${d.ReportView.ReportSection.litTagName}>
      ${B(D.unknown)}
    </${d.ReportView.ReportSection.litTagName}>
    `}#p(e,t,a){let r=e.url;0===r.length&&(r=B(D.blankURLTitle,{PH1:t.blankCount}),t.blankCount+=1),e.explanations.forEach((e=>{let t=a.get(e.reason);void 0===t?(t=[r],a.set(e.reason,t)):t.push(r)})),e.children.map((e=>{this.#p(e,t,a)}))}#m(e,t){if(0===e.length)return m.nothing;const a=e.filter((e=>"PageSupportNeeded"===e.type)),r=e.filter((e=>"SupportPending"===e.type)),o=e.filter((e=>"Circumstantial"===e.type)),i=new Map;return t&&this.#p(t,{blankCount:1},i),m.html`
      ${this.#b(B(D.pageSupportNeeded),B(D.pageSupportNeededExplanation),a,i)}
      ${this.#b(B(D.supportPending),B(D.supportPendingExplanation),r,i)}
      ${this.#b(B(D.circumstantial),B(D.circumstantialExplanation),o,i)}
    `}#b(e,t,a,r){return m.html`
      ${a.length>0?m.html`
        <${d.ReportView.ReportSectionHeader.litTagName}>
          ${e}
          <div class="help-outline-icon">
            <${s.Icon.Icon.litTagName} class="inline-icon" .data=${{iconName:"help",color:"var(--icon-default)",width:"16px",height:"16px"}} title=${t}>
            </${s.Icon.Icon.litTagName}>
          </div>
        </${d.ReportView.ReportSectionHeader.litTagName}>
        ${a.map((e=>this.#w(e,r.get(e.reason))))}
      `:m.nothing}
    `}#f(e){if("EmbedderExtensionSentMessageToCachedFrame"===e.reason&&e.context){const t="chrome://extensions/?id="+e.context;return m.html`${B(D.blockingExtensionId)}
      <${o.ChromeLink.ChromeLink.litTagName} .href=${t}>${e.context}</${o.ChromeLink.ChromeLink.litTagName}>`}return m.nothing}#v(e){if(void 0===e||0===e.length)return m.nothing;const t=[m.html`<div>${B(D.framesPerIssue,{n:e.length})}</div>`];return t.push(...e.map((e=>m.html`<div class="text-ellipsis" title=${e}
    jslog=${g.treeItem()}>${e}</div>`))),m.html`
      <div class="details-list"
      jslog=${g.tree().context("frames-per-issue")}>
        <${i.ExpandableList.ExpandableList.litTagName} .data=${{rows:t}}
        jslog=${g.treeItem()}></${i.ExpandableList.ExpandableList.litTagName}>
      </div>
    `}#k(e){return"UnloadHandlerExistsInMainFrame"===e.reason||"UnloadHandlerExistsInSubFrame"===e.reason?m.html`
        <x-link href="https://web.dev/bfcache/#never-use-the-unload-event" class="link"
        jslog=${g.action().track({click:!0}).context("learn-more.never-use-unload")}>
          ${B(D.neverUseUnload)}
        </x-link>`:m.nothing}#y(e){if(void 0===e||0===e.length)return m.nothing;const t=new u.Linkifier.Linkifier(50),a=[m.html`<div>${B(D.filesPerIssue,{n:e.length})}</div>`];return a.push(...e.map((e=>m.html`${t.linkifyScriptLocation(null,null,e.url,e.lineNumber,{columnNumber:e.columnNumber,showColumnNumber:!0,inlineFrameIndex:0})}`))),m.html`
      <div class="details-list">
        <${i.ExpandableList.ExpandableList.litTagName} .data=${{rows:a}}></${i.ExpandableList.ExpandableList.litTagName}>
      </div>
    `}#w(e,t){return m.html`
      <${d.ReportView.ReportSection.litTagName}>
        ${e.reason in I?m.html`
            <div class="circled-exclamation-icon">
              <${s.Icon.Icon.litTagName} class="inline-icon" .data=${{iconName:"warning",color:"var(--icon-warning)",width:"16px",height:"16px"}}>
              </${s.Icon.Icon.litTagName}>
            </div>
            <div>
              ${I[e.reason].name()}
              ${this.#k(e)}
              ${this.#f(e)}
           </div>`:m.nothing}
      </${d.ReportView.ReportSection.litTagName}>
      <div class="gray-text">
        ${e.reason}
      </div>
      ${this.#y(e.details)}
      ${this.#v(t)}
    `}}n.CustomElements.defineComponent("devtools-resources-back-forward-cache-view",F);var E=Object.freeze({__proto__:null,BackForwardCacheView:F});const L=new CSSStyleSheet;L.replaceSync("devtools-data-grid-controller{border:1px solid var(--sys-color-divider);margin-top:0}.link,\n.devtools-link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px}@media (forced-colors: active){.link,\n  .devtools-link{color:linktext;text-decoration-color:linktext}}\n/*# sourceURL=bounceTrackingMitigationsView.css */\n");const A={bounceTrackingMitigationsTitle:"Bounce tracking mitigations",forceRun:"Force run",runningMitigations:"Running",stateDeletedFor:"State was deleted for the following sites:",checkingPotentialTrackers:"Checking for potential bounce tracking sites.",learnMore:"Learn more: Bounce Tracking Mitigations",noPotentialBounceTrackersIdentified:"State was not cleared for any potential bounce tracking sites. Either none were identified or third-party cookies are not blocked.",featureDisabled:'Bounce tracking mitigations are disabled. To enable them, set the flag at {PH1} to "Enabled With Deletion".',featureFlag:"Bounce Tracking Mitigations Feature Flag"},H=t.i18n.registerUIStrings("panels/application/components/BounceTrackingMitigationsView.ts",A),O=t.i18n.getLocalizedString.bind(void 0,H);class W extends l.LegacyWrapper.WrappableComponent{static litTagName=m.literal`devtools-bounce-tracking-mitigations-view`;#e=this.attachShadow({mode:"open"});#T=[];#t="Result";#S=!1;#R=!1;connectedCallback(){this.#e.adoptedStyleSheets=[L],this.#$()}async#$(){m.render(m.html`
      <${d.ReportView.Report.litTagName} .data=${{reportTitle:O(A.bounceTrackingMitigationsTitle)}}
      jslog=${g.pane().context("bounce-tracking-mitigations")}>
        ${await this.#n()}
      </${d.ReportView.Report.litTagName}>
    `,this.#e,{host:this})}async#n(){if(this.#S||await this.#x(),"Disabled"===this.#t){const e=new o.ChromeLink.ChromeLink;return e.href="chrome://flags/#bounce-tracking-mitigations",e.textContent=O(A.featureFlag),m.html`
        <${d.ReportView.ReportSection.litTagName}>
          ${t.i18n.getFormatLocalizedString(H,A.featureDisabled,{PH1:e})}
        </${d.ReportView.ReportSection.litTagName}>
      `}return m.html`
      <${d.ReportView.ReportSection.litTagName}>
        ${this.#C()}
      </${d.ReportView.ReportSection.litTagName}>
        ${this.#N()}
      <${d.ReportView.ReportSectionDivider.litTagName}>
      </${d.ReportView.ReportSectionDivider.litTagName}>
      <${d.ReportView.ReportSection.litTagName}>
        <x-link href="https://privacycg.github.io/nav-tracking-mitigations/#bounce-tracking-mitigations" class="link"
        jslog=${g.link().track({click:!0}).context("learn-more")}>
          ${O(A.learnMore)}
        </x-link>
      </${d.ReportView.ReportSection.litTagName}>
    `}#C(){const e="Running"===this.#t;return m.html`
      <${r.Button.Button.litTagName}
        aria-label=${O(A.forceRun)}
        .disabled=${e}
        .spinner=${e}
        .variant=${"primary"}
        @click=${this.#I}
        jslog=${g.action().track({click:!0}).context("force-run")}>
        ${e?m.html`
          ${O(A.runningMitigations)}`:`\n          ${O(A.forceRun)}\n        `}
      </${r.Button.Button.litTagName}>
    `}#N(){if(!this.#R)return m.html``;if(0===this.#T.length)return m.html`
        <${d.ReportView.ReportSection.litTagName}>
        ${"Running"===this.#t?m.html`
          ${O(A.checkingPotentialTrackers)}`:`\n          ${O(A.noPotentialBounceTrackersIdentified)}\n        `}
        </${d.ReportView.ReportSection.litTagName}>
      `;const e={columns:[{id:"sites",title:O(A.stateDeletedFor),widthWeighting:10,hideable:!1,visible:!0,sortable:!0}],rows:this.#P(),initialSort:{columnId:"sites",direction:"ASC"}};return m.html`
      <${d.ReportView.ReportSection.litTagName}>
        <${p.DataGridController.DataGridController.litTagName} .data=${e}>
        </${p.DataGridController.DataGridController.litTagName}>
      </${d.ReportView.ReportSection.litTagName}>
    `}async#I(){const e=a.TargetManager.TargetManager.instance().primaryPageTarget();if(!e)return;this.#R=!0,this.#t="Running",this.#$();const t=await e.storageAgent().invoke_runBounceTrackingMitigations();this.#T=[],t.deletedSites.forEach((e=>{this.#T.push(e)})),this.#D()}#D(){this.#t="Result",this.#$()}#P(){return this.#T.map((e=>({cells:[{columnId:"sites",value:e}]})))}async#x(){this.#S=!0;const e=a.TargetManager.TargetManager.instance().primaryPageTarget();e&&((await e.systemInfo().invoke_getFeatureState({featureState:"DIPS"})).featureEnabled||(this.#t="Disabled"))}}n.CustomElements.defineComponent("devtools-bounce-tracking-mitigations-view",W);var U=Object.freeze({__proto__:null,i18nString:O,BounceTrackingMitigationsView:W});const q=new CSSStyleSheet;q.replaceSync(":host{overflow:auto;height:100%}.reporting-container{height:100%;display:flex;flex-direction:column}.reporting-header{font-size:15px;background-color:var(--sys-color-surface2);padding:1px 4px}.reporting-placeholder{flex-grow:1;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--sys-color-token-subtle)}devtools-data-grid-controller{border:1px solid var(--sys-color-divider)}.inline-icon{vertical-align:text-bottom}\n/*# sourceURL=reportingApiGrid.css */\n");const _={noEndpointsToDisplay:"No endpoints to display"},z=t.i18n.registerUIStrings("panels/application/components/EndpointsGrid.ts",_),G=t.i18n.getLocalizedString.bind(void 0,z),{render:j,html:K}=m;class J extends HTMLElement{static litTagName=m.literal`devtools-resources-endpoints-grid`;#e=this.attachShadow({mode:"open"});#M=new Map;connectedCallback(){this.#e.adoptedStyleSheets=[q],this.#$()}set data(e){this.#M=e.endpoints,this.#$()}#$(){const e={columns:[{id:"origin",title:t.i18n.lockedString("Origin"),widthWeighting:30,hideable:!1,visible:!0},{id:"name",title:t.i18n.lockedString("Name"),widthWeighting:20,hideable:!1,visible:!0},{id:"url",title:t.i18n.lockedString("URL"),widthWeighting:30,hideable:!1,visible:!0}],rows:this.#B()};j(K`
      <div class="reporting-container" jslog=${g.section().context("endpoints")}>
        <div class="reporting-header">${t.i18n.lockedString("Endpoints")}</div>
        ${this.#M.size>0?K`
          <${p.DataGridController.DataGridController.litTagName} .data=${e}>
          </${p.DataGridController.DataGridController.litTagName}>
        `:K`
          <div class="reporting-placeholder">
            <div>${G(_.noEndpointsToDisplay)}</div>
          </div>
        `}
      </div>
    `,this.#e,{host:this})}#B(){return Array.from(this.#M).map((([e,t])=>t.map((t=>({cells:[{columnId:"origin",value:e},{columnId:"name",value:t.groupName},{columnId:"url",value:t.url}]}))))).flat()}}n.CustomElements.defineComponent("devtools-resources-endpoints-grid",J);var X=Object.freeze({__proto__:null,i18nString:G,EndpointsGrid:J});const Y=new CSSStyleSheet;Y.replaceSync('.text-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}button ~ .text-ellipsis{padding-left:2px}.link,\n.devtools-link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px;padding:0}button.link{border:none;background:none;font-family:inherit;font-size:inherit;height:16px}button.link:has(devtools-icon){margin-top:5px}button.text-link{padding-left:2px;height:26px}.inline-button{padding-left:1ex}.inline-comment{padding-left:1ex;white-space:pre-line}.inline-comment::before{content:"("}.inline-comment::after{content:")"}.inline-name{color:var(--sys-color-token-subtle);padding-right:4px;user-select:none;white-space:pre-line}.inline-items{display:flex}.span-cols{grid-column-start:span 2;margin:0 0 8px 30px;line-height:28px}.without-min-width{min-width:auto}.bold{font-weight:bold}.link:not(button):has(devtools-icon){vertical-align:sub;padding-left:2px}.inline-icon{margin-bottom:-5px;width:18px;height:18px;vertical-align:baseline}@media (forced-colors: active){.link,\n  .devtools-link{color:linktext;text-decoration-color:linktext}}\n/*# sourceURL=frameDetailsReportView.css */\n');const Q=new CSSStyleSheet;Q.replaceSync(":host .badge-error{--override-adorner-text-color:var(--sys-color-error-bright);--override-adorner-border-color:var(--sys-color-error-bright)}:host .badge-success{--override-adorner-text-color:var(--sys-color-tertiary);--override-adorner-border-color:var(--sys-color-tertiary)}:host .badge-secondary{--override-adorner-text-color:var(--sys-color-token-subtle);--override-adorner-border-color:var(--sys-color-token-subtle)}:host{font-family:var(--source-code-font-family)}\n/*# sourceURL=badge.css */\n");const Z=new CSSStyleSheet;Z.replaceSync(".content{display:grid;grid-template-columns:min-content 1fr}.key{color:var(--sys-color-token-subtle);padding:0 6px;text-align:right;white-space:pre}.value{color:var(--sys-color-token-subtle);margin-inline-start:0;padding:0 6px}.error-text{color:var(--sys-color-error-bright);font-weight:bold}\n/*# sourceURL=originTrialTokenRows.css */\n");const ee=new CSSStyleSheet;ee.replaceSync(".status-badge{border-radius:4px;padding:4px;background:var(--sys-color-neutral-container);& > devtools-icon{vertical-align:sub}}\n/*# sourceURL=originTrialTreeView.css */\n");const te={origin:"Origin",trialName:"Trial Name",expiryTime:"Expiry Time",usageRestriction:"Usage Restriction",isThirdParty:"Third Party",matchSubDomains:"Subdomain Matching",rawTokenText:"Raw Token",status:"Token Status",token:"Token",tokens:"{PH1} tokens",noTrialTokens:"No trial tokens"},ae=t.i18n.registerUIStrings("panels/application/components/OriginTrialTreeView.ts",te),re=t.i18n.getLocalizedString.bind(void 0,ae);class oe extends HTMLElement{static litTagName=m.literal`devtools-resources-origin-trial-tree-view-badge`;#e=this.attachShadow({mode:"open"});#V=new T.Adorner.Adorner;set data(e){this.#$(e)}connectedCallback(){this.#e.adoptedStyleSheets=[Q]}#$(e){const t=document.createElement("span");t.textContent=e.badgeContent,this.#V.data={name:"badge",content:t},this.#V.classList.add(`badge-${e.style}`),m.render(m.html`
      ${this.#V}
    `,this.#e,{host:this})}}function ie(e){return{treeNodeData:e,id:"OriginTrialTreeNode#"+e.trialName,children:async()=>e.tokensWithStatus.length>1?e.tokensWithStatus.map(ne):le(e.tokensWithStatus[0]),renderer:e=>{const t=e.treeNodeData,a=m.html`
        <${oe.litTagName} .data=${{badgeContent:re(te.tokens,{PH1:t.tokensWithStatus.length}),style:"secondary"}}></${oe.litTagName}>
      `;return m.html`
        ${t.trialName}
        <${oe.litTagName} .data=${{badgeContent:t.status,style:"Enabled"===t.status?"success":"error"}}></${oe.litTagName}>
        ${t.tokensWithStatus.length>1?a:m.nothing}
      `}}}function ne(e){return{treeNodeData:e.status,id:"TokenNode#"+e.rawTokenText,children:async()=>le(e),renderer:(e,t)=>{const a=e.treeNodeData,r=m.html`
        <${oe.litTagName} .data=${{badgeContent:a,style:"Success"===a?"success":"error"}}></${oe.litTagName}>
      `;return m.html`${re(te.token)} ${t.isExpanded?m.nothing:r}`}}}function se(e){return m.html`
    <${de.litTagName} .data=${{node:e}}>
    </${de.litTagName}>
    `}function le(e){return[{treeNodeData:e,id:"TokenDetailsNode#"+e.rawTokenText,renderer:se},(t=e.rawTokenText,{treeNodeData:re(te.rawTokenText),id:"TokenRawTextContainerNode#"+t,children:async()=>[{treeNodeData:t,id:"TokenRawTextNode#"+t,renderer:e=>{const t=e.treeNodeData;return m.html`
        <div style="overflow-wrap: break-word;">
          ${t}
        </div>
        `}}]})];var t}function ce(e){return m.html`${String(e.treeNodeData)}`}n.CustomElements.defineComponent("devtools-resources-origin-trial-tree-view-badge",oe);class de extends HTMLElement{static litTagName=m.literal`devtools-resources-origin-trial-token-rows`;#e=this.attachShadow({mode:"open"});#F=null;#E=[];#L=new Intl.DateTimeFormat(t.DevToolsLocale.DevToolsLocale.instance().locale,{dateStyle:"long",timeStyle:"long"});set data(e){this.#F=e.node.treeNodeData,this.#A()}connectedCallback(){this.#e.adoptedStyleSheets=[Z],this.#$()}#H=(e,t)=>m.html`
        <div class=${m.Directives.ifDefined(t?"error-text":void 0)}>
          ${e}
        </div>`;#A(){this.#F?.parsedToken&&(this.#E=[{name:re(te.origin),value:this.#H(this.#F.parsedToken.origin,"WrongOrigin"===this.#F.status)},{name:re(te.expiryTime),value:this.#H(this.#L.format(1e3*this.#F.parsedToken.expiryTime),"Expired"===this.#F.status)},{name:re(te.usageRestriction),value:this.#H(this.#F.parsedToken.usageRestriction)},{name:re(te.isThirdParty),value:this.#H(this.#F.parsedToken.isThirdParty.toString())},{name:re(te.matchSubDomains),value:this.#H(this.#F.parsedToken.matchSubDomains.toString())}],"UnknownTrial"===this.#F.status&&(this.#E=[{name:re(te.trialName),value:this.#H(this.#F.parsedToken.trialName)},...this.#E]))}#$(){if(!this.#F)return;const e=[{name:re(te.status),value:m.html`
          <${oe.litTagName} .data=${{badgeContent:this.#F.status,style:"Success"===this.#F.status?"success":"error"}}></${oe.litTagName}>`},...this.#E].map((e=>m.html`
          <div class="key">${e.name}</div>
          <div class="value">${e.value}</div>
          `));m.render(m.html`
      <div class="content">
        ${e}
      </div>
    `,this.#e,{host:this})}}n.CustomElements.defineComponent("devtools-resources-origin-trial-token-rows",de);class he extends HTMLElement{static litTagName=m.literal`devtools-resources-origin-trial-tree-view`;#e=this.attachShadow({mode:"open"});set data(e){this.#$(e.trials)}connectedCallback(){this.#e.adoptedStyleSheets=[ee]}#$(e){e.length?m.render(m.html`
      <${h.TreeOutline.TreeOutline.litTagName} .data=${{tree:e.map(ie),defaultRenderer:ce}}>
      </${h.TreeOutline.TreeOutline.litTagName}>
    `,this.#e,{host:this}):m.render(m.html`
    <span class="status-badge">
      <${s.Icon.Icon.litTagName}
          .data=${{iconName:"clear",color:"var(--icon-default)",width:"16px"}}
        >
      </${s.Icon.Icon.litTagName}>
      <span>${re(te.noTrialTokens)}</span>
    </span>`,this.#e,{host:this})}}n.CustomElements.defineComponent("devtools-resources-origin-trial-tree-view",he);var ue=Object.freeze({__proto__:null,Badge:oe,OriginTrialTokenRows:de,OriginTrialTreeView:he});const me=new CSSStyleSheet;me.replaceSync(":host{display:contents}.text-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.link,\n.devtools-link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px}button.link{border:none;background:none;font-family:inherit;font-size:inherit}.policies-list{padding-top:3px}.permissions-row{display:flex;line-height:22px}.permissions-row div{padding-right:5px}.feature-name{width:135px}.allowed-icon{vertical-align:sub}.block-reason{width:215px}\n/*# sourceURL=permissionsPolicySection.css */\n");const ge={showDetails:"Show details",hideDetails:"Hide details",allowedFeatures:"Allowed Features",disabledFeatures:"Disabled Features",clickToShowHeader:'Click to reveal the request whose "`Permissions-Policy`" HTTP header disables this feature.',clickToShowIframe:"Click to reveal the top-most iframe which does not allow this feature in the elements panel.",disabledByIframe:'missing in iframe "`allow`" attribute',disabledByHeader:'disabled by "`Permissions-Policy`" header',disabledByFencedFrame:"disabled inside a `fencedframe`"},pe=t.i18n.registerUIStrings("panels/application/components/PermissionsPolicySection.ts",ge),be=t.i18n.getLocalizedString.bind(void 0,pe),we=c.RenderCoordinator.RenderCoordinator.instance();function fe(e,t,a){return m.html`
    <button class="link" role="link" tabindex=0 @click=${a} title=${t}>
      <${s.Icon.Icon.litTagName} .data=${{iconName:e,color:"var(--icon-link)",width:"16px",height:"16px"}}>
      </${s.Icon.Icon.litTagName}>
    </button>
  `}class ve extends HTMLElement{static litTagName=m.literal`devtools-resources-permissions-policy-section`;#e=this.attachShadow({mode:"open"});#O={policies:[],showDetails:!1};set data(e){this.#O=e,this.#$()}connectedCallback(){this.#e.adoptedStyleSheets=[me]}#W(){this.#O.showDetails=!this.#O.showDetails,this.#$()}#U(){const e=this.#O.policies.filter((e=>e.allowed)).map((e=>e.feature)).sort();return e.length?m.html`
      <${d.ReportView.ReportKey.litTagName}>${be(ge.allowedFeatures)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        ${e.join(", ")}
      </${d.ReportView.ReportValue.litTagName}>
    `:m.nothing}async#q(){const t=this.#O.policies.filter((e=>!e.allowed)).sort(((e,t)=>e.feature.localeCompare(t.feature)));if(!t.length)return m.nothing;if(!this.#O.showDetails)return m.html`
        <${d.ReportView.ReportKey.litTagName}>${be(ge.disabledFeatures)}</${d.ReportView.ReportKey.litTagName}>
        <${d.ReportView.ReportValue.litTagName}>
          ${t.map((e=>e.feature)).join(", ")}
          <button class="link" @click=${()=>this.#W()}>
            ${be(ge.showDetails)}
          </button>
        </${d.ReportView.ReportValue.litTagName}>
      `;const r=a.FrameManager.FrameManager.instance(),o=await Promise.all(t.map((async t=>{const a=t.locator?r.getFrame(t.locator.frameId):null,o=t.locator?.blockReason,i=await("IframeAttribute"===o&&a&&a.getOwnerDOMNodeOrDocument()),n=a&&a.resourceForURL(a.url),l="Header"===o&&n&&n.request,c=(()=>{switch(o){case"IframeAttribute":return be(ge.disabledByIframe);case"Header":return be(ge.disabledByHeader);case"InFencedFrameTree":return be(ge.disabledByFencedFrame);default:return""}})();return m.html`
        <div class="permissions-row">
          <div>
            <${s.Icon.Icon.litTagName} class="allowed-icon"
              .data=${{color:"var(--icon-error)",iconName:"cross-circle",width:"20px",height:"20px"}}>
            </${s.Icon.Icon.litTagName}>
          </div>
          <div class="feature-name text-ellipsis">
            ${t.feature}
          </div>
          <div class="block-reason">${c}</div>
          <div>
            ${i?fe("code-circle",be(ge.clickToShowIframe),(()=>e.Revealer.reveal(i))):m.nothing}
            ${l?fe("arrow-up-down-circle",be(ge.clickToShowHeader),(async()=>{if(!l)return;const t=l.responseHeaderValue("permissions-policy")?"permissions-policy":"feature-policy",a=k.UIRequestLocation.UIRequestLocation.responseHeaderMatch(l,{name:t,value:""});await e.Revealer.reveal(a)})):m.nothing}
          </div>
        </div>
      `})));return m.html`
      <${d.ReportView.ReportKey.litTagName}>${be(ge.disabledFeatures)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName} class="policies-list">
        ${o}
        <div class="permissions-row">
          <button class="link" @click=${()=>this.#W()}>
            ${be(ge.hideDetails)}
          </button>
        </div>
      </${d.ReportView.ReportValue.litTagName}>
    `}async#$(){await we.write("PermissionsPolicySection render",(()=>{m.render(m.html`
          <${d.ReportView.ReportSectionHeader.litTagName}>${t.i18n.lockedString("Permissions Policy")}</${d.ReportView.ReportSectionHeader.litTagName}>
          ${this.#U()}
          ${m.Directives.until(this.#q(),m.nothing)}
          <${d.ReportView.ReportSectionDivider.litTagName}></${d.ReportView.ReportSectionDivider.litTagName}>
        `,this.#e,{host:this})}))}}n.CustomElements.defineComponent("devtools-resources-permissions-policy-section",ve);const ke=new CSSStyleSheet;ke.replaceSync(".stack-trace-row{display:flex}.stack-trace-function-name{width:100px}.stack-trace-source-location{display:flex;overflow:hidden}.text-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.stack-trace-source-location .text-ellipsis{padding-right:2px}.ignore-list-link{opacity:60%}.link,\n.devtools-link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px}\n/*# sourceURL=stackTraceRow.css */\n");const ye=new CSSStyleSheet;ye.replaceSync("button.link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px;border:none;background:none;font-family:inherit;font-size:inherit}\n/*# sourceURL=stackTraceLinkButton.css */\n");const Te={cannotRenderStackTrace:"Cannot render stack trace",showSMoreFrames:"{n, plural, =1 {Show # more frame} other {Show # more frames}}",showLess:"Show less"},Se=t.i18n.registerUIStrings("panels/application/components/StackTrace.ts",Te),Re=t.i18n.getLocalizedString.bind(void 0,Se);class $e extends HTMLElement{static litTagName=m.literal`devtools-stack-trace-row`;#e=this.attachShadow({mode:"open"});#_=null;set data(e){this.#_=e.stackTraceRowItem,this.#$()}connectedCallback(){this.#e.adoptedStyleSheets=[ke]}#$(){this.#_&&m.render(m.html`
      <div class="stack-trace-row">
              <div class="stack-trace-function-name text-ellipsis" title=${this.#_.functionName}>
                ${this.#_.functionName}
              </div>
              <div class="stack-trace-source-location">
                ${this.#_.link?m.html`<div class="text-ellipsis">\xA0@\xA0${this.#_.link}</div>`:m.nothing}
              </div>
            </div>
    `,this.#e,{host:this})}}class xe extends HTMLElement{static litTagName=m.literal`devtools-stack-trace-link-button`;#e=this.attachShadow({mode:"open"});#z=()=>{};#G=null;#j=!1;set data(e){this.#z=e.onShowAllClick,this.#G=e.hiddenCallFramesCount,this.#j=e.expandedView,this.#$()}connectedCallback(){this.#e.adoptedStyleSheets=[ye]}#$(){if(!this.#G)return;const e=this.#j?Re(Te.showLess):Re(Te.showSMoreFrames,{n:this.#G});m.render(m.html`
      <div class="stack-trace-row">
          <button class="link" @click=${()=>this.#z()}>
            ${e}
          </button>
        </div>
    `,this.#e,{host:this})}}class Ce extends HTMLElement{static litTagName=m.literal`devtools-resources-stack-trace`;#e=this.attachShadow({mode:"open"});#K=new u.Linkifier.Linkifier;#J=[];#X=!1;set data(e){const t=e.frame,{creationStackTrace:a,creationStackTraceTarget:r}=t.getCreationStackTraceData();a&&(this.#J=e.buildStackTraceRows(a,r,this.#K,!0,this.#Y.bind(this))),this.#$()}#Y(e){this.#J=e,this.#$()}#Q(){this.#X=!this.#X,this.#$()}createRowTemplates(){const e=[];let t=0;for(const a of this.#J)!this.#X&&a.ignoreListHide||("functionName"in a&&e.push(m.html`
          <${$e.litTagName} data-stack-trace-row .data=${{stackTraceRowItem:a}}></${$e.litTagName}>`),"asyncDescription"in a&&e.push(m.html`
            <div>${a.asyncDescription}</div>
          `)),"functionName"in a&&a.ignoreListHide&&t++;return t&&e.push(m.html`
      <${xe.litTagName} data-stack-trace-row .data=${{onShowAllClick:this.#Q.bind(this),hiddenCallFramesCount:t,expandedView:this.#X}}></${xe.litTagName}>
      `),e}#$(){if(!this.#J.length)return void m.render(m.html`
          <span>${Re(Te.cannotRenderStackTrace)}</span>
        `,this.#e,{host:this});const e=this.createRowTemplates();m.render(m.html`
        <${i.ExpandableList.ExpandableList.litTagName} .data=${{rows:e}}>
        </${i.ExpandableList.ExpandableList.litTagName}>
      `,this.#e,{host:this})}}n.CustomElements.defineComponent("devtools-stack-trace-row",$e),n.CustomElements.defineComponent("devtools-stack-trace-link-button",xe),n.CustomElements.defineComponent("devtools-resources-stack-trace",Ce);var Ne=Object.freeze({__proto__:null,StackTraceRow:$e,StackTraceLinkButton:xe,StackTrace:Ce});const Ie={additionalInformation:"Additional Information",thisAdditionalDebugging:"This additional (debugging) information is shown because the 'Protocol Monitor' experiment is enabled.",frameId:"Frame ID",document:"Document",url:"URL",clickToRevealInSourcesPanel:"Click to reveal in Sources panel",clickToRevealInNetworkPanel:"Click to reveal in Network panel",unreachableUrl:"Unreachable URL",clickToRevealInNetworkPanelMight:"Click to reveal in Network panel (might require page reload)",origin:"Origin",ownerElement:"Owner Element",clickToRevealInElementsPanel:"Click to reveal in Elements panel",adStatus:"Ad Status",rootDescription:"This frame has been identified as the root frame of an ad",root:"root",childDescription:"This frame has been identified as a child frame of an ad",child:"child",securityIsolation:"Security & Isolation",contentSecurityPolicy:"Content Security Policy (CSP)",secureContext:"Secure Context",yes:"Yes",no:"No",crossoriginIsolated:"Cross-Origin Isolated",localhostIsAlwaysASecureContext:"`Localhost` is always a secure context",aFrameAncestorIsAnInsecure:"A frame ancestor is an insecure context",theFramesSchemeIsInsecure:"The frame's scheme is insecure",reportingTo:"reporting to",apiAvailability:"API availability",availabilityOfCertainApisDepends:"Availability of certain APIs depends on the document being cross-origin isolated.",availableTransferable:"available, transferable",availableNotTransferable:"available, not transferable",unavailable:"unavailable",sharedarraybufferConstructorIs:"`SharedArrayBuffer` constructor is available and `SABs` can be transferred via `postMessage`",sharedarraybufferConstructorIsAvailable:"`SharedArrayBuffer` constructor is available but `SABs` cannot be transferred via `postMessage`",willRequireCrossoriginIsolated:"⚠️ will require cross-origin isolated context in the future",requiresCrossoriginIsolated:"requires cross-origin isolated context",transferRequiresCrossoriginIsolatedPermission:"`SharedArrayBuffer` transfer requires enabling the permission policy:",available:"available",thePerformanceAPI:"The `performance.measureUserAgentSpecificMemory()` API is available",thePerformancemeasureuseragentspecificmemory:"The `performance.measureUserAgentSpecificMemory()` API is not available",measureMemory:"Measure Memory",learnMore:"Learn more",creationStackTrace:"Frame Creation `Stack Trace`",creationStackTraceExplanation:"This frame was created programmatically. The `stack trace` shows where this happened.",parentIsAdExplanation:"This frame is considered an ad frame because its parent frame is an ad frame.",matchedBlockingRuleExplanation:"This frame is considered an ad frame because its current (or previous) main document is an ad resource.",createdByAdScriptExplanation:"There was an ad script in the `(async) stack` when this frame was created. Examining the creation `stack trace` of this frame might provide more insight.",creatorAdScript:"Creator Ad Script",none:"None",originTrialsExplanation:"Origin trials give you access to a new or experimental feature."},Pe=t.i18n.registerUIStrings("panels/application/components/FrameDetailsView.ts",Ie),De=t.i18n.getLocalizedString.bind(void 0,Pe),Me=c.RenderCoordinator.RenderCoordinator.instance();class Be extends l.LegacyWrapper.WrappableComponent{static litTagName=m.literal`devtools-resources-frame-details-view`;#e=this.attachShadow({mode:"open"});#Z;#ee;#te=!1;#ae=null;#O={policies:[],showDetails:!1};#re=new he;#K=new u.Linkifier.Linkifier;#oe=null;constructor(e){super(),this.#Z=e,this.render()}connectedCallback(){this.parentElement?.classList.add("overflow-auto"),this.#te=w.Runtime.experiments.isEnabled("protocolMonitor"),this.#e.adoptedStyleSheets=[Y]}async render(){this.#oe=await(this.#Z?.parentFrame()?.getAdScriptId(this.#Z?.id))||null;const e=this.#oe?.debuggerId?await a.DebuggerModel.DebuggerModel.modelForDebuggerId(this.#oe?.debuggerId):null;this.#ee=e?.target(),!this.#ae&&this.#Z&&(this.#ae=this.#Z.getPermissionsPolicyState()),await Me.write("FrameDetailsView render",(()=>{this.#Z&&m.render(m.html`
        <${d.ReportView.Report.litTagName} .data=${{reportTitle:this.#Z.displayName()}}>
          ${this.#ie()}
          ${this.#ne()}
          ${this.#se()}
          ${this.#le()}
          ${m.Directives.until(this.#ae?.then((e=>(this.#O.policies=e||[],m.html`
              <${ve.litTagName}
                .data=${this.#O}
              >
              </${ve.litTagName}>
            `))),m.nothing)}
          ${this.#te?this.#ce():m.nothing}
        </${d.ReportView.Report.litTagName}>
      `,this.#e,{host:this})}))}#le(){return this.#Z?(this.#re.classList.add("span-cols"),this.#Z.getOriginTrials().then((e=>{this.#re.data={trials:e}})),m.html`
    <${d.ReportView.ReportSectionHeader.litTagName}>${t.i18n.lockedString("Origin trials")}</${d.ReportView.ReportSectionHeader.litTagName}>
    <div class="span-cols">
        ${De(Ie.originTrialsExplanation)}
        <x-link href="https://developer.chrome.com/docs/web-platform/origin-trials/" class="link">${De(Ie.learnMore)}</x-link>
    </div>
    ${this.#re}
    <${d.ReportView.ReportSectionDivider.litTagName}></${d.ReportView.ReportSectionDivider.litTagName}>
    `):m.nothing}#ie(){return this.#Z?m.html`
      <${d.ReportView.ReportSectionHeader.litTagName}>${De(Ie.document)}</${d.ReportView.ReportSectionHeader.litTagName}>
      <${d.ReportView.ReportKey.litTagName}>${De(Ie.url)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        <div class="inline-items">
          ${this.#de()}
          ${this.#he()}
          <div class="text-ellipsis" title=${this.#Z.url}>${this.#Z.url}</div>
        </div>
      </${d.ReportView.ReportValue.litTagName}>
      ${this.#ue()}
      ${this.#me()}
      ${m.Directives.until(this.#ge(),m.nothing)}
      ${this.#pe()}
      ${this.#be()}
      <${d.ReportView.ReportSectionDivider.litTagName}></${d.ReportView.ReportSectionDivider.litTagName}>
    `:m.nothing}#de(){if(!this.#Z||this.#Z.unreachableUrl())return m.nothing;const t=this.#we(this.#Z);return fe("breakpoint-circle",De(Ie.clickToRevealInSourcesPanel),(()=>e.Revealer.reveal(t)))}#he(){if(this.#Z){const t=this.#Z.resourceForURL(this.#Z.url);if(t&&t.request){const a=t.request;return fe("arrow-up-down-circle",De(Ie.clickToRevealInNetworkPanel),(()=>{const t=k.UIRequestLocation.UIRequestLocation.tab(a,k.UIRequestLocation.UIRequestTabs.HeadersComponent);return e.Revealer.reveal(t)}))}}return m.nothing}#we(e){for(const t of v.Workspace.WorkspaceImpl.instance().projects()){const a=f.NetworkProject.NetworkProject.getTargetForProject(t);if(a&&a===e.resourceTreeModel().target()){const a=t.uiSourceCodeForURL(e.url);if(a)return a}}return null}#ue(){return this.#Z&&this.#Z.unreachableUrl()?m.html`
      <${d.ReportView.ReportKey.litTagName}>${De(Ie.unreachableUrl)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        <div class="inline-items">
          ${this.#fe()}
          <div class="text-ellipsis" title=${this.#Z.unreachableUrl()}>${this.#Z.unreachableUrl()}</div>
        </div>
      </${d.ReportView.ReportValue.litTagName}>
    `:m.nothing}#fe(){if(this.#Z){const t=e.ParsedURL.ParsedURL.fromString(this.#Z.unreachableUrl());if(t)return fe("arrow-up-down-circle",De(Ie.clickToRevealInNetworkPanelMight),(()=>{e.Revealer.reveal(k.UIFilter.UIRequestFilter.filters([{filterType:k.UIFilter.FilterType.Domain,filterValue:t.domain()},{filterType:null,filterValue:t.path}]))}))}return m.nothing}#me(){return this.#Z&&this.#Z.securityOrigin&&"://"!==this.#Z.securityOrigin?m.html`
        <${d.ReportView.ReportKey.litTagName}>${De(Ie.origin)}</${d.ReportView.ReportKey.litTagName}>
        <${d.ReportView.ReportValue.litTagName}>
          <div class="text-ellipsis" title=${this.#Z.securityOrigin}>${this.#Z.securityOrigin}</div>
        </${d.ReportView.ReportValue.litTagName}>
      `:m.nothing}async#ge(){if(this.#Z){const t=await this.#Z.getOwnerDOMNodeOrDocument();if(t)return m.html`
          <${d.ReportView.ReportKey.litTagName}>${De(Ie.ownerElement)}</${d.ReportView.ReportKey.litTagName}>
          <${d.ReportView.ReportValue.litTagName} class="without-min-width">
            <div class="inline-items">
              <button class="link" role="link" tabindex=0
                @mouseenter=${()=>this.#Z?.highlight()}
                @mouseleave=${()=>a.OverlayModel.OverlayModel.hideDOMNodeHighlight()}
                @click=${()=>e.Revealer.reveal(t)}
                title=${De(Ie.clickToRevealInElementsPanel)}
              >
                <${s.Icon.Icon.litTagName} .data=${{iconName:"code-circle",color:"var(--icon-link)",width:"16px",height:"16px"}}>
                </${s.Icon.Icon.litTagName}>
              </button>
              <button class="link text-link" role="link" tabindex=0 title=${De(Ie.clickToRevealInElementsPanel)}
                @mouseenter=${()=>this.#Z?.highlight()}
                @mouseleave=${()=>a.OverlayModel.OverlayModel.hideDOMNodeHighlight()}
                @click=${()=>e.Revealer.reveal(t)}
              >
                &lt;${t.nodeName().toLocaleLowerCase()}&gt;
              </button>
            </div>
          </${d.ReportView.ReportValue.litTagName}>
        `}return m.nothing}#pe(){const e=this.#Z?.getCreationStackTraceData();return e&&e.creationStackTrace?m.html`
        <${d.ReportView.ReportKey.litTagName} title=${De(Ie.creationStackTraceExplanation)}>${De(Ie.creationStackTrace)}</${d.ReportView.ReportKey.litTagName}>
        <${d.ReportView.ReportValue.litTagName}>
          <${Ce.litTagName} .data=${{frame:this.#Z,buildStackTraceRows:u.JSPresentationUtils.buildStackTraceRows}}>
          </${Ce.litTagName}>
        </${d.ReportView.ReportValue.litTagName}>
      `:m.nothing}#ve(e){switch(e){case"child":return{value:De(Ie.child),description:De(Ie.childDescription)};case"root":return{value:De(Ie.root),description:De(Ie.rootDescription)}}}#ke(e){switch(e){case"CreatedByAdScript":return De(Ie.createdByAdScriptExplanation);case"MatchedBlockingRule":return De(Ie.matchedBlockingRuleExplanation);case"ParentIsAd":return De(Ie.parentIsAdExplanation)}}#be(){if(!this.#Z)return m.nothing;const e=this.#Z.adFrameType();if("none"===e)return m.nothing;const t=this.#ve(e),a=[m.html`<div title=${t.description}>${t.value}</div>`];for(const e of this.#Z.adFrameStatus()?.explanations||[])a.push(m.html`<div>${this.#ke(e)}</div>`);const r=this.#ee?this.#K.linkifyScriptLocation(this.#ee,this.#oe?.scriptId||null,b.DevToolsPath.EmptyUrlString,void 0,void 0):null;return m.html`
      <${d.ReportView.ReportKey.litTagName}>${De(Ie.adStatus)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        <${i.ExpandableList.ExpandableList.litTagName} .data=${{rows:a}}></${i.ExpandableList.ExpandableList.litTagName}></${d.ReportView.ReportValue.litTagName}>
      ${this.#ee?m.html`
        <${d.ReportView.ReportKey.litTagName}>${De(Ie.creatorAdScript)}</${d.ReportView.ReportKey.litTagName}>
        <${d.ReportView.ReportValue.litTagName} class="ad-script-link">${r}</${d.ReportView.ReportValue.litTagName}>
      `:m.nothing}
    `}#ne(){return this.#Z?m.html`
      <${d.ReportView.ReportSectionHeader.litTagName}>${De(Ie.securityIsolation)}</${d.ReportView.ReportSectionHeader.litTagName}>
      <${d.ReportView.ReportKey.litTagName}>${De(Ie.secureContext)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        ${this.#Z.isSecureContext()?De(Ie.yes):De(Ie.no)}\xA0${this.#ye()}
      </${d.ReportView.ReportValue.litTagName}>
      <${d.ReportView.ReportKey.litTagName}>${De(Ie.crossoriginIsolated)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        ${this.#Z.isCrossOriginIsolated()?De(Ie.yes):De(Ie.no)}
      </${d.ReportView.ReportValue.litTagName}>
      ${m.Directives.until(this.#Te(),m.nothing)}
      <${d.ReportView.ReportSectionDivider.litTagName}></${d.ReportView.ReportSectionDivider.litTagName}>
    `:m.nothing}#ye(){const e=this.#Se();return e?m.html`<span class="inline-comment">${e}</span>`:m.nothing}#Se(){switch(this.#Z?.getSecureContextType()){case"Secure":return null;case"SecureLocalhost":return De(Ie.localhostIsAlwaysASecureContext);case"InsecureAncestor":return De(Ie.aFrameAncestorIsAnInsecure);case"InsecureScheme":return De(Ie.theFramesSchemeIsInsecure)}return null}async#Te(){if(this.#Z){const e=this.#Z.resourceTreeModel().target().model(a.NetworkManager.NetworkManager),r=e&&await e.getSecurityIsolationStatus(this.#Z.id);if(r)return m.html`
          ${this.#Re(r.coep,t.i18n.lockedString("Cross-Origin Embedder Policy (COEP)"),"None")}
          ${this.#Re(r.coop,t.i18n.lockedString("Cross-Origin Opener Policy (COOP)"),"UnsafeNone")}
          ${this.#$e(r.csp)}
        `}return m.nothing}#Re(e,t,a){if(!e)return m.nothing;const r=e.value!==a,o=!r&&e.reportOnlyValue!==a,i=r?e.reportingEndpoint:e.reportOnlyReportingEndpoint;return m.html`
      <${d.ReportView.ReportKey.litTagName}>${t}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        ${r?e.value:e.reportOnlyValue}
        ${o?m.html`<span class="inline-comment">report-only</span>`:m.nothing}
        ${i?m.html`<span class="inline-name">${De(Ie.reportingTo)}</span>${i}`:m.nothing}
      </${d.ReportView.ReportValue.litTagName}>
    `}#xe(e){const t=new y.CspParser.CspParser(e).csp.directives,a=[];for(const e in t)a.push(m.html`<div><span class="bold">${e}</span>${": "+t[e]?.join(", ")}</div>`);return a}#Ce(e){return m.html`
      <${d.ReportView.ReportKey.litTagName}>${e.isEnforced?t.i18n.lockedString("Content-Security-Policy"):m.html`${t.i18n.lockedString("Content-Security-Policy-Report-Only")}<x-link
            class="link"
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only"
          ><${s.Icon.Icon.litTagName} .data=${{iconName:"help",color:"var(--icon-link)",width:"16px",height:"16px"}}>
            </${s.Icon.Icon.litTagName}></x-link>`}
      </${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        <${s.Icon.Icon.litTagName} class="inline-icon" name="code"></${s.Icon.Icon.litTagName}>
        ${"HTTP"===e.source?t.i18n.lockedString("HTTP header"):t.i18n.lockedString("Meta tag")}
        ${this.#xe(e.effectiveDirectives)}
      </${d.ReportView.ReportValue.litTagName}>
    `}#$e(e){return m.html`
      <${d.ReportView.ReportSectionDivider.litTagName}></${d.ReportView.ReportSectionDivider.litTagName}>
      <${d.ReportView.ReportSectionHeader.litTagName}>
        ${De(Ie.contentSecurityPolicy)}
      </${d.ReportView.ReportSectionHeader.litTagName}>
      ${e&&e.length?e.map((e=>this.#Ce(e))):m.html`
        <${d.ReportView.ReportKey.litTagName}>${t.i18n.lockedString("Content-Security-Policy")}</${d.ReportView.ReportKey.litTagName}>
        <${d.ReportView.ReportValue.litTagName}>
          ${De(Ie.none)}
        </${d.ReportView.ReportValue.litTagName}>
      `}
    `}#se(){return this.#Z?m.html`
      <${d.ReportView.ReportSectionHeader.litTagName}>${De(Ie.apiAvailability)}</${d.ReportView.ReportSectionHeader.litTagName}>
      <div class="span-cols">
        ${De(Ie.availabilityOfCertainApisDepends)}
        <x-link href="https://web.dev/why-coop-coep/" class="link">${De(Ie.learnMore)}</x-link>
      </div>
      ${this.#Ne()}
      ${this.#Ie()}
      <${d.ReportView.ReportSectionDivider.litTagName}></${d.ReportView.ReportSectionDivider.litTagName}>
    `:m.nothing}#Ne(){if(this.#Z){const e=this.#Z.getGatedAPIFeatures();if(e){const t=e.includes("SharedArrayBuffers"),a=t&&e.includes("SharedArrayBuffersTransferAllowed"),r=De(a?Ie.availableTransferable:t?Ie.availableNotTransferable:Ie.unavailable),o=a?De(Ie.sharedarraybufferConstructorIs):t?De(Ie.sharedarraybufferConstructorIsAvailable):"";function i(e){switch(e.getCrossOriginIsolatedContextType()){case"Isolated":return m.nothing;case"NotIsolated":return t?m.html`<span class="inline-comment">${De(Ie.willRequireCrossoriginIsolated)}</span>`:m.html`<span class="inline-comment">${De(Ie.requiresCrossoriginIsolated)}</span>`;case"NotIsolatedFeatureDisabled":if(!a)return m.html`<span class="inline-comment">${De(Ie.transferRequiresCrossoriginIsolatedPermission)} <code>cross-origin-isolated</code></span>`}return m.nothing}return m.html`
          <${d.ReportView.ReportKey.litTagName}>SharedArrayBuffers</${d.ReportView.ReportKey.litTagName}>
          <${d.ReportView.ReportValue.litTagName} title=${o}>
            ${r}\xA0${i(this.#Z)}
          </${d.ReportView.ReportValue.litTagName}>
        `}}return m.nothing}#Ie(){if(this.#Z){const e=this.#Z.isCrossOriginIsolated(),t=De(e?Ie.available:Ie.unavailable),a=De(e?Ie.thePerformanceAPI:Ie.thePerformancemeasureuseragentspecificmemory);return m.html`
        <${d.ReportView.ReportKey.litTagName}>${De(Ie.measureMemory)}</${d.ReportView.ReportKey.litTagName}>
        <${d.ReportView.ReportValue.litTagName}>
          <span title=${a}>${t}</span>\xA0<x-link class="link" href="https://web.dev/monitor-total-page-memory-usage/">${De(Ie.learnMore)}</x-link>
        </${d.ReportView.ReportValue.litTagName}>
      `}return m.nothing}#ce(){return this.#Z?m.html`
      <${d.ReportView.ReportSectionHeader.litTagName}
        title=${De(Ie.thisAdditionalDebugging)}
      >${De(Ie.additionalInformation)}</${d.ReportView.ReportSectionHeader.litTagName}>
      <${d.ReportView.ReportKey.litTagName}>${De(Ie.frameId)}</${d.ReportView.ReportKey.litTagName}>
      <${d.ReportView.ReportValue.litTagName}>
        <div class="text-ellipsis" title=${this.#Z.id}>${this.#Z.id}</div>
      </${d.ReportView.ReportValue.litTagName}>
      <${d.ReportView.ReportSectionDivider.litTagName}></${d.ReportView.ReportSectionDivider.litTagName}>
    `:m.nothing}}n.CustomElements.defineComponent("devtools-resources-frame-details-view",Be);var Ve=Object.freeze({__proto__:null,FrameDetailsReportView:Be});const Fe=new CSSStyleSheet;Fe.replaceSync(":host{padding:20px}.heading{font-size:15px}devtools-data-grid-controller{border:1px solid var(--sys-color-divider);margin-top:20px}.info-icon{vertical-align:text-bottom;height:14px}.no-events-message{margin-top:20px}\n/*# sourceURL=interestGroupAccessGrid.css */\n");const Ee={allInterestGroupStorageEvents:"All interest group storage events.",eventTime:"Event Time",eventType:"Access Type",groupOwner:"Owner",groupName:"Name",noEvents:"No interest group events recorded."},Le=t.i18n.registerUIStrings("panels/application/components/InterestGroupAccessGrid.ts",Ee),Ae=t.i18n.getLocalizedString.bind(void 0,Le);class He extends HTMLElement{static litTagName=m.literal`devtools-interest-group-access-grid`;#e=this.attachShadow({mode:"open"});#Pe=[];connectedCallback(){this.#e.adoptedStyleSheets=[Fe],this.#$()}set data(e){this.#Pe=e,this.#$()}#$(){m.render(m.html`
      <div>
        <span class="heading">Interest Groups</span>
        <${s.Icon.Icon.litTagName} class="info-icon" title=${Ae(Ee.allInterestGroupStorageEvents)}
          .data=${{iconName:"info",color:"var(--icon-default)",width:"16px"}}>
        </${s.Icon.Icon.litTagName}>
        ${this.#De()}
      </div>
    `,this.#e,{host:this})}#De(){if(0===this.#Pe.length)return m.html`<div class="no-events-message">${Ae(Ee.noEvents)}</div>`;const e={columns:[{id:"event-time",title:Ae(Ee.eventTime),widthWeighting:10,hideable:!1,visible:!0,sortable:!0},{id:"event-type",title:Ae(Ee.eventType),widthWeighting:5,hideable:!1,visible:!0,sortable:!0},{id:"event-group-owner",title:Ae(Ee.groupOwner),widthWeighting:10,hideable:!1,visible:!0,sortable:!0},{id:"event-group-name",title:Ae(Ee.groupName),widthWeighting:10,hideable:!1,visible:!0,sortable:!0}],rows:this.#Me(),initialSort:{columnId:"event-time",direction:"ASC"}};return m.html`
      <${p.DataGridController.DataGridController.litTagName} .data=${e}></${p.DataGridController.DataGridController.litTagName}>
    `}#Me(){return this.#Pe.map((e=>({cells:[{columnId:"event-time",value:e.accessTime,renderer:this.#Be.bind(this)},{columnId:"event-type",value:e.type},{columnId:"event-group-owner",value:e.ownerOrigin},{columnId:"event-group-name",value:e.name}]})))}#Be(e){const t=new Date(1e3*e);return m.html`${t.toLocaleString()}`}}n.CustomElements.defineComponent("devtools-interest-group-access-grid",He);var Oe=Object.freeze({__proto__:null,i18nString:Ae,InterestGroupAccessGrid:He});const We=new CSSStyleSheet;We.replaceSync('*{box-sizing:border-box;min-width:0;min-height:0}:root{height:100%;overflow:hidden;--legacy-accent-color:#1a73e8;--legacy-accent-fg-color:#1a73e8;--legacy-accent-color-hover:#3b86e8;--legacy-accent-fg-color-hover:#1567d3;--legacy-active-control-bg-color:#5a5a5a;--legacy-focus-bg-color:hsl(214deg 40% 92%);--legacy-focus-ring-inactive-shadow-color:#e0e0e0;--legacy-input-validation-error:#db1600;--legacy-toolbar-hover-bg-color:#eaeaea;--legacy-selection-fg-color:#fff;--legacy-selection-bg-color:var(--legacy-accent-color);--legacy-selection-inactive-fg-color:#5a5a5a;--legacy-selection-inactive-bg-color:#dadada;--legacy-divider-border:1px solid var(--sys-color-divider);--legacy-focus-ring-inactive-shadow:0 0 0 1px var(--legacy-focus-ring-inactive-shadow-color);--legacy-focus-ring-active-shadow:0 0 0 1px var(--legacy-accent-color);--legacy-item-selection-bg-color:#cfe8fc;--legacy-item-selection-inactive-bg-color:#e0e0e0;--item-hover-color:rgb(56 121 217/10%);--monospace-font-size:10px;--monospace-font-family:monospace;--source-code-font-size:11px;--source-code-font-family:monospace;--sys-motion-duration-short4:200ms;--sys-motion-duration-medium2:300ms;--sys-motion-duration-long2:500ms;--sys-motion-easing-emphasized:cubic-bezier(0.2,0,0,1);--sys-motion-easing-emphasized-decelerate:cubic-bezier(0.05,0.7,0.1,1);--sys-motion-easing-emphasized-accelerate:cubic-bezier(0.2,0,0,1)}.-theme-with-dark-background{color-scheme:dark;--legacy-accent-color:#0e639c;--legacy-accent-fg-color:#ccc;--legacy-accent-fg-color-hover:#fff;--legacy-accent-color-hover:rgb(17 119 187);--legacy-active-control-bg-color:#cdcdcd;--legacy-focus-bg-color:hsl(214deg 19% 27%);--legacy-focus-ring-inactive-shadow-color:#5a5a5a;--legacy-toolbar-hover-bg-color:#202020;--legacy-selection-fg-color:#cdcdcd;--legacy-selection-inactive-fg-color:#cdcdcd;--legacy-selection-inactive-bg-color:hsl(0deg 0% 28%);--legacy-focus-ring-inactive-shadow:0 0 0 1px var(--legacy-focus-ring-inactive-shadow-color);--legacy-item-selection-bg-color:hsl(207deg 88% 22%);--legacy-item-selection-inactive-bg-color:#454545}body{--default-font-family:".SFNSDisplay-Regular","Helvetica Neue","Lucida Grande",sans-serif;height:100%;width:100%;position:relative;overflow:hidden;margin:0;cursor:default;font-family:var(--default-font-family);font-size:12px;tab-size:4;user-select:none;color:var(--sys-color-on-surface);background:var(--sys-color-cdt-base-container)}.platform-linux{--default-font-family:roboto,ubuntu,arial,sans-serif}.platform-mac{--default-font-family:".SFNSDisplay-Regular","Helvetica Neue","Lucida Grande",sans-serif}.platform-windows{--default-font-family:"Segoe UI",tahoma,sans-serif}:focus{outline-width:0}.platform-mac,\n:host-context(.platform-mac){--monospace-font-size:11px;--monospace-font-family:menlo,monospace;--source-code-font-size:11px;--source-code-font-family:menlo,monospace}.platform-windows,\n:host-context(.platform-windows){--monospace-font-size:12px;--monospace-font-family:consolas,lucida console,courier new,monospace;--source-code-font-size:12px;--source-code-font-family:consolas,lucida console,courier new,monospace}.platform-linux,\n:host-context(.platform-linux){--monospace-font-size:11px;--monospace-font-family:dejavu sans mono,monospace;--source-code-font-size:11px;--source-code-font-family:dejavu sans mono,monospace}.monospace{font-family:var(--monospace-font-family);font-size:var(--monospace-font-size)!important}.source-code{font-family:var(--source-code-font-family);font-size:var(--source-code-font-size)!important;white-space:pre-wrap}img{-webkit-user-drag:none}iframe,\na img{border:none}.fill{position:absolute;top:0;left:0;right:0;bottom:0}iframe.fill{width:100%;height:100%}.widget{position:relative;flex:auto;contain:style}.hbox{display:flex;flex-direction:row!important;position:relative}.vbox{display:flex;flex-direction:column!important;position:relative}.view-container > .toolbar{border-bottom:1px solid var(--sys-color-divider)}.flex-auto{flex:auto}.flex-none{flex:none}.flex-centered{display:flex;align-items:center;justify-content:center}.overflow-auto{overflow:auto;background-color:var(--sys-color-cdt-base-container)}iframe.widget{position:absolute;width:100%;height:100%;left:0;right:0;top:0;bottom:0}.hidden{display:none!important}.highlighted-search-result{--override-highlighted-search-result-background-color:rgb(255 255 0/80%);border-radius:1px;background-color:var(--override-highlighted-search-result-background-color);outline:1px solid var(--override-highlighted-search-result-background-color)}.-theme-with-dark-background .highlighted-search-result,\n:host-context(.-theme-with-dark-background) .highlighted-search-result{--override-highlighted-search-result-background-color:hsl(133deg 100% 30%);color:#333}.link{cursor:pointer;text-decoration:underline;color:var(--sys-color-primary);outline-offset:2px}button,\ninput,\nselect{font-family:inherit;font-size:inherit}select option,\nselect optgroup,\ninput{background-color:var(--sys-color-cdt-base-container)}input{color:inherit}input::placeholder{--override-input-placeholder-color:rgb(0 0 0/54%);color:var(--override-input-placeholder-color)}.-theme-with-dark-background input::placeholder,\n:host-context(.-theme-with-dark-background) input::placeholder{--override-input-placeholder-color:rgb(230 230 230/54%)}:host-context(.-theme-with-dark-background) input[type="checkbox"]:not(.-theme-preserve){accent-color:var(--color-checkbox-accent-color)}.harmony-input:not([type]),\n.harmony-input[type="number"],\n.harmony-input[type="text"]{padding:3px 6px;height:24px;border:1px solid var(--sys-color-neutral-outline);border-radius:4px;&.error-input,\n  &:invalid{border-color:var(--sys-color-error)}&:not(.error-input):not(:invalid):focus{border-color:var(--sys-color-state-focus-ring)}&:not(.error-input):not(:invalid):hover:not(:focus){background:var(--sys-color-state-hover-on-subtle)}}.highlighted-search-result.current-search-result{--override-current-search-result-background-color:rgb(255 127 0/80%);border-radius:1px;padding:1px;margin:-1px;background-color:var(--override-current-search-result-background-color)}.dimmed{opacity:60%}.editing{box-shadow:var(--drop-shadow);background-color:var(--sys-color-cdt-base-container);text-overflow:clip!important;padding-left:2px;margin-left:-2px;padding-right:2px;margin-right:-2px;margin-bottom:-1px;padding-bottom:1px;opacity:100%!important}.editing,\n.editing *{color:var(--sys-color-on-surface)!important;text-decoration:none!important}.chrome-select{appearance:none;user-select:none;border:1px solid var(--sys-color-neutral-outline);border-radius:4px;color:var(--sys-color-on-surface);font:inherit;margin:0;outline:none;padding-right:20px;padding-left:6px;background-image:var(--image-file-arrow-drop-down-light);background-color:var(--sys-color-surface);background-position:right center;background-repeat:no-repeat;min-height:24px;min-width:80px}.chrome-select:disabled{opacity:38%}.-theme-with-dark-background .chrome-select,\n:host-context(.-theme-with-dark-background) .chrome-select{background-image:var(--image-file-arrow-drop-down-dark)}.chrome-select:enabled{&:hover{background-color:var(--sys-color-state-hover-on-subtle)}&:active{background-color:var(--sys-color-state-ripple-neutral-on-subtle)}&:focus{outline:2px solid var(--sys-color-state-focus-ring);outline-offset:2px}}@media (forced-colors: active) and (prefers-color-scheme: light){.chrome-select{background-image:var(--image-file-arrow-drop-down-light)}.-theme-with-dark-background .chrome-select,\n  :host-context(.-theme-with-dark-background) .chrome-select{background-image:var(--image-file-arrow-drop-down-light)}}@media (forced-colors: active) and (prefers-color-scheme: dark){.chrome-select{background-image:var(--image-file-arrow-drop-down-dark)}.-theme-with-dark-background .chrome-select,\n  :host-context(.-theme-with-dark-background) .chrome-select{background-image:var(--image-file-arrow-drop-down-dark)}}.chrome-select-label{margin:0 22px;flex:none}.chrome-select-label p p{margin-top:0;color:var(--sys-color-token-subtle)}.settings-select{margin:0}.chrome-select optgroup,\n.chrome-select option{background-color:var(--sys-color-cdt-base-container);color:var(--sys-color-on-surface)}.gray-info-message{text-align:center;font-style:italic;padding:6px;color:var(--sys-color-token-subtle);white-space:nowrap}span[is="dt-icon-label"]{flex:none}.full-widget-dimmed-banner a{color:inherit}.full-widget-dimmed-banner{color:var(--sys-color-token-subtle);background-color:var(--sys-color-cdt-base-container);display:flex;justify-content:center;align-items:center;text-align:center;padding:20px;position:absolute;top:0;right:0;bottom:0;left:0;font-size:13px;overflow:auto;z-index:500}.dot::before{content:url("Images/empty.svg");width:6px;height:6px;border-radius:50%;outline:1px solid var(--icon-gap-default);left:9px;position:absolute;top:9px;z-index:1}.green::before{background-color:var(--sys-color-green-bright)}.purple::before{background-color:var(--sys-color-purple-bright)}.expandable-inline-button{background-color:var(--sys-color-cdt-base-container);color:var(--sys-color-on-surface);cursor:pointer;border-radius:3px}.undisplayable-text,\n.expandable-inline-button{padding:1px 3px;margin:0 2px;font-size:11px;font-family:sans-serif;white-space:nowrap;display:inline-block}.undisplayable-text::after,\n.expandable-inline-button::after{content:attr(data-text)}.undisplayable-text{color:var(--sys-color-state-disabled);font-style:italic}.expandable-inline-button:hover,\n.expandable-inline-button:focus-visible{background-color:var(--sys-color-state-hover-on-subtle)}.expandable-inline-button:focus-visible{background-color:var(--sys-color-state-focus-highlight)}::selection{background-color:var(--sys-color-tonal-container)}.reload-warning{align-self:center;margin-left:10px}button.link{border:none;background:none;padding:3px}button.link:focus-visible{--override-link-focus-background-color:rgb(0 0 0/8%);background-color:var(--override-link-focus-background-color);border-radius:2px}.-theme-with-dark-background button.link:focus-visible,\n:host-context(.-theme-with-dark-background) button.link:focus-visible{--override-link-focus-background-color:rgb(230 230 230/8%)}@media (forced-colors: active){.dimmed,\n  .chrome-select:disabled{opacity:100%}.harmony-input:not([type]),\n  .harmony-input[type="number"],\n  .harmony-input[type="text"]{border:1px solid ButtonText}.harmony-input:not([type]):focus,\n  .harmony-input[type="number"]:focus,\n  .harmony-input[type="text"]:focus{border:1px solid Highlight}}input.custom-search-input::-webkit-search-cancel-button{appearance:none;width:16px;height:15px;margin-right:0;opacity:70%;-webkit-mask-image:var(--image-file-cross-circle-filled);-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-size:99%;background-color:var(--icon-default)}input.custom-search-input::-webkit-search-cancel-button:hover{opacity:99%}.spinner::before{display:block;width:var(--dimension,24px);height:var(--dimension,24px);border:var(--override-spinner-size,3px) solid var(--override-spinner-color,var(--sys-color-token-subtle));border-radius:12px;clip:rect(0,var(--clip-size,15px),var(--clip-size,15px),0);content:"";position:absolute;animation:spinner-animation 1s linear infinite;box-sizing:border-box}@keyframes spinner-animation{from{transform:rotate(0)}to{transform:rotate(360deg)}}.adorner-container{display:inline-block}.adorner-container.hidden{display:none}.adorner-container devtools-adorner{margin-left:3px}:host-context(.-theme-with-dark-background) devtools-adorner{--override-adorner-border-color:var(--sys-color-tonal-outline);--override-adorner-focus-border-color:var(--sys-color-state-focus-ring);--override-adorner-active-background-color:var(--sys-color-state-riple-neutral-on-subtle)}.panel{display:flex;overflow:hidden;position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;background-color:var(--sys-color-cdt-base-container)}.panel-sidebar{overflow-x:hidden;background-color:var(--sys-color-cdt-base-container)}iframe.extension{flex:auto;width:100%;height:100%}iframe.panel.extension{display:block;height:100%}@media (forced-colors: active){:root{--legacy-accent-color:Highlight;--legacy-focus-ring-inactive-shadow-color:ButtonText}}\n/*# sourceURL=inspectorCommon.css */\n');const Ue=new CSSStyleSheet;Ue.replaceSync('.devtools-link{color:var(--sys-color-primary);text-decoration:underline;cursor:pointer;outline-offset:2px}.devtools-link:focus-visible{outline-width:unset}input.devtools-text-input[type="text"]{padding:3px 6px;margin-left:4px;margin-right:4px;width:250px;height:25px}input.devtools-text-input[type="text"]::placeholder{color:var(--sys-color-token-subtle)}.protocol-handlers-row{margin:10px 0 2px 18px}.inline-icon{vertical-align:text-bottom}@media (forced-colors: active){.devtools-link:not(.devtools-link-prevent-click){color:linktext}.devtools-link:focus-visible{background:Highlight;color:HighlightText}}\n/*# sourceURL=protocolHandlersView.css */\n');const qe={protocolDetected:"Found valid protocol handler registration in the {PH1}. With the app installed, test the registered protocols.",protocolNotDetected:"Define protocol handlers in the {PH1} to register your app as a handler for custom protocols when your app is installed.",needHelpReadOur:"Need help? Read {PH1}.",protocolHandlerRegistrations:"URL protocol handler registration for PWAs",manifest:"manifest",testProtocol:"Test protocol",dropdownLabel:"Select protocol handler",textboxLabel:"Query parameter or endpoint for protocol handler",textboxPlaceholder:"Enter URL"},_e=t.i18n.registerUIStrings("panels/application/components/ProtocolHandlersView.ts",qe),ze=t.i18n.getLocalizedString.bind(void 0,_e);class Ge extends HTMLElement{static litTagName=m.literal`devtools-protocol-handlers-view`;#e=this.attachShadow({mode:"open"});#Ve=[];#Fe=b.DevToolsPath.EmptyUrlString;#Ee="";#Le="";set data(e){const t=this.#Fe!==e.manifestLink;this.#Ve=e.protocolHandlers,this.#Fe=e.manifestLink,t&&this.#Ae()}#Ae(){this.#Le="",this.#Ee=this.#Ve[0]?.protocol??"",this.#$()}#He(){const e=$.XLink.XLink.create(this.#Fe,ze(qe.manifest),void 0,void 0,"manifest"),a=this.#Ve.length>0?qe.protocolDetected:qe.protocolNotDetected,r=this.#Ve.length>0?{iconName:"check-circle",color:"var(--icon-checkmark-green)",width:"16px",height:"16px"}:{iconName:"info",color:"var(--icon-default)",width:"16px",height:"16px"};return m.html`
    <div class="protocol-handlers-row status">
            <${s.Icon.Icon.litTagName} class="inline-icon" .data=${r}>
            </${s.Icon.Icon.litTagName}>
            ${t.i18n.getFormatLocalizedString(_e,a,{PH1:e})}
    </div>
    `}#Oe(){if(0===this.#Ve.length)return m.nothing;const e=this.#Ve.filter((e=>e.protocol)).map((e=>m.html`<option value=${e.protocol}>${e.protocol}://</option>`));return m.html`
       <div class="protocol-handlers-row">
        <select class="chrome-select protocol-select" @change=${this.#We} aria-label=${ze(qe.dropdownLabel)}>
           ${e}
        </select>
        <input .value=${this.#Le} class="devtools-text-input" type="text" @change=${this.#Ue} aria-label=${ze(qe.textboxLabel)}
        placeholder=${ze(qe.textboxPlaceholder)}/>
        <${r.Button.Button.litTagName} .variant=${"primary"} @click=${this.#qe}>
            ${ze(qe.testProtocol)}
        </${r.Button.Button.litTagName}>
        </div>
      `}#We=e=>{this.#Ee=e.target.value};#Ue=e=>{this.#Le=e.target.value,this.#$()};#qe=()=>{const e=`${this.#Ee}://${this.#Le}`;S.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(e),S.userMetrics.actionTaken(S.UserMetrics.Action.CaptureTestProtocolClicked)};connectedCallback(){this.#e.adoptedStyleSheets=[Ue,We,R.textInputStyles]}#$(){const e=$.XLink.XLink.create("https://web.dev/url-protocol-handler/",ze(qe.protocolHandlerRegistrations),void 0,void 0,"learn-more");m.render(m.html`
      ${this.#He()}
      <div class="protocol-handlers-row">
          ${t.i18n.getFormatLocalizedString(_e,qe.needHelpReadOur,{PH1:e})}
      </div>
      ${this.#Oe()}
    `,this.#e,{host:this})}}n.CustomElements.defineComponent("devtools-protocol-handlers-view",Ge);var je=Object.freeze({__proto__:null,ProtocolHandlersView:Ge});const Ke={noReportsToDisplay:"No reports to display",status:"Status",destination:"Destination",generatedAt:"Generated at"},Je=t.i18n.registerUIStrings("panels/application/components/ReportsGrid.ts",Ke),Xe=t.i18n.getLocalizedString.bind(void 0,Je),{render:Ye,html:Qe}=m;class Ze extends HTMLElement{static litTagName=m.literal`devtools-resources-reports-grid-status-header`;#e=this.attachShadow({mode:"open"});connectedCallback(){this.#e.adoptedStyleSheets=[q],this.#$()}#$(){Ye(Qe`
      ${Xe(Ke.status)}
      <x-link href="https://web.dev/reporting-api/#report-status"
      jslog=${g.link().track({click:!0}).context("report-status")}>
        <${s.Icon.Icon.litTagName} class="inline-icon" .data=${{iconName:"help",color:"var(--icon-link)",width:"16px",height:"16px"}}></${s.Icon.Icon.litTagName}>
      </x-link>
    `,this.#e,{host:this})}}class et extends HTMLElement{static litTagName=m.literal`devtools-resources-reports-grid`;#e=this.attachShadow({mode:"open"});#_e=[];#te=!1;connectedCallback(){this.#e.adoptedStyleSheets=[q],this.#te=w.Runtime.experiments.isEnabled("protocolMonitor"),this.#$()}set data(e){this.#_e=e.reports,this.#$()}#$(){const e={columns:[{id:"url",title:t.i18n.lockedString("URL"),widthWeighting:30,hideable:!1,visible:!0},{id:"type",title:t.i18n.lockedString("Type"),widthWeighting:20,hideable:!1,visible:!0},{id:"status",title:Xe(Ke.status),widthWeighting:20,hideable:!1,visible:!0,titleElement:Qe`
          <${Ze.litTagName}></${Ze.litTagName}>
          `},{id:"destination",title:Xe(Ke.destination),widthWeighting:20,hideable:!1,visible:!0},{id:"timestamp",title:Xe(Ke.generatedAt),widthWeighting:20,hideable:!1,visible:!0},{id:"body",title:t.i18n.lockedString("Body"),widthWeighting:20,hideable:!1,visible:!0}],rows:this.#B()};this.#te&&e.columns.unshift({id:"id",title:"ID",widthWeighting:30,hideable:!1,visible:!0}),Ye(Qe`
      <div class="reporting-container" jslog=${g.section().context("reports")}>
        <div class="reporting-header">${t.i18n.lockedString("Reports")}</div>
        ${this.#_e.length>0?Qe`
          <${p.DataGridController.DataGridController.litTagName} .data=${e}>
          </${p.DataGridController.DataGridController.litTagName}>
        `:Qe`
          <div class="reporting-placeholder">
            <div>${Xe(Ke.noReportsToDisplay)}</div>
          </div>
        `}
      </div>
    `,this.#e,{host:this})}#B(){return this.#_e.map((e=>({cells:[{columnId:"id",value:e.id},{columnId:"url",value:e.initiatorUrl},{columnId:"type",value:e.type},{columnId:"status",value:e.status},{columnId:"destination",value:e.destination},{columnId:"timestamp",value:new Date(1e3*e.timestamp).toLocaleString()},{columnId:"body",value:JSON.stringify(e.body)}]})))}}n.CustomElements.defineComponent("devtools-resources-reports-grid-status-header",Ze),n.CustomElements.defineComponent("devtools-resources-reports-grid",et);var tt=Object.freeze({__proto__:null,i18nString:Xe,ReportsGridStatusHeader:Ze,ReportsGrid:et});const at=new CSSStyleSheet;at.replaceSync(":host{display:block;white-space:normal;max-width:400px}.router-rules{border:1px solid var(--sys-color-divider);border-spacing:0;padding-left:10px;padding-right:10px;line-height:initial;margin-top:0;padding-bottom:12px;text-wrap:balance}.router-rule{display:flex;margin-top:12px;flex-direction:column}.rule-id{color:var(--sys-color-token-subtle)}.item{display:flex;flex-direction:column;padding-left:10px}.condition,\n.source{list-style:none;display:flex;margin-top:4px;flex-direction:row}.condition > *,\n.source > *{word-break:break-all;line-height:1.5em}.rule-type{flex:0 0 18%}\n/*# sourceURL=serviceWorkerRouterView.css */\n");const{html:rt,render:ot}=m;class it extends l.LegacyWrapper.WrappableComponent{static litTagName=m.literal`devtools-service-worker-router-view`;#e=this.attachShadow({mode:"open"});#ze=[];connectedCallback(){this.#e.adoptedStyleSheets=[at]}update(e){this.#ze=e,this.#ze.length>0&&this.#$()}#$(){ot(rt`
      <ul class="router-rules">
        ${this.#ze.map(this.#Ge)}
      </ul>
    `,this.#e,{host:this})}#Ge(e){return rt`
      <li class="router-rule">
        <div class="rule-id">Rule ${e.id}</div>
        <ul class="item">
          <li class="condition">
            <div class="rule-type">Condition</div>
            <div class="rule-value">${e.condition}</div>
          </li>
          <li class="source">
            <div class="rule-type">Source</div>
            <div class="rule-value">${e.source}</div>
          </li>
        </ul>
      </li>
    `}}n.CustomElements.defineComponent("devtools-service-worker-router-view",it);var nt=Object.freeze({__proto__:null,ServiceWorkerRouterView:it});const st=new CSSStyleSheet;st.replaceSync(":host{padding:20px}.heading{font-size:15px}devtools-data-grid-controller{border:1px solid var(--sys-color-divider);margin-top:20px}.info-icon{vertical-align:text-bottom;height:14px}.no-events-message{margin-top:20px}\n/*# sourceURL=sharedStorageAccessGrid.css */\n");const lt={sharedStorage:"Shared storage",allSharedStorageEvents:"All shared storage events for this page.",eventTime:"Event Time",eventType:"Access Type",mainFrameId:"Main Frame ID",ownerOrigin:"Owner Origin",eventParams:"Optional Event Params",noEvents:"No shared storage events recorded."},ct=t.i18n.registerUIStrings("panels/application/components/SharedStorageAccessGrid.ts",lt),dt=t.i18n.getLocalizedString.bind(void 0,ct);class ht extends HTMLElement{static litTagName=m.literal`devtools-shared-storage-access-grid`;#e=this.attachShadow({mode:"open"});#Pe=[];connectedCallback(){this.#e.adoptedStyleSheets=[st],this.#$()}set data(e){this.#Pe=e,this.#$()}#$(){m.render(m.html`
      <div>
        <span class="heading">${dt(lt.sharedStorage)}</span>
        <${s.Icon.Icon.litTagName} class="info-icon" title=${dt(lt.allSharedStorageEvents)}
          .data=${{iconName:"info",color:"var(--icon-default)",width:"16px"}}>
        </${s.Icon.Icon.litTagName}>
        ${this.#De()}
      </div>
    `,this.#e,{host:this})}#De(){if(0===this.#Pe.length)return m.html`<div
        class="no-events-message">${dt(lt.noEvents)}</div>`;const e={columns:[{id:"event-main-frame-id",title:dt(lt.mainFrameId),widthWeighting:10,hideable:!1,visible:!1,sortable:!1},{id:"event-time",title:dt(lt.eventTime),widthWeighting:10,hideable:!1,visible:!0,sortable:!0},{id:"event-type",title:dt(lt.eventType),widthWeighting:10,hideable:!1,visible:!0,sortable:!0},{id:"event-owner-origin",title:dt(lt.ownerOrigin),widthWeighting:10,hideable:!1,visible:!0,sortable:!0},{id:"event-params",title:dt(lt.eventParams),widthWeighting:10,hideable:!1,visible:!0,sortable:!0}],rows:this.#Me(),initialSort:{columnId:"event-time",direction:"ASC"}};return m.html`
      <${p.DataGridController.DataGridController.litTagName} .data=${e}></${p.DataGridController.DataGridController.litTagName}>
    `}#Me(){return this.#Pe.map((e=>({cells:[{columnId:"event-main-frame-id",value:e.mainFrameId},{columnId:"event-time",value:e.accessTime,renderer:this.#Be.bind(this)},{columnId:"event-type",value:e.type},{columnId:"event-owner-origin",value:e.ownerOrigin},{columnId:"event-params",value:JSON.stringify(e.params)}]})))}#Be(e){const t=new Date(1e3*e);return m.html`${t.toLocaleString()}`}}n.CustomElements.defineComponent("devtools-shared-storage-access-grid",ht);var ut=Object.freeze({__proto__:null,i18nString:dt,SharedStorageAccessGrid:ht});const mt=new CSSStyleSheet;mt.replaceSync(".text-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}devtools-icon{vertical-align:text-bottom;margin-left:2px;width:16px;height:16px}devtools-button{vertical-align:sub}\n/*# sourceURL=sharedStorageMetadataView.css */\n");const gt={origin:"Origin",topLevelSite:"Top-level site",opaque:"(opaque)",isOpaque:"Is opaque",isThirdParty:"Is third-party",yes:"Yes",no:"No",yesBecauseTopLevelIsOpaque:"Yes, because the top-level site is opaque",yesBecauseKeyIsOpaque:"Yes, because the storage key is opaque",yesBecauseOriginNotInTopLevelSite:"Yes, because the origin is outside of the top-level site",yesBecauseAncestorChainHasCrossSite:"Yes, because the ancestry chain contains a third-party origin",loading:"Loading…",bucketName:"Bucket name",defaultBucket:"Default bucket",persistent:"Is persistent",durability:"Durability",quota:"Quota",expiration:"Expiration",none:"None",deleteBucket:"Delete bucket",confirmBucketDeletion:'Delete the "{PH1}" bucket?'},pt=t.i18n.registerUIStrings("panels/application/components/StorageMetadataView.ts",gt),bt=t.i18n.getLocalizedString.bind(void 0,pt),wt=c.RenderCoordinator.RenderCoordinator.instance();class ft extends l.LegacyWrapper.WrappableComponent{static litTagName=m.literal`devtools-storage-metadata-view`;#e=this.attachShadow({mode:"open"});#je;#Ke=null;#Je=null;getShadow(){return this.#e}setStorageKey(e){this.#Ke=a.StorageKeyManager.parseStorageKey(e),this.render()}setStorageBucket(e){this.#Je=e,this.setStorageKey(e.bucket.storageKey)}enableStorageBucketControls(e){this.#je=e,this.#Ke&&this.render()}render(){return wt.write("StorageMetadataView render",(async()=>{m.render(m.html`
        <${d.ReportView.Report.litTagName} .data=${{reportTitle:this.getTitle()||bt(gt.loading)}}>
          ${await this.renderReportContent()}
        </${d.ReportView.Report.litTagName}>`,this.#e,{host:this})}))}getTitle(){if(!this.#Ke)return;const e=this.#Ke.origin,t=this.#Je?.bucket.name||bt(gt.defaultBucket);return this.#je?`${t} - ${e}`:e}key(e){return m.html`<${d.ReportView.ReportKey.litTagName}>${e}</${d.ReportView.ReportKey.litTagName}>`}value(e){return m.html`<${d.ReportView.ReportValue.litTagName}>${e}</${d.ReportView.ReportValue.litTagName}>`}async renderReportContent(){if(!this.#Ke)return m.nothing;const e=this.#Ke.origin,t=Boolean(this.#Ke.components.get("3")),a=Boolean(this.#Ke.components.get("1")),r=Boolean(this.#Ke.components.get("4")),o=this.#Ke.components.get("0"),i=t?bt(gt.yesBecauseAncestorChainHasCrossSite):a?bt(gt.yesBecauseKeyIsOpaque):r?bt(gt.yesBecauseTopLevelIsOpaque):o&&e!==o?bt(gt.yesBecauseOriginNotInTopLevelSite):null;return m.html`
        ${this.key(bt(gt.origin))}
        ${this.value(m.html`<div class="text-ellipsis" title=${e}>${e}</div>`)}
        ${o||r?this.key(bt(gt.topLevelSite)):m.nothing}
        ${o?this.value(o):m.nothing}
        ${r?this.value(bt(gt.opaque)):m.nothing}
        ${i?m.html`${this.key(bt(gt.isThirdParty))}${this.value(i)}`:m.nothing}
        ${a||r?this.key(bt(gt.isOpaque)):m.nothing}
        ${a?this.value(bt(gt.yes)):m.nothing}
        ${r?this.value(bt(gt.yesBecauseTopLevelIsOpaque)):m.nothing}
        ${this.#Je?this.#Xe():m.nothing}
        ${this.#je?this.#Ye():m.nothing}`}#Xe(){if(!this.#Je)throw new Error("Should not call #renderStorageBucketInfo if #bucket is null.");const{bucket:{name:e},persistent:t,durability:a,quota:r}=this.#Je;return m.html`
      ${this.key(bt(gt.bucketName))}
      ${this.value(e||"default")}
      ${this.key(bt(gt.persistent))}
      ${this.value(bt(t?gt.yes:gt.no))}
      ${this.key(bt(gt.durability))}
      ${this.value(a)}
      ${this.key(bt(gt.quota))}
      ${this.value(b.NumberUtilities.bytesToString(r))}
      ${this.key(bt(gt.expiration))}
      ${this.value(this.#Qe())}`}#Qe(){if(!this.#Je)throw new Error("Should not call #getExpirationString if #bucket is null.");const{expiration:e}=this.#Je;return 0===e?bt(gt.none):new Date(1e3*e).toLocaleString()}#Ye(){return m.html`
      <${d.ReportView.ReportSection.litTagName}>
        <${r.Button.Button.litTagName}
          aria-label=${bt(gt.deleteBucket)}
          .variant=${"primary"}
          @click=${this.#Ze}>
          ${bt(gt.deleteBucket)}
        </${r.Button.Button.litTagName}>
      </${d.ReportView.ReportSection.litTagName}>`}async#Ze(){if(!this.#je||!this.#Je)throw new Error("Should not call #deleteBucket if #storageBucketsModel or #storageBucket is null.");await $.UIUtils.ConfirmDialog.show(bt(gt.confirmBucketDeletion,{PH1:this.#Je.bucket.name||""}),this)&&this.#je.deleteBucket(this.#Je.bucket)}}n.CustomElements.defineComponent("devtools-storage-metadata-view",ft);var vt=Object.freeze({__proto__:null,StorageMetadataView:ft});const kt={sharedStorage:"Shared storage",creation:"Creation Time",notYetCreated:"Not yet created",numEntries:"Number of Entries",entropyBudget:"Entropy Budget for Fenced Frames",budgetExplanation:"Remaining data leakage allowed within a 24-hour period for this origin in bits of entropy",resetBudget:"Reset Budget"},yt=t.i18n.registerUIStrings("panels/application/components/SharedStorageMetadataView.ts",kt),Tt=t.i18n.getLocalizedString.bind(void 0,yt);class St extends ft{static litTagName=m.literal`devtools-shared-storage-metadata-view`;#et;#tt=null;#at=0;#rt=0;constructor(e,t){super(),this.#et=e,this.classList.add("overflow-auto"),this.setStorageKey(t)}async#ot(){await this.#et.resetBudget(),await this.render()}connectedCallback(){this.getShadow().adoptedStyleSheets=[mt]}getTitle(){return Tt(kt.sharedStorage)}async renderReportContent(){const e=await this.#et.getMetadata();return this.#tt=e?.creationTime??null,this.#at=e?.length??0,this.#rt=e?.remainingBudget??0,m.html`
      ${await super.renderReportContent()}
      ${this.key(Tt(kt.creation))}
      ${this.value(this.#it())}
      ${this.key(Tt(kt.numEntries))}
      ${this.value(String(this.#at))}
      ${this.key(m.html`${Tt(kt.entropyBudget)}<${s.Icon.Icon.litTagName} name="info" title=${Tt(kt.budgetExplanation)}></${s.Icon.Icon.litTagName}>`)}
      ${this.value(m.html`${this.#rt}${this.#nt()}`)}`}#it(){if(!this.#tt)return m.html`${Tt(kt.notYetCreated)}`;const e=new Date(1e3*this.#tt);return m.html`${e.toLocaleString()}`}#nt(){return m.html`
      <${r.Button.Button.litTagName} .iconName=${"undo"}
                                           .jslogContext=${"reset-entropy-budget"}
                                           .size=${"SMALL"}
                                           .title=${Tt(kt.resetBudget)}
                                           .variant=${"round"}
                                           @click=${this.#ot.bind(this)}></${r.Button.Button.litTagName}>
    `}}n.CustomElements.defineComponent("devtools-shared-storage-metadata-view",St);var Rt=Object.freeze({__proto__:null,SharedStorageMetadataView:St});const $t=new CSSStyleSheet;$t.replaceSync(":host{padding:20px}.heading{font-size:15px}devtools-data-grid-controller{border:1px solid var(--sys-color-divider);margin-top:20px;& devtools-button{width:14px;height:14px}}devtools-icon{width:14px;height:14px}.no-tt-message{margin-top:20px}\n/*# sourceURL=trustTokensView.css */\n");const xt={issuer:"Issuer",storedTokenCount:"Stored token count",allStoredTrustTokensAvailableIn:"All stored private state tokens available in this browser instance.",noTrustTokensStored:"No private state tokens are currently stored.",deleteTrustTokens:"Delete all stored private state tokens issued by {PH1}.",trustTokens:"Private state tokens"},Ct=t.i18n.registerUIStrings("panels/application/components/TrustTokensView.ts",xt),Nt=t.i18n.getLocalizedString.bind(void 0,Ct),It=c.RenderCoordinator.RenderCoordinator.instance();class Pt extends l.LegacyWrapper.WrappableComponent{static litTagName=m.literal`devtools-trust-tokens-storage-view`;#e=this.attachShadow({mode:"open"});#st(e){const t=a.TargetManager.TargetManager.instance().primaryPageTarget();t?.storageAgent().invoke_clearTrustTokens({issuerOrigin:e})}connectedCallback(){this.wrapper?.contentElement.classList.add("vbox"),this.#e.adoptedStyleSheets=[$t],this.render()}async render(){const e=a.TargetManager.TargetManager.instance().primaryPageTarget();if(!e)return;const{tokens:t}=await e.storageAgent().invoke_getTrustTokens();await It.write("Render TrustTokensView",(()=>{m.render(m.html`
        <div>
          <span class="heading">${Nt(xt.trustTokens)}</span>
          <${s.Icon.Icon.litTagName} name="info" title=${Nt(xt.allStoredTrustTokensAvailableIn)}></${s.Icon.Icon.litTagName}>
          ${this.#De(t)}
        </div>
      `,this.#e,{host:this}),this.isConnected&&setTimeout((()=>this.render()),1e3)}))}#De(e){if(0===e.length)return m.html`<div class="no-tt-message">${Nt(xt.noTrustTokensStored)}</div>`;const t={columns:[{id:"issuer",title:Nt(xt.issuer),widthWeighting:10,hideable:!1,visible:!0,sortable:!0},{id:"count",title:Nt(xt.storedTokenCount),widthWeighting:5,hideable:!1,visible:!0,sortable:!0},{id:"delete-button",title:"",widthWeighting:1,hideable:!1,visible:!0,sortable:!1}],rows:this.#lt(e),initialSort:{columnId:"issuer",direction:"ASC"}};return m.html`
      <${p.DataGridController.DataGridController.litTagName} .data=${t}></${p.DataGridController.DataGridController.litTagName}>
    `}#lt(e){return e.filter((e=>e.count>0)).map((e=>({cells:[{columnId:"delete-button",value:Dt(e.issuerOrigin),renderer:this.#ct.bind(this)},{columnId:"issuer",value:Dt(e.issuerOrigin)},{columnId:"count",value:e.count}]})))}#ct(e){return m.html`
      <${r.Button.Button.litTagName} .iconName=${"bin"}
                                           .jslogContext=${"delete-all"}
                                           .size=${"SMALL"}
                                           .title=${Nt(xt.deleteTrustTokens,{PH1:e})}
                                           .variant=${"round"}
                                           @click=${this.#st.bind(this,e)}></${r.Button.Button.litTagName}>
    `}}function Dt(e){return e.replace(/\/$/,"")}n.CustomElements.defineComponent("devtools-trust-tokens-storage-view",Pt);var Mt=Object.freeze({__proto__:null,i18nString:Nt,TrustTokensView:Pt});export{E as BackForwardCacheView,U as BounceTrackingMitigationsView,X as EndpointsGrid,Ve as FrameDetailsView,Oe as InterestGroupAccessGrid,ue as OriginTrialTreeView,je as ProtocolHandlersView,tt as ReportsGrid,nt as ServiceWorkerRouterView,ut as SharedStorageAccessGrid,Rt as SharedStorageMetadataView,Ne as StackTrace,vt as StorageMetadataView,Mt as TrustTokensView};
