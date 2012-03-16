package com.kodeincloud.blograla;

import com.kodeincloud.blograla.R;
import com.phonegap.DroidGap;

import android.os.Bundle;

public class BlogRalaActivity extends DroidGap {
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/index.html");
        
    }
}