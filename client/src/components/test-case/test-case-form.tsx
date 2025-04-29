import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Folder, TestCase, insertTestCaseSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface TestCaseFormProps {
  projectId: number;
  folders?: Folder[];
  initialData?: TestCase;
  isReadOnly?: boolean;
  initialFolderId?: number | null;
  onSuccess?: () => void;
}

// Define step type
type TestStep = {
  id: number;
  action: string;
  expected_result: string;
};

// Create a schema for the test case form
const testCaseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  type: z.string().min(1, "Type is required"),
  preconditions: z.string().optional(),
  folder_id: z.number().min(1, "Folder is required"),
  steps: z.array(z.object({
    id: z.number(),
    action: z.string().min(1, "Action is required"),
    expected_result: z.string().min(1, "Expected result is required"),
  })),
  tags: z.string().optional(),
});

export default function TestCaseForm({ projectId, folders = [], initialData, isReadOnly = false, initialFolderId, onSuccess }: TestCaseFormProps) {
  const { toast } = useToast();
  
  // Fetch folders if not provided
  const { data: fetchedFolders } = useQuery<Folder[]>({
    queryKey: [`/api/projects/${projectId}/folders`],
    enabled: folders.length === 0,
  });
  
  const allFolders = folders.length > 0 ? folders : fetchedFolders || [];
  
  // Prepare initial form values
  let defaultSteps: TestStep[] = [
    { id: 1, action: "", expected_result: "" },
    { id: 2, action: "", expected_result: "" },
  ];
  
  let defaultTags = "";
  
  if (initialData) {
    if (typeof initialData.steps === 'string') {
      try {
        defaultSteps = JSON.parse(initialData.steps);
      } catch (e) {
        console.error("Failed to parse steps from initialData", e);
      }
    } else if (Array.isArray(initialData.steps)) {
      defaultSteps = initialData.steps as TestStep[];
    }
    
    if (initialData.tags && Array.isArray(initialData.tags)) {
      defaultTags = initialData.tags.join(", ");
    }
  }
  
  const form = useForm<z.infer<typeof testCaseFormSchema>>({
    resolver: zodResolver(testCaseFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      priority: initialData.priority,
      status: initialData.status,
      type: initialData.type,
      preconditions: initialData.preconditions || "",
      folder_id: initialData.folder_id,
      steps: defaultSteps,
      tags: defaultTags,
    } : {
      name: "",
      description: "",
      priority: "Medium",
      status: "Draft",
      type: "Functional",
      preconditions: "",
      folder_id: initialFolderId || 0,
      steps: defaultSteps,
      tags: "",
    },
  });
  
  // Set folder ID when initialFolderId changes
  useEffect(() => {
    if (initialFolderId && !initialData) {
      form.setValue("folder_id", initialFolderId);
    }
  }, [initialFolderId, form, initialData]);
  
  // Create mutation for test case
  const createTestCaseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof testCaseFormSchema>) => {
      // Convert steps to the correct format
      const formattedData = {
        ...data,
        project_id: projectId,
        steps: data.steps,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
      };
      
      const res = await apiRequest(
        "POST", 
        `/api/projects/${projectId}/test-cases`, 
        formattedData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/test-cases`] });
      if (initialFolderId) {
        queryClient.invalidateQueries({ queryKey: [`/api/folders/${initialFolderId}/test-cases`] });
      }
      
      toast({
        title: "Success",
        description: "Test case created successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create test case: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleAddStep = () => {
    const steps = form.getValues("steps");
    const newId = steps.length > 0 ? Math.max(...steps.map(s => s.id)) + 1 : 1;
    
    form.setValue("steps", [
      ...steps, 
      { id: newId, action: "", expected_result: "" }
    ]);
  };
  
  const handleRemoveStep = (id: number) => {
    const steps = form.getValues("steps");
    form.setValue("steps", steps.filter(s => s.id !== id));
  };
  
  const onSubmit = (data: z.infer<typeof testCaseFormSchema>) => {
    createTestCaseMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Case Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a descriptive name" 
                      {...field} 
                      disabled={isReadOnly} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormLabel>Test Case ID</FormLabel>
            <Input 
              disabled 
              className="bg-gray-50"
              value={initialData?.test_id || "TC-XXXX"} 
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the purpose of this test case" 
                  rows={3} 
                  {...field} 
                  disabled={isReadOnly} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  disabled={isReadOnly} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  disabled={isReadOnly} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Functional">Functional</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Usability">Usability</SelectItem>
                    <SelectItem value="Regression">Regression</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="folder_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Folder</FormLabel>
                <Select 
                  disabled={isReadOnly || initialFolderId !== undefined} 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allFolders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="preconditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preconditions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Required conditions before executing the test" 
                  rows={2} 
                  {...field} 
                  disabled={isReadOnly} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                disabled={isReadOnly} 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <FormLabel className="text-base">Test Steps</FormLabel>
            {!isReadOnly && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddStep}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Step
              </Button>
            )}
          </div>
          
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Expected Result</TableHead>
                  {!isReadOnly && <TableHead className="w-16">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.watch("steps").map((step, index) => (
                  <TableRow key={step.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`steps.${index}.action`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                rows={2} 
                                className="min-h-[80px] border-0 focus:ring-0 p-2 resize-none" 
                                placeholder="Describe the action to perform"
                                {...field} 
                                disabled={isReadOnly} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`steps.${index}.expected_result`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                rows={2} 
                                className="min-h-[80px] border-0 focus:ring-0 p-2 resize-none" 
                                placeholder="What should happen?"
                                {...field} 
                                disabled={isReadOnly} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveStep(step.id)}
                          disabled={form.watch("steps").length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Add tags separated by commas" 
                  {...field} 
                  disabled={isReadOnly} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createTestCaseMutation.isPending}
            >
              {createTestCaseMutation.isPending ? "Saving..." : "Save Test Case"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
