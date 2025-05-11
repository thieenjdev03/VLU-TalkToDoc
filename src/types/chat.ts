// ----------------------------------------------------------------------

export type IChatAttachment = {
  name: string;
  size: number;
  type: string;
  path: string;
  preview: string;
  createdAt: Date;
  modifiedAt: Date;
};

export interface IChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type IChatParticipant = {
  id: string;
  name: string;
  role: string;
  email: string;
  address: string;
  avatarUrl: string;
  phoneNumber: string;
  lastActivity: Date;
  status: 'online' | 'offline' | 'alway' | 'busy';
};

export interface IChatConversation {
  _id: string;
  messages: IChatMessage[];
  user_id: string;
}

export type IChatConversations = {
  byId: Record<string, IChatConversation>;
  allIds: string[];
};

export interface IChatResponse {
  reply: string;
  messages: IChatMessage[];
}
