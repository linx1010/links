CREATE TABLE "organizations" (
  "id" bigserial PRIMARY KEY,
  "name" text,
  "timezone" text,
  "created_at" timestamptz
);

CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "organization_id" bigint,
  "name" text,
  "email" text UNIQUE,
  "role" text,
  "hourly_rate" numeric,
  "active" boolean,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "clients" (
  "id" bigserial PRIMARY KEY,
  "organization_id" bigint,
  "name" text,
  "code" text UNIQUE,
  "default_currency" char(3),
  "payment_terms_days" int,
  "created_at" timestamptz
);

CREATE TABLE "projects" (
  "id" bigserial PRIMARY KEY,
  "organization_id" bigint,
  "client_id" bigint,
  "name" text,
  "code" text UNIQUE,
  "status" text,
  "budget_hours" numeric,
  "start_date" date,
  "end_date" date,
  "created_at" timestamptz
);

CREATE TABLE "tasks" (
  "id" bigserial PRIMARY KEY,
  "project_id" bigint,
  "name" text,
  "description" text,
  "status" text,
  "estimated_hours" numeric,
  "start_date" date,
  "end_date" date,
  "created_at" timestamptz
);

CREATE TABLE "time_entries" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint,
  "project_id" bigint,
  "task_id" bigint,
  "start_time" timestamptz,
  "end_time" timestamptz,
  "duration_minutes" int,
  "description" text,
  "approved" boolean,
  "created_at" timestamptz
);

CREATE TABLE "timesheets" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint,
  "week_start" date,
  "week_end" date,
  "status" text,
  "approved_by" bigint,
  "approved_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "invoices" (
  "id" bigserial PRIMARY KEY,
  "client_id" bigint,
  "organization_id" bigint,
  "issue_date" date,
  "due_date" date,
  "total_amount" numeric,
  "status" text,
  "created_at" timestamptz
);

CREATE TABLE "tags" (
  "id" bigserial PRIMARY KEY,
  "organization_id" bigint,
  "name" text
);

CREATE TABLE "time_entry_tags" (
  "time_entry_id" bigint,
  "tag_id" bigint,
  "primary" key(time_entry_id,tag_id)
);

ALTER TABLE "users" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "clients" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "projects" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "projects" ADD FOREIGN KEY ("client_id") REFERENCES "clients" ("id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "time_entries" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "time_entries" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "time_entries" ADD FOREIGN KEY ("task_id") REFERENCES "tasks" ("id");

ALTER TABLE "timesheets" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "timesheets" ADD FOREIGN KEY ("approved_by") REFERENCES "users" ("id");

ALTER TABLE "invoices" ADD FOREIGN KEY ("client_id") REFERENCES "clients" ("id");

ALTER TABLE "invoices" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "tags" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "time_entry_tags" ADD FOREIGN KEY ("time_entry_id") REFERENCES "time_entries" ("id");

ALTER TABLE "time_entry_tags" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id");
