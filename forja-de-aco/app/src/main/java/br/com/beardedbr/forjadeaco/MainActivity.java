package br.com.beardedbr.forjadeaco;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {
 private WebView game;
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  game=new WebView(this);
  WebSettings s=game.getSettings();
  s.setJavaScriptEnabled(true);
  s.setDomStorageEnabled(true);
  s.setAllowFileAccess(true);
  s.setAllowContentAccess(false);
  s.setMediaPlaybackRequiresUserGesture(false);
  game.setBackgroundColor(0xff11100e);
  setContentView(game);
  immersive();
  game.loadUrl("file:///android_asset/index.html");
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);}
 @Override public void onBackPressed(){game.evaluateJavascript("window.ForjaGame&&window.ForjaGame.back()",null);}
 @Override protected void onResume(){super.onResume();immersive();if(game!=null){game.onResume();game.evaluateJavascript("typeof startMusic==='function'&&startMusic()",null);}}
 @Override protected void onPause(){if(game!=null)game.evaluateJavascript("document.getElementById('music')?.pause()",null);super.onPause();}
 @Override protected void onDestroy(){if(game!=null){game.destroy();game=null;}super.onDestroy();}
}
