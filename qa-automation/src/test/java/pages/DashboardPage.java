package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class DashboardPage {
    private WebDriver driver;

    @FindBy(css = ".welcome-message")
    private WebElement welcomeMessage;

    @FindBy(linkText = "Profile")
    private WebElement profileLink;

    @FindBy(linkText = "Settings")
    private WebElement settingsLink;

    @FindBy(id = "logoutButton")
    private WebElement logoutButton;

    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public String getWelcomeMessage() {
        return welcomeMessage.getText();
    }

    public void clickProfile() {
        profileLink.click();
    }

    public void clickSettings() {
        settingsLink.click();
    }

    public void clickLogout() {
        logoutButton.click();
    }

    public boolean isDashboardDisplayed() {
        return welcomeMessage.isDisplayed();
    }
}