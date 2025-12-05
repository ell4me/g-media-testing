import { MongoClient, Db, Collection, Document } from 'mongodb';

import { envConfig } from '../config/env';

export class MongoDbClient {
  private static instance: MongoDbClient;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): MongoDbClient {
    if (!MongoDbClient.instance) {
      MongoDbClient.instance = new MongoDbClient();
    }
    return MongoDbClient.instance;
  }

  public async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    this.client = new MongoClient(envConfig.mongoUri);
    await this.client.connect();
    this.db = this.client.db(envConfig.mongoDbName);
    return this.db;
  }

  public getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('MongoDB is not connected');
    }
    return this.db.collection<T>(name);
  }
}
