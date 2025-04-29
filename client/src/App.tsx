import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import WorkspacesPage from "@/pages/workspaces-page";
import ProjectsPage from "@/pages/projects-page";
import TestCasesPage from "@/pages/test-cases-page";
import TestExecutionPage from "@/pages/test-execution-page";
import ReportsPage from "@/pages/reports-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/workspaces" component={WorkspacesPage} />
      <ProtectedRoute path="/workspace/:workspaceId/projects" component={ProjectsPage} />
      <ProtectedRoute path="/project/:projectId/test-cases" component={TestCasesPage} />
      <ProtectedRoute path="/project/:projectId/test-execution" component={TestExecutionPage} />
      <ProtectedRoute path="/project/:projectId/reports" component={ReportsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="raptortest-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
