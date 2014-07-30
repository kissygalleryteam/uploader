/**
 * @fileoverview
 * @author
 * @module uploader
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *
     * @class Uploader
     * @constructor
     * @extends Base
     */
    function Uploader(comConfig) {
        var self = this;
        //调用父类构造函数
        Uploader.superclass.constructor.call(self, comConfig);
    }
    S.extend(Uploader, Base, /** @lends Uploader.prototype*/{

    }, {ATTRS : /** @lends Uploader*/{

    }});
    return Uploader;
}, {requires:['node', 'base']});



