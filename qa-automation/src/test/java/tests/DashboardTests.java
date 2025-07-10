package tests;

import org.testng.Assert;
import org.testng.annotations.Test;
import base.TestBase;
import pages.DashboardPage;
import pages.LoginPage;

public class DashboardTests extends TestBase {

    @Test(description = "Verify dashboard elements after login")
    public void testDashboardElements() throws InterruptedException {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("valid_user@example.com", "validPassword123");

        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(),
                "Dashboard not displayed");
        Assert.assertTrue(dashboardPage.getWelcomeMessage().contains("Welcome"),
                "Welcome message not displayed");
    }

    @Test(description = "Verify successful logout")
    public void testLogout() throws InterruptedException {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("valid_user@example.com", "validPassword123");

        DashboardPage dashboardPage = new DashboardPage(driver);
        dashboardPage.clickLogout();

        Assert.assertTrue(loginPage.isLoginPageDisplayed(),
                "Did not return to login page after logout");
    }
}