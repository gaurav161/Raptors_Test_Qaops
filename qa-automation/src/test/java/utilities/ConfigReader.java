package utilities;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ConfigReader {

        private Properties properties;

        public ConfigReader() {
            properties = new Properties();
            try {
                String configPath = System.getProperty("user.dir") + "/src/test/resources/config/config.properties";
                FileInputStream input = new FileInputStream(configPath);
                properties.load(input);
                input.close();
            } catch (IOException e) {
                throw new RuntimeException("Failed to load config.properties", e);
            }
        }

        public String getApplicationUrl() {
            return properties.getProperty("app.url");
        }

        public String getChromeDriverPath() {
            return properties.getProperty("chrome.driver.path");
        }

        public String getFirefoxDriverPath() {
            return properties.getProperty("firefox.driver.path");
        }

        public int getImplicitWait() {
            return Integer.parseInt(properties.getProperty("implicit.wait"));
        }
    }

