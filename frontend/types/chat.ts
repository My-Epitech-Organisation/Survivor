import { User } from "./user";

export interface Thread {
	"id":	number,
	"participants":	User[],
	"created_at":	string,
	"last_message_at":	string,
	"last_message":	string,
	"unread_count": string
}