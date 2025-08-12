package com.shopsahai.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    // Ensure plugin is added before BridgeActivity.load() runs
    initialPlugins.add(VoiceAssistantPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
