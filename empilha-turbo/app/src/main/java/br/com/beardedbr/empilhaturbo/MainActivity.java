package br.com.beardedbr.empilhaturbo;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebSettings;
public class MainActivity extends Activity {
 private WebView game;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  game = new WebView(this);
  WebSettings settings = game.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(true);
  settings.setAllowContentAccess(false);
  game.setBackgroundColor(0xff101b20);
  setContentView(game);
  immersive();
  game.loadUrl("file:///android_asset/index.html");
 }
 private void immersive() { getWindow().getDecorView().setSystemUiVisibility(
  View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
  View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
  View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION); }
 @Override public void onBackPressed() {
  game.evaluateJavascript("window.EmpilhaGame && window.EmpilhaGame.pause()", null);
 }
 @Override protected void onPause() {
  if (game != null) { game.evaluateJavascript("window.EmpilhaGame && window.EmpilhaGame.pause()",null); game.onPause(); }
  super.onPause();
 }
 @Override protected void onResume() { super.onResume(); if (game != null) game.onResume(); immersive(); }
 @Override protected void onDestroy() { if (game != null) { game.destroy(); game=null; } super.onDestroy(); }
}
