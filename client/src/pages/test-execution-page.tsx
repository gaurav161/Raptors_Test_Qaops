import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Project, TestCase, TestExecution, TestExecutionItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, CheckCircle2, XCircle, AlertCircle, Clock, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const createTestExecutionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.string().default("Not Started"),
  test_case_ids: z.array(z.number()).optional(),
});

export default function TestExecutionPage() {
  const { projectId } = useParams();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTestExecution, setSelectedTestExecution] = useState<number | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<number[]>([]);
  
  const form = useForm<z.infer<typeof createTestExecutionSchema>>({
    resolver: zodResolver(createTestExecutionSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Not Started",
      test_case_ids: [],
    },
  });
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  const { data: testCases } = useQuery<TestCase[]>({
    queryKey: [`/api/projects/${projectId}/test-cases`],
    enabled: !!projectId,
  });
  
  const { data: testExecutions } = useQuery<TestExecution[]>({
    queryKey: [`/api/projects/${projectId}/test-executions`],
    enabled: !!projectId,
  });
  
  const { data: executionItems } = useQuery<TestExecutionItem[]>({
    queryKey: [`/api/test-executions/${selectedTestExecution}/items`],
    enabled: !!selectedTestExecution,
  });
  
  const createTestExecutionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createTestExecutionSchema>) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/test-executions`, {
        ...data,
        test_case_ids: selectedTestCases,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/test-executions`] });
      toast({
        title: "Success",
        description: "Test execution created successfully",
      });
      form.reset();
      setSelectedTestCases([]);
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create test execution: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const updateExecutionItemMutation = useMutation({
    mutationFn: async ({ id, status, result, comments }: { id: number, status: string, result?: string, comments?: string }) => {
      const res = await apiRequest("PATCH", `/api/test-execution-items/${id}`, {
        status,
        result,
        comments,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/test-executions/${selectedTestExecution}/items`] });
      toast({
        title: "Success",
        description: "Test execution item updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update test execution item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof createTestExecutionSchema>) => {
    createTestExecutionMutation.mutate(data);
  };
  
  const handleToggleTestCase = (testCaseId: number) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseId)
        ? prev.filter(id => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };
  
  const handleSelectTestExecution = (executionId: number) => {
    setSelectedTestExecution(executionId);
  };
  
  const handleUpdateStatus = (itemId: number, status: string) => {
    updateExecutionItemMutation.mutate({
      id: itemId,
      status,
      result: status === "Failed" ? "Test failed" : status === "Passed" ? "Test passed" : "",
    });
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Passed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "Failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "Blocked":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "Not Run":
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    const classes = {
      "Passed": "bg-green-100 text-green-800",
      "Failed": "bg-red-100 text-red-800",
      "Blocked": "bg-yellow-100 text-yellow-800",
      "Not Run": "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={classes[status as keyof typeof classes] || classes["Not Run"]}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentModule="test-execution" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/workspaces">
              <a className="hover:text-primary">Workspaces</a>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/workspace/${project?.workspace_id}/projects`}>
              <a className="hover:text-primary">Projects</a>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/project/${projectId}`}>
              <a className="hover:text-primary">{project?.name}</a>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Test Execution</span>
          </div>
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Execution</h1>
              <p className="mt-1 text-sm text-gray-500">Run and track your test execution cycles</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Test Cycle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Create New Test Cycle</DialogTitle>
                    <DialogDescription>
                      Create a new test execution cycle and select test cases to include.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cycle Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter test cycle name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the purpose of this test cycle" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Select Test Cases</FormLabel>
                        <div className="relative mt-1 mb-2">
                          <Input 
                            type="text" 
                            placeholder="Search test cases..." 
                            className="pl-9" 
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <ScrollArea className="h-[300px] border rounded-md p-2">
                          {testCases?.map(testCase => (
                            <div key={testCase.id} className="flex items-start p-2 hover:bg-gray-50 rounded">
                              <Checkbox 
                                id={`tc-${testCase.id}`}
                                checked={selectedTestCases.includes(testCase.id)}
                                onCheckedChange={() => handleToggleTestCase(testCase.id)}
                                className="mt-1 mr-2"
                              />
                              <div>
                                <label htmlFor={`tc-${testCase.id}`} className="text-sm font-medium cursor-pointer">
                                  {testCase.test_id}: {testCase.name}
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                  {testCase.description?.slice(0, 100)}
                                  {testCase.description && testCase.description.length > 100 ? '...' : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                          {(!testCases || testCases.length === 0) && (
                            <div className="p-4 text-center text-gray-500">
                              No test cases found for this project.
                            </div>
                          )}
                        </ScrollArea>
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedTestCases.length} test cases selected
                        </p>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createTestExecutionMutation.isPending || selectedTestCases.length === 0}
                        >
                          {createTestExecutionMutation.isPending ? "Creating..." : "Create Test Cycle"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Execution List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Test Cycles</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {testExecutions?.map(execution => (
                      <div 
                        key={execution.id} 
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedTestExecution === execution.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                        onClick={() => handleSelectTestExecution(execution.id)}
                      >
                        <h3 className="font-medium">{execution.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(execution.created_at).toLocaleDateString()}
                        </p>
                        <Badge variant={execution.status === "Completed" ? "success" : "outline"} className="mt-2">
                          {execution.status}
                        </Badge>
                      </div>
                    ))}
                    {(!testExecutions || testExecutions.length === 0) && (
                      <div className="p-4 text-center text-gray-500">
                        No test cycles found. Create your first test cycle.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Execution Details */}
            <div className="lg:col-span-3">
              {selectedTestExecution ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {testExecutions?.find(e => e.id === selectedTestExecution)?.name}
                    </CardTitle>
                    <CardDescription>
                      {testExecutions?.find(e => e.id === selectedTestExecution)?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Test Case</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {executionItems?.map(item => {
                          const testCase = testCases?.find(tc => tc.id === item.test_case_id);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {testCase?.test_id}
                              </TableCell>
                              <TableCell>{testCase?.name}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  testCase?.priority === "High" ? "destructive" : 
                                  testCase?.priority === "Medium" ? "warning" : 
                                  "default"
                                }>
                                  {testCase?.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(item.status)}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.status}
                                  onValueChange={(value) => handleUpdateStatus(item.id, value)}
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Set status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Not Run">Not Run</SelectItem>
                                    <SelectItem value="Passed">Passed</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                    <SelectItem value="Blocked">Blocked</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {(!executionItems || executionItems.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No test cases in this execution.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Test Execution Details</CardTitle>
                    <CardDescription>
                      Select a test cycle from the left to view its details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                        <PlusCircle className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Test Cycle Selected</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                        Select a test cycle from the left side or create a new one to start executing tests.
                      </p>
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        Create New Test Cycle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
