import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
	GET_HTML(): { payload: string; doctype: string; userAgent: string };
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
