package br.com.beardedbr.forjadeaco;

import android.app.Activity;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {
 private WebView game;
 private MediaPlayer music;
 private boolean soundEnabled=true;
 private int lastTrack=-1;
 private final int[] tracks={R.raw.forja_industrial,R.raw.forja_rock,R.raw.forja_eletronica};
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  game=new WebView(this);
  WebSettings s=game.getSettings();
  s.setJavaScriptEnabled(true);
  s.setDomStorageEnabled(true);
  s.setAllowFileAccess(true);
  s.setAllowContentAccess(false);
  s.setMediaPlaybackRequiresUserGesture(false);
  game.addJavascriptInterface(new AudioBridge(),"NativeAudio");
  game.setBackgroundColor(0xff11100e);
  setContentView(game);
  immersive();
  game.loadUrl("file:///android_asset/index.html");
 }
 private void playRandomNative(){
  releaseMusic();
  int next=lastTrack;
  while(next==lastTrack&&tracks.length>1)next=(int)(Math.random()*tracks.length);
  lastTrack=next;
  music=MediaPlayer.create(this,tracks[next]);
  if(music!=null){music.setLooping(true);music.setVolume(.58f,.58f);if(soundEnabled)music.start();}
 }
 private void releaseMusic(){if(music!=null){try{music.stop();}catch(Exception ignored){}music.release();music=null;}}
 public class AudioBridge {
  @JavascriptInterface public void playRandom(){runOnUiThread(()->playRandomNative());}
  @JavascriptInterface public boolean toggle(){soundEnabled=!soundEnabled;runOnUiThread(()->{if(soundEnabled){if(music==null)playRandomNative();else music.start();}else if(music!=null)music.pause();});return soundEnabled;}
  @JavascriptInterface public void stop(){runOnUiThread(()->releaseMusic());}
  @JavascriptInterface public boolean isOn(){return soundEnabled;}
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);}
 @Override public void onBackPressed(){game.evaluateJavascript("window.ForjaGame&&window.ForjaGame.back()",null);}
 @Override protected void onResume(){super.onResume();immersive();if(game!=null)game.onResume();if(soundEnabled&&music!=null)music.start();}
 @Override protected void onPause(){if(music!=null&&music.isPlaying())music.pause();super.onPause();}
 @Override protected void onDestroy(){releaseMusic();if(game!=null){game.destroy();game=null;}super.onDestroy();}
}
