(function(S){
    if(S.Config.debug) return false;
    var preMod = "gallery/uploader/1.4/";
    var plugins = ['auth','filedrop','imageZoom','preview','proBars','tagConfig','urlsInput','ajbridge'];
    var mods = S.map(plugins,function(plu){
        return preMod+"plugins/"+plu+'/'+plu;
    })
    var otherMods = ['gallery/flash/1.0/index',preMod+'plugins/proBars/progressBar',preMod+'plugins/ajbridge/uploader',preMod+'theme'];
    S.each(otherMods,function(mod){
        mods.push(mod);
    })

    S.config({
        modules:{
            'gallery/uploader/1.4/index':{requires:mods}
        }
    })
})(KISSY);