package br.com.beardedbr.forjadeaco;

import android.app.Activity;
import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.SoundPool;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {
 private WebView game;
 private MediaPlayer music;
 private SoundPool effects;
 private int fxCard,fxSelect,fxHit,fxWin,fxLose,fxBonus;
 private boolean musicEnabled=true;
 private int lastTrack=-1;
 private AudioManager audioManager;
 private final AudioManager.OnAudioFocusChangeListener focusListener=change->{
  if(music==null)return;
  if(change==AudioManager.AUDIOFOCUS_LOSS||change==AudioManager.AUDIOFOCUS_LOSS_TRANSIENT){if(music.isPlaying())music.pause();}
  else if(change==AudioManager.AUDIOFOCUS_GAIN&&musicEnabled&&!music.isPlaying())music.start();
 };
 private final int[] tracks={R.raw.forja_industrial,R.raw.forja_rock,R.raw.forja_eletronica};
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  game=new WebView(this);
  audioManager=(AudioManager)getSystemService(Context.AUDIO_SERVICE);
  effects=new SoundPool.Builder().setMaxStreams(6).build();
  fxCard=effects.load(this,R.raw.sfx_card,1);
  fxSelect=effects.load(this,R.raw.sfx_select,1);
  fxHit=effects.load(this,R.raw.sfx_hit,1);
  fxWin=effects.load(this,R.raw.sfx_win,1);
  fxLose=effects.load(this,R.raw.sfx_lose,1);
  fxBonus=effects.load(this,R.raw.sfx_bonus,1);
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
 private void playRandomNative(){playTrackNative(-1);}
 private void playTrackNative(int requested){
  if(audioManager!=null)audioManager.requestAudioFocus(focusListener,AudioManager.STREAM_MUSIC,AudioManager.AUDIOFOCUS_GAIN);
  releaseMusic();
  int next=requested;
  if(next<0||next>=tracks.length){next=lastTrack;while(next==lastTrack&&tracks.length>1)next=(int)(Math.random()*tracks.length);}
  lastTrack=next;
  music=MediaPlayer.create(this,tracks[next]);
  if(music!=null){music.setLooping(true);music.setVolume(.68f,.68f);if(musicEnabled)music.start();}
 }
 private void releaseMusic(){if(music!=null){try{music.stop();}catch(Exception ignored){}music.release();music=null;}}
 private void playSfx(int sample){
  if(effects==null)return;
  effects.play(sample,.82f,.82f,1,0,1f);
 }
 public class AudioBridge {
  @JavascriptInterface public void playRandom(){runOnUiThread(()->playRandomNative());}
  @JavascriptInterface public void playTrack(int index){runOnUiThread(()->playTrackNative(index));}
  @JavascriptInterface public boolean toggle(){musicEnabled=!musicEnabled;runOnUiThread(()->{if(musicEnabled){if(music==null)playRandomNative();else music.start();}else if(music!=null)music.pause();});return musicEnabled;}
  @JavascriptInterface public void stop(){runOnUiThread(()->releaseMusic());}
  @JavascriptInterface public boolean isOn(){return musicEnabled;}
  @JavascriptInterface public void sfx(String kind){
   final int resource;
   if("card".equals(kind))resource=fxCard;
   else if("select".equals(kind))resource=fxSelect;
   else if("hit".equals(kind))resource=fxHit;
   else if("win".equals(kind))resource=fxWin;
   else if("lose".equals(kind))resource=fxLose;
   else resource=fxBonus;
   runOnUiThread(()->playSfx(resource));
  }
  @JavascriptInterface public void ensurePlaying(){runOnUiThread(()->{if(musicEnabled){if(music==null)playRandomNative();else if(!music.isPlaying())music.start();}});}
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);}
 @Override public void onBackPressed(){game.evaluateJavascript("window.ForjaGame&&window.ForjaGame.back()",null);}
 @Override protected void onResume(){super.onResume();immersive();if(game!=null)game.onResume();if(musicEnabled&&music!=null)music.start();}
 @Override protected void onPause(){if(music!=null&&music.isPlaying())music.pause();super.onPause();}
 @Override protected void onDestroy(){releaseMusic();if(effects!=null){effects.release();effects=null;}if(audioManager!=null)audioManager.abandonAudioFocus(focusListener);if(game!=null){game.destroy();game=null;}super.onDestroy();}
}
