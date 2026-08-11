import { useEffect, useState } from "react";
import { COUNTRIES } from "./countries";

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
  profile_links: string[];
}

export const EMPTY_CONTACT: RegistrantContact = {
  phone: "",
  address1: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  profile_link: "",
  profile_links: [],
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

  const setLinks = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    setContact((c) => ({
      ...c,
      profile_link: raw,
      profile_links: raw
        .split(/[\n,]+/)
        .map((l) => l.trim())
        .filter(Boolean),
    }));
  };

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
        <select
          id="fCountry"
          name="country"
          required={open}
          autoComplete="country"
          value={contact.country}
          onChange={(e) => setContact((c) => ({ ...c, country: e.target.value }))}
        >
          <option value="">Select a country…</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field full">
        <label htmlFor="fLink">Links we can build your Kredentials page from (optional)</label>
        <textarea
          id="fLink"
          name="profile_links"
          rows={4}
          placeholder={"https://x.com/yourhandle\nhttps://linkedin.com/in/you\nhttps://yoursite.com"}
          value={contact.profile_link}
          onChange={setLinks}
        />
        <p className="form-note" style={{ marginTop: 6 }}>
          One link per line — all of them are sent to the Kredentials page builder.
        </p>
      </div>
    </details>
  );
}
