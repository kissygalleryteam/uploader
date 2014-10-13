KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('uploader', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','kg/uploader/2.0.2/']});