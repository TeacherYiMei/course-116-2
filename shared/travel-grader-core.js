/* 免費旅拍技術檢測的純函式：刻意不判斷故事、音樂美感或真正的字幕／轉場品質。 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.TRAVEL_GRADER=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  function grade(data){
    const duration=Number(data.duration),width=Number(data.width),height=Number(data.height);
    const size=Number(data.size),motion=data.motion==null?NaN:Number(data.motion),goodLight=data.goodLight==null?NaN:Number(data.goodLight);
    if(!Number.isFinite(duration)||duration<=0||!Number.isFinite(width)||width<=0||!Number.isFinite(height)||height<=0||!Number.isFinite(size)||size<=0)throw Error('影片基本資料不完整');
    const target=Number.isFinite(Number(data.targetDuration))&&Number(data.targetDuration)>0?Number(data.targetDuration):90;
    const delta=Math.abs(duration-target),ratio=width/height;
    const durationPts=delta<=3?30:delta<=8?26:delta<=15?18:delta<=30?8:0;
    const resolutionPts=width>=1920&&height>=1080?15:width>=1280&&height>=720?12:width>=960&&height>=540?8:3;
    const ratioDelta=Math.min(Math.abs(ratio-16/9),Math.abs(ratio-9/16));
    const ratioPts=ratioDelta<=.04?10:ratioDelta<=.12?7:2;
    const motionPts=!Number.isFinite(motion)?0:motion>18?20:motion>9?14:motion>4?8:2;
    const lightPts=!Number.isFinite(goodLight)?0:goodLight>=.85?10:goodLight>=.6?7:3;
    const bitrate=size*8/duration/1e6;
    const bitratePts=bitrate>=.4&&bitrate<=12?5:2;
    const categories=[
      {key:'duration',title:'⏱️ 影片長度',score:durationPts,max:30,hint:`${duration.toFixed(1)} 秒（目標 ${target} 秒）`},
      {key:'resolution',title:'📺 畫面清晰度',score:resolutionPts,max:15,hint:`${width} × ${height}`},
      {key:'ratio',title:'📐 畫面比例',score:ratioPts,max:10,hint:`寬高比 ${ratio.toFixed(2)}`},
      {key:'playable',title:'✅ 影片可解碼',score:10,max:10,hint:'瀏覽器可以開啟並抽樣畫面'},
      {key:'motion',title:'🎞️ 畫面變化',score:motionPts,max:20,hint:Number.isFinite(motion)?'抽樣畫面差異指標 '+motion.toFixed(1):'此裝置無法完成影格抽樣'},
      {key:'light',title:'☀️ 畫面曝光',score:lightPts,max:10,hint:Number.isFinite(goodLight)?'合理亮度抽樣比例 '+Math.round(goodLight*100)+'%':'此裝置無法完成影格抽樣'},
      {key:'bitrate',title:'📦 檔案效率',score:bitratePts,max:5,hint:`約 ${bitrate.toFixed(1)} Mbps`}
    ];
    const score=categories.reduce((n,c)=>n+c.score,0);
    return {score,passed:score>=85,categories,measurements:{duration,width,height,size,motion:Number.isFinite(motion)?clamp(motion,0,255):null,goodLight:Number.isFinite(goodLight)?clamp(goodLight,0,1):null}};
  }
  return {grade};
});
