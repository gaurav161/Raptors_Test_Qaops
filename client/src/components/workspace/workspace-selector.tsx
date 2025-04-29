import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { Workspace } from "@shared/schema";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSelector() {
  const { toast } = useToast();
  
  const { data: workspaces, isLoading, error } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });
  
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace]);
  
  if (error) {
    toast({
      title: "Error loading workspaces",
      description: "Unable to load your workspaces.",
      variant: "destructive",
    });
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }
  
  if (!workspaces || workspaces.length === 0) {
    return (
      <Link href="/workspaces">
        <Button variant="outline" size="sm" className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>
      </Link>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center text-sm font-medium bg-gray-100 hover:bg-gray-200">
          <span>{selectedWorkspace?.name || "Select Workspace"}</span>
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {workspaces.map((workspace) => (
          <DropdownMenuItem 
            key={workspace.id}
            onClick={() => setSelectedWorkspace(workspace)}
            className={selectedWorkspace?.id === workspace.id ? "bg-gray-100" : ""}
          >
            <Link href={`/workspace/${workspace.id}/projects`}>
              <a className="flex items-center w-full">
                {workspace.name}
              </a>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/workspaces">
            <a className="flex items-center w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Workspace
            </a>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
