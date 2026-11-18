# Palazzo Motos — Security Specification (Phase 0)

## 1. Data Invariants

1. **Public Read Isolation**: Unauthenticated visitors may only `get` or `list` published, non-hidden motorcycles (`published == true && status != 'hidden'`), active categories (`active == true`), active banners (`active == true`), and public `site_settings/main`.
2. **Admin-Only Mutations**: Only verified administrators (`request.auth != null && request.auth.token.email_verified == true` AND either bootstrapped owner email `contato@macieldsgn.com` or an existing document in `/admins/{request.auth.uid}`) may create, update, or delete any inventory, category, banner, or site configuration document.
3. **Document ID Hardening**: All single-document target operations validate `isValidId(id)` (`^[a-zA-Z0-9_\\-]+$`, max 128 chars).
4. **Strict Schema & Bounds**: Every string field enforces `.size()` limits; arrays (`features`, `images`, `sectionsOrder`) enforce strict max element counts; timestamps (`createdAt`, `updatedAt`) match `request.time`; `createdAt` is immutable on update.
5. **Default Deny Catch-All**: All unmatched paths default to `allow read, write: if false;`.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)

1. **Unauthenticated Motorcycle Create**: Anonymous POST to `/motorcycles/moto-1` -> DENIED (`!isAdmin()`).
2. **Non-Admin Authenticated Create**: Signed-in user `hacker@example.com` tries to create `/motorcycles/moto-1` -> DENIED (`!isAdmin()`).
3. **Unverified Admin Email Spoof**: Signed-in with `email == 'contato@macieldsgn.com'` and `email_verified == false` -> DENIED (`email_verified == true` required).
4. **Unpublished Motorcycle Scrape (List)**: Unauthenticated `list` on `/motorcycles` without `where('published', '==', true)` -> DENIED by `allow list: if isAdmin() || (resource.data.published == true && resource.data.status != 'hidden')`.
5. **Hidden Motorcycle Direct Get**: Unauthenticated `get` on `/motorcycles/hidden-1` where `status == 'hidden'` -> DENIED.
6. **Shadow Field Injection on Motorcycle**: Admin or user attempts to write an undeclared key `ghostField: true` -> DENIED (`keys().hasOnly(...)`).
7. **Oversized Description Poisoning**: String `description` > 4000 chars -> DENIED (`size() <= 4000`).
8. **Unbounded Images Array**: `images` array with 50 items (> 15 max) -> DENIED (`images.size() <= 15`).
9. **ID Poisoning**: Document ID containing special chars or > 128 chars -> DENIED (`isValidId()`).
10. **Immutable `createdAt` Tampering**: Updating motorcycle with modified `createdAt` -> DENIED (`incoming().createdAt == existing().createdAt`).
11. **Self-Privilege Escalation**: Non-admin user writes `/admins/{uid}` -> DENIED (`isAdmin()` required).
12. **Client-Forged Timestamp**: Writing `updatedAt` in the past instead of `request.time` -> DENIED (`incoming().updatedAt == request.time`).
