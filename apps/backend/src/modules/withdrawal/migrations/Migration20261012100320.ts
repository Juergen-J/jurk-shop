import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261012100320 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "withdrawal" ("id" text not null, "name" text not null, "email" text not null, "order_number" text not null, "items" text null, "order_id" text null, "locale" text not null default 'de', "status" text check ("status" in ('received', 'processed')) not null default 'received', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "withdrawal_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_withdrawal_deleted_at" ON "withdrawal" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "withdrawal" cascade;`);
  }

}
