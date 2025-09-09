import { Investor } from "./investor";
import { User } from "./user";


export interface Sender {
	id: number,
	name: string,
	email: string,
}

export interface MessageReceive {
  id: string;
  body: string;
  sender: Sender;
  created_at: string;
  userID: number;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  userID: number;
}

export interface Thread {
	id:	number,
	participants: User[],
	created_at:	string,
	created: boolean,
	last_message_at: string,
	last_message: MessageReceive,
	unread_count: string
}

export interface ThreadDetails {
	id:	number,
	participants: User[],
	created: boolean,
	created_at:	string,
	last_message_at:	string,
	messages: MessageReceive[],
	unread_count: string
}
