import { useEffect, useState } from "react";

/**
 * Registrant contact details required by the api.domains.kred registrar in
 * order to actually claim the free .Kred domain at registration time.
 * Shown as a collapsible block once a domain name has been typed.
 */
export interface RegistrantContact {
  phone: string;
  address1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  profile_link: string;
}

export const EMPTY_CONTACT: RegistrantContact = {
  phone: "",
  address1: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  profile_link: "",
};

interface Props {
  open: boolean;
  onChange: (contact: RegistrantContact) => void;
}

export function RegistrantContactFields({ open, onChange }: Props) {
  const [contact, setContact] = useState<RegistrantContact>(EMPTY_CONTACT);

  useEffect(() => {
    onChange(contact);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  const set = (key: keyof RegistrantContact) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setContact((c) => ({ ...c, [key]: e.target.value }));

  return (
    <details className="field full" open={open} style={{ marginTop: 4 }}>
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>
        Domain registration details {open ? "" : "(required to claim your Kred domain)"}
      </summary>
      <p className="form-note" style={{ marginTop: 8 }}>
        The registrar requires a registrant contact for every domain. These details go to the
        registry only — they are never shown on your Kredentials page.
      </p>

      <div className="field">
        <label htmlFor="fPhone">Phone</label>
        <input
          id="fPhone"
          name="phone"
          type="tel"
          required={open}
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          value={contact.phone}
          onChange={set("phone")}
        />
      </div>
      <div className="field">
        <label htmlFor="fAddress">Street address</label>
        <input
          id="fAddress"
          name="address1"
          required={open}
          autoComplete="address-line1"
          value={contact.address1}
          onChange={set("address1")}
        />
      </div>
      <div className="field">
        <label htmlFor="fCity">City</label>
        <input
          id="fCity"
          name="city"
          required={open}
          autoComplete="address-level2"
          value={contact.city}
          onChange={set("city")}
        />
      </div>
      <div className="field">
        <label htmlFor="fState">State or region</label>
        <input
          id="fState"
          name="state"
          autoComplete="address-level1"
          value={contact.state}
          onChange={set("state")}
        />
      </div>
      <div className="field">
        <label htmlFor="fPostcode">Postal code</label>
        <input
          id="fPostcode"
          name="postal_code"
          required={open}
          autoComplete="postal-code"
          value={contact.postal_code}
          onChange={set("postal_code")}
        />
      </div>
      <div className="field">
        <label htmlFor="fCountry">Country</label>
        <input
          id="fCountry"
          name="country"
          required={open}
          autoComplete="country-name"
          placeholder="US"
          value={contact.country}
          onChange={set("country")}
        />
      </div>
      <div className="field full">
        <label htmlFor="fLink">Link we can build your Kredentials page from (optional)</label>
        <input
          id="fLink"
          name="profile_link"
          type="url"
          placeholder="https://x.com/yourhandle"
          value={contact.profile_link}
          onChange={set("profile_link")}
        />
      </div>
    </details>
  );
}
