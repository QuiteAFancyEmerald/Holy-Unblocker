require.config({
    paths: {
        app_main:'components/app/main',
        jquery: 'components/method-draw/lib/jquery',
        jquery_migrate: 'components/method-draw/lib/jquery-migrate-1.4.1',
        jquery_ui: 'components/method-draw/lib/jquery-ui/jquery-ui-1.8.17.min',
        jquery_jgraduate: 'components/method-draw/lib/jgraduate/jquery.jgraduate',
        jquery_draginput: 'components/method-draw/lib/jquery-draginput',
        jquery_contextmenu:'components/method-draw/lib/contextmenu/jquery.contextMenu',
        jquery_hotkeys: 'components/method-draw/lib/js-hotkeys/jquery.hotkeys.min',
        jquery_mousewheel: 'components/method-draw/lib/mousewheel',
        vs: './components/vs',
        method_draw: 'components/method-draw/src/method-draw',
        touch: 'components/method-draw/lib/touch',
        svgutils: 'components/method-draw/src/svgutils',
        browser: 'components/method-draw/src/browser',
        svgicons: 'components/method-draw/icons/jquery.svgicons',
        svgcanvas: 'components/method-draw/src/svgcanvas',
        svgdraw: 'components/method-draw/src/draw',
        svgtransform: 'components/method-draw/src/svgtransformlist',
        svgmath: 'components/method-draw/src/math',
        svgunits: 'components/method-draw/src/units',
        svgsanitize: 'components/method-draw/src/sanitize',
        svghistory: 'components/method-draw/src/history',
        svgselect: 'components/method-draw/src/select',
        svgpath: 'components/method-draw/src/path',
        svgfilesaver:'components/method-draw/lib/filesaver',
        pathseg: 'components/method-draw/lib/pathseg',
        ext_grid:'components/method-draw/extensions/ext-grid',
        ext_shapes: 'components/method-draw/extensions/ext-shapes',
        dialog: 'components/method-draw/src/dialog',
        contextmenu: 'components/method-draw/lib/contextmenu',
        taphold:'components/method-draw/lib/taphold',
        jpicker: 'components/method-draw/lib/jgraduate/jpicker.min',
        ext_eyedropper: 'components/method-draw/extensions/ext-eyedropper',
        requestanimationframe:'components/method-draw/lib/requestanimationframe'
    },
    shim: {
        jquery_ui: {
            deps: ['jquery_migrate']
        },
        jquery_migrate: {
            deps: ['jquery']
        },
        jquery_draginput: {
            deps: ['jquery']
        },
        jquery_jgraduate: {
            deps: ['jquery']
        },
        jquery_hotkeys: {
            deps: ['jquery']
        },
        jquery_mousewheel: {
            deps: ['jquery']
        },
        jquery_contextmenu: {
            deps: ['jquery']
        },
        method_draw: {
            exports: 'methodDraw',
            deps: [
                'jquery_ui',
                'jquery_jgraduate',
                'jquery_draginput',
                'jquery_contextmenu',
                'jquery_hotkeys',
                'jquery_mousewheel',
                'touch',
                'svgutils',
                'svgicons',
                'svgcanvas',
                'dialog',
                'taphold',
                'requestanimationframe'
            ]
        },  
        ext_eyedropper:{
            deps: ['method_draw']
        },
        ext_shapes:{
            deps: ['method_draw']
        },
        ext_grid: {
            deps: ['method_draw']
        },
        taphold: {
            deps: ['jquery']
        },
        requestanimationframe: {
            deps: ['jquery']
        },
        dialog: {
            deps: ['jquery_ui']
        },
        contextmenu: {
            deps: ['method_draw']
        },
        svgicons: {
            deps: ['jquery']
        },
        svgcanvas: {
            deps: ['pathseg', 'svgdraw', 'svgtransform', 'svgmath', 'svgsanitize', 'svghistory', 'svgselect', 'svgpath', 'svgfilesaver']
        },
        svgunits: {
            deps: ['jquery', 'ext_shapes', 'ext_eyedropper', 'contextmenu']
        },
        svgsanitize: {
            deps: ['jquery']
        },
        svgutils: {
            deps: ['browser']
        }
    }
});

require([
    'jquery',
    'vs/editor/editor.main',
    'app_main',
    'svgunits'
], function($, monaco, app_main) {    
    $(function() {
        methodDraw.init();
        app_main.init();
    });
});