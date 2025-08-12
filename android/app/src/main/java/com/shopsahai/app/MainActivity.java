package com.shopsahai.app;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
  @Override
  public void onStart() {
    super.onStart();
    List<Class<? extends Plugin>> additionalPlugins = new ArrayList<>();
    additionalPlugins.add(VoiceAssistantPlugin.class);
    this.bridge.getPluginManager().addPlugins(additionalPlugins);
  }
}
