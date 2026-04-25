import React, { useState } from 'react';

const COMPANY_DOMAIN_MAP = {
  'google': 'google.com',
  'amazon': 'amazon.com',
  'meta': 'meta.com',
  'facebook': 'meta.com',
  'microsoft': 'microsoft.com',
  'apple': 'apple.com',
  'netflix': 'netflix.com',
  'uber': 'uber.com',
  'lyft': 'lyft.com',
  'airbnb': 'airbnb.com',
  'doordash': 'doordash.com',
  'salesforce': 'salesforce.com',
  'adobe': 'adobe.com',
  'oracle': 'oracle.com',
  'sap': 'sap.com',
  'nvidia': 'nvidia.com',
  'intel': 'intel.com',
  'amd': 'amd.com',
  'cisco': 'cisco.com',
  'ibm': 'ibm.com',
  'atlassian': 'atlassian.com',
  'stripe': 'stripe.com',
  'coinbase': 'coinbase.com',
  'snowflake': 'snowflake.com',
  'databricks': 'databricks.com',
  'tiktok': 'tiktok.com',
  'bytedance': 'bytedance.com',
  'walmart': 'walmart.com',
  'goldman sachs': 'goldmansachs.com',
  'morgan stanley': 'morganstanley.com',
  'jpmorgan': 'jpmorganchase.com',
  'bloomberg': 'bloomberg.com',
  'github': 'github.com',
  'linkedin': 'linkedin.com',
  'twitter': 'x.com',
  'x': 'x.com',
  'tesla': 'tesla.com',
  'spacex': 'spacex.com',
  'atlassian': 'atlassian.com',
  'salesforce': 'salesforce.com',
  'slack': 'slack.com',
  'discord': 'discord.com',
  'spotify': 'spotify.com',
  'walmart': 'walmart.com',
  'target': 'target.com',
  'visa': 'visa.com',
  'mastercard': 'mastercard.com',
  'american express': 'americanexpress.com',
  'square': 'squareup.com',
  'block': 'squareup.com',
  'affirm': 'affirm.com',
  'klarna': 'klarna.com',
  'robinhood': 'robinhood.com',
  'revolut': 'revolut.com',
  'n26': 'n26.com',
  'grab': 'grab.com',
  'gojek': 'gojek.com',
  'shopee': 'shopee.com',
  'zalando': 'zalando.com',
  'booking.com': 'booking.com',
  'expedia': 'expedia.com',
};

export default function CompanyLogo({ name, size = 32 }) {
  const [error, setError] = useState(false);
  
  const normalizedName = name.toLowerCase().trim();
  const domain = COMPANY_DOMAIN_MAP[normalizedName] || `${normalizedName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')}.com`;
  
  // High quality logo source from Google's high-res favicon service
  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  
  // Fallback placeholder (DiceBear initials)
  const fallbackUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=00d4ff,94bbe9&textColor=ffffff&fontWeight=700`;

  const handleImageError = () => {
    setError(true);
  };

  return (
    <div 
      className="company-logo-container" 
      style={{ width: size, height: size }}
    >
      {!error ? (
        <img 
          src={logoUrl} 
          alt={`${name} logo`}
          className="company-logo-img"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <img 
          src={fallbackUrl} 
          alt={`${name} initials`}
          className="company-logo-fallback"
          loading="lazy"
        />
      )}
    </div>
  );
}
