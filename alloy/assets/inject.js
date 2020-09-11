// Ajax Rewriting

let apData = document.getElementById('alloyData');
let urlData = apData.getAttribute('data-alloyURL');


function rewriteURL(url, encoding) { 
   var websiteURL
   if (encoding == 'base64') {
      websiteURL = btoa(url.split('/').splice(0, 3).join('/'))
   } else {
      websiteURL = url.split('/').splice(0, 3).join('/')
   }
   const path = '/' + url.split('/').splice(3).join('/')
   var rewritten
   if (path == '/') {
   rewritten =  '/fetch/' + websiteURL
   }  else {
      rewritten = `/fetch/${websiteURL}${path}`
   }
   return rewritten
}
let ajaxRewrite = window.XMLHttpRequest.prototype.open;window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
 if (url.startsWith(`${window.location.protocol}//${window.location.hostname}`) && !url.startsWith(`${window.location.protocol}//${window.location.hostname}/fetch/`)) {
      url = `/fetch/${urlData}/` + url.split('/').splice(3).join('/')
 } else if (url.startsWith('http')) {
   const hostname = url.split('/').slice(0, 3).join('/')
   const path = url.split('/').slice(3).join('/')
   const encodedHost = btoa(hostname)
   const fullURL = encodedHost + '/' + path
   url = '/fetch/' + fullURL
   } else if (url.startsWith('//')) {
         const encodedURL = btoa('http:'  + url)
         url = '/alloy/?url=' + encodedURL
   } else if (url.startsWith('/')) {
         if (url.startsWith('/fetch')) {
            url = url
         } else if (url.startsWith('/alloy')) {
            url = url
         } else {
         let apData = document.getElementById('alloyData');
         let urlData = apData.getAttribute('data-alloyURL');
         url = '/fetch/' + urlData + url
         }
   }


    return ajaxRewrite.apply(this, arguments);
   }

   let windowFetchRewrite = window.fetch;window.fetch = function(url) {
      if (url.startsWith(`https://${window.location.hostname}`)) {
         url = url
   } else if (url.startsWith('http')) {
     const hostname = url.split('/').slice(0, 3).join('/')
     const path = url.split('/').slice(3).join('/')
     const encodedHost = btoa(hostname)
     const fullURL = encodedHost + '/' + path
     url = '/fetch/' + fullURL
     } else if (url.startsWith('//')) {
           const encodedURL = btoa('http:'  + url)
           url = '/alloy/?url=' + encodedURL
     } else if (url.startsWith('/')) {
           if (url.startsWith('/fetch')) {
              url = url
           } else if (url.startsWith('/alloy')) {
              url = url
           } else {
           let apData = document.getElementById('alloyData');
           let urlData = apData.getAttribute('data-alloyURL');
           url = '/fetch/' + urlData + url
           }
     }
         return windowFetchRewrite.apply(this, arguments);
        }
     


   //Create Element rewriting
   var original = document.createElement;
   document.createElement = function (tag) {
     var element = original.call(document, tag);
     if (tag.toLowerCase() === 'script') {
       Object.defineProperty(element.__proto__, 'src', {
         set: function(newValue) {
            if (newValue.startsWith('/fetch/')) {
               element.setAttribute('src', newValue)
           } else if (newValue.startsWith('/alloy/')) {
              element.setAttribute('src', newValue)
           } else if (newValue.startsWith(`https://${window.location.hostname}`)) {
                  element.setAttribute('src', newValue)
              } else if (newValue.startsWith('//')) {
              const encodedURL = btoa('http:' + newValue)
              element.setAttribute('src', '/alloy/?url=' + encodedURL)
             } else if (newValue.startsWith('https://')) {
               const encodedURL = btoa(newValue)
               element.setAttribute('src', '/alloy/?url=' + encodedURL)
            } else if (newValue.startsWith('http://')) {
               const encodedURL = btoa(newValue)
               element.setAttribute('src', '/alloy/?url=' + encodedURL)
              } else if (newValue.startsWith('/')) {
              element.setAttribute('src', '/fetch/' + urlData   + newValue)
          } else {
              element.setAttribute('src', newValue)
          }
      }
       }); 
     } else if (tag.toLowerCase() === 'iframe') {
      Object.defineProperty(element.__proto__, 'src', {
        set: function(newValue) {
         if (newValue.startsWith('/fetch/')) {
            element.setAttribute('src', newValue)
        } else if (newValue.startsWith('/alloy/')) {
           element.setAttribute('src', newValue)
        } else if (newValue.startsWith(`https://${window.location.hostname}`)) {
         element.setAttribute('src', newValue)
     } else if (newValue.startsWith('//')) {
             const encodedURL = btoa('http:' + newValue)
             element.setAttribute('src', '/alloy/?url=' + encodedURL)
            } else if (newValue.startsWith('https://')) {
              const encodedURL = btoa(newValue)
              element.setAttribute('src', '/alloy/?url=' + encodedURL)
           } else if (newValue.startsWith('http://')) {
              const encodedURL = btoa(newValue)
              element.setAttribute('src', '/alloy/?url=' + encodedURL)
             } else if (newValue.startsWith('/')) {
          element.setAttribute('src', '/fetch/' + urlData   + newValue)
                
         } else {
            element.setAttribute('src', newValue)
        }
     }
      }); 
    }
      else if (tag.toLowerCase() === 'link') {
      Object.defineProperty(element.__proto__, 'href', {
        set: function(newValue) {
          if (newValue.startsWith('/fetch/')) {
              element.setAttribute('href', newValue)
          } else if (newValue.startsWith('/alloy/')) {
             element.setAttribute('href', newValue)
          } else if (newValue.startsWith(`https://${window.location.hostname}`)) {
            element.setAttribute('href', newValue)
         }  else if (newValue.startsWith('//')) {
             const encodedURL = btoa('http:' + newValue)
             element.setAttribute('href', '/alloy/?url=' + encodedURL)
            } else if (newValue.startsWith('https://')) {
              const encodedURL = btoa(newValue)
              element.setAttribute('href', '/alloy/?url=' + encodedURL)
           } else if (newValue.startsWith('http://')) {
              const encodedURL = btoa(newValue)
              element.setAttribute('href', '/alloy/?url=' + encodedURL)
             } else if (newValue.startsWith('/')) {
          element.setAttribute('href', '/fetch/' + urlData   + newValue)
                
         } else {
            element.setAttribute('href', newValue)
        }
     }
      }); 
    } 
     return element;
   }


   let setAttributeRewrite = window.Element.prototype.setAttribute;window.Element.prototype.setAttribute = function(name, value) {
      switch(name) {
         case 'src':
            if (value.startsWith('/fetch/')) {
               value = value
            } else if (value.startsWith('/alloy/')) {
                  value = value
            } else if (value.startsWith('//')) {
              value = rewriteURL('http:' + value, 'base64')
           } else if (value.startsWith('/')) {
            value = rewriteURL(urlData + value)
            break;
         } else if (value.startsWith('https://') || value.startsWith('http://')) {
            value = rewriteURL(value, 'base64')
         } else {
            value = value
         }
           break;
         case 'href':
            if (value.startsWith('/fetch/')) {
               value = value
            } else if (value.startsWith('//')) {
              value = rewriteURL('http:' + value, 'base64')
           } else if (value.startsWith('/')) {
            value = rewriteURL(urlData + value)
            break;
         } else if (value.startsWith('https://') || value.startsWith('http://')) {
            value = rewriteURL(value, 'base64')
         } else {
            value = value
         }
           break;
       }
     
     
         return setAttributeRewrite.apply(this, arguments);
        }

         var previousState = window.history.state;
         setInterval(function() {
                if (!window.location.pathname.startsWith(`/fetch/${urlData}/`)) {
                 history.replaceState('', '', `/fetch/${urlData}/${window.location.href.split('/').splice(3).join('/')}`);
             }
         }, 0.1);