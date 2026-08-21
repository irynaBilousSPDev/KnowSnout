import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'knowsnout.support_tickets.v1';

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  email: string;
  createdAt: string;
};

async function readAll(): Promise<SupportTicket[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SupportTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function submitSupportTicket(input: {
  subject: string;
  message: string;
  email: string;
}): Promise<SupportTicket> {
  const ticket: SupportTicket = {
    id: `sup-${Date.now()}`,
    subject: input.subject.trim(),
    message: input.message.trim(),
    email: input.email.trim(),
    createdAt: new Date().toISOString(),
  };
  const prev = await readAll();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify([ticket, ...prev].slice(0, 50)),
  );
  return ticket;
}
