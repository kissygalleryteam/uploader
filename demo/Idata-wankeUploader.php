<?php
    header("Content-type:text/javascript");
    
    $str = iconv('gbk', 'utf-8', '佳能EOS 600D照相机成像佳能EOS 600D照相机成像佳能EOS 600D照相机成像佳能EOS 600D照相机成像');
    
    $prizeArr = Array('1','5','10','50','1111');
    
    $randomPrize = floor(rand(0, 4));
    
    $random = floor(rand(0, 1));
    
    $prizeStatus = $random == 0 ? true : false;
    
    $json = Array(
        'status' => 1,
        'type' => $_POST['type'],
        'name' => 'png_200x200.jpg',
        'url' => '//img.f2e.taobao.net/img.png_200x200.jpg',
        'username' => 'anandi',
        'userAvatar' => '//img.f2e.taobao.net/img.png_24x24.jpg',
        'userLink' => '//img.f2e.taobao.net/img.png_200x200.jpg',
        'voteUrl' => '//lingwu.etao.com/wanke/components/_thing_goods_caption_/Idata-vote.php'
    );

    $jsonErr = Array(
        'status' => 0,
        'msg' => '亲，上传失败啦'
    );
    
    $callback=$_GET['callback'];
    // echo "$callback(".json_encode($json).")";
    echo json_encode($json);
?>