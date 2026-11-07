# Financial records

Dues and payment records are stored in MongoDB. Monthly dues are posted by an
administrator with `POST /api/dues` using `{ "month": "YYYY-MM", "amount": "2500.00" }`.
Each month can be posted once and creates a charge for every resident account at
that time. Posted charges and payment records are not deletable through the API.

Residents submit payment references and JPEG, PNG, or WebP receipt images to
`POST /api/payments`. Receipt images are limited to 3 MB and stored with their
payment record. Administrators can approve or reject pending payments through
`PATCH /api/payments/:id/verification`; rejection requires a reason. Approval
and dues-balance updates run in a MongoDB transaction.
Approved amounts above the current balance are retained as account credit and
applied automatically to later charges.

The database must support transactions (a replica set or `mongos`) for posting
monthly dues and verifying payments. Unsupported deployments receive an error
without applying those financial changes. Only administrators can read financial records, post dues, verify payments,
and export web reports.

# Resident accounts

Administrators can manage resident accounts through `/api/residents`. The
endpoints require an administrator bearer token: `GET /` lists residents,
`POST /` creates one, `GET /:id` returns account details and recent activity,
`PATCH /:id` updates contact and unit details, `PATCH /:id/status` activates or
deactivates an account, and `POST /:id/reset-access` issues a new access code.
Codes expire after 24 hours, are stored only as hashes, and are returned only
once to the administrator. Residents use `POST /api/auth/reset-password` in the
mobile app to set or reset their password; codes allow one successful use and
are limited to five attempts. Administrator actions are recorded in the
append-only audit log.

# Admin/staff password recovery

There is no public password-reset route for admin or staff accounts. To reset
one locally, make sure `server/.env` contains the MongoDB URI for the intended
database, then run `npm run reset-staff-password` from the `server` directory
in an interactive terminal. The utility prompts for an email, displays the
matching active admin/staff account for confirmation, and prompts for the new
password without echoing it. It changes only that account's password hash and
does not activate accounts or print the database URI, password, or hash. Do
not run it against a database unless you intend to change that account's
password.

# Facility reservations

Resident reservation requests use `POST /api/reservations`, residents can list
their own requests at `GET /api/reservations/mine`, and the active facility
catalog is available at `GET /api/reservations/facilities`. Facilities are
inserted into MongoDB on server startup only when a catalog entry does not
already exist. The supported booking periods are Morning, Afternoon, and
Evening.

Administrators can list all bookings with `GET /api/reservations`, load a
booking and its status history with `GET /api/reservations/:id`, and update its
status or administrator notes with `PATCH /api/reservations/:id`. Approving a
booking is protected by a MongoDB partial unique index on facility, date, and
time period, so concurrent approvals cannot double-book that slot. Cancelled
and rejected records remain in the database and status history.

Administrators can configure each active facility's opening and closing times
with `PUT /api/reservations/facilities/:id/settings`, upload or remove a
facility photo with `PUT` or `DELETE /api/reservations/facilities/:id/photo`,
and residents/admins can read the photo with `GET
/api/reservations/facilities/:id/photo`. Photos are limited to JPEG, PNG, or
WebP, at most 1 MB, and are validated server-side. The resident availability
endpoint returns hourly `availableSlots` for the requested `schedulePeriod`
based on those hours and approved reservations. Existing period-only reservation
records remain readable and reserve their whole period for compatibility.

Published announcements are the only announcements visible to residents.
Residents can toggle likes with `POST /api/announcements/:id/like`, read
published comments with `GET /api/announcements/:id/comments`, and post comments
with `POST /api/announcements/:id/comments`. Administrators can moderate comment
visibility with `PATCH /api/announcements/:id/comments/:commentId`. Announcement
photos can be fetched individually through
`GET /api/announcements/:id/images/:index`; draft, scheduled, and archived
announcements remain inaccessible to residents.

Residents can upload or change their own validated profile photo with
`PUT /api/profile/photo`. Profile photo uploads are scoped to the authenticated
resident and limited to 1 MB.
