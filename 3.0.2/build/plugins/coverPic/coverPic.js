/*
combined files : 

kg/uploader/3.0.2/plugins/coverPic/coverPic

*/
/**
 * @fileoverview �Ӷ���ͼƬ��ѡ��һ����Ϊ����ͼƬ������ͼ��
 * @author ��Ӣ�����ӣ�<daxingplay@gmail.com>������<jianping.xwh@taobao.com>

 */
KISSY.add('kg/uploader/3.0.2/plugins/coverPic/coverPic',function(S, Node,Base){

    var $ = Node.all;

    /**
     * �Ӷ���ͼƬ��ѡ��һ����Ϊ����ͼƬ������ͼ
     * @param {NodeList | String} $input Ŀ��Ԫ��
     * @param {Uploader} uploader uploader��ʵ��
     * @constructor
     */
    function CoverPic($input,uploader){

    }
    S.extend(CoverPic, Base, /** @lends CoverPic.prototype*/{
        /**
         * ������ʼ��
         * @private
         */
        pluginInitializer : function(uploader) {
            if(!uploader) return false;
            var self = this;

        }
    },{
        ATTRS:/** @lends CoverPic.prototype*/{
            /**
             * ��������
             * @type String
             * @default urlsInput
             */
            pluginId:{
                value:'coverPic'
            }
        }
    });

    return CoverPic;

}, {
    requires: [ 'node','base' ]
});
