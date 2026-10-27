This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where comments have been removed.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
zaya-usage-web-main/
  backend/
    alembic/
      versions/
        001_initial.py
        002_user_assistants.py
        003_client_visible.py
        004_billing.py
        005_fee_note.py
        006_session_breakdown.py
        007_assistant_display_name.py
        008_canonical_clinic_names.py
      env.py
      script.py.mako
    app/
      jobs/
        __init__.py
        seed_production.py
        sync.py
        users.py
      routers/
        __init__.py
        admin.py
        auth.py
        dashboard.py
        jobs.py
      services/
        __init__.py
        accounts.py
        assistants.py
        billing.py
        export.py
        metrics.py
        production_seed.py
        seed.py
        sessions.py
        sync.py
        windows.py
      telnyx/
        __init__.py
        client.py
        fixtures.py
        limiter.py
        parse.py
      __init__.py
      config.py
      db.py
      deps.py
      main.py
      models.py
      production.py
      security.py
    tests/
      conftest.py
      test_assistants.py
      test_billing.py
      test_live_refresh.py
      test_parse.py
      test_production.py
      test_rate_limit.py
      test_sessions.py
      test_sync_api.py
    .dockerignore
    alembic.ini
    Dockerfile
    pytest.ini
    requirements.txt
    run-api.sh
    run-sync.sh
  docs/
    deploy.md
    telnyx-integration.md
  frontend/
    e2e/
      dashboard.spec.ts
    public/
      file.svg
      globe.svg
      next.svg
      vercel.svg
      window.svg
    src/
      app/
        admin/
          page.tsx
        backend/
          [...path]/
            route.ts
        login/
          page.tsx
        favicon.ico
        globals.css
        layout.tsx
        page.tsx
      components/
        ui/
          badge.tsx
          button.tsx
          card.tsx
          input.tsx
          label.tsx
          separator.tsx
          table.tsx
        call-log.tsx
        dashboard.tsx
        ready.tsx
      lib/
        api.ts
        format.test.ts
        format.ts
        login-fields.test.ts
        login-fields.ts
        types.ts
        utils.ts
      proxy.ts
    .dockerignore
    .gitignore
    components.json
    Dockerfile
    eslint.config.mjs
    next.config.ts
    package.json
    playwright.config.ts
    postcss.config.mjs
    README.md
    tsconfig.json
    vitest.config.ts
  scripts/
    inspect_telnyx.py
  .env.example
  .gitignore
  docker-compose.yml
  README.md
````

# Files

## File: zaya-usage-web-main/backend/alembic/versions/001_initial.py
````python
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "clients",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(300), nullable=False),
        sa.Column("role", sa.String(32), nullable=False),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE")),
        sa.Column("failed_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("locked_until", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("csrf_token", sa.String(128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "clinics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(40), nullable=False),
        sa.UniqueConstraint("client_id", "code", name="uq_clinic_client_code"),
    )
    op.create_table(
        "assistants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False),
        sa.Column("telnyx_assistant_id", sa.String(200), nullable=False, unique=True),
        sa.Column("name", sa.String(200), nullable=False),
    )
    op.create_table(
        "resources",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id", ondelete="CASCADE")),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column("telnyx_id", sa.String(200), nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
        sa.UniqueConstraint("kind", "telnyx_id", name="uq_resource_kind_telnyx"),
    )
    op.create_table(
        "calls",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False),
        sa.Column("assistant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("assistants.id", ondelete="SET NULL")),
        sa.Column("telnyx_conversation_id", sa.String(80), nullable=False, unique=True),
        sa.Column("telnyx_call_control_id", sa.String(200)),
        sa.Column("telnyx_call_session_id", sa.String(80)),
        sa.Column("telnyx_call_leg_id", sa.String(80)),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_sec", sa.Integer()),
        sa.Column("direction", sa.String(32)),
        sa.Column("masked_caller", sa.String(32)),
        sa.Column("channel", sa.String(40), nullable=False),
        sa.Column("session_cost_total", sa.Numeric(14, 6)),
        sa.Column("session_currency", sa.String(8)),
        sa.Column("cost_status", sa.String(20), nullable=False),
        sa.Column("recorded_cost", sa.Numeric(14, 6)),
        sa.Column("currency", sa.String(8)),
    )
    op.create_index("ix_calls_client_id", "calls", ["client_id"])
    op.create_index("ix_calls_clinic_id", "calls", ["clinic_id"])
    op.create_index("ix_calls_started_at", "calls", ["started_at"])
    op.create_index("ix_calls_session", "calls", ["telnyx_call_session_id"])
    op.create_table(
        "charges",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("calls.id", ondelete="CASCADE")),
        sa.Column("service", sa.String(80), nullable=False),
        sa.Column("telnyx_record_id", sa.String(80), nullable=False),
        sa.Column("source_name", sa.String(80)),
        sa.Column("amount", sa.Numeric(14, 6)),
        sa.Column("currency", sa.String(8)),
        sa.Column("billed_duration_sec", sa.Integer()),
        sa.Column("rate", sa.Numeric(14, 6)),
        sa.Column("rate_unit", sa.String(40)),
        sa.Column("occurred_at", sa.DateTime(timezone=True)),
        sa.Column("cost_status", sa.String(20), nullable=False),
        sa.UniqueConstraint("service", "telnyx_record_id", name="uq_charges_service_record"),
    )
    op.create_index("ix_charges_client_id", "charges", ["client_id"])
    op.create_index("ix_charges_call_id", "charges", ["call_id"])
    op.create_index("ix_charges_occurred_at", "charges", ["occurred_at"])
    op.create_table(
        "usage_totals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product", sa.String(80), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("currency", sa.String(8), nullable=False),
        sa.Column("telnyx_cost", sa.Numeric(14, 6)),
        sa.Column("telnyx_billed_sec", sa.Numeric(18, 4)),
        sa.Column("telnyx_call_sec", sa.Numeric(18, 4)),
        sa.Column("available", sa.Boolean(), nullable=False),
        sa.UniqueConstraint("product", "window_start", "window_end", "currency", name="uq_usage_window"),
    )
    op.create_table(
        "reconciliations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product", sa.String(80), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("currency", sa.String(8), nullable=False),
        sa.Column("telnyx_cost", sa.Numeric(14, 6)),
        sa.Column("local_priced_cost", sa.Numeric(14, 6)),
        sa.Column("pending_charge_count", sa.Integer(), nullable=False),
        sa.Column("delta", sa.Numeric(14, 6)),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.UniqueConstraint("product", "window_start", "window_end", "currency", name="uq_recon_window"),
    )
    op.create_table(
        "sync_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("mode", sa.String(20), nullable=False),
        sa.Column("error", sa.Text()),
        sa.Column("stats", postgresql.JSONB(), nullable=False),
    )


def downgrade() -> None:
    for name in (
        "sync_runs",
        "reconciliations",
        "usage_totals",
        "charges",
        "calls",
        "resources",
        "assistants",
        "clinics",
        "sessions",
        "users",
        "clients",
    ):
        op.drop_table(name)
````

## File: zaya-usage-web-main/backend/alembic/versions/002_user_assistants.py
````python
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "002_user_assistants"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_assistants",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column(
            "assistant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("assistants.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )


def downgrade() -> None:
    op.drop_table("user_assistants")
````

## File: zaya-usage-web-main/backend/alembic/versions/003_client_visible.py
````python
import sqlalchemy as sa
from alembic import op

revision = "003_client_visible"
down_revision = "002_user_assistants"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "assistants",
        sa.Column("client_visible", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column("assistants", "client_visible")
````

## File: zaya-usage-web-main/backend/alembic/versions/004_billing.py
````python
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "004_billing"
down_revision = "003_client_visible"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "number_fees",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("resources.id", ondelete="CASCADE"), nullable=False),
        sa.Column("assistant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("assistants.id", ondelete="SET NULL")),
        sa.Column("monthly_amount", sa.Numeric(14, 6), nullable=False),
        sa.Column("currency", sa.String(8), nullable=False, server_default="USD"),
        sa.Column("effective_on", sa.Date(), nullable=False),
        sa.Column("proration", sa.String(20), nullable=False, server_default="full_month"),
        sa.UniqueConstraint("resource_id", "effective_on", name="uq_number_fee_effective"),
    )
    op.create_index("ix_number_fees_resource_id", "number_fees", ["resource_id"])
    op.add_column(
        "charges",
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id", ondelete="SET NULL")),
    )
    op.add_column("charges", sa.Column("allocation_method", sa.String(20)))
    op.create_index("ix_charges_clinic_id", "charges", ["clinic_id"])
    op.alter_column("charges", "telnyx_record_id", type_=sa.String(160), existing_type=sa.String(80))


def downgrade() -> None:
    op.alter_column("charges", "telnyx_record_id", type_=sa.String(80), existing_type=sa.String(160))
    op.drop_index("ix_charges_clinic_id", table_name="charges")
    op.drop_column("charges", "allocation_method")
    op.drop_column("charges", "clinic_id")
    op.drop_index("ix_number_fees_resource_id", table_name="number_fees")
    op.drop_table("number_fees")
````

## File: zaya-usage-web-main/backend/alembic/versions/005_fee_note.py
````python
import sqlalchemy as sa
from alembic import op

revision = "005_fee_note"
down_revision = "004_billing"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("number_fees", sa.Column("note", sa.String(200)))


def downgrade() -> None:
    op.drop_column("number_fees", "note")
````

## File: zaya-usage-web-main/backend/alembic/versions/006_session_breakdown.py
````python
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "006_session_breakdown"
down_revision = "005_fee_note"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("calls", sa.Column("session_breakdown", JSONB))
    op.add_column("calls", sa.Column("session_status", sa.String(20)))
    op.add_column("calls", sa.Column("session_fetched_at", sa.DateTime(timezone=True)))


def downgrade() -> None:
    op.drop_column("calls", "session_fetched_at")
    op.drop_column("calls", "session_status")
    op.drop_column("calls", "session_breakdown")
````

## File: zaya-usage-web-main/backend/alembic/versions/007_assistant_display_name.py
````python
import sqlalchemy as sa
from alembic import op

revision = "007_assistant_display_name"
down_revision = "006_session_breakdown"
branch_labels = None
depends_on = None

NAMES = {
    "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac": "Houston Foot and Ankle Care",
    "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a": "Family Medicine MMC",
    "assistant-f3cf8aea-7c8e-451a-b577-19b828f86156": "AGP Family Health Clinic",
}


def upgrade() -> None:
    op.add_column("assistants", sa.Column("display_name", sa.String(200)))
    table = sa.table("assistants", sa.column("telnyx_assistant_id", sa.String), sa.column("display_name", sa.String))
    for telnyx_id, label in NAMES.items():
        op.execute(table.update().where(table.c.telnyx_assistant_id == telnyx_id).values(display_name=label))


def downgrade() -> None:
    op.drop_column("assistants", "display_name")
````

## File: zaya-usage-web-main/backend/alembic/versions/008_canonical_clinic_names.py
````python
import sqlalchemy as sa
from alembic import op

revision = "008_canonical_clinic_names"
down_revision = "007_assistant_display_name"
branch_labels = None
depends_on = None

CLIENTS = {
    "hfaac": "Houston Foot and Ankle Care",
    "mmc": "Family Medicine MMC",
    "agp": "AGP Family Health Clinic",
}
ASSISTANTS = {
    "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac": "Houston Foot and Ankle Care",
    "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a": "Family Medicine MMC",
    "assistant-f3cf8aea-7c8e-451a-b577-19b828f86156": "AGP Family Health Clinic",
}


def upgrade() -> None:
    clients = sa.table("clients", sa.column("slug", sa.String), sa.column("name", sa.String))
    for slug, name in CLIENTS.items():
        op.execute(clients.update().where(clients.c.slug == slug).values(name=name))
    assistants = sa.table("assistants", sa.column("telnyx_assistant_id", sa.String), sa.column("display_name", sa.String))
    for telnyx_id, label in ASSISTANTS.items():
        op.execute(assistants.update().where(assistants.c.telnyx_assistant_id == telnyx_id).values(display_name=label))


def downgrade() -> None:
    pass
````

## File: zaya-usage-web-main/backend/alembic/env.py
````python
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.models import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _url() -> str:
    return os.environ.get("DATABASE_URL") or config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    context.configure(url=_url(), target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    section = config.get_section(config.config_ini_section) or {}
    section["sqlalchemy.url"] = _url()
    connectable = engine_from_config(section, prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
````

## File: zaya-usage-web-main/backend/alembic/script.py.mako
````
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
````

## File: zaya-usage-web-main/backend/app/jobs/__init__.py
````python

````

## File: zaya-usage-web-main/backend/app/jobs/seed_production.py
````python
from app.db import SessionLocal
from app.services.production_seed import seed_production


def main() -> None:
    db = SessionLocal()
    try:
        seed_production(db)
    finally:
        db.close()
    print("Production clinics are mapped. No users were created.")
    print("Create logins with: python -m app.jobs.users")


if __name__ == "__main__":
    main()
````

## File: zaya-usage-web-main/backend/app/jobs/sync.py
````python
import argparse

from app.config import get_settings
from app.db import SessionLocal
from app.services.seed import seed_demo
from app.services.sync import sync_window
from app.services.windows import default_sync_windows, month_window
from app.telnyx.client import build_source


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync Telnyx usage into Postgres")
    parser.add_argument("--month", help="YYYY-MM. Defaults to the previous and current UTC months.")
    args = parser.parse_args()
    settings = get_settings()
    db = SessionLocal()
    try:
        if settings.seed_demo:
            seed_demo(db)
        source = build_source(settings.telnyx_mode, settings.telnyx_api_key, settings.telnyx_base_url)
        windows = [month_window(args.month)] if args.month else default_sync_windows()
        for start, end in windows:
            run = sync_window(db, source, start, end)
            print(f"{run.status} {start.date()}..{end.date()} {run.error or ''}")
            if run.status != "succeeded":
                raise SystemExit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
````

## File: zaya-usage-web-main/backend/app/jobs/users.py
````python
import getpass
import json
import os
import sys

from app.db import SessionLocal
from app.services.accounts import create_accounts


def specs_from_env() -> list[dict] | None:
    raw = os.environ.get("ZAYA_USERS_JSON")
    if raw is None or raw.strip() == "":
        return None
    parsed = json.loads(raw)
    if not isinstance(parsed, list):
        raise SystemExit("ZAYA_USERS_JSON must be a JSON list")
    return parsed


def prompt_specs() -> list[dict]:
    if not sys.stdin.isatty():
        raise SystemExit("Set ZAYA_USERS_JSON, or run this command in a terminal to be prompted.")
    specs = []
    while True:
        email = input("Email (blank to finish): ").strip()
        if not email:
            break
        role = input("Role (admin or client_user): ").strip()
        client_slug = None
        if role == "client_user":
            client_slug = input("Client slug: ").strip()
        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Password again: ")
        if password != confirm:
            raise SystemExit("Passwords did not match")
        specs.append({"email": email, "password": password, "role": role, "client_slug": client_slug})
    if not specs:
        raise SystemExit("No users entered")
    return specs


def main() -> None:
    specs = specs_from_env()
    if specs is None:
        specs = prompt_specs()
    db = SessionLocal()
    try:
        rows = create_accounts(db, specs)
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc
    finally:
        db.close()
    for row in rows:
        state = "created" if row["created"] else "already exists"
        print(f"{row['email']} {state}")


if __name__ == "__main__":
    main()
````

## File: zaya-usage-web-main/backend/app/routers/__init__.py
````python

````

## File: zaya-usage-web-main/backend/app/routers/admin.py
````python
import uuid
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.deps import require_admin
from app.models import Assistant, Client, Clinic, NumberFee, Resource, SyncRun, User, UserAssistant
from app.security import hash_password
from app.services.sync import sync_window
from app.services.windows import month_window
from app.telnyx.client import build_source
from app.telnyx.parse import mask_phone

router = APIRouter(prefix="/api/admin", tags=["admin"])


class ClientBody(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")


class ClinicBody(BaseModel):
    client_id: uuid.UUID
    name: str = Field(min_length=2, max_length=200)
    code: str = Field(min_length=2, max_length=40)


class AssistantBody(BaseModel):
    client_id: uuid.UUID
    clinic_id: uuid.UUID
    telnyx_assistant_id: str = Field(min_length=2, max_length=200)
    name: str = Field(min_length=2, max_length=200)


class ResourceBody(BaseModel):
    client_id: uuid.UUID
    clinic_id: uuid.UUID | None = None
    kind: str = Field(pattern=r"^(number|connection)$")
    telnyx_id: str = Field(min_length=2, max_length=200)
    label: str | None = None


class UserBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=200)
    role: str = Field(pattern=r"^(admin|client_user)$")
    client_id: uuid.UUID | None = None
    assistant_ids: list[uuid.UUID] = []


class SyncBody(BaseModel):
    month: str = Field(pattern=r"^\d{4}-\d{2}$")


class NumberFeeBody(BaseModel):
    resource_id: uuid.UUID
    monthly_amount: Decimal = Field(ge=0)
    effective_on: date
    proration: str = Field(default="full_month", pattern=r"^(full_month|prorated)$")
    assistant_id: uuid.UUID | None = None
    note: str | None = Field(default=None, max_length=200)


def _source():
    settings = get_settings()
    return build_source(settings.telnyx_mode, settings.telnyx_api_key, settings.telnyx_base_url)


@router.get("/map")
def mapping(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    clients = db.query(Client).order_by(Client.name).all()
    fees_by: dict = {}
    for fee in db.query(NumberFee).order_by(NumberFee.effective_on).all():
        fees_by.setdefault(fee.resource_id, []).append(
            {
                "id": str(fee.id),
                "monthly_amount": f"{fee.monthly_amount:.4f}",
                "currency": fee.currency,
                "effective_on": fee.effective_on.isoformat(),
                "proration": fee.proration,
                "note": fee.note,
                "assistant_id": str(fee.assistant_id) if fee.assistant_id else None,
            }
        )
    return {
        "clients": [
            {
                "id": str(client.id),
                "name": client.name,
                "slug": client.slug,
                "clinics": [
                    {
                        "id": str(clinic.id),
                        "name": clinic.name,
                        "code": clinic.code,
                        "assistants": [
                            {
                                "id": str(row.id),
                                "name": row.name,
                                "telnyx_assistant_id": row.telnyx_assistant_id,
                                "client_visible": row.client_visible,
                            }
                            for row in db.query(Assistant).filter(Assistant.clinic_id == clinic.id).all()
                        ],
                        "resources": [
                            {
                                "id": str(row.id),
                                "kind": row.kind,
                                "telnyx_id": row.telnyx_id,
                                "label": row.label,
                                "fees": fees_by.get(row.id, []) if row.kind == "number" else [],
                            }
                            for row in db.query(Resource).filter(Resource.clinic_id == clinic.id).all()
                        ],
                    }
                    for clinic in db.query(Clinic).filter(Clinic.client_id == client.id).order_by(Clinic.name).all()
                ],
                "users": [
                    {
                        "id": str(row.id),
                        "email": row.email,
                        "role": row.role,
                        "assistants": [
                            {
                                "id": str(assistant.id),
                                "name": assistant.label,
                                "telnyx_assistant_id": assistant.telnyx_assistant_id,
                            }
                            for assistant in (
                                db.query(Assistant)
                                .join(UserAssistant, UserAssistant.assistant_id == Assistant.id)
                                .filter(UserAssistant.user_id == row.id)
                                .order_by(Assistant.name)
                                .all()
                            )
                        ],
                    }
                    for row in db.query(User).filter(User.client_id == client.id).order_by(User.email).all()
                ],
            }
            for client in clients
        ]
    }


@router.post("/clients")
def create_client(body: ClientBody, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    if db.query(Client).filter(Client.slug == body.slug).one_or_none():
        raise HTTPException(status_code=409, detail="Slug already exists")
    row = Client(name=body.name, slug=body.slug)
    db.add(row)
    db.commit()
    return {"id": str(row.id)}


@router.post("/clinics")
def create_clinic(body: ClinicBody, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    if db.get(Client, body.client_id) is None:
        raise HTTPException(status_code=404, detail="Client not found")
    row = Clinic(client_id=body.client_id, name=body.name, code=body.code)
    db.add(row)
    db.commit()
    return {"id": str(row.id)}


@router.post("/assistants")
def create_assistant(body: AssistantBody, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    clinic = db.get(Clinic, body.clinic_id)
    if clinic is None or clinic.client_id != body.client_id:
        raise HTTPException(status_code=400, detail="Clinic does not belong to that client")
    row = Assistant(
        client_id=body.client_id,
        clinic_id=body.clinic_id,
        telnyx_assistant_id=body.telnyx_assistant_id,
        name=body.name,
    )
    db.add(row)
    db.commit()
    return {"id": str(row.id)}


@router.post("/resources")
def create_resource(body: ResourceBody, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    label = body.label or body.telnyx_id
    telnyx_id = body.telnyx_id
    if body.kind == "number":
        label = mask_phone(body.label or body.telnyx_id) or label
    row = Resource(
        client_id=body.client_id,
        clinic_id=body.clinic_id,
        kind=body.kind,
        telnyx_id=telnyx_id,
        label=label,
    )
    db.add(row)
    db.commit()
    return {"id": str(row.id), "label": row.label}


@router.post("/users")
def create_user(body: UserBody, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    if body.role == "client_user" and body.client_id is None:
        raise HTTPException(status_code=400, detail="Client users must be mapped to a client")
    if body.role == "client_user" and not body.assistant_ids:
        raise HTTPException(status_code=400, detail="Client logins must be assigned at least one assistant")
    if body.role == "admin":
        body.client_id = None
        body.assistant_ids = []
    assistants = []
    if body.assistant_ids:
        assistants = db.query(Assistant).filter(Assistant.id.in_(body.assistant_ids)).all()
        if len(assistants) != len(set(body.assistant_ids)) or any(row.client_id != body.client_id for row in assistants):
            raise HTTPException(status_code=400, detail="Assistants must belong to that client")
    if db.query(User).filter(User.email == body.email.lower()).one_or_none():
        raise HTTPException(status_code=409, detail="Email already exists")
    row = User(
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=body.role,
        client_id=body.client_id,
    )
    db.add(row)
    db.flush()
    for assistant in assistants:
        db.add(UserAssistant(user_id=row.id, assistant_id=assistant.id))
    db.commit()
    return {"id": str(row.id)}


@router.post("/number-fees")
def save_number_fee(body: NumberFeeBody, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    resource = db.get(Resource, body.resource_id)
    if resource is None or resource.kind != "number":
        raise HTTPException(status_code=400, detail="Choose a mapped phone number")
    if body.assistant_id is not None:
        assistant = db.get(Assistant, body.assistant_id)
        if assistant is None or assistant.client_id != resource.client_id:
            raise HTTPException(status_code=400, detail="Assistant must belong to that number's client")
    existing = (
        db.query(NumberFee)
        .filter(NumberFee.resource_id == resource.id, NumberFee.effective_on == body.effective_on)
        .one_or_none()
    )
    if existing is None:
        existing = NumberFee(resource_id=resource.id, effective_on=body.effective_on, currency="USD")
        db.add(existing)
    existing.monthly_amount = body.monthly_amount
    existing.proration = body.proration
    existing.assistant_id = body.assistant_id
    existing.note = (body.note or "").strip() or None
    db.commit()
    return {"id": str(existing.id), "monthly_amount": f"{existing.monthly_amount:.4f}", "note": existing.note}


@router.post("/sync")
def run_sync(body: SyncBody, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    start, end = month_window(body.month)
    run = sync_window(db, _source(), start, end)
    return {"id": str(run.id), "status": run.status, "error": run.error, "stats": run.stats}


@router.get("/sync-runs")
def sync_runs(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(SyncRun).order_by(SyncRun.started_at.desc()).limit(20).all()
    return {
        "runs": [
            {
                "id": str(row.id),
                "status": row.status,
                "mode": row.mode,
                "started_at": row.started_at.isoformat(),
                "finished_at": row.finished_at.isoformat() if row.finished_at else None,
                "window_start": row.window_start.isoformat(),
                "window_end": row.window_end.isoformat(),
                "error": row.error,
            }
            for row in rows
        ]
    }
````

## File: zaya-usage-web-main/backend/app/routers/auth.py
````python
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import check_login_lock, clear_failures, current_user, register_failure
from app.models import User
from app.security import clear_auth_cookies, new_session, set_auth_cookies, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginBody(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login(body: LoginBody, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    check_login_lock(user)
    if not verify_password(body.password, user.password_hash):
        register_failure(db, user)
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    clear_failures(db, user)
    raw, csrf = new_session(db, user)
    set_auth_cookies(response, raw, csrf)
    return {"email": user.email, "role": user.role, "csrf_token": csrf}


@router.post("/logout")
def logout(response: Response, user: User = Depends(current_user)):
    del user
    clear_auth_cookies(response)
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(current_user)):
    return {
        "email": user.email,
        "role": user.role,
        "client_id": str(user.client_id) if user.client_id else None,
    }
````

## File: zaya-usage-web-main/backend/app/routers/dashboard.py
````python
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import current_user, data_scope, require_admin
from app.models import User
from app.services.billing import billing_view
from app.services.export import billing_csv, billing_pdf, calls_csv, summary_pdf
from app.services.metrics import dashboard, filters_for, list_calls, reconciliation_rows
from app.services.windows import current_month, month_window
from app.config import get_settings
from app.services.sync import live_refresh, live_window
from app.telnyx.client import TelnyxError, build_source
from sqlalchemy import text
import logging
import time
from datetime import datetime, timezone

log = logging.getLogger(__name__)

_LAST_REFRESH: dict[tuple, float] = {}
REFRESH_DEBOUNCE_SECONDS = 20

router = APIRouter(prefix="/api", tags=["dashboard"])


def _month(month: str | None) -> str:
    return month or current_month()


def _uuid(value: str | None) -> uuid.UUID | None:
    if not value:
        return None
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid id") from exc


def _scope(db: Session, user: User, assistant_id: str | None):

    return data_scope(db, user, _uuid(assistant_id))


@router.get("/filters")
def filters(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return filters_for(db, user)


@router.get("/metrics")
def metrics(
    month: str | None = None,
    assistant_id: str | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    assistant, allowed = _scope(db, user, assistant_id)
    return dashboard(db, _month(month), assistant, assistant_ids=allowed)


@router.get("/calls")
def calls(
    month: str | None = None,
    assistant_id: str | None = None,
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    sort: str = Query(default="started_at", pattern="^(started_at|duration|billed|caller|cost|conversation)$"),
    direction: str = Query(default="desc", pattern="^(asc|desc)$"),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    assistant, allowed = _scope(db, user, assistant_id)
    return list_calls(db, _month(month), assistant, limit, offset, assistant_ids=allowed, sort=sort, direction=direction)


@router.get("/billing")
def billing(
    month: str | None = None,
    assistant_id: str | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    assistant, allowed = _scope(db, user, assistant_id)
    return billing_view(db, _month(month), assistant, allowed, include_account=user.role == "admin")


@router.get("/billing/export/csv")
def billing_export_csv(
    month: str | None = None,
    assistant_id: str | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    chosen = _month(month)
    assistant, allowed = _scope(db, user, assistant_id)
    body = billing_csv(db, chosen, assistant, allowed, include_account=user.role == "admin")
    return Response(
        content=body,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="zaya-billing-{chosen}.csv"'},
    )


@router.get("/billing/export/pdf")
def billing_export_pdf(
    month: str | None = None,
    assistant_id: str | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    chosen = _month(month)
    assistant, allowed = _scope(db, user, assistant_id)
    body = billing_pdf(db, chosen, assistant, user.email, allowed, include_account=user.role == "admin")
    return Response(
        content=body,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="zaya-billing-{chosen}.pdf"'},
    )


@router.get("/reconciliation")
def reconciliation(month: str | None = None, user: User = Depends(require_admin), db: Session = Depends(get_db)):
    del user
    return reconciliation_rows(db, _month(month))


@router.get("/export/csv")
def export_csv(
    month: str | None = None,
    assistant_id: str | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    chosen = _month(month)
    assistant, allowed = _scope(db, user, assistant_id)
    body = calls_csv(db, chosen, assistant, assistant_ids=allowed)
    return Response(
        content=body,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="zaya-usage-{chosen}.csv"'},
    )


@router.get("/export/pdf")
def export_pdf(
    month: str | None = None,
    assistant_id: str | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    chosen = _month(month)
    assistant, allowed = _scope(db, user, assistant_id)
    body = summary_pdf(db, chosen, assistant, user.email, assistant_ids=allowed)
    return Response(
        content=body,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="zaya-usage-{chosen}.pdf"'},
    )


@router.post("/refresh")
def refresh(
    month: str | None = None,
    assistant_id: str | None = None,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):





    chosen = _month(month)
    try:
        month_start, month_end = month_window(chosen)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="month must be YYYY-MM") from exc
    assistant, allowed = _scope(db, user, assistant_id)
    if assistant is not None:
        pks = {assistant}
    elif allowed is not None:
        pks = set(allowed)
    else:
        pks = None
    window = live_window(month_start, month_end)
    now_iso = datetime.now(timezone.utc).isoformat()
    if window is None:
        return {"status": "skipped", "reason": "closed_month", "refreshed_at": now_iso}
    key = (chosen, tuple(sorted(str(x) for x in pks)) if pks is not None else None)
    last = _LAST_REFRESH.get(key)
    if last is not None and time.monotonic() - last < REFRESH_DEBOUNCE_SECONDS:
        return {"status": "skipped", "reason": "recent", "refreshed_at": now_iso}



    lock = db.get_bind().connect()
    if not lock.execute(text("select pg_try_advisory_lock(727001)")).scalar():
        lock.close()
        return {"status": "skipped", "reason": "busy", "refreshed_at": now_iso}
    try:
        settings = get_settings()
        source = build_source(settings.telnyx_mode, settings.telnyx_api_key, settings.telnyx_base_url)
        try:
            result = live_refresh(db, source, window[0], window[1], pks)
        except TelnyxError as exc:
            db.rollback()
            log.warning("live refresh failed: %s", exc.status_code)
            return {"status": "error", "reason": f"telnyx_{exc.status_code}", "refreshed_at": now_iso}
        _LAST_REFRESH[key] = time.monotonic()
        return {"status": "ok", "refreshed_at": datetime.now(timezone.utc).isoformat(), **result}
    finally:
        lock.execute(text("select pg_advisory_unlock(727001)"))
        lock.close()
````

## File: zaya-usage-web-main/backend/app/routers/jobs.py
````python
import hmac

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.services.sync import sync_window
from app.services.windows import default_sync_windows, month_window
from app.telnyx.client import build_source

router = APIRouter(prefix="/internal/jobs", tags=["jobs"])


class JobBody(BaseModel):
    month: str | None = Field(default=None, pattern=r"^\d{4}-\d{2}$")


def _authorized(authorization: str | None) -> None:
    settings = get_settings()
    expected = f"Bearer {settings.sync_job_token}"
    if authorization is None or len(authorization) != len(expected) or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Job token required")


@router.post("/sync")
def scheduled_sync(
    body: JobBody | None = None,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    _authorized(authorization)
    settings = get_settings()
    source = build_source(settings.telnyx_mode, settings.telnyx_api_key, settings.telnyx_base_url)
    if body and body.month:
        windows = [month_window(body.month)]
    else:
        windows = default_sync_windows()
    runs = []
    for start, end in windows:
        run = sync_window(db, source, start, end)
        runs.append(
            {
                "id": str(run.id),
                "status": run.status,
                "window_start": run.window_start.isoformat(),
                "window_end": run.window_end.isoformat(),
                "error": run.error,
            }
        )
    return {"runs": runs}
````

## File: zaya-usage-web-main/backend/app/services/__init__.py
````python

````

## File: zaya-usage-web-main/backend/app/services/accounts.py
````python
from sqlalchemy.orm import Session

from app.models import Assistant, Client, User, UserAssistant
from app.security import hash_password

MIN_PASSWORD = 10


def create_accounts(db: Session, specs: list[dict]) -> list[dict]:






    if not specs:
        raise ValueError("No users to create")
    created = []
    for spec in specs:
        email = str(spec.get("email") or "").strip().lower()
        password = spec.get("password") or ""
        role = spec.get("role")
        client_slug = (spec.get("client_slug") or "").strip() or None
        if not email or "@" not in email:
            raise ValueError("Each user needs an email address")
        if not isinstance(password, str) or len(password) < MIN_PASSWORD:
            raise ValueError("Each password must be at least 10 characters")
        if role not in {"admin", "client_user"}:
            raise ValueError("Role must be admin or client_user")
        client = None
        assistants: list[Assistant] = []
        if role == "client_user":
            if not client_slug:
                raise ValueError("A client user needs a client_slug")
            client = db.query(Client).filter(Client.slug == client_slug).one_or_none()
            if client is None:
                raise ValueError(f"No client with slug {client_slug}")
            assistants = (
                db.query(Assistant)
                .filter(Assistant.client_id == client.id, Assistant.client_visible.is_(True))
                .order_by(Assistant.name)
                .all()
            )
            if not assistants:
                raise ValueError(f"Client {client_slug} has no visible assistant")
        elif client_slug:
            raise ValueError("An admin is not tied to a client_slug")
        existing = db.query(User).filter(User.email == email).one_or_none()
        if existing is not None:
            created.append({"email": email, "created": False})
            continue
        user = User(
            email=email,
            password_hash=hash_password(password),
            role=role,
            client_id=None if client is None else client.id,
        )
        db.add(user)
        db.flush()
        for assistant in assistants:
            db.add(UserAssistant(user_id=user.id, assistant_id=assistant.id))
        created.append({"email": email, "created": True})
    db.commit()
    return created
````

## File: zaya-usage-web-main/backend/app/services/assistants.py
````python
from sqlalchemy.orm import Session

from app.models import Assistant, Client, Clinic
from app.production import ASSISTANTS, CLIENT_NAMES, DISPLAY_NAMES
from app.telnyx.parse import clean_id

KNOWN = {row["id"]: row for row in ASSISTANTS}


def _own_group(db: Session, telnyx_id: str, name: str) -> tuple[Client, Clinic]:

    slug = "assistant-" + telnyx_id.removeprefix("assistant-")[:8]
    client = db.query(Client).filter(Client.slug == slug).one_or_none()
    if client is None:
        client = Client(name=name, slug=slug)
        db.add(client)
        db.flush()
    code = slug.upper()[:40]
    clinic = db.query(Clinic).filter(Clinic.client_id == client.id, Clinic.code == code).one_or_none()
    if clinic is None:
        clinic = Clinic(client_id=client.id, name=name, code=code)
        db.add(clinic)
        db.flush()
    return client, clinic


def _group(db: Session, slug: str | None, telnyx_id: str, name: str) -> tuple[Client, Clinic]:
    if slug:
        client = db.query(Client).filter(Client.slug == slug).one_or_none()
        if client is not None:
            clinic = db.query(Clinic).filter(Clinic.client_id == client.id).order_by(Clinic.code).first()
            if clinic is not None:
                return client, clinic
    return _own_group(db, telnyx_id, name)


def ensure_assistant(db: Session, telnyx_id: str, name: str) -> tuple[Assistant, bool]:




    row = db.query(Assistant).filter(Assistant.telnyx_assistant_id == telnyx_id).one_or_none()
    if row is not None:
        row.name = name
        if telnyx_id in DISPLAY_NAMES:
            row.display_name = DISPLAY_NAMES[telnyx_id]
        return row, False
    known = KNOWN.get(telnyx_id, {})
    client, clinic = _group(db, known.get("group"), telnyx_id, name)
    row = Assistant(
        client_id=client.id,
        clinic_id=clinic.id,
        telnyx_assistant_id=telnyx_id,
        name=name,
        display_name=DISPLAY_NAMES.get(telnyx_id),

        client_visible=bool(known.get("client_visible", False)),
    )
    db.add(row)
    db.flush()
    return row, True


def enforce_client_names(db: Session) -> None:

    for client in db.query(Client).filter(Client.slug.in_(tuple(CLIENT_NAMES))).all():
        client.name = CLIENT_NAMES[client.slug]


def seed_known_assistants(db: Session) -> None:
    for spec in ASSISTANTS:
        ensure_assistant(db, spec["id"], spec["name"])


def refresh_assistants(db: Session, source) -> dict:




    enforce_client_names(db)
    try:
        rows = source.list_assistants()
    except Exception as exc:
        seed_known_assistants(db)
        db.flush()
        return {"source": "fallback", "error": str(exc)[:300], "count": len(ASSISTANTS), "added": 0}
    added = 0
    seen = 0
    for row in rows:
        telnyx_id = clean_id(row.get("id"))
        name = clean_id(row.get("name"))
        if not telnyx_id or not name:
            continue
        seen += 1
        _, new = ensure_assistant(db, telnyx_id, name)
        added += int(new)
    db.flush()
    return {"source": "telnyx", "error": None, "count": seen, "added": added}
````

## File: zaya-usage-web-main/backend/app/services/billing.py
````python
from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Assistant, Call, Charge, Client, NumberFee, Resource, UsageTotal
from app.services.windows import month_window
from app.telnyx.parse import clean_id, parse_cost

MONEY = Decimal("0.0001")
TOLERANCE = Decimal("0.000001")


ATTRIBUTION_DIMENSIONS = ("assistant_id", "connection_id", "billing_group_id")

CALL_SERVICES = (
    ("ai-voice-assistant", "AI assistant"),
    ("call-control", "Call control"),
    ("sip-trunking", "SIP trunking"),
    ("inference", "LLM inference"),
    ("amd", "Answering-machine detection"),
    ("recording", "Recording"),
    ("noise-suppression", "Noise suppression"),
)
USAGE_SERVICES = (
    ("speech-to-text", "Speech to text"),
    ("text-to-speech", "Text to speech"),
)
PHONE_SERVICE = "phone-number"
PHONE_LABEL = "Phone number (fixed monthly)"

SERVICE_LABELS = {key: label for key, label in (*CALL_SERVICES, *USAGE_SERVICES)}
SERVICE_LABELS[PHONE_SERVICE] = PHONE_LABEL


def pick_attribution_dimension(dimensions: list[str] | None) -> str | None:
    found = set(dimensions or [])
    for name in ATTRIBUTION_DIMENSIONS:
        if name in found:
            return name
    return None


def amount_for_fee(
    monthly_amount: Decimal,
    effective_on: date,
    proration: str,
    month_start: datetime,
    month_end: datetime,
) -> Decimal | None:







    first = month_start.date()
    last = month_end.date() - timedelta(days=1)
    if effective_on > last:
        return None
    if proration != "prorated":
        return monthly_amount
    start = max(effective_on, first)
    days = (last - start).days + 1
    length = (last - first).days + 1
    return (monthly_amount * Decimal(days) / Decimal(length)).quantize(MONEY)


def _row_day(row: dict, fallback: date) -> date:
    for key in ("date", "datetime"):
        raw = clean_id(row.get(key))
        if not raw:
            continue
        text = raw.replace("Z", "+00:00")
        try:
            if len(text) == 10:
                return date.fromisoformat(text)
            parsed = datetime.fromisoformat(text)
        except ValueError:
            continue
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).date()
    return fallback


def _record_id(service: str, key: str, day: date) -> str:
    return f"usage:{service}:{key}:{day.isoformat()}"


def build_usage_charges(
    *,
    service: str,
    rows: list[dict],
    dimensions: list[str] | None,
    start: datetime,
    lookups: dict[str, dict[str, tuple[uuid.UUID, uuid.UUID | None]]],
    minute_shares: dict[tuple[uuid.UUID, uuid.UUID | None, date], Decimal],
) -> tuple[list[dict], Decimal]:
    """Turn usage-report rows into call-less charges.

    When assistant, connection, or billing group is a listed dimension, each
    row is attributed to that clinic. Otherwise the account-wide daily cost is
    split by that day's call minutes and marked allocated. The two paths are
    never combined. Unmapped amounts are returned and are not stored as zero.
    """
    dimension = pick_attribution_dimension(dimensions)
    if dimension:
        return _exact_charges(service, rows, dimension, lookups.get(dimension, {}), start)
    return _allocated_charges(service, rows, minute_shares, start)


def _exact_charges(service, rows, dimension, lookup, start) -> tuple[list[dict], Decimal]:
    grouped: dict[tuple, Decimal] = {}
    currency_for: dict[tuple, str] = {}
    unallocated = Decimal("0")
    for row in rows:
        if "cost" not in row:
            continue
        amount = parse_cost(row.get("cost"))
        if amount is None:
            continue
        key = clean_id(row.get(dimension))
        owner = lookup.get(key) if key else None
        if owner is None:
            unallocated += amount
            continue
        day = _row_day(row, start.date())
        client_id, clinic_id = owner
        bucket = (client_id, clinic_id, day)
        grouped[bucket] = grouped.get(bucket, Decimal("0")) + amount
        currency_for[bucket] = clean_id(row.get("currency")) or "USD"
    charges = []
    for (client_id, clinic_id, day), amount in grouped.items():
        charges.append(
            _charge(
                service=service,
                client_id=client_id,
                clinic_id=clinic_id,
                amount=amount,
                currency=currency_for[(client_id, clinic_id, day)],
                day=day,
                method="exact",
                key=f"{dimension}:{clinic_id or client_id}",
            )
        )
    return charges, unallocated


def _allocated_charges(service, rows, minute_shares, start) -> tuple[list[dict], Decimal]:
    by_day: dict[date, Decimal] = {}
    currency_for: dict[date, str] = {}
    for row in rows:
        if "cost" not in row:
            continue
        amount = parse_cost(row.get("cost"))
        if amount is None:
            continue
        day = _row_day(row, start.date())
        by_day[day] = by_day.get(day, Decimal("0")) + amount
        currency_for[day] = clean_id(row.get("currency")) or currency_for.get(day) or "USD"
    charges = []
    unallocated = Decimal("0")
    quantum = Decimal("0.000001")
    for day, cost in by_day.items():
        shares = {key: minutes for key, minutes in minute_shares.items() if key[2] == day and minutes > 0}
        total = sum(shares.values(), Decimal("0"))
        if total <= 0:
            unallocated += cost
            continue
        ordered = sorted(shares.items(), key=lambda item: item[1], reverse=True)
        parts: list[tuple[tuple, Decimal]] = []
        for key, minutes in ordered:
            parts.append((key, (cost * minutes / total).quantize(quantum)))
        dust = cost - sum((part for _, part in parts), Decimal("0"))
        if parts:
            key, part = parts[0]
            parts[0] = (key, part + dust)
        for (client_id, clinic_id, _), part in parts:
            if part == 0:
                continue
            charges.append(
                _charge(
                    service=service,
                    client_id=client_id,
                    clinic_id=clinic_id,
                    amount=part,
                    currency=currency_for.get(day, "USD"),
                    day=day,
                    method="allocated",
                    key=f"alloc:{client_id}:{clinic_id}",
                )
            )
    return charges, unallocated


def _charge(*, service, client_id, clinic_id, amount, currency, day, method, key) -> dict:
    occurred = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
    return {
        "client_id": client_id,
        "clinic_id": clinic_id,
        "call_id": None,
        "service": service,
        "telnyx_record_id": _record_id(service, key, day),
        "source_name": "usage_report",
        "allocation_method": method,
        "amount": amount,
        "currency": currency,
        "billed_duration_sec": None,
        "rate": None,
        "rate_unit": None,
        "occurred_at": occurred,
    }


def minute_shares(calls: list[Call], visible_assistant_ids: set[uuid.UUID]) -> dict[tuple[uuid.UUID, uuid.UUID | None, date], Decimal]:

    shares: dict[tuple[uuid.UUID, uuid.UUID | None, date], Decimal] = {}
    for call in calls:
        if call.assistant_id not in visible_assistant_ids or call.duration_sec is None:
            continue
        day = call.started_at.astimezone(timezone.utc).date()
        key = (call.client_id, call.clinic_id, day)
        shares[key] = shares.get(key, Decimal("0")) + (Decimal(call.duration_sec) / Decimal(60))
    return shares


def _money(value: Decimal | None) -> str | None:
    if value is None:
        return None
    return f"{value.quantize(MONEY):.4f}"


def billing_view(
    db: Session,
    month: str,
    assistant_id: uuid.UUID | None,
    assistant_ids: tuple[uuid.UUID, ...] | None,
    include_account: bool,
) -> dict:
    start, end = month_window(month)
    scoped = _statements(db, month, start, end, assistant_id, assistant_ids)
    account = None
    if include_account:
        everyone = _statements(db, month, start, end, None, None)
        account = _account(db, start, end, everyone)
    return {
        "month": month,
        "timezone": "UTC",
        "statements": scoped,
        "account": account,
    }


def _statements(db, month, start, end, assistant_id, assistant_ids) -> list[dict]:
    assistants = db.query(Assistant).filter(Assistant.client_visible.is_(True)).all()
    if assistant_ids is not None:
        allowed = set(assistant_ids)
        assistants = [row for row in assistants if row.id in allowed]
    if assistant_id is not None:
        assistants = [row for row in assistants if row.id == assistant_id]
    if assistant_ids is not None and not assistant_ids:
        assistants = []

    by_client: dict[uuid.UUID, list[Assistant]] = {}
    for row in assistants:
        by_client.setdefault(row.client_id, []).append(row)
    if not by_client:
        return []
    clients = {row.id: row for row in db.query(Client).filter(Client.id.in_(list(by_client))).all()}
    assistant_ids_in_scope = [row.id for rows in by_client.values() for row in rows]
    calls = (
        db.query(Call)
        .filter(Call.started_at >= start, Call.started_at < end, Call.assistant_id.in_(assistant_ids_in_scope))
        .all()
    )
    call_ids = [call.id for call in calls]
    call_charges = db.query(Charge).filter(Charge.call_id.in_(call_ids)).all() if call_ids else []
    charges_by_call: dict = {}
    for charge in call_charges:
        charges_by_call.setdefault(charge.call_id, []).append(charge)
    calls_by_client: dict = {}
    for call in calls:
        calls_by_client.setdefault(call.client_id, []).append(call)

    usage = (
        db.query(Charge)
        .filter(
            Charge.call_id.is_(None),
            Charge.source_name == "usage_report",
            Charge.occurred_at >= start,
            Charge.occurred_at < end,
        )
        .all()
    )
    visible_clinics = {row.clinic_id for row in assistants}
    usage_by_client: dict = {}
    for charge in usage:
        if charge.clinic_id is not None and charge.clinic_id not in visible_clinics:
            continue
        if charge.client_id not in by_client:
            continue
        usage_by_client.setdefault(charge.client_id, []).append(charge)

    numbers = db.query(Resource).filter(Resource.kind == "number", Resource.clinic_id.in_(list(visible_clinics))).all()
    fees = db.query(NumberFee).filter(NumberFee.resource_id.in_([row.id for row in numbers] or [uuid.uuid4()])).all() if numbers else []
    fees_by_resource: dict = {}
    for fee in fees:
        fees_by_resource.setdefault(fee.resource_id, []).append(fee)

    usage_totals = {
        row.product: row
        for row in db.query(UsageTotal).filter(UsageTotal.window_start == start, UsageTotal.window_end == end).all()
    }
    product_methods = {}
    for charge in usage:
        product_methods.setdefault(charge.service, set()).add(charge.allocation_method)

    statements = []
    for cid, rows in sorted(by_client.items(), key=lambda item: clients[item[0]].name if item[0] in clients else ""):
        client = clients.get(cid)
        if client is None:
            continue
        lines = []
        for service, label in CALL_SERVICES:
            lines.append(_call_line(service, label, calls_by_client.get(cid, []), charges_by_call))
        for service, label in USAGE_SERVICES:
            lines.append(
                _usage_line(
                    service,
                    label,
                    usage_by_client.get(cid, []),
                    usage_totals.get(service),
                    "allocated" in product_methods.get(service, set()),
                )
            )
        client_numbers = [row for row in numbers if row.client_id == cid]
        if assistant_id is not None:
            assistant_clinic = next((row.clinic_id for row in rows if row.id == assistant_id), None)
            client_numbers = [
                row
                for row in client_numbers
                if row.clinic_id == assistant_clinic
                or any(fee.assistant_id == assistant_id for fee in fees_by_resource.get(row.id, []))
            ]
        lines.append(_phone_line(client_numbers, fees_by_resource, rows, start, end))
        statements.append(_finish(client, month, lines))
    return statements


def _call_line(service: str, label: str, calls: list[Call], charges_by_call: dict) -> dict:
    pending = 0
    priced = Decimal("0")
    priced_any = False
    currency = None
    for call in calls:
        for charge in charges_by_call.get(call.id, []):
            if charge.service != service:
                continue
            if charge.amount is None:
                pending += 1
                continue
            priced += charge.amount
            priced_any = True
            currency = currency or charge.currency or "USD"
    status = "pending" if pending else "recorded"
    amount = None if pending else priced
    return _line(service, label, amount if priced_any or pending else Decimal("0"), status, pending, priced if priced_any else Decimal("0"), currency or "USD", None, "")


def _usage_line(service, label, charges, usage_total, allocated: bool) -> dict:
    pending = 0
    priced = Decimal("0")
    priced_any = False
    currency = None
    for charge in charges:
        if charge.service != service:
            continue
        if charge.amount is None:
            pending += 1
            continue
        priced += charge.amount
        priced_any = True
        currency = currency or charge.currency or "USD"
    available = usage_total is not None and usage_total.available and usage_total.telnyx_cost is not None
    if not available and not priced_any:
        return _line(service, label, None, "unavailable", 0, None, "USD", None, "Telnyx did not return a usage-report cost for this product.")
    status = "pending" if pending else "allocated" if allocated else "recorded"
    amount = None if pending else (priced if priced_any else Decimal("0"))
    note = "Allocated by each day's share of call minutes." if allocated else "Usage report, attributed to the clinic. Not added to any call."
    return _line(service, label, amount, status, pending, priced if priced_any else Decimal("0"), currency or "USD", "allocated" if allocated else "exact", note)


def _phone_line(numbers: list[Resource], fees_by_resource, assistants: list[Assistant], start, end) -> dict:
    assistant_ids = {row.id for row in assistants}
    details = []
    missing = False
    total = Decimal("0")
    any_amount = False
    considered = 0
    for number in sorted(numbers, key=lambda row: row.label):
        fee = _select_fee(fees_by_resource.get(number.id, []), start, end)
        if fee is not None and fee.assistant_id is not None and fee.assistant_id not in assistant_ids:
            continue
        considered += 1
        if fee is None:
            missing = True
            details.append(
                {
                    "label": number.label,
                    "amount": None,
                    "status": "missing_config",
                    "proration": None,
                    "effective_on": None,
                    "note": None,
                }
            )
            continue
        amount = amount_for_fee(fee.monthly_amount, fee.effective_on, fee.proration, start, end)
        if amount is None:
            missing = True
            details.append(
                {
                    "label": number.label,
                    "amount": None,
                    "status": "missing_config",
                    "proration": fee.proration,
                    "effective_on": fee.effective_on.isoformat(),
                    "note": fee.note,
                }
            )
            continue
        any_amount = True
        total += amount
        details.append(
            {
                "label": number.label,
                "amount": _money(amount),
                "status": "recorded",
                "proration": fee.proration,
                "effective_on": fee.effective_on.isoformat(),
                "note": fee.note,
            }
        )
    if considered == 0:
        return _line(PHONE_SERVICE, PHONE_LABEL, None, "missing_config", 0, None, "USD", None, "No phone number is mapped to this clinic.", details)
    if missing:
        return _line(
            PHONE_SERVICE,
            PHONE_LABEL,
            None,
            "missing_config",
            0,
            None,
            "USD",
            None,
            "A mapped number has no fee. That is missing configuration, not a zero charge.",
            details,
        )
    note = "Fixed monthly fee configured for this number."
    if any(row["proration"] == "prorated" for row in details):
        note = "Prorated from the fee's effective date through the end of the UTC month."
    return _line(PHONE_SERVICE, PHONE_LABEL, total if any_amount else Decimal("0"), "recorded", 0, total, "USD", None, note, details)


def _select_fee(fees: list[NumberFee], start, end) -> NumberFee | None:
    last = end.date() - timedelta(days=1)
    eligible = [fee for fee in fees if fee.effective_on <= last]
    if not eligible:
        return None
    return max(eligible, key=lambda fee: fee.effective_on)


def _line(service, label, amount, status, pending, priced, currency, attribution, note, numbers=None) -> dict:
    return {
        "service": service,
        "label": label,
        "amount": _money(amount) if not isinstance(amount, str) else amount,
        "priced_amount": _money(priced),
        "currency": currency,
        "status": status,
        "pending_count": pending,
        "attribution": attribution,
        "note": note,
        "numbers": numbers or [],
    }


def _finish(client: Client, month: str, lines: list[dict]) -> dict:
    blocking = [line for line in lines if line["status"] in {"pending", "missing_config", "unavailable"}]
    known = Decimal("0")
    known_any = False
    for line in lines:
        if line["status"] in {"missing_config", "unavailable"}:
            continue
        if line["priced_amount"] is None:
            continue
        known += Decimal(line["priced_amount"])
        known_any = True
    grand = None if blocking or not known_any else known
    flags = []
    for line in lines:
        if line["status"] == "pending" and "pending" not in flags:
            flags.append("pending")
        if line["status"] == "missing_config" and "missing_config" not in flags:
            flags.append("missing_config")
        if line["status"] == "allocated" and "allocated" not in flags:
            flags.append("allocated")
        if line["status"] == "unavailable" and "unavailable" not in flags:
            flags.append("unavailable")
    return {
        "client_id": str(client.id),
        "client_name": client.name,
        "client_slug": client.slug,
        "month": month,
        "lines": lines,
        "known_total": _money(known) if known_any else None,
        "grand_total": _money(grand),
        "currency": "USD",
        "flags": flags,
        "complete": grand is not None,
    }


def _account(db: Session, start, end, statements: list[dict]) -> dict:
    usage_rows = db.query(UsageTotal).filter(UsageTotal.window_start == start, UsageTotal.window_end == end).all()
    usage_by = {row.product: row for row in usage_rows}
    assistants = db.query(Assistant).all()
    visible = {row.id for row in assistants if row.client_visible}
    visible_clinics = {row.clinic_id for row in assistants if row.client_visible}
    calls = db.query(Call).filter(Call.started_at >= start, Call.started_at < end).all()
    hidden_call_ids = {call.id for call in calls if call.assistant_id not in visible}
    charges = db.query(Charge).filter(Charge.occurred_at >= start, Charge.occurred_at < end).all()
    products = [key for key, _label in (*CALL_SERVICES, *USAGE_SERVICES)]
    rows = []
    for product in products:
        usage = usage_by.get(product)
        telnyx = usage.telnyx_cost if usage and usage.available else None
        billed = Decimal("0")
        billed_any = False
        pending = False
        for statement in statements:
            line = next((item for item in statement["lines"] if item["service"] == product), None)
            if line is None:
                continue
            if line["status"] == "pending":
                pending = True
            if line["priced_amount"] is not None and line["status"] != "unavailable":
                billed += Decimal(line["priced_amount"])
                billed_any = True
        hidden = Decimal("0")
        for charge in charges:
            if charge.service != product or charge.amount is None:
                continue
            on_hidden_call = charge.call_id in hidden_call_ids
            on_hidden_clinic = charge.call_id is None and charge.clinic_id is not None and charge.clinic_id not in visible_clinics
            if on_hidden_call or on_hidden_clinic:
                hidden += charge.amount
        unallocated = None
        unmapped = None
        if telnyx is not None and billed_any:
            unallocated = telnyx - billed
            unmapped = unallocated - hidden
        notes = []
        if hidden > 0:
            notes.append(f"{_money(hidden)} is on test assistants, which are excluded from client statements.")
        if unmapped is not None and abs(unmapped) > TOLERANCE:
            notes.append(f"{_money(unmapped)} is not mapped to a clinic (no billing group, connection, or assistant, or a day with no call minutes).")
        if telnyx is None:
            status = "unavailable"
        elif pending:
            status = "pending"
        elif unallocated is not None and abs(unallocated) > TOLERANCE:
            status = "remainder"
        else:
            status = "match"
        rows.append(
            {
                "product": product,
                "label": SERVICE_LABELS[product],
                "currency": "USD",
                "telnyx_cost": _money(telnyx),
                "billed_to_clients": _money(billed) if billed_any else None,
                "unallocated": _money(unallocated),
                "status": status,
                "note": " ".join(notes),
            }
        )
    return {
        "note": "Sum of client statements compared with Telnyx account usage totals. Fixed phone-number fees are not in those totals. Unallocated is the remainder not on a client statement.",
        "rows": rows,
    }
````

## File: zaya-usage-web-main/backend/app/services/export.py
````python
import csv
import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.services.billing import billing_view
from app.services.metrics import dashboard, list_calls


def calls_csv(db, month, assistant_id, assistant_ids=None) -> str:
    payload = list_calls(
        db, month, assistant_id, limit=5000, offset=0, assistant_ids=assistant_ids
    )
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "started_at_utc",
            "clinic",
            "assistant",
            "masked_caller",
            "direction",
            "duration_sec",
            "recorded_cost",
            "currency",
            "cost_status",
        ]
    )
    for call in payload["calls"]:
        writer.writerow(
            [
                call["started_at"],
                call["clinic_name"],
                call["assistant_name"],
                call["masked_caller"],
                call["direction"] or "",
                "" if call["duration_sec"] is None else call["duration_sec"],
                "" if call["recorded_cost"] is None else call["recorded_cost"],
                call["currency"] or "",
                call["cost_status"],
            ]
        )
    return buffer.getvalue()


def summary_pdf(db, month, assistant_id, scope_label: str, assistant_ids=None) -> bytes:
    summary = dashboard(db, month, assistant_id, assistant_ids=assistant_ids)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, title=f"Zaya usage {month}")
    styles = getSampleStyleSheet()
    kpis = summary["kpis"]
    story = [
        Paragraph("Zaya Health — receptionist usage", styles["Title"]),
        Paragraph(f"{scope_label} · {month} UTC", styles["Heading2"]),
        Paragraph(
            "Missing costs are blank, not zero. Recorded cost counts only calls whose charges are all priced.",
            styles["Normal"],
        ),
        Spacer(1, 12),
    ]
    kpi_table = Table(
        [
            ["Calls", "Talk time (known)", "Recorded cost", "Average / complete call", "Pending calls"],
            [
                str(kpis["call_count"]),
                "—" if kpis["duration_sec"] is None else f"{kpis['duration_sec']} sec",
                _cost(kpis["recorded_cost"], kpis["currency"]),
                _cost(kpis["average_cost_per_call"], kpis["currency"]),
                str(kpis["pending_call_count"]),
            ],
        ]
    )
    kpi_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f4f4c")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
                ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#f4f0e6")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d9d0c1")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(kpi_table)
    story.append(Spacer(1, 16))
    story.append(Paragraph("Service breakdown", styles["Heading3"]))
    service_data = [["Service", "Priced amount", "Pending rows", "Billed seconds"]]
    for row in summary["services"]:
        service_data.append(
            [
                row["service"],
                _cost(row["recorded_cost"], row["currency"]),
                str(row["pending_charge_count"]),
                "—" if row["billed_sec"] is None else str(row["billed_sec"]),
            ]
        )
    if len(service_data) == 1:
        service_data.append(["No charges in this filter", "", "", ""])
    service_table = Table(service_data, colWidths=[180, 120, 100, 100])
    service_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f4f4c")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#d9d0c1")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(service_table)
    story.append(Spacer(1, 12))
    for reason in summary["incomplete_reasons"]:
        story.append(Paragraph(f"• {reason}", styles["Normal"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph(summary["numbers"]["note"], styles["Italic"]))
    story.append(
        Paragraph(
            f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}. Caller numbers are masked. Transcripts are not stored.",
            styles["Normal"],
        )
    )
    doc.build(story)
    return buffer.getvalue()


def billing_csv(db, month, assistant_id, assistant_ids, include_account: bool) -> str:
    payload = billing_view(db, month, assistant_id, assistant_ids, include_account)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["client", "month", "line", "amount", "priced_amount", "currency", "status", "attribution", "note"])
    for statement in payload["statements"]:
        for line in statement["lines"]:
            writer.writerow(
                [
                    statement["client_name"],
                    statement["month"],
                    line["label"],
                    _statement_amount(line),
                    "" if line["priced_amount"] is None else line["priced_amount"],
                    line["currency"],
                    line["status"],
                    line["attribution"] or "",
                    line["note"],
                ]
            )
        writer.writerow(
            [
                statement["client_name"],
                statement["month"],
                "Grand total",
                statement["grand_total"] if statement["grand_total"] is not None else "Incomplete",
                "" if statement["known_total"] is None else statement["known_total"],
                statement["currency"],
                "complete" if statement["complete"] else "incomplete",
                "",
                " ".join(statement["flags"]),
            ]
        )
    account = payload["account"]
    if account:
        writer.writerow([])
        writer.writerow(["product", "telnyx_cost", "billed_to_clients", "unallocated", "status", "note"])
        for row in account["rows"]:
            writer.writerow(
                [
                    row["label"],
                    "" if row["telnyx_cost"] is None else row["telnyx_cost"],
                    "" if row["billed_to_clients"] is None else row["billed_to_clients"],
                    "" if row["unallocated"] is None else row["unallocated"],
                    row["status"],
                    row["note"],
                ]
            )
    return buffer.getvalue()


def billing_pdf(db, month, assistant_id, scope_label, assistant_ids, include_account: bool) -> bytes:
    payload = billing_view(db, month, assistant_id, assistant_ids, include_account)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, title=f"Zaya billing {month}")
    styles = getSampleStyleSheet()
    story = [
        Paragraph("Zaya Health — monthly billing statement", styles["Title"]),
        Paragraph(f"{scope_label} · {month} UTC", styles["Heading2"]),
        Paragraph(
            "A missing fee is missing configuration, not zero. Pending and unavailable lines leave the grand total incomplete. Allocated lines are a share of that day's account usage.",
            styles["Normal"],
        ),
        Spacer(1, 12),
    ]
    if not payload["statements"]:
        story.append(Paragraph("No client statements for this month.", styles["Normal"]))
    for statement in payload["statements"]:
        flags = ", ".join(statement["flags"]) or "complete"
        story.append(Paragraph(f"{statement['client_name']} · {flags}", styles["Heading3"]))
        data = [["Line", "Amount", "Status"]]
        for line in statement["lines"]:
            data.append([line["label"], _statement_amount(line), line["status"].replace("_", " ")])
        data.append(
            [
                "Grand total",
                statement["grand_total"] if statement["grand_total"] is not None else "Incomplete",
                f"Known so far {statement['known_total'] or '—'}",
            ]
        )
        table = Table(data, colWidths=[240, 140, 140])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f4f4c")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#f4f0e6")),
                    ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
                    ("FONTNAME", (0, -1), (-1, -1), "Times-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#d9d0c1")),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 8))
        for line in statement["lines"]:
            if line["service"] != "phone-number":
                continue
            for number in line["numbers"]:
                amount = "Missing config" if number["status"] == "missing_config" else (number["amount"] or "Pending")
                label = number.get("note") or ""
                suffix = f" ({label})" if label else ""
                story.append(Paragraph(f"• {number['label']}: {amount}{suffix}", styles["Normal"]))
        story.append(Spacer(1, 12))
    account = payload["account"]
    if account:
        story.append(Paragraph("Account tie-out", styles["Heading3"]))
        story.append(Paragraph(account["note"], styles["Italic"]))
        story.append(Spacer(1, 6))
        data = [["Product", "Telnyx", "Billed to clients", "Unallocated", "Status"]]
        for row in account["rows"]:
            data.append(
                [
                    row["label"],
                    row["telnyx_cost"] or "Unavailable",
                    row["billed_to_clients"] or "—",
                    row["unallocated"] or "—",
                    row["status"],
                ]
            )
        table = Table(data, colWidths=[130, 90, 110, 90, 80])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f4f4c")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#d9d0c1")),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(table)
    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}. Fixed phone fees are not part of Telnyx usage totals.",
            styles["Normal"],
        )
    )
    doc.build(story)
    return buffer.getvalue()


def _statement_amount(line: dict) -> str:
    if line["status"] == "missing_config":
        return "Missing config"
    if line["status"] == "unavailable":
        return "Unavailable"
    if line["status"] == "pending" or line["amount"] is None:
        return "Pending"
    return line["amount"]


def _cost(amount: str | None, currency: str | None) -> str:
    if amount is None:
        return "Pending"
    return f"{currency or ''} {amount}".strip()
````

## File: zaya-usage-web-main/backend/app/services/metrics.py
````python
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session, joinedload, selectinload

from fastapi import HTTPException

from app.models import Assistant, Call, Charge, Reconciliation, Resource, SyncRun, UserAssistant
from app.services.windows import current_month, month_window


DETAIL_IN_SESSION_DISPLAY = {"recording", "noise-suppression"}


def _money(value: Decimal | None) -> str | None:
    if value is None:
        return None
    return f"{value.quantize(Decimal('0.0001')):.4f}"


def _scoped_calls(
    db: Session,
    month: str,
    assistant_id: uuid.UUID | None,
    assistant_ids: tuple[uuid.UUID, ...] | None,
):
    start, end = month_window(month)
    query = db.query(Call).filter(Call.started_at >= start, Call.started_at < end)
    if assistant_ids is not None:
        if not assistant_ids:
            query = query.filter(Call.id.is_(None))
        else:
            query = query.filter(Call.assistant_id.in_(assistant_ids))
    if assistant_id is not None:
        query = query.filter(Call.assistant_id == assistant_id)
    return query, start, end


def dashboard(
    db: Session,
    month: str,
    assistant_id: uuid.UUID | None,
    assistant_ids: tuple[uuid.UUID, ...] | None = None,
) -> dict:
    query, start, end = _scoped_calls(db, month, assistant_id, assistant_ids)
    calls = query.options(selectinload(Call.charges), joinedload(Call.clinic), joinedload(Call.assistant)).all()

    recorded_costs = [call.recorded_cost for call in calls if call.cost_status == "recorded" and call.recorded_cost is not None]
    currencies = {call.currency for call in calls if call.cost_status == "recorded" and call.currency}
    recorded_total = None
    average = None
    currency = None
    if recorded_costs and len(currencies) == 1:
        currency = currencies.pop()
        recorded_total = sum(recorded_costs, Decimal("0"))
        average = recorded_total / Decimal(len(recorded_costs))
    elif recorded_costs and len(currencies) != 1:
        currency = None
        recorded_total = None
        average = None

    duration_known = [call.duration_sec for call in calls if call.duration_sec is not None]
    pending_calls = [call for call in calls if call.cost_status != "recorded"]
    pending_charges = 0
    for call in calls:
        pending_charges += sum(1 for charge in call.charges if charge.amount is None)

    daily: dict[str, dict] = {}
    for call in calls:
        day = call.started_at.astimezone(timezone.utc).date().isoformat()
        bucket = daily.setdefault(day, {"call_count": 0, "pending_call_count": 0, "duration_sec": 0, "duration_known": 0, "recorded": []})
        bucket["call_count"] += 1
        if call.cost_status != "recorded":
            bucket["pending_call_count"] += 1
        elif call.recorded_cost is not None:
            bucket["recorded"].append(call.recorded_cost)
        if call.duration_sec is not None:
            bucket["duration_sec"] += call.duration_sec
            bucket["duration_known"] += 1

    daily_rows = []
    for day in sorted(daily):
        bucket = daily[day]
        cost = sum(bucket["recorded"], Decimal("0")) if bucket["recorded"] else None
        daily_rows.append(
            {
                "date": day,
                "call_count": bucket["call_count"],
                "pending_call_count": bucket["pending_call_count"],
                "duration_sec": bucket["duration_sec"] if bucket["duration_known"] else None,
                "recorded_cost": _money(cost),
            }
        )

    service_buckets: dict[str, dict] = {}

    def _add_service(charge: Charge) -> None:
        bucket = service_buckets.setdefault(charge.service, {"priced": [], "pending": 0, "billed": 0, "billed_known": False, "currency": set()})
        if charge.amount is None:
            bucket["pending"] += 1
        else:
            bucket["priced"].append(charge.amount)
            if charge.currency:
                bucket["currency"].add(charge.currency)
        if charge.billed_duration_sec is not None:
            bucket["billed"] += charge.billed_duration_sec
            bucket["billed_known"] = True

    for call in calls:
        for charge in call.charges:
            _add_service(charge)
    for charge in _usage_report_charges(db, start, end, assistant_id, assistant_ids):
        _add_service(charge)
    services = []
    for service, bucket in sorted(service_buckets.items()):
        priced = sum(bucket["priced"], Decimal("0")) if bucket["priced"] and len(bucket["currency"]) <= 1 else None
        if bucket["priced"] and len(bucket["currency"]) > 1:
            priced = None
        services.append(
            {
                "service": service,
                "recorded_cost": _money(priced) if bucket["priced"] else None,
                "currency": next(iter(bucket["currency"])) if len(bucket["currency"]) == 1 else None,
                "pending_charge_count": bucket["pending"],
                "charge_count": bucket["pending"] + len(bucket["priced"]),
                "billed_sec": bucket["billed"] if bucket["billed_known"] else None,
            }
        )

    number_query = db.query(Resource).filter(Resource.kind == "number")
    if assistant_ids is not None:
        clinic_ids = [
            row[0]
            for row in db.query(Assistant.clinic_id).filter(Assistant.id.in_(assistant_ids)).all()
        ] if assistant_ids else []
        if clinic_ids:
            number_query = number_query.filter(Resource.clinic_id.in_(clinic_ids))
        else:
            number_query = number_query.filter(Resource.id.is_(None))
    if assistant_id is not None:
        clinic = db.query(Assistant.clinic_id).filter(Assistant.id == assistant_id).scalar()
        number_query = number_query.filter(Resource.clinic_id == clinic)

    last_sync = db.query(SyncRun).filter(SyncRun.status == "succeeded").order_by(SyncRun.finished_at.desc()).first()
    reasons = []
    if pending_calls:
        reasons.append(f"{len(pending_calls)} calls still have a missing cost. Those calls are excluded from recorded cost and from the average.")
    if any(call.duration_sec is None for call in calls):
        reasons.append("At least one call has no call_sec duration. Talk time does not fill that gap with zero.")
    if end > datetime.now(timezone.utc):
        reasons.append("This UTC month is still open. Telnyx can still attach or revise charges.")
    if last_sync and last_sync.stats.get("conversations_truncated"):
        reasons.append("The conversation list hit the undocumented page limit and may be incomplete.")
    latest = db.query(SyncRun).order_by(SyncRun.started_at.desc()).first()
    if latest is not None and latest.status == "paused":
        reasons.append(
            "The last sync paused because Telnyx rate limited the shared API key. It resumes from the last finished page."
        )

    return {
        "month": month,
        "timezone": "UTC",
        "window": {"start": start.isoformat(), "end": end.isoformat()},
        "last_sync_at": last_sync.finished_at.isoformat() if last_sync and last_sync.finished_at else None,
        "last_sync_status": last_sync.status if last_sync else None,
        "incomplete": bool(reasons),
        "incomplete_reasons": reasons,
        "kpis": {
            "call_count": len(calls),
            "duration_sec": sum(duration_known) if duration_known else None,
            "duration_unknown_count": sum(1 for call in calls if call.duration_sec is None),
            "recorded_cost": _money(recorded_total),
            "currency": currency,
            "average_cost_per_call": _money(average),
            "complete_call_count": len(recorded_costs),
            "pending_call_count": len(pending_calls),
            "pending_charge_count": pending_charges,
        },
        "conversation_billing": conversation_billing(calls),
        "daily": daily_rows,
        "services": services,
        "numbers": {
            "mapped_count": number_query.count(),
            "monthly_cost": None,
            "note": "Telnyx does not provide owned-number fees (unavailable from the API). An admin sets a fixed monthly fee. A number with no fee is missing config, not zero.",
        },
        "cost_note": "Recorded cost includes only calls where every charge row has a cost. Recording and noise suppression come from per-call detail records (recording joined on telnyx_session_id, noise suppression on call_session_id) and are part of each conversation's cost, counted once. Speech-to-text and text-to-speech come from usage reports and are monthly lines on the billing statement, not added to any call.",
    }


def _usage_report_charges(db: Session, start, end, assistant_id, assistant_ids):
    query = db.query(Charge).filter(
        Charge.call_id.is_(None),
        Charge.source_name == "usage_report",
        Charge.occurred_at >= start,
        Charge.occurred_at < end,
    )
    if assistant_ids is not None:
        if not assistant_ids:
            return []
        clinic_ids = [row[0] for row in db.query(Assistant.clinic_id).filter(Assistant.id.in_(assistant_ids)).all()]
        if not clinic_ids:
            return []
        query = query.filter(Charge.clinic_id.in_(clinic_ids))
    if assistant_id is not None:
        clinic = db.query(Assistant.clinic_id).filter(Assistant.id == assistant_id).scalar()
        if clinic is None:
            return []
        query = query.filter(Charge.clinic_id == clinic)
    return query.all()


CALL_SORTS = {"started_at", "duration", "billed", "caller", "cost", "conversation"}


def _sort_value(row: dict, sort: str):
    if sort == "duration":
        return row.get("duration_sec")
    if sort == "billed":
        return (row.get("billable") or {}).get("billed_sec")
    if sort == "caller":
        return row.get("masked_caller")
    if sort == "cost":
        total = (row.get("billable") or {}).get("total")
        return Decimal(total) if total is not None else None
    if sort == "conversation":
        return row.get("telnyx_conversation_id")
    return row.get("started_at")


def list_calls(
    db: Session,
    month: str,
    assistant_id: uuid.UUID | None,
    limit: int = 100,
    offset: int = 0,
    assistant_ids: tuple[uuid.UUID, ...] | None = None,
    sort: str = "started_at",
    direction: str = "desc",
) -> dict:






    if sort not in CALL_SORTS:
        sort = "started_at"
    descending = direction != "asc"
    query, _, _ = _scoped_calls(db, month, assistant_id, assistant_ids)
    total = query.count()
    loaded = query.options(selectinload(Call.charges), joinedload(Call.clinic), joinedload(Call.assistant))
    if sort == "started_at":
        order = Call.started_at.desc() if descending else Call.started_at.asc()
        page = [_call_row(call) for call in loaded.order_by(order, Call.id).offset(offset).limit(limit).all()]
    else:
        rows = [_call_row(call) for call in loaded.order_by(Call.started_at.desc(), Call.id).all()]
        present = [row for row in rows if _sort_value(row, sort) is not None]
        missing = [row for row in rows if _sort_value(row, sort) is None]
        present.sort(key=lambda row: _sort_value(row, sort), reverse=descending)
        page = (present + missing)[offset : offset + limit]
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "sort": sort,
        "direction": "desc" if descending else "asc",
        "calls": page,
    }


def conversation_cost(call: Call) -> dict:






    breakdown = call.session_breakdown or {}
    ai_charges = [charge for charge in call.charges if charge.service == "ai-voice-assistant"]
    detail_billed = [charge.billed_duration_sec for charge in ai_charges if charge.billed_duration_sec is not None]
    if call.session_status == "ok" and breakdown.get("total") is not None:
        products = {
            name: {"cost": row.get("cost"), "count": row.get("count"), "billed_sec": row.get("billed_sec"), "source": "session_analysis"}
            for name, row in (breakdown.get("products") or {}).items()
        }
        session_total = Decimal(breakdown["total"])


        extra_total = Decimal("0")
        partial = False
        session_products = {name for name, row in products.items() if row.get("source") == "session_analysis"}
        for charge in call.charges:
            if charge.service in session_products:



                if charge.service in DETAIL_IN_SESSION_DISPLAY and charge.amount is not None:
                    row = products[charge.service]
                    row["source"] = "detail_records"
                    row["included_in_session_total"] = True
                    if row.get("_detail_reset") is None:
                        row["_detail_reset"] = True
                        row["cost"] = "0"
                        row["count"] = 0
                    row["count"] += 1
                    row["cost"] = f"{Decimal(row['cost']) + charge.amount:.6f}"
                continue
            row = products.setdefault(charge.service, {"cost": "0", "count": 0, "billed_sec": None, "source": "detail_records"})
            row["count"] += 1
            if charge.amount is None:
                row["cost"] = None
                partial = True
            elif row["cost"] is not None:
                row["cost"] = f"{Decimal(row['cost']) + charge.amount:.6f}"
                extra_total += charge.amount
            if charge.billed_duration_sec is not None:
                row["billed_sec"] = (row["billed_sec"] or 0) + charge.billed_duration_sec
        for row in products.values():
            row.pop("_detail_reset", None)
        billed = breakdown.get("billed_sec")
        if billed is None and detail_billed:
            billed = sum(detail_billed)
        return {
            "source": "session_analysis",
            "session_total": breakdown["total"],
            "partial": partial,
            "total": f"{session_total + extra_total:.6f}",
            "currency": breakdown.get("currency") or call.currency,
            "billed_sec": billed,
            "rate": breakdown.get("rate"),
            "rate_measured_in": breakdown.get("rate_measured_in"),
            "products": products,
        }
    products: dict[str, dict] = {}
    for charge in call.charges:
        row = products.setdefault(charge.service, {"cost": Decimal("0"), "count": 0, "billed_sec": None, "known": True})
        row["count"] += 1
        if charge.amount is None:
            row["known"] = False
        else:
            row["cost"] += charge.amount
        if charge.billed_duration_sec is not None:
            row["billed_sec"] = (row["billed_sec"] or 0) + charge.billed_duration_sec
    shaped = {
        name: {"cost": f"{row['cost']:.6f}" if row["known"] else None, "count": row["count"], "billed_sec": row["billed_sec"], "source": "detail_records"}
        for name, row in sorted(products.items())
    }
    recorded = call.cost_status == "recorded" and call.recorded_cost is not None
    return {
        "source": "detail_records" if recorded else None,
        "session_total": None,
        "partial": False,
        "total": f"{call.recorded_cost:.6f}" if recorded else None,
        "currency": call.currency,
        "billed_sec": sum(detail_billed) if detail_billed else None,
        "rate": None,
        "rate_measured_in": None,
        "products": shaped,
    }


def conversation_billing(calls: list[Call]) -> dict:

    total = Decimal("0")
    billed = 0
    billed_known = False
    currencies: set[str] = set()
    by_source = {"session_analysis": 0, "detail_records": 0, "missing": 0}
    partial = 0
    products: dict[str, dict] = {}
    for call in calls:
        row = conversation_cost(call)
        if row["source"] is None:
            by_source["missing"] += 1
        else:
            by_source[row["source"]] += 1
            partial += int(bool(row.get("partial")))
            total += Decimal(row["total"])
            currencies.add(row["currency"] or "USD")
            for name, part in row["products"].items():
                bucket = products.setdefault(name, {"cost": Decimal("0"), "count": 0, "billed_sec": None})
                bucket["count"] += part.get("count") or 0
                if part.get("cost") is not None:
                    bucket["cost"] += Decimal(part["cost"])
                if part.get("billed_sec") is not None:
                    bucket["billed_sec"] = (bucket["billed_sec"] or 0) + part["billed_sec"]
            if row["billed_sec"] is not None:
                billed += row["billed_sec"]
                billed_known = True
    mixed = len(currencies) > 1
    return {
        "total": None if mixed else _money(total),
        "currency": None if mixed else (next(iter(currencies)) if currencies else "USD"),
        "conversation_count": len(calls),
        "priced_count": by_source["session_analysis"] + by_source["detail_records"],
        "from_session_analysis": by_source["session_analysis"],
        "from_detail_records": by_source["detail_records"],
        "missing_count": by_source["missing"],
        "partial_count": partial,
        "billed_sec": billed if billed_known else None,
        "billed_minutes": f"{Decimal(billed) / 60:.2f}" if billed_known else None,
        "products": [
            {"service": name, "cost": _money(row["cost"]), "count": row["count"], "billed_sec": row["billed_sec"]}
            for name, row in sorted(products.items())
        ],
        "note": "Each conversation is Telnyx Session Analysis cost.total (AI assistant and inference) plus its call-control, SIP, AMD, recording, and noise-suppression detail-record costs, which are not in that tree (anything already in the tree is shown but not added twice). Without a session, it is the detail-record costs alone. Conversations with neither are counted as missing, not zero. Minutes are Telnyx billed_sec for the AI assistant.",
    }


def _call_row(call: Call) -> dict:
    return {
        "billable": conversation_cost(call),
        "session_status": call.session_status,
        "id": str(call.id),
        "started_at": call.started_at.isoformat(),
        "clinic_name": call.clinic.name if call.clinic else None,
        "clinic_code": call.clinic.code if call.clinic else None,
        "assistant_name": call.assistant.label if call.assistant else None,
        "telnyx_assistant_id": call.assistant.telnyx_assistant_id if call.assistant else None,
        "telnyx_conversation_id": call.telnyx_conversation_id,
        "masked_caller": call.masked_caller,
        "direction": call.direction,
        "duration_sec": call.duration_sec,
        "recorded_cost": _money(call.recorded_cost),
        "currency": call.currency,
        "cost_status": call.cost_status,
        "session_cost_total": _money(call.session_cost_total),
        "charges": [
            {
                "service": charge.service,
                "amount": _money(charge.amount),
                "currency": charge.currency,
                "cost_status": charge.cost_status,
                "billed_sec": charge.billed_duration_sec,
            }
            for charge in sorted(call.charges, key=lambda item: item.service)
        ],
    }


def filters_for(db: Session, user) -> dict:

    assistants = db.query(Assistant)
    call_times = db.query(Call.started_at)
    if user.role == "client_user":
        allowed = tuple(
            row[0]
            for row in db.query(UserAssistant.assistant_id)
            .join(Assistant, Assistant.id == UserAssistant.assistant_id)
            .filter(UserAssistant.user_id == user.id, Assistant.client_visible.is_(True))
            .all()
        )
        if not allowed:
            raise HTTPException(status_code=403, detail="This login is not assigned to a Telnyx assistant")
        assistants = assistants.filter(Assistant.id.in_(allowed))
        call_times = call_times.filter(Call.assistant_id.in_(allowed))
    months = {row[0].strftime("%Y-%m") for row in call_times.all()}
    months.add(current_month())
    last_sync = db.query(SyncRun).order_by(SyncRun.started_at.desc()).first()
    return {
        "role": user.role,
        "email": user.email,
        "assistants": [
            {
                "id": str(row.id),
                "name": row.label,
                "telnyx_name": row.name,
                "telnyx_assistant_id": row.telnyx_assistant_id,
            }
            for row in sorted(assistants.all(), key=lambda item: item.label.lower())
        ],
        "months": sorted(months, reverse=True),
        "last_sync_at": last_sync.finished_at.isoformat() if last_sync and last_sync.finished_at else None,
        "last_sync_status": last_sync.status if last_sync else None,
    }


def reconciliation_rows(db: Session, month: str) -> dict:
    start, end = month_window(month)
    rows = (
        db.query(Reconciliation)
        .filter(Reconciliation.window_start == start, Reconciliation.window_end == end)
        .order_by(Reconciliation.product)
        .all()
    )
    return {
        "month": month,
        "timezone": "UTC",
        "account_level": True,
        "note": "Telnyx usage reports are account-wide. They are not filtered by clinic, so this check is only shown to admins.",
        "rows": [
            {
                "product": row.product,
                "currency": row.currency,
                "telnyx_cost": _money(row.telnyx_cost),
                "local_priced_cost": _money(row.local_priced_cost),
                "pending_charge_count": row.pending_charge_count,
                "delta": _money(row.delta),
                "status": row.status,
                "note": row.note,
            }
            for row in rows
        ],
    }
````

## File: zaya-usage-web-main/backend/app/services/production_seed.py
````python
from sqlalchemy.orm import Session

from app.models import Assistant, Client, Clinic, NumberFee
from app.production import CLIENTS, DISPLAY_NAMES, LIST_PRICE, LIST_PRICE_EFFECTIVE, LIST_PRICE_NOTE
from app.services.assistants import seed_known_assistants
from app.services.seed import _ensure_resource


def connection_name(assistant_id: str) -> str:
    return "ai-assistant-" + assistant_id.removeprefix("assistant-")


def seed_production(db: Session) -> None:





    for spec in CLIENTS:
        client = db.query(Client).filter(Client.slug == spec["slug"]).one_or_none()
        if client is None:
            client = Client(name=spec["name"], slug=spec["slug"])
            db.add(client)
            db.flush()
        client.name = spec["name"]
        clinic = (
            db.query(Clinic)
            .filter(Clinic.client_id == client.id, Clinic.code == spec["clinic_code"])
            .one_or_none()
        )
        if clinic is None:
            clinic = Clinic(client_id=client.id, name=spec["clinic_name"], code=spec["clinic_code"])
            db.add(clinic)
            db.flush()
        assistant = db.query(Assistant).filter(Assistant.telnyx_assistant_id == spec["assistant_id"]).one_or_none()
        if assistant is None:
            assistant = Assistant(
                client_id=client.id,
                clinic_id=clinic.id,
                telnyx_assistant_id=spec["assistant_id"],
                name=spec["assistant_name"],
                display_name=DISPLAY_NAMES.get(spec["assistant_id"]),
                client_visible=True,
            )
            db.add(assistant)
            db.flush()
        else:
            assistant.client_id = client.id
            assistant.clinic_id = clinic.id
            assistant.name = spec["assistant_name"]
            if spec["assistant_id"] in DISPLAY_NAMES:
                assistant.display_name = DISPLAY_NAMES[spec["assistant_id"]]
            assistant.client_visible = True
        _ensure_resource(
            db,
            client.id,
            clinic.id,
            "connection",
            connection_name(spec["assistant_id"]),
            connection_name(spec["assistant_id"]),
        )
        _ensure_resource(db, client.id, clinic.id, "billing_group", spec["billing_group_id"], spec["clinic_code"])
        number = _ensure_resource(db, client.id, clinic.id, "number", spec["number_id"], spec["number_id"])
        existing = (
            db.query(NumberFee)
            .filter(NumberFee.resource_id == number.id, NumberFee.effective_on == LIST_PRICE_EFFECTIVE)
            .one_or_none()
        )
        if existing is None:
            db.add(
                NumberFee(
                    resource_id=number.id,
                    monthly_amount=LIST_PRICE,
                    currency="USD",
                    effective_on=LIST_PRICE_EFFECTIVE,
                    proration="full_month",
                    note=LIST_PRICE_NOTE,
                )
            )
    seed_known_assistants(db)
    db.commit()
````

## File: zaya-usage-web-main/backend/app/services/seed.py
````python
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Assistant, Client, Clinic, Resource, User, UserAssistant
from app.security import hash_password
from app.telnyx.fixtures import LOGINS, ORGS, connection_id
from app.telnyx.parse import mask_phone


def seed_demo(db: Session) -> None:




    settings = get_settings()
    if db.query(User).filter(User.email == settings.admin_email).one_or_none() is None:
        db.add(
            User(
                email=settings.admin_email,
                password_hash=hash_password(settings.admin_password),
                role="admin",
                client_id=None,
            )
        )
    for org in ORGS:
        client = db.query(Client).filter(Client.slug == org["slug"]).one_or_none()
        if client is None:
            client = Client(name=org["name"], slug=org["slug"])
            db.add(client)
            db.flush()
        for clinic_spec in org["clinics"]:
            clinic = (
                db.query(Clinic)
                .filter(Clinic.client_id == client.id, Clinic.code == clinic_spec["code"])
                .one_or_none()
            )
            if clinic is None:
                clinic = Clinic(client_id=client.id, name=clinic_spec["name"], code=clinic_spec["code"])
                db.add(clinic)
                db.flush()
            visible = bool(clinic_spec.get("client_visible", True))
            assistant = db.query(Assistant).filter(Assistant.telnyx_assistant_id == clinic_spec["assistant_id"]).one_or_none()
            if assistant is None:
                db.add(
                    Assistant(
                        client_id=client.id,
                        clinic_id=clinic.id,
                        telnyx_assistant_id=clinic_spec["assistant_id"],
                        name=clinic_spec["assistant_name"],
                        client_visible=visible,
                    )
                )
            else:
                assistant.client_id = client.id
                assistant.clinic_id = clinic.id
                assistant.name = clinic_spec["assistant_name"]
                assistant.client_visible = visible
            _ensure_resource(
                db,
                client.id,
                clinic.id,
                "connection",
                connection_id(clinic_spec["assistant_id"]),
                connection_id(clinic_spec["assistant_id"]),
            )
            if clinic_spec.get("billing_group_id"):
                _ensure_resource(
                    db,
                    client.id,
                    clinic.id,
                    "billing_group",
                    clinic_spec["billing_group_id"],
                    clinic_spec["code"],
                )
            _ensure_resource(
                db,
                client.id,
                clinic.id,
                "number",
                clinic_spec["number"],
                mask_phone(clinic_spec["number"]) or clinic_spec["code"],
            )
    db.flush()
    assistants = {row.telnyx_assistant_id: row for row in db.query(Assistant).all()}
    for login in LOGINS:
        first = assistants[login["assistants"][0]]
        user = db.query(User).filter(User.email == login["email"]).one_or_none()
        if user is None:
            user = User(
                email=login["email"],
                password_hash=hash_password(settings.demo_password),
                role="client_user",
                client_id=first.client_id,
            )
            db.add(user)
            db.flush()
        for telnyx_id in login["assistants"]:
            assistant = assistants[telnyx_id]
            exists = (
                db.query(UserAssistant)
                .filter(UserAssistant.user_id == user.id, UserAssistant.assistant_id == assistant.id)
                .one_or_none()
            )
            if exists is None:
                db.add(UserAssistant(user_id=user.id, assistant_id=assistant.id))
    db.commit()


def _ensure_resource(db: Session, client_id, clinic_id, kind: str, telnyx_id: str, label: str) -> Resource:
    row = db.query(Resource).filter(Resource.kind == kind, Resource.telnyx_id == telnyx_id).one_or_none()
    if row is not None:
        return row
    row = Resource(client_id=client_id, clinic_id=clinic_id, kind=kind, telnyx_id=telnyx_id, label=label)
    db.add(row)
    db.flush()
    return row
````

## File: zaya-usage-web-main/backend/app/services/sessions.py
````python
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Call
from app.telnyx.client import TelnyxError
from app.telnyx.parse import parse_cost, parse_int

ROOT_RECORD_TYPE = "ai-voice-assistant"


SETTLE = timedelta(hours=36)


def _s(value: Decimal | None) -> str | None:
    return None if value is None else format(value.quantize(Decimal("0.000001")), "f")


def _walk(node: dict):
    yield node
    for child in node.get("children") or []:
        yield from _walk(child)


def parse_session(tree: dict) -> dict:

    root = tree.get("root") or {}
    products: dict[str, dict] = {}
    ai = {"billed_sec": None, "duration_sec": None, "rate": None, "rate_measured_in": None}
    for node in _walk(root):
        product = node.get("product") or (node.get("record") or {}).get("record_type")
        if not product or product == "call-session":
            continue
        cost = node.get("cost") or {}
        record = node.get("record") or {}
        bucket = products.setdefault(product, {"cost": Decimal("0"), "cost_known": False, "count": 0, "missing": 0, "billed_sec": None})
        bucket["count"] += 1
        amount = parse_cost(cost.get("event_cost"))
        if amount is None:
            bucket["missing"] += 1
        else:
            bucket["cost"] += amount
            bucket["cost_known"] = True
        billed = parse_int(record.get("billed_sec"))
        if billed is not None:
            bucket["billed_sec"] = (bucket["billed_sec"] or 0) + billed
        if product == ROOT_RECORD_TYPE:
            ai["billed_sec"] = billed if billed is not None else ai["billed_sec"]
            ai["duration_sec"] = parse_int(record.get("duration_sec")) or parse_int(record.get("call_sec")) or ai["duration_sec"]
            if record.get("rate") not in (None, "None"):
                ai["rate"] = str(record.get("rate"))
            if record.get("rate_measured_in") not in (None, "None"):
                ai["rate_measured_in"] = str(record.get("rate_measured_in"))
    tree_cost = tree.get("cost") or {}
    total = parse_cost(tree_cost.get("total"))
    if total is None:
        total = parse_cost((root.get("cost") or {}).get("cumulative_cost"))
    currency = tree_cost.get("currency") or (root.get("cost") or {}).get("currency")
    return {
        "total": _s(total),
        "currency": currency,
        "products": {
            name: {
                "cost": _s(row["cost"]) if row["cost_known"] else None,
                "count": row["count"],
                "missing": row["missing"],
                "billed_sec": row["billed_sec"],
            }
            for name, row in sorted(products.items())
        },
        **ai,
    }


def _needs_fetch(call: Call, now: datetime) -> bool:
    if call.session_status in (None, "error"):
        return True
    fetched = call.session_fetched_at
    if fetched is None:
        return True
    if fetched.tzinfo is None:
        fetched = fetched.replace(tzinfo=timezone.utc)
    started = call.started_at if call.started_at.tzinfo else call.started_at.replace(tzinfo=timezone.utc)
    return fetched < started + SETTLE and now >= started + SETTLE


def fetch_sessions(db: Session, source, calls: list[Call], stats: dict, limit: int) -> None:




    now = datetime.now(timezone.utc)
    todo = sorted((call for call in calls if _needs_fetch(call, now)), key=lambda call: call.started_at, reverse=True)
    summary = {"fetched": 0, "missing": 0, "errors": 0, "remaining": max(0, len(todo) - max(limit, 0)), "rate_limited": False}
    stats["sessions"] = summary
    if limit <= 0:
        summary["remaining"] = len(todo)
        return
    for index, call in enumerate(todo[:limit]):
        try:
            tree = source.get_session(ROOT_RECORD_TYPE, call.telnyx_conversation_id, None)
        except TelnyxError as exc:
            if exc.status_code == 429:
                summary["rate_limited"] = True
                summary["remaining"] = len(todo) - index
                break
            call.session_status = "error"
            call.session_fetched_at = now
            summary["errors"] += 1
            continue
        call.session_fetched_at = now
        if not tree:
            call.session_status = "missing"
            summary["missing"] += 1
            continue
        breakdown = parse_session(tree)
        call.session_breakdown = breakdown
        call.session_status = "ok"
        call.session_cost_total = Decimal(breakdown["total"]) if breakdown["total"] is not None else None
        call.session_currency = breakdown["currency"]
        summary["fetched"] += 1
        if index % 25 == 24:
            db.commit()
    db.flush()
````

## File: zaya-usage-web-main/backend/app/services/sync.py
````python
from __future__ import annotations

import copy
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import case, func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.models import Assistant, Call, Charge, Reconciliation, Resource, SyncRun, UsageTotal
from app.services.billing import build_usage_charges, minute_shares, pick_attribution_dimension
from app.services.windows import usage_slices
from app.config import get_settings
from app.services.assistants import refresh_assistants
from app.services.sessions import fetch_sessions
from app.telnyx.client import TelnyxError
from app.telnyx.parse import clean_id, detail_identity, normalize_service, parse_cost, parse_int





RECORD_TYPES = [
    "ai-voice-assistant",
    "call-control",
    "sip-trunking",
    "webrtc",
    "inference",
    "text-to-speech",
    "amd",
    "recording",
    "noise-suppression",
]





USAGE_REPORT_CHARGE_PRODUCTS = {"speech-to-text", "text-to-speech"}
DETAIL_CHARGE_PRODUCTS = {"recording", "noise-suppression"}

MATCH_TOLERANCE = Decimal("0.000001")


class SyncPaused(Exception):





    def __init__(self, message: str, checkpoint: str):
        super().__init__(message)
        self.checkpoint = checkpoint


def sync_window(db: Session, source, start: datetime, end: datetime) -> SyncRun:
    run = SyncRun(
        started_at=datetime.now(timezone.utc),
        status="running",
        window_start=start,
        window_end=end,
        mode=getattr(source, "mode", "fixture"),
        stats={},
    )
    db.add(run)
    db.commit()
    run_id = run.id
    stats: dict = _empty_stats()
    try:
        stats["assistants"] = refresh_assistants(db, source)
        db.commit()
        _ingest(db, source, start, end, stats, run)
        run = db.get(SyncRun, run_id)
        run.status = "succeeded"
        run.error = None
        run.finished_at = datetime.now(timezone.utc)
        run.stats = _public_stats(stats)
        db.commit()
        return run
    except SyncPaused as exc:
        db.rollback()
        run = db.get(SyncRun, run_id)
        stored = dict(run.stats or {})
        stored["paused_on"] = exc.checkpoint
        run.stats = stored
        run.status = "paused"
        run.error = str(exc)[:2000]
        run.finished_at = datetime.now(timezone.utc)
        db.commit()
        return run
    except Exception as exc:
        db.rollback()
        run = db.get(SyncRun, run_id)
        run.status = "failed"
        run.error = str(exc)[:2000]
        run.finished_at = datetime.now(timezone.utc)
        db.commit()
        return run


def _empty_stats() -> dict:
    return {
        "calls": 0,
        "charges": 0,
        "unmapped": 0,
        "skipped_record_types": [],
        "conversations_truncated": False,
        "session_misses": 0,
        "rollup_mismatches": 0,
        "completed": [],
        "usage_sums": {},
        "skipped_usage_products": [],
        "resumed": False,
    }


def _public_stats(stats: dict) -> dict:
    return {
        "calls": stats.get("calls", 0),
        "charges": stats.get("charges", 0),
        "unmapped": stats.get("unmapped", 0),
        "skipped_record_types": list(stats.get("skipped_record_types") or []),
        "conversations_truncated": False,
        "session_misses": stats.get("session_misses", 0),
        "rollup_mismatches": stats.get("rollup_mismatches", 0),
        "completed": list(stats.get("completed") or []),
        "usage_sums": copy.deepcopy(stats.get("usage_sums") or {}),
        "skipped_usage_products": list(stats.get("skipped_usage_products") or []),
        "resumed": bool(stats.get("resumed")),
        **({"assistants": dict(stats["assistants"])} if stats.get("assistants") else {}),
        **({"sessions": dict(stats["sessions"])} if stats.get("sessions") else {}),
        **({"usage_products": list(stats["usage_products"])} if stats.get("usage_products") is not None else {}),
    }


def _prior_checkpoint(db: Session, start: datetime, end: datetime, current_id) -> dict | None:






    previous = (
        db.query(SyncRun)
        .filter(SyncRun.window_start == start, SyncRun.window_end == end, SyncRun.id != current_id)
        .order_by(SyncRun.started_at.desc())
        .first()
    )
    if previous is None or previous.status == "succeeded":
        return None
    stats = previous.stats or {}
    if not stats.get("completed") and not stats.get("usage_sums"):
        return None
    return stats


def _mark(db: Session, run: SyncRun, stats: dict, key: str | None = None) -> None:
    if key:
        completed = list(stats.get("completed") or [])
        if key not in completed:
            completed.append(key)
        stats["completed"] = completed
    run.stats = _public_stats(stats)
    db.commit()


def _next_page(completed: set[str], prefix: str) -> int | None:
    if f"{prefix}:done" in completed:
        return None
    marker = f"{prefix}:page:"
    highest = 0
    for key in completed:
        if key.startswith(marker):
            try:
                highest = max(highest, int(key[len(marker) :]))
            except ValueError:
                continue
    return highest + 1


def _page_done(body: dict, page: int, page_size: int) -> bool:
    rows = body.get("data") or []
    if not rows:
        return True
    meta = body.get("meta") or {}
    total_pages = meta.get("total_pages")
    if total_pages is None:
        size = int(meta.get("page_size") or page_size)
        return len(rows) < size
    return page >= int(total_pages)


def _ingest(db: Session, source, start: datetime, end: datetime, stats: dict, run: SyncRun) -> None:
    prior = _prior_checkpoint(db, start, end, run.id)
    if prior:
        stats["completed"] = list(prior.get("completed") or [])
        stats["usage_sums"] = copy.deepcopy(prior.get("usage_sums") or {})
        stats["resumed"] = True
        _mark(db, run, stats)

    assistants = db.query(Assistant).all()
    by_assistant = {row.telnyx_assistant_id: (row.id, row.client_id, row.clinic_id) for row in assistants}
    resources = db.query(Resource).all()
    by_connection = {row.telnyx_id: row.client_id for row in resources if row.kind == "connection"}
    completed = set(stats.get("completed") or [])
    durations: dict[str, tuple[int, int]] = {}

    for record_type in RECORD_TYPES:
        prefix = f"detail:{record_type}"
        page = _next_page(completed, prefix)
        if page is None:
            continue
        while page <= 10000:
            key = f"{prefix}:page:{page}"
            try:
                body = source.detail_page(record_type, start, end, page)
            except TelnyxError as exc:
                if exc.status_code == 400:
                    stats["skipped_record_types"].append(record_type)
                    _mark(db, run, stats, f"{prefix}:done")
                    completed.add(f"{prefix}:done")
                    break
                if exc.status_code == 429:
                    raise SyncPaused(str(exc), key) from exc
                raise
            rows = list(body.get("data") or [])
            if record_type == "ai-voice-assistant":
                for record in rows:
                    if _upsert_call_from_detail(db, record, by_assistant):
                        stats["calls"] += 1
                db.flush()
            calls, by_session, by_conversation, by_leg = _call_index(db, start, end)
            for record in rows:
                _ingest_detail(db, record, by_session, by_conversation, by_leg, by_connection, durations, stats)
            for call in calls:
                if call.telnyx_conversation_id in durations:
                    call.duration_sec = durations[call.telnyx_conversation_id][1]
            _mark(db, run, stats, key)
            completed.add(key)
            page_size = int((body.get("meta") or {}).get("page_size") or 50)
            if _page_done(body, page, page_size):
                _mark(db, run, stats, f"{prefix}:done")
                completed.add(f"{prefix}:done")
                break
            page += 1

    calls, _, _, _ = _call_index(db, start, end)
    fetch_sessions(db, source, calls, stats, get_settings().session_analysis_max_per_run)
    _recompute_calls(db, calls, stats)
    _reconcile(db, source, start, end, stats, run)
    db.flush()


def _call_index(db: Session, start: datetime, end: datetime):
    calls = db.query(Call).filter(Call.started_at >= start, Call.started_at < end).all()
    by_session = _unique_index(calls, "telnyx_call_session_id")
    by_conversation = {call.telnyx_conversation_id: call for call in calls}
    by_leg = _unique_index(calls, "telnyx_call_leg_id")
    return calls, by_session, by_conversation, by_leg


def _unique_index(calls: list[Call], field: str) -> dict:






    index: dict = {}
    ambiguous: set = set()
    for call in calls:
        key = getattr(call, field)
        if not key:
            continue
        if key in index and index[key].id != call.id:
            ambiguous.add(key)
        index[key] = call
    for key in ambiguous:
        index.pop(key, None)
    return index


def _upsert_call_from_detail(db: Session, record: dict, by_assistant: dict[str, tuple]) -> bool:
    conversation_id = clean_id(record.get("conversation_id"))
    assistant_id = clean_id(record.get("assistant_id"))
    assistant = by_assistant.get(assistant_id) if assistant_id else None
    if assistant is None or not conversation_id:
        return False
    started = _first_time(record)
    if started is None:
        return False
    assistant_pk, client_id, clinic_id = assistant
    caller = caller_from_record(record)
    values = {
        "client_id": client_id,
        "clinic_id": clinic_id,
        "assistant_id": assistant_pk,
        "telnyx_conversation_id": conversation_id,
        "telnyx_call_control_id": clean_id(record.get("call_control_id")),
        "telnyx_call_session_id": clean_id(record.get("telnyx_session_id")) or clean_id(record.get("call_session_id")),
        "telnyx_call_leg_id": clean_id(record.get("telnyx_leg_id")) or clean_id(record.get("call_leg_id")),
        "started_at": started,
        "direction": clean_id(record.get("direction")),
        "masked_caller": _caller_value(caller),
        "duration_sec": parse_int(record.get("duration_sec")) if "duration_sec" in record else None,
        "channel": "phone_call",
        "cost_status": "pending",
    }
    stmt = pg_insert(Call).values(**values)
    excluded = stmt.excluded
    stmt = stmt.on_conflict_do_update(
        index_elements=["telnyx_conversation_id"],
        set_={
            "client_id": excluded.client_id,
            "clinic_id": excluded.clinic_id,
            "assistant_id": excluded.assistant_id,
            "telnyx_call_control_id": func.coalesce(excluded.telnyx_call_control_id, Call.telnyx_call_control_id),
            "telnyx_call_session_id": func.coalesce(excluded.telnyx_call_session_id, Call.telnyx_call_session_id),
            "telnyx_call_leg_id": func.coalesce(excluded.telnyx_call_leg_id, Call.telnyx_call_leg_id),
            "started_at": excluded.started_at,
            "direction": func.coalesce(excluded.direction, Call.direction),
            "masked_caller": func.coalesce(excluded.masked_caller, Call.masked_caller),
            "duration_sec": func.coalesce(excluded.duration_sec, Call.duration_sec),
        },
    )
    db.execute(stmt)
    return True


def _caller_value(value) -> str | None:

    text = clean_id(value)
    return text[:32] if text else None


def caller_from_record(record: dict) -> str | None:







    meta = record.get("metadata") if isinstance(record.get("metadata"), dict) else {}
    target = clean_id(record.get("telnyx_end_user_target")) or clean_id(meta.get("telnyx_end_user_target"))
    if target:
        return target
    outbound = str(record.get("direction") or "").lower().startswith("out")
    from_side = (
        clean_id(record.get("cli"))
        or clean_id(record.get("caller_number"))
        or clean_id(record.get("from"))
        or clean_id(meta.get("from"))
    )
    to_side = (
        clean_id(record.get("cld"))
        or clean_id(record.get("dest_number"))
        or clean_id(record.get("to"))
        or clean_id(meta.get("to"))
    )
    return to_side if outbound else from_side


def _ingest_detail(db, record, by_session, by_conversation, by_leg, by_connection, durations, stats) -> None:
    service, record_id, source = detail_identity(record)
    if service is None or record_id is None:
        stats["unmapped"] += 1
        return


    if service == "text-to-speech" and "cost" not in record:
        return
    call = _match_call(record, by_session, by_conversation, by_leg)
    _apply_direction(service, record, call)
    _apply_duration(service, record, call, durations)
    client_id = call.client_id if call else None
    if client_id is None:
        client_id = by_connection.get(str(record.get("connection_id") or ""))
        if client_id is None:
            stats["unmapped"] += 1
            return
    _upsert_charge(
        db,
        {
            "client_id": client_id,
            "call_id": call.id if call else None,
            "service": service,
            "telnyx_record_id": record_id,
            "source_name": source,
            "amount": parse_cost(record.get("cost")) if "cost" in record else None,
            "currency": clean_id(record.get("currency")),
            "billed_duration_sec": parse_int(record.get("billed_sec")) if "billed_sec" in record else None,
            "rate": parse_cost(record.get("rate")) if "rate" in record else None,
            "rate_unit": clean_id(record.get("rate_measured_in")),
            "occurred_at": _first_time(record),
        },
    )
    stats["charges"] += 1


LEG_SERVICES = {"call-control", "sip-trunking", "webrtc"}


def _record_leg(record: dict) -> str | None:
    return clean_id(record.get("telnyx_leg_id")) or clean_id(record.get("call_leg_id"))


def _apply_direction(service: str, record: dict, call: Call | None) -> None:









    if call is None or service not in LEG_SERVICES or not record.get("direction"):
        return
    leg = _record_leg(record)
    own_leg = bool(call.telnyx_call_leg_id) and leg == call.telnyx_call_leg_id
    if not own_leg and (call.telnyx_call_leg_id or call.direction):
        return
    call.direction = str(record["direction"])
    caller = _caller_value(caller_from_record(record))
    if caller and (own_leg or not call.masked_caller or "•" in call.masked_caller):
        call.masked_caller = caller





_DURATION_RANK = {"ai-voice-assistant": 0, "call-control": 1, "webrtc": 2}


def _apply_duration(service: str, record: dict, call: Call | None, durations: dict[str, tuple[int, int]]) -> None:
    if call is None or service not in _DURATION_RANK:
        return
    field = "duration_sec" if service == "ai-voice-assistant" else "call_sec"
    if field not in record:
        return
    parsed = parse_int(record.get(field))
    if parsed is None:
        return
    key = call.telnyx_conversation_id
    rank = _DURATION_RANK[service]
    if key in durations:
        if durations[key][0] < rank:
            return
    elif rank > 0 and call.duration_sec is not None:

        return
    durations[key] = (rank, parsed)
    call.duration_sec = parsed


def _match_call(record: dict, by_session, by_conversation, by_leg) -> Call | None:

    conversation_id = clean_id(record.get("conversation_id"))
    if conversation_id and conversation_id in by_conversation:
        return by_conversation[conversation_id]
    session_id = clean_id(record.get("telnyx_session_id")) or clean_id(record.get("call_session_id"))
    if session_id and session_id in by_session:
        return by_session[session_id]
    leg_id = clean_id(record.get("telnyx_leg_id")) or clean_id(record.get("call_leg_id"))
    if leg_id and leg_id in by_leg:
        return by_leg[leg_id]
    return None


def _upsert_charge(db: Session, values: dict) -> None:
    values["cost_status"] = "recorded" if values.get("amount") is not None else "pending"
    stmt = pg_insert(Charge).values(**values)
    excluded = stmt.excluded
    stmt = stmt.on_conflict_do_update(
        constraint="uq_charges_service_record",
        set_={
            "amount": case((excluded.amount.is_(None), Charge.amount), else_=excluded.amount),
            "cost_status": case((excluded.amount.is_(None), Charge.cost_status), else_="recorded"),
            "currency": func.coalesce(excluded.currency, Charge.currency),
            "billed_duration_sec": func.coalesce(excluded.billed_duration_sec, Charge.billed_duration_sec),
            "rate": func.coalesce(excluded.rate, Charge.rate),
            "rate_unit": func.coalesce(excluded.rate_unit, Charge.rate_unit),
            "call_id": func.coalesce(Charge.call_id, excluded.call_id),
            "client_id": func.coalesce(Charge.client_id, excluded.client_id),
            "clinic_id": func.coalesce(excluded.clinic_id, Charge.clinic_id),
            "allocation_method": func.coalesce(excluded.allocation_method, Charge.allocation_method),
            "occurred_at": func.coalesce(Charge.occurred_at, excluded.occurred_at),
            "source_name": func.coalesce(excluded.source_name, Charge.source_name),
        },
    )
    db.execute(stmt)


def _recompute_calls(db: Session, calls: list[Call], stats: dict) -> None:
    if not calls:
        return
    call_ids = [call.id for call in calls]
    charges = db.query(Charge).filter(Charge.call_id.in_(call_ids)).all()
    grouped: dict = {call.id: [] for call in calls}
    for charge in charges:
        grouped.setdefault(charge.call_id, []).append(charge)
    for call in calls:
        rows = grouped.get(call.id, [])
        if not rows or any(row.amount is None for row in rows):
            call.cost_status = "pending"
            call.recorded_cost = None
            continue
        currencies = {(row.currency or "USD") for row in rows}
        if len(currencies) > 1:
            call.cost_status = "unknown"
            call.recorded_cost = None
            call.currency = None
            continue
        total = sum((row.amount for row in rows), Decimal("0"))
        call.cost_status = "recorded"
        call.recorded_cost = total
        call.currency = currencies.pop()
        if call.session_cost_total is not None and call.session_cost_total != total:
            stats["rollup_mismatches"] += 1


def _reconcile(db: Session, source, start: datetime, end: datetime, stats: dict, run: SyncRun) -> None:
    try:
        options = source.usage_options() or {}
    except TelnyxError as exc:
        if exc.status_code == 429:
            raise SyncPaused(str(exc), "usage_options") from exc
        raise
    assistants = db.query(Assistant).all()
    resources = db.query(Resource).all()
    calls, _, _, _ = _call_index(db, start, end)
    visible = {row.id for row in assistants if row.client_visible}
    shares = minute_shares(calls, visible)
    by_connection = {row.telnyx_id: row for row in resources if row.kind == "connection"}
    by_billing_group = {row.telnyx_id: row for row in resources if row.kind == "billing_group"}
    lookups = {
        "billing_group_id": {key: (row.client_id, row.clinic_id) for key, row in by_billing_group.items()},
        "connection_id": {key: (row.client_id, row.clinic_id) for key, row in by_connection.items()},
        "assistant_id": {row.telnyx_assistant_id: (row.client_id, row.clinic_id) for row in assistants},
    }
    completed = set(stats.get("completed") or [])
    for product, option in options.items():
        if str(product).startswith("conference"):
            continue
        canonical = normalize_service(product) or product
        product_key = f"usage:{canonical}:done"
        if product_key in completed:
            continue
        metrics = list(option.get("product_metrics") or [])
        dimensions = list(option.get("product_dimensions") or [])
        if "cost" not in metrics:
            _save_usage(db, product, start, end, "USD", None, None, None, False)
            _mark(db, run, stats, product_key)
            completed.add(product_key)
            continue
        requested = _usage_dimensions(canonical, dimensions)
        metric_names = [item for item in ("cost", "billed_sec", "call_sec") if item in metrics and item != "cost5d"]
        report_dimensions = ["currency"]
        for name in requested:
            if name not in report_dimensions and name != "cost5d":
                report_dimensions.append(name)
        skipped = False
        for slice_start, slice_end in usage_slices(start, end):
            label = slice_start.strftime("%Y-%m-%dT%H:%M:%SZ")
            slice_key = f"usage:{canonical}:{label}:done"
            if slice_key in completed:
                continue
            rows: list[dict] = []
            page = 1
            while page <= 1000:
                checkpoint = f"usage:{canonical}:{label}:page:{page}"
                try:
                    body = source.usage_page(
                        product,
                        slice_start,
                        slice_end,
                        page,
                        metrics=metric_names,
                        dimensions=report_dimensions,
                    )
                except TelnyxError as exc:
                    if exc.status_code == 400:
                        skipped = True
                        break
                    if exc.status_code == 429:
                        raise SyncPaused(str(exc), checkpoint) from exc
                    raise
                rows.extend(body.get("data") or [])
                if _page_done(body, page, int((body.get("meta") or {}).get("page_size") or 5000)):
                    break
                page += 1
            if skipped:
                break
            if canonical in DETAIL_CHARGE_PRODUCTS:
                _drop_usage_charges(db, canonical, slice_start, slice_end)
            if canonical in USAGE_REPORT_CHARGE_PRODUCTS:
                _replace_usage_charges(db, canonical, rows, dimensions, slice_start, slice_end, lookups, shares, stats)
            if rows:
                _merge_usage_sum(stats, canonical, rows)
            _mark(db, run, stats, slice_key)
            completed.add(slice_key)
        if skipped:
            stats.setdefault("skipped_usage_products", []).append(product)
            _save_usage(db, product, start, end, "USD", None, None, None, False)
            _mark(db, run, stats, product_key)
            completed.add(product_key)
            continue
        _persist_usage_total(db, canonical, start, end, (stats.get("usage_sums") or {}).get(canonical) or {})
        _mark(db, run, stats, product_key)
        completed.add(product_key)
    db.flush()
    _write_reconciliations(db, start, end)
    stats["usage_products"] = sorted(options)


def _usage_dimensions(service: str, dimensions: list[str]) -> list[str]:
    chosen = []
    attribution = pick_attribution_dimension(dimensions) if service in USAGE_REPORT_CHARGE_PRODUCTS else None
    if attribution:
        chosen.append(attribution)
    elif service in USAGE_REPORT_CHARGE_PRODUCTS and "billing_group_id" in dimensions:
        chosen.append("billing_group_id")
    if service == "sip-trunking" and "datetime" in dimensions:
        chosen.append("datetime")
    elif "date" in dimensions:
        chosen.append("date")
    return chosen


def _drop_usage_charges(db, service, start, end) -> None:

    db.query(Charge).filter(
        Charge.service == service,
        Charge.source_name == "usage_report",
        Charge.occurred_at >= start,
        Charge.occurred_at < end,
    ).delete(synchronize_session=False)


def _replace_usage_charges(db, service, rows, dimensions, start, end, lookups, shares, stats) -> None:






    db.query(Charge).filter(
        Charge.service == service,
        Charge.source_name == "usage_report",
        Charge.occurred_at >= start,
        Charge.occurred_at < end,
    ).delete(synchronize_session=False)
    db.flush()
    db.expire_all()
    charges, unallocated = build_usage_charges(
        service=service,
        rows=rows,
        dimensions=dimensions,
        start=start,
        lookups=lookups,
        minute_shares=shares,
    )
    if unallocated > 0:
        stats["unmapped"] = stats.get("unmapped", 0) + 1
    for charge in charges:
        _upsert_charge(db, charge)
        stats["charges"] += 1


def _merge_usage_sum(stats: dict, product: str, rows: list[dict]) -> None:
    sums = stats.setdefault("usage_sums", {})
    bucket = dict(sums.get(product) or {})
    for currency, piece in _sum_usage(rows).items():
        current = dict(bucket.get(currency) or {})
        if not current:
            bucket[currency] = {
                "cost": None if piece["cost"] is None else str(piece["cost"]),
                "cost_known": bool(piece["cost_known"] and piece["cost"] is not None),
                "billed_sec": None if piece["billed_sec"] is None else str(piece["billed_sec"]),
                "call_sec": None if piece["call_sec"] is None else str(piece["call_sec"]),
            }
            continue
        if not current.get("cost_known") or not piece["cost_known"] or piece["cost"] is None:
            current["cost_known"] = False
            current["cost"] = None
        else:
            current["cost"] = str(Decimal(current["cost"]) + piece["cost"])
        for key in ("billed_sec", "call_sec"):
            extra = piece[key]
            if extra is None:
                continue
            base = Decimal(current[key]) if current.get(key) is not None else Decimal("0")
            current[key] = str(base + extra)
        bucket[currency] = current
    sums[product] = bucket
    stats["usage_sums"] = sums


def _persist_usage_total(db: Session, product: str, start: datetime, end: datetime, bucket: dict) -> None:
    if not bucket:

        _save_usage(db, product, start, end, "USD", None, None, None, False)
        return
    for currency, piece in bucket.items():
        cost = Decimal(piece["cost"]) if piece.get("cost_known") and piece.get("cost") is not None else None
        billed = Decimal(piece["billed_sec"]) if piece.get("billed_sec") is not None else None
        call_sec = Decimal(piece["call_sec"]) if piece.get("call_sec") is not None else None
        _save_usage(db, product, start, end, currency, cost, billed, call_sec, cost is not None)


def _sum_usage(rows: list[dict]) -> dict[str, dict]:
    buckets: dict[str, dict] = {}
    for row in rows:
        currency = str(row.get("currency") or "USD")
        bucket = buckets.setdefault(currency, {"cost": Decimal("0"), "cost_known": True, "billed_sec": None, "call_sec": None})
        if "cost" not in row or parse_cost(row.get("cost")) is None:
            bucket["cost_known"] = False
            bucket["cost"] = None
        elif bucket["cost_known"]:
            bucket["cost"] += parse_cost(row.get("cost"))
        for key, target in (("billed_sec", "billed_sec"), ("call_sec", "call_sec")):
            if key in row and row.get(key) is not None:
                piece = Decimal(str(row[key]))
                bucket[target] = (bucket[target] or Decimal("0")) + piece
    return buckets


def _save_usage(db, product, start, end, currency, cost, billed, call_sec, available: bool) -> None:
    values = {
        "product": normalize_service(product) or product,
        "window_start": start,
        "window_end": end,
        "currency": currency,
        "telnyx_cost": cost,
        "telnyx_billed_sec": billed,
        "telnyx_call_sec": call_sec,
        "available": available and cost is not None,
    }
    stmt = pg_insert(UsageTotal).values(**values)
    excluded = stmt.excluded
    stmt = stmt.on_conflict_do_update(
        constraint="uq_usage_window",
        set_={
            "telnyx_cost": excluded.telnyx_cost,
            "telnyx_billed_sec": excluded.telnyx_billed_sec,
            "telnyx_call_sec": excluded.telnyx_call_sec,
            "available": excluded.available,
        },
    )
    db.execute(stmt)


def _write_reconciliations(db: Session, start: datetime, end: datetime) -> None:
    usage_rows = db.query(UsageTotal).filter(UsageTotal.window_start == start, UsageTotal.window_end == end).all()
    usage_by = {(row.product, row.currency): row for row in usage_rows}
    charges = db.query(Charge).filter(Charge.occurred_at >= start, Charge.occurred_at < end).all()
    local: dict[tuple[str, str], dict] = {}
    detail_keys: set[tuple[str, str]] = set()
    for charge in charges:
        if charge.source_name == "usage_report":
            continue
        currency = charge.currency or "USD"
        detail_keys.add((charge.service, currency))
        bucket = local.setdefault((charge.service, currency), {"priced": Decimal("0"), "priced_known": True, "pending": 0})
        if charge.amount is None:
            bucket["pending"] += 1
        else:
            bucket["priced"] += charge.amount
    products = set(usage_by) | set(local)
    for product, currency in products:
        usage = usage_by.get((product, currency))
        bucket = local.get((product, currency), {"priced": Decimal("0"), "pending": 0})
        telnyx_cost = usage.telnyx_cost if usage and usage.available else None
        local_cost = bucket["priced"]
        pending = bucket["pending"]
        has_detail = (product, currency) in detail_keys
        if usage and usage.available and telnyx_cost is not None and not has_detail:
            status = "usage_report"
            local_cost = telnyx_cost
            delta = None
            pending = 0
            note = (
                "No per-call detail records for this product. The cost is the usage-report total. "
                "Clinic views show the portion tagged with their billing group. It is not added to any call."
            )
        elif usage is None or not usage.available or telnyx_cost is None:
            status = "unavailable"
            delta = None
            note = "Telnyx usage reports did not return a cost for this product. Local charges are not treated as the account total."
        elif pending:
            delta = telnyx_cost - local_cost
            status = "incomplete"
            note = f"{pending} charge rows still have no cost. Priced rows are not a finished total."
        else:
            delta = telnyx_cost - local_cost
            if abs(delta) <= MATCH_TOLERANCE:
                status = "match"
                note = "Priced charge rows match the Telnyx usage-report cost for this window."
            else:
                status = "discrepancy"
                note = "Priced charge rows do not match the Telnyx usage-report cost. Nothing was forced to zero."
        values = {
            "product": product,
            "window_start": start,
            "window_end": end,
            "currency": currency,
            "telnyx_cost": telnyx_cost,
            "local_priced_cost": local_cost,
            "pending_charge_count": pending,
            "delta": delta,
            "status": status,
            "note": note,
        }
        stmt = pg_insert(Reconciliation).values(**values)
        excluded = stmt.excluded
        stmt = stmt.on_conflict_do_update(
            constraint="uq_recon_window",
            set_={
                "telnyx_cost": excluded.telnyx_cost,
                "local_priced_cost": excluded.local_priced_cost,
                "pending_charge_count": excluded.pending_charge_count,
                "delta": excluded.delta,
                "status": excluded.status,
                "note": excluded.note,
            },
        )
        db.execute(stmt)


def _first_time(record: dict) -> datetime | None:
    for key in ("started_at", "created_at", "invoked_at"):
        parsed = _parse_time(clean_id(record.get(key)))
        if parsed is not None:
            return parsed
    return None


def _parse_time(value) -> datetime | None:
    if not value or not isinstance(value, str):
        return None
    text = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed










LIVE_LOOKBACK = timedelta(hours=26)


LIVE_RECORD_TYPES = ["ai-voice-assistant", "call-control", "recording", "noise-suppression"]
LIVE_MAX_PAGES = 20
LIVE_SESSION_LIMIT = 40


def live_window(month_start: datetime, month_end: datetime, now: datetime | None = None) -> tuple[datetime, datetime] | None:

    now = now or datetime.now(timezone.utc)
    start = max(month_start, now - LIVE_LOOKBACK)
    end = min(month_end, now + timedelta(minutes=1))
    if end <= start:
        return None
    return start, end


def live_refresh(db: Session, source, start: datetime, end: datetime, assistant_pks: set | None) -> dict:





    stats = _empty_stats()
    assistants = db.query(Assistant).all()
    by_assistant = {
        row.telnyx_assistant_id: (row.id, row.client_id, row.clinic_id)
        for row in assistants
        if assistant_pks is None or row.id in assistant_pks
    }
    resources = db.query(Resource).all()
    by_connection = {row.telnyx_id: row.client_id for row in resources if row.kind == "connection"}
    durations: dict[str, tuple[int, int]] = {}
    for record_type in LIVE_RECORD_TYPES:
        page = 1
        while page <= LIVE_MAX_PAGES:
            try:
                body = source.detail_page(record_type, start, end, page)
            except TelnyxError as exc:
                if exc.status_code == 400:
                    break
                raise
            rows = list(body.get("data") or [])
            if record_type == "ai-voice-assistant":
                for record in rows:
                    if _upsert_call_from_detail(db, record, by_assistant):
                        stats["calls"] += 1
                db.flush()
            _calls, by_session, by_conversation, by_leg = _call_index(db, start, end)
            for record in rows:
                _ingest_detail(db, record, by_session, by_conversation, by_leg, by_connection, durations, stats)
            db.commit()
            page_size = int((body.get("meta") or {}).get("page_size") or 50)
            if _page_done(body, page, page_size):
                break
            page += 1
    calls, _, _, _ = _call_index(db, start, end)
    scoped = [call for call in calls if assistant_pks is None or call.assistant_id in assistant_pks]
    for call in scoped:
        if call.telnyx_conversation_id in durations:
            call.duration_sec = durations[call.telnyx_conversation_id][1]
    fetch_sessions(db, source, scoped, stats, LIVE_SESSION_LIMIT)
    _recompute_calls(db, calls, stats)
    db.commit()
    return {
        "window_start": start.isoformat(),
        "window_end": end.isoformat(),
        "calls_seen": stats["calls"],
        "charges_seen": stats["charges"],
        "sessions": stats.get("sessions"),
    }
````

## File: zaya-usage-web-main/backend/app/services/windows.py
````python
from datetime import datetime, timedelta, timezone


def month_window(month: str) -> tuple[datetime, datetime]:
    year_text, month_text = month.split("-")
    year, mon = int(year_text), int(month_text)
    if mon < 1 or mon > 12:
        raise ValueError("month must be YYYY-MM")
    start = datetime(year, mon, 1, tzinfo=timezone.utc)
    if mon == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, mon + 1, 1, tzinfo=timezone.utc)
    return start, end


def current_month(now: datetime | None = None) -> str:
    now = now or datetime.now(timezone.utc)
    return now.strftime("%Y-%m")


def usage_slices(start: datetime, end: datetime) -> list[tuple[datetime, datetime]]:






    if end <= start:
        return []
    if end - start <= timedelta(days=31):
        return [(start, end)]
    slices: list[tuple[datetime, datetime]] = []
    cursor = start
    while cursor < end:
        nxt = min(cursor + timedelta(days=1), end)
        slices.append((cursor, nxt))
        cursor = nxt
    return slices


def default_sync_windows(now: datetime | None = None) -> list[tuple[datetime, datetime]]:

    now = now or datetime.now(timezone.utc)
    start, end = month_window(current_month(now))
    if start.month == 1:
        previous = month_window(f"{start.year - 1}-12")
    else:
        previous = month_window(f"{start.year}-{start.month - 1:02d}")
    return [previous, (start, end)]
````

## File: zaya-usage-web-main/backend/app/telnyx/__init__.py
````python

````

## File: zaya-usage-web-main/backend/app/telnyx/client.py
````python
from __future__ import annotations

import random
import time
from collections.abc import Callable, Iterator
from datetime import datetime
from typing import Any

import httpx

from app.telnyx.fixtures import MONTHS, USAGE_OPTIONS
from app.telnyx.limiter import RateLimiter, get_limiter, header_delay, jitter


DETAIL_PAGE_SIZE = 50
USAGE_PAGE_SIZE = 5000
PAGE_SIZE = DETAIL_PAGE_SIZE
CONVERSATION_PAGE_SIZE = 100



DETAIL_TIME_FIELDS = {
    "call-control": "started_at",
    "sip-trunking": "started_at",
    "webrtc": "started_at",
    "ai-voice-assistant": "created_at",
    "inference": "created_at",
    "tts": "created_at",
    "text-to-speech": "created_at",
    "amd": "invoked_at",
    "recording": "started_at",
    "noise-suppression": "started_at",
}


class TelnyxError(RuntimeError):
    def __init__(self, message: str, status_code: int | None = None, retry_after: float | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.retry_after = retry_after


def request_with_retry(
    do: Callable[[], httpx.Response],
    *,
    attempts: int = 5,
    sleep: Callable[[float], None] = time.sleep,
    rng: random.Random | None = None,
    now: Callable[[], float] | None = None,
) -> httpx.Response:





    rng = rng or random.Random()
    now = now or time.time
    delay = 0.5
    last: Exception | None = None
    for attempt in range(attempts):
        try:
            response = do()
        except httpx.TransportError as exc:
            last = exc
            if attempt == attempts - 1:
                raise TelnyxError(str(exc)) from exc
            sleep(delay + jitter(rng, delay))
            delay *= 2
            continue
        if response.status_code == 429 or response.status_code >= 500:
            retry_after = header_delay(response, now())
            if attempt == attempts - 1:
                raise TelnyxError(
                    f"Telnyx HTTP {response.status_code}",
                    status_code=response.status_code,
                    retry_after=retry_after,
                )
            wait = delay if retry_after is None else retry_after
            sleep(wait + jitter(rng, wait))
            delay *= 2
            continue
        if response.status_code >= 400:
            raise TelnyxError(f"Telnyx HTTP {response.status_code}: {response.text[:300]}", response.status_code)
        return response
    raise TelnyxError(str(last) if last else "Telnyx request failed")


def iter_until_empty(fetch: Callable[[int], dict], page_size: int, max_pages: int = 10000) -> tuple[list[dict], bool]:






    rows: list[dict] = []
    page = 1
    while page <= max_pages:
        body = fetch(page)
        chunk = list(body.get("data") or [])
        if not chunk:
            return rows, False
        rows.extend(chunk)
        if len(chunk) < page_size:
            return rows, False
        page += 1
    return rows, True


def iter_pages(fetch: Callable[[int], dict]) -> Iterator[dict]:
    page = 1
    while page <= 10000:
        body = fetch(page)
        for row in body.get("data") or []:
            yield row
        meta = body.get("meta") or {}
        total_pages = int(meta.get("total_pages") or 1)
        if page >= total_pages:
            return
        page += 1
    raise TelnyxError("detail record pagination exceeded 10000 pages")


class FixtureTelnyx:


    mode = "fixture"

    def __init__(self, page_size: int = PAGE_SIZE):
        self.page_size = page_size

    def _month(self, start: datetime) -> dict:
        label = start.strftime("%Y-%m")
        if label not in MONTHS:
            return {"conversations": {"data": []}, "detail_records": {}, "sessions": {}, "usage_reports": {}}
        return MONTHS[label]

    def list_assistants(self) -> list[dict]:
        from app.telnyx.fixtures import ORGS

        return [
            {"id": clinic["assistant_id"], "name": clinic["assistant_name"]}
            for org in ORGS
            for clinic in org["clinics"]
        ]

    def list_conversations(self, start: datetime, end: datetime, assistant_id: str) -> tuple[list[dict], bool]:
        rows = []
        for row in self._month(start)["conversations"]["data"]:
            created = datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
            meta = row.get("metadata") or {}
            if meta.get("assistant_id") != assistant_id:
                continue
            if start <= created < end:
                rows.append(row)
        return rows, False

    def detail_page(self, record_type: str, start: datetime, end: datetime, page: int) -> dict:
        records = list(self._month(start)["detail_records"].get(record_type, []))
        begin = (page - 1) * self.page_size
        chunk = records[begin : begin + self.page_size]
        total_pages = max(1, (len(records) + self.page_size - 1) // self.page_size) if records else 1
        return {
            "data": chunk,
            "meta": {
                "page_number": page,
                "page_size": self.page_size,
                "total_pages": total_pages,
                "total_results": len(records),
            },
        }

    def iter_detail_records(self, record_type: str, start: datetime, end: datetime) -> Iterator[dict]:
        page = 1
        while page <= 10000:
            body = self.detail_page(record_type, start, end, page)
            rows = list(body.get("data") or [])
            if not rows:
                return
            yield from rows
            if page >= int((body.get("meta") or {}).get("total_pages") or 1):
                return
            page += 1

    def get_session(self, record_type: str, event_id: str, when: datetime | None) -> dict | None:
        del when
        for month in MONTHS.values():
            tree = month["sessions"].get(event_id)
            if tree:
                return tree

            for whole in month["sessions"].values():
                for node in (whole.get("root") or {}).get("children") or []:
                    if node.get("id") == event_id and node.get("product") == record_type:
                        cost = node["cost"]
                        return {"cost": {"total": cost["cumulative_cost"], "currency": cost["currency"]}, "root": node}
        return None

    def usage_options(self) -> dict[str, dict]:
        return USAGE_OPTIONS

    def usage_report(self, product: str, start: datetime, end: datetime, extra_dimensions: list[str] | None = None) -> list[dict]:
        del end, extra_dimensions
        report = self._month(start)["usage_reports"].get(product)
        if not report:
            return []
        return list(report["data"])

    def usage_page(
        self,
        product: str,
        start: datetime,
        end: datetime,
        page: int,
        metrics: list[str] | None = None,
        dimensions: list[str] | None = None,
    ) -> dict:
        del metrics, dimensions
        if str(product).startswith("conference"):
            return {"data": [], "meta": {"page_number": page, "page_size": USAGE_PAGE_SIZE, "total_pages": 1, "total_results": 0}}
        rows = self.usage_report(product, start, end)
        begin = (page - 1) * USAGE_PAGE_SIZE
        chunk = rows[begin : begin + USAGE_PAGE_SIZE]
        total_pages = max(1, (len(rows) + USAGE_PAGE_SIZE - 1) // USAGE_PAGE_SIZE) if rows else 1
        return {
            "data": chunk,
            "meta": {
                "page_number": page,
                "page_size": USAGE_PAGE_SIZE,
                "total_pages": total_pages,
                "total_results": len(rows),
            },
        }


class LiveTelnyx:
    mode = "live"

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.telnyx.com/v2",
        transport: httpx.BaseTransport | None = None,
        sleep: Callable[[float], None] = time.sleep,
        limiter: RateLimiter | None = None,
        attempts: int | None = None,
        rng: random.Random | None = None,
        now: Callable[[], float] | None = None,
    ):
        if not api_key:
            raise TelnyxError("TELNYX_API_KEY is not set")
        self.sleep = sleep
        self.limiter = limiter if limiter is not None else get_limiter()
        self.attempts = attempts
        self.rng = rng
        self.now = now or time.time
        self._options: dict[str, dict] | None = None
        self.http = httpx.Client(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=45,
            transport=transport,
        )

    def _get(self, path: str, params: list[tuple[str, str]] | None = None) -> httpx.Response:
        limiter = self.limiter

        def do() -> httpx.Response:
            limiter.acquire()
            try:
                response = self.http.get(path, params=params)
                limiter.note(response, self.now())
                return response
            finally:
                limiter.release()

        from app.config import get_settings

        attempts = self.attempts if self.attempts is not None else get_settings().telnyx_retry_attempts
        return request_with_retry(do, sleep=self.sleep, attempts=attempts, rng=self.rng, now=self.now)

    def list_assistants(self) -> list[dict]:
        """GET /v2/ai/assistants. Only `id` and `name` are kept."""
        body = self._get("/ai/assistants").json()
        return [{"id": row.get("id"), "name": row.get("name")} for row in body.get("data") or []]

    def list_conversations(self, start: datetime, end: datetime, assistant_id: str) -> tuple[list[dict], bool]:
        page_size = CONVERSATION_PAGE_SIZE

        def fetch(page: int) -> dict:
            params = [
                ("metadata->assistant_id", f"eq.{assistant_id}"),
                ("metadata->telnyx_conversation_channel", "eq.phone_call"),
                ("created_at", f"gte.{start.strftime('%Y-%m-%dT%H:%M:%SZ')}"),
                ("created_at", f"lt.{end.strftime('%Y-%m-%dT%H:%M:%SZ')}"),
                ("order", "created_at.asc"),
                ("page[number]", str(page)),
                ("page[size]", str(page_size)),
            ]
            response = self._get("/ai/conversations", params)
            return response.json()

        return iter_until_empty(fetch, page_size)

    def detail_page(self, record_type: str, start: datetime, end: datetime, page: int) -> dict:
        if record_type in {"stt", "speech-to-text"}:
            return {"data": [], "meta": {"page_number": page, "page_size": DETAIL_PAGE_SIZE, "total_pages": 1, "total_results": 0}}
        time_field = DETAIL_TIME_FIELDS.get(record_type, "created_at")
        params = [
            ("filter[record_type]", record_type),
            (f"filter[{time_field}][gte]", start.strftime("%Y-%m-%dT%H:%M:%SZ")),
            (f"filter[{time_field}][lt]", end.strftime("%Y-%m-%dT%H:%M:%SZ")),
            ("page[number]", str(page)),
            ("page[size]", str(DETAIL_PAGE_SIZE)),
        ]
        return self._get("/detail_records", params).json()

    def iter_detail_records(self, record_type: str, start: datetime, end: datetime) -> Iterator[dict]:
        page = 1
        while page <= 10000:
            body = self.detail_page(record_type, start, end, page)
            rows = list(body.get("data") or [])
            if not rows:
                return
            yield from rows
            if page >= int((body.get("meta") or {}).get("total_pages") or 1):
                return
            page += 1

    def get_session(self, record_type: str, event_id: str, when: datetime | None) -> dict | None:

        params = [("include_children", "true"), ("max_depth", "5"), ("expand", "record")]
        if when is not None:
            params.append(("date_time", when.strftime("%Y-%m-%dT%H:%M:%SZ")))
        try:
            response = self._get(f"/session_analysis/{record_type}/{event_id}", params)
        except TelnyxError as exc:
            if exc.status_code == 404:
                return None
            raise
        return response.json()

    def usage_options(self) -> dict[str, dict]:
        if self._options is not None:
            return self._options
        response = self._get("/usage_reports/options")
        body = response.json()
        found = {}
        for row in body.get("data") or []:
            product = row.get("product")
            if product:
                found[product] = row
        self._options = found
        return found

    def usage_page(
        self,
        product: str,
        start: datetime,
        end: datetime,
        page: int,
        metrics: list[str] | None = None,
        dimensions: list[str] | None = None,
    ) -> dict:
        if str(product).startswith("conference"):
            return {"data": [], "meta": {"page_number": page, "page_size": USAGE_PAGE_SIZE, "total_pages": 1, "total_results": 0}}
        params = [
            ("product", product),
            ("start_date", start.strftime("%Y-%m-%dT%H:%M:%SZ")),
            ("end_date", end.strftime("%Y-%m-%dT%H:%M:%SZ")),
            ("page[number]", str(page)),
            ("page[size]", str(USAGE_PAGE_SIZE)),
        ]
        for metric in metrics or []:
            if metric == "cost5d":
                continue
            params.append(("metrics[]", metric))
        for dimension in dimensions or []:
            if dimension == "cost5d":
                continue
            params.append(("dimensions[]", dimension))
        return self._get("/usage_reports", params).json()

    def usage_report(
        self,
        product: str,
        start: datetime,
        end: datetime,
        extra_dimensions: list[str] | None = None,
    ) -> list[dict]:
        if product == "conference" or str(product).startswith("conference"):
            return []
        options = self.usage_options().get(product) or {}

        metrics = [item for item in ("cost", "billed_sec", "call_sec") if item in (options.get("product_metrics") or [])]
        if "cost" not in metrics:
            return []
        dimensions = ["currency"]
        available_dims = options.get("product_dimensions") or []
        if extra_dimensions:
            for name in extra_dimensions:
                if name in available_dims and name not in dimensions and name != "cost5d":
                    dimensions.append(name)
        else:
            if "billing_group_id" in available_dims:
                dimensions.append("billing_group_id")
            if product == "sip-trunking" and "datetime" in available_dims:
                dimensions.append("datetime")
            elif "date" in available_dims:
                dimensions.append("date")
        rows: list[dict] = []
        page = 1
        while page <= 1000:
            body = self.usage_page(product, start, end, page, metrics=metrics, dimensions=dimensions)
            chunk = list(body.get("data") or [])
            rows.extend(chunk)
            if not chunk or page >= int((body.get("meta") or {}).get("total_pages") or 1):
                break
            page += 1
        return rows

    def close(self) -> None:
        self.http.close()


def build_source(mode: str, api_key: str, base_url: str) -> Any:
    if mode == "live":
        return LiveTelnyx(api_key, base_url)
    return FixtureTelnyx()
````

## File: zaya-usage-web-main/backend/app/telnyx/fixtures.py
````python
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

NS = uuid.UUID("6f0c1a2e-9b4d-4e1a-8c3d-1a2b3c4d5e6f")

HFAAC_ASSISTANT = "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac"
MMC_ASSISTANT = "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a"
AGP_ASSISTANT = "assistant-f3cf8aea-7c8e-451a-b577-19b828f86156"
SCHAUMBURG_ASSISTANT = "assistant-429c0bf6-c5af-4eac-9fd5-7289487b5bf9"
HFAAC_TEST_ASSISTANT = "assistant-ce6e961c-d4d7-417f-8d8b-8e88991f85dd"
MMC_TEST_ASSISTANT = "assistant-1128ffea-3791-4e7d-b740-d0d6f8fb2c0b"
BOOK_ASSISTANT = "assistant-fea032f4-9f48-4333-8c81-b3a602221840"

HFAAC_BILLING_GROUP = "4bdf3e48-fd42-480e-9bd8-fe96affd1be2"
AGP_BILLING_GROUP = "90e164fb-77ba-4bde-94d7-8c3630ce3b2d"
MMC_BILLING_GROUP = "61c0967c-f7cb-42ef-89db-1045dc1c8ad9"
SCHAUMBURG_BILLING_GROUP = "600e73df-ed3e-4900-83d1-79ec8f081fab"


LOOSE_INFERENCE_COST = Decimal("7.04E-4")


def connection_id(assistant_id: str) -> str:

    return "ai-assistant-" + assistant_id.removeprefix("assistant-")


def _clinic(**kwargs) -> dict:
    kwargs["connection_id"] = connection_id(kwargs["assistant_id"])
    kwargs.setdefault("client_visible", True)
    return kwargs


ORGS = [
    {
        "slug": "hfaac",
        "name": "Houston Foot and Ankle Care",
        "clinics": [
            _clinic(
                key="hfaac",
                code="HFAAC",
                name="HFAAC",
                assistant_id=HFAAC_ASSISTANT,
                assistant_name="HFAAC Reception",
                billing_group_id=HFAAC_BILLING_GROUP,
                number="+13125550101",
            ),
            _clinic(
                key="hfaac-test",
                code="HFAAC-TEST",
                name="HFAAC test copy",
                assistant_id=HFAAC_TEST_ASSISTANT,
                assistant_name="HFAAC Reception (test)",
                number="+13125550103",
                client_visible=False,
            ),
        ],
    },
    {
        "slug": "agp",
        "name": "AGP Family Health Clinic",
        "clinics": [
            _clinic(
                key="agp",
                code="AGP",
                name="AGP",
                assistant_id=AGP_ASSISTANT,
                assistant_name="AGP Reception",
                billing_group_id=AGP_BILLING_GROUP,
                number="+13125550111",
            )
        ],
    },
    {
        "slug": "mmc",
        "name": "Family Medicine MMC",
        "clinics": [
            _clinic(
                key="mmc",
                code="MMC",
                name="MMC",
                assistant_id=MMC_ASSISTANT,
                assistant_name="MMC Reception",
                billing_group_id=MMC_BILLING_GROUP,
                number="+13125550121",
            ),
            _clinic(
                key="mmc-test",
                code="MMC-TEST",
                name="MMC test copy",
                assistant_id=MMC_TEST_ASSISTANT,
                assistant_name="MMC Reception (test)",
                number="+13125550122",
                client_visible=False,
            ),
        ],
    },
    {
        "slug": "schaumburg",
        "name": "Schaumburg",
        "clinics": [
            _clinic(
                key="schaumburg",
                code="SCHAUMBURG",
                name="Schaumburg",
                assistant_id=SCHAUMBURG_ASSISTANT,
                assistant_name="Schaumburg Reception",
                billing_group_id=SCHAUMBURG_BILLING_GROUP,
                number="+13125550141",
            )
        ],
    },
    {
        "slug": "zaya",
        "name": "Zaya Health",
        "clinics": [
            _clinic(
                key="book",
                code="ZAYA",
                name="Zaya Voice",
                assistant_id=BOOK_ASSISTANT,
                assistant_name="Zaya Voice Book Appointment Flow",
                number="+13125550131",
                client_visible=False,
            )
        ],
    },
]



LOGINS = [
    {"email": "hfaac@zayahealth.example", "assistants": [HFAAC_ASSISTANT]},
    {"email": "mmc@zayahealth.example", "assistants": [MMC_ASSISTANT]},
    {"email": "agp@zayahealth.example", "assistants": [AGP_ASSISTANT]},
    {"email": "schaumburg@zayahealth.example", "assistants": [SCHAUMBURG_ASSISTANT]},
]


def _clinic_index() -> dict[str, dict]:
    index = {}
    for org in ORGS:
        for clinic in org["clinics"]:
            index[clinic["key"]] = {**clinic, "client_slug": org["slug"], "client_name": org["name"]}
    return index


CLINICS = _clinic_index()



OCTOBER_CALLS = [
    ("hfaac", 1, 14, 10, "0901", 184, 240, 3, ""),
    ("hfaac", 1, 16, 40, "0902", 95, 120, 2, ""),
    ("hfaac", 2, 13, 5, "0903", 240, 240, 4, ""),
    ("hfaac", 3, 15, 20, "0904", 60, 60, 1, "N"),
    ("hfaac", 4, 11, 0, "0905", 310, 360, 5, ""),
    ("hfaac", 6, 17, 15, "0906", 40, 60, 1, "PN"),
    ("hfaac", 7, 14, 45, "0907", 200, 240, 3, ""),
    ("hfaac", 8, 9, 30, "0908", 150, 180, 2, ""),
    ("hfaac", 9, 15, 0, "0909", 0, 60, 1, "ZN"),
    ("hfaac", 10, 13, 10, "0910", 220, 240, 3, ""),
    ("hfaac", 13, 16, 0, "0911", 180, 180, 3, ""),
    ("hfaac", 14, 12, 20, "0912", 500, 540, 6, ""),
    ("hfaac", 15, 18, 5, "0913", 70, 120, 2, "P"),
    ("hfaac", 16, 14, 0, "0914", 260, 300, 4, ""),
    ("hfaac", 20, 11, 40, "0915", 130, 180, 2, ""),
    ("hfaac", 22, 15, 50, "0916", 90, 120, 2, ""),
    ("schaumburg", 2, 10, 0, "0921", 160, 180, 2, ""),
    ("schaumburg", 5, 14, 30, "0922", 210, 240, 3, ""),
    ("schaumburg", 8, 16, 10, "0923", 100, 120, 2, ""),
    ("schaumburg", 12, 13, 45, "0924", 300, 300, 4, ""),
    ("schaumburg", 19, 15, 15, "0925", 80, 120, 1, ""),
    ("schaumburg", 21, 11, 20, "0926", 140, 180, 2, ""),
    ("agp", 1, 15, 0, "0931", 200, 240, 3, ""),
    ("agp", 3, 11, 30, "0932", 50, 60, 1, "N"),
    ("agp", 6, 14, 0, "0933", 400, 420, 5, ""),
    ("agp", 9, 16, 40, "0934", 110, 120, 2, "P"),
    ("agp", 13, 10, 15, "0935", 175, 180, 3, ""),
    ("agp", 15, 13, 50, "0936", 90, 120, 2, ""),
    ("agp", 18, 17, 0, "0937", 240, 240, 4, ""),
    ("agp", 22, 9, 45, "0938", 60, 60, 1, "N"),
    ("mmc", 2, 12, 0, "0941", 180, 180, 3, "D"),
    ("mmc", 4, 15, 30, "0942", 220, 240, 3, ""),
    ("mmc", 7, 10, 10, "0943", 30, 60, 1, "N"),
    ("mmc", 11, 14, 20, "0944", 190, 240, 3, ""),
    ("mmc", 17, 16, 0, "0945", 260, 300, 4, ""),
    ("mmc", 21, 13, 0, "0946", 120, 120, 2, ""),
    ("hfaac-test", 11, 12, 0, "0951", 100, 120, 1, ""),
    ("mmc-test", 11, 13, 0, "0952", 80, 120, 1, ""),
    ("book", 11, 14, 0, "0953", 90, 120, 1, ""),
]

SEPTEMBER_CALLS = []
for key, last4 in (
    ("hfaac", "0801"),
    ("schaumburg", "0802"),
    ("agp", "0803"),
    ("mmc", "0804"),
):
    for index, day in enumerate((3, 12, 24)):
        SEPTEMBER_CALLS.append((key, day, 11 + index, 15, f"{last4[:-1]}{index}", 120, 180, 2, ""))


def _tid(*parts: str) -> str:
    return str(uuid.uuid5(NS, ":".join(parts)))


def _money(value: Decimal | None) -> str | None:
    if value is None:
        return None
    return f"{value.quantize(Decimal('0.0001')):.4f}"


def _per_minute(seconds: int, rate: str) -> Decimal:
    return (Decimal(seconds) / Decimal(60) * Decimal(rate)).quantize(Decimal("0.0001"))


def _started(year: int, month: int, day: int, hour: int, minute: int) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=timezone.utc)


def _build_call(year: int, month: int, spec: tuple) -> dict:
    clinic_key, day, hour, minute, last4, call_sec, billed_sec, turns, flags = spec
    clinic = CLINICS[clinic_key]
    pending = "P" in flags
    zero_control = "Z" in flags
    omit_duration = "D" in flags
    recording = "N" not in flags
    stamp = _started(year, month, day, hour, minute)
    key = f"{year}-{month:02d}-{clinic_key}-{day}-{hour}-{last4}"
    conversation_id = _tid(key, "conversation")
    session_id = _tid(key, "session")
    leg_id = _tid(key, "leg")
    control_id = f"v3:{_tid(key, 'cc')[:24]}"

    control_cost = Decimal("0.0000") if zero_control else _per_minute(billed_sec, "0.0020")
    sip_cost = _per_minute(billed_sec, "0.0050")
    assistant_cost = None if pending else _per_minute(billed_sec, "0.0320")
    inferences = [(Decimal("0.0010") * (index + 1)).quantize(Decimal("0.0001")) for index in range(turns)]
    if pending and inferences:
        inferences[-1] = None
    amd_cost = Decimal("0.0065")

    finished = stamp + timedelta(seconds=call_sec)
    caller = f"+1312555{last4}"

    # call-control and sip share the leg id. AI is keyed by conversation_id and has no detail id.
    components: list[dict] = [
        {
            "service": "call-control",
            "record_type": "call-control",
            "id": leg_id,
            "amount": control_cost,
            "billed_sec": billed_sec,
            "call_sec": None if omit_duration else call_sec,
            "rate": "0.0000" if zero_control else "0.0020",
            "rate_unit": "minutes",
        },
        {
            "service": "sip-trunking",
            "record_type": "sip-trunking",
            "id": leg_id,
            "amount": sip_cost,
            "billed_sec": billed_sec,
            "call_sec": None if omit_duration else call_sec,
            "rate": "0.0050",
            "rate_unit": "minutes",
        },
        {
            "service": "ai-voice-assistant",
            "record_type": "ai-voice-assistant",
            "id": conversation_id,
            "omit_id": True,
            "amount": assistant_cost,
            "billed_sec": billed_sec,
            "call_sec": None,
            "rate": "0.032",
            "rate_unit": "ai_voice_assistant_minutes",
        },
        {
            "service": "amd",
            "record_type": "amd",
            "id": leg_id,
            "amount": amd_cost,
            "billed_sec": None,
            "call_sec": None,
            "rate": "0.0065",
            "rate_unit": "invocation",
        },
    ]
    for index, amount in enumerate(inferences):
        components.append(
            {
                "service": "inference",
                "record_type": "inference",
                "id": _tid(key, f"inference-{index}"),
                "amount": amount,
                "billed_sec": None,
                "call_sec": None,
                "rate": None,
                "rate_unit": None,
            }
        )

    known = [item["amount"] for item in components if item["amount"] is not None]
    session_total = None if pending else sum(known, Decimal("0.0000"))

    return {
        "key": key,
        "clinic_key": clinic_key,
        "assistant_id": clinic["assistant_id"],
        "connection_id": clinic["connection_id"],
        "billing_group_id": clinic.get("billing_group_id"),
        "clinic_number": clinic["number"],
        "caller": caller,
        "use_from_field": clinic_key == "book",
        "conversation_id": conversation_id,
        "session_id": session_id,
        "leg_id": leg_id,
        "control_id": control_id,
        "started": stamp,
        "finished": finished,
        "direction": "inbound",
        "pending": pending,
        "omit_duration": omit_duration,
        "recording": recording,
        "call_sec": call_sec,
        "billed_sec": billed_sec,
        "components": components,
        "session_total": session_total,
    }


def _detail_record(call: dict, component: dict) -> dict:
    record = {
        "record_type": component["record_type"],
        "currency": "USD",
        "started_at": call["started"].strftime("%Y-%m-%dT%H:%M:%SZ"),
        "created_at": call["started"].strftime("%Y-%m-%dT%H:%M:%SZ"),
        "finished_at": call["finished"].strftime("%Y-%m-%dT%H:%M:%SZ"),
        "direction": call["direction"],
        "connection_id": call["connection_id"],
        "billing_group_id": call["billing_group_id"],
        "telnyx_session_id": call["session_id"],
        "telnyx_leg_id": call["leg_id"],
        "conversation_id": call["conversation_id"],
        "assistant_id": call["assistant_id"],
        "cli": call["caller"],
        "cld": call["clinic_number"],
    }
    if not component.get("omit_id"):
        record["id"] = component["id"]
    if component["amount"] is not None or component["service"] != "text-to-speech":
        record["cost"] = _money(component["amount"])
    if component["service"] == "amd":
        record["call_leg_id"] = call["leg_id"]
        record["invoked_at"] = call["started"].strftime("%Y-%m-%dT%H:%M:%SZ")
    if component["service"] == "sip-trunking":
        record["call_control_id"] = call["control_id"]
    if component["rate"] is not None:
        record["rate"] = component["rate"]
        record["rate_measured_in"] = component["rate_unit"]
    if component["billed_sec"] is not None:
        record["billed_sec"] = component["billed_sec"]
    if component["service"] == "call-control" and not call["omit_duration"]:
        record["call_sec"] = component["call_sec"]
    if component["service"] == "ai-voice-assistant":

        if not call["omit_duration"]:
            record["duration_sec"] = call["call_sec"]
        record["llm_model"] = "fixture-llm"
        record["stt_model"] = "fixture-stt"
        record["tts_model_id"] = "fixture-tts"
    return record


def _event_node(call: dict, component: dict, children: list[dict] | None = None) -> dict:
    amount = _money(component["amount"])
    own = amount if amount is not None else None
    child_known = []
    for child in children or []:
        child_cost = child["cost"]["event_cost"]
        if child_cost is not None:
            child_known.append(Decimal(child_cost))
    cumulative = None
    if own is not None and all(child["cost"]["event_cost"] is not None for child in children or []):
        cumulative = Decimal(own) + sum(child_known, Decimal("0"))
    node_id = call["conversation_id"] if component["service"] == "ai-voice-assistant" else component["id"]
    return {
        "id": node_id,
        "product": component["service"],
        "event_name": component["service"],
        "relationship": {"type": "child_of", "via": {"local_field": "conversation_id", "parent_field": "conversation_id"}},
        "cost": {
            "event_cost": own,
            "cumulative_cost": _money(cumulative) if cumulative is not None else None,
            "currency": "USD",
        },
        "links": {"records": f"/v2/detail_records?filter[record_type]={component['record_type']}"},
        "record": _detail_record(call, component),
        "children": children or [],
    }


def _session_tree(call: dict) -> dict:
    inferences = [item for item in call["components"] if item["service"] == "inference"]
    others = [item for item in call["components"] if item["service"] != "inference"]
    children = []
    for component in others:
        if component["service"] == "ai-voice-assistant":
            children.append(_event_node(call, component, [_event_node(call, item) for item in inferences]))
        else:
            children.append(_event_node(call, component))
    total = _money(call["session_total"]) if call["session_total"] is not None else "No cost data available."
    cumulative = total if call["session_total"] is not None else "0.000000"
    return {
        "session_id": call["session_id"],
        "cost": {"total": total, "currency": "USD"},
        "root": {
            "id": call["session_id"],
            "product": "call-session",
            "event_name": "call-session",
            "relationship": None,
            "cost": {"event_cost": "0.000000", "cumulative_cost": cumulative, "currency": "USD"},
            "links": {},
            "record": {"record_type": "call-session", "id": call["session_id"]},
            "children": children,
        },
        "meta": {
            "event_count": 1 + len(call["components"]),
            "products": ["call-session", *[item["service"] for item in call["components"]]],
        },
    }


def _usage_rows(calls: list[dict], sip_extra: Decimal, loose_inference: Decimal) -> dict[str, dict]:
    buckets: dict[str, list[Decimal]] = {}
    billed: dict[str, int] = {}
    for call in calls:
        for component in call["components"]:
            service = component["service"]
            buckets.setdefault(service, [])
            if component["amount"] is not None:
                buckets[service].append(component["amount"])
            if component["billed_sec"]:
                billed[service] = billed.get(service, 0) + int(component["billed_sec"])
    if loose_inference:
        buckets.setdefault("inference", []).append(loose_inference)
    reports = {}
    for service, amounts in buckets.items():
        total = sum(amounts, Decimal("0"))
        if service == "sip-trunking":
            total += sip_extra
        reports[service] = {
            "data": [
                {
                    "product": service,
                    "currency": "USD",
                    "cost": format(total, "f"),
                    "billed_sec": billed.get(service, 0),
                }
            ],
            "meta": {"page_number": 1, "page_size": 20, "total_pages": 1, "total_results": 1},
        }

    grouped: dict[str, dict] = {}
    for call in calls:
        group_id = call.get("billing_group_id")
        if not group_id:
            continue
        bucket = grouped.setdefault(
            group_id,
            {"recording": Decimal("0"), "noise-suppression": Decimal("0"), "speech-to-text": Decimal("0")},
        )
        talk = call["billed_sec"] if call["omit_duration"] else call["call_sec"]
        if call["recording"]:
            bucket["recording"] += _per_minute(call["billed_sec"], "0.0020")
        bucket["noise-suppression"] += _per_minute(call["billed_sec"], "0.0010")
        bucket["speech-to-text"] += _per_minute(talk, "0.0150")

    for product in ("recording", "noise-suppression", "speech-to-text", "text-to-speech"):
        data = []
        for group_id, bucket in grouped.items():
            if product == "text-to-speech":
                cost = "0"
            else:
                cost = format(bucket[product], "f")
            row = {
                "product": product,
                "currency": "USD",
                "cost": cost,
                "billing_group_id": group_id,
                "billed_sec": 0,
            }
            if product == "speech-to-text":
                row["cost5d"] = "9.9900"
            data.append(row)
        reports[product] = {
            "data": data,
            "meta": {"page_number": 1, "page_size": 20, "total_pages": 1, "total_results": len(data)},
        }


    reports["recording"]["data"].append(
        {
            "product": "recording",
            "currency": "USD",
            "cost": "0.5000",
            "billing_group_id": "unmapped-billing-group",
            "billed_sec": 0,
        }
    )
    reports["recording"]["meta"]["total_results"] = len(reports["recording"]["data"])
    return reports


def build_months() -> dict[str, dict]:
    months = {}
    specs = {
        ("2026-10", 2026, 10): (OCTOBER_CALLS, Decimal("0.0400"), LOOSE_INFERENCE_COST),
        ("2026-09", 2026, 9): (SEPTEMBER_CALLS, Decimal("0"), Decimal("0")),
    }
    for (label, year, month), (specs_rows, sip_extra, loose_inference) in specs.items():
        calls = [_build_call(year, month, spec) for spec in specs_rows]
        by_type: dict[str, list] = {}
        sessions = {}
        conversations = []
        for call in calls:
            metadata = {
                "assistant_id": call["assistant_id"],
                "telnyx_conversation_channel": "phone_call",
                "telnyx_agent_target": call["clinic_number"],
                "call_control_id": call["control_id"],
                "call_session_id": call["session_id"],
                "call_leg_id": call["leg_id"],
            }
            if call["use_from_field"]:
                metadata["from"] = call["caller"]
                metadata["to"] = call["clinic_number"]
            else:
                metadata["telnyx_end_user_target"] = call["caller"]
            conversations.append(
                {
                    "id": call["conversation_id"],
                    "name": "",
                    "created_at": call["started"].strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "last_message_at": call["finished"].strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "metadata": metadata,
                }
            )
            sessions[call["session_id"]] = _session_tree(call)
            for component in call["components"]:
                if component["service"] == "inference" and component["id"] != _tid(call["key"], "inference-0"):
                    continue
                by_type.setdefault(component["record_type"], []).append(_detail_record(call, component))


            when = call["started"].strftime("%Y-%m-%dT%H:%M:%SZ")
            has_group = bool(call.get("billing_group_id"))
            if call["recording"] and has_group:
                by_type.setdefault("recording", []).append(
                    {
                        "record_type": "recording",
                        "id": _tid(call["key"], "recording"),
                        "telnyx_session_id": call["session_id"],
                        "connection_id": call["connection_id"],
                        "billing_group_id": call["billing_group_id"],
                        "started_at": when,
                        "cost": format(_per_minute(call["billed_sec"], "0.0020"), "f"),
                        "currency": "USD",
                        "billed_sec": call["billed_sec"],
                        "rate": "0.002",
                    }
                )
            noise = _per_minute(call["billed_sec"], "0.0010")
            first = (noise / 2).quantize(Decimal("0.000001"))
            for index, part in enumerate((first, noise - first) if has_group else ()):
                by_type.setdefault("noise-suppression", []).append(
                    {
                        "record_type": "noise-suppression",
                        "id": _tid(call["key"], f"noise-{index}"),
                        "call_session_id": call["session_id"],
                        "call_leg_id": _tid(call["key"], f"noise-leg-{index}"),
                        "connection_id": call["connection_id"],
                        "billing_group_id": call["billing_group_id"] if index else None,
                        "started_at": when,
                        "cost": format(part, "f"),
                        "currency": "USD",
                    }
                )
        if by_type.get("call-control"):
            by_type["call-control"].append(dict(by_type["call-control"][0]))
        if label == "2026-10" and calls:
            sample = calls[0]
            by_type.setdefault("text-to-speech", []).append(
                {
                    "record_type": "text-to-speech",
                    "id": _tid(sample["key"], "tts-nocost"),
                    "number_of_characters": "120",
                    "conversation_id": sample["conversation_id"],
                    "connection_id": sample["connection_id"],
                    "created_at": sample["started"].strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "currency": "USD",
                }
            )
            by_type.setdefault("inference", []).append(
                {
                    "record_type": "inference",
                    "id": _tid("loose-insight", "inference"),
                    "conversation_id": "None",
                    "cost": "7.04E-4",
                    "currency": "None",
                    "created_at": "2026-10-15T12:00:00Z",
                    "usecase": "insight-generation",
                    "connection_id": calls[0]["connection_id"],
                    "llm_cost": "None",
                }
            )
        months[label] = {
            "calls": calls,
            "conversations": {"data": conversations},
            "detail_records": by_type,
            "sessions": sessions,
            "usage_reports": _usage_rows(calls, sip_extra, loose_inference),
        }
    return months


MONTHS = build_months()

USAGE_OPTIONS = {
    "sip-trunking": {
        "product": "sip-trunking",
        "product_metrics": ["connected", "cost", "attempted", "call_sec", "completed", "billed_sec"],
        "product_dimensions": ["datetime", "date", "connection_id", "direction", "currency", "billing_group_id"],
    },
    "call-control": {
        "product": "call-control",
        "product_metrics": ["cost", "billed_sec", "call_sec", "completed"],
        "product_dimensions": ["date", "connection_id", "currency", "billing_group_id"],
    },
    "ai-voice-assistant": {
        "product": "ai-voice-assistant",
        "product_metrics": ["connected", "cost", "attempted", "billed_sec", "duration_sec"],
        "product_dimensions": ["date", "assistant_id", "billing_group_id", "currency", "llm_model", "stt_model", "tts_model_id"],
    },
    "inference": {
        "product": "inference",
        "product_metrics": ["cost", "count"],
        "product_dimensions": ["date", "currency"],
    },
    "amd": {
        "product": "amd",
        "product_metrics": ["cost"],
        "product_dimensions": ["date", "currency", "billing_group_id"],
    },
    "speech-to-text": {
        "product": "speech-to-text",
        "product_metrics": ["cost", "cost5d", "billed_sec"],
        "product_dimensions": ["date", "currency", "billing_group_id"],
    },
    "text-to-speech": {
        "product": "text-to-speech",
        "product_metrics": ["cost"],
        "product_dimensions": ["date", "currency", "billing_group_id"],
    },
    "recording": {
        "product": "recording",
        "product_metrics": ["cost", "billed_sec"],
        "product_dimensions": ["date", "currency", "billing_group_id"],
    },
    "noise-suppression": {
        "product": "noise-suppression",
        "product_metrics": ["cost", "billed_sec"],
        "product_dimensions": ["date", "currency", "billing_group_id"],
    },
}


def month_calls(label: str) -> list[dict]:
    return MONTHS[label]["calls"]
````

## File: zaya-usage-web-main/backend/app/telnyx/limiter.py
````python
from __future__ import annotations

import random
import threading
import time
from email.utils import parsedate_to_datetime
from typing import Callable

import httpx

_EPOCH_CUTOFF = 1_000_000_000

_limiter: RateLimiter | None = None
_guard = threading.Lock()


def header_delay(response: httpx.Response, now: float) -> float | None:

    delays: list[float] = []
    retry_after = _retry_after(response, now)
    if retry_after is not None:
        delays.append(retry_after)
    reset = _reset_delay(response, now)
    if reset is not None and _honor_reset(response):
        delays.append(reset)
    if not delays:
        return None
    return max(0.0, max(delays))


def jitter(rng: random.Random, base: float) -> float:

    return rng.random() * max(base, 0.05) * 0.25


def _honor_reset(response: httpx.Response) -> bool:
    if response.status_code == 429:
        return True
    remaining = response.headers.get("x-ratelimit-remaining")
    if remaining is None:
        remaining = response.headers.get("ratelimit-remaining")
    if remaining is None:
        return False
    return str(remaining).strip() in {"0", "0.0"}


def _retry_after(response: httpx.Response, now: float) -> float | None:
    raw = response.headers.get("retry-after")
    if raw is None or not str(raw).strip():
        return None
    text = str(raw).strip()
    try:
        return max(0.0, float(text))
    except ValueError:
        pass
    try:
        when = parsedate_to_datetime(text)
    except (TypeError, ValueError, IndexError, OverflowError):
        return None
    return max(0.0, when.timestamp() - now)


def _reset_delay(response: httpx.Response, now: float) -> float | None:
    raw = response.headers.get("x-ratelimit-reset")
    if raw is None:
        raw = response.headers.get("ratelimit-reset")
    if raw is None or not str(raw).strip():
        return None
    try:
        value = float(str(raw).strip())
    except ValueError:
        return None
    if value >= _EPOCH_CUTOFF:
        return max(0.0, value - now)
    return max(0.0, value)


class RateLimiter:


    def __init__(
        self,
        min_interval: float = 1.0,
        max_concurrent: int = 1,
        sleep: Callable[[float], None] | None = None,
        clock: Callable[[], float] | None = None,
    ):
        self.min_interval = max(0.0, float(min_interval))
        self.max_concurrent = max(1, int(max_concurrent))
        self._sleep = sleep or time.sleep
        self._clock = clock or time.monotonic
        self._cv = threading.Condition()
        self._next_at = 0.0
        self._in_flight = 0

    def acquire(self) -> None:
        while True:
            with self._cv:
                if self._in_flight < self.max_concurrent:
                    now = self._clock()
                    delay = self._next_at - now
                    if delay <= 1e-9:
                        self._in_flight += 1
                        self._next_at = now + self.min_interval
                        return
                else:
                    delay = None
                if delay is None:
                    self._cv.wait(timeout=0.05)
                    continue
            self._sleep(delay)

    def release(self) -> None:
        with self._cv:
            self._in_flight = max(0, self._in_flight - 1)
            self._cv.notify_all()

    def note(self, response: httpx.Response, now: float) -> None:

        if response.status_code == 429 or response.status_code >= 500:
            return
        delay = header_delay(response, now)
        if not delay:
            return
        with self._cv:
            self._next_at = max(self._next_at, self._clock() + delay)


def get_limiter() -> RateLimiter:
    global _limiter
    with _guard:
        if _limiter is None:
            from app.config import get_settings

            settings = get_settings()
            _limiter = RateLimiter(
                min_interval=settings.telnyx_min_interval_seconds,
                max_concurrent=settings.telnyx_max_concurrent,
            )
        return _limiter


def reset_limiter() -> None:
    global _limiter
    with _guard:
        _limiter = None
````

## File: zaya-usage-web-main/backend/app/telnyx/parse.py
````python
from decimal import Decimal, InvalidOperation
from typing import Any

COST_PLACEHOLDER = "no cost data available."

SERVICE_ALIASES = {
    "call-control": "call-control",
    "callcontrol-cdrs": "call-control",
    "sip-trunking": "sip-trunking",
    "siptrunking-cdrs": "sip-trunking",
    "ai-voice-assistant": "ai-voice-assistant",
    "inference": "inference",
    "stt": "speech-to-text",
    "speech-to-text": "speech-to-text",
    "inference-speech-to-text": "speech-to-text",
    "tts": "text-to-speech",
    "text-to-speech": "text-to-speech",
    "inference-text-to-speech": "text-to-speech",
    "recording": "recording",
    "recording-cdrs": "recording",
    "call-recording": "recording",
    "webrtc": "webrtc",
    "webrtc-cdrs": "webrtc",
    "webrtc_detail_record": "webrtc",
    "amd": "amd",
    "noise-suppression": "noise-suppression",
    "noise_suppression": "noise-suppression",
}





SKIP_SERVICES = {"call-session", "conference", "conference-participant", ""}


def clean_id(value: Any) -> str | None:
    """Blank and the literal string None are null. Telnyx sends that string on insight rows."""
    if value is None or isinstance(value, bool):
        return None
    text = str(value).strip()
    if text == "" or text.lower() == "none":
        return None
    return text


def parse_cost(value: Any) -> Decimal | None:
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, str):
        text = value.strip()
        if text == "" or text.lower() == COST_PLACEHOLDER or text.lower() == "none":
            return None
        try:

            return Decimal(text)
        except InvalidOperation:
            return None
    if isinstance(value, int):
        return Decimal(value)
    if isinstance(value, float):
        try:
            return Decimal(str(value))
        except InvalidOperation:
            return None
    return None


def parse_int(value: Any) -> int | None:
    if value is None or isinstance(value, bool) or isinstance(value, float):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        text = value.strip()
        if text == "" or text.lower() == "none":
            return None
        try:
            return int(text)
        except ValueError:
            return None
    return None


def normalize_service(raw: str | None) -> str | None:
    if raw is None:
        return None
    key = raw.strip().lower()
    if key in SKIP_SERVICES:
        return None
    return SERVICE_ALIASES.get(key, key)


def mask_phone(value: str | None) -> str | None:
    if not value:
        return None
    digits = "".join(ch for ch in value if ch.isdigit())
    if len(digits) < 4:
        return "••••"
    return f"•••{digits[-4:]}"


def _record_id(service: str | None, record: dict, fallback: Any = None) -> str | None:
    if service == "ai-voice-assistant":

        return clean_id(record.get("conversation_id")) or clean_id(fallback)
    if service == "amd":
        return clean_id(record.get("id")) or clean_id(record.get("call_leg_id")) or clean_id(record.get("uuid")) or clean_id(fallback)
    return clean_id(record.get("id")) or clean_id(record.get("uuid")) or clean_id(fallback)


def detail_identity(record: dict) -> tuple[str | None, str | None, str | None]:
    raw = record.get("record_type")
    service = normalize_service(str(raw) if raw else None)
    rid = _record_id(service, record)
    source = str(raw) if raw else None
    if service is None or not rid:
        return None, None, source
    return service, rid, source


def node_identity(node: dict) -> tuple[str | None, str | None, str | None]:
    record = node.get("record") if isinstance(node.get("record"), dict) else {}
    raw = record.get("record_type") or node.get("product") or node.get("event_name")
    service = normalize_service(str(raw) if raw else None)


    rid = _record_id(service, record, node.get("id"))
    source = str(raw) if raw else None
    if service is None or not rid:
        return None, None, source
    return service, rid, source
````

## File: zaya-usage-web-main/backend/app/__init__.py
````python

````

## File: zaya-usage-web-main/backend/app/config.py
````python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://zaya:zaya@127.0.0.1:5432/zaya_usage"
    session_secret: str = "dev-only-session-secret"
    sync_job_token: str = "dev-only-sync-token"
    cookie_secure: bool = False
    frontend_origin: str = "http://127.0.0.1:43123"

    frontend_origins: str = ""
    telnyx_api_key: str = ""
    telnyx_mode: str = "fixture"
    telnyx_base_url: str = "https://api.telnyx.com/v2"

    telnyx_min_interval_seconds: float = 1.0
    telnyx_max_concurrent: int = 1
    telnyx_retry_attempts: int = 8


    session_analysis_max_per_run: int = 400
    seed_demo: bool = False
    admin_email: str = "admin@zayahealth.example"
    admin_password: str = "local-admin-change-me"
    demo_password: str = "local-clinic-change-me"
    session_days: int = 7


def allowed_origins(settings: Settings | None = None) -> list[str]:





    current = settings or get_settings()
    raw: list[str] = []
    if current.frontend_origins:
        raw.extend(current.frontend_origins.split(","))
    if current.frontend_origin:
        raw.extend(current.frontend_origin.split(","))
    found: list[str] = []
    for item in raw:
        origin = item.strip().rstrip("/")
        if not origin or origin == "*" or origin in found:
            continue
        found.append(origin)
    return found or ["http://127.0.0.1:43123"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


def reset_settings() -> None:
    get_settings.cache_clear()
````

## File: zaya-usage-web-main/backend/app/db.py
````python
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

engine = create_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
````

## File: zaya-usage-web-main/backend/app/deps.py
````python
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Assistant, User, UserAssistant
from app.security import SESSION_COOKIE, session_from_raw


def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    row = session_from_raw(db, request.cookies.get(SESSION_COOKIE))
    if row is None:
        raise HTTPException(status_code=401, detail="Sign in required")
    user = db.get(User, row.user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Sign in required")
    return user


def require_admin(user: User = Depends(current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def assigned_assistant_ids(db: Session, user: User) -> tuple[uuid.UUID, ...] | None:

    if user.role != "client_user":
        return None
    ids = tuple(
        row[0]
        for row in db.query(UserAssistant.assistant_id)
        .join(Assistant, Assistant.id == UserAssistant.assistant_id)
        .filter(UserAssistant.user_id == user.id, Assistant.client_visible.is_(True))
        .all()
    )
    if not ids:
        raise HTTPException(status_code=403, detail="This login is not assigned to a Telnyx assistant")
    return ids


def data_scope(
    db: Session,
    user: User,
    assistant_id: uuid.UUID | None,
) -> tuple[uuid.UUID | None, tuple[uuid.UUID, ...] | None]:





    allowed = assigned_assistant_ids(db, user)
    if allowed is not None and assistant_id is not None and assistant_id not in allowed:
        assistant_id = None
    return assistant_id, allowed


def check_login_lock(user: User) -> None:
    if user.locked_until is None:
        return
    locked = user.locked_until
    if locked.tzinfo is None:
        locked = locked.replace(tzinfo=timezone.utc)
    if locked > datetime.now(timezone.utc):
        raise HTTPException(status_code=423, detail="Account temporarily locked. Try again later.")


def register_failure(db: Session, user: User) -> None:
    user.failed_attempts += 1
    if user.failed_attempts >= 8:
        user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()


def clear_failures(db: Session, user: User) -> None:
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()
````

## File: zaya-usage-web-main/backend/app/main.py
````python
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import allowed_origins, get_settings
from app.db import SessionLocal
from app.routers import admin, auth, dashboard, jobs
from app.security import SESSION_COOKIE, csrf_matches, session_from_raw
from app.services.seed import seed_demo
from app.services.sync import sync_window
from app.services.windows import month_window
from app.telnyx.client import build_source

CSRF_EXEMPT = {"/api/auth/login", "/internal/jobs/sync", "/health"}


def _seed_and_sync() -> None:
    current = get_settings()
    if not current.seed_demo:
        return
    db = SessionLocal()
    try:
        seed_demo(db)
        from app.models import SyncRun

        if db.query(SyncRun).filter(SyncRun.status == "succeeded").first():
            return
        source = build_source(current.telnyx_mode, current.telnyx_api_key, current.telnyx_base_url)
        for month in ("2026-09", "2026-10"):
            start, end = month_window(month)
            sync_window(db, source, start, end)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _seed_and_sync()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Zaya usage", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins(settings),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def csrf_guard(request: Request, call_next):
        if request.method in {"GET", "HEAD", "OPTIONS"} or request.url.path in CSRF_EXEMPT:
            return await call_next(request)
        db = SessionLocal()
        try:
            row = session_from_raw(db, request.cookies.get(SESSION_COOKIE))
            if row is not None and not csrf_matches(row, request.headers.get("x-csrf-token")):
                return JSONResponse({"detail": "CSRF token missing or invalid"}, status_code=403)
        finally:
            db.close()
        return await call_next(request)

    @app.get("/health")
    def health():
        return {"ok": True, "telnyx_mode": get_settings().telnyx_mode}

    app.include_router(auth.router)
    app.include_router(dashboard.router)
    app.include_router(admin.router)
    app.include_router(jobs.router)

    return app


app = create_app()
````

## File: zaya-usage-web-main/backend/app/models.py
````python
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    clinics: Mapped[list["Clinic"]] = relationship(back_populates="client")
    users: Mapped[list["User"]] = relationship(back_populates="client")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(300), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    client_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"))
    failed_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    client: Mapped[Client | None] = relationship(back_populates="users")


class UserAssistant(Base):


    __tablename__ = "user_assistants"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    assistant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assistants.id", ondelete="CASCADE"), primary_key=True
    )


class SessionToken(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    csrf_token: Mapped[str] = mapped_column(String(128), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship()


class Clinic(Base):
    __tablename__ = "clinics"
    __table_args__ = (UniqueConstraint("client_id", "code", name="uq_clinic_client_code"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(40), nullable=False)

    client: Mapped[Client] = relationship(back_populates="clinics")
    assistants: Mapped[list["Assistant"]] = relationship(back_populates="clinic")


class Assistant(Base):
    __tablename__ = "assistants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"))
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"))
    telnyx_assistant_id: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    display_name: Mapped[str | None] = mapped_column(String(200))
    client_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    clinic: Mapped[Clinic] = relationship(back_populates="assistants")

    @property
    def label(self) -> str:
        return self.display_name or self.name


class Resource(Base):
    __tablename__ = "resources"
    __table_args__ = (UniqueConstraint("kind", "telnyx_id", name="uq_resource_kind_telnyx"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"))
    clinic_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    telnyx_id: Mapped[str] = mapped_column(String(200), nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)

    fees: Mapped[list["NumberFee"]] = relationship(back_populates="resource")


class NumberFee(Base):


    __tablename__ = "number_fees"
    __table_args__ = (UniqueConstraint("resource_id", "effective_on", name="uq_number_fee_effective"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    assistant_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("assistants.id", ondelete="SET NULL"))
    monthly_amount: Mapped[Decimal] = mapped_column(Numeric(14, 6), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="USD")
    effective_on: Mapped[date] = mapped_column(Date, nullable=False)
    proration: Mapped[str] = mapped_column(String(20), nullable=False, default="full_month")
    note: Mapped[str | None] = mapped_column(String(200))

    resource: Mapped[Resource] = relationship(back_populates="fees")


class Call(Base):
    __tablename__ = "calls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), index=True)
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), index=True)
    assistant_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("assistants.id", ondelete="SET NULL"))
    telnyx_conversation_id: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    telnyx_call_control_id: Mapped[str | None] = mapped_column(String(200))
    telnyx_call_session_id: Mapped[str | None] = mapped_column(String(80), index=True)
    telnyx_call_leg_id: Mapped[str | None] = mapped_column(String(80))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_sec: Mapped[int | None] = mapped_column(Integer)
    direction: Mapped[str | None] = mapped_column(String(32))
    masked_caller: Mapped[str | None] = mapped_column(String(32))
    channel: Mapped[str] = mapped_column(String(40), nullable=False, default="phone_call")
    session_cost_total: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    session_currency: Mapped[str | None] = mapped_column(String(8))


    session_breakdown: Mapped[dict | None] = mapped_column(JSONB)
    session_status: Mapped[str | None] = mapped_column(String(20))
    session_fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cost_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    recorded_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    currency: Mapped[str | None] = mapped_column(String(8))

    charges: Mapped[list["Charge"]] = relationship(back_populates="call")
    clinic: Mapped[Clinic] = relationship()
    assistant: Mapped[Assistant | None] = relationship()


class Charge(Base):
    __tablename__ = "charges"
    __table_args__ = (UniqueConstraint("service", "telnyx_record_id", name="uq_charges_service_record"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), index=True)
    clinic_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="SET NULL"), index=True)
    call_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id", ondelete="CASCADE"), index=True)
    service: Mapped[str] = mapped_column(String(80), nullable=False)
    telnyx_record_id: Mapped[str] = mapped_column(String(160), nullable=False)
    source_name: Mapped[str | None] = mapped_column(String(80))
    allocation_method: Mapped[str | None] = mapped_column(String(20))
    amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    currency: Mapped[str | None] = mapped_column(String(8))
    billed_duration_sec: Mapped[int | None] = mapped_column(Integer)
    rate: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    rate_unit: Mapped[str | None] = mapped_column(String(40))
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    cost_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")

    call: Mapped[Call | None] = relationship(back_populates="charges")


class UsageTotal(Base):
    __tablename__ = "usage_totals"
    __table_args__ = (
        UniqueConstraint("product", "window_start", "window_end", "currency", name="uq_usage_window"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product: Mapped[str] = mapped_column(String(80), nullable=False)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="USD")
    telnyx_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    telnyx_billed_sec: Mapped[Decimal | None] = mapped_column(Numeric(18, 4))
    telnyx_call_sec: Mapped[Decimal | None] = mapped_column(Numeric(18, 4))
    available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Reconciliation(Base):
    __tablename__ = "reconciliations"
    __table_args__ = (
        UniqueConstraint("product", "window_start", "window_end", "currency", name="uq_recon_window"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product: Mapped[str] = mapped_column(String(80), nullable=False)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="USD")
    telnyx_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    local_priced_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    pending_charge_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    delta: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False, default="")


class SyncRun(Base):
    __tablename__ = "sync_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    mode: Mapped[str] = mapped_column(String(20), nullable=False)
    error: Mapped[str | None] = mapped_column(Text)
    stats: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
````

## File: zaya-usage-web-main/backend/app/production.py
````python
from datetime import date
from decimal import Decimal




LIST_PRICE = Decimal("1.00")
LIST_PRICE_EFFECTIVE = date(2026, 1, 1)
LIST_PRICE_NOTE = "Telnyx list price (unconfirmed)"

CLIENTS = (
    {
        "slug": "hfaac",
        "name": "Houston Foot and Ankle Care",
        "clinic_code": "HFAAC",
        "clinic_name": "HFAAC",
        "assistant_id": "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac",
        "assistant_name": "HFAAC-Agent",
        "billing_group_id": "4bdf3e48-fd42-480e-9bd8-fe96affd1be2",
        "number_id": "3066176828201764232",
    },
    {
        "slug": "agp",
        "name": "AGP Family Health Clinic",
        "clinic_code": "AGP",
        "clinic_name": "AGP",
        "assistant_id": "assistant-f3cf8aea-7c8e-451a-b577-19b828f86156",
        "assistant_name": "AGP-Health-Clinic-Agent",
        "billing_group_id": "90e164fb-77ba-4bde-94d7-8c3630ce3b2d",
        "number_id": "3066176828184987015",
    },
    {
        "slug": "mmc",
        "name": "Family Medicine MMC",
        "clinic_code": "MMC",
        "clinic_name": "MMC",
        "assistant_id": "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a",
        "assistant_name": "MMC-Agent",
        "billing_group_id": "61c0967c-f7cb-42ef-89db-1045dc1c8ad9",
        "number_id": "3067564118098576897",
    },
    {
        "slug": "schaumburg",
        "name": "Schaumburg",
        "clinic_code": "SCHAUMBURG",
        "clinic_name": "Schaumburg",
        "assistant_id": "assistant-429c0bf6-c5af-4eac-9fd5-7289487b5bf9",
        "assistant_name": "Schaumburg-Derm-Agent",
        "billing_group_id": "600e73df-ed3e-4900-83d1-79ec8f081fab",
        "number_id": "3068523548998895141",
    },
)







ASSISTANTS = (
    {"id": "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac", "name": "HFAAC-Agent", "group": "hfaac", "client_visible": True},
    {"id": "assistant-ce6e961c-d4d7-417f-8d8b-8e88991f85dd", "name": "HFAAC-Agent-Copy", "group": None, "client_visible": False},
    {"id": "assistant-f3cf8aea-7c8e-451a-b577-19b828f86156", "name": "AGP-Health-Clinic-Agent", "group": "agp", "client_visible": True},
    {"id": "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a", "name": "MMC-Agent", "group": "mmc", "client_visible": True},
    {"id": "assistant-1128ffea-3791-4e7d-b740-d0d6f8fb2c0b", "name": "MMC-Agent-Gateway-Copy", "group": None, "client_visible": False},
    {"id": "assistant-429c0bf6-c5af-4eac-9fd5-7289487b5bf9", "name": "Schaumburg-Derm-Agent", "group": "schaumburg", "client_visible": True},
    {"id": "assistant-79d5143a-d9bb-4eda-8dc7-c5feec5ddba0", "name": "Texas-Lung-Agent", "group": None, "client_visible": True},
    {"id": "assistant-fea032f4-9f48-4333-8c81-b3a602221840", "name": "Zaya Voice - Book Appointment Flow", "group": None, "client_visible": True},
)






DISPLAY_NAMES = {
    "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac": "Houston Foot and Ankle Care",
    "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a": "Family Medicine MMC",
    "assistant-f3cf8aea-7c8e-451a-b577-19b828f86156": "AGP Family Health Clinic",
}


CLIENT_NAMES = {spec["slug"]: spec["name"] for spec in CLIENTS}
````

## File: zaya-usage-web-main/backend/app/security.py
````python
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Response
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import SessionToken, User

_hasher = PasswordHasher()
SESSION_COOKIE = "zaya_session"
CSRF_COOKIE = "zaya_csrf"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def new_session(db: Session, user: User) -> tuple[str, str]:
    settings = get_settings()
    raw = secrets.token_urlsafe(32)
    csrf = secrets.token_urlsafe(32)
    row = SessionToken(
        user_id=user.id,
        token_hash=hash_token(raw),
        csrf_token=csrf,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.session_days),
    )
    db.add(row)
    db.commit()
    return raw, csrf


def session_from_raw(db: Session, raw: str | None) -> SessionToken | None:
    if not raw:
        return None
    row = db.query(SessionToken).filter(SessionToken.token_hash == hash_token(raw)).one_or_none()
    if row is None:
        return None
    expires = row.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        return None
    return row


def set_auth_cookies(response: Response, raw: str, csrf: str) -> None:
    settings = get_settings()
    max_age = settings.session_days * 24 * 3600
    response.set_cookie(
        SESSION_COOKIE,
        raw,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=max_age,
        path="/",
    )
    response.set_cookie(
        CSRF_COOKIE,
        csrf,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=max_age,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(SESSION_COOKIE, path="/", secure=settings.cookie_secure, samesite="lax")
    response.delete_cookie(CSRF_COOKIE, path="/", secure=settings.cookie_secure, samesite="lax")


def csrf_matches(session: SessionToken, header: str | None) -> bool:
    if not header:
        return False
    return hmac.compare_digest(header, session.csrf_token)
````

## File: zaya-usage-web-main/backend/tests/conftest.py
````python
import os

os.environ["DATABASE_URL"] = "postgresql+psycopg://zaya:zaya@127.0.0.1:5432/zaya_usage_test"
os.environ["SEED_DEMO"] = "false"
os.environ["SESSION_SECRET"] = "test-secret"
os.environ["SYNC_JOB_TOKEN"] = "test-job-token"
os.environ["COOKIE_SECURE"] = "false"
os.environ["TELNYX_MODE"] = "fixture"
os.environ["ADMIN_EMAIL"] = "admin@zayahealth.example"
os.environ["ADMIN_PASSWORD"] = "local-admin-pass"
os.environ["DEMO_PASSWORD"] = "local-clinic-pass"

os.environ["SESSION_ANALYSIS_MAX_PER_RUN"] = "0"

from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
import pytest
from sqlalchemy import text

from app.config import reset_settings
from app.db import SessionLocal, engine
from app.main import create_app

reset_settings()


@pytest.fixture(scope="session", autouse=True)
def migrated():
    config = Config("alembic.ini")
    command.upgrade(config, "head")
    yield


@pytest.fixture()
def db(migrated):
    del migrated
    session = SessionLocal()
    session.execute(
        text(
            "TRUNCATE sync_runs, reconciliations, usage_totals, charges, calls, number_fees, resources, user_assistants, assistants, clinics, sessions, users, clients RESTART IDENTITY CASCADE"
        )
    )
    session.commit()
    yield session
    session.close()


@pytest.fixture()
def api(db):
    del db
    application = create_app()
    with TestClient(application) as client:
        yield client


@pytest.fixture(scope="session", autouse=True)
def dispose_engine():
    yield
    engine.dispose()
````

## File: zaya-usage-web-main/backend/tests/test_assistants.py
````python
import httpx

from app.models import Assistant
from app.production import ASSISTANTS
from app.services.assistants import refresh_assistants
from app.services.production_seed import seed_production
from app.telnyx.client import LiveTelnyx, TelnyxError
from app.telnyx.limiter import RateLimiter

HFAAC = "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac"


def _live(handler) -> LiveTelnyx:
    return LiveTelnyx("test-key", transport=httpx.MockTransport(handler), limiter=RateLimiter(0, 1), attempts=1, sleep=lambda _: None)


def test_live_list_assistants_keeps_only_id_and_name():
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request.url.path)
        return httpx.Response(200, json={"data": [{"id": HFAAC, "name": "HFAAC-Agent", "instructions": "secret prompt"}]})

    rows = _live(handler).list_assistants()
    assert seen == ["/v2/ai/assistants"]
    assert rows == [{"id": HFAAC, "name": "HFAAC-Agent"}]


def test_refresh_renames_and_adds_from_telnyx(db):
    seed_production(db)

    class Source:
        def list_assistants(self):
            return [
                {"id": HFAAC, "name": "HFAAC-Agent v2"},
                {"id": "assistant-00000000-0000-0000-0000-000000000001", "name": "Brand New"},
            ]

    result = refresh_assistants(db, Source())
    assert result == {"source": "telnyx", "error": None, "count": 2, "added": 1}
    assert db.query(Assistant).filter(Assistant.telnyx_assistant_id == HFAAC).one().name == "HFAAC-Agent v2"
    new = db.query(Assistant).filter(Assistant.telnyx_assistant_id.endswith("000000000001")).one()
    assert new.client_visible is False


def test_refresh_falls_back_to_confirmed_list(db):
    class Down:
        def list_assistants(self):
            raise TelnyxError("Telnyx 503", status_code=503)

    result = refresh_assistants(db, Down())
    assert result["source"] == "fallback"
    stored = {row.telnyx_assistant_id: row.name for row in db.query(Assistant).all()}
    assert stored == {spec["id"]: spec["name"] for spec in ASSISTANTS}


def test_sync_rename_keeps_clinic_display_name(db):
    seed_production(db)

    class Source:
        def list_assistants(self):
            return [{"id": HFAAC, "name": "HFAAC-Agent renamed"}]

    refresh_assistants(db, Source())
    row = db.query(Assistant).filter(Assistant.telnyx_assistant_id == HFAAC).one()
    assert row.name == "HFAAC-Agent renamed"
    assert row.display_name == "Houston Foot and Ankle Care"
    assert row.label == "Houston Foot and Ankle Care"
    mmc = db.query(Assistant).filter(Assistant.telnyx_assistant_id == "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a").one()
    agp = db.query(Assistant).filter(Assistant.telnyx_assistant_id == "assistant-f3cf8aea-7c8e-451a-b577-19b828f86156").one()
    assert (mmc.label, agp.label) == ("Family Medicine MMC", "AGP Family Health Clinic")


def test_sync_restores_canonical_names_over_old_seed_names(db):
    from app.models import Client

    seed_production(db)
    mmc_id = "assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a"
    db.query(Client).filter(Client.slug == "mmc").one().name = "Metro Medical Clinic"
    db.query(Assistant).filter(Assistant.telnyx_assistant_id == mmc_id).one().display_name = "Metro Medical Clinic"
    db.flush()

    class Source:
        def list_assistants(self):
            return [{"id": mmc_id, "name": "MMC-Agent"}]

    refresh_assistants(db, Source())
    assert db.query(Client).filter(Client.slug == "mmc").one().name == "Family Medicine MMC"
    row = db.query(Assistant).filter(Assistant.telnyx_assistant_id == mmc_id).one()
    assert row.display_name == "Family Medicine MMC"
    assert row.label == "Family Medicine MMC"
    assert row.name == "MMC-Agent"
````

## File: zaya-usage-web-main/backend/tests/test_billing.py
````python
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from app.models import Assistant, Call, Charge, Client, UsageTotal
from app.services.billing import amount_for_fee, billing_view, build_usage_charges, pick_attribution_dimension
from app.services.seed import seed_demo
from app.services.sync import sync_window
from app.services.windows import month_window
from app.telnyx.client import FixtureTelnyx


def test_pick_attribution_dimension_prefers_assistant_then_connection():
    assert pick_attribution_dimension(["date", "billing_group_id", "assistant_id"]) == "assistant_id"
    assert pick_attribution_dimension(["date", "currency"]) is None
    assert pick_attribution_dimension(["connection_id", "billing_group_id"]) == "connection_id"


def test_amount_for_fee_full_prorated_future_and_zero():
    start = datetime(2026, 10, 1, tzinfo=timezone.utc)
    end = datetime(2026, 11, 1, tzinfo=timezone.utc)
    assert amount_for_fee(Decimal("4"), date(2026, 1, 1), "full_month", start, end) == Decimal("4")
    assert amount_for_fee(Decimal("4"), date(2026, 10, 16), "full_month", start, end) == Decimal("4")
    assert amount_for_fee(Decimal("6"), date(2026, 10, 16), "prorated", start, end) == Decimal("3.0968")
    assert amount_for_fee(Decimal("6"), date(2026, 11, 1), "full_month", start, end) is None
    assert amount_for_fee(Decimal("0"), date(2026, 1, 1), "full_month", start, end) == Decimal("0")


def test_exact_attribution_leaves_an_unmapped_group_unallocated():
    client, clinic = uuid.uuid4(), uuid.uuid4()
    group = "4bdf3e48-fd42-480e-9bd8-fe96affd1be2"
    charges, unallocated = build_usage_charges(
        service="recording",
        rows=[
            {"cost": "1.25", "billing_group_id": group, "currency": "USD"},
            {"cost": "0.50", "billing_group_id": "unmapped-billing-group", "currency": "USD"},
        ],
        dimensions=["date", "currency", "billing_group_id"],
        start=datetime(2026, 10, 1, tzinfo=timezone.utc),
        lookups={"billing_group_id": {group: (client, clinic)}},
        minute_shares={(client, clinic, date(2026, 10, 1)): Decimal("30")},
    )
    assert unallocated == Decimal("0.50")
    assert len(charges) == 1
    assert charges[0]["allocation_method"] == "exact"
    assert charges[0]["call_id"] is None
    assert charges[0]["clinic_id"] == clinic
    assert charges[0]["amount"] == Decimal("1.25")


def test_allocation_splits_a_day_by_minutes_and_drops_a_day_with_none():
    first, second = uuid.uuid4(), uuid.uuid4()
    clinic_a, clinic_b = uuid.uuid4(), uuid.uuid4()
    day1 = date(2026, 10, 1)
    shares = {
        (first, clinic_a, day1): Decimal("30"),
        (second, clinic_b, day1): Decimal("10"),
    }
    charges, unallocated = build_usage_charges(
        service="noise-suppression",
        rows=[
            {"cost": "1.00", "date": "2026-10-01", "currency": "USD"},
            {"cost": "2.00", "date": "2026-10-02", "currency": "USD"},
        ],
        dimensions=["date", "currency"],
        start=datetime(2026, 10, 1, tzinfo=timezone.utc),
        lookups={},
        minute_shares=shares,
    )
    assert unallocated == Decimal("2.00")
    assert {row["allocation_method"] for row in charges} == {"allocated"}
    assert all(row["call_id"] is None for row in charges)
    by_client = {row["client_id"]: row["amount"] for row in charges}
    assert by_client[first] == Decimal("0.750000")
    assert by_client[second] == Decimal("0.250000")
    assert sum(by_client.values(), Decimal("0")) == Decimal("1.00")


def _sync(db, month):
    seed_demo(db)
    start, end = month_window(month)
    run = sync_window(db, FixtureTelnyx(page_size=7), start, end)
    assert run.status == "succeeded", run.error
    return start, end


def _line(statement, service):
    return next(row for row in statement["lines"] if row["service"] == service)


def test_statements_cover_every_line_and_the_unallocated_remainder(db, api):
    start, end = _sync(db, "2026-10")
    _sync(db, "2026-09")

    october_recording = (
        db.query(Charge)
        .filter(Charge.service == "recording", Charge.occurred_at >= start, Charge.occurred_at < end)
        .all()
    )
    assert october_recording
    assert all(row.call_id is not None and row.source_name == "recording" for row in october_recording)
    usage = (
        db.query(UsageTotal)
        .filter(UsageTotal.product == "recording", UsageTotal.window_start == start, UsageTotal.window_end == end)
        .one()
    )
    assert sum((row.amount for row in october_recording), Decimal("0")) + Decimal("0.5000") == usage.telnyx_cost
    noise_calls = db.query(Call).filter(Call.charges.any(Charge.service == "noise-suppression")).all()
    assert noise_calls
    assert all(sum(1 for c in call.charges if c.service == "noise-suppression") == 2 for call in noise_calls)

    september_start, _september_end = month_window("2026-09")
    assert (
        db.query(Charge)
        .filter(Charge.service == "recording", Charge.occurred_at >= september_start, Charge.occurred_at < start)
        .count()
        > 0
    )

    login = api.post("/api/auth/login", json={"email": "admin@zayahealth.example", "password": "local-admin-pass"})
    assert login.status_code == 200
    csrf = login.json()["csrf_token"]
    october = api.get("/api/billing", params={"month": "2026-10"}).json()
    by_slug = {row["client_slug"]: row for row in october["statements"]}
    hfaac = by_slug["hfaac"]
    assert hfaac["grand_total"] is None
    assert "pending" in hfaac["flags"]
    assert "missing_config" in hfaac["flags"]
    assert _line(hfaac, "phone-number")["status"] == "missing_config"
    assert _line(hfaac, "phone-number")["amount"] is None
    assert _line(hfaac, "phone-number")["label"] == "Phone number (fixed monthly)"
    assert hfaac["known_total"] is not None
    recording = _line(hfaac, "recording")
    assert recording["status"] == "recorded"
    assert Decimal(recording["amount"]) > 0
    assert _line(by_slug["mmc"], "phone-number")["status"] == "missing_config"
    schaumburg = by_slug["schaumburg"]
    assert _line(schaumburg, "phone-number")["status"] == "missing_config"
    assert _line(schaumburg, "phone-number")["amount"] is None
    assert schaumburg["grand_total"] is None
    account_recording = next(row for row in october["account"]["rows"] if row["product"] == "recording")
    assert account_recording["unallocated"] == "0.5000"
    assert account_recording["status"] == "remainder"

    september = api.get("/api/billing", params={"month": "2026-09"}).json()
    hfaac_sept = next(row for row in september["statements"] if row["client_slug"] == "hfaac")
    assert hfaac_sept["grand_total"] is None
    assert _line(hfaac_sept, "phone-number")["status"] == "missing_config"

    api.post("/api/auth/logout", headers={"X-CSRF-Token": csrf})
    hfaac_login = api.post("/api/auth/login", json={"email": "hfaac@zayahealth.example", "password": "local-clinic-pass"})
    assert hfaac_login.status_code == 200
    stolen = str(db.query(Client).filter(Client.slug == "schaumburg").one().id)
    scoped = api.get("/api/billing", params={"month": "2026-10", "client_id": stolen}).json()
    assert scoped["account"] is None
    assert len(scoped["statements"]) == 1
    assert scoped["statements"][0]["client_name"] == "Houston Foot and Ankle Care"
    assert "Schaumburg" not in scoped["statements"][0]["client_name"]

    exported = api.get("/api/billing/export/csv", params={"month": "2026-10"})
    assert exported.status_code == 200
    assert "Phone number (fixed monthly)" in exported.text
    assert "Missing config" in exported.text
    assert "Schaumburg" not in exported.text
    pdf = api.get("/api/billing/export/pdf", params={"month": "2026-10"})
    assert pdf.content.startswith(b"%PDF")


def test_admin_can_set_a_number_fee(db, api):
    _sync(db, "2026-10")
    login = api.post("/api/auth/login", json={"email": "admin@zayahealth.example", "password": "local-admin-pass"})
    csrf = login.json()["csrf_token"]
    schaumburg = db.query(Assistant).filter(Assistant.telnyx_assistant_id.contains("429c0bf6")).one()
    from app.models import Resource

    number = (
        db.query(Resource)
        .filter(Resource.kind == "number", Resource.clinic_id == schaumburg.clinic_id)
        .one()
    )
    saved = api.post(
        "/api/admin/number-fees",
        json={
            "resource_id": str(number.id),
            "monthly_amount": "5.0000",
            "effective_on": "2026-10-01",
            "proration": "full_month",
            "note": "Telnyx list price (unconfirmed)",
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert saved.status_code == 200, saved.text
    assert saved.json()["note"] == "Telnyx list price (unconfirmed)"
    statement = next(
        row
        for row in api.get("/api/billing", params={"month": "2026-10"}).json()["statements"]
        if row["client_slug"] == "schaumburg"
    )
    assert _line(statement, "phone-number")["amount"] == "5.0000"
    assert _line(statement, "phone-number")["status"] == "recorded"
````

## File: zaya-usage-web-main/backend/tests/test_live_refresh.py
````python
from datetime import datetime, timedelta, timezone

from app.models import Assistant, Call
from app.services.seed import seed_demo
from app.services.sync import live_refresh, live_window, sync_window
from app.services.windows import month_window
from app.telnyx.client import FixtureTelnyx
from app.telnyx.fixtures import HFAAC_ASSISTANT


def test_live_window_is_recent_part_of_open_month_only():
    start, end = month_window("2026-10")
    now = datetime(2026, 10, 26, 16, 0, tzinfo=timezone.utc)
    window = live_window(start, end, now)
    assert window is not None
    assert window[0] == now - timedelta(hours=26)
    assert window[1] == now + timedelta(minutes=1)
    assert live_window(*month_window("2026-09"), now) is None
    early = live_window(start, end, datetime(2026, 10, 1, 3, tzinfo=timezone.utc))
    assert early is not None and early[0] == start


def test_live_refresh_scoped_to_one_assistant(db):
    seed_demo(db)
    start, end = month_window("2026-10")
    hfaac = db.query(Assistant).filter(Assistant.telnyx_assistant_id == HFAAC_ASSISTANT).one()
    result = live_refresh(db, FixtureTelnyx(page_size=7), start, end, {hfaac.id})
    assert result["calls_seen"] > 0
    rows = db.query(Call).all()
    assert rows and {row.assistant_id for row in rows} == {hfaac.id}
    live_ids = {row.telnyx_conversation_id for row in rows}

    run = sync_window(db, FixtureTelnyx(page_size=7), start, end)
    assert run.status == "succeeded", run.error
    full = {row.telnyx_conversation_id for row in db.query(Call).filter(Call.assistant_id == hfaac.id)}
    assert live_ids == full


def test_refresh_endpoint_closed_month_and_auth(api, db):
    seed_demo(db)
    assert api.post("/api/refresh?month=2026-09").status_code == 401
    login = api.post("/api/auth/login", json={"email": "admin@zayahealth.example", "password": "local-admin-pass"})
    assert login.status_code == 200
    csrf = api.cookies.get("zaya_csrf")
    body = api.post("/api/refresh?month=2026-09", headers={"X-CSRF-Token": csrf}).json()
    assert body["status"] == "skipped" and body["reason"] == "closed_month"


def test_call_log_sorts_whole_scope(db):
    from decimal import Decimal

    from app.services.metrics import list_calls

    seed_demo(db)
    start, end = month_window("2026-10")
    run = sync_window(db, FixtureTelnyx(page_size=7), start, end)
    assert run.status == "succeeded", run.error
    for sort in ["duration", "billed", "cost", "caller", "conversation", "started_at"]:
        for direction in ["asc", "desc"]:
            full = list_calls(db, "2026-10", None, 500, 0, sort=sort, direction=direction)["calls"]
            paged = []
            for offset in range(0, len(full), 5):
                paged += list_calls(db, "2026-10", None, 5, offset, sort=sort, direction=direction)["calls"]
            assert [r["id"] for r in paged] == [r["id"] for r in full]
    rows = list_calls(db, "2026-10", None, 500, 0, sort="cost", direction="asc")["calls"]
    costs = [Decimal(r["billable"]["total"]) for r in rows if r["billable"]["total"] is not None]
    assert costs == sorted(costs)
    assert all(r["billable"]["total"] is None for r in rows[len(costs):])
    rows = list_calls(db, "2026-10", None, 500, 0, sort="duration", direction="desc")["calls"]
    known = [r["duration_sec"] for r in rows if r["duration_sec"] is not None]
    assert known == sorted(known, reverse=True)


def test_direction_from_assistant_leg_not_noise_or_transfer():
    from types import SimpleNamespace

    from app.services.sync import _apply_direction

    call = SimpleNamespace(telnyx_call_leg_id="leg-ai", direction=None, masked_caller=None)

    _apply_direction("call-control", {"direction": "inbound", "telnyx_leg_id": "leg-ai", "cli": "+13125550101", "cld": "+17135550000"}, call)
    _apply_direction("call-control", {"direction": "outbound", "telnyx_leg_id": "leg-xfer", "cli": "+17135550000", "cld": "+18005550000"}, call)
    _apply_direction("noise-suppression", {"direction": "outbound", "telnyx_leg_id": "leg-ai"}, call)
    assert call.direction == "inbound"
    assert call.masked_caller == "+13125550101"

    call.direction = "outbound"
    _apply_direction("call-control", {"direction": "inbound", "telnyx_leg_id": "leg-ai"}, call)
    assert call.direction == "inbound"
````

## File: zaya-usage-web-main/backend/tests/test_parse.py
````python
from decimal import Decimal

import pytest

from app.telnyx.client import TelnyxError, iter_pages, iter_until_empty, request_with_retry
from app.telnyx.parse import clean_id, detail_identity, mask_phone, node_identity, normalize_service, parse_cost


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        (None, None),
        ("", None),
        ("  ", None),
        ("No cost data available.", None),
        ("no cost data available.", None),
        ("0", Decimal("0")),
        ("0.000000", Decimal("0.000000")),
        ("0.002", Decimal("0.002")),
        (0, Decimal("0")),
        (0.012, Decimal("0.012")),
        (True, None),
        ("not-a-number", None),
        ("None", None),
        ("none", None),
        ("7.04E-4", Decimal("0.000704")),
        ("7.04e-4", Decimal("0.000704")),
    ],
)
def test_parse_cost_distinguishes_zero_from_missing(raw, expected):
    assert parse_cost(raw) == expected


def test_normalize_service_skips_session_container():
    assert normalize_service("call-session") is None
    assert normalize_service("callcontrol-cdrs") == "call-control"
    assert normalize_service("stt") == "speech-to-text"
    assert normalize_service("tts") == "text-to-speech"


def test_mask_phone_keeps_last_four_only():
    assert mask_phone("+13125550901") == "•••0901"
    assert mask_phone("12") == "••••"
    assert mask_phone(None) is None


def test_ai_record_is_keyed_by_conversation_and_shared_leg_stays_two_services():
    service, rid, _source = detail_identity(
        {"record_type": "ai-voice-assistant", "conversation_id": "conv-1", "telnyx_leg_id": "leg-1"}
    )
    assert service == "ai-voice-assistant"
    assert rid == "conv-1"
    assert detail_identity({"record_type": "ai-voice-assistant", "conversation_id": "None"})[1] is None
    cc = detail_identity({"record_type": "call-control", "id": "leg-1"})
    sip = detail_identity({"record_type": "sip-trunking", "id": "leg-1"})
    assert cc[1] == sip[1] == "leg-1"
    assert cc[0] != sip[0]
    assert clean_id("None") is None
    assert clean_id("") is None


def test_session_node_uses_conversation_id_for_ai():
    service, rid, _source = node_identity(
        {
            "id": "conv-1",
            "product": "ai-voice-assistant",
            "record": {"record_type": "ai-voice-assistant", "conversation_id": "conv-1"},
        }
    )
    assert (service, rid) == ("ai-voice-assistant", "conv-1")
    service, rid, _source = node_identity(
        {"id": "leg-1", "product": "call-control", "record": {"record_type": "call-control", "id": "leg-1"}}
    )
    assert (service, rid) == ("call-control", "leg-1")


def test_conversation_pager_ignores_total_results_and_stops_on_short_page():
    def fetch(page: int):
        if page == 1:
            return {"data": [{"id": "a"}, {"id": "b"}], "meta": {"total_results": 99, "total_pages": 50}}
        if page == 2:
            return {"data": [{"id": "c"}], "meta": {"total_results": 99}}
        return {"data": [{"id": "should-not-read"}], "meta": {"total_results": 99}}

    rows, truncated = iter_until_empty(fetch, page_size=2)
    assert [row["id"] for row in rows] == ["a", "b", "c"]
    assert truncated is False
    capped, hit = iter_until_empty(fetch, page_size=2, max_pages=1)
    assert [row["id"] for row in capped] == ["a", "b"]
    assert hit is True


def test_detail_pages_follow_meta_total_pages():
    def fetch(page: int):
        return {"data": [{"id": page}], "meta": {"total_pages": 2, "page_number": page}}

    assert [row["id"] for row in iter_pages(fetch)] == [1, 2]


def test_retry_honors_retry_after_then_succeeds():
    attempts = {"n": 0}

    def do():
        attempts["n"] += 1
        import httpx

        if attempts["n"] < 3:
            return httpx.Response(429, headers={"retry-after": "0.01"}, json={"errors": [{"code": "10011"}]})
        return httpx.Response(200, json={"ok": True})

    slept = []
    response = request_with_retry(do, sleep=slept.append, attempts=4, rng=_ZeroRng())
    assert response.status_code == 200
    assert attempts["n"] == 3
    assert slept == [0.01, 0.01]


def test_client_error_is_not_retried():
    attempts = {"n": 0}

    def do():
        attempts["n"] += 1
        import httpx

        return httpx.Response(400, json={"errors": [{"code": "10003"}]})

    with pytest.raises(TelnyxError) as raised:
        request_with_retry(do, sleep=lambda _: None, attempts=4, rng=_ZeroRng())
    assert raised.value.status_code == 400
    assert attempts["n"] == 1


class _ZeroRng:
    def random(self) -> float:
        return 0.0


def test_caller_from_record_prefers_end_user_side():
    from app.services.sync import caller_from_record

    assert caller_from_record({"cli": "+13125550101", "cld": "+17135550000", "direction": "inbound"}) == "+13125550101"
    assert caller_from_record({"cli": "+17135550000", "cld": "+13125550101", "direction": "outbound"}) == "+13125550101"
    assert caller_from_record({"metadata": {"telnyx_end_user_target": "+13125550199"}}) == "+13125550199"
    assert caller_from_record({"conversation_id": "c1"}) is None


def test_canonical_names_have_no_metro_medical():
    from app.production import CLIENT_NAMES, DISPLAY_NAMES

    assert CLIENT_NAMES["mmc"] == "Family Medicine MMC"
    assert "Metro Medical Clinic" not in set(CLIENT_NAMES.values()) | set(DISPLAY_NAMES.values())
````

## File: zaya-usage-web-main/backend/tests/test_production.py
````python
from decimal import Decimal
from pathlib import Path

from app.models import Assistant, Client, NumberFee, Resource, User, UserAssistant
from app.production import ASSISTANTS, CLIENTS, LIST_PRICE_NOTE
from app.security import verify_password
from app.services.accounts import create_accounts
from app.services.billing import billing_view
from app.services.production_seed import seed_production
from app.services.seed import seed_demo
from app.services.sync import sync_window
from app.telnyx.client import FixtureTelnyx
from app.services.windows import month_window


def test_startup_with_seed_demo_false_inserts_nothing(api, db):
    del api
    assert db.query(Client).count() == 0
    assert db.query(User).count() == 0
    assert db.query(NumberFee).count() == 0


def test_demo_seed_creates_no_number_fees(db):
    seed_demo(db)
    assert db.query(NumberFee).count() == 0
    assert db.query(User).filter(User.role == "client_user").count() == 4
    ids = {row[0] for row in db.query(Resource.telnyx_id).filter(Resource.kind == "number").all()}
    assert "3066176828201764232" not in ids


def test_production_seed_maps_four_numbers_and_no_users(db):
    seed_production(db)
    assert db.query(User).count() == 0
    assert {"hfaac", "agp", "mmc", "schaumburg"} <= {row.slug for row in db.query(Client).all()}
    stored = {row.telnyx_assistant_id: row for row in db.query(Assistant).all()}
    assert {key: row.name for key, row in stored.items()} == {spec["id"]: spec["name"] for spec in ASSISTANTS}
    hidden = {row.name for row in stored.values() if not row.client_visible}
    assert hidden == {"HFAAC-Agent-Copy", "MMC-Agent-Gateway-Copy"}
    hfaac = db.query(Client).filter(Client.slug == "hfaac").one()
    assert stored["assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac"].client_id == hfaac.id
    numbers = {row.telnyx_id: row for row in db.query(Resource).filter(Resource.kind == "number").all()}
    assert set(numbers) == {spec["number_id"] for spec in CLIENTS}
    fees = db.query(NumberFee).all()
    assert len(fees) == 4
    assert {fee.proration for fee in fees} == {"full_month"}
    assert {fee.note for fee in fees} == {LIST_PRICE_NOTE}
    assert all(fee.monthly_amount == Decimal("1.00") for fee in fees)

    start, end = month_window("2026-09")
    run = sync_window(db, FixtureTelnyx(), start, end)
    assert run.status == "succeeded", run.error
    view = billing_view(db, "2026-09", None, None, False)
    hfaac = next(row for row in view["statements"] if row["client_slug"] == "hfaac")
    phone = next(line for line in hfaac["lines"] if line["service"] == "phone-number")
    assert phone["amount"] == "1.0000"
    assert phone["status"] == "recorded"
    assert phone["numbers"][0]["note"] == LIST_PRICE_NOTE
    assert hfaac["grand_total"] is not None
    assert "missing_config" not in hfaac["flags"]
    assert Decimal(hfaac["grand_total"]) == sum(Decimal(line["amount"]) for line in hfaac["lines"])

    target = fees[0]
    target.monthly_amount = Decimal("2.50")
    target.note = "edited"
    db.commit()
    seed_production(db)
    assert db.query(NumberFee).count() == 4
    assert db.query(User).count() == 0
    edited = db.get(NumberFee, target.id)
    assert edited.monthly_amount == Decimal("2.50")
    assert edited.note == "edited"


def test_create_accounts_from_supplied_passwords(db):
    seed_production(db)
    rows = create_accounts(
        db,
        [
            {"email": "ops@example.com", "password": "correct-horse", "role": "admin"},
            {
                "email": "desk@example.com",
                "password": "another-good-pass",
                "role": "client_user",
                "client_slug": "hfaac",
            },
        ],
    )
    assert rows == [
        {"email": "ops@example.com", "created": True},
        {"email": "desk@example.com", "created": True},
    ]
    admin = db.query(User).filter(User.email == "ops@example.com").one()
    assert admin.role == "admin"
    assert admin.client_id is None
    assert verify_password("correct-horse", admin.password_hash)
    desk = db.query(User).filter(User.email == "desk@example.com").one()
    assert desk.client_id == db.query(Client).filter(Client.slug == "hfaac").one().id
    links = db.query(UserAssistant).filter(UserAssistant.user_id == desk.id).all()
    assert len(links) == 1
    again = create_accounts(
        db,
        [{"email": "ops@example.com", "password": "different-password", "role": "admin"}],
    )
    assert again == [{"email": "ops@example.com", "created": False}]
    db.refresh(admin)
    assert verify_password("correct-horse", admin.password_hash)


def test_user_cli_has_no_hardcoded_secret():
    source = Path("app/jobs/users.py").read_text()
    assert "@" not in source
    assert "local-admin" not in source
    assert "local-clinic" not in source
    assert "change-me" not in source
````

## File: zaya-usage-web-main/backend/tests/test_rate_limit.py
````python
import threading
from datetime import datetime, timedelta, timezone

import httpx
import pytest

from app.config import allowed_origins, get_settings, reset_settings
from app.models import Charge, SyncRun
from app.services.seed import seed_demo
from app.services.sync import sync_window
from app.services.windows import month_window, usage_slices
from app.telnyx.client import DETAIL_PAGE_SIZE, USAGE_PAGE_SIZE, LiveTelnyx, TelnyxError, request_with_retry
from app.telnyx.limiter import RateLimiter


class _Clock:
    def __init__(self) -> None:
        self.t = 0.0
        self.slept: list[float] = []

    def clock(self) -> float:
        return self.t

    def sleep(self, seconds: float) -> None:
        self.slept.append(seconds)
        self.t += seconds


class _ZeroRng:
    def random(self) -> float:
        return 0.0


class _OneRng:
    def random(self) -> float:
        return 1.0


def _response(status: int, headers: dict | None = None):
    return httpx.Response(status, headers=headers or {}, json={"ok": True})


def test_limiter_spaces_calls_and_holds_one_in_flight():
    clock = _Clock()
    limiter = RateLimiter(min_interval=1, max_concurrent=1, sleep=clock.sleep, clock=clock.clock)
    limiter.acquire()
    limiter.release()
    limiter.acquire()
    limiter.release()
    assert clock.slept == [1]

    blocker = RateLimiter(min_interval=0, max_concurrent=1, sleep=clock.sleep, clock=clock.clock)
    blocker.acquire()
    entered: list[float] = []

    def other() -> None:
        blocker.acquire()
        entered.append(1)
        blocker.release()

    thread = threading.Thread(target=other)
    thread.start()
    thread.join(timeout=0.15)
    assert entered == []
    blocker.release()
    thread.join(timeout=1)
    assert entered == [1]


def test_retry_honors_retry_after_and_rate_limit_reset():
    attempts = {"n": 0}

    def do():
        attempts["n"] += 1
        if attempts["n"] == 1:
            return _response(429, {"retry-after": "1", "x-ratelimit-reset": "5", "x-ratelimit-remaining": "0"})
        return _response(200)

    slept: list[float] = []
    response = request_with_retry(do, sleep=slept.append, attempts=3, rng=_ZeroRng(), now=lambda: 1_700_000_000)
    assert response.status_code == 200
    assert slept == [5]

    attempts["n"] = 0

    def epoch():
        attempts["n"] += 1
        if attempts["n"] == 1:
            return _response(429, {"x-ratelimit-reset": "1700000004"})
        return _response(200)

    slept.clear()
    request_with_retry(epoch, sleep=slept.append, attempts=3, rng=_ZeroRng(), now=lambda: 1_700_000_000)
    assert slept == [4]


def test_retry_adds_jitter_and_backs_off_without_headers():
    attempts = {"n": 0}

    def do():
        attempts["n"] += 1
        if attempts["n"] < 3:
            return _response(429, {"retry-after": "0.01"})
        return _response(200)

    slept: list[float] = []
    request_with_retry(do, sleep=slept.append, attempts=4, rng=_OneRng())
    assert slept[0] == pytest.approx(0.01 + 0.0125)
    assert slept[1] == pytest.approx(0.01 + 0.0125)

    attempts["n"] = 0

    def bare():
        attempts["n"] += 1
        if attempts["n"] < 3:
            return _response(429)
        return _response(200)

    slept.clear()
    request_with_retry(bare, sleep=slept.append, attempts=4, rng=_ZeroRng())
    assert slept == [0.5, 1.0]


def test_success_with_no_remaining_delays_the_next_request():
    clock = _Clock()
    calls = {"n": 0}

    def handler(_request: httpx.Request) -> httpx.Response:
        calls["n"] += 1
        if calls["n"] == 1:
            return httpx.Response(
                200,
                headers={"x-ratelimit-remaining": "0", "x-ratelimit-reset": "4"},
                json={"data": [], "meta": {"total_pages": 1}},
            )
        return httpx.Response(200, json={"data": [], "meta": {"total_pages": 1}})

    limiter = RateLimiter(min_interval=1, max_concurrent=1, sleep=clock.sleep, clock=clock.clock)
    client = LiveTelnyx(
        "test-key",
        transport=httpx.MockTransport(handler),
        sleep=clock.sleep,
        limiter=limiter,
        attempts=2,
        rng=_ZeroRng(),
        now=lambda: clock.t,
    )
    start = datetime(2026, 10, 1, tzinfo=timezone.utc)
    end = datetime(2026, 11, 1, tzinfo=timezone.utc)
    client.detail_page("call-control", start, end, 1)
    client.detail_page("call-control", start, end, 2)
    assert clock.slept == [4]
    client.close()


def test_bulk_reads_use_the_max_page_size_and_the_right_date_field():
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200, json={"data": [], "meta": {"total_pages": 1, "page_size": 50}})

    limiter = RateLimiter(min_interval=0, max_concurrent=1, sleep=lambda _seconds: None, clock=lambda: 0)
    client = LiveTelnyx("test-key", transport=httpx.MockTransport(handler), limiter=limiter, attempts=2, rng=_ZeroRng())
    start = datetime(2026, 10, 1, tzinfo=timezone.utc)
    end = datetime(2026, 11, 1, tzinfo=timezone.utc)
    client.detail_page("call-control", start, end, 3)
    client.detail_page("ai-voice-assistant", start, end, 1)
    client.usage_page(
        "speech-to-text",
        start,
        end,
        1,
        metrics=["cost", "cost5d", "billed_sec"],
        dimensions=["date", "billing_group_id", "currency"],
    )
    client.close()

    control = seen[0].url.params
    assert control["filter[record_type]"] == "call-control"
    assert control["page[size]"] == str(DETAIL_PAGE_SIZE)
    assert control["page[number]"] == "3"
    assert "filter[started_at][gte]" in control
    assistant = seen[1].url.params
    assert assistant["filter[record_type]"] == "ai-voice-assistant"
    assert "filter[created_at][gte]" in assistant
    assert "filter[started_at][gte]" not in assistant
    usage = seen[2].url.params
    assert usage["page[size]"] == str(USAGE_PAGE_SIZE)
    assert usage.get_list("metrics[]") == ["cost", "billed_sec"]
    assert "cost5d" not in str(seen[2].url)


def test_usage_slices_use_one_month_or_one_day():
    start = datetime(2026, 10, 1, tzinfo=timezone.utc)
    end = datetime(2026, 11, 1, tzinfo=timezone.utc)
    assert usage_slices(start, end) == [(start, end)]
    longer = usage_slices(start, start + timedelta(days=32))
    assert len(longer) == 32
    assert longer[0] == (start, start + timedelta(days=1))
    assert longer[-1][1] == start + timedelta(days=32)


def test_429_pauses_the_month_and_resume_skips_finished_pages(db):
    seed_demo(db)
    start, end = month_window("2026-10")
    source = _Flaky()
    first = sync_window(db, source, start, end)
    assert first.status == "paused"
    assert first.status != "failed"
    assert first.stats["paused_on"] == "detail:call-control:page:2"
    assert "detail:call-control:page:1" in first.stats["completed"]
    assert "detail:call-control:page:2" not in first.stats["completed"]
    assert "detail:ai-voice-assistant:done" in first.stats["completed"]
    first_seen = list(source.detail_seen)

    second = sync_window(db, source, start, end)
    assert second.status == "succeeded", second.error
    assert second.stats["resumed"] is True
    second_seen = source.detail_seen[len(first_seen) :]
    assert ("call-control", 1) not in second_seen
    assert ("ai-voice-assistant", 1) not in second_seen
    assert ("call-control", 2) in second_seen
    assert db.query(SyncRun).filter(SyncRun.status == "failed").count() == 0

    calls = db.query(Charge).count()
    again = sync_window(db, _Flaky(fail_detail=False), start, end)
    assert again.status == "succeeded", again.error
    assert db.query(Charge).count() == calls
    assert db.query(Charge).filter(Charge.service == "recording").count() > 0


def test_usage_429_resumes_without_repeating_a_finished_product(db):
    seed_demo(db)
    start, end = month_window("2026-10")
    source = _Flaky(fail_detail=False, fail_usage=True)
    first = sync_window(db, source, start, end)
    assert first.status == "paused"
    assert first.stats["paused_on"].startswith("usage:call-control:")
    assert "usage:sip-trunking:done" in first.stats["completed"]
    first_usage = list(source.usage_seen)

    second = sync_window(db, source, start, end)
    assert second.status == "succeeded", second.error
    second_usage = source.usage_seen[len(first_usage) :]
    assert "sip-trunking" not in second_usage
    assert "call-control" in second_usage
    recording = db.query(Charge).filter(Charge.service == "recording").count()
    assert recording > 0
    assert db.query(Charge).filter(Charge.service == "recording", Charge.source_name == "usage_report").count() == 0
    third = sync_window(db, _Flaky(fail_detail=False), start, end)
    assert third.status == "succeeded", third.error
    assert db.query(Charge).filter(Charge.service == "recording").count() == recording


def test_allowed_origins_accept_both_cloud_run_urls(monkeypatch):
    monkeypatch.setenv(
        "FRONTEND_ORIGINS",
        "https://zaya-usage-web-699087212463.us-central1.run.app, https://zaya-usage-web-zjj2qolkja-uc.a.run.app",
    )
    monkeypatch.setenv("FRONTEND_ORIGIN", "http://127.0.0.1:43123, *")
    reset_settings()
    try:
        origins = allowed_origins(get_settings())
        assert origins == [
            "https://zaya-usage-web-699087212463.us-central1.run.app",
            "https://zaya-usage-web-zjj2qolkja-uc.a.run.app",
            "http://127.0.0.1:43123",
        ]
    finally:
        reset_settings()


class _Flaky:


    mode = "fixture"

    def __init__(self, fail_detail: bool = True, fail_usage: bool = False):
        from app.telnyx.client import FixtureTelnyx

        self._inner = FixtureTelnyx(page_size=7)
        self.detail_seen: list[tuple[str, int]] = []
        self.usage_seen: list[str] = []
        self.fail_detail = fail_detail
        self.fail_usage = fail_usage

    def detail_page(self, record_type, start, end, page):
        self.detail_seen.append((record_type, page))
        if self.fail_detail and record_type == "call-control" and page == 2:
            self.fail_detail = False
            raise TelnyxError("Telnyx HTTP 429", status_code=429, retry_after=1)
        return self._inner.detail_page(record_type, start, end, page)

    def usage_options(self):
        return self._inner.usage_options()

    def usage_page(self, product, start, end, page, metrics=None, dimensions=None):
        self.usage_seen.append(product)
        if self.fail_usage and product == "call-control":
            self.fail_usage = False
            raise TelnyxError("Telnyx HTTP 429", status_code=429, retry_after=1)
        return self._inner.usage_page(product, start, end, page, metrics=metrics, dimensions=dimensions)

    def list_conversations(self, *_args, **_kwargs):
        raise AssertionError("backfill listed conversations")

    def get_session(self, *_args, **_kwargs):
        raise AssertionError("backfill called session analysis")
````

## File: zaya-usage-web-main/backend/tests/test_sessions.py
````python
from decimal import Decimal

import httpx

from app.models import Call
from app.services.sessions import parse_session
from app.services.sync import sync_window
from app.services.windows import month_window
from app.telnyx.client import FixtureTelnyx, LiveTelnyx
from app.telnyx.limiter import RateLimiter

TREE = {
    "cost": {"total": "0.051200", "currency": "USD"},
    "root": {
        "id": "c83f0ce8-9c47-4458-8267-8cfefc310637",
        "product": "ai-voice-assistant",
        "cost": {"event_cost": "0.048000", "cumulative_cost": "0.051200", "currency": "USD"},
        "record": {"billed_sec": 90, "duration_sec": 84, "rate": "0.032", "rate_measured_in": "ai_voice_assistant_minutes", "model": "x"},
        "children": [
            {"id": "i1", "product": "inference", "cost": {"event_cost": "0.0016"}, "record": {"prompt_tokens": 10}, "children": []},
            {"id": "i2", "product": "inference", "cost": {"event_cost": "1.6E-3"}, "record": {}, "children": []},
        ],
    },
}


def test_parse_session_breaks_down_ai_and_inference():
    out = parse_session(TREE)
    assert out["total"] == "0.051200"
    assert out["products"]["ai-voice-assistant"] == {"cost": "0.048000", "count": 1, "missing": 0, "billed_sec": 90}
    assert out["products"]["inference"]["cost"] == "0.003200"
    assert out["products"]["inference"]["count"] == 2
    assert out["billed_sec"] == 90 and out["duration_sec"] == 84
    assert out["rate"] == "0.032"
    assert "model" not in str(out) and "prompt_tokens" not in str(out)


def test_missing_total_stays_missing():
    out = parse_session({"cost": {"total": "No cost data available."}, "root": {"product": "ai-voice-assistant", "cost": {"event_cost": None}, "children": []}})
    assert out["total"] is None
    assert out["products"]["ai-voice-assistant"]["cost"] is None


def test_live_get_session_path():
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append((request.url.path, dict(request.url.params)))
        return httpx.Response(200, json=TREE)

    source = LiveTelnyx("k", transport=httpx.MockTransport(handler), limiter=RateLimiter(0, 1), attempts=1, sleep=lambda _: None)
    assert source.get_session("ai-voice-assistant", "c83f0ce8-9c47-4458-8267-8cfefc310637", None) == TREE
    path, params = seen[0]
    assert path == "/v2/session_analysis/ai-voice-assistant/c83f0ce8-9c47-4458-8267-8cfefc310637"
    assert params["include_children"] == "true" and "date_time" not in params


def test_sync_caches_session_costs(db, monkeypatch):
    from app.config import reset_settings
    from app.services.seed import seed_demo

    monkeypatch.setenv("SESSION_ANALYSIS_MAX_PER_RUN", "400")
    reset_settings()

    seed_demo(db)
    start, end = month_window("2026-10")
    run = sync_window(db, FixtureTelnyx(), start, end)
    assert run.status == "succeeded", run.error
    assert run.stats["sessions"]["fetched"] > 0
    cached = db.query(Call).filter(Call.session_status == "ok").all()
    assert cached
    call = cached[0]
    assert "ai-voice-assistant" in call.session_breakdown["products"]
    if call.session_breakdown["total"] is not None:
        assert call.session_cost_total == Decimal(call.session_breakdown["total"])

    again = sync_window(db, FixtureTelnyx(), start, end)
    assert again.stats["sessions"]["fetched"] <= run.stats["sessions"]["fetched"]

    from app.services.metrics import dashboard

    billing = dashboard(db, "2026-10", None)["conversation_billing"]
    assert billing["from_session_analysis"] > 0
    assert billing["priced_count"] + billing["missing_count"] == billing["conversation_count"]
    monkeypatch.setenv("SESSION_ANALYSIS_MAX_PER_RUN", "0")
    reset_settings()
````

## File: zaya-usage-web-main/backend/tests/test_sync_api.py
````python
from decimal import Decimal

from sqlalchemy import text

from app.models import Assistant, Call, Charge, Reconciliation, User, UserAssistant
from app.services.metrics import dashboard
from app.services.seed import seed_demo
from app.services.sync import sync_window
from app.services.windows import month_window
from app.telnyx.client import FixtureTelnyx
from app.telnyx.fixtures import AGP_ASSISTANT, HFAAC_ASSISTANT, HFAAC_TEST_ASSISTANT, MONTHS, SCHAUMBURG_ASSISTANT
from app.telnyx.parse import detail_identity


class _BulkOnly(FixtureTelnyx):


    def list_conversations(self, start, end, assistant_id):
        raise AssertionError("backfill listed conversations")

    def get_session(self, record_type, event_id, when):
        raise AssertionError("backfill called session analysis")


def _sync(db, month="2026-10"):
    seed_demo(db)
    start, end = month_window(month)
    run = sync_window(db, _BulkOnly(page_size=7), start, end)
    assert run.status == "succeeded", run.error
    return run


def _logical(month: str) -> dict[tuple[str, str], dict]:
    found = {}
    for call in MONTHS[month]["calls"]:
        for component in call["components"]:
            found[(component["service"], component["id"])] = component
    return found


def test_dedupe_pending_and_zero_are_distinct(db):
    run = _sync(db)
    logical = _logical("2026-10")
    window = month_window("2026-10")
    stored = db.query(Charge).filter(Charge.occurred_at >= window[0], Charge.occurred_at < window[1]).all()
    detail = [row for row in stored if row.source_name != "usage_report"]
    usage_rows = [row for row in stored if row.source_name == "usage_report"]



    by_key = {(row.service, row.telnyx_record_id): row for row in detail}
    listed = set()
    for rows in MONTHS["2026-10"]["detail_records"].values():
        for record in rows:
            if record.get("record_type") == "text-to-speech" and "cost" not in record:
                continue
            service, rid, _source = detail_identity(record)
            if service and rid:
                listed.add((service, rid))
    assert set(by_key) == listed
    missing = [key for key in logical if key not in by_key]
    assert missing
    assert all(logical[key]["service"] == "inference" for key in missing)
    assert usage_rows
    assert all(row.call_id is None and len(row.telnyx_record_id) <= 160 for row in usage_rows)
    assert all(row.allocation_method == "exact" for row in usage_rows)
    assert run.stats["rollup_mismatches"] == 0

    for key, component in logical.items():
        if key not in by_key:
            continue
        row = by_key[key]
        if component["amount"] is None:
            assert row.amount is None
            assert row.cost_status == "pending"
        else:
            assert row.amount == component["amount"]
            assert row.cost_status == "recorded"

    calls = db.query(Call).filter(Call.started_at >= window[0], Call.started_at < window[1]).all()
    assert len(calls) == len(MONTHS["2026-10"]["calls"])
    by_call = {call.id: call for call in calls}
    cc_ids = {row.telnyx_record_id for row in detail if row.service == "call-control"}
    sip_ids = {row.telnyx_record_id for row in detail if row.service == "sip-trunking"}
    amd_ids = {row.telnyx_record_id for row in detail if row.service == "amd"}
    assert cc_ids == sip_ids == amd_ids
    assert len(cc_ids) == len(calls)
    ai_rows = [row for row in detail if row.service == "ai-voice-assistant"]
    assert len(ai_rows) == len(calls)
    for row in ai_rows:
        assert row.call_id is not None
        assert row.telnyx_record_id == by_call[row.call_id].telnyx_conversation_id
    loose = [row for row in detail if row.call_id is None]
    assert len(loose) == 1
    assert loose[0].service == "inference"
    assert loose[0].amount == Decimal("0.000704")
    assert loose[0].currency is None
    assert not any(row.service in {"text-to-speech", "speech-to-text"} for row in detail)
    assert any(row.service == "recording" and row.amount > 0 and row.call_id for row in detail)
    assert any(row.service == "noise-suppression" and row.amount > 0 and row.call_id for row in detail)
    assert not any(row.service in {"recording", "noise-suppression"} for row in usage_rows)
    assert any(row.service == "text-to-speech" and row.amount == 0 for row in usage_rows)
    complete = []
    pending = []
    for call in calls:
        amounts = [charge.amount for charge in call.charges]
        if any(amount is None for amount in amounts):
            assert call.recorded_cost is None
            assert call.cost_status == "pending"
            pending.append(call)
        else:
            assert call.recorded_cost == sum(amounts, Decimal("0"))
            assert call.session_cost_total is None
            complete.append(call)
    assert pending
    assert complete
    assert any(call.duration_sec == 0 for call in complete)
    assert any(call.duration_sec is None for call in calls)
    summary = dashboard(db, "2026-10", None)
    recorded = sum((call.recorded_cost for call in complete), Decimal("0"))
    assert Decimal(summary["kpis"]["recorded_cost"]) == recorded.quantize(Decimal("0.0001"))
    average = recorded / Decimal(len(complete))
    assert Decimal(summary["kpis"]["average_cost_per_call"]) == average.quantize(Decimal("0.0001"))
    assert summary["kpis"]["pending_call_count"] == len(pending)
    assert summary["kpis"]["complete_call_count"] == len(complete)
    services = {row["service"]: row for row in summary["services"]}
    assert Decimal(services["recording"]["recorded_cost"]) > 0
    assert services["text-to-speech"]["recorded_cost"] == "0.0000"
    assert summary["numbers"]["monthly_cost"] is None
    assert "unavailable" in summary["numbers"]["note"].lower()
    assert any(charge.service == "recording" for call in calls for charge in call.charges)
    for call in calls:
        if call.cost_status == "recorded":
            assert call.recorded_cost == sum((c.amount for c in call.charges), Decimal("0"))

    raw = db.execute(text("SELECT COALESCE(masked_caller, '') || ' ' || COALESCE(telnyx_conversation_id, '') FROM calls")).scalars().all()
    blob = " ".join(raw)
    assert "+1312555" in blob
    assert "0901" in blob


def test_second_sync_does_not_double_charges_or_wipe_a_known_cost(db):
    _sync(db)
    first = db.query(Charge).count()
    pending = db.query(Charge).filter(Charge.amount.is_(None)).first()
    pending.amount = Decimal("1.2300")
    pending.cost_status = "recorded"
    db.commit()
    pending_id = pending.id
    _sync(db)
    assert db.query(Charge).count() == first
    kept = db.get(Charge, pending_id)
    assert kept.amount == Decimal("1.2300")
    assert kept.cost_status == "recorded"


def test_reconciliation_flags_discrepancy_and_incomplete(db):
    _sync(db)
    rows = {row.product: row for row in db.query(Reconciliation).all()}
    assert rows["sip-trunking"].status == "discrepancy"
    assert rows["sip-trunking"].delta == Decimal("0.0400")
    assert rows["call-control"].status == "match"
    assert rows["inference"].status == "incomplete"
    assert rows["inference"].pending_charge_count > 0
    assert rows["ai-voice-assistant"].status == "incomplete"
    assert rows["ai-voice-assistant"].telnyx_cost is not None
    assert rows["ai-voice-assistant"].local_priced_cost is not None
    assert rows["amd"].status == "match"

    assert rows["recording"].status == "discrepancy"
    assert rows["recording"].delta == Decimal("0.5000")
    assert rows["noise-suppression"].status == "match"
    for product in ("speech-to-text", "text-to-speech"):
        assert rows[product].status == "usage_report"
        assert rows[product].delta is None
        assert rows[product].telnyx_cost == rows[product].local_priced_cost
    assert rows["text-to-speech"].telnyx_cost == Decimal("0")
    assert rows["recording"].telnyx_cost > 0
    assert rows["speech-to-text"].telnyx_cost < Decimal("9")
    assert rows["noise-suppression"].telnyx_cost > 0


def test_client_isolation_ignores_requested_client(api, db):
    _sync(db, "2026-10")
    _sync(db, "2026-09")
    hfaac = api.post("/api/auth/login", json={"email": "hfaac@zayahealth.example", "password": "local-clinic-pass"})
    assert hfaac.status_code == 200
    csrf = hfaac.json()["csrf_token"]
    own = api.get("/api/metrics", params={"month": "2026-10"})
    assert own.status_code == 200
    body = own.json()
    assert body["kpis"]["pending_call_count"] > 0
    assert body["kpis"]["recorded_cost"] is not None
    assert Decimal(body["kpis"]["recorded_cost"]) > 0
    filters = api.get("/api/filters").json()
    assert body["kpis"]["call_count"] == 16
    assert "clients" not in filters and "clinics" not in filters
    assert {row["telnyx_assistant_id"] for row in filters["assistants"]} == {HFAAC_ASSISTANT}
    assert "unavailable" in body["numbers"]["note"].lower()
    hfaac_recording = next(row["recorded_cost"] for row in body["services"] if row["service"] == "recording")
    assert Decimal(hfaac_recording) > 0


    other = api.get("/api/metrics", params={"month": "2026-10", "client_id": "00000000-0000-0000-0000-000000000099"})
    assert other.status_code == 200
    assert other.json()["kpis"]["call_count"] == body["kpis"]["call_count"]

    denied = api.post("/api/admin/sync", json={"month": "2026-10"}, headers={"X-CSRF-Token": csrf})
    assert denied.status_code == 403

    api.post("/api/auth/logout", headers={"X-CSRF-Token": csrf})
    admin = api.post("/api/auth/login", json={"email": "admin@zayahealth.example", "password": "local-admin-pass"})
    admin_csrf = admin.json()["csrf_token"]
    missing = api.post("/api/admin/sync", json={"month": "2026-10"})
    assert missing.status_code == 403
    allowed = api.post("/api/admin/sync", json={"month": "2026-10"}, headers={"X-CSRF-Token": admin_csrf})
    assert allowed.status_code == 200
    recon = api.get("/api/reconciliation", params={"month": "2026-10"})
    assert recon.status_code == 200
    assert any(row["status"] == "discrepancy" for row in recon.json()["rows"])
    assert any(row["status"] == "usage_report" and row["product"] == "speech-to-text" for row in recon.json()["rows"])
    admin_metrics = api.get("/api/metrics", params={"month": "2026-10"}).json()
    admin_recording = next(row["recorded_cost"] for row in admin_metrics["services"] if row["service"] == "recording")
    assert Decimal(admin_recording) > Decimal(hfaac_recording)

    exported = api.get("/api/export/csv", params={"month": "2026-10"})
    assert exported.status_code == 200
    assert "recorded_cost" in exported.text
    pdf = api.get("/api/export/pdf", params={"month": "2026-10"})
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")


def test_assistant_login_cannot_read_another_assistant(api, db):
    _sync(db, "2026-10")
    hfaac = db.query(Assistant).filter(Assistant.telnyx_assistant_id == HFAAC_ASSISTANT).one()
    schaumburg = db.query(Assistant).filter(Assistant.telnyx_assistant_id == SCHAUMBURG_ASSISTANT).one()
    agp = db.query(Assistant).filter(Assistant.telnyx_assistant_id == AGP_ASSISTANT).one()
    hidden = db.query(Assistant).filter(Assistant.telnyx_assistant_id == HFAAC_TEST_ASSISTANT).one()
    assert hidden.client_visible is False

    login = api.post(
        "/api/auth/login",
        json={"email": "hfaac@zayahealth.example", "password": "local-clinic-pass"},
    )
    assert login.status_code == 200
    own = api.get("/api/metrics", params={"month": "2026-10"})
    assert own.status_code == 200
    own_count = own.json()["kpis"]["call_count"]
    assert own_count == 16
    filters = api.get("/api/filters").json()
    assert {row["telnyx_assistant_id"] for row in filters["assistants"]} == {HFAAC_ASSISTANT}
    assert set(filters) >= {"assistants", "months"} and "clinics" not in filters
    assert all("test" not in row["name"].lower() for row in filters["assistants"])

    tampered = {
        "month": "2026-10",
        "assistant_id": str(schaumburg.id),
        "clinic_id": str(schaumburg.clinic_id),
        "client_id": str(agp.client_id),
    }
    metrics = api.get("/api/metrics", params=tampered)
    assert metrics.json()["kpis"]["call_count"] == own_count
    calls = api.get("/api/calls", params={**tampered, "limit": 50})
    assert calls.json()["total"] == own_count
    assert calls.json()["calls"]
    assert {row["assistant_name"] for row in calls.json()["calls"]} == {"Houston Foot and Ankle Care"}
    assert all(not (row["masked_caller"] or "").endswith("0921") for row in calls.json()["calls"])
    assert all(not (row["masked_caller"] or "").endswith("0951") for row in calls.json()["calls"])
    later = api.get("/api/calls", params={"month": "2026-10", "assistant_id": str(agp.id), "limit": 5, "offset": 8})
    assert later.json()["total"] == own_count
    assert {row["assistant_name"] for row in later.json()["calls"]} == {"Houston Foot and Ankle Care"}
    exported = api.get("/api/export/csv", params=tampered)
    assert "Houston Foot and Ankle Care" in exported.text
    assert "Schaumburg" not in exported.text
    assert "AGP Family Health Clinic" not in exported.text
    assert "(test)" not in exported.text
    assert "0921" not in exported.text
    pdf = api.get("/api/export/pdf", params={"month": "2026-10", "assistant_id": str(schaumburg.id), "clinic_id": str(agp.clinic_id)})
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")

    user = db.query(User).filter(User.email == "hfaac@zayahealth.example").one()
    db.add(UserAssistant(user_id=user.id, assistant_id=hidden.id))
    db.commit()
    still = api.get("/api/metrics", params={"month": "2026-10"}).json()
    assert still["kpis"]["call_count"] == own_count
    assert HFAAC_TEST_ASSISTANT not in {row["telnyx_assistant_id"] for row in api.get("/api/filters").json()["assistants"]}

    db.add(UserAssistant(user_id=user.id, assistant_id=schaumburg.id))
    db.commit()
    both = api.get("/api/metrics", params={"month": "2026-10"}).json()
    assert both["kpis"]["call_count"] == own_count + 6
    narrowed = api.get("/api/metrics", params={"month": "2026-10", "assistant_id": str(hfaac.id)}).json()
    assert narrowed["kpis"]["call_count"] == own_count
    stolen = api.get(
        "/api/metrics",
        params={"month": "2026-10", "assistant_id": str(agp.id), "clinic_id": str(agp.clinic_id), "client_id": str(agp.client_id)},
    ).json()
    assert stolen["kpis"]["call_count"] == both["kpis"]["call_count"]
    stolen_calls = api.get("/api/calls", params={"month": "2026-10", "assistant_id": str(agp.id), "limit": 100}).json()
    names = {row["assistant_name"] for row in stolen_calls["calls"]}
    assert names == {"Houston Foot and Ankle Care", "Schaumburg Reception"}
    stolen_csv = api.get("/api/export/csv", params={"month": "2026-10", "assistant_id": str(agp.id)})
    assert "AGP Family Health Clinic" not in stolen_csv.text
    assert "Schaumburg Reception" in stolen_csv.text
    assert "(test)" not in stolen_csv.text


def test_job_endpoint_requires_bearer_and_is_idempotent(api, db):
    seed_demo(db)
    denied = api.post("/internal/jobs/sync", json={"month": "2026-09"})
    assert denied.status_code == 401
    allowed = api.post(
        "/internal/jobs/sync",
        json={"month": "2026-09"},
        headers={"Authorization": "Bearer test-job-token"},
    )
    assert allowed.status_code == 200
    assert allowed.json()["runs"][0]["status"] == "succeeded"
    again = api.post(
        "/internal/jobs/sync",
        json={"month": "2026-09"},
        headers={"Authorization": "Bearer test-job-token"},
    )
    assert again.status_code == 200
    september = [call for call in db.query(Call).all() if call.started_at.month == 9]
    assert september
    assert all(call.cost_status == "recorded" and call.recorded_cost is not None for call in september)


def test_assistant_filter_never_counts_another_assistants_conversations(db):

    _sync(db)
    start, end = month_window("2026-10")
    for assistant in db.query(Assistant).all():
        body = dashboard(db, "2026-10", assistant.id)
        own = db.query(Call).filter(Call.assistant_id == assistant.id, Call.started_at >= start, Call.started_at < end).all()
        assert body["kpis"]["call_count"] == len(own)
        own_ids = {call.id for call in own}
        recorded = [call.recorded_cost for call in own if call.cost_status == "recorded" and call.recorded_cost is not None]
        expected = f"{sum(recorded, Decimal('0')).quantize(Decimal('0.0001')):.4f}" if recorded else None
        assert body["kpis"]["recorded_cost"] == expected
        assert body["conversation_billing"]["conversation_count"] == len(own)

        for charge in db.query(Charge).filter(Charge.call_id.isnot(None)).all():
            call = db.get(Call, charge.call_id)
            if charge.call_id in own_ids:
                assert call.assistant_id == assistant.id


def test_shared_session_id_attaches_to_no_call(db):
    from app.services.sync import _unique_index

    class _C:
        def __init__(self, id, sid):
            self.id, self.telnyx_call_session_id = id, sid

    index = _unique_index([_C(1, "s1"), _C(2, "s1"), _C(3, "s2")], "telnyx_call_session_id")
    assert "s1" not in index and index["s2"].id == 3


def test_recording_and_noise_are_counted_once_per_conversation(db):
    _sync(db)
    from app.services.metrics import conversation_cost

    calls = db.query(Call).filter(Call.charges.any(Charge.service == "noise-suppression")).all()
    assert calls
    for call in calls:
        row = conversation_cost(call)
        noise = [c.amount for c in call.charges if c.service == "noise-suppression"]
        assert len(noise) == 2
        assert Decimal(row["products"]["noise-suppression"]["cost"]) == sum(noise, Decimal("0"))
        if row["total"] is not None and not row["partial"]:
            if row["source"] == "session_analysis":
                extras = sum(
                    (c.amount for c in call.charges if c.service not in (call.session_breakdown or {}).get("products", {})),
                    Decimal("0"),
                )
                assert Decimal(row["total"]) == Decimal(row["session_total"]) + extras
            else:
                assert Decimal(row["total"]) == sum((c.amount for c in call.charges), Decimal("0"))


def test_detail_in_session_is_shown_not_added_twice():
    from types import SimpleNamespace
    from app.services.metrics import conversation_cost

    charge = SimpleNamespace(service="recording", amount=Decimal("0.002"), billed_duration_sec=None)
    call = SimpleNamespace(
        session_status="ok",
        session_breakdown={"total": "0.100000", "products": {"recording": {"cost": "0.002000", "count": 1}}},
        charges=[charge],
        currency="USD",
    )
    row = conversation_cost(call)
    assert row["total"] == "0.100000"
    assert row["products"]["recording"]["included_in_session_total"] is True
    assert row["products"]["recording"]["cost"] == "0.002000"
````

## File: zaya-usage-web-main/backend/.dockerignore
````
__pycache__
.pytest_cache
.venv
*.pyc
tests
````

## File: zaya-usage-web-main/backend/alembic.ini
````ini
[alembic]
script_location = alembic
prepend_sys_path = .
path_separator = os
sqlalchemy.url = postgresql+psycopg://zaya:zaya@127.0.0.1:5432/zaya_usage

[loggers]
keys = root
level = WARN

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
handlers = console
level = WARN

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
````

## File: zaya-usage-web-main/backend/Dockerfile
````dockerfile
FROM python:3.12-slim

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY alembic ./alembic
COPY app ./app
COPY run-api.sh run-sync.sh ./
RUN chmod +x run-api.sh run-sync.sh

ENV PORT=8080
EXPOSE 8080
CMD ["./run-api.sh"]
````

## File: zaya-usage-web-main/backend/pytest.ini
````ini
[pytest]
testpaths = tests
pythonpath = .
addopts = -q
````

## File: zaya-usage-web-main/backend/requirements.txt
````
fastapi==0.161.1
uvicorn[standard]==0.54.0
sqlalchemy==2.1.6
alembic==1.20.1
psycopg[binary]==3.3.6
pydantic-settings==2.16.1
email-validator==2.3.0
argon2-cffi==25.1.0
httpx==0.28.1
reportlab==5.1.0
pytest==9.1.1
````

## File: zaya-usage-web-main/backend/run-api.sh
````bash
set -eu
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8080}"
````

## File: zaya-usage-web-main/backend/run-sync.sh
````bash
set -eu
alembic upgrade head
exec python -m app.jobs.sync "$@"
````

## File: zaya-usage-web-main/docs/deploy.md
````markdown
# Deploy from a local checkout

This is the Cloud Build and `gcloud` path. It does not use GitHub Actions. The project is `zaya-prod-app`, region `us-central1`.

Images land in `us-central1-docker.pkg.dev/zaya-prod-app/zaya-agents`. Services are `zaya-usage-api` and `zaya-usage-web`. The sync job is `zaya-usage-sync`, scheduled as `zaya-usage-sync-daily` at 06:15 UTC.

`SEED_DEMO=false` is set on the API and the job. Startup then creates no clinics, no users, and no fixture calls. After the first deploy you run the production seed and the user command yourself.

## 1. Get the code

Clone:

```bash
git clone https://origin.cursor.com/git/zayahealth/tmp-a41cca55dff8ae40.git zaya-usage
cd zaya-usage
```

Tarball of that checkout:

```bash
git archive --format=tar.gz --prefix=zaya-usage/ -o ../zaya-usage.tar.gz HEAD
```

The remote is private. Use your own credential. Do not put an access token in the URL or in this file.

## 2. Variables

```bash
export PROJECT=zaya-prod-app
export REGION=us-central1
export INSTANCE=zaya-usage-db
export AR=us-central1-docker.pkg.dev/zaya-prod-app/zaya-agents
export RUNTIME=zaya-usage-runtime@${PROJECT}.iam.gserviceaccount.com
export SQL_CONNECTION="${PROJECT}:${REGION}:${INSTANCE}"

gcloud config set project "$PROJECT"
gcloud config set run/region "$REGION"
```

`TELNYX_MODE` below is `live`. Use `fixture` for a first boot that should not call Telnyx.

## 3. Enable APIs

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  iam.googleapis.com \
  --project "$PROJECT"
```

## 4. Artifact Registry

```bash
gcloud artifacts repositories describe zaya-agents --location "$REGION" --project "$PROJECT" >/dev/null 2>&1 \
  || gcloud artifacts repositories create zaya-agents \
       --project "$PROJECT" \
       --location "$REGION" \
       --repository-format docker
```

Let Cloud Build push images:

```bash
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

## 5. Cloud SQL

PostgreSQL 16. Cloud Run connects through the instance socket, so the instance does not need your laptop's IP authorized.

```bash
gcloud sql instances describe "$INSTANCE" --project "$PROJECT" >/dev/null 2>&1 \
  || gcloud sql instances create "$INSTANCE" \
       --project "$PROJECT" \
       --database-version POSTGRES_16 \
       --region "$REGION" \
       --tier db-custom-1-3840 \
       --storage-size 10 \
       --storage-auto-increase \
       --availability-type zonal \
       --backup-start-time 07:00

gcloud sql databases describe zaya_usage --instance "$INSTANCE" --project "$PROJECT" >/dev/null 2>&1 \
  || gcloud sql databases create zaya_usage --instance "$INSTANCE" --project "$PROJECT"

DB_PASSWORD="$(openssl rand -base64 24)"
gcloud sql users create zaya \
  --instance "$INSTANCE" \
  --project "$PROJECT" \
  --password "$DB_PASSWORD"
```

If the user `zaya` already exists, set a password instead:

```bash
gcloud sql users set-password zaya \
  --instance "$INSTANCE" \
  --project "$PROJECT" \
  --password "$DB_PASSWORD"
```

Build the URL the API expects. Quote the password so `@`, `:`, or `/` cannot break it.

```bash
ENC_PASSWORD="$(python3 -c 'import os, urllib.parse; print(urllib.parse.quote(os.environ["DB_PASSWORD"], safe=""))')"
DATABASE_URL="postgresql+psycopg://zaya:${ENC_PASSWORD}@/zaya_usage?host=/cloudsql/${SQL_CONNECTION}"
```

## 6. Secrets

You will be prompted. Nothing below is a real password.

```bash
read -r -s SESSION_SECRET && echo
read -r -s SYNC_JOB_TOKEN && echo
read -r -s TELNYX_API_KEY && echo

create_secret() {
  name="$1"
  value="$2"
  if gcloud secrets describe "$name" --project "$PROJECT" >/dev/null 2>&1; then
    printf '%s' "$value" | gcloud secrets versions add "$name" --project "$PROJECT" --data-file=-
  else
    printf '%s' "$value" | gcloud secrets create "$name" --project "$PROJECT" --replication-policy automatic --data-file=-
  fi
}

create_secret zaya-database-url "$DATABASE_URL"
create_secret zaya-session-secret "$SESSION_SECRET"
create_secret zaya-sync-job-token "$SYNC_JOB_TOKEN"
create_secret zaya-telnyx-api-key "$TELNYX_API_KEY"
```

## 7. Runtime service account

The runtime account connects to Cloud SQL, reads the four secrets, and is the identity Cloud Scheduler uses to execute `zaya-usage-sync`. It does not build images and it does not administer Cloud Run.

`roles/cloudsql.client` is the narrowest predefined role that can open the instance socket. Secret access is granted per secret, not on the project. The scheduler gets `roles/run.invoker` on that one job later, which includes `run.jobs.run` and does not include update or delete.

```bash
gcloud iam service-accounts describe "$RUNTIME" --project "$PROJECT" >/dev/null 2>&1 \
  || gcloud iam service-accounts create zaya-usage-runtime \
       --project "$PROJECT" \
       --display-name "Zaya usage runtime"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${RUNTIME}" \
  --role="roles/cloudsql.client"

for name in zaya-database-url zaya-session-secret zaya-sync-job-token zaya-telnyx-api-key; do
  gcloud secrets add-iam-policy-binding "$name" \
    --project "$PROJECT" \
    --member="serviceAccount:${RUNTIME}" \
    --role="roles/secretmanager.secretAccessor"
done
```

Do not grant this account `roles/run.developer`, `roles/run.admin`, `roles/editor`, or `roles/artifactregistry.writer`. Image push stays on the Cloud Build service account from step 4.

Your user account needs to deploy as that service account (`roles/iam.serviceAccountUser` on it) and to deploy Cloud Run.

## 8. Build with Cloud Build

From the repo root, after `git clone`:

```bash
SHA="$(git rev-parse --short HEAD)"
gcloud builds submit ./backend --project "$PROJECT" --tag "${AR}/usage-api:${SHA}"
gcloud builds submit ./frontend --project "$PROJECT" --tag "${AR}/usage-web:${SHA}"
```

## 9. Cloud Run services

The API listens on the `PORT` Cloud Run sets (the image defaults to 8080). `SEED_DEMO=false` is required.

`FRONTEND_ORIGINS` is both Cloud Run web URLs, comma-separated. The `@` delimiter is there because `gcloud` otherwise splits env values on commas. `TELNYX_MIN_INTERVAL_SECONDS=1` and `TELNYX_MAX_CONCURRENT=1` keep backfill from starving the voice gateway, which uses the same API key.

```bash
gcloud run deploy zaya-usage-api \
  --project "$PROJECT" \
  --region "$REGION" \
  --image "${AR}/usage-api:${SHA}" \
  --service-account "$RUNTIME" \
  --add-cloudsql-instances "$SQL_CONNECTION" \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets "DATABASE_URL=zaya-database-url:latest,SESSION_SECRET=zaya-session-secret:latest,SYNC_JOB_TOKEN=zaya-sync-job-token:latest,TELNYX_API_KEY=zaya-telnyx-api-key:latest" \
  --set-env-vars "^@^TELNYX_MODE=live@SEED_DEMO=false@COOKIE_SECURE=true@TELNYX_MIN_INTERVAL_SECONDS=1@TELNYX_MAX_CONCURRENT=1@FRONTEND_ORIGINS=https://zaya-usage-web-699087212463.us-central1.run.app,https://zaya-usage-web-zjj2qolkja-uc.a.run.app@FRONTEND_ORIGIN=https://zaya-usage-web-zjj2qolkja-uc.a.run.app"

API_URL="$(gcloud run services describe zaya-usage-api --project "$PROJECT" --region "$REGION" --format='value(status.url)')"

gcloud run deploy zaya-usage-web \
  --project "$PROJECT" \
  --region "$REGION" \
  --image "${AR}/usage-web:${SHA}" \
  --service-account "$RUNTIME" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "API_URL=${API_URL}"

WEB_URL="$(gcloud run services describe zaya-usage-web --project "$PROJECT" --region "$REGION" --format='value(status.url)')"

case ",${FRONTEND_ORIGINS:-https://zaya-usage-web-699087212463.us-central1.run.app,https://zaya-usage-web-zjj2qolkja-uc.a.run.app}," in
  *",${WEB_URL},"*) ORIGINS="${FRONTEND_ORIGINS:-https://zaya-usage-web-699087212463.us-central1.run.app,https://zaya-usage-web-zjj2qolkja-uc.a.run.app}" ;;
  *) ORIGINS="${FRONTEND_ORIGINS:-https://zaya-usage-web-699087212463.us-central1.run.app,https://zaya-usage-web-zjj2qolkja-uc.a.run.app},${WEB_URL}" ;;
esac

gcloud run services update zaya-usage-api \
  --project "$PROJECT" \
  --region "$REGION" \
  --update-env-vars "^@^FRONTEND_ORIGINS=${ORIGINS}@FRONTEND_ORIGIN=${WEB_URL}"
```

The API container runs `alembic upgrade head` before it serves. Wait until the revision is healthy:

```bash
curl -fsS "${API_URL}/health"
```

Expect `{"ok":true,"telnyx_mode":"live"}`.

## 10. Production clinics and users

Do this from the checkout, through the Cloud SQL Auth Proxy, so passwords stay on your machine. Port 5433 avoids a local Postgres already bound to 5432.

```bash
cloud-sql-proxy "${SQL_CONNECTION}" --port 5433
```

In another shell, with `ENC_PASSWORD` from step 5 still exported, from `backend/` and a virtualenv that has `pip install -r requirements.txt`:

```bash
export DATABASE_URL="postgresql+psycopg://zaya:${ENC_PASSWORD}@127.0.0.1:5433/zaya_usage"
python -m app.jobs.seed_production
python -m app.jobs.users
```

`seed_production` inserts HFAAC, AGP, MMC, and Schaumburg, their assistants, billing groups, and the four phone-number ids. Each number gets $1.00 per month, full month, effective 2026-01-01, note `Telnyx list price (unconfirmed)`. It does not create users. Running it again does not overwrite a fee an admin has edited.

`users` prompts for email, role, client slug, and password. A client user is assigned that client's visible assistants. To skip the prompt, set `ZAYA_USERS_JSON` to a JSON list and do not commit that value:

```json
[
  {"email": "you@example.com", "password": "at least 10 characters", "role": "admin"},
  {"email": "hfaac-user@example.com", "password": "at least 10 characters", "role": "client_user", "client_slug": "hfaac"}
]
```

Client slugs are `hfaac`, `agp`, `mmc`, and `schaumburg`. An existing email is left unchanged, including its password.

## 11. Sync job and scheduler

```bash
gcloud run jobs deploy zaya-usage-sync \
  --project "$PROJECT" \
  --region "$REGION" \
  --image "${AR}/usage-api:${SHA}" \
  --service-account "$RUNTIME" \
  --set-cloudsql-instances "$SQL_CONNECTION" \
  --set-secrets "DATABASE_URL=zaya-database-url:latest,SESSION_SECRET=zaya-session-secret:latest,SYNC_JOB_TOKEN=zaya-sync-job-token:latest,TELNYX_API_KEY=zaya-telnyx-api-key:latest" \
  --set-env-vars "TELNYX_MODE=live,SEED_DEMO=false,TELNYX_MIN_INTERVAL_SECONDS=1,TELNYX_MAX_CONCURRENT=1" \
  --command /app/run-sync.sh \
  --tasks 1 \
  --max-retries 3 \
  --task-timeout 30m

gcloud run jobs add-iam-policy-binding zaya-usage-sync \
  --project "$PROJECT" \
  --region "$REGION" \
  --member="serviceAccount:${RUNTIME}" \
  --role="roles/run.invoker"

gcloud run jobs remove-iam-policy-binding zaya-usage-sync \
  --project "$PROJECT" \
  --region "$REGION" \
  --member="serviceAccount:${RUNTIME}" \
  --role="roles/run.developer" \
  >/dev/null 2>&1 || true

URI="https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT}/jobs/zaya-usage-sync:run"

if gcloud scheduler jobs describe zaya-usage-sync-daily --location "$REGION" --project "$PROJECT" >/dev/null 2>&1; then
  gcloud scheduler jobs update http zaya-usage-sync-daily \
    --project "$PROJECT" \
    --location "$REGION" \
    --schedule "15 6 * * *" \
    --time-zone "UTC" \
    --uri "$URI" \
    --http-method POST \
    --oauth-service-account-email "$RUNTIME"
else
  gcloud scheduler jobs create http zaya-usage-sync-daily \
    --project "$PROJECT" \
    --location "$REGION" \
    --schedule "15 6 * * *" \
    --time-zone "UTC" \
    --uri "$URI" \
    --http-method POST \
    --oauth-service-account-email "$RUNTIME"
fi
```

Run one sync now:

```bash
gcloud run jobs execute zaya-usage-sync --project "$PROJECT" --region "$REGION" --wait
```

The job reads the previous and current UTC months. With `SEED_DEMO=false` it does not load fixture clinics. It requests detail-record pages and usage reports, not one Telnyx call per conversation. A 429 pauses that month after the retries. Cloud Run's task retry continues from the last finished page or day, and the run stays `paused` rather than `failed`.

## 12. Check

Open `$WEB_URL`, sign in with the admin you just created, and confirm the four clinics. Each phone fee on the mapping page should read $1.00, full month, from 2026-01-01, with the label `Telnyx list price (unconfirmed)`. Edit it there if the list price changes. A number you add later with no fee shows as missing config, not $0.00.
````

## File: zaya-usage-web-main/docs/telnyx-integration.md
````markdown
# Telnyx integration notes for Zaya usage and cost

Research date: 2026-10-23. Published Telnyx docs were read first. A read-only inspection of the live Zaya Telnyx account on the same date confirmed the field names, filters, ids, and pagination the sync uses. Section 9 is that inspection and overrides any earlier "unknown" it answers. The dashboard does not invent a cost from a rate and a duration, and it does not treat a missing cost as zero.

Sources read for this note:

- Usage Reports guide: https://developers.telnyx.com/docs/reporting/usage-reports
- Usage Reports API: `GET /v2/usage_reports`, `GET /v2/usage_reports/options`
- Detail Records API: https://developers.telnyx.com/api-reference/detail-records/search-detail-records
- WebRTC CDR example: https://developers.telnyx.com/docs/voice/webrtc/troubleshooting/detail-records
- Session Analysis guide: https://developers.telnyx.com/docs/reporting/session-analysis
- Session Analysis API: `GET /v2/session_analysis/{record_type}/{event_id}`
- AI conversations: https://developers.telnyx.com/api-reference/conversations/list-conversations and https://developers.telnyx.com/docs/inference/ai-assistants/conversation-keying
- `call.cost` webhook: https://developers.telnyx.com/api-reference/callbacks/call-cost
- `call.analyzed` webhook schema in the consolidated OpenAPI spec (event name is not a list endpoint)
- Legacy voice CDR fields: `GET /v2/legacy/reporting/batch_detail_records/voice/fields`
- Balance: `GET /v2/balance`
- Invoices: `GET /v2/invoices`
- Phone numbers: `GET /v2/phone_numbers`, `GET /v2/available_phone_numbers`
- Rate limiting: https://developers.telnyx.com/docs/development/api-fundamentals/reliability/rate-limiting
- Consolidated OpenAPI 3.1 retrieved 2026-10-23 from https://raw.githubusercontent.com/team-telnyx/openapi/master/openapi/spec3.json

Base URL is `https://api.telnyx.com/v2`. Auth is `Authorization: Bearer <API_KEY>`. The key stays on the server.

## What to use for this dashboard

Zaya's receptionists are Telnyx AI Assistants on phone calls. One inbound or outbound phone call creates one `phone_call` conversation. That conversation is the call. Costs are separate rows (assistant minutes, inference turns, call control, SIP, STT, TTS, recording) and must not be added on top of a session rollup.

| Question | Source | Why |
| --- | --- | --- |
| Which calls happened, for which assistant | `ai-voice-assistant` detail records | One row per call. `conversation_id` is the call id and `assistant_id` joins the clinic. Backfill does not list conversations. |
| Per-component billed cost | Detail records, paged by `record_type` | Each product has its own row. Unique on Telnyx record id. Backfill does not walk a session tree per call. |
| Session rollup | Session Analysis `cost.total` | Same dollars as the sum of `event_cost`. Not requested during backfill, and not stored as a charge. |
| Account totals to reconcile | `GET /v2/usage_reports` per product, by month or by day | Telnyx's own aggregate `cost` for a window. Account-wide, not per assistant. |
| Call count and duration | Assistant detail records, plus `call_sec` on the call-control detail record | Do not sum durations across SIP and call-control legs. |
| Number monthly fees | Admin configuration | Telnyx still returns no fee. An admin sets a fixed monthly amount, effective date, and full-month or prorated billing. A number with no fee is missing config, not zero. |

## 1. AI assistant conversations (the call list)

`GET /v2/ai/conversations`

Verified query parameters (PostgREST style):

| Parameter | Example | Use |
| --- | --- | --- |
| `metadata->assistant_id` | `eq.assistant-123` | Restrict to a mapped assistant. |
| `metadata->telnyx_conversation_channel` | `eq.phone_call` | One conversation per phone call. |
| `created_at` | `gte.2026-10-01` and a second `created_at=lt.2026-11-01` | Half-open month window. Whether two `created_at` params are accepted together is **unknown**; `or=(...)` is documented. The inspect script checks this. |
| `metadata->call_control_id` | `eq.v3:...` | Join to call control. |
| `page[number]`, `page[size]` | `page[size]` max 100 | Live paging. Ignore `meta.total_results` (it is wrong). Stop on an empty page. |
| `order` | `created_at.asc` | Stable paging if a cursor exists. |

Verified response fields on each conversation:

| Field | Meaning | Dashboard |
| --- | --- | --- |
| `id` | UUID. Conversation id. | Call primary key. Unique constraint. |
| `created_at` | ISO 8601. | Call start for filtering. Not billed duration. |
| `last_message_at` | ISO 8601. | Not a duration. |
| `metadata.assistant_id` | Assistant that handled it. | Clinic mapping. |
| `metadata.telnyx_conversation_channel` | `phone_call`, `sms_chat`, `whatsapp_chat`, `web_chat`, `websocket_call`, `web_call`. | Only `phone_call` counts as a receptionist call. |
| `metadata.telnyx_agent_target` | Assistant number or SIP URI. | Mask before storage. |
| `metadata.telnyx_end_user_target` | Caller number or other end-user target. | **PII.** Mask, never store raw, never display raw. |
| `metadata.call_control_id` | Present on `phone_call`. | Join key. Not a cost. |
| `metadata.call_session_id` | Present on `phone_call`. | Join to `call-session` / detail records (`telnyx_session_id`). |
| `metadata.call_leg_id` | Present on `phone_call`. | Join key. |
| `metadata.assistant_version_id` | Version, when tracked. | Optional label. |
| `name` | Free text. | Do not display. May be operator-supplied. |

There is **no cost, currency, billed duration, or finalization field** on the conversation object.

Do not call `GET /v2/ai/conversations/{id}/messages`. That payload is the transcript (`role`, `text`, tool calls). The sync never requests it.

`GET /v2/ai/assistants` returns assistant `id` and `name`. Every sync calls it once first (`app/services/assistants.py`) to add new assistants and refresh names; the dashboard's only filter is that assistant (name and Telnyx id). If the call fails, the confirmed list in `app/production.py` (`ASSISTANTS`) is used and the sync continues. `instructions`, tools, and greeting are configuration and can contain operational detail. The sync keeps `id` and `name` only.

### Pagination and latency (conversations)

- **Live:** page with `page[number]` and `page[size]` (max 100). `meta.total_results` is wrong on this account: it reports `page * size + 1`. Stop when a page is empty. Do not trust `total_pages` here. The list is truncated only if that page cap is hit on a full page.
- Caller identity is `metadata.telnyx_end_user_target` when present, otherwise `metadata.from`. Both are masked. `metadata.to` is the clinic number and is not stored.
- **Unknown:** how soon after hangup a conversation row exists. The conversation-keying doc says the platform creates a `phone_call` conversation at call setup, so the row can exist before billing exists.

## 2. Detail records (CDRs and per-service charges)

`GET /v2/detail_records`

`filter[record_type]` is required. Published enum:

`ai-voice-assistant`, `amd`, `call-control`, `conference`, `conference-participant`, `embedding`, `fax`, `inference`, `inference-speech-to-text`, `media_storage`, `media-streaming`, `messaging`, `noise-suppression`, `recording`, `sip-trunking`, `siprec-client`, `stt`, `tts`, `verify`, `webrtc`, `wireless`

Call-control and sip-trunking records use `started_at`, `finished_at`, and `answered_at`. They have **no** `created_at`. Messaging uses `created_at`. Filtering or sorting on a field the record type does not have returns 400.

Date window: `filter[date_range]` literals (`today`, `yesterday`, `last_month`, `this_month`, `last_N_days`, …) or a field comparison. The published comparison examples use `filter[created_at][gte]` / `filter[created_at][lt]` and are messaging examples. For voice, the equivalent that matches the docs is `filter[started_at][gte]` and `filter[started_at][lt]`. **Unknown until the inspect script runs:** whether call-control accepts that comparison form.

Pagination (**verified**): `page[number]` default 1, minimum 1; `page[size]` default 20, minimum 1, **maximum 50**. `meta.total_pages`, `meta.total_results`, `meta.page_number`, `meta.page_size`.

Backfill requests `page[size]=50` and the date field that record type accepts (`started_at` for call-control, SIP, and WebRTC; `created_at` for assistant, inference, and TTS; `invoked_at` for AMD). It does not call `GET /v2/ai/conversations` or `GET /v2/session_analysis/...` . Those are one request per assistant or per call, and the API key is shared with the live voice gateway. Inference turns that appear only inside a session tree are not copied onto the call. The first inference detail record still is.

Each finished page is checkpointed on the sync run. A 429, after Retry-After or `X-RateLimit-Reset` and exponential backoff with jitter, pauses the month. The next run continues at the next page. It does not mark the month failed and it does not repeat finished pages. The pace defaults to one in-flight request and about one request per second (`TELNYX_MIN_INTERVAL_SECONDS`, `TELNYX_MAX_CONCURRENT`).

The search description says `GET /v2/detail_records/options` lists fields for a record type. That path is **not** in the consolidated OpenAPI spec retrieved on 2026-10-23. Treat it as documented-but-unconfirmed and call it from the inspect script.

### Schemas that are actually published

The OpenAPI `DetailRecord` union only includes message, conference, conference participant, AMD, verify, SIM usage, and media storage. It does **not** include `call-control`, `sip-trunking`, `ai-voice-assistant`, `inference`, `stt`, `tts`, `recording`, or `webrtc`. Those bodies are `additionalProperties` in practice. Do not assume they share one id field.

### Fields verified on a voice-like detail record

WebRTC example (`record_type` in the response is `webrtc_detail_record`, while the filter value is `webrtc`):

| Field | Example | Dashboard use |
| --- | --- | --- |
| `id` | UUID | Charge id for this record type. |
| `cost` | string `"0.002"` | Billed amount. String, not a number. |
| `currency` | `"USD"` | ISO 4217. |
| `rate` | string `"0.002"` | Unit price. Do not multiply by duration to invent `cost`. |
| `call_sec` | integer `50` | Actual media duration, seconds. |
| `billed_sec` | integer `60` | Billed duration. Can exceed `call_sec` (50s call billed as 60s in the example). |
| `started_at`, `finished_at` | ISO 8601 | Timing. |
| `direction` | `outbound` | Label only. |
| `connection_id` | string | Map to a clinic connection. |
| `telnyx_session_id`, `telnyx_leg_id` | UUIDs | Join to the call session. |
| `cli`, `cld`, `caller_number`, `dest_number` | E.164 | **PII.** Do not store. |

No status, pending, or finalized flag appears in that example. `cost` is present and non-null. A zero container cost is a different case (see Session Analysis): the string `"0"` or `"0.000000"` is a real zero.

Message detail records use `uuid` (not `id`) plus string `cost`, `currency`, and `rate`. Messaging docs say `cost` on the *message resource* may be null until `message.finalized`. That nullability is **not** documented for voice or AI detail records. **Unknown** for call-control, AI assistant, inference, STT, and TTS.

Legacy voice CDR report fields (`GET /v2/legacy/reporting/batch_detail_records/voice/fields`), billing group only:

- `billable_time`
- `cost`
- `rate`
- `billing_group_id`

Interaction fields include `direction`, `start_timestamp_utc`, `answer_timestamp`, `end_timestamp`, and phone numbers (do not store numbers). This is a report-column list, not the detail-record JSON schema. `billable_time`'s unit is **unknown** (the list does not say seconds).

### Call-control, SIP, AI assistant, inference, STT, TTS detail records

The live field names are in section 9. Short version: every cost and id arrives as a string. Call-control `id` equals `telnyx_leg_id`. Sip-trunking uses that same leg id, so the two rows are separate charges on one call. AI assistant records have no `id`; the key is `conversation_id`. The string `None` is null. Inference cost can be scientific notation (`7.04E-4`).

| Surface | STT name | TTS name |
| --- | --- | --- |
| Detail record `record_type` on this account | no rows; `stt` is not requested | `text-to-speech` (no `cost` field) |
| Usage Reports product | `speech-to-text` | `text-to-speech` |

`ai-voice-assistant` is a detail-record type, a Session Analysis record type, and a usage-report product on this account. The published guide omits it from the product list. The sync uses the live options response, which includes it.

## 3. Session Analysis (per-call cost tree)

`GET /v2/session_analysis/{record_type}/{event_id}`

| Query | Default | Notes |
| --- | --- | --- |
| `include_children` | `true` | |
| `max_depth` | `2`, range 1–5 | AI trees need 4 or 5 to reach inference leaves. Depth 2 stops at the assistant node. |
| `expand` | `record` | `none` omits the detail body. |
| `date_time` | none | Narrows the index. A wrong value can 404. |

For a receptionist call with a carrier leg, root at `call-session` and pass `metadata.call_session_id`. For a conversation with no `call_session_id`, root at `ai-voice-assistant` and pass `conversation_id`. Those two trees do not overlap; adding both `cost.total` values is correct for that split. A product that hangs off call-control only (the guide names `media-streaming`) can be missing from both trees. Full reconciliation still needs detail records by type.

Verified cost fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `cost.total` | decimal **string** (example `"0.009800"`) | Sum of all events in this tree. |
| `cost.currency` | string | ISO 4217, example `USD`. |
| `root.cost.event_cost` | decimal string | This node's own charge. |
| `root.cost.cumulative_cost` | decimal string | This node plus descendants. |
| `meta.event_count` | integer | |
| `meta.products` | string[] | Product ids in the tree. Not a closed enum. |

The guide states the root `cumulative_cost` equals the session total. The call-session root's own `event_cost` is `"0"` because the root is a container, not a billable product. That zero is real. Children must not be added again on top of `cumulative_cost`.

Documented billing shape for an AI call (guide, not a price list we should hard-code):

| Record type | Billed as |
| --- | --- |
| `ai-voice-assistant` | Per minute of assistant usage. The narrative example is $0.06/min. Do not hard-code that rate. |
| `inference` | One event per assistant LLM turn. |
| `call-control` | Per minute. |
| `sip-trunking`, `webrtc` | Per minute of the voice leg. |
| `recording`, `speech-to-text`, `text-to-speech` | Per use or per minute, product-dependent. |

The guide says the assistant `record` carries `rate`, `rate_measured_in`, and duration, and that each inference child names the model and prompt, cached, and completion token counts. Those record bodies are still unpublished objects. Token counts and model names can describe a patient conversation. The sync stores cost, currency, rate, rate unit, and duration seconds only, and drops everything else.

Errors: 400 bad parameters, 403 forbidden, 404 not found (or bad `date_time`), 500 retry with backoff. A 404 is not a zero-cost call.

## 4. Usage Reports (Telnyx's own totals)

`GET /v2/usage_reports` (OpenAPI tag: Usage Reports BETA)

One product per request. There is no all-products call.

Products named in the guide (there is no phone-number product in this list). The live account also returns `ai-voice-assistant`:

`sip-trunking`, `messaging`, `call-control`, `wireless`, `cloud-storage`, `inference`, `verify-2fa`, `fax-api`, `webrtc`, `cps`, `conference`, `programmable-video`, `call-control-features`, `customer-service-record`, `media-streaming`, `noise-suppression`, `text-to-speech`, `speech-to-text`, `recording`, `forking`, `media-storage`, `amd`

`GET /v2/usage_reports/options` (optional `product`) returns `product_dimensions` and `product_metrics`. Dimensions and metrics are product-specific. A bad metric returns 400 with the allowed list. The inspect script records the options payload for the products we reconcile. Until that response is saved, only the sip-trunking sample is verified:

- Dimensions include `date`, `date_time`, `connection_id`, `direction`, `currency`, `billing_group_id`, `country_code`, and others.
- Metrics: `connected`, `cost`, `attempted`, `call_sec`, `completed`, `billed_sec`.

The 400 example repeats that same sip-trunking metric list. **Unknown** for `call-control`, `inference`, `text-to-speech`, `speech-to-text`, `recording`, and `webrtc` until options is called. The sync asks for `cost` plus `billed_sec` and `call_sec` only when options says those metrics exist. It does not guess.

Date window (**verified**):

- `start_date` inclusive, `end_date` exclusive.
- Format `YYYY-MM-DDThh:mm:ssTZD`. Maximum span **31 days**.
- Billing usage is calculated in **UTC**. A clinic "October" in US Eastern is not the same window as Telnyx's UTC month. Reconciliation uses the same UTC window the API was queried with, and the UI says so.
- `date_range` literals can replace the two timestamps (`last_month`, `this_month`, …).

`dimensions` and `metrics` are required. Add `currency` as a dimension whenever cost is requested so a number is not assumed to be USD. In the published sip-trunking example, `cost` is a JSON **number** (`1911.6248`) and currency is absent unless requested. Detail-record `cost` is a **string**. Parsers accept both. A missing `cost` key is null, not 0.

Pagination: `page[number]`, `page[size]` default 20. OpenAPI maximum page size is **5000**. `meta` matches the usual page fields. `format=csv` or `json` (default).

Backfill requests one report per product for a window of 31 days or less (a UTC month), and one report per UTC day when the window is longer. `page[size]` is 5000. A finished product or day is checkpointed the same way as a detail-record page. `cost5d` is not requested.

Usage-report rows are aggregates. They are not calls. For products that also have detail records (call control, SIP, AI assistant, inference, AMD) the report is only the reconciliation target. Recording and noise suppression are per-call detail records (filter on `started_at`): recording joins a call on `telnyx_session_id`, noise suppression on `call_session_id` (several rows per call, each stored and summed). Their usage-report rows are only the reconciliation target. Speech-to-text and text-to-speech have no per-call cost on this account. The sync reads `/v2/usage_reports/options` and, when `assistant_id`, `connection_id`, or `billing_group_id` is listed, requests that dimension and stores one charge per clinic per day (`allocation_method` `exact`). If none of those dimensions exist, it splits each day's account-wide cost by that day's share of client-visible call minutes and marks the charge `allocated`. The two paths are never combined. A group that is not mapped, or a day with cost and no call minutes, is left off every statement and shows up as the unallocated remainder. Each sync deletes and reinserts only that window's usage-report charges, so a rerun cannot double-count and a September sync cannot remove October. Those charges have no call. `cost5d` on speech-to-text is not requested and is not treated as cost. Sip-trunking's date dimension is `datetime`; the others use `date`.

## 5. Other billing surfaces

### `call.cost` webhook (not a list API)

Verified payload fields: `status` `success` | `error`; `total_cost` string or null; `billed_duration_secs` integer or null ("the longest billed duration across all cost parts"); `cost_parts[]` with `call_part`, `rate`, `cost`, `currency`, `billed_duration_secs`.

The published parts are `sip-trunking`, `call-recording`, and `call-control`. AI assistant, inference, STT, and TTS are **not** in the example. **Unknown** whether `total_cost` includes them. The dashboard does not ingest `call.cost`. Those parts duplicate detail-record charges, and a null `total_cost` is already how Telnyx represents "not calculated".

### `call.analyzed` webhook (not a list API)

Verified in the OpenAPI schema. Payload includes `assistant_id`, `conversation_id`, `call_control_id`, `call_session_id`, `call_leg_id`, `duration_sec` (integer, conversation duration), `llm_model`, `stt_model`, `tts_provider`, `tts_model_id`, `tts_voice_id`, `from`, `to`, `reason`, `conversation_insights`, `recordings`, and `cost`.

`cost` is either an object or the placeholder string **`No cost data available.`** The object has `total` (string), `currency`, and `breakdown[]` of `{product, cost}` both strings. The description says the breakdown covers assistant minutes, inference tokens, call control, SIP, and recording, and that the placeholder is what remains after retries. That string is pending, not zero. Insights and recordings are patient content. The sync does not subscribe to this webhook and does not store insights, recording ids, or raw `from` / `to`.

`GET /v2/call_events` lists debugging events (`name`, `call_leg_id`, `call_session_id`, `metadata`). The published example `metadata` is `{}`. **Unknown** whether `call.cost` or `call.analyzed` bodies are recoverable there. Without a leg or session filter, results are limited to the last 24 hours. Not used for billing.

### Balance, invoices, ledger, legacy CDR reports

| Endpoint | Verified fields | Use |
| --- | --- | --- |
| `GET /v2/balance` | `balance`, `pending`, `credit_limit`, `available_credit`, `currency`, all strings except the record type | Account cash position. `pending` is **not** a per-call charge list. Do not display it as clinic pending usage. |
| `GET /v2/invoices` | `invoice_id`, `file_id`, `period_start`, `period_end`, `paid`, `url` | PDF pointer. No line items. |
| `POST /v2/ledger_billing_group_reports` | body `year`, `month`; status `pending`, `complete`, `failed`, `deleted`; `report_url` | Async CSV. Column layout is **unknown**. |
| `GET /v2/reports/cdr_usage_reports/sync` | required `aggregation_type`, `product_breakdown`; `status` `PENDING`, `COMPLETE`, `FAILED`, `EXPIRED`; `result` is an open object | Report job status, not a per-call finalization flag. `result` shape is **unknown**. |

`status` on these report objects means the report job, not whether a call's price is final.

### Phone numbers

`GET /v2/phone_numbers` (`PhoneNumberDetailed`) has `id`, `phone_number`, `status`, `connection_id`, `connection_name`, `billing_group_id`, `phone_number_type`, `purchased_at`, and tags. It has **no** `cost`, `monthly_cost`, or currency.

`GET /v2/available_phone_numbers` has `cost_information.upfront_cost`, `cost_information.monthly_cost`, and `cost_information.currency` (strings). That is the catalog price of a number that is still for sale, not the amount billed for a number the account already owns.

`usage_payment_method` on voice settings is `pay-per-minute` or `channel`. It is not an amount.

Telnyx does not return an owned-number fee. The live invoice list was empty, and `PhoneNumberDetailed` has no fee. The dashboard does not invent one from the catalog. An admin sets a fixed monthly fee on the mapped number: amount, effective date, and `full_month` (the default) or `prorated`. The fee in effect for a UTC month is the latest row whose effective date is on or before the last day of that month. `full_month` bills the whole amount once that date has arrived, including when it falls mid-month. `prorated` bills `monthly_amount × days from the effective date (or the 1st) through month end ÷ days in the month`. A configured `0` is a real zero. No row, or a row that starts after the month, is **missing config**. The statement line is "Phone number (fixed monthly)". The amount is not stored as a charge, so it does not make a call pending and it is not part of the Telnyx usage-total tie-out. The call KPI `numbers.monthly_cost` stays null and the note still says the API fee is unavailable. The production seed sets $1.00 per month, full month, effective 2026-01-01, on the four owned numbers (HFAAC `3066176828201764232`, AGP `3066176828184987015`, MMC `3067564118098576897`, Schaumburg `3068523548998895141`). Each fee is labeled `Telnyx list price (unconfirmed)` and an admin can change it. The fixture demo seed does not insert fees.

## 6. Pagination, rate limits, data latency

| API | Page size | Notes |
| --- | --- | --- |
| Detail records | max 50 | Deep-object `page[number]`, `page[size]`. |
| Usage reports | max 5000, default 20 | Same meta object. |
| Invoices | max 250 | |
| Phone numbers | standard `page[number]`, `page[size]` | Meta verified on the list response. |
| Conversations | `page[size]` max 100 | Stop on an empty page. `meta.total_results` is wrong on this account. |
| Session analysis | one tree per request | Not a list. `GET /v2/session_analysis/metadata` lists record types. |

Rate limits (**verified** policy, **unknown** numbers):

- Most `api.telnyx.com` routes are limited. Caps differ by product and can change. Do not hard-code a global RPS.
- Limits are per region. `api.telnyx.com` and `api.telnyx.eu` do not share a counter.
- Headers, when present: `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`, `retry-after`. A missing header does not mean unlimited. Do not assume `x-ratelimit-reset` is a timestamp rather than a delta.
- HTTP 429 body uses error code `10011`, title "Too many requests".
- Retry only idempotent reads. Honor `Retry-After`, otherwise exponential backoff with jitter, and cap attempts.

Data latency:

- OpenAPI `x-latency-category` (`responsive` on detail records, `interactive` on usage reports) is API response time, not billing delay.
- No published settlement delay for voice CDRs or AI assistant charges was found. **Unknown.**
- Session Analysis can 404 when the event is not indexed yet or `date_time` is off.
- `call.analyzed` documents a cost placeholder after retries, so AI cost can lag the call.
- Messaging cost null-until-finalized is **not** evidence that voice `cost` is nullable. Voice nullability is **unknown**.
- The current month is open. The sync re-reads a trailing window instead of assuming yesterday's rows are frozen. A later sync may fill a null `cost` on the same Telnyx id. That is an update, not a second charge.

## 7. Rules the calculator follows

These are the only aggregations the app applies. Each one uses a field marked verified, or an optional field that stays null when absent.

1. **Call identity.** A call is the `conversation_id` on an `ai-voice-assistant` detail record. Upsert on that id. `call_control_id` is stored when the detail record has it and is not a second call. The conversation list is not read during backfill. A client login is assigned one or more assistant ids. Metrics, the call log, and CSV/PDF exports intersect every query with that assignment on the server. Dashboard routes accept only `assistant_id` (client and clinic filters were removed). An `assistant_id` outside the assignment is ignored, so a tampered filter cannot read another assistant. Assistants marked not client-visible (the test copies) stay out of client logins even if a row assigns them.
2. **Charge identity.** A charge is `(service, telnyx id)`. AI assistant uses `conversation_id` (there is no `id`). AMD uses `id`, which equals `call_leg_id`. Every other detail record uses `id`, else `uuid`. Call-control and sip-trunking share a leg id and stay two charges because the service differs. Session Analysis uses the same key, so the tree and the detail record collapse to one row. The database unique constraint is `(service, telnyx_record_id)`. Replay is an update. A shared leg id is never a second call.
3. **Do not store rollups as charges.** Ignore `cumulative_cost`, `cost.total`, and `call.cost.total_cost` when writing charge rows. Backfill does not call Session Analysis, so the call's session rollup stays empty. A value already stored is not turned into a charge.
4. **Missing cost is null.** Null, absent, blank, the string `None`, or `No cost data available.` means pending. The string or number `0` is a recorded zero. Scientific notation (`7.04E-4`) is a real amount. Amounts are `NUMERIC`, never a float default of 0. Text-to-speech detail records have no `cost` key; they are not inserted as pending call charges.
5. **A call with any pending charge has no call cost.** The call cost stays null. It is excluded from recorded-cost totals and from average cost per call. The UI shows Pending, not $0.00. Usage-report charges have no call, so they do not make a call pending.
6. **Average cost per call** divides recorded call cost by the count of calls whose cost is fully recorded. If that count is zero, the average is null.
7. **Duration** is one number per call: voice detail `call_sec` when that field is present on the single call-control (or, if no call-control row, webrtc) record joined by session id. `billed_sec` is billed duration, stored on the charge, and is not added into talk time. Missing `call_sec` stays null. Durations of SIP, recording, and assistant rows are not summed with it.
8. **Service breakdown** sums charge amounts grouped by product. It includes per-call recording and noise-suppression detail charges and usage-report charges (speech-to-text, text-to-speech) for the clinic on the charge. Those rows are not added into a call's cost and are not summed from session totals.
9. **Reconciliation** compares, per usage-report product, Telnyx `metrics=cost` over the same UTC window with the sum of priced detail-record charges. `ai-voice-assistant` is included. Pending detail charges make the row incomplete. Products with a usage cost and no detail records (speech-to-text, text-to-speech) are status `usage_report`: the priced total shown is the usage-report cost, and the delta is blank. `cost5d` is never the cost. Usage reports are account-wide. A clinic filter never changes the Telnyx total, and the UI says that.
10. **Currency.** If the rows in a total do not share one currency, the total is null and the UI says the currencies differ. No FX. The string `None` in a currency field is null, not a currency code.
11. **Phone-number fee.** The line "Phone number (fixed monthly)" is the admin fee from rule above, not a Telnyx product. Missing config is not zero. The fee is computed when the statement is read, so an edit applies without a resync.
12. **Usage-only products** (speech-to-text, text-to-speech; recording and noise suppression moved to per-call detail records and are counted once in the conversation total, shown but not re-added if Session Analysis ever includes them) are monthly statement lines. Options decides exact clinic attribution (`assistant_id`, then `connection_id`, then `billing_group_id`) or a daily minute allocation marked `allocated`. Never both, and never also on the call. Unmapped cost is the account remainder.
13. **Billing statement.** One invoice per client for the UTC month: AI assistant, call control, SIP, inference, AMD, speech-to-text, text-to-speech, recording, noise suppression, and the fixed number fee. The grand total is null while any line is pending, missing config, or unavailable. Known-so-far still adds the priced portion of a pending line. Allocated does not block the total. CSV and PDF use the same scope as the page. The admin account tie-out sums every client statement against Telnyx usage totals and shows the unallocated remainder, including cost on hidden test assistants. Fixed phone fees are not in that comparison. The tie-out stays account-wide when the invoice list is filtered.

## 8. Clinic mapping on this account

Production assistants are visible to their clinic login. Test copies are stored and excluded from client views (`client_visible` false, and not assigned to a login).

| Clinic | Assistant id | Billing group |
| --- | --- | --- |
| HFAAC | `assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac` | `4bdf3e48-fd42-480e-9bd8-fe96affd1be2` |
| MMC | `assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a` | `61c0967c-f7cb-42ef-89db-1045dc1c8ad9` |
| AGP | `assistant-f3cf8aea-7c8e-451a-b577-19b828f86156` | `90e164fb-77ba-4bde-94d7-8c3630ce3b2d` |
| Schaumburg | `assistant-429c0bf6-c5af-4eac-9fd5-7289487b5bf9` | `600e73df-ed3e-4900-83d1-79ec8f081fab` |

Hidden test assistants: `assistant-ce6e961c-d4d7-417f-8d8b-8e88991f85dd` (HFAAC copy), `assistant-1128ffea-3791-4e7d-b740-d0d6f8fb2c0b` (MMC copy), `assistant-fea032f4-9f48-4333-8c81-b3a602221840` (Zaya Voice Book Appointment Flow).

Number connection name is `ai-assistant-<assistant uuid>` (the `assistant-` prefix stripped). Tag records by `billing_group_id` and `assistant_id`.

## 9. Confirmed on the live account (2026-10-23)

Read-only inspection. These replace the guesses above where they differ.

1. AI conversations paginate with `page[number]` / `page[size]` (max 100). `meta.total_results` is wrong. Stop on an empty page. Call metadata carries the assistant id, call control id, leg id, session id, and from/to.
2. Date filters: call-control and sip-trunking accept `filter[started_at][gte]`. AI assistant, inference, and text-to-speech need `filter[created_at][gte]` (`started_at` returns 400). AMD uses `invoked_at`. Speech-to-text accepts no date filter and returned 0 records, so it is not requested as detail records.
3. Ids and costs, all strings:
   - call-control: `id` == `telnyx_leg_id`; `telnyx_session_id`; `cost`, `rate`, `billed_sec`, `call_sec`, `currency`
   - sip-trunking: same `id` as the call-control leg; `call_control_id`, `telnyx_session_id`; `cost`, `rate`, `billed_sec`
   - ai-voice-assistant: no `id`; `conversation_id`, plus assistant, leg, session, call control, and billing group ids; `cost`, `rate` `0.032`, `rate_measured_in` `ai_voice_assistant_minutes`, `billed_sec`, `duration_sec`, model ids
   - inference: `id`; `conversation_id` may be the string `None` (insight generation); `cost` may be scientific notation; sub-costs may be `None`
   - text-to-speech: `record_type` `text-to-speech`; `id`; no `cost` (character count). Usage-report cost was `0`, a real zero
   - amd: `id` == `call_leg_id`; `cost` `0.0065` per invocation
4. No null costs were seen, and no finalization status field. Speech-to-text usage reports expose `cost5d` (possible delayed settlement). That is unconfirmed. The sync does not read `cost5d`.
5. Usage reports: `ai-voice-assistant` is supported (`cost`, `billed_sec`, `duration_sec`, groupable by assistant, models, and billing group). Product names are `text-to-speech` and `speech-to-text`. Sip-trunking's time dimension is `datetime`; others use `date`. Recording and noise suppression have real cost and detail records (`started_at` filter only; `created_at` is rejected), and can be grouped by `billing_group_id`, so this account attributes them exactly per clinic. If a future product lists none of `assistant_id`, `connection_id`, or `billing_group_id`, the daily account cost is allocated by that day's call minutes and marked allocated. Conference requests error (subtype filters) and are not ingested.
6. Session analysis: call-control and sip node id equals the detail id (the leg id). The AI node id is `conversation_id`. The inference node id is the inference id. AI links to call-control by `telnyx_session_id`. Noise-suppression detail records link by `call_session_id`; recording by `telnyx_session_id`. A session or leg id shared by more than one conversation matches no call, so a charge can never land on another assistant. Backfill does not call it. One request per call was what tripped the shared API key. Charges come from the detail-record pages.
7. Owned-number fees are not in the API. Invoices were empty. The production seed uses $1.00 full month on the four number ids above, labeled `Telnyx list price (unconfirmed)`, and that label and amount stay editable. A number with no fee is missing config, not zero.

### Still unknown

- Whether `cost5d` is a delayed settlement of speech-to-text or a different figure. It is not used as cost.
- Conference subtype parameters. Conference is not ingested.
- How soon a cost string on a voice or AI row can still change after it first appears. The current month stays open and is re-read.
- Ledger billing-group CSV columns, and whether `call.cost.total_cost` includes assistant and inference. Those surfaces are still not ingested.

## Live refresh on Submit

The dashboard's Submit button first calls `POST /api/refresh?month=&assistant_id=`, then reads
metrics and the call log. The refresh reads Telnyx detail records (all `RECORD_TYPES`) for the
last 36 hours of the selected month only (`live_window`), upserts calls for the selected
assistant (or the login's allowed assistants), attaches per-call charges, and fetches Session
Analysis for up to 40 new calls of that scope. It writes no SyncRun row, has no checkpoint, and
skips usage reports (STT/TTS and reconciliation stay with the full `zaya-usage-sync` job). A
closed month returns `skipped/closed_month`. One refresh runs at a time (Postgres advisory lock
727001) and the same scope is debounced for 20 s per instance. A Telnyx error is reported in
the response and the dashboard falls back to the last synced data.
````

## File: zaya-usage-web-main/frontend/e2e/dashboard.spec.ts
````typescript
import { expect, test, type Page } from "@playwright/test";

async function openLogin(page: Page) {
  await page.goto("/login");
  await page.waitForFunction(() => document.documentElement.dataset.appReady === "1");
  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(page.getByLabel("Password")).toHaveValue("");
  await expect(page.locator("body")).not.toContainText("local-admin-change-me");
  await expect(page.locator("body")).not.toContainText("local-clinic-change-me");
}

test("login starts empty, trims the email, and drops a pasted newline", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await openLogin(page);
  const posted: { body: { email?: string; password?: string } | null } = { body: null };
  await page.route("**/backend/api/auth/login", async (route) => {
    posted.body = route.request().postDataJSON();
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Email or password is incorrect" }),
    });
  });
  const email = page.getByLabel("Email");
  await email.fill("  person@example.com  ");
  await expect(email).toHaveValue("person@example.com");
  const password = page.getByLabel("Password");
  await password.click();
  await page.evaluate(async () => {
    await navigator.clipboard.writeText("correct-horse\n");
  });
  await password.press("ControlOrMeta+v");
  await expect(password).toHaveValue("correct-horse");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect.poll(() => posted.body?.email).toBe("person@example.com");
  expect(posted.body?.password).toBe("correct-horse");
  await expect(page.getByText("Email or password is incorrect")).toBeVisible();
});

test("assistant login sees only that assistant, including the call log", async ({ page }) => {
  await openLogin(page);
  await page.getByLabel("Email").fill("hfaac@zayahealth.example");
  await page.getByLabel("Password").fill(process.env.DEMO_PASSWORD || "local-clinic-change-me");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("submit-hint")).toBeVisible();
  await expect(page.getByTestId("recorded-cost")).toHaveCount(0);
  await page.getByTestId("submit-filters").click();
  await expect(page.getByTestId("recorded-cost")).toBeVisible();
  await expect(page.getByTestId("clinic-filter")).toHaveCount(0);
  await expect(page.getByTestId("client-filter")).toHaveCount(0);
  const assistant = page.getByTestId("assistant-filter");
  await expect(assistant).toContainText("Houston Foot and Ankle Care — assistant-");
  await expect(assistant).not.toContainText("Schaumburg");
  await expect(assistant).not.toContainText("(test)");
  await expect(page.getByTestId("conversation-billing")).toBeVisible();
  await expect(page.getByTestId("conversation-total")).toContainText("$");
  await expect(page.getByTestId("billing-statement")).toHaveCount(0);
  await expect(page.getByTestId("live-refresh")).toBeVisible();
  await expect(page.getByTestId("pending-badge").first()).toBeVisible();
  const recorded = await page.getByTestId("recorded-cost").innerText();
  expect(recorded).not.toBe("$0.00");
  expect(recorded).not.toBe("Pending");

  const log = page.getByTestId("call-log");
  await expect(log).toBeVisible();
  await expect(log).not.toContainText("Schaumburg");
  await expect(log).not.toContainText("(test)");
  await expect(page.getByTestId("timezone-select")).toHaveValue("America/Chicago");
  await expect(log).toContainText(/C[DS]T/);
  await page.getByTestId("timezone-select").selectOption("UTC");
  await expect(log).toContainText("UTC");
  await expect(log).not.toContainText("Metro Medical");
  await expect(page.getByTestId("billed-duration").first()).toContainText(/^(\d+m \d{2}s|\d+s)$/);
  await expect(page.getByTestId("call-row")).toHaveCount(16);
  await expect(log).not.toContainText("Schaumburg");

  await page.getByTestId("call-row").first().click();
  await expect(page.getByTestId("service-breakdown")).toContainText("Call control");
  await expect(page.getByTestId("service-breakdown")).not.toContainText("transcript");
});

test("admin dashboard has no reconciliation and sortable call log", async ({ page }) => {
  await openLogin(page);
  await page.getByLabel("Email").fill("admin@zayahealth.example");
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD || "local-admin-change-me");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByTestId("submit-filters").click();
  await expect(page.getByTestId("conversation-billing")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Metro Medical Clinic");
  await expect(page.getByText("Account reconciliation")).toHaveCount(0);
  await expect(page.getByTestId("call-log")).toBeVisible();
  await page.getByTestId("sort-cost").click();
  await expect(page.locator('th[aria-sort="descending"]')).toContainText("Cost");
});
````

## File: zaya-usage-web-main/frontend/public/file.svg
````xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: zaya-usage-web-main/frontend/public/globe.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: zaya-usage-web-main/frontend/public/next.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

## File: zaya-usage-web-main/frontend/public/vercel.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

## File: zaya-usage-web-main/frontend/public/window.svg
````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: zaya-usage-web-main/frontend/src/app/admin/page.tsx
````typescript
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

type MapClient = {
  id: string;
  name: string;
  slug: string;
  clinics: {
    id: string;
    name: string;
    code: string;
    assistants: { id: string; name: string; telnyx_assistant_id: string; client_visible?: boolean }[];
    resources: {
      id: string;
      kind: string;
      label: string;
      telnyx_id: string;
      fees?: { id: string; monthly_amount: string; effective_on: string; proration: string; note?: string | null }[];
    }[];
  }[];
  users: { id: string; email: string; role: string; assistants: { id: string; name: string; telnyx_assistant_id: string }[] }[];
};

export default function AdminPage() {
  const [clients, setClients] = useState<MapClient[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [month, setMonth] = useState("2026-10");

  async function load() {
    const payload = await api<{ clients: MapClient[] }>("/api/admin/map");
    setClients(payload.clients);
  }

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        const payload = await api<{ clients: MapClient[] }>("/api/admin/map");
        if (!ignore) setClients(payload.clients);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Could not load mapping");
      }
    }
    void run();
    return () => {
      ignore = true;
    };
  }, []);

  async function submit(path: string, body: unknown, success = "Saved.") {
    setError("");
    setNotice("");
    try {
      await api(path, { method: "POST", body: JSON.stringify(body) });
      setNotice(success);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-3xl">Client mapping</p>
          <p className="text-sm text-muted-foreground">Assistants and Telnyx resources decide which clinic a call belongs to.</p>
        </div>
        <Button variant="outline" render={<Link href="/" />}>
          Back to usage
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {notice && <p className="text-sm text-primary">{notice}</p>}

      {clients.length > 0 && <NumberFeeForm clients={clients} onSubmit={(body) => submit("/api/admin/number-fees", body, "Fee saved.")} />}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Sync a month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <Label>Month</Label>
            <Input value={month} onChange={(event) => setMonth(event.target.value)} className="w-36" />
          </label>
          <Button onClick={() => submit("/api/admin/sync", { month }, `Synced ${month}.`)}>
            Run sync
          </Button>
        </CardContent>
      </Card>

      {clients.map((client) => (
        <Card key={client.id}>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {client.name} <span className="text-base text-muted-foreground">{client.slug}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {client.users.map((user) => (
              <p key={user.id}>
                {user.email} · {user.role}
                {user.assistants.length > 0 ? ` · ${user.assistants.map((assistant) => assistant.name).join(", ")}` : ""}
              </p>
            ))}
            {client.clinics.map((clinic) => (
              <div key={clinic.id} className="rounded-lg border border-border p-3">
                <p className="font-medium">
                  {clinic.name} · {clinic.code}
                </p>
                {clinic.assistants.map((assistant) => (
                  <p key={assistant.id} className="text-muted-foreground">
                    Assistant {assistant.name} · {assistant.telnyx_assistant_id}
                    {assistant.client_visible === false ? " · hidden from client logins" : ""}
                  </p>
                ))}
                {clinic.resources.map((resource) => (
                  <p key={resource.id} className="text-muted-foreground">
                    {resource.kind} · {resource.label}
                    {resource.kind === "number" && (resource.fees?.length
                      ? resource.fees.map((fee) => ` · $${Number(fee.monthly_amount).toFixed(2)} ${fee.proration.replace("_", " ")} from ${fee.effective_on}${fee.note ? ` · ${fee.note}` : ""}`).join("")
                      : " · no fee configured")}
                  </p>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <AddClient onSubmit={(body) => submit("/api/admin/clients", body)} />
      {clients[0] && (
        <AddClinic
          clients={clients}
          onSubmit={(body) => submit("/api/admin/clinics", body)}
        />
      )}
    </div>
  );
}

function NumberFeeForm({
  clients,
  onSubmit,
}: {
  clients: MapClient[];
  onSubmit: (body: { resource_id: string; monthly_amount: string; effective_on: string; proration: string; note: string }) => void;
}) {
  const numbers = clients.flatMap((client) =>
    client.clinics.flatMap((clinic) =>
      clinic.resources.filter((resource) => resource.kind === "number").map((resource) => ({
        id: resource.id,
        label: `${client.name} · ${clinic.code} · ${resource.label}`,
      })),
    ),
  );
  const [resourceId, setResourceId] = useState(numbers[0]?.id ?? "");
  const [amount, setAmount] = useState("1.00");
  const [effectiveOn, setEffectiveOn] = useState("2026-01-01");
  const [proration, setProration] = useState("full_month");
  const [note, setNote] = useState("");

  function send(event: FormEvent) {
    event.preventDefault();
    onSubmit({ resource_id: resourceId, monthly_amount: amount, effective_on: effectiveOn, proration, note });
  }

  if (numbers.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Phone number fee</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={send} data-testid="number-fee-form">
          <select className="h-9 rounded-lg border border-input bg-card px-2" value={resourceId} onChange={(event) => setResourceId(event.target.value)}>
            {numbers.map((number) => (
              <option key={number.id} value={number.id}>
                {number.label}
              </option>
            ))}
          </select>
          <Input type="number" min="0" step="0.0001" value={amount} onChange={(event) => setAmount(event.target.value)} required aria-label="Monthly amount" />
          <Input type="date" value={effectiveOn} onChange={(event) => setEffectiveOn(event.target.value)} required aria-label="Effective date" />
          <select className="h-9 rounded-lg border border-input bg-card px-2" value={proration} onChange={(event) => setProration(event.target.value)} aria-label="Proration">
            <option value="full_month">Full month</option>
            <option value="prorated">Prorated</option>
          </select>
          <Input value={note} onChange={(event) => setNote(event.target.value)} aria-label="Fee label" placeholder="Telnyx list price (unconfirmed)" />
          <Button type="submit">Save fee</Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">Full month is the default. Saving again on the same effective date replaces that fee. A number with no fee stays missing config on the client statement.</p>
      </CardContent>
    </Card>
  );
}

function AddClient({ onSubmit }: { onSubmit: (body: { name: string; slug: string }) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  function send(event: FormEvent) {
    event.preventDefault();
    onSubmit({ name, slug });
    setName("");
    setSlug("");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Add a client</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-3" onSubmit={send}>
          <Input placeholder="Client name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
          <Button type="submit">Add client</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddClinic({
  clients,
  onSubmit,
}: {
  clients: MapClient[];
  onSubmit: (body: { client_id: string; name: string; code: string }) => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  function send(event: FormEvent) {
    event.preventDefault();
    onSubmit({ client_id: clientId, name, code });
    setName("");
    setCode("");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Add a clinic</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-4" onSubmit={send}>
          <select className="h-9 rounded-lg border border-input bg-card px-2" value={clientId} onChange={(event) => setClientId(event.target.value)}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <Input placeholder="Clinic name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder="Code" value={code} onChange={(event) => setCode(event.target.value)} required />
          <Button type="submit">Add clinic</Button>
        </form>
      </CardContent>
    </Card>
  );
}
````

## File: zaya-usage-web-main/frontend/src/app/backend/[...path]/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";

function apiOrigin(): string {
  return process.env["API_URL"] || "http://127.0.0.1:43124";
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`${apiOrigin()}/${path.join("/")}${request.nextUrl.search}`);
  const headers = new Headers(request.headers);
  headers.delete("host");
  const init: RequestInit = { method: request.method, headers, redirect: "manual" };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }
  const upstream = await fetch(target, init);
  const response = new NextResponse(upstream.body, { status: upstream.status });
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || lower === "content-encoding" || lower === "content-length") {
      return;
    }
    response.headers.set(key, value);
  });
  for (const cookie of upstream.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
````

## File: zaya-usage-web-main/frontend/src/app/login/page.tsx
````typescript
"use client";

import { ClipboardEvent, FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { passwordAfterPaste, stripTrailingNewline, trimEmail } from "@/lib/login-fields";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function onPasswordPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (stripTrailingNewline(pasted) === pasted) return;
    event.preventDefault();
    const field = event.currentTarget;
    const start = field.selectionStart ?? password.length;
    const end = field.selectionEnd ?? password.length;
    setPassword(passwordAfterPaste(password, pasted, start, end));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextEmail = trimEmail(email);
    if (nextEmail !== email) setEmail(nextEmail);
    setPending(true);
    setError("");
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: nextEmail, password }),
      });


      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary px-10 py-12 text-primary-foreground lg:flex">
        <p className="font-display text-3xl">Zaya</p>
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-tight">What the reception desks actually cost this month.</h1>
          <p className="mt-4 text-primary-foreground/80">
            Call counts, talk time, and Telnyx charges for the HFAAC, MMC, AGP, and Schaumburg assistants. Pending prices stay pending.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">Caller numbers are masked. Transcripts are not stored.</p>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(trimEmail(event.target.value))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onPaste={onPasswordPaste}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={pending}>
                {pending ? "Signing in…" : "Continue"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">Each clinic login is limited to its own Telnyx assistant.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
````

## File: zaya-usage-web-main/frontend/src/app/globals.css
````css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-figtree), "Figtree", ui-sans-serif, sans-serif;
  --font-mono: ui-monospace, monospace;
  --font-heading: var(--font-fraunces), Georgia, serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: oklch(0.972 0.012 95);
  --foreground: oklch(0.27 0.03 230);
  --card: oklch(0.995 0.006 95);
  --card-foreground: oklch(0.27 0.03 230);
  --popover: oklch(0.995 0.006 95);
  --popover-foreground: oklch(0.27 0.03 230);
  --primary: oklch(0.4 0.055 190);
  --primary-foreground: oklch(0.98 0.01 95);
  --secondary: oklch(0.94 0.018 90);
  --secondary-foreground: oklch(0.32 0.03 210);
  --muted: oklch(0.945 0.014 95);
  --muted-foreground: oklch(0.48 0.02 230);
  --accent: oklch(0.93 0.035 75);
  --accent-foreground: oklch(0.38 0.07 55);
  --destructive: oklch(0.52 0.15 30);
  --border: oklch(0.88 0.02 90);
  --input: oklch(0.88 0.02 90);
  --ring: oklch(0.5 0.06 190);
  --chart-1: oklch(0.45 0.07 190);
  --chart-2: oklch(0.64 0.12 55);
  --chart-3: oklch(0.55 0.08 150);
  --chart-4: oklch(0.72 0.08 85);
  --chart-5: oklch(0.4 0.04 230);
  --radius: 0.9rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}

.font-display {
  font-family: var(--font-heading);
}
````

## File: zaya-usage-web-main/frontend/src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { AppReady } from "@/components/ready";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Zaya usage",
  description: "Monthly Telnyx usage and cost for Zaya Health receptionist agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${fraunces.variable} antialiased`}>
        <AppReady />
        {children}
      </body>
    </html>
  );
}
````

## File: zaya-usage-web-main/frontend/src/app/page.tsx
````typescript
import { Dashboard } from "@/components/dashboard";

export default function HomePage() {
  return <Dashboard />;
}
````

## File: zaya-usage-web-main/frontend/src/components/ui/badge.tsx
````typescript
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
````

## File: zaya-usage-web-main/frontend/src/components/ui/button.tsx
````typescript
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
````

## File: zaya-usage-web-main/frontend/src/components/ui/card.tsx
````typescript
import * as React from "react"
import { cn } from "cn"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(3)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
````

## File: zaya-usage-web-main/frontend/src/components/ui/input.tsx
````typescript
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
````

## File: zaya-usage-web-main/frontend/src/components/ui/label.tsx
````typescript
"use client"

import * as React from "react"
import { cn } from "cn"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
````

## File: zaya-usage-web-main/frontend/src/components/ui/separator.tsx
````typescript
"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "cn"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
````

## File: zaya-usage-web-main/frontend/src/components/ui/table.tsx
````typescript
"use client"

import * as React from "react"
import { cn } from "cn"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-7 px-2 text-left text-xs align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-2 py-1 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
````

## File: zaya-usage-web-main/frontend/src/components/call-log.tsx
````typescript
"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { billedDuration, callDate, callerLabel, callStatus, callTime, costSource, DEFAULT_TIMEZONE, duration, money, serviceLabel, TIMEZONES } from "@/lib/format";
import type { CallRow } from "@/lib/types";

const PAGE_SIZE = 25;

type SortKey = "started_at" | "duration" | "billed" | "caller" | "cost" | "conversation";
type SortDir = "asc" | "desc";

function SortHeader({ label, column, sort, dir, onSort, align }: { label: string; column: SortKey; sort: SortKey; dir: SortDir; onSort: (column: SortKey) => void; align?: "right" }) {
  const active = sort === column;
  const arrow = active ? (dir === "asc" ? "▲" : "▼") : "↕";
  return (
    <th className={`px-2 py-1 font-medium ${align === "right" ? "text-right" : ""}`} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" data-testid={`sort-${column}`} onClick={() => onSort(column)} className={`inline-flex items-center gap-1 hover:text-foreground ${active ? "text-foreground" : ""}`}>
        {label}
        <span aria-hidden className={active ? "" : "opacity-40"}>{arrow}</span>
      </button>
    </th>
  );
}

export function CallLog({ query }: { query: string }) {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState(DEFAULT_TIMEZONE);
  const [sort, setSort] = useState<SortKey>("started_at");
  const [dir, setDir] = useState<SortDir>("desc");
  const sortQuery = `${query}&sort=${sort}&direction=${dir}`;
  function onSort(column: SortKey) {
    if (column === sort) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(column);
      setDir(column === "caller" || column === "conversation" ? "asc" : "desc");
    }
  }
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const offsetRef = useRef(0);
  const totalRef = useRef(0);
  const readyRef = useRef(false);

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        readyRef.current = false;
        setLoading(true);
        const payload = await api<{ calls: CallRow[]; total: number }>(`/api/calls?${sortQuery}&limit=${PAGE_SIZE}&offset=0`);
        if (ignore) return;
        offsetRef.current = payload.calls.length;
        totalRef.current = payload.total;
        readyRef.current = true;
        setCalls(payload.calls);
        setTotal(payload.total);
        setError("");
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Could not load the call log");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void run();
    return () => {
      ignore = true;
    };
  }, [sortQuery]);

  const loadMore = useCallback(async () => {
    if (!readyRef.current || loadingMoreRef.current || offsetRef.current >= totalRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const payload = await api<{ calls: CallRow[]; total: number }>(
        `/api/calls?${sortQuery}&limit=${PAGE_SIZE}&offset=${offsetRef.current}`,
      );
      totalRef.current = payload.total;
      setCalls((current) => {
        const seen = new Set(current.map((row) => row.id));
        const next = [...current, ...payload.calls.filter((row) => !seen.has(row.id))];
        offsetRef.current = next.length;
        return next;
      });
      setTotal(payload.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more calls");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [sortQuery]);

  useEffect(() => {
    const root = scrollerRef.current;
    const node = sentinelRef.current;
    if (!root || !node || calls.length >= total) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { root },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [calls.length, total, loadMore]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="font-display text-base">Call log</CardTitle>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading calls…" : `${calls.length} of ${total} calls`} · times in {timeZone}
          </p>
        </div>
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          Timezone
          <select
            data-testid="timezone-select"
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value)}
            className="h-7 rounded-md border border-input bg-card px-1.5 text-xs text-foreground"
          >
            {TIMEZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </label>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        <div
          ref={scrollerRef}
          data-testid="call-log"
          className="max-h-96 overflow-auto rounded-md border border-border sm:max-h-[36rem]"
        >
          {calls.length === 0 && !loading && (
            <p className="px-3 py-6 text-sm text-muted-foreground">No calls for this assistant in the selected month.</p>
          )}
          <table className="w-full min-w-[52rem] text-left text-xs">
            <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <SortHeader label="Date" column="started_at" sort={sort} dir={dir} onSort={onSort} />
                <th className="px-2 py-1 font-medium">Time</th>
                <SortHeader label="Conversation ID" column="conversation" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Duration" column="duration" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Billed duration" column="billed" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="User phone number" column="caller" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Cost" column="cost" sort={sort} dir={dir} onSort={onSort} align="right" />
              </tr>
            </thead>
            <tbody>
          {calls.map((call) => {
            const open = openId === call.id;
            const toggle = () => setOpenId(open ? null : call.id);
            return (
              <Fragment key={call.id}>
                <tr
                  data-testid="call-row"
                  aria-expanded={open}
                  onClick={toggle}
                  className="cursor-pointer border-b border-border align-top hover:bg-muted/50"
                >
                  <td className="whitespace-nowrap px-2 py-1">{callDate(call.started_at, timeZone)}</td>
                  <td className="whitespace-nowrap px-2 py-1">{callTime(call.started_at, timeZone)}</td>
                  <td className="px-2 py-1">
                    <span className="break-all font-mono text-xs" data-testid="conversation-id">{call.telnyx_conversation_id}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {call.assistant_name} · {callStatus(call.cost_status, call.direction)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-2 py-1">{duration(call.duration_sec)}</td>
                  <td className="whitespace-nowrap px-2 py-1" data-testid="billed-duration">
                    {billedDuration(call.billable.billed_sec)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1">{callerLabel(call.masked_caller)}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-right">
                    {call.billable.total != null ? (
                      <span data-testid="call-total">{money(call.billable.total, call.billable.currency)}</span>
                    ) : (
                      <Badge variant="outline" data-testid="pending-badge">
                        Pending
                      </Badge>
                    )}
                  </td>
                </tr>
                {open && (
                  <tr className="border-b border-border">
                  <td colSpan={7} className="p-0">
                  <div data-testid="service-breakdown" className="space-y-1 bg-muted/40 px-2 py-1 text-sm">
                    <p className="text-xs text-muted-foreground" data-testid="cost-source">
                      {costSource(call.billable.source)}
                      {call.billable.session_total != null ? ` · session total ${money(call.billable.session_total, call.billable.currency)}` : ""}
                      {call.billable.partial ? " · some carrier charges still pending" : ""}
                      {call.billable.billed_sec != null ? ` · ${billedDuration(call.billable.billed_sec)} billed` : ""}
                      {call.billable.rate ? ` · rate ${call.billable.rate}${call.billable.rate_measured_in ? ` per ${call.billable.rate_measured_in.replaceAll("_", " ")}` : ""}` : ""}
                    </p>
                    {Object.keys(call.billable.products).length === 0 && <p className="text-muted-foreground">No charge rows on this call yet.</p>}
                    {Object.entries(call.billable.products).map(([service, row]) => (
                      <div key={service} className="flex items-baseline justify-between gap-3">
                        <span>
                          {serviceLabel(service)}
                          {row.count && row.count > 1 ? ` ×${row.count}` : ""}
                        </span>
                        <span className="text-right text-muted-foreground">
                          {row.cost == null ? "Pending" : money(row.cost, call.billable.currency)}
                          {row.billed_sec != null ? ` · ${billedDuration(row.billed_sec)} billed` : ""}
                        </span>
                      </div>
                    ))}
                    {call.billable.total != null && (
                      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-1 font-medium">
                        <span>Total</span>
                        <span>{money(call.billable.total, call.billable.currency)}</span>
                      </div>
                    )}
                    {Object.values(call.billable.products).some((row) => row.count && row.count > 1) && (
                      <p className="pt-1 text-xs text-muted-foreground" data-testid="legs-note">
                        ×N on SIP trunking or call control means Telnyx billed N call legs for this conversation, for example the inbound leg plus a transfer leg. Each leg is its own charge.
                      </p>
                    )}
                  </div>
                  </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
            </tbody>
          </table>
          <div ref={sentinelRef} className="h-px" />
        </div>
        {calls.length < total && (
          <Button
            variant="outline"
            className="mt-2 h-7 w-full"
            data-testid="load-more"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? "Loading…" : "Load more calls"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
````

## File: zaya-usage-web-main/frontend/src/components/dashboard.tsx
````typescript
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CallLog } from "@/components/call-log";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, download } from "@/lib/api";
import { assistantLabel, duration, money, monthLabel, serviceLabel, when } from "@/lib/format";
import type { ConversationBilling, Filters, Metrics } from "@/lib/types";

export function Dashboard() {
  const [filters, setFilters] = useState<Filters | null>(null);
  const [month, setMonth] = useState("2026-10");
  const [assistantId, setAssistantId] = useState("");
  // Dropdowns edit a draft; data loads only for the applied pair after Submit.
  const [applied, setApplied] = useState<{ month: string; assistantId: string } | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [refresh, setRefresh] = useState<LiveRefresh | null>(null);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        const payload = await api<Filters>("/api/filters");
        if (ignore) return;
        setFilters(payload);
        if (payload.months.includes("2026-10")) setMonth("2026-10");
        else if (payload.months[0]) setMonth(payload.months[0]);
      } catch (err) {
        if (!ignore && err instanceof Error && err.message !== "Sign in required") setError(err.message);
      }
    }
    void run();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!filters || !applied) return;
    let ignore = false;
    const query = queryString(applied.month, applied.assistantId);
    async function run() {
      try {

        setPhase("Pulling live from Telnyx…");
        let live: LiveRefresh;
        try {
          live = await api<LiveRefresh>(`/api/refresh?${query}`, { method: "POST" });
        } catch (err) {
          live = { status: "error", reason: err instanceof Error ? err.message : "refresh failed", refreshed_at: new Date().toISOString() };
        }
        if (ignore) return;
        setRefresh(live);
        setPhase("Loading dashboard…");
        const nextMetrics = await api<Metrics>(`/api/metrics?${query}`);
        if (ignore) return;
        setMetrics(nextMetrics);
        setError("");
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Could not load usage");
      } finally {
        if (!ignore) {
          setLoading(false);
          setPhase("");
        }
      }
    }
    void run();
    return () => {
      ignore = true;
    };
  }, [filters, applied]);

  const dirty = !applied || applied.month !== month || applied.assistantId !== assistantId;
  function submit() {
    setPhase("Pulling live from Telnyx…");
    setLoading(true);
    setApplied({ month, assistantId });
  }
  const shownMonth = applied?.month ?? month;
  const shownAssistant = applied?.assistantId ?? "";

  const assistants = filters?.assistants ?? [];

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" });

    window.location.assign("/login");
  }

  const chartData = (metrics?.daily ?? []).map((day) => ({
    ...day,
    label: new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" }),
    cost: day.recorded_cost == null ? null : Number(day.recorded_cost),
  }));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-2 md:px-4">
          <div>
            <p className="font-display text-base tracking-tight text-primary">Zaya</p>
            <p className="text-sm text-muted-foreground">Receptionist usage and cost</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters?.role === "admin" && (
              <Button variant="outline" render={<Link href="/admin" />}>
                Mapping
              </Button>
            )}
            <span className="text-sm text-muted-foreground">{filters?.email}</span>
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 md:px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight">{monthLabel(shownMonth)}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Telnyx bills in UTC. A login sees only its assigned assistants. Test copies stay off client logins. A call stays pending until every charge on it has a cost.
            </p>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="last-sync">
            Last sync {when(metrics?.last_sync_at ?? filters?.last_sync_at)}
          </p>
        </div>

        <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <Filter label="Month" value={month} testid="month-filter" onChange={setMonth}>
            {(filters?.months ?? [month]).map((item) => (
              <option key={item} value={item}>
                {monthLabel(item)}
              </option>
            ))}
          </Filter>
          <Filter
            label="Assistant"
            value={assistantId}
            testid="assistant-filter"
            onChange={setAssistantId}
          >
            <option value="">All assistants</option>
            {assistants.map((assistant) => (
              <option key={assistant.id} value={assistant.id}>
                {assistantLabel(assistant)}
              </option>
            ))}
          </Filter>
          <Button data-testid="submit-filters" onClick={submit} disabled={!filters || loading || !dirty} className="h-8">
            {loading ? phase || "Loading…" : "Submit"}
          </Button>
        </div>
        {!applied && filters && (
          <p className="text-sm text-muted-foreground" data-testid="submit-hint">Choose a month and assistant, then press Submit.</p>
        )}
        {applied && dirty && <p className="-mt-1 text-xs text-muted-foreground">Selection changed. Press Submit to refresh.</p>}
        {assistantId && (() => {
          const selected = assistants.find((item) => item.id === assistantId);
          return selected ? (
            <p className="-mt-2 text-xs text-muted-foreground" data-testid="assistant-telnyx-id">
              {selected.name} · Telnyx {selected.telnyx_name ? `${selected.telnyx_name} · ` : ""}
              <span className="font-mono">{selected.telnyx_assistant_id}</span>
            </p>
          ) : null;
        })()}

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <p className="text-sm text-muted-foreground" role="status" data-testid="loading-phase">
            {phase || "Loading usage…"}
            {phase.startsWith("Pulling") ? " This can take up to a minute." : ""}
          </p>
        )}

        {metrics && (
          <>
            {metrics.incomplete && (
              <Card className="border-accent-foreground/20 bg-accent/40">
                <CardContent className="flex flex-col gap-1 py-4 text-sm">
                  <p className="font-medium">This month is incomplete</p>
                  {metrics.incomplete_reasons.map((reason) => (
                    <p key={reason}>{reason}</p>
                  ))}
                </CardContent>
              </Card>
            )}

            <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Kpi label="Calls" value={String(metrics.kpis.call_count)} detail={`${metrics.kpis.pending_call_count} pending`} testid="call-count" />
              <Kpi
                label="Talk time"
                value={duration(metrics.kpis.duration_sec)}
                detail={metrics.kpis.duration_unknown_count ? `${metrics.kpis.duration_unknown_count} unknown` : "Known durations only"}
              />
              <Kpi
                label="Recorded cost"
                value={money(metrics.kpis.recorded_cost, metrics.kpis.currency)}
                detail={`${metrics.kpis.complete_call_count} complete calls`}
                testid="recorded-cost"
              />
              <Kpi
                label="Avg / complete call"
                value={money(metrics.kpis.average_cost_per_call, metrics.kpis.currency)}
                detail="Pending calls excluded"
                testid="average-cost"
              />
            </section>

            {metrics.conversation_billing && <ConversationBillingCard data={metrics.conversation_billing} />}
            {refresh && (
              <p className="-mt-1 text-xs text-muted-foreground" data-testid="live-refresh">
                {refresh.status === "ok"
                  ? `Pulled live from Telnyx at ${centralTime(refresh.refreshed_at)} · ${refresh.calls_seen ?? 0} recent calls checked.`
                  : refresh.reason === "closed_month"
                    ? "Closed month: shown from the last full sync."
                    : refresh.reason === "recent" || refresh.reason === "busy"
                      ? "A live pull just ran; showing its data."
                      : `Live pull failed (${refresh.reason}); showing last synced data.`}
              </p>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="font-display text-base">Daily calls</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => download(`/api/export/csv?${queryString(shownMonth, shownAssistant)}`, `zaya-usage-${shownMonth}.csv`)}
                  >
                    CSV
                  </Button>
                  <Button
                    onClick={() => download(`/api/export/pdf?${queryString(shownMonth, shownAssistant)}`, `zaya-usage-${shownMonth}.pdf`)}
                  >
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No receptionist calls in this month.</p>
                ) : (
                  <div className="overflow-x-auto pb-2 [scrollbar-width:thin]" role="region" aria-label="Daily calls chart, scroll sideways for more days" tabIndex={0}>
                  <div className="h-72" style={{ minWidth: `${Math.max(600, chartData.length * 44)}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                      <Legend verticalAlign="top" height={24} formatter={(name) => (name === "cost" ? "Recorded cost (USD)" : "Calls")} />
                      <CartesianGrid vertical={false} stroke="oklch(0.88 0.02 90)" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval={0} angle={-40} textAnchor="end" height={48} />
                      <YAxis yAxisId="calls" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                      <YAxis yAxisId="cost" orientation="right" tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value, name) => [name === "cost" ? money(String(value), "USD") : value, name === "cost" ? "Recorded cost" : "Calls"]} />
                      <Bar yAxisId="calls" dataKey="call_count" maxBarSize={32} fill="oklch(0.45 0.07 190)" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="cost" dataKey="cost" stroke="oklch(0.62 0.12 55)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <CallLog key={queryString(shownMonth, shownAssistant)} query={queryString(shownMonth, shownAssistant)} />

          </>
        )}
      </main>
    </div>
  );
}

function queryString(month: string, assistantId: string) {
  const params = new URLSearchParams({ month });
  if (assistantId) params.set("assistant_id", assistantId);
  return params.toString();
}

function Filter({
  label,
  value,
  onChange,
  testid,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  testid: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-0.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        data-testid={testid}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 rounded-md border border-input bg-card px-2 text-sm"
      >
        {children}
      </select>
    </label>
  );
}

function Kpi({ label, value, detail, testid }: { label: string; value: string; detail: string; testid?: string }) {
  return (
    <Card>
      <CardContent className="py-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-display text-base" data-testid={testid}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ConversationBillingCard({ data }: { data: ConversationBilling }) {
  return (
    <Card data-testid="conversation-billing">
      <CardHeader className="gap-1">
        <CardTitle className="font-display text-base">Conversation billing</CardTitle>
        <p className="text-sm text-muted-foreground">{data.note}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Monthly total" value={data.total == null ? "Mixed currency" : money(data.total, data.currency)} testid="conversation-total" />
          <Stat label="Billed minutes" value={data.billed_minutes ?? "—"} testid="billed-minutes" />
          <Stat label="Conversations priced" value={`${data.priced_count} of ${data.conversation_count}`} testid="priced-count" />
          <Stat
            label="Source"
            value={`${data.from_session_analysis} session · ${data.from_detail_records} detail · ${data.missing_count} missing`}
            testid="cost-sources"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Events</TableHead>
              <TableHead className="text-right">Billed</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((row) => (
              <TableRow key={row.service}>
                <TableCell>{serviceLabel(row.service)}</TableCell>
                <TableCell className="text-right">{row.count}</TableCell>
                <TableCell className="text-right">{row.billed_sec == null ? "—" : duration(row.billed_sec)}</TableCell>
                <TableCell className="text-right">{money(row.cost, data.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, testid }: { label: string; value: string; testid: string }) {
  return (
    <div className="rounded-md border border-border px-2 py-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base" data-testid={testid}>
        {value}
      </p>
    </div>
  );
}

type LiveRefresh = { status: string; reason?: string; refreshed_at: string; calls_seen?: number };

function centralTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}
````

## File: zaya-usage-web-main/frontend/src/components/ready.tsx
````typescript
"use client";

import { useEffect } from "react";

export function AppReady() {
  useEffect(() => {
    document.documentElement.dataset.appReady = "1";
  }, []);
  return null;
}
````

## File: zaya-usage-web-main/frontend/src/lib/api.ts
````typescript
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function csrfToken(): string {
  const match = document.cookie.match(/(?:^|; )zaya_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.method && init.method !== "GET" && init.method !== "HEAD") {
    headers.set("X-CSRF-Token", csrfToken());
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  const response = await fetch(`/backend${path}`, { ...init, headers, credentials: "include" });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = await response.json();
      if (typeof payload.detail === "string") detail = payload.detail;
    } catch {

    }
    throw new ApiError(response.status, detail);
  }
  if (response.status === 204) return undefined as T;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("json")) return undefined as T;
  return response.json() as Promise<T>;
}

export async function download(path: string, filename: string) {
  const response = await fetch(`/backend${path}`, { credentials: "include" });
  if (!response.ok) throw new ApiError(response.status, "Export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
````

## File: zaya-usage-web-main/frontend/src/lib/format.test.ts
````typescript
import { describe, expect, it } from "vitest";
import { assistantLabel, callStatus, duration, money, serviceLabel, statementAmount } from "./format";

describe("money", () => {
  it("does not render a missing cost as zero", () => {
    expect(money(null, "USD")).toBe("Pending");
    expect(money(undefined, "USD")).toBe("Pending");
    expect(money("", "USD")).toBe("Pending");
  });

  it("renders a recorded zero as currency", () => {
    expect(money("0.0000", "USD")).toBe("$0.00");
    expect(money("0.2400", "USD")).toContain("0.24");
  });
});

describe("duration", () => {
  it("keeps an unknown duration distinct from zero", () => {
    expect(duration(null)).toBe("Unknown");
    expect(duration(0)).toBe("0s");
    expect(duration(184)).toBe("3m 04s");
  });
});

describe("callStatus", () => {
  it("labels direction and keeps pending distinct from recorded", () => {
    expect(callStatus("recorded", "inbound")).toBe("Inbound · Recorded");
    expect(callStatus("pending", "inbound")).toBe("Inbound · Pending");
    expect(callStatus("pending", null)).toBe("Pending");
  });
});

describe("serviceLabel", () => {
  it("names the billed products in plain language", () => {
    expect(serviceLabel("ai-voice-assistant")).toBe("AI assistant");
    expect(serviceLabel("speech-to-text")).toBe("Speech to text");
    expect(serviceLabel("phone-number")).toBe("Phone number (fixed monthly)");
  });
});

describe("statementAmount", () => {
  it("does not show a missing fee or an allocated zero as pending", () => {
    expect(statementAmount("missing_config", null, "USD")).toBe("Missing config");
    expect(statementAmount("unavailable", null, "USD")).toBe("Unavailable");
    expect(statementAmount("pending", "1.0000", "USD")).toBe("Pending");
    expect(statementAmount("allocated", "0.0000", "USD")).toBe("$0.00");
    expect(statementAmount("recorded", "4.0000", "USD")).toBe("$4.00");
  });
});

describe("assistantLabel", () => {
  it("shows the Telnyx name and the Telnyx id", () => {
    expect(
      assistantLabel({ name: "HFAAC-Agent", telnyx_assistant_id: "assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac" }),
    ).toBe("HFAAC-Agent — assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac");
  });
});

describe("call times and billed duration", () => {
  it("converts stored UTC to the selected zone, defaulting to Central", async () => {
    const { callDate, callTime } = await import("./format");
    const iso = "2026-10-26T03:30:00Z";
    expect(callDate(iso)).toBe("Oct 25, 2026");
    expect(callTime(iso)).toBe("10:30 PM CDT");
    expect(callTime(iso, "UTC")).toBe("3:30 AM UTC");
    expect(callDate(iso, "UTC")).toBe("Oct 26, 2026");
  });

  it("shows billed_sec exactly as Telnyx reports it", async () => {
    const { billedDuration, callerLabel } = await import("./format");
    expect(billedDuration(null)).toBe("—");
    expect(billedDuration(60)).toBe("1m 00s");
    expect(billedDuration(61)).toBe("1m 01s");
    expect(billedDuration(59)).toBe("59s");
    expect(billedDuration(0)).toBe("0s");
    expect(callerLabel(null)).toBe("No caller ID");
    expect(callerLabel("+15125550101")).toBe("+15125550101");
  });
});
````

## File: zaya-usage-web-main/frontend/src/lib/format.ts
````typescript
const SERVICE_LABELS: Record<string, string> = {
  "ai-voice-assistant": "AI assistant",
  inference: "LLM inference",
  "call-control": "Call control",
  "sip-trunking": "SIP trunking",
  "speech-to-text": "Speech to text",
  "text-to-speech": "Text to speech",
  recording: "Recording",
  "noise-suppression": "Noise suppression",
  amd: "Answering-machine detection",
  webrtc: "WebRTC",
  "phone-number": "Phone number (fixed monthly)",
};

export function serviceLabel(service: string): string {
  return SERVICE_LABELS[service] ?? service;
}

export function money(amount: string | null | undefined, currency: string | null | undefined): string {
  if (amount == null || amount === "") return "Pending";
  const value = Number(amount);
  if (Number.isNaN(value)) return "Pending";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function statementAmount(status: string, amount: string | null | undefined, currency: string | null | undefined): string {
  if (status === "missing_config") return "Missing config";
  if (status === "unavailable") return "Unavailable";
  if (status === "pending" || amount == null || amount === "") return "Pending";
  return money(amount, currency);
}

export function duration(seconds: number | null | undefined): string {
  if (seconds == null) return "Unknown";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest}s`;
  return `${minutes}m ${rest.toString().padStart(2, "0")}s`;
}

export function monthLabel(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  const name = new Date(Date.UTC(year, mon - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${name} UTC`;
}

export function callStatus(costStatus: string, direction: string | null | undefined): string {
  const price = costStatus === "recorded" ? "Recorded" : "Pending";
  if (!direction) return price;
  return `${direction.charAt(0).toUpperCase()}${direction.slice(1)} · ${price}`;
}

export const DEFAULT_TIMEZONE = "America/Chicago";


export const TIMEZONES: { value: string; label: string }[] = [
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "UTC", label: "UTC" },
];

export function callDate(iso: string, timeZone: string = DEFAULT_TIMEZONE): string {
  return new Date(iso).toLocaleDateString("en-US", { timeZone, dateStyle: "medium" });
}

export function callTime(iso: string, timeZone: string = DEFAULT_TIMEZONE): string {
  return new Date(iso).toLocaleTimeString("en-US", { timeZone, hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}


export function billedDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  return duration(seconds);
}


export function callerLabel(masked: string | null | undefined): string {
  return masked || "No caller ID";
}

export function when(iso: string | null | undefined): string {
  if (!iso) return "Not synced yet";
  return new Date(iso).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC";
}


export function costSource(source: string | null | undefined): string {
  if (source === "session_analysis") return "Telnyx Session Analysis";
  if (source === "detail_records") return "Telnyx detail records";
  return "No Telnyx cost yet";
}

export function assistantLabel(assistant: { name: string; telnyx_assistant_id: string }) {
  return `${assistant.name} — ${assistant.telnyx_assistant_id}`;
}
````

## File: zaya-usage-web-main/frontend/src/lib/login-fields.test.ts
````typescript
import { describe, expect, it } from "vitest";
import { passwordAfterPaste, stripTrailingNewline, trimEmail } from "./login-fields";

describe("trimEmail", () => {
  it("drops leading and trailing whitespace", () => {
    expect(trimEmail("  person@example.com \n")).toBe("person@example.com");
    expect(trimEmail("person@example.com")).toBe("person@example.com");
  });
});

describe("stripTrailingNewline", () => {
  it("removes one trailing newline from a paste", () => {
    expect(stripTrailingNewline("secret\n")).toBe("secret");
    expect(stripTrailingNewline("secret\r\n")).toBe("secret");
    expect(stripTrailingNewline("secret\r")).toBe("secret");
  });

  it("leaves an internal newline and a password that does not end in one", () => {
    expect(stripTrailingNewline("sec\nret")).toBe("sec\nret");
    expect(stripTrailingNewline("secret\n\n")).toBe("secret\n");
    expect(stripTrailingNewline("secret ")).toBe("secret ");
  });
});

describe("passwordAfterPaste", () => {
  it("replaces the selection and strips the trailing newline", () => {
    expect(passwordAfterPaste("old", "secret\n", 0, 3)).toBe("secret");
    expect(passwordAfterPaste("ab", "x\n", 1, 1)).toBe("axb");
  });
});
````

## File: zaya-usage-web-main/frontend/src/lib/login-fields.ts
````typescript
export function trimEmail(value: string): string {
  return value.trim();
}

export function stripTrailingNewline(value: string): string {
  if (value.endsWith("\r\n")) return value.slice(0, -2);
  if (value.endsWith("\n") || value.endsWith("\r")) return value.slice(0, -1);
  return value;
}

export function passwordAfterPaste(current: string, pasted: string, start: number, end: number): string {
  const cleaned = stripTrailingNewline(pasted);
  return current.slice(0, start) + cleaned + current.slice(end);
}
````

## File: zaya-usage-web-main/frontend/src/lib/types.ts
````typescript
export type Assistant = { id: string; name: string; telnyx_name?: string; telnyx_assistant_id: string };

export type Filters = {
  role: "admin" | "client_user";
  email: string;
  assistants: Assistant[];
  months: string[];
  last_sync_at: string | null;
  last_sync_status: string | null;
};

export type Metrics = {
  month: string;
  timezone: string;
  last_sync_at: string | null;
  incomplete: boolean;
  incomplete_reasons: string[];
  kpis: {
    call_count: number;
    duration_sec: number | null;
    duration_unknown_count: number;
    recorded_cost: string | null;
    currency: string | null;
    average_cost_per_call: string | null;
    complete_call_count: number;
    pending_call_count: number;
    pending_charge_count: number;
  };
  daily: {
    date: string;
    call_count: number;
    pending_call_count: number;
    duration_sec: number | null;
    recorded_cost: string | null;
  }[];
  services: {
    service: string;
    recorded_cost: string | null;
    currency: string | null;
    pending_charge_count: number;
    charge_count: number;
    billed_sec: number | null;
  }[];
  numbers: { mapped_count: number; monthly_cost: null; note: string };
  conversation_billing: ConversationBilling;
  cost_note: string;
};

export type ProductCost = { cost: string | null; count: number | null; billed_sec: number | null; source?: string };


export type Billable = {
  source: "session_analysis" | "detail_records" | null;
  session_total: string | null;
  partial: boolean;
  total: string | null;
  currency: string | null;
  billed_sec: number | null;
  rate: string | null;
  rate_measured_in: string | null;
  products: Record<string, ProductCost>;
};

export type ConversationBilling = {
  total: string | null;
  currency: string | null;
  conversation_count: number;
  priced_count: number;
  from_session_analysis: number;
  from_detail_records: number;
  missing_count: number;
  partial_count: number;
  billed_sec: number | null;
  billed_minutes: string | null;
  products: { service: string; cost: string | null; count: number; billed_sec: number | null }[];
  note: string;
};

export type CallRow = {
  billable: Billable;
  session_status: string | null;
  id: string;
  started_at: string;
  clinic_name: string | null;
  clinic_code: string | null;
  assistant_name: string | null;
  telnyx_assistant_id: string | null;
  telnyx_conversation_id: string;
  masked_caller: string | null;
  direction: string | null;
  duration_sec: number | null;
  recorded_cost: string | null;
  currency: string | null;
  cost_status: string;
  charges: { service: string; amount: string | null; currency: string | null; cost_status: string; billed_sec: number | null }[];
};

export type BillingNumber = {
  label: string;
  amount: string | null;
  status: string;
  proration: string | null;
  effective_on: string | null;
  note?: string | null;
};

export type BillingLine = {
  service: string;
  label: string;
  amount: string | null;
  priced_amount: string | null;
  currency: string;
  status: string;
  pending_count: number;
  attribution: string | null;
  note: string;
  numbers: BillingNumber[];
};

export type BillingStatement = {
  client_id: string;
  client_name: string;
  client_slug: string;
  month: string;
  lines: BillingLine[];
  known_total: string | null;
  grand_total: string | null;
  currency: string;
  flags: string[];
  complete: boolean;
};

export type BillingAccountRow = {
  product: string;
  label: string;
  currency: string;
  telnyx_cost: string | null;
  billed_to_clients: string | null;
  unallocated: string | null;
  status: string;
  note: string;
};

export type Billing = {
  month: string;
  timezone: string;
  statements: BillingStatement[];
  account: { note: string; rows: BillingAccountRow[] } | null;
};

export type Reconciliation = {
  note: string;
  rows: {
    product: string;
    currency: string;
    telnyx_cost: string | null;
    local_priced_cost: string | null;
    pending_charge_count: number;
    delta: string | null;
    status: string;
    note: string;
  }[];
};
````

## File: zaya-usage-web-main/frontend/src/lib/utils.ts
````typescript
export { cn } from "cn"
````

## File: zaya-usage-web-main/frontend/src/proxy.ts
````typescript
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("zaya_session");
  const login = request.nextUrl.pathname.startsWith("/login");
  if (!session && !login) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && login) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!backend|_next|favicon.ico|.*\\..*).*)"],
};
````

## File: zaya-usage-web-main/frontend/.dockerignore
````
node_modules
.next
test-results
playwright-report
blob-report
coverage
````

## File: zaya-usage-web-main/frontend/.gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
````

## File: zaya-usage-web-main/frontend/components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
````

## File: zaya-usage-web-main/frontend/Dockerfile
````dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 8080
CMD ["node", "server.js"]
````

## File: zaya-usage-web-main/frontend/eslint.config.mjs
````javascript
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
````

## File: zaya-usage-web-main/frontend/next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1"],
  agentRules: false,
};

export default nextConfig;
````

## File: zaya-usage-web-main/frontend/package.json
````json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@base-ui/react": "^1.9.0",
    "class-variance-authority": "^0.7.1",
    "cn": "^0.5.0",
    "lucide-react": "^1.61.0",
    "next": "^16.4.2",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "recharts": "^3.10.1",
    "shadcn": "^4.22.1",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@playwright/test": "^1.64.1",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.4.2",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.7"
  }
}
````

## File: zaya-usage-web-main/frontend/playwright.config.ts
````typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:43123" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
````

## File: zaya-usage-web-main/frontend/postcss.config.mjs
````javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
````

## File: zaya-usage-web-main/frontend/README.md
````markdown
# Zaya usage web app

Next.js UI for the usage dashboard. Setup, accounts, and the API live in the repository root README.

```bash
API_URL=http://127.0.0.1:43124 npm run dev -- --hostname 127.0.0.1 --port 43123
```
````

## File: zaya-usage-web-main/frontend/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
````

## File: zaya-usage-web-main/frontend/vitest.config.ts
````typescript
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
````

## File: zaya-usage-web-main/scripts/inspect_telnyx.py
````python
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode

import httpx

BASE = os.environ.get("TELNYX_BASE_URL", "https://api.telnyx.com/v2").rstrip("/")



DETAIL_DATE_FIELDS = {
    "call-control": "started_at",
    "sip-trunking": "started_at",
    "webrtc": "started_at",
    "ai-voice-assistant": "created_at",
    "inference": "created_at",
    "text-to-speech": "created_at",
    "amd": "invoked_at",
}
SENSITIVE_KEYS = {
    "cli",
    "cld",
    "caller_number",
    "dest_number",
    "from",
    "to",
    "phone_number",
    "telnyx_end_user_target",
    "telnyx_agent_target",
    "text",
    "content",
    "transcript",
    "instructions",
    "greeting",
    "recording_url",
    "recording_urls",
    "media_url",
    "audio_url",
    "download_url",
}
COST_KEYS = {
    "cost",
    "currency",
    "rate",
    "billed_sec",
    "call_sec",
    "event_cost",
    "cumulative_cost",
    "total",
    "total_cost",
    "status",
    "cost_status",
}
PHONE = re.compile(r"^\+?\d{8,15}$")


def redact_key(key: str) -> bool:
    lowered = key.lower()
    return lowered in SENSITIVE_KEYS or "transcript" in lowered or "instruction" in lowered or lowered.endswith("_url")


def shape(value: Any, depth: int = 0) -> Any:
    if depth > 6:
        return type(value).__name__
    if isinstance(value, dict):
        out = {}
        for key, item in value.items():
            out[key] = "<redacted>" if redact_key(str(key)) else shape(item, depth + 1)
        return out
    if isinstance(value, list):
        if not value:
            return []
        return [shape(value[0], depth + 1), f"... {len(value)} item(s)"]
    if isinstance(value, str) and PHONE.match(value.strip()):
        return "<redacted phone>"
    return type(value).__name__


def cost_notes(value: Any, path: str = "$") -> list[str]:
    notes: list[str] = []
    if isinstance(value, dict):
        for key, item in value.items():
            child = f"{path}.{key}"
            if key in COST_KEYS:
                preview = item if not isinstance(item, (dict, list)) else type(item).__name__
                notes.append(f"{child} = {preview!r} ({type(item).__name__})")
            notes.extend(cost_notes(item, child))
    elif isinstance(value, list) and value:
        notes.extend(cost_notes(value[0], path + "[0]"))
    return notes


def self_test() -> None:
    sample = {
        "id": "rec-1",
        "cost": "0.000000",
        "currency": "USD",
        "call_sec": 0,
        "cli": "+13125550101",
        "metadata": {"telnyx_end_user_target": "+13125550199", "assistant_id": "asst"},
        "messages": [{"text": "patient asked about a refill"}],
        "recording_url": "https://example.invalid/audio",
        "cost_object": {"event_cost": None, "total": "No cost data available."},
    }
    printed = shape(sample)
    assert printed["cli"] == "<redacted>"
    assert printed["metadata"]["telnyx_end_user_target"] == "<redacted>"
    assert printed["metadata"]["assistant_id"] == "str"
    assert printed["messages"][0]["text"] == "<redacted>"
    assert printed["recording_url"] == "<redacted>"
    assert printed["cost"] == "str"
    assert printed["call_sec"] == "int"
    assert printed["cost_object"]["event_cost"] == "NoneType"
    notes = cost_notes(sample)
    assert any("event_cost" in line and "None" in line for line in notes)
    assert any(PHONE.match("+13125550101") for _ in [0])
    print("inspect_telnyx self-test ok")


def _headers(response: httpx.Response) -> dict[str, str]:
    interesting = {}
    for key, value in response.headers.items():
        lowered = key.lower()
        if lowered.startswith("x-ratelimit") or lowered in {"retry-after", "content-range", "preference-applied", "link"}:
            interesting[key] = value
    return interesting


def _get(client: httpx.Client, path: str, params: list[tuple[str, str]] | None = None) -> tuple[int, Any, dict[str, str], str]:
    response = client.get(path, params=params)
    body: Any
    try:
        body = response.json()
    except json.JSONDecodeError:
        body = {"non_json": True, "length": len(response.content)}
    query = urlencode(params or [])
    label = f"GET {path}" + (f"?{query}" if query else "")
    return response.status_code, body, _headers(response), label


def _report(label: str, status: int, body: Any, headers: dict[str, str]) -> None:
    print(f"\n== {label}")
    print(f"status {status}")
    if headers:
        print("headers", json.dumps(headers, sort_keys=True))
    print("shape", json.dumps(shape(body), sort_keys=True))
    notes = cost_notes(body)
    if notes:
        print("cost-related")
        for line in notes[:40]:
            print(" ", line)


def main() -> None:
    if "--self-test" in sys.argv:
        self_test()
        return
    api_key = os.environ.get("TELNYX_API_KEY", "")
    if not api_key:
        print("TELNYX_API_KEY is not set. Run with --self-test to check redaction only.", file=sys.stderr)
        raise SystemExit(2)
    now = datetime.now(timezone.utc).replace(microsecond=0)
    start = (now - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    end = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    with httpx.Client(
        base_url=BASE,
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=45,
    ) as client:
        for path, params in (
            ("/balance", None),
            ("/ai/assistants", [("page[size]", "2")]),
            (
                "/ai/conversations",
                [
                    ("metadata->telnyx_conversation_channel", "eq.phone_call"),
                    ("page[number]", "1"),
                    ("page[size]", "2"),
                    ("order", "created_at.desc"),
                ],
            ),
            ("/usage_reports/options", None),
            ("/phone_numbers", [("page[size]", "1")]),
            ("/detail_records/options", [("filter[record_type]", "call-control")]),
        ):
            status, body, headers, label = _get(client, path, params)
            _report(label, status, body, headers)

        for record_type, time_field in DETAIL_DATE_FIELDS.items():
            status, body, headers, label = _get(
                client,
                "/detail_records",
                [
                    ("filter[record_type]", record_type),
                    (f"filter[{time_field}][gte]", start),
                    (f"filter[{time_field}][lt]", end),
                    ("page[number]", "1"),
                    ("page[size]", "1"),
                ],
            )
            _report(label, status, body, headers)

        options_status, options, _, _ = _get(client, "/usage_reports/options")
        products = []
        if options_status == 200:
            for row in options.get("data") or []:
                metrics = row.get("product_metrics") or []
                if "cost" in metrics:
                    products.append(row.get("product"))
        for product in products[:8]:
            if not product:
                continue
            status, body, headers, label = _get(
                client,
                "/usage_reports",
                [
                    ("product", product),
                    ("start_date", start),
                    ("end_date", end),
                    ("metrics[]", "cost"),
                    ("dimensions[]", "currency"),
                    ("page[size]", "5"),
                ],
            )
            _report(label, status, body, headers)



        conv_status, conversations, _, _ = _get(
            client,
            "/ai/conversations",
            [("metadata->telnyx_conversation_channel", "eq.phone_call"), ("page[number]", "1"), ("page[size]", "1")],
        )
        session_id = None
        if conv_status == 200:
            data = conversations.get("data") or []
            if data:
                session_id = (data[0].get("metadata") or {}).get("call_session_id")
        if session_id:
            status, body, headers, label = _get(
                client,
                f"/session_analysis/call-session/{session_id}",
                [("include_children", "true"), ("max_depth", "3"), ("expand", "record")],
            )
            _report(label, status, body, headers)
        else:
            print("\n== session analysis skipped (no call_session_id on the sampled conversation)")
    print("\nDone. Compare cost nullability and record ids with docs/telnyx-integration.md before switching TELNYX_MODE=live.")


if __name__ == "__main__":
    main()
````

## File: zaya-usage-web-main/.env.example
````
# Copy to .env at the repo root for docker compose, or export these for a local process.
# The Telnyx key is optional in fixture mode and must never be sent to the browser.

DATABASE_URL=postgresql+psycopg://zaya:zaya@127.0.0.1:5432/zaya_usage
SESSION_SECRET=replace-with-a-long-random-string
SYNC_JOB_TOKEN=replace-with-a-long-random-string
COOKIE_SECURE=false
FRONTEND_ORIGIN=http://127.0.0.1:43123
# Comma-separated extra origins. Production sets both Cloud Run web URLs here.
# FRONTEND_ORIGINS=https://zaya-usage-web-699087212463.us-central1.run.app,https://zaya-usage-web-zjj2qolkja-uc.a.run.app

# Shared with the live voice gateway. Backfill stays at about one read per second.
TELNYX_MIN_INTERVAL_SECONDS=1
TELNYX_MAX_CONCURRENT=1

# fixture uses the committed clinic sample. live calls api.telnyx.com.
TELNYX_MODE=fixture
TELNYX_API_KEY=
TELNYX_BASE_URL=https://api.telnyx.com/v2

# Local fixture demo only. Production must stay false: startup then inserts nothing.
# Map the real clinics with: python -m app.jobs.seed_production
# Create logins with prompted passwords, or ZAYA_USERS_JSON. See docs/deploy.md.
SEED_DEMO=true
ADMIN_EMAIL=admin@zayahealth.example
ADMIN_PASSWORD=local-admin-change-me
DEMO_PASSWORD=local-clinic-change-me

# Next.js server-side proxy target. Bracket-read at runtime, not inlined as NEXT_PUBLIC.
API_URL=http://127.0.0.1:43124
````

## File: zaya-usage-web-main/.gitignore
````
.venv/
__pycache__/
.pytest_cache/
*.pyc
.env
node_modules/
.next/
frontend/test-results/
frontend/playwright-report/
frontend/blob-report/
agent-tools/
dist/
*.log
.DS_Store
coverage/
````

## File: zaya-usage-web-main/docker-compose.yml
````yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: zaya
      POSTGRES_PASSWORD: zaya
      POSTGRES_DB: zaya_usage
    ports:
      - "43132:5432"
    volumes:
      - zaya_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zaya -d zaya_usage"]
      interval: 5s
      timeout: 5s
      retries: 20

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+psycopg://zaya:zaya@db:5432/zaya_usage
      SESSION_SECRET: dev-only-session-secret
      SYNC_JOB_TOKEN: dev-only-sync-token
      COOKIE_SECURE: "false"
      FRONTEND_ORIGIN: http://127.0.0.1:43123
      TELNYX_MIN_INTERVAL_SECONDS: "1"
      TELNYX_MAX_CONCURRENT: "1"
      TELNYX_MODE: fixture
      TELNYX_API_KEY: ""
      SEED_DEMO: "true"
      ADMIN_EMAIL: admin@zayahealth.example
      ADMIN_PASSWORD: local-admin-change-me
      DEMO_PASSWORD: local-clinic-change-me
    ports:
      - "43124:8080"
    depends_on:
      db:
        condition: service_healthy

  web:
    build: ./frontend
    environment:
      API_URL: http://api:8080
      PORT: "8080"
    ports:
      - "43123:8080"
    depends_on:
      - api

volumes:
  zaya_pg:
````

## File: zaya-usage-web-main/README.md
````markdown
# Zaya usage

Monthly usage and cost for Zaya Health's Telnyx AI receptionist assistants (HFAAC, MMC, AGP, Schaumburg, and any clinic an admin maps later). The browser talks only to the Next.js app. The FastAPI service holds the Telnyx key, the session secret, and the database.

Calls come from Telnyx AI conversations. Charges come from detail records and Session Analysis event costs, stored separately and deduped on Telnyx ids. A missing cost stays null and shows as pending. Usage reports reconcile account totals; they are not added on top of the call charges. Recording and noise suppression are per-call detail records counted once in each conversation's cost. Speech-to-text and text-to-speech are monthly statement lines from those reports (exact per clinic when the options endpoint can group them, otherwise allocated by that day's call minutes). Phone-number fees are an admin-set monthly amount with an effective date. A number with no fee is missing config, not zero. The billing statement is the client invoice, and the admin tie-out shows any remainder Telnyx billed that no client statement absorbed. Field-level notes, including what is still unknown, are in [docs/telnyx-integration.md](docs/telnyx-integration.md).

## Local demo (fixtures, no Telnyx key)

Postgres 16, Python 3.12, and Node 22.

```bash
sudo -u postgres psql -c "CREATE USER zaya WITH PASSWORD 'zaya' SUPERUSER" || true
sudo -u postgres psql -c "CREATE DATABASE zaya_usage OWNER zaya" || true
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
cd backend
../.venv/bin/alembic upgrade head
DATABASE_URL=postgresql+psycopg://zaya:zaya@127.0.0.1:5432/zaya_usage \
  TELNYX_MODE=fixture SEED_DEMO=true \
  ../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 43124
```

In another shell:

```bash
cd frontend && npm ci
API_URL=http://127.0.0.1:43124 npm run dev -- --hostname 127.0.0.1 --port 43123
```

Open http://127.0.0.1:43123.

Client logins are per assistant. The API keeps that assignment on metrics, the call log, and CSV/PDF exports. The dashboard filters by Telnyx assistant only (name and id, pulled from `GET /v2/ai/assistants` on each sync). An assistant outside the assignment does not widen it. Test-copy assistants are seeded and hidden from client logins.

| Email | Password | Sees |
| --- | --- | --- |
| admin@zayahealth.example | `ADMIN_PASSWORD` (default `local-admin-change-me`) | Every assistant, including test copies, plus reconciliation and the account tie-out |
| hfaac@zayahealth.example | `DEMO_PASSWORD` (default `local-clinic-change-me`) | HFAAC Reception only |
| mmc@zayahealth.example | same | MMC Reception only |
| agp@zayahealth.example | same | AGP Reception only |
| schaumburg@zayahealth.example | same | Schaumburg Reception only |

Startup with `SEED_DEMO=true` loads the fixture clinics, including test copies and demo logins, and syncs September and October 2026 the first time the database has no successful sync. It does not insert phone-number fees, so those statements show missing config. October includes pending charges and a SIP discrepancy. Recording usage includes $0.50 on an unmapped billing group so the account tie-out shows that remainder.

`SEED_DEMO=false` inserts nothing. Production mapping is a separate command, with no demo users:

```bash
cd backend
DATABASE_URL=postgresql+psycopg://zaya:zaya@127.0.0.1:5432/zaya_usage \
  ../.venv/bin/python -m app.jobs.seed_production
../.venv/bin/python -m app.jobs.users
```

`seed_production` maps HFAAC, AGP, MMC, and Schaumburg to their live assistants and billing groups, and sets each owned number to $1.00 per month, full month, from 2026-01-01, labeled `Telnyx list price (unconfirmed)`. Saving the same effective date in the admin form replaces that fee. `users` reads `ZAYA_USERS_JSON` or prompts. It has no built-in email or password.

Docker Compose publishes Postgres on host port **43132** (container 5432), the API on **43124**, and the web app on **43123**:

```bash
docker compose up --build
```

Copy [.env.example](.env.example) if you want to override passwords. Compose currently sets the demo defaults itself.

## Tests

```bash
# backend (needs zaya_usage_test on localhost:5432)
sudo -u postgres psql -c "CREATE DATABASE zaya_usage_test OWNER zaya" || true
cd backend && ../.venv/bin/pytest

cd frontend && npm test && npx tsc --noEmit

# API on 43124 and web on 43123 must already be running
cd frontend && npx playwright test

python scripts/inspect_telnyx.py --self-test
```

## Sync

`POST /internal/jobs/sync` with `Authorization: Bearer $SYNC_JOB_TOKEN` re-reads the previous and current UTC months. An optional JSON body `{"month":"2026-09"}` backfills one month. Upserts are idempotent. Retries honor `Retry-After`, then exponential backoff. Admins can also sync a month from the mapping page.

`python -m app.jobs.sync` is the Cloud Run Job entrypoint (`backend/run-sync.sh` migrates, then runs it).

## Privacy

The Telnyx API key is read from the environment on the API process only. Caller numbers are masked to the last four digits before insert. Transcripts, recordings, assistant instructions, and raw `from` / `to` are not requested and not stored. CSV and PDF exports use the same masked rows.

## Live Telnyx

The live account's field names are already reflected in the sync (see [docs/telnyx-integration.md](docs/telnyx-integration.md) section 9). Keep `TELNYX_MODE=fixture` until you are ready to point this deployment at that account:

```bash
TELNYX_API_KEY=KEY python scripts/inspect_telnyx.py
```

The script only sends GET. It prints types and cost-related values, and redacts phone numbers, transcripts, instructions, and recording URLs. Switch to `TELNYX_MODE=live` only after the id, cost, and paging fields match [docs/telnyx-integration.md](docs/telnyx-integration.md).

## Deploy to Cloud Run

From a laptop, follow [docs/deploy.md](docs/deploy.md) (Cloud Build and `gcloud`, no GitHub Actions). The GitHub path below is manual `workflow_dispatch` only (`.github/workflows/deploy-cloud-run.yml`) and uses Workload Identity Federation. It does not accept a JSON key.

Project `zaya-prod-app`, region `us-central1`, images in `us-central1-docker.pkg.dev/zaya-prod-app/zaya-agents`.

Create before the first run:

1. Artifact Registry repository `zaya-agents` in `us-central1`.
2. Cloud SQL for PostgreSQL, and a Secret Manager secret `zaya-database-url` whose value is a `postgresql+psycopg://...` URL using the socket host `/cloudsql/PROJECT:REGION:INSTANCE`.
3. Secrets `zaya-session-secret`, `zaya-sync-job-token`, and `zaya-telnyx-api-key`.
4. A runtime service account with `roles/cloudsql.client` and `roles/secretmanager.secretAccessor` on those secrets.
5. A deployer service account that can push to Artifact Registry, deploy Cloud Run, and act as the runtime service account.
6. GitHub Actions Workload Identity Federation. Repository variables:
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`
   - `GCP_SERVICE_ACCOUNT` (deployer)
   - `GCP_RUNTIME_SERVICE_ACCOUNT`
   - `CLOUD_SQL_CONNECTION_NAME` (`zaya-prod-app:us-central1:INSTANCE`)
7. Cloud Scheduler API enabled. The workflow creates `zaya-usage-sync-daily` at 06:15 UTC, calling the Cloud Run Job `zaya-usage-sync` with the runtime service account. That account needs `roles/run.invoker` on the job only.

Leave the workflow input `telnyx_mode` on `fixture` until the inspect script has been reviewed, then run it again with `live`. Production sets `SEED_DEMO=false` and `COOKIE_SECURE=true`. The API allows both Cloud Run web origins via `FRONTEND_ORIGINS` (and `FRONTEND_ORIGIN`). Backfill stays near one Telnyx read per second so it does not starve the voice gateway.

Services: `zaya-usage-api`, `zaya-usage-web`. Job: `zaya-usage-sync`.
````
