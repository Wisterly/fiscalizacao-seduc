package br.com.gprlab.fiscalia;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppUpdateManagerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
