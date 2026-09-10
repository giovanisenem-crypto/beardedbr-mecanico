package br.com.beardedbr.mecanico;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
public class MainActivity extends Activity {
 private WebView game;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state); immersive();
  game=new WebView(this); WebSettings s=game.getSettings();
  s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true);
  game.setWebChromeClient(new WebChromeClient()); game.setBackgroundColor(0xff07101c);
  setContentView(game); game.loadUrl("file:///android_asset/index.html");
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(
  View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|
  View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);}
 @Override public void onBackPressed(){game.evaluateJavascript("G.paused=!G.paused",null);}
 @Override protected void onResume(){super.onResume();immersive();}
}
