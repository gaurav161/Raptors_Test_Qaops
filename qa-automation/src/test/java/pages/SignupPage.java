package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class SignupPage {
    private WebDriver driver;

    @FindBy(name = "username")
    private WebElement userName;

    @FindBy(name = "email")
    private WebElement emailAdd;

    @FindBy(name = "name")
    private WebElement fullName;

    @FindBy(id = ":r8:-form-item")
    private WebElement passwordField;

    @FindBy(xpath = "//button[text()='Create Account']")
    private WebElement createAccount;



    public SignupPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void userName(String username) {
        userName.clear();
        userName.sendKeys(username);
    }

    public void email(String emails) {
        emailAdd.clear();
        emailAdd.sendKeys(emails);
    }

    public void  fullName(String fullname) {
        fullName.clear();
        fullName.sendKeys(fullname);
    }

    public void passwordField(String password) {
        passwordField.clear();
        passwordField.sendKeys(password);
    }
//    public String getSuccessMessage() {
//        return driver.findElement(successMessage).getText();
//    }
//
//    // ✅ Method to return the error message text
//    public String getErrorMessage() {
//        return driver.findElement(errorMessage).getText();
//    }


    public void clickSignup() {
        createAccount.click();
    }


    public void signup(String username, String emailaddress, String fullname,
                       String passwords) {
        userName(username);
        email(emailaddress);
        fullName(fullname);
        passwordField(passwords);
//        clickSignup();
    }
}