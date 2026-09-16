package com.corepackindia.app;

import android.os.Bundle;
import android.view.Window;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            Window window = getWindow();
            window.setStatusBarColor(0xFFFFFFFF);
            WindowCompat.getInsetsController(window, window.getDecorView()).setAppearanceLightStatusBars(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

