import { Timestamp } from "firebase/firestore";
type BaseChatRoom = {
  chatRoomId: string;
  members: string[];
  createdAt: Timestamp;
  imageUrl: string;
  name: string;
  createdBy: string;
  lastMessage: MessageType;
};

export type PrivateChatRoom = BaseChatRoom & {
  type: "private";
};

export type GroupChatRoom = BaseChatRoom & {
  type: "group";
};
export type UserType = {
  userId: string;
  username: string;
  profileUrl: string;
};
export type MessageType = {
  createdAt: Timestamp;
  profileUrl: string;
  senderName: string;
  text: string;
  userId: string;
  seenBy: string[];
};
export type ChatRoomType = PrivateChatRoom | GroupChatRoom;
