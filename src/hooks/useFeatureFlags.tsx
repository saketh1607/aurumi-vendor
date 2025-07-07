import { useState, useEffect, useContext } from 'react';
import UserDetailsContext from './UserDetailsContext';

interface FeatureFlag {
  FeatureFlag: string;
  Granted: boolean;
}

interface UseFeatureFlagsReturn {
  featureFlags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  hasFeature: (featureName: string) => boolean;
}

const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userDetails = useContext(UserDetailsContext);

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      if (!userDetails?.userDetails?.TeamContactID) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('https://api.shoptalk.in:8443/RBAC/GetAppFeaturePermissionByTeam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            AppID: "5",
            TeamContactID: userDetails.userDetails.TeamContactID.toString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FeatureFlag[] = await response.json();
        setFeatureFlags(Array.isArray(data) ? data : []);
        console.log('Fetched feature flags:', data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feature flags';
        setError(errorMessage);
        console.error('Error fetching feature flags:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userDetails?.userDetails?.TeamContactID) {
      fetchFeatureFlags();
    }
  }, [userDetails?.userDetails?.TeamContactID]);

  const hasFeature = (featureName: string): boolean => {
    const feature = featureFlags.find(flag => flag.FeatureFlag === featureName);
    return feature ? feature.Granted : false;
  };

  return {
    featureFlags,
    isLoading,
    error,
    hasFeature,
  };
};

export default useFeatureFlags;
