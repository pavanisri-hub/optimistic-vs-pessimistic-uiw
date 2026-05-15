// Shared, mutable network simulation config used by MSW handlers + UI controls.
export type NetworkConditions = {
  latency: number;
  failureRate: number;
};

export const networkConditions: NetworkConditions = {
  latency: 300,
  failureRate: 0,
};

type Listener = (c: NetworkConditions) => void;
const listeners = new Set<Listener>();

export function setNetworkConditions(patch: Partial<NetworkConditions>) {
  if (typeof patch.latency === "number") networkConditions.latency = patch.latency;
  if (typeof patch.failureRate === "number")
    networkConditions.failureRate = patch.failureRate;
  listeners.forEach((l) => l({ ...networkConditions }));
}

export function subscribeNetwork(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const LATENCY_OPTIONS = [100, 300, 500, 1000] as const;
export const FAILURE_OPTIONS = [0, 0.5, 1] as const;
