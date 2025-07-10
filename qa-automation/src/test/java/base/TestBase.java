package base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.*;
import utilities.ConfigReader;
import java.time.Duration;

public class TestBase {
    protected WebDriver driver;
    protected ConfigReader config;

    @BeforeMethod
    @Parameters({"headless"})
    public void setUp(@Optional("false") String headless) {
        config = new ConfigReader();  // No environment passed
        boolean isHeadless = Boolean.parseBoolean(headless);

        System.setProperty("webdriver.chrome.driver",
                config.getChromeDriverPath());

        ChromeOptions chromeOptions = new ChromeOptions();
        if (isHeadless) chromeOptions.addArguments("--headless");

        driver = new ChromeDriver(chromeOptions);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(config.getImplicitWait()));
        driver.get(config.getApplicationUrl());
        System.out.println("The method of Setup is executed");
    }

    @Test
    public void verifyTitle() {
        System.out.println("Test is running...");
        System.out.println("Page Title: " + driver.getTitle());
    }

    @AfterMethod
    public void tearDown() throws InterruptedException {
        if (driver != null) {
            Thread.sleep(1000);
            driver.quit();
        }
    }
}
