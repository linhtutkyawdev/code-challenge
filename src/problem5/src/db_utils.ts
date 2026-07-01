import Database from "better-sqlite3";

const instance = new Database("code-challenge.db");

export function query<T = unknown>(sql: string, params: unknown[] = []) {
  return instance.prepare(sql).all(...params) as T[];
}

export function queryOne<T = unknown>(sql: string, params: unknown[] = []) {
  return instance.prepare(sql).get(...params) as T;
}

export function execute(sql: string, params: unknown[] = []) {
  return instance.prepare(sql).run(...params);
}

export function exec(sql: string) {
  instance.exec(sql);
}