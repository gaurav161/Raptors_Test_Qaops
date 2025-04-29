import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  created_by: integer("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  description: true,
  created_by: true,
});

export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;

export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  user_id: integer("user_id").notNull(),
  role: text("role").notNull(),
});

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers).pick({
  workspace_id: true,
  user_id: true,
  role: true,
});

export type InsertWorkspaceMember = z.infer<typeof insertWorkspaceMemberSchema>;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  workspace_id: integer("workspace_id").notNull(),
  created_by: integer("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  workspace_id: true,
  created_by: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  project_id: integer("project_id").notNull(),
  parent_id: integer("parent_id"),
  created_by: integer("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertFolderSchema = createInsertSchema(folders).pick({
  name: true,
  project_id: true,
  parent_id: true,
  created_by: true,
});

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  test_id: text("test_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  type: text("type").notNull(),
  preconditions: text("preconditions"),
  folder_id: integer("folder_id").notNull(),
  project_id: integer("project_id").notNull(),
  steps: jsonb("steps").notNull(),
  tags: text("tags").array(),
  created_by: integer("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertTestCaseSchema = createInsertSchema(testCases).pick({
  name: true,
  description: true,
  priority: true,
  status: true,
  type: true,
  preconditions: true,
  folder_id: true,
  project_id: true,
  steps: true,
  tags: true,
  created_by: true,
  test_id: true,
});

export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCases.$inferSelect;

export const testExecutions = pgTable("test_executions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  project_id: integer("project_id").notNull(),
  created_by: integer("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  status: text("status").notNull(),
});

export const insertTestExecutionSchema = createInsertSchema(testExecutions).pick({
  name: true,
  description: true,
  project_id: true,
  created_by: true,
  status: true,
});

export type InsertTestExecution = z.infer<typeof insertTestExecutionSchema>;
export type TestExecution = typeof testExecutions.$inferSelect;

export const testExecutionItems = pgTable("test_execution_items", {
  id: serial("id").primaryKey(),
  execution_id: integer("execution_id").notNull(),
  test_case_id: integer("test_case_id").notNull(),
  assigned_to: integer("assigned_to"),
  status: text("status").notNull(),
  result: text("result"),
  comments: text("comments"),
  executed_by: integer("executed_by"),
  executed_at: timestamp("executed_at"),
});

export const insertTestExecutionItemSchema = createInsertSchema(testExecutionItems).pick({
  execution_id: true,
  test_case_id: true,
  assigned_to: true,
  status: true,
});

export type InsertTestExecutionItem = z.infer<typeof insertTestExecutionItemSchema>;
export type TestExecutionItem = typeof testExecutionItems.$inferSelect;
