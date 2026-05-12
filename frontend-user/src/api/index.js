// Public endpoint — no auth needed
// org_id and feature_key are passed as query params in the URL
export async function checkFlag(orgId, featureKey) {
  const res = await fetch(
    `/api/flags/check?org_id=${orgId}&feature_key=${featureKey}`,
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data; // { feature_key, is_enabled }
}
