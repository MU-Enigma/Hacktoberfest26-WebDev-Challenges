# Database boundary

The maintainer scaffold configures Prisma with local SQLite. SIG-201 owns the first complaint models and migration; SIG-101-related storage should follow the same server-only boundary.

Do not expose Prisma records directly from public routes. Project them into explicit public or private response types so reporter identity and provider metadata cannot leak accidentally.
