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
