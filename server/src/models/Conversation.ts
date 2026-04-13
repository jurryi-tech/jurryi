/**
 * Conversation Model — Firestore Implementation
 *
 * Represents a chat conversation between a user and the LegalSahay assistant.
 * Tracks the conversation's category, jurisdiction details, status, and
 * any legal context extracted during the conversation.
 */

import { collections, getDb } from '../config/database';

export interface IJurisdiction {
  state?: string;
  district?: string;
  courtType?: string;
}

export interface IExtractedContext {
  sections: string[];
  acts: string[];
  documentTypesNeeded: string[];
  keyFacts: string[];
}

export interface IConversation {
  id: string;
  userId: string;
  title: string;
  category: string;
  jurisdiction: IJurisdiction;
  status: 'active' | 'resolved' | 'archived';
  summary: string;
  extractedContext: IExtractedContext;
  createdAt: Date;
  updatedAt: Date;
}

function docToConversation(id: string, data: FirebaseFirestore.DocumentData): any {
  return {
    id,
    _id: id,
    userId: data.userId || '',
    title: data.title || 'New Conversation',
    category: data.category || '',
    jurisdiction: data.jurisdiction || {},
    status: data.status || 'active',
    summary: data.summary || '',
    extractedContext: data.extractedContext || { sections: [], acts: [], documentTypesNeeded: [], keyFacts: [] },
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

export const Conversation = {
  async create(data: Partial<IConversation>): Promise<any> {
    const now = new Date();
    const convData = {
      userId: data.userId || '',
      title: data.title || 'New Conversation',
      category: data.category || '',
      jurisdiction: data.jurisdiction || {},
      status: data.status || 'active',
      summary: data.summary || '',
      extractedContext: data.extractedContext || { sections: [], acts: [], documentTypesNeeded: [], keyFacts: [] },
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await collections.conversations().add(convData);
    const doc = await docRef.get();
    return docToConversation(docRef.id, doc.data()!);
  },

  find(query: Record<string, any>): any {
    let q: FirebaseFirestore.Query = collections.conversations();
    for (const [key, value] of Object.entries(query)) {
      if (key === 'conversationId') continue;
      q = q.where(key, '==', value);
    }
    // Return a chainable object that mimics Mongoose's query builder
    const results = {
      _query: q,
      _selectFields: null as string[] | null,
      _sortField: 'updatedAt',
      _sortDir: 'desc' as 'asc' | 'desc',
      _limitNum: 1000,
      select(fields: string) { this._selectFields = fields.split(' '); return this; },
      sort(s: Record<string, any>) { const k = Object.keys(s)[0]; this._sortField = k; this._sortDir = s[k] === -1 ? 'desc' : 'asc'; return this; },
      limit(n: number) { this._limitNum = n; return this; },
      async lean() { return this.exec(); },
      async exec() {
        const snapshot = await this._query.orderBy(this._sortField, this._sortDir).limit(this._limitNum).get();
        return snapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => docToConversation(d.id, d.data()));
      },
      then(resolve: any, reject: any) { return this.exec().then(resolve, reject); },
    };
    return results;
  },

  async findOne(query: Record<string, any>): Promise<any | null> {
    if (query._id) {
      const doc = await collections.conversations().doc(String(query._id)).get();
      if (!doc.exists) return null;
      const conv = docToConversation(doc.id, doc.data()!);
      // Check additional query params
      for (const [key, value] of Object.entries(query)) {
        if (key === '_id') continue;
        if ((conv as any)[key] !== value) return null;
      }
      return conv;
    }
    let q: FirebaseFirestore.Query = collections.conversations();
    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, '==', value);
    }
    const snapshot = await q.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return docToConversation(doc.id, doc.data());
  },

  async findById(id: string): Promise<any | null> {
    const doc = await collections.conversations().doc(id).get();
    if (!doc.exists) return null;
    return docToConversation(doc.id, doc.data()!);
  },

  async findByIdAndUpdate(id: string, update: Record<string, any>): Promise<any | null> {
    const docRef = collections.conversations().doc(id);
    const flatUpdate: Record<string, any> = {};
    if (update.$set) Object.assign(flatUpdate, update.$set);
    for (const [key, val] of Object.entries(update)) {
      if (!key.startsWith('$')) flatUpdate[key] = val;
    }
    flatUpdate.updatedAt = new Date();
    await docRef.update(flatUpdate);
    const doc = await docRef.get();
    return doc.exists ? docToConversation(doc.id, doc.data()!) : null;
  },

  async findOneAndDelete(query: Record<string, any>): Promise<any | null> {
    const conv = await this.findOne(query);
    if (!conv) return null;
    await collections.conversations().doc(conv.id || conv._id).delete();
    return conv;
  },

  async deleteMany(query: Record<string, any>): Promise<void> {
    let q: FirebaseFirestore.Query = collections.conversations();
    for (const [key, value] of Object.entries(query)) {
      if (key === 'conversationId') continue;
      q = q.where(key, '==', value);
    }
    const snapshot = await q.get();
    const batch = getDb().batch();
    snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(doc.ref));
    if (snapshot.docs.length > 0) await batch.commit();
  },

  async countDocuments(query: Record<string, any>): Promise<number> {
    let q: FirebaseFirestore.Query = collections.conversations();
    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, '==', value);
    }
    const snapshot = await q.count().get();
    return snapshot.data().count;
  },
};
