import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Workspace } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });

  const testStatusData = [
    { name: 'Passed', value: 58, color: '#10B981' },
    { name: 'Failed', value: 14, color: '#EF4444' },
    { name: 'Blocked', value: 8, color: '#F59E0B' },
    { name: 'Not Run', value: 20, color: '#6B7280' },
  ];

  const testExecutionData = [
    { name: 'Jan', Executed: 12, Automated: 8 },
    { name: 'Feb', Executed: 19, Automated: 10 },
    { name: 'Mar', Executed: 25, Automated: 14 },
    { name: 'Apr', Executed: 32, Automated: 18 },
    { name: 'May', Executed: 40, Automated: 24 },
    { name: 'Jun', Executed: 35, Automated: 28 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentModule="dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name || user?.username}! Here's an overview of your testing activities.
            </p>
          </div>
          
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Workspaces</CardDescription>
                <CardTitle className="text-3xl">
                  {isLoadingWorkspaces ? <Skeleton className="h-8 w-16" /> : workspaces?.length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Projects</CardDescription>
                <CardTitle className="text-3xl">5</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Test Cases</CardDescription>
                <CardTitle className="text-3xl">246</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Test Execution Rate</CardDescription>
                <CardTitle className="text-3xl">72%</CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Test Status Overview</CardTitle>
                <CardDescription>Current test execution results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={testStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {testStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Test Execution Trend</CardTitle>
                <CardDescription>Last 6 months execution data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={testExecutionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Executed" fill="#3B82F6" />
                      <Bar dataKey="Automated" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity and Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Test case "User profile update validation" was updated</p>
                        <p className="text-xs text-gray-500 mt-1">3 hours ago by Alex Morgan</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/workspaces">
                    <a className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="font-medium mb-1">My Workspaces</div>
                      <div className="text-sm text-gray-500">Manage your workspaces</div>
                    </a>
                  </Link>
                  <Link href="/project/1/test-cases">
                    <a className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="font-medium mb-1">Test Cases</div>
                      <div className="text-sm text-gray-500">Create and manage test cases</div>
                    </a>
                  </Link>
                  <Link href="/project/1/test-execution">
                    <a className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="font-medium mb-1">Test Execution</div>
                      <div className="text-sm text-gray-500">Run and track test executions</div>
                    </a>
                  </Link>
                  <Link href="/project/1/reports">
                    <a className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="font-medium mb-1">Reports</div>
                      <div className="text-sm text-gray-500">View testing analytics</div>
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
