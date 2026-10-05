# Backend pendencies — Admin · Clientes

Spec: `Docs/specs/admin/admin-customers.md`. Mockup:
`Docs/design/mockups/AdminClientes.dc.html`.

## 1. E-mail confirmation not on the customer

- **Mockup expects**: E-MAIL "Confirmado / Pendente" per customer.
- **Backend today**: `CustomerResponse` = id, name, email, phone, active,
  createdAt; `EmailConfirmedAt` lives on Identity's `UserAccount`, with no
  admin read endpoint.
- **To close**: `emailConfirmed` on the admin customer responses (Customers
  asking Identity, like `ICustomerRegistry` the other way round).
- **Workaround**: shown as EM BREVE.
- **Severity**: Feature gap.

## 2. No order count or total spent on the customer list

- **Mockup expects**: PEDIDOS and TOTAL GASTO on every row.
- **Backend today**: none on `CustomerResponse`.
- **To close**: both on an admin customer list (computed in Orders).
- **Workaround**: `GET /api/orders/customers/{id}?pageSize=100` per listed
  customer (20 per page) — count from `totalItems`, total from the paid
  orders on that page (exact up to 100 orders per customer).
- **Severity**: Cosmetic (performance).

## 3. Search by name or e-mail only

- **Mockup expects**: "Nome ou e-mail" — matches.
- **Backend today**: `EfCustomerRepository.ListAsync` (ILIKE name/email).
- **Severity**: none — noted for completeness.
