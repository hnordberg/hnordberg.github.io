// Build-time feature flags. Set NEXT_PUBLIC_FEATURE_<NAME>=true (e.g. in .env.local)
// to enable a feature; anything else, including unset, leaves it disabled.

export const BELLS_INEQUALITY_ENABLED = process.env.NEXT_PUBLIC_FEATURE_BELLS_INEQUALITY === 'true'
