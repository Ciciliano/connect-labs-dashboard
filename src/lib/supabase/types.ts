export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          plan: string;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: Partial<{
          created_at: string;
          id: string;
          name: string;
          plan: string;
          slug: string;
          status: string;
          updated_at: string;
        }>;
        Update: Partial<{
          created_at: string;
          id: string;
          name: string;
          plan: string;
          slug: string;
          status: string;
          updated_at: string;
        }>;
      };
      organization_members: {
        Row: {
          created_at: string;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Insert: Partial<{
          created_at: string;
          organization_id: string;
          role: string;
          user_id: string;
        }>;
        Update: Partial<{
          created_at: string;
          organization_id: string;
          role: string;
          user_id: string;
        }>;
      };
      hermes_agents: {
        Row: {
          active_version_id: string | null;
          channel_owner: string | null;
          created_at: string;
          id: string;
          legacy_profile_name: string | null;
          legacy_state: string;
          metadata: Json;
          model_target: string | null;
          model_tier: string;
          name: string;
          organization_id: string;
          plan: string;
          role: string;
          slug: string;
          status: string;
          temperature: number;
          tone: string | null;
          updated_at: string;
        };
        Insert: Partial<{
          active_version_id: string | null;
          channel_owner: string | null;
          created_at: string;
          id: string;
          legacy_profile_name: string | null;
          legacy_state: string;
          metadata: Json;
          model_target: string | null;
          model_tier: string;
          name: string;
          organization_id: string;
          plan: string;
          role: string;
          slug: string;
          status: string;
          temperature: number;
          tone: string | null;
          updated_at: string;
        }>;
        Update: Partial<{
          channel_owner: string | null;
          legacy_profile_name: string | null;
          legacy_state: string;
          model_target: string | null;
          model_tier: string;
          name: string;
          role: string;
          status: string;
          temperature: number;
          tone: string | null;
          active_version_id: string | null;
        }>;
      };
      hermes_agent_versions: {
        Row: {
          agent_id: string;
          change_reason: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          organization_id: string;
          prompt_summary: string | null;
          system_prompt: string;
          version_number: number;
        };
        Insert: {
          agent_id: string;
          change_reason?: string | null;
          created_by?: string | null;
          organization_id: string;
          prompt_summary?: string | null;
          system_prompt: string;
          version_number: number;
        };
        Update: Partial<{
          agent_id: string;
          change_reason: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          organization_id: string;
          prompt_summary: string | null;
          system_prompt: string;
          version_number: number;
        }>;
      };
      agent_tool_settings: {
        Row: {
          agent_id: string;
          created_at: string;
          executor_type: string;
          id: string;
          n8n_webhook_url: string | null;
          organization_id: string;
          status: string;
          tools_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          agent_id: string;
          executor_type?: string;
          n8n_webhook_url?: string | null;
          organization_id: string;
          status?: string;
          tools_enabled?: boolean;
        };
        Update: Partial<{
          agent_id: string;
          executor_type: string;
          n8n_webhook_url: string | null;
          organization_id: string;
          status: string;
          tools_enabled: boolean;
        }>;
      };
      agent_tool_permissions: {
        Row: {
          agent_id: string;
          created_at: string;
          enabled: boolean;
          id: string;
          organization_id: string;
          requires_approval: boolean;
          risk_level: string;
          tool_name: string;
          updated_at: string;
        };
        Insert: {
          agent_id: string;
          enabled?: boolean;
          organization_id: string;
          requires_approval?: boolean;
          risk_level?: string;
          tool_name: string;
        };
        Update: Partial<{
          agent_id: string;
          enabled: boolean;
          organization_id: string;
          requires_approval: boolean;
          risk_level: string;
          tool_name: string;
        }>;
      };
      agent_memory_facts: {
        Row: {
          agent_id: string | null;
          confidence: number;
          content: string;
          created_at: string;
          fact_type: string;
          id: string;
          lead_id: string | null;
          organization_id: string;
          source_message_id: string | null;
          source_path: string | null;
          source_profile: string | null;
          status: string;
          subject: string;
          supersedes_fact_id: string | null;
          updated_at: string;
        };
        Insert: Partial<{
          agent_id: string | null;
          confidence: number;
          content: string;
          created_at: string;
          fact_type: string;
          id: string;
          lead_id: string | null;
          organization_id: string;
          source_message_id: string | null;
          source_path: string | null;
          source_profile: string | null;
          status: string;
          subject: string;
          supersedes_fact_id: string | null;
          updated_at: string;
        }>;
        Update: Partial<{
          agent_id: string | null;
          confidence: number;
          content: string;
          created_at: string;
          fact_type: string;
          id: string;
          lead_id: string | null;
          organization_id: string;
          source_message_id: string | null;
          source_path: string | null;
          source_profile: string | null;
          status: string;
          subject: string;
          supersedes_fact_id: string | null;
          updated_at: string;
        }>;
      };
      human_handoffs: {
        Row: {
          agent_id: string | null;
          assigned_to: string | null;
          closed_at: string | null;
          conversation_id: string;
          id: string;
          opened_at: string;
          organization_id: string;
          reason: string;
          resume_strategy: string;
          status: string;
        };
        Insert: Partial<{
          agent_id: string | null;
          assigned_to: string | null;
          closed_at: string | null;
          conversation_id: string;
          id: string;
          opened_at: string;
          organization_id: string;
          reason: string;
          resume_strategy: string;
          status: string;
        }>;
        Update: Partial<{
          agent_id: string | null;
          assigned_to: string | null;
          closed_at: string | null;
          conversation_id: string;
          id: string;
          opened_at: string;
          organization_id: string;
          reason: string;
          resume_strategy: string;
          status: string;
        }>;
      };
      agent_tasks: {
        Row: {
          agent_id: string | null;
          approved_at: string | null;
          approved_by: string | null;
          conversation_id: string | null;
          created_at: string;
          due_at: string;
          id: string;
          last_error: string | null;
          organization_id: string;
          requires_approval: boolean;
          risk_level: string;
          status: string;
          task_type: string;
          title: string;
          updated_at: string;
        };
        Insert: Partial<{
          agent_id: string | null;
          approved_at: string | null;
          approved_by: string | null;
          conversation_id: string | null;
          created_at: string;
          due_at: string;
          id: string;
          last_error: string | null;
          organization_id: string;
          requires_approval: boolean;
          risk_level: string;
          status: string;
          task_type: string;
          title: string;
          updated_at: string;
        }>;
        Update: Partial<{
          agent_id: string | null;
          approved_at: string | null;
          approved_by: string | null;
          conversation_id: string | null;
          created_at: string;
          due_at: string;
          id: string;
          last_error: string | null;
          organization_id: string;
          requires_approval: boolean;
          risk_level: string;
          status: string;
          task_type: string;
          title: string;
          updated_at: string;
        }>;
      };
      agent_task_runs: {
        Row: {
          error: string | null;
          finished_at: string | null;
          id: string;
          organization_id: string;
          result: Json;
          started_at: string;
          status: string;
          task_id: string;
        };
        Insert: Partial<{
          error: string | null;
          finished_at: string | null;
          id: string;
          organization_id: string;
          result: Json;
          started_at: string;
          status: string;
          task_id: string;
        }>;
        Update: Partial<{
          error: string | null;
          finished_at: string | null;
          id: string;
          organization_id: string;
          result: Json;
          started_at: string;
          status: string;
          task_id: string;
        }>;
      };
      conversations: {
        Row: {
          agent_id: string | null;
          channel: string;
          conversation_id: string;
          created_at: string;
          engine_version: string;
          human_override_until: string | null;
          id: string;
          intent: string | null;
          last_message: string | null;
          last_message_at: string | null;
          lead_id: string | null;
          organization_id: string | null;
          sentiment: string | null;
          status: string;
          summary: string | null;
          updated_at: string;
        };
        Insert: Partial<{
          agent_id: string | null;
          channel: string;
          conversation_id: string;
          created_at: string;
          engine_version: string;
          human_override_until: string | null;
          id: string;
          intent: string | null;
          last_message: string | null;
          last_message_at: string | null;
          lead_id: string | null;
          organization_id: string | null;
          sentiment: string | null;
          status: string;
          summary: string | null;
          updated_at: string;
        }>;
        Update: Partial<{
          agent_id: string | null;
          channel: string;
          conversation_id: string;
          created_at: string;
          engine_version: string;
          human_override_until: string | null;
          id: string;
          intent: string | null;
          last_message: string | null;
          last_message_at: string | null;
          lead_id: string | null;
          organization_id: string | null;
          sentiment: string | null;
          status: string;
          summary: string | null;
          updated_at: string;
        }>;
      };
      conversation_messages: {
        Row: {
          agent_id: string | null;
          channel: string;
          content: string | null;
          conversation_id: string;
          created_at: string;
          direction: string;
          id: string;
          lead_id: string | null;
          model_tier: string | null;
          organization_id: string;
          role: string;
        };
        Insert: Partial<{
          agent_id: string | null;
          channel: string;
          content: string | null;
          conversation_id: string;
          created_at: string;
          direction: string;
          id: string;
          lead_id: string | null;
          model_tier: string | null;
          organization_id: string;
          role: string;
        }>;
        Update: Partial<{
          agent_id: string | null;
          channel: string;
          content: string | null;
          conversation_id: string;
          created_at: string;
          direction: string;
          id: string;
          lead_id: string | null;
          model_tier: string | null;
          organization_id: string;
          role: string;
        }>;
      };
    };
  };
};
