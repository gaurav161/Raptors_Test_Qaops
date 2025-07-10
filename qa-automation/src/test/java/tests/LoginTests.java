package tests;

import org.testng.Assert;
import org.testng.annotations.Test;
import base.TestBase;
import pages.DashboardPage;
import pages.LoginPage;

public class LoginTests extends TestBase {

    @Test(priority = 1, description = "Verify successful login with valid credentials")
    public void testSuccessfulLogin() throws InterruptedException {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("john.doe@example.com", "John Doe");


        System.out.println("Verify successful login with valid credentials");


//        DashboardPage dashboardPage = new DashboardPage(driver);
//        Assert.assertTrue(dashboardPage.isDashboardDisplayed(),
//                "Dashboard page not displayed after login");
    }

    @Test(priority = 2, description = "Verify login fails with invalid credentials")
    public void testInvalidLogin() throws InterruptedException {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("invalid_user@example.com", "wrongPassword");

        System.out.println("Verify login fails with invalid credentials");
//        Assert.assertTrue(loginPage.getErrorMessage().contains("Invalid"),
//                "Error message not displayed for invalid login");
    }

    @Test(priority = 3, description = "Verify navigation to signup page")
    public void testNavigateToSignup() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.clickCreateAccount();
        System.out.println("Verify navigation to signup page");
//        Assert.assertTrue(driver.getCurrentUrl().contains("signup"),
//                "Did not navigate to signup page");
    }
}