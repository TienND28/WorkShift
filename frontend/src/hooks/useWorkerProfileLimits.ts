import { useEffect, useState } from "react";
import {
  DEFAULT_WORKER_PROFILE_LIMITS,
  type WorkerMembershipTier,
  type WorkerProfileLimits,
} from "@/config/workerProfileLimits";
import { workerApi } from "@/lib/api/worker.api";

type LimitsState = {
  tier: WorkerMembershipTier;
  limits: WorkerProfileLimits;
  loading: boolean;
};

export function useWorkerProfileLimits(): LimitsState {
  const [state, setState] = useState<LimitsState>({
    tier: "FREE",
    limits: DEFAULT_WORKER_PROFILE_LIMITS,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    workerApi
      .getProfileLimits()
      .then((data) => {
        if (!cancelled) {
          setState({
            tier: data.tier,
            limits: data.limits,
            loading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
