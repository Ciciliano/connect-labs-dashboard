import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type AppClient = SupabaseClient<Database>;
type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["conversation_messages"]["Row"];

export async function listRecentConversations(
  client: AppClient,
  organizationId: string,
) {
  const { data: conversations, error: conversationsError } = await client
    .from("conversations")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (conversationsError) {
    throw conversationsError;
  }

  const conversationRows = (conversations ?? []) as ConversationRow[];
  const ids = conversationRows.map((conversation) => conversation.id);

  if (ids.length === 0) {
    return [];
  }

  const { data: messages, error: messagesError } = await client
    .from("conversation_messages")
    .select("*")
    .eq("organization_id", organizationId)
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });

  if (messagesError) {
    throw messagesError;
  }

  return conversationRows.map((conversation) => ({
    conversation,
    messages: ((messages ?? []) as MessageRow[]).filter(
      (message) => message.conversation_id === conversation.id,
    ),
  }));
}
