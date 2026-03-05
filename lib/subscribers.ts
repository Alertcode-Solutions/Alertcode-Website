import { db } from "@/lib/db";

export type Subscriber = {
  id: string;
  email: string;
  createdAt: Date;
};

type SubscriberRecord = {
  id: string;
  email: string;
  createdAt: Date;
};

function mapSubscriber(record: SubscriberRecord): Subscriber {
  return {
    id: record.id,
    email: record.email,
    createdAt: record.createdAt,
  };
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const subscribers = await db.subscriber.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscribers.map(mapSubscriber);
}

export async function subscribeEmail(email: string): Promise<Subscriber> {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.subscriber.findUnique({
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
    where: {
      email: normalizedEmail,
    },
  });

  if (existing) {
    return mapSubscriber(existing);
  }

  const created = await db.subscriber.create({
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
    data: {
      email: normalizedEmail,
    },
  });

  return mapSubscriber(created);
}

