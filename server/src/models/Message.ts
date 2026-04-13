/**
 * Message Model — Firestore Implementation
 *
 * Represents a single message within a conversation. Messages can be from
 * the user, the assistant (AI), or system-generated. Token usage and
 * optional search results (from Tavily) are stored for auditing.
 */

import { collections, getDb } from '../config/database';

export interface ITokensUsed {
  input: number;
  output: number;
}

export interface ISearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: ITokensUsed;
  searchResults?: ISearchResult[];
  createdAt: Date;
  updatedAt: Date;
}

function docToMessage(id: string, data: FirebaseFirestore.DocumentData): any {
  return {
    id,
    _id: id,
    conversationId: data.conversationId || '',
    role: data.role || 'user',
    content: data.content || '',
    tokensUsed: data.tokensUsed,
    searchResults: data.searchResults,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

export const Message = {
  async create(data: Partial<IMessage>): Promise<any> {
    const now = new Date();
    const msgData = {
      conversationId: data.conversationId || '',
      role: data.role || 'user',
      content: data.content || '',
      tokensUsed: data.tokensUsed || null,
      searchResults: data.searchResults || null,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await collections.messages().add(msgData);
    const doc = await docRef.get();
    return docToMessage(docRef.id, doc.data()!);
  },

  find(query: Record<string, any>): any {
    let q: FirebaseFirestore.Query = collections.messages();
    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, '==', value);
    }
    const results = {
      _query: q,
      _sortField: 'createdAt',
      _sortDir: 'asc' as 'asc' | 'desc',
      _limitNum: 1000,
      _skipNum: 0,
      sort(s: Record<string, any>) { const k = Object.keys(s)[0]; this._sortField = k; this._sortDir = s[k] === -1 ? 'desc' : 'asc'; return this; },
      limit(n: number) { this._limitNum = n; return this; },
      skip(n: number) { this._skipNum = n; return this; },
      async lean() { return this.exec(); },
      async exec() {
        // Fetch without orderBy to avoid composite index requirements
        const snapshot = await this._query.get();
        let results = snapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => docToMessage(d.id, d.data()));
        const field = this._sortField;
        const dir = this._sortDir;
        results.sort((a: any, b: any) => {
          const aVal = a[field] instanceof Date ? a[field].getTime() : a[field];
          const bVal = b[field] instanceof Date ? b[field].getTime() : b[field];
          return dir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        if (this._limitNum < results.length) results = results.slice(0, this._limitNum);
        return results;
      },
      then(resolve: any, reject: any) { return this.exec().then(resolve, reject); },
    };
    return results;
  },

  async findByIdAndUpdate(id: string, update: Record<string, any>): Promise<any | null> {
    const docRef = collections.messages().doc(id);
    const flatUpdate: Record<string, any> = {};
    if (update.$set) Object.assign(flatUpdate, update.$set);
    for (const [key, val] of Object.entries(update)) {
      if (!key.startsWith('$')) flatUpdate[key] = val;
    }
    flatUpdate.updatedAt = new Date();
    await docRef.update(flatUpdate);
    const doc = await docRef.get();
    return doc.exists ? docToMessage(doc.id, doc.data()!) : null;
  },

  async deleteMany(query: Record<string, any>): Promise<void> {
    let q: FirebaseFirestore.Query = collections.messages();
    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, '==', value);
    }
    const snapshot = await q.get();
    const batch = getDb().batch();
    snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(doc.ref));
    if (snapshot.docs.length > 0) await batch.commit();
  },

  async countDocuments(query: Record<string, any>): Promise<number> {
    let q: FirebaseFirestore.Query = collections.messages();
    for (const [key, value] of Object.entries(query)) {
      q = q.where(key, '==', value);
    }
    const snapshot = await q.count().get();
    return snapshot.data().count;
  },
};
