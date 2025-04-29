import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertWorkspaceSchema, 
  insertProjectSchema, 
  insertFolderSchema,
  insertTestCaseSchema,
  insertTestExecutionSchema,
  insertTestExecutionItemSchema
} from "@shared/schema";
import { generateTestCase, generateTestCasesFromFeatureName } from "./openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Workspaces API
  app.get("/api/workspaces", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaces = await storage.getWorkspacesByUserId(req.user.id);
      res.json(workspaces);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.post("/api/workspaces", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validated = insertWorkspaceSchema.parse({
        ...req.body,
        created_by: req.user.id,
      });
      
      const workspace = await storage.createWorkspace(validated);
      
      // Add creator as admin
      await storage.addWorkspaceMember({
        workspace_id: workspace.id,
        user_id: req.user.id,
        role: "admin"
      });
      
      res.status(201).json(workspace);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  app.get("/api/workspaces/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspace = await storage.getWorkspace(parseInt(req.params.id));
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      // Check if user is a member of this workspace
      const isMember = await storage.isWorkspaceMember(workspace.id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this workspace" });
      }
      
      res.json(workspace);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  // Projects API
  app.get("/api/workspaces/:workspaceId/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      
      // Check if user is a member of this workspace
      const isMember = await storage.isWorkspaceMember(workspaceId, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this workspace" });
      }
      
      const projects = await storage.getProjectsByWorkspaceId(workspaceId);
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/workspaces/:workspaceId/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      
      // Check if user is a member of this workspace
      const isMember = await storage.isWorkspaceMember(workspaceId, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this workspace" });
      }
      
      const validated = insertProjectSchema.parse({
        ...req.body,
        workspace_id: workspaceId,
        created_by: req.user.id,
      });
      
      const project = await storage.createProject(validated);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Folders API
  app.get("/api/projects/:projectId/folders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const folders = await storage.getFoldersByProjectId(projectId);
      res.json(folders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/projects/:projectId/folders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const validated = insertFolderSchema.parse({
        ...req.body,
        project_id: projectId,
        created_by: req.user.id,
      });
      
      const folder = await storage.createFolder(validated);
      res.status(201).json(folder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  // Test Cases API
  app.get("/api/projects/:projectId/test-cases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const testCases = await storage.getTestCasesByProjectId(projectId);
      res.json(testCases);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test cases" });
    }
  });

  app.get("/api/folders/:folderId/test-cases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const folderId = parseInt(req.params.folderId);
      const folder = await storage.getFolder(folderId);
      
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      const project = await storage.getProject(folder.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this folder" });
      }
      
      const testCases = await storage.getTestCasesByFolderId(folderId);
      res.json(testCases);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test cases" });
    }
  });

  app.post("/api/projects/:projectId/test-cases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      // Generate test ID
      const count = await storage.getTestCaseCount(projectId);
      const testId = `TC-${(count + 1).toString().padStart(4, '0')}`;
      
      const validated = insertTestCaseSchema.parse({
        ...req.body,
        project_id: projectId,
        created_by: req.user.id,
        test_id: testId,
      });
      
      const testCase = await storage.createTestCase(validated);
      res.status(201).json(testCase);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create test case" });
    }
  });

  app.get("/api/test-cases/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const testCase = await storage.getTestCase(parseInt(req.params.id));
      
      if (!testCase) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      const project = await storage.getProject(testCase.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this test case" });
      }
      
      res.json(testCase);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test case" });
    }
  });

  // Test Executions API
  app.get("/api/projects/:projectId/test-executions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const testExecutions = await storage.getTestExecutionsByProjectId(projectId);
      res.json(testExecutions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test executions" });
    }
  });

  app.post("/api/projects/:projectId/test-executions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const validated = insertTestExecutionSchema.parse({
        ...req.body,
        project_id: projectId,
        created_by: req.user.id,
      });
      
      const testExecution = await storage.createTestExecution(validated);
      
      // Add test cases to execution if they are provided
      if (req.body.test_case_ids && Array.isArray(req.body.test_case_ids)) {
        for (const testCaseId of req.body.test_case_ids) {
          await storage.addTestExecutionItem({
            execution_id: testExecution.id,
            test_case_id: testCaseId,
            status: "Not Run",
          });
        }
      }
      
      res.status(201).json(testExecution);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create test execution" });
    }
  });

  app.get("/api/test-executions/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const executionId = parseInt(req.params.id);
      const execution = await storage.getTestExecution(executionId);
      
      if (!execution) {
        return res.status(404).json({ message: "Test execution not found" });
      }
      
      const project = await storage.getProject(execution.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this test execution" });
      }
      
      const items = await storage.getTestExecutionItems(executionId);
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test execution items" });
    }
  });

  app.patch("/api/test-execution-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getTestExecutionItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Test execution item not found" });
      }
      
      const execution = await storage.getTestExecution(item.execution_id);
      const project = await storage.getProject(execution.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to update this test execution item" });
      }
      
      const updatedItem = await storage.updateTestExecutionItem(itemId, {
        ...req.body,
        executed_by: req.user.id,
        executed_at: new Date(),
      });
      
      res.json(updatedItem);
    } catch (err) {
      res.status(500).json({ message: "Failed to update test execution item" });
    }
  });

  // AI Test Generation API
  app.post("/api/generate-test-cases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { featureDescription, featureName, numTestCases = 1 } = req.body;
      
      if (!featureDescription && !featureName) {
        return res.status(400).json({ 
          message: "Either featureDescription or featureName is required"
        });
      }
      
      let testCases;
      if (featureDescription) {
        testCases = await generateTestCase(featureDescription, numTestCases);
      } else {
        testCases = await generateTestCasesFromFeatureName(featureName, numTestCases);
      }
      
      res.json(testCases);
    } catch (err: any) {
      console.error("Error generating test cases:", err);
      res.status(500).json({ 
        message: "Failed to generate test cases",
        error: err.message || "Unknown error"
      });
    }
  });

  // Export test cases as CSV
  app.get("/api/projects/:projectId/test-cases/export", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const testCases = await storage.getTestCasesByProjectId(projectId);
      
      // Generate CSV content
      let csvContent = "Test ID,Name,Type,Priority,Status,Description,Preconditions,Steps,Tags\n";
      
      testCases.forEach(testCase => {
        const steps = JSON.parse(testCase.steps as string);
        let stepsText = '';
        
        if (Array.isArray(steps)) {
          stepsText = steps.map(step => 
            `Step ${step.id}: ${step.action} -> ${step.expected_result}`
          ).join(" | ");
        }
        
        // Sanitize fields for CSV by wrapping in quotes and escaping existing quotes
        const sanitize = (text: any) => {
          if (text === null || text === undefined) return '';
          return `"${String(text).replace(/"/g, '""')}"`;
        };
        
        csvContent += [
          sanitize(testCase.test_id),
          sanitize(testCase.name),
          sanitize(testCase.type),
          sanitize(testCase.priority),
          sanitize(testCase.status),
          sanitize(testCase.description),
          sanitize(testCase.preconditions),
          sanitize(stepsText),
          sanitize(testCase.tags)
        ].join(",") + "\n";
      });
      
      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="test-cases-project-${projectId}.csv"`);
      
      res.send(csvContent);
    } catch (err: any) {
      console.error("Error exporting test cases:", err);
      res.status(500).json({ 
        message: "Failed to export test cases", 
        error: err.message || "Unknown error" 
      });
    }
  });

  // Get Sample CSV template
  app.get("/api/test-cases/sample-template", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const csvTemplate = 
      "Test ID,Name,Type,Priority,Status,Description,Preconditions,Steps,Tags\n" +
      "TC-0001,\"Login with valid credentials\",\"Functional\",\"High\",\"Active\"," +
      "\"Verify users can login with valid credentials\",\"User exists in the system\"," +
      "\"Step 1: Navigate to login page -> User should see login form | " +
      "Step 2: Enter valid username and password -> Fields should accept input | " +
      "Step 3: Click login button -> User should be logged in and redirected to dashboard\"," +
      "\"login,authentication,smoke\"\n" +
      "TC-0002,\"Password reset functionality\",\"Functional\",\"Medium\",\"Active\"," +
      "\"Verify users can reset their password\",\"User exists in the system\"," +
      "\"Step 1: Navigate to login page -> User should see login form | " +
      "Step 2: Click on 'Forgot password' link -> User should be redirected to password reset page | " +
      "Step 3: Enter registered email and submit -> System should send password reset email\"," +
      "\"password-reset,authentication\"";
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="test-cases-template.csv"');
    
    res.send(csvTemplate);
  });
  
  // Import test cases from CSV
  app.post("/api/projects/:projectId/test-cases/import", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const { csvData, folderId } = req.body;
      
      if (!csvData) {
        return res.status(400).json({ message: "CSV data is required" });
      }
      
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        return res.status(400).json({ message: "CSV file is empty or missing data rows" });
      }
      
      // Parse header row
      const header = lines[0].toLowerCase();
      const columns = parseCSVLine(header);
      
      // Find column indices
      const nameIndex = columns.findIndex(col => col.includes('name'));
      const typeIndex = columns.findIndex(col => col.includes('type'));
      const priorityIndex = columns.findIndex(col => col.includes('priority'));
      const statusIndex = columns.findIndex(col => col.includes('status'));
      const descriptionIndex = columns.findIndex(col => col.includes('description'));
      const preconditionsIndex = columns.findIndex(col => col.includes('preconditions'));
      const stepsIndex = columns.findIndex(col => col.includes('steps'));
      const tagsIndex = columns.findIndex(col => col.includes('tags'));
      
      // Validate that required columns are present
      if (nameIndex === -1 || stepsIndex === -1) {
        return res.status(400).json({ 
          message: "Invalid CSV format. Missing required columns: name and steps are required." 
        });
      }
      
      const importResults = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        try {
          const fields = parseCSVLine(line);
          
          // Extract data using column indices
          const name = fields[nameIndex] || "";
          const type = (fields[typeIndex] || "Functional").trim();
          const priority = (fields[priorityIndex] || "Medium").trim();
          const status = (fields[statusIndex] || "Draft").trim();
          const description = fields[descriptionIndex] || "";
          const preconditions = fields[preconditionsIndex] || "";
          const stepsStr = fields[stepsIndex] || "";
          const tagsStr = fields[tagsIndex] || "";
          
          if (!name) {
            throw new Error("Test case name is required");
          }
          
          // Parse steps
          const steps = parseSteps(stepsStr);
          
          // Parse tags
          const tags = tagsStr.split(',').map(tag => tag.trim()).filter(Boolean);
          
          // Generate test ID
          const count = await storage.getTestCaseCount(projectId);
          const testId = `TC-${(count + 1).toString().padStart(4, '0')}`;
          
          // Create test case
          await storage.createTestCase({
            name,
            type,
            priority,
            status,
            description,
            preconditions,
            tags,
            steps,
            folder_id: parseInt(folderId) || 0,
            project_id: projectId,
            created_by: req.user.id,
            test_id: testId
          });
          
          importResults.success++;
        } catch (error) {
          importResults.failed++;
          importResults.errors.push(`Row ${i}: ${error.message}`);
        }
      }
      
      res.json(importResults);
    } catch (err) {
      console.error("Import error:", err);
      res.status(500).json({ message: "Failed to import test cases" });
    }
  });
  
  // Helper function to parse CSV line properly
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i+1] === '"') {
          // Handle escaped quotes ""
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        // Normal character
        current += char;
      }
    }
    
    // Add the last field
    result.push(current);
    
    return result;
  }
  
  // Parse steps from string format
  function parseSteps(stepsStr: string): any[] {
    const steps = [];
    
    // Different formats:
    // 1. "Step 1: Action -> Expected Result | Step 2: Action -> Expected Result"
    // 2. "1. Action | Expected Result; 2. Action | Expected Result"
    
    // First, try to split by pipe & arrow
    if (stepsStr.includes('->')) {
      // Format: "Step 1: Action -> Expected Result | Step 2: Action -> Expected Result"
      const stepParts = stepsStr.split('|');
      
      for (let i = 0; i < stepParts.length; i++) {
        const stepPart = stepParts[i].trim();
        if (!stepPart) continue;
        
        const [actionPart, resultPart] = stepPart.split('->');
        if (!actionPart || !resultPart) continue;
        
        // Extract action without step number
        const action = actionPart.replace(/^Step \d+:\s*/, '').trim();
        const expected_result = resultPart.trim();
        
        steps.push({
          id: i + 1,
          action,
          expected_result
        });
      }
    } else if (stepsStr.includes('|')) {
      // Format: "1. Action | Expected Result; 2. Action | Expected Result"
      const stepParts = stepsStr.split(';');
      
      for (let i = 0; i < stepParts.length; i++) {
        const stepPart = stepParts[i].trim();
        if (!stepPart) continue;
        
        const [actionPart, resultPart] = stepPart.split('|');
        if (!actionPart || !resultPart) continue;
        
        // Extract action without step number
        const action = actionPart.replace(/^\d+\.\s*/, '').trim();
        const expected_result = resultPart.trim();
        
        steps.push({
          id: i + 1,
          action,
          expected_result
        });
      }
    }
    
    // If no steps were parsed but there's content, add it as a single step
    if (steps.length === 0 && stepsStr) {
      steps.push({
        id: 1,
        action: "Perform test actions",
        expected_result: stepsStr.trim()
      });
    }
    
    // If no steps at all, add an empty step
    if (steps.length === 0) {
      steps.push({
        id: 1,
        action: "",
        expected_result: ""
      });
    }
    
    return steps;
  }

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
