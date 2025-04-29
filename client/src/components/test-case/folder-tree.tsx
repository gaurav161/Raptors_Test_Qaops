import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Folder } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, FolderIcon, FolderOpenIcon, Plus, MoreHorizontal, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  folders: Folder[];
  onSelectFolder: (folderId: number | null) => void;
  selectedFolderId: number | null;
  projectId: number;
}

const createFolderSchema = z.object({
  name: z.string().min(1, "Test suite name is required"),
  parent_id: z.number().nullable(),
});

export default function FolderTree({ folders, onSelectFolder, selectedFolderId, projectId }: FolderTreeProps) {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const form = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: "",
      parent_id: null,
    },
  });
  
  const createFolderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createFolderSchema>) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/folders`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/folders`] });
      toast({
        title: "Success",
        description: "Test suite created successfully",
      });
      form.reset();
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create test suite: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof createFolderSchema>) => {
    createFolderMutation.mutate({
      ...data,
      parent_id: parentFolderId,
    });
  };
  
  const handleCreateFolder = (parentId: number | null = null) => {
    setParentFolderId(parentId);
    setIsCreateModalOpen(true);
  };
  
  const handleToggleExpand = (folderId: number) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId) 
        : [...prev, folderId]
    );
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Build folder hierarchy
  const buildFolderTree = (parentId: number | null = null): Folder[] => {
    return folders
      .filter(folder => folder.parent_id === parentId)
      .filter(folder => 
        !searchQuery || folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };
  
  const rootFolders = buildFolderTree(null);
  
  // Count all test cases in a folder and its subfolders recursively
  const countTestCasesInFolder = (folderId: number): number => {
    // This would be replaced with actual test case counts from a query
    // Just a placeholder for now
    return Math.floor(Math.random() * 20) + 1;
  };
  
  const renderFolderTree = (folderList: Folder[], level = 0) => {
    return folderList.map(folder => {
      const children = buildFolderTree(folder.id);
      const hasChildren = children.length > 0;
      const isExpanded = expandedFolders.includes(folder.id);
      const isSelected = selectedFolderId === folder.id;
      
      return (
        <div key={folder.id} className="relative" style={{ paddingLeft: level > 0 ? `${level * 16}px` : '0' }}>
          {level > 0 && (
            <div className="absolute left-0 top-0 h-full w-px bg-gray-200 ml-2" />
          )}
          <div 
            className={cn(
              "flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer",
              isSelected && "bg-blue-50 border-l-2 border-blue-500"
            )}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div className="flex items-center">
              {hasChildren ? (
                <button
                  className="text-gray-500 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(folder.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <span className="w-5" />
              )}
              {isSelected ? (
                <FolderOpenIcon className="text-blue-500 mr-2 h-4 w-4" />
              ) : (
                <FolderIcon className="text-gray-500 mr-2 h-4 w-4" />
              )}
              <span className="text-sm font-medium">{folder.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">
                {countTestCasesInFolder(folder.id)}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFolder(folder.id);
                }}
              >
                <Plus className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="space-y-1 mt-1">
              {renderFolderTree(children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600 hover:text-blue-800 -ml-2 px-2"
          onClick={() => handleCreateFolder(null)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Test Suite
        </Button>
      </div>
      
      <div className="my-3">
        <div className="relative">
          <Input 
            type="text" 
            className="pl-9 pr-3 py-2 text-sm" 
            placeholder="Search test suites"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      <ScrollArea className="max-h-[calc(100vh-320px)]">
        <ul className="space-y-1 mt-2">
          <li>
            <div 
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer",
                !selectedFolderId && "bg-blue-50 border-l-2 border-blue-500"
              )}
              onClick={() => onSelectFolder(null)}
            >
              <div className="flex items-center">
                <FolderIcon className="text-gray-500 mr-2 h-4 w-4" />
                <span className="text-sm font-medium">All Test Cases</span>
              </div>
              <span className="text-xs text-gray-500">
                {/* Placeholder for total test case count */}
                {folders.length > 0 ? folders.length * 5 : 0}
              </span>
            </div>
          </li>
          
          {renderFolderTree(rootFolders)}
        </ul>
      </ScrollArea>
      
      {/* Create Test Suite Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test Suite</DialogTitle>
            <DialogDescription>
              Create a new test suite to organize your test cases.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Suite Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter test suite name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-sm text-gray-500">
                {parentFolderId ? (
                  <p>
                    Parent Test Suite: {folders.find(f => f.id === parentFolderId)?.name}
                  </p>
                ) : (
                  <p>This will be a root level test suite.</p>
                )}
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
                  disabled={createFolderMutation.isPending}
                >
                  {createFolderMutation.isPending ? "Creating..." : "Create Test Suite"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}