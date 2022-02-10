(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'vs/editor/editor.main'], factory);
    } else {
        factory(jQuery, monaco);
    }
} (function ($, monaco) {

    var obj = {       
        call_canvas_change:true,
        timeout_canvas_change:false,
        editor_height:$(window).height(),
        editor_action:function (editor,action){
            //console.log(action);
            var actons = editor.getActions();
            for (var act in actons){
                var editor_action = actons[act];                        
                //if (act == 38)                            
                //console.log(editor_action);
                
                if (editor_action.label == action){
                    editor_action.run();
                }
            }
        },
        parse_svg_string:function(data){
            var tmp_data=data.split('<![CDATA[');
            var ret = {
                cdata:false,
                svg:data
            };
            if (tmp_data[1]){
                ret.svg = tmp_data[0];                
                tmp_data = tmp_data[1].split(']]>');
                ret.cdata =tmp_data[0];
                ret.svg += tmp_data[1];                
                if (ret.cdata.substr(0,1)=='\r' || ret.cdata.substr(0,1)=='\n'){                    
                    ret.cdata = ret.cdata.substr(2,ret.cdata.length);
                }
            }
            return ret;            
        },
        on_canvas_change:function(){
            if(!obj.call_canvas_change) return false;        
            if(obj.timeout_canvas_change) clearTimeout(obj.timeout_canvas_change);
            obj.timeout_canvas_change = setTimeout(function(){
                if(!obj.call_canvas_change) return false;        
                obj.call_svg_editor_change = false;
                var svg_data = obj.parse_svg_string(methodDraw.canvas.getSvgString());                
                obj.editor_svg.setValue(svg_data.svg);
                obj.highlight_method_draw_selection();
                if(svg_data.cdata){
                    methodDraw.loadFromString(svg_data.svg);
                    methodDraw.updateCanvas();
                    obj.editor_code.setValue(svg_data.cdata);
                    obj.editor_action(obj.editor_code,'Format Document');
                }
                obj.call_svg_editor_change = true;  
                
            },100)            
            return obj;
        },
        call_svg_editor_change:true,
        timeout_svg_editor_change:false,
        on_svg_editor_change:function(){
            if(!obj.call_svg_editor_change) return false;
            if(obj.timeout_svg_editor_change) clearTimeout(obj.timeout_svg_editor_change);
            var cur_selection = obj.method_draw_selection;
            obj.timeout_svg_editor_change = setTimeout(function(){
                if(!obj.call_svg_editor_change) return false;
                obj.call_canvas_change = false;
                methodDraw.loadFromString(obj.editor_svg.getValue());
                methodDraw.updateCanvas();
                setTimeout(function(){                   
                    //methodDraw.canvas.runExtensions("selectedChanged", cur_selection);
                },100);
                
                obj.call_canvas_change = true;
            },100);
            
            return obj;
        },
        cached_patens:{},
        find_match:function(pat_id,pattern,my_text){            
            if(!obj.cached_patens[pat_id]) obj.cached_patens[pat_id] = new RegExp(pattern, 'mi');
            let re_match = my_text.match(obj.cached_patens[pat_id]);
            if(re_match){
                re_match = re_match[0];
                let ret =  obj.editor_svg.getModel().findMatches(re_match);
                if (ret.length>0) return ret[0];
            }
            return false;
        },
        method_draw_selection:false,        
        delta_decorations:[],
        timeout_highlight:false,
        highlight_method_draw_selection:function(){             
            if(obj.timeout_highlight) clearTimeout(obj.timeout_highlight);
            obj.timeout_highlight = setTimeout(function(){
                obj.delta_decorations = obj.editor_svg.deltaDecorations(obj.delta_decorations, [{ range: new monaco.Range(1,1,1,1), options : { } }]);
                if (obj.method_draw_selection){
                    var delta_decorations = [];
                    var monaco_text = obj.editor_svg.getValue();
                    for (var el of obj.method_draw_selection.elements){                                      
                        var pattern_2 = '(<\/?\\w*(?:(?:(?:\\s*(?:".*"|\'.*\'|[^\'"<\\s]?))?)+\\s*|\\s*)\\sid\\s*=\\s*["|\']?' + el.id +'["|\']?(?:(?:(?:\\s*(?:".*"|\'.*\'|[^\'">\\s]?))?)+\\s*|\\s*)\\w*\/?>)';                        
                        var pattern_1 = '(<g\\w?(?:(?:(?:\\s*(?:".*"|\'.*\'|[^\'"<\\s]?))?)+\\s*|\\s*)\\sid\\s*=\\s*["|\']?' + el.id +'["|\']?(?:(?:(?:\\s*(?:".*"|\'.*\'|[^\'">\\s]?))?)+\\s*|\\s*)\\w*>)[\\S\\s]+?<\/g>';
                        var el_string = methodDraw.canvas.svgToString(el);
                        var match = obj.editor_svg.getModel().findMatches(el_string);                        
                        match =(match.length>0)?match[0]:false;                        
                        //match = false;
                        if (!match) match = obj.find_match('p1_'+el.id,pattern_1,monaco_text);
                        if (!match) match = obj.find_match('p2_'+el.id,pattern_2,monaco_text);
                        
                        if (match) {                             
                            var position =match.range;
                            delta_decorations.push({range: new monaco.Range(position.startLineNumber,position.startColumn,position.endLineNumber,position.endColumn), options: { inlineClassName: 'selected_element' }});                                                                     
                            if (position){
                                //obj.editor_svg.setPosition({column: position.startColumn, lineNumber: position.startLineNumber});
                                obj.editor_svg.revealLineInCenter(position.startLineNumber);
                            }
                        }                        
                    }    
                    obj.delta_decorations = obj.editor_svg.deltaDecorations([],delta_decorations);           
                }
            },100);
            return obj;
        },
        selection_changed:false,
        on_select:function(data){
            if (!obj.delta_slob) obj.delta_slob = obj.editor_svg.deltaDecorations([],[]);            
            if (data) obj.method_draw_selection = data;    
            if (obj.method_draw_selection && obj.method_draw_selection.selectedElement){ 
                var el_exists = false;               
                if (obj.editor_svg.getModel().findMatches('id="'+obj.method_draw_selection.selectedElement.id+'"').length > 0) el_exists=true;
                if (obj.editor_svg.getModel().findMatches("id='"+obj.method_draw_selection.selectedElement.id+"'").length > 0) el_exists=true;
                if (!el_exists) obj.on_canvas_change();
                else obj.selection_changed = true;
            }else{
                obj.selection_changed = true;            
            }
            return obj;
        },
        on_open:function(data){
            obj.call_svg_editor_change = obj.call_canvas_change = false;                        
            setTimeout(function(){
                var svg_data = obj.parse_svg_string(data);            
                obj.editor_svg.setValue(svg_data.svg);
                obj.editor_code.setValue(svg_data.cdata);
                obj.editor_action(obj.editor_code,'Format Document');
                obj.editor_action(obj.editor_svg,'Format Document');
                obj.call_svg_editor_change = obj.call_canvas_change = true;
            },100);            
            return obj;
        },
        mouse_down:false,
        init_dom_mouse(){
            document.addEventListener('mousedown', e => {
                obj.mouse_down = true;
            });
            document.addEventListener('mouseup', e => {
                obj.mouse_down = false;
                if (obj.selection_changed){
                    obj.highlight_method_draw_selection();
                    obj.selection_changed = false;
                }                
            });
            return obj;
        },
        editors_layout:function(){
            if (typeof obj.editor_svg !== 'undefined') {
                obj.editor_svg.layout();
            }
            if (typeof obj.editor_code !== 'undefined') {
                obj.editor_code.layout();
            }                            
            $('#svg_editor').css('width','100%');
        },        
        compiled:false,
        build:function(){            
            var temp_svg = obj.editor_svg.getValue();
            obj.compiled = [                  
                temp_svg.substr(0,temp_svg.length-6),
                '<script type="text/javascript"><![CDATA[',
                    obj.editor_code.getValue(),
                ']]></script>',                
                '</svg>'
            ].join('\n');
            return obj;
        },        
        init_method_draw:function(){            
            window.methodDraw.onChange = obj.on_canvas_change;
            window.methodDraw.onOpen = obj.on_open;
            window.methodDraw.onSelect = obj.on_select;            
            return obj;         
        },
        init_monaco:function(){
            obj.editor_svg_el = $('#editor_svg');
            obj.editor_code_el = $('#editor_code');
            if (obj.editor_svg_el.length > 0) {
                    obj.editor_svg = monaco.editor.create(obj.editor_svg_el.get(0), {
                    value: [].join('\n'),
                    theme: 'vs-dark',
                    scrollbar: {
                        useShadows: false,
                        verticalHasArrows: true,
                        horizontalHasArrows: true,
                        verticalScrollbarSize: 17,
                        horizontalScrollbarSize: 17,
                        arrowSize: 30
                    },
                    //wordWrap: 'wordWrapColumn',                    
                    //wordWrapMinified: true,	
                    //wrappingIndent: "indent",                    
                    language: 'html',
                    scrollBeyondLastColumn: 0,
                    scrollBeyondLastLine: true,
                    //showFoldingControls: 'always',
                    //renderWhitespace: 'all',
                    //renderControlCharacters: true
                });
                obj.editor_svg.onDidChangeModelContent(obj.on_svg_editor_change);
            }
            if (obj.editor_code_el.length > 0) {
                    obj.editor_code = monaco.editor.create(obj.editor_code_el.get(0), {
                    value: [
                        '// DEMO code - Draw a Circle, Line or Rectangle and press Run',
                        'var svg1 = document.getElementById("svg_1");',
                        'if(svg1){',
                        '    var possible_props = ["x1","x","cx"];',
                        '    var prop = false;',
                        '    for (var n of possible_props){',
                        '        if (svg1[n]){',
                        '            prop = n;',
                        '            break;',
                        '        }',
                        '    }',
                        '    var val = parseFloat(svg1.getAttribute(prop));',
                        '    var end = val + 100;',
                        '    var timer = setInterval(function(){',
                        '        val+=0.5;',
                        '        if (val >= end){',
                        '            clearInterval(timer);',
                        '            return true;',
                        '        }',
                        '        svg1.setAttribute(prop,val);',
                        '    },10);',
                        '}'
                    ].join('\n'),
                    theme: 'vs-dark',
                    scrollbar: {
                        useShadows: false,
                        verticalHasArrows: true,
                        horizontalHasArrows: true,
                        verticalScrollbarSize: 17,
                        horizontalScrollbarSize: 17,
                        arrowSize: 30
                    },
                    language: 'javascript',
                    scrollBeyondLastColumn: 0,
                    scrollBeyondLastLine: true,
                    //showFoldingControls: 'always',
                    //renderWhitespace: 'all',
                    //renderControlCharacters: true
                });                
                obj.show_tab('editor_code')
            }
            $(window).on('resize', function(){
                obj.editors_layout();
            });            
            return obj;
        },
        init_tab_bar:function(){
            $('#svg_editor').resizable({
                handles: 's',
                stop: function(event, ui) {
                    obj.editor_height = $(this).height();
                    obj.editors_layout();                  
                }
            });            
            return obj;
        },
        show_preview:function(){            
            obj.build();
            $('#svg_editor').animate({'height':'0px'},300,function(){
                $('#run_code').html('<iframe id="preview_frame" style="width:100%;height:100%;border:none;" />');
                var iframe = document.getElementById('preview_frame');
                iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);
                iframe.document.open();
                iframe.document.write('<center>'+obj.compiled+'</center>');
                iframe.document.write('<br><div style="color:#cccccc;"><hr style="border: 1px solid #cccccc;"><xmp readonly="readonly" style="color:#cccccc;width:100%;height:100%;border:none;background:transparent;outline: none;resize:none;" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">'+obj.compiled+'</xmp>');
                iframe.document.close();  
                obj.editors_layout();  
            });            
            return obj;
        },
        show_tab:function(tab){
            $('#run_code').html('');
            $('.vs_button').removeClass('active');  
            $(".vs_button[data-tab='" + tab + "']").addClass('active');
            $('.vs_editor').hide();
            $('#'+tab).show();            
            if(tab ==='run_code'){
                obj.show_preview();
            }else{
                if(obj.editor_state==='normal')obj.restore_editor();                
            }
            obj.editors_layout();
            return obj;
        },
        editor_state:'normal',
        maximize_editor:function(){
            $('#svg_editor').stop().animate({'height':0+'px'},{
                step:function(){
                    obj.editors_layout();
                },
                complete:function(){
                    obj.editors_layout();
                    obj.editor_state= 'maximized';
                },
            });
        },
        restore_editor:function(){
            $('#svg_editor').stop().animate({'height':obj.editor_height+'px'},{
                step:function(){
                    obj.editors_layout();
                },
                complete:function(){
                    obj.editors_layout();
                    obj.editor_state= 'normal';
                },
            });
        },        
        toggle_editor:function(){
            var h = $('#svg_editor').height();
            if (h!==0){
                obj.maximize_editor();
            }else{
                obj.restore_editor();
            }    
        },
        init_tabs:function() {
            $('.vs_button').on('click',function(){
                obj.clicked = 1;
                var tab = $(this).data('tab');
                setTimeout(function(){                    
                    if (obj.clicked === 1){
                         obj.show_tab(tab);
                    }
                },100)
            }).on('dblclick',function(){
                obj.clicked += 1;
                var tab = $(this).data('tab');
                if (tab==='run_code'){
                    obj.show_preview();
                }else{
                    obj.toggle_editor();
                }
                           
            });
            return obj;
        },
        init:function(){
            window.obj = obj;//Temporary used for debugging, remove this line in production            
            obj.init_monaco()
            .init_tabs()
            .init_tab_bar()
            .init_method_draw()
            .on_canvas_change()
            .init_dom_mouse()
            .show_tab('editor_svg');            
            $('#loader').slideUp(500,function(){                
                $('#main_container').slideDown(350,function(){
                    obj.editor_height =400;
                    obj.restore_editor();                       
                });                     
            });
            
        }
    }

    return {
        init:obj.init,
        layout:obj.editors_layout,
        compiled:obj.compiled
    }
}));