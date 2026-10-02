# Backend pendencies — Checkout · Entrega

Spec: `Docs/specs/checkout/delivery.md`. Mockup:
`Docs/design/mockups/Entrega.dc.html`.

## 1. Shipping options and cost

- **Mockup expects** ("futuro"): Econômica / Expressa with ETA and price
  for the address's CEP; free above R$ 299.
- **Backend today**: no shipping module; `CheckoutRequest` has no shipping
  option and the order total is goods only (same as cart pendency #3).
- **Workaround**: "Frete e prazo" muted with EM BREVE; summary shows Frete
  EM BREVE.
- **Severity**: Feature gap.

## 2. Address label is required

- **Mockup expects**: "Nome do endereço" optional (defaults to
  "Endereço N").
- **Backend today**: `CustomerAddressConfiguration` — `Label` required (max
  100); the use case rejects blank.
- **Workaround**: the frontend fills "Endereço N" when left blank.
- **Severity**: Cosmetic.

## 3. Neighborhood and country are required

- **Mockup expects**: no country field; "Bairro" not highlighted as
  required.
- **Backend today**: `Address.Create` requires `neighborhood` and `country`
  (non-blank).
- **Workaround**: "Bairro" is required in the form; country is sent as
  `BR`.
- **Severity**: Cosmetic.

## 4. The first address doesn't become the default

- **Mockup expects**: "Cadastre o primeiro abaixo; ele vira o seu padrão."
- **Backend today**: `Customer.AddAddress` doesn't mark defaults;
  `SetDefaultShippingAddress`/`SetDefaultBillingAddress` are separate calls.
- **Workaround**: after creating the first address (or with "Usar como
  padrão de entrega"), the frontend calls `default-shipping` (and
  `default-billing` for the first one).
- **Severity**: Cosmetic.

## 5. No CEP / UF validation

- **Mockup expects**: "O CEP tem 8 números."
- **Backend today**: `PostalCode` and `State` are free strings (max 20 /
  100); anything non-blank is accepted.
- **To close**: validate Brazilian CEP (8 digits) and UF in
  `Address.Create` when country is BR.
- **Workaround**: validated in the form (8 digits; UF from the 27 states).
- **Severity**: Feature gap.
