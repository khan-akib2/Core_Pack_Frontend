package com.corepackindia.app;

import android.content.res.Configuration;
import android.os.Bundle;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyStatusBarTheme();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyStatusBarTheme();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyStatusBarTheme();
    }

    private void applyStatusBarTheme() {
        try {
            Window window = getWindow();
            int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
            boolean isNightMode = (nightModeFlags == Configuration.UI_MODE_NIGHT_YES);

            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());

            if (isNightMode) {
                // Dark Mode: Dark slate status bar (#020617), white icons for high contrast visibility
                window.setStatusBarColor(0xFF020617);
                if (controller != null) {
                    controller.setAppearanceLightStatusBars(false);
                }
            } else {
                // Light Mode: Pure white status bar (#FFFFFF), dark icons
                window.setStatusBarColor(0xFFFFFFFF);
                if (controller != null) {
                    controller.setAppearanceLightStatusBars(true);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}


