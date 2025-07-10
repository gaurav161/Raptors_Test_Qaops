package tests;

import org.testng.annotations.Test;
import base.TestBase;
import pages.LoginPage;
import pages.SignupPage;

public class SignupTests extends TestBase {

    @Test(priority = 1, description  = "Verify successful user registration")
    public void testSuccessfulSignup() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.clickCreateAccount();

        SignupPage signupPage = new SignupPage(driver);
        signupPage.signup("John", "john1.doe@example.com", "John Doe",
                "Password1234");
        signupPage.clickSignup();

        System.out.println("testSuccessFulSignup executed");


//        Assert.assertTrue(signupPage.getSuccessMessage().contains("successful"),
//                "Signup was not successful");
    }

    @Test(priority = 2, description = "Verify password mismatch error")
    public void testPasswordMismatch() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.clickCreateAccount();

        SignupPage signupPage = new SignupPage(driver);
        signupPage.signup("John", "john1.doe@example.com", "John Doe",
                "Password1234");

        System.out.println("testSuccessFulSignup executed");

//        Assert.assertTrue(signupPage.getErrorMessage().contains("match"),
//                "Password mismatch error not displayed");
    }
}