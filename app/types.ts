type BaseChatRoom = {
  roomId: string;
  members: string[];
  createdAt: Date;
};

export type PrivateChatRoom = BaseChatRoom & {
  type: "private";
};

export type GroupChatRoom = BaseChatRoom & {
  type: "group";
  name: string;
  groupImage: string;
  createdBy: string;
};

export type ChatRoomType = PrivateChatRoom | GroupChatRoom;
