package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.DevelopmentFixtures
import com.example.model.NewsCategory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("नेपाल न्यूज", appName)
  }

  @Test
  fun `fixtures have authentic nepali content`() {
    val articles = DevelopmentFixtures.ARTICLES
    assertTrue("Should have multiple news articles", articles.size >= 5)
    assertTrue("Should have featured article", articles.any { it.isFeatured })
    assertTrue("Should have breaking news", articles.any { it.isBreaking })
    assertTrue("Should have politics category", articles.any { it.category == NewsCategory.POLITICS })
  }
}
