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
  name: z.string().min(1, "Folder name is required"),
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
        description: "Folder created successfully",
      });
      form.reset();
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create folder: ${error.message}`,
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
  
  const renderFolderTree = (folderList: Folder[], level = 0) => {
    return folderList.map(folder => {
      const children = buildFolderTree(folder.id);
      const hasChildren = children.length > 0;
      const isExpanded = expandedFolders.includes(folder.id);
      const isSelected = selectedFolderId === folder.id;
      
      return (
        <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
          <div 
            className={cn(
              "flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer",
              isSelected && "bg-indigo-50 border-l-2 border-indigo-500"
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
              <span className="text-sm">{folder.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              {/* This would be the count of test cases in the folder */}
              {/* Placeholder for now */}
              {Math.floor(Math.random() * 100)}
            </span>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="pl-5 space-y-1 mt-1">
              {renderFolderTree(children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Folders</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleCreateFolder(null)}
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="relative">
          <Input 
            type="text" 
            className="pl-9 pr-3 py-2 text-sm" 
            placeholder="Search folders"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      <ScrollArea className="max-h-[calc(100vh-320px)]">
        <ul className="space-y-1">
          <li>
            <div 
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer",
                !selectedFolderId && "bg-gray-100"
              )}
              onClick={() => onSelectFolder(null)}
            >
              <div className="flex items-center">
                <FolderIcon className="text-gray-500 mr-2 h-4 w-4" />
                <span className="text-sm font-medium">All Test Cases</span>
              </div>
              <span className="text-xs text-gray-500">
                {folders.length > 0 ? folders.length : 0}
              </span>
            </div>
          </li>
          
          {renderFolderTree(rootFolders)}
        </ul>
      </ScrollArea>
      
      {/* Create Folder Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your test cases.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter folder name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-sm text-gray-500">
                {parentFolderId ? (
                  <p>
                    Parent Folder: {folders.find(f => f.id === parentFolderId)?.name}
                  </p>
                ) : (
                  <p>This will be a root level folder.</p>
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
                  {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
